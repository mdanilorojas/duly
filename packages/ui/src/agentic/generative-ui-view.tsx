import * as React from "react";
import { cn } from "@/lib/utils";
import { CopyProvider, type Locale } from "../lib/copy/index.js";
import { TraceLog } from "../trace-log/trace-log.js";
import type { Tone } from "../trace-log/trace-log.variants.js";
import { AgentMetric, AgentMetricRow, type AgentMetricTone } from "./agent-metric.js";
import { GuardrailIndicator, type GuardrailCategory, type GuardrailPolicy, type GuardrailStatus } from "./guardrail-indicator.js";
import { HumanInterruptQueue, type InterruptQueueItem } from "./human-interrupt-queue.js";
import type { NodeStatus } from "./node-status-badge.js";
import { RunTimeline, type RunTimelineNode } from "./run-timeline.js";
import { TokenCostMeter } from "./token-cost-meter.js";

/**
 * Host components for a version 1 generative UI document.
 * Keep this list aligned with GENERATIVE_COMPONENTS in packages/mcp/src/generative-ui.ts.
 */
export const GENERATIVE_UI_HOST_COMPONENTS = [
  "Section",
  "Stack",
  "AgentMetricRow",
  "AgentMetric",
  "RunTimeline",
  "HumanInterruptQueue",
  "GuardrailIndicator",
  "TokenCostMeter",
  "TraceLog",
] as const;

const HOST_COMPONENTS = new Set<string>(GENERATIVE_UI_HOST_COMPONENTS);

const METRIC_TONES = new Set<AgentMetricTone>(["default", "ok", "warn", "review", "block", "info"]);
const TONES = new Set<Tone>(["info", "ok", "review", "warn", "block"]);
const NODE_STATUSES = new Set<NodeStatus>(["success", "error", "running", "waiting", "retrying", "skipped"]);
const GUARDRAIL_STATUSES = new Set<GuardrailStatus>(["passed", "warned", "blocked"]);
const GUARDRAIL_CATEGORIES = new Set<GuardrailCategory>(["input", "output", "tool"]);

const STATUS_LABEL = {
  approved: "Approved",
  rejected: "Rejected",
  escalated: "Escalated",
} as const;

type Decision = keyof typeof STATUS_LABEL;

export interface GenerativeUiNode {
  id?: string;
  component?: string;
  props?: Record<string, unknown>;
  children?: GenerativeUiNode[];
}

export interface GenerativeUiDocument {
  version?: string;
  auditId?: string;
  theme?: string;
  locale?: string;
  title?: string;
  description?: string;
  nodes?: GenerativeUiNode[];
}

export interface GenerativeUiViewProps {
  document: GenerativeUiDocument;
  className?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toneOf(value: unknown): Tone | null {
  return typeof value === "string" && TONES.has(value as Tone) ? (value as Tone) : null;
}

function Unsupported({ id, component }: { id: string; component: string }) {
  return (
    <p role="alert" data-unknown-component={component} className="rounded-lg border border-block/40 bg-block/10 px-3 py-2 text-sm text-block">
      Unsupported component &quot;{component}&quot; ({id}). The host did not render it.
    </p>
  );
}

function InvalidNode({ id, component, detail }: { id: string; component: string; detail: string }) {
  return (
    <p role="alert" className="rounded-lg border border-block/40 bg-block/10 px-3 py-2 text-sm text-block">
      {component} ({id}) was not rendered. {detail}
    </p>
  );
}

function readQueueItems(value: unknown): InterruptQueueItem[] | null {
  if (!Array.isArray(value)) return null;
  const items: InterruptQueueItem[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return null;
    const id = text(entry.id);
    const action = text(entry.action);
    const agent = text(entry.agent);
    const riskTone = toneOf(entry.riskTone);
    const riskLabel = text(entry.riskLabel);
    const what = text(entry.what);
    const why = text(entry.why);
    const blastRadius = text(entry.blastRadius);
    const rollback = text(entry.rollback);
    const requestedAt = text(entry.requestedAt);
    if (!id || !action || !agent || !riskTone || !riskLabel || !what || !why || !blastRadius || !rollback || !requestedAt) {
      return null;
    }
    if (typeof entry.ageMinutes !== "number") return null;
    const item: InterruptQueueItem = {
      id,
      action,
      agent,
      riskTone,
      riskLabel,
      what,
      why,
      blastRadius,
      rollback,
      requestedAt,
      ageMinutes: entry.ageMinutes,
    };
    if (typeof entry.expiresIn === "string") item.expiresIn = entry.expiresIn;
    items.push(item);
  }
  return items;
}

function readTimeline(value: unknown): RunTimelineNode[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const nodes: RunTimelineNode[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return null;
    const id = text(entry.id);
    const title = text(entry.title);
    const status = typeof entry.status === "string" && NODE_STATUSES.has(entry.status as NodeStatus) ? (entry.status as NodeStatus) : null;
    if (!id || !title || !status) return null;
    nodes.push({
      id,
      title,
      status,
      owner: text(entry.owner) ?? undefined,
      meta: text(entry.meta) ?? undefined,
    });
  }
  return nodes;
}

function readPolicies(value: unknown): GuardrailPolicy[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const policies: GuardrailPolicy[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return null;
    const id = text(entry.id);
    const name = text(entry.name);
    const rationale = text(entry.rationale);
    const category = typeof entry.category === "string" && GUARDRAIL_CATEGORIES.has(entry.category as GuardrailCategory)
      ? (entry.category as GuardrailCategory)
      : null;
    const status = typeof entry.status === "string" && GUARDRAIL_STATUSES.has(entry.status as GuardrailStatus)
      ? (entry.status as GuardrailStatus)
      : null;
    if (!id || !name || !rationale || !category || !status) return null;
    policies.push({ id, name, rationale, category, status });
  }
  return policies;
}

interface NodeProps {
  node: GenerativeUiNode;
  queues: Record<string, InterruptQueueItem[]>;
  onDecide: (queueId: string, itemId: string, status: Decision, action: string, source: InterruptQueueItem[]) => void;
}

function GenerativeNode({ node, queues, onDecide }: NodeProps) {
  const id = text(node.id) ?? "node";
  const component = text(node.component) ?? "unknown";
  const props = isRecord(node.props) ? node.props : {};
  const children = Array.isArray(node.children) ? node.children : [];
  const renderedChildren = children.map((child, index) => (
    <GenerativeNode key={text(child.id) ?? `${id}-${index}`} node={child} queues={queues} onDecide={onDecide} />
  ));

  if (!HOST_COMPONENTS.has(component)) return <Unsupported id={id} component={component} />;

  if (component === "Section") {
    const heading = text(props.heading);
    if (!heading) return <InvalidNode id={id} component={component} detail="Add a heading." />;
    return (
      <section aria-labelledby={id} className="space-y-2">
        <h2 id={id} className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
          {heading}
        </h2>
        {renderedChildren}
      </section>
    );
  }

  if (component === "Stack") {
    const split = props.direction === "split";
    return (
      <div className={split ? "grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : "space-y-4"}>
        {renderedChildren}
      </div>
    );
  }

  if (component === "AgentMetricRow") return <AgentMetricRow>{renderedChildren}</AgentMetricRow>;

  if (component === "AgentMetric") {
    const label = text(props.label);
    const value = text(props.value);
    if (!label || !value) return <InvalidNode id={id} component={component} detail="Add a label and a value." />;
    const tone = typeof props.tone === "string" && METRIC_TONES.has(props.tone as AgentMetricTone) ? (props.tone as AgentMetricTone) : "default";
    return <AgentMetric label={label} value={value} unit={text(props.unit) ?? undefined} tone={tone} />;
  }

  if (component === "RunTimeline") {
    const title = text(props.title);
    const nodes = readTimeline(props.nodes);
    if (!title || !nodes) return <InvalidNode id={id} component={component} detail="Add a title and labeled steps." />;
    return <RunTimeline title={title} hint={text(props.hint) ?? undefined} nodes={nodes} />;
  }

  if (component === "HumanInterruptQueue") {
    const title = text(props.title);
    const initial = readQueueItems(props.items);
    if (!title || !initial) return <InvalidNode id={id} component={component} detail="Add a title and labeled approval items." />;
    const items = queues[id] ?? initial;
    return (
      <HumanInterruptQueue
        title={title}
        items={items}
        onApprove={(itemId) => {
          const item = items.find((entry) => entry.id === itemId);
          if (item) onDecide(id, itemId, "approved", item.action, items);
        }}
        onReject={(itemId) => {
          const item = items.find((entry) => entry.id === itemId);
          if (item) onDecide(id, itemId, "rejected", item.action, items);
        }}
        onEscalate={(itemId) => {
          const item = items.find((entry) => entry.id === itemId);
          if (item) onDecide(id, itemId, "escalated", item.action, items);
        }}
      />
    );
  }

  if (component === "GuardrailIndicator") {
    const label = text(props.label);
    const policies = readPolicies(props.policies);
    if (!label || !policies) return <InvalidNode id={id} component={component} detail="Add a label and named policies." />;
    return <GuardrailIndicator label={label} policies={policies} defaultOpen={props.defaultOpen === true} />;
  }

  if (component === "TokenCostMeter") {
    const title = text(props.title);
    const breakdown = Array.isArray(props.breakdown)
      ? props.breakdown.flatMap((entry) => {
          if (!isRecord(entry)) return [];
          const label = text(entry.label);
          const itemTone = toneOf(entry.tone);
          if (!label || !itemTone || typeof entry.costUsd !== "number") return [];
          return [{ label, tone: itemTone, costUsd: entry.costUsd }];
        })
      : [];
    if (!title || breakdown.length === 0) return <InvalidNode id={id} component={component} detail="Add a title and a labeled cost breakdown." />;
    return (
      <TokenCostMeter
        title={title}
        budgetUsd={typeof props.budgetUsd === "number" ? props.budgetUsd : undefined}
        tokensIn={typeof props.tokensIn === "number" ? props.tokensIn : undefined}
        tokensOut={typeof props.tokensOut === "number" ? props.tokensOut : undefined}
        breakdown={breakdown}
      />
    );
  }

  const title = text(props.title);
  const label = text(props.label);
  const rows = Array.isArray(props.rows) ? props.rows : [];
  const renderedRows = rows.flatMap((entry, index) => {
    if (!isRecord(entry)) return [];
    const agent = text(entry.agent);
    const rowText = text(entry.text);
    const rowTone = toneOf(entry.tone);
    if (!agent || !rowText || !rowTone) return [];
    return [
      <TraceLog.Row key={`${id}-row-${index}`} tone={rowTone} agent={agent} step={text(entry.step) ?? undefined}>
        {rowText}
      </TraceLog.Row>,
    ];
  });
  if (!title || !label || renderedRows.length === 0) {
    return <InvalidNode id={id} component={component} detail="Add a title, a log label, and event text." />;
  }
  return (
    <TraceLog.Root aria-label={label}>
      <TraceLog.Header title={title} hint={text(props.hint) ?? undefined} />
      <TraceLog.Body aria-label={label}>{renderedRows}</TraceLog.Body>
    </TraceLog.Root>
  );
}

function GenerativeUiFrame({ document, className }: GenerativeUiViewProps) {
  const [queues, setQueues] = React.useState<Record<string, InterruptQueueItem[]>>({});
  const [notice, setNotice] = React.useState("");
  const locale: Locale = document.locale === "es" ? "es" : "en";
  const theme = text(document.theme) ?? "cockpit";
  const title = text(document.title) ?? "Generated UI";
  const auditId = text(document.auditId) ?? "unscoped";
  const nodes = Array.isArray(document.nodes) ? document.nodes : [];

  function onDecide(queueId: string, itemId: string, status: Decision, action: string, source: InterruptQueueItem[]) {
    setQueues((current) => ({
      ...current,
      [queueId]: (current[queueId] ?? source).map((entry) =>
        entry.id === itemId ? { ...entry, status, decidedBy: "Demo operator", decidedAt: "just now" } : entry,
      ),
    }));
    setNotice(`${action}. ${STATUS_LABEL[status]}.`);
  }

  return (
    <div
      lang={locale}
      data-theme={theme}
      data-demo="generative-ui"
      data-audit-id={auditId}
      className={cn("w-full space-y-6", className)}
    >
      <p className="sr-only" role="status">
        {notice}
      </p>
      <header className="max-w-[70ch] space-y-2">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">Duly · generated UI · {auditId}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {text(document.description) ? <p className="text-sm leading-relaxed text-dim">{document.description}</p> : null}
      </header>
      {document.version !== "1" ? (
        <p role="alert" className="rounded-lg border border-block/40 bg-block/10 px-3 py-2 text-sm text-block">
          This host renders generative UI version 1. The document version is {document.version ?? "missing"}.
        </p>
      ) : null}
      <div className="space-y-6">
        {nodes.map((node, index) => (
          <GenerativeNode key={text(node.id) ?? `root-${index}`} node={node} queues={queues} onDecide={onDecide} />
        ))}
      </div>
    </div>
  );
}

/**
 * Renders a version 1 generative UI document with Duly components.
 * Validate the document with the Duly MCP tool `validate_generative_ui` before treating it as an audit record.
 * Sample decisions stay in this view.
 */
export function GenerativeUiView(props: GenerativeUiViewProps) {
  const locale: Locale = props.document.locale === "es" ? "es" : "en";
  return (
    <CopyProvider locale={locale}>
      <GenerativeUiFrame {...props} />
    </CopyProvider>
  );
}
