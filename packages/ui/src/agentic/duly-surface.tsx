import * as React from "react";
import { checkSurface, type CheckedSurface, type SurfaceNode } from "@duly/catalog";
import { CopyProvider } from "../lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";
import { ApprovalGateCard, type ApprovalStatus } from "./approval-gate-card.js";
import { AuditLogTable, type AuditActorKind, type AuditEvent } from "./audit-log-table.js";
import { GuardrailIndicator, type GuardrailCategory, type GuardrailPolicy, type GuardrailStatus } from "./guardrail-indicator.js";
import { RichToolCallCard, type ToolResultBlock } from "./rich-tool-call-card.js";
import { TokenCostMeter } from "./token-cost-meter.js";

/** Keep this list aligned with CATALOG_COMPONENTS in @duly/catalog. */
export const DULY_SURFACE_COMPONENTS = ["Column", "ApprovalGate", "AuditLog", "RichToolCall", "TokenCost", "Guardrail"] as const;

/** Visible section titles. The catalog still uses the component names. */
const SECTION_TITLES: Record<string, string> = {
  Column: "Layout",
  ApprovalGate: "Approval",
  AuditLog: "Audit log",
  RichToolCall: "Tool call",
  TokenCost: "Cost",
  Guardrail: "Guardrails",
};

export interface DulySurfaceProps {
  message: unknown;
  className?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function Fallback({ title, detail }: { title: string; detail: string }) {
  return (
    <p role="alert" className="rounded-lg border border-block/40 bg-block/10 px-3 py-2 text-sm text-block">
      <span className="font-semibold">{title}. </span>
      {detail}
    </p>
  );
}

function findNode(components: SurfaceNode[], id: string): SurfaceNode | undefined {
  return components.find((node) => node.id === id);
}

function componentName(node: SurfaceNode): string | null {
  const keys = Object.keys(node.component);
  return keys.length === 1 ? (keys[0] ?? null) : null;
}

function SurfaceNodeView({ node, components }: { node: SurfaceNode; components: SurfaceNode[] }) {
  const name = componentName(node);
  const props = name ? node.component[name] : null;
  if (!name || !isRecord(props)) {
    return <Fallback title="Unsupported component" detail={`Node ${node.id} has no catalog component.`} />;
  }

  if (name === "Column" && Array.isArray(props.children)) {
    return (
      <div className="space-y-4">
        {props.children.map((childId) => {
          const child = typeof childId === "string" ? findNode(components, childId) : undefined;
          if (!child) return null;
          const childName = componentName(child);
          return (
            <section key={child.id} className="space-y-2" aria-labelledby={`${child.id}-heading`}>
              <h2 id={`${child.id}-heading`} className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
                {(childName && SECTION_TITLES[childName]) || childName || child.id}
              </h2>
              <SurfaceNodeView node={child} components={components} />
            </section>
          );
        })}
      </div>
    );
  }

  if (name === "ApprovalGate") {
    const action = text(props.action);
    const agent = text(props.agent);
    const riskLabel = text(props.riskLabel);
    const what = text(props.what);
    const why = text(props.why);
    const blastRadius = text(props.blastRadius);
    const rollback = text(props.rollback);
    const requestedAt = text(props.requestedAt);
    const riskTone = text(props.riskTone) as Tone | null;
    if (!action || !agent || !riskLabel || !what || !why || !blastRadius || !rollback || !requestedAt || !riskTone) {
      return <Fallback title="ApprovalGate was not rendered" detail="Required text is missing." />;
    }
    return (
      <ApprovalGateView
        action={action}
        agent={agent}
        riskTone={riskTone}
        riskLabel={riskLabel}
        what={what}
        why={why}
        blastRadius={blastRadius}
        rollback={rollback}
        requestedAt={requestedAt}
        expiresIn={text(props.expiresIn) ?? undefined}
        status={(text(props.status) ?? undefined) as ApprovalStatus | undefined}
      />
    );
  }

  if (name === "AuditLog" && Array.isArray(props.events)) {
    const events: AuditEvent[] = [];
    for (const entry of props.events) {
      if (!isRecord(entry)) continue;
      const id = text(entry.id);
      const actor = text(entry.actor);
      const action = text(entry.action);
      const resource = text(entry.resource);
      const timestamp = text(entry.timestamp);
      const hash = text(entry.hash);
      const actorKind = text(entry.actorKind) as AuditActorKind | null;
      const outcome = text(entry.outcome) as Tone | null;
      if (!id || !actor || !action || !resource || !timestamp || !hash || !actorKind || !outcome) continue;
      events.push({ id, actor, action, resource, timestamp, hash, actorKind, outcome });
    }
    if (events.length === 0) return <Fallback title="AuditLog was not rendered" detail="No complete events." />;
    return <AuditLogTable title={text(props.title) ?? undefined} events={events} />;
  }

  if (name === "RichToolCall" && Array.isArray(props.blocks)) {
    const tool = text(props.tool);
    const blocks: ToolResultBlock[] = [];
    for (const block of props.blocks) {
      if (!isRecord(block)) continue;
      if (block.kind === "table" && Array.isArray(block.columns) && Array.isArray(block.rows)) {
        blocks.push({
          kind: "table",
          columns: block.columns.filter((column): column is string => typeof column === "string"),
          rows: block.rows.filter(Array.isArray) as Array<Array<string | number>>,
          caption: text(block.caption) ?? undefined,
        });
      }
      if (block.kind === "metrics" && Array.isArray(block.items)) {
        blocks.push({
          kind: "metrics",
          items: block.items.flatMap((item) => {
            if (!isRecord(item) || !text(item.label) || !text(item.value)) return [];
            return [{ label: String(item.label), value: String(item.value), tone: text(item.tone) as Tone | undefined }];
          }),
        });
      }
      if (block.kind === "code" && text(block.content)) {
        blocks.push({ kind: "code", content: String(block.content), language: text(block.language) ?? undefined });
      }
    }
    if (!tool || blocks.length === 0) return <Fallback title="RichToolCall was not rendered" detail="Tool name or blocks are missing." />;
    const input = isRecord(props.input)
      ? Object.fromEntries(Object.entries(props.input).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
      : undefined;
    return <RichToolCallCard tool={tool} input={input} blocks={blocks} latency={text(props.latency) ?? undefined} tone={(text(props.tone) as Tone | null) ?? undefined} />;
  }

  if (name === "TokenCost" && Array.isArray(props.breakdown)) {
    const title = text(props.title);
    const breakdown = props.breakdown.flatMap((item) => {
      if (!isRecord(item) || !text(item.label) || typeof item.costUsd !== "number" || !text(item.tone)) return [];
      return [{ label: String(item.label), costUsd: item.costUsd, tone: item.tone as Tone }];
    });
    if (!title || breakdown.length === 0) return <Fallback title="TokenCost was not rendered" detail="Title or breakdown is missing." />;
    return (
      <TokenCostMeter
        title={title}
        breakdown={breakdown}
        budgetUsd={typeof props.budgetUsd === "number" ? props.budgetUsd : undefined}
        tokensIn={typeof props.tokensIn === "number" ? props.tokensIn : undefined}
        tokensOut={typeof props.tokensOut === "number" ? props.tokensOut : undefined}
      />
    );
  }

  if (name === "Guardrail" && Array.isArray(props.policies)) {
    const label = text(props.label);
    const policies: GuardrailPolicy[] = [];
    for (const policy of props.policies) {
      if (!isRecord(policy)) continue;
      const id = text(policy.id);
      const policyName = text(policy.name);
      const rationale = text(policy.rationale);
      const category = text(policy.category) as GuardrailCategory | null;
      const status = text(policy.status) as GuardrailStatus | null;
      if (!id || !policyName || !rationale || !category || !status) continue;
      policies.push({ id, name: policyName, rationale, category, status });
    }
    if (!label || policies.length === 0) return <Fallback title="Guardrail was not rendered" detail="Label or policies are missing." />;
    return <GuardrailIndicator label={label} policies={policies} defaultOpen={props.defaultOpen === true} />;
  }

  return <Fallback title={`Unsupported component "${name}"`} detail={`Node ${node.id} is not in the Duly catalog, so the host did not render it.`} />;
}

function ApprovalGateView(props: React.ComponentProps<typeof ApprovalGateCard>) {
  const [notice, setNotice] = React.useState("");
  const [decision, setDecision] = React.useState<ApprovalStatus | null>(null);
  function decide(status: ApprovalStatus, label: string) {
    setDecision(status);
    setNotice(`${props.action}. ${label}`);
  }
  return (
    <div className="space-y-2">
      <p className="sr-only" role="status">
        {notice}
      </p>
      <ApprovalGateCard
        {...props}
        status={decision ?? props.status}
        decidedBy={decision ? "Demo operator" : props.decidedBy}
        decidedAt={decision ? "just now" : props.decidedAt}
        onApprove={() => decide("approved", "Approved.")}
        onReject={() => decide("rejected", "Rejected.")}
        onEscalate={() => decide("escalated", "Escalated.")}
      />
    </div>
  );
}

function shownErrors(result: { stripped: unknown[]; errors: Array<{ path: string; message: string }> }) {
  const rest = result.errors.filter((error) => error.path !== "$.root");
  if (rest.length > 0 || result.stripped.length > 0) return rest;
  return result.errors;
}

function CheckedLayout({ checked }: { checked: CheckedSurface }) {
  const root = findNode(checked.components, checked.root);
  if (!root) return <Fallback title="Empty surface" detail="The checked layout has no root." />;
  return <SurfaceNodeView node={root} components={checked.components} />;
}

function DulySurfaceFrame({ message, className }: DulySurfaceProps) {
  const result = checkSurface(message);
  const theme = result.theme ?? "cockpit";
  return (
    <div lang="en" data-theme={theme} data-demo="duly-surface" data-surface-id={result.surfaceId ?? undefined} className={className ? `w-full space-y-4 ${className}` : "w-full space-y-4"}>
      <header className="max-w-[70ch] space-y-2">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">Duly surface · {result.surfaceId ?? "unscoped"}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Checked layout</h1>
        <p className="text-sm leading-relaxed text-dim">
          Rendered from the duly catalog. Decisions stay in this page. The hash below is the layout that passed the catalog.
        </p>
        {result.surfaceHash ? (
          <p className="break-all font-mono text-[11px] text-dim">
            <span className="font-bold text-ink">Reviewer hash </span>
            {result.surfaceHash}
          </p>
        ) : (
          <p className="text-sm text-dim">No reviewer hash. The surface did not pass the catalog.</p>
        )}
      </header>
      {result.stripped.map((item) => (
        <Fallback key={item.id} title={`Unknown component "${item.component}"`} detail={`Node ${item.id} was stripped. The host did not render it.`} />
      ))}
      {shownErrors(result).map((error) => (
        <Fallback key={`${error.path}:${error.message}`} title="Component was not rendered" detail={`${error.path}: ${error.message}`} />
      ))}
      {result.checked ? <CheckedLayout checked={result.checked} /> : null}
    </div>
  );
}

/**
 * Host for an A2UI-shaped Duly surface. Validates with @duly/catalog, renders the checked layout,
 * and shows a fallback for unknown components and bad props. Does not call a model or send a decision.
 */
export function DulySurface(props: DulySurfaceProps) {
  return (
    <CopyProvider locale="en">
      <DulySurfaceFrame {...props} />
    </CopyProvider>
  );
}
