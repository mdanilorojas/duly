import * as React from "react";
import { EventType } from "@ag-ui/core";
import { cn } from "@/lib/utils";
import { Button } from "../components/ui/button.js";
import { CopyProvider } from "../lib/copy/index.js";
import { TraceLog } from "../trace-log/trace-log.js";
import { AgentMetric, AgentMetricRow } from "./agent-metric.js";
import { GuardrailIndicator, type GuardrailPolicy } from "./guardrail-indicator.js";
import { HumanInterruptQueue, type InterruptQueueItem } from "./human-interrupt-queue.js";
import { NodeStatusBadge, type NodeStatus } from "./node-status-badge.js";
import { RichToolCallCard } from "./rich-tool-call-card.js";
import { RunTimeline, type RunTimelineNode } from "./run-timeline.js";
import { StreamingMessage, type AgUiStreamEvent } from "./streaming-message.js";
import { TokenCostMeter } from "./token-cost-meter.js";

const STATUS_LABEL = {
  approved: "Approved",
  rejected: "Rejected",
  escalated: "Escalated",
} as const;

type Decision = keyof typeof STATUS_LABEL;

const INITIAL_QUEUE: InterruptQueueItem[] = [
  {
    id: "pay-4800",
    action: "Send vendor payment of $4,800",
    agent: "TREASURY",
    riskTone: "block",
    riskLabel: "Critical risk",
    what: "Pay the invoice the intake agent matched to vendor Northwind.",
    why: "The payout account changed 6 hours ago and does not match the vendor record.",
    blastRadius: "$4,800 · one vendor · no automatic reversal",
    rollback: "Ask the bank to recall the payment. That request can fail.",
    requestedAt: "2m ago",
    ageMinutes: 2,
    expiresIn: "13m",
  },
  {
    id: "revert-checkout",
    action: "Revert checkout-service to v2.41.0",
    agent: "RELEASE",
    riskTone: "warn",
    riskLabel: "High risk",
    what: "Roll the service back after error rate rose following v2.42.0.",
    why: "The one-hour error budget is being consumed faster than the policy allows.",
    blastRadius: "checkout-service · all regions",
    rollback: "v2.42.0 is still tagged and can be deployed again.",
    requestedAt: "4m ago",
    ageMinutes: 4,
    expiresIn: "26m",
  },
];

const RUN_NODES: RunTimelineNode[] = [
  { id: "ingest", title: "Ingest", status: "success", owner: "INTAKE", meta: "0.4s" },
  { id: "policy", title: "Policy", status: "success", owner: "GUARD", meta: "0.2s" },
  { id: "payment", title: "Payment", status: "waiting", owner: "TREASURY", meta: "hold" },
  { id: "release", title: "Release", status: "skipped", owner: "RELEASE", meta: "—" },
];

type AgentStateLabel = "Running" | "Waiting" | "Done" | "Error";

const AGENTS: Array<{
  id: string;
  name: string;
  status: NodeStatus;
  label: AgentStateLabel;
  activity: string;
}> = [
  { id: "intake", name: "INTAKE", status: "success", label: "Done", activity: "Matched invoice NW-2041 to Northwind." },
  { id: "treasury", name: "TREASURY", status: "waiting", label: "Waiting", activity: "Paused on the payment approval." },
  { id: "guard", name: "GUARD", status: "running", label: "Running", activity: "Rechecking the payout account." },
  { id: "release", name: "RELEASE", status: "error", label: "Error", activity: "Rollback check failed closed." },
];

type ToolCallStatus = "running" | "waiting" | "done" | "error";

interface DemoToolCall {
  id: string;
  name: string;
  argsSummary: string;
  status: ToolCallStatus;
}

const TOOL_STATUS: Record<ToolCallStatus, { node: NodeStatus; label: AgentStateLabel }> = {
  running: { node: "running", label: "Running" },
  waiting: { node: "waiting", label: "Waiting" },
  done: { node: "success", label: "Done" },
  error: { node: "error", label: "Error" },
};

const TOOL_STEPS: DemoToolCall[][] = [
  [{ id: "lookup", name: "lookup_vendor", argsSummary: "vendor=Northwind", status: "running" }],
  [{ id: "lookup", name: "lookup_vendor", argsSummary: "vendor=Northwind", status: "done" }],
  [
    { id: "lookup", name: "lookup_vendor", argsSummary: "vendor=Northwind", status: "done" },
    { id: "account", name: "check_account_change", argsSummary: "vendor=Northwind, window=6h", status: "running" },
  ],
  [
    { id: "lookup", name: "lookup_vendor", argsSummary: "vendor=Northwind", status: "done" },
    { id: "account", name: "check_account_change", argsSummary: "vendor=Northwind, window=6h", status: "done" },
    { id: "pay", name: "transfer_funds", argsSummary: "amount=4800 USD, account=••4419", status: "running" },
  ],
  [
    { id: "lookup", name: "lookup_vendor", argsSummary: "vendor=Northwind", status: "done" },
    { id: "account", name: "check_account_change", argsSummary: "vendor=Northwind, window=6h", status: "done" },
    { id: "pay", name: "transfer_funds", argsSummary: "amount=4800 USD, account=••4419", status: "waiting" },
    { id: "ledger", name: "notify_ledger", argsSummary: "invoice=NW-2041", status: "error" },
  ],
];

const STREAM_SCRIPT: AgUiStreamEvent[] = [
  { type: EventType.THINKING_START },
  { type: EventType.THINKING_END },
  { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m1", delta: "Invoice NW-2041 matches vendor Northwind. " },
  { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m1", delta: "The payout account changed 6 hours ago. " },
  { type: EventType.TOOL_CALL_START, toolCallId: "pay", toolCallName: "transfer_funds" },
  { type: EventType.TOOL_CALL_ARGS, toolCallId: "pay", delta: '{"amount":4800,"vendor":"Northwind"}' },
  { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m1", delta: "Holding the payment until a person decides." },
];

const SETTLED_STREAM = STREAM_SCRIPT.slice(0, 3);

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useSteppedPlayback(run: number, length: number, intervalMs: number) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [seenRun, setSeenRun] = React.useState(run);
  if (run !== seenRun) {
    setSeenRun(run);
    if (run > 0) setIndex(0);
  }

  React.useEffect(() => {
    if (run === 0) return;
    if (reduced) {
      setIndex(length - 1);
      return;
    }
    let current = 0;
    const id = window.setInterval(() => {
      current += 1;
      if (current >= length - 1) {
        setIndex(length - 1);
        window.clearInterval(id);
        return;
      }
      setIndex(current);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [run, intervalMs, length, reduced]);

  if (run === 0 || reduced) return length - 1;
  return index;
}

const GUARDRAILS: GuardrailPolicy[] = [
  {
    id: "injection",
    name: "Prompt injection",
    category: "input",
    status: "passed",
    rationale: "No instruction-override pattern in the operator message.",
  },
  {
    id: "confidence",
    name: "Confidence threshold",
    category: "output",
    status: "warned",
    rationale: "Confidence 0.71 is below 0.85, so the payment stayed in the human queue.",
  },
  {
    id: "scope",
    name: "Tool scope",
    category: "tool",
    status: "passed",
    rationale: "transfer_funds stays inside the agent's authorized limit.",
  },
];

const FOCUS_COPY = {
  all: "Four agent-UI surfaces on one page: agent state, tool calls, a human approval gate, and a token stream. Decisions stay in this page. Nothing here is a live agent or a real payment.",
  state: "Agent state is a label plus an icon: running, waiting, done, or error. Sample agents, not a live runtime.",
  tools: "Tool calls show the name, an args summary, and a status. Replay plays the sample in order. Nothing is executed.",
  approval: "The agent is waiting. Approve, reject, or escalate. The decision stays on this page. This is not a real payment.",
  stream: "Sample AG-UI events. Tokens and the tool-call chip appear in order. This is not a live model.",
} as const;

function AgentStateBoard() {
  return (
    <section aria-labelledby="cockpit-state" data-agui="agent-state" className="space-y-2">
      <h2 id="cockpit-state" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
        Agent state
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((agent) => (
          <li key={agent.id} className="rounded-xl border border-border-subtle bg-surface-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">{agent.name}</p>
                <p className="mt-1 text-xl font-extrabold tracking-tight text-ink">{agent.label}</p>
              </div>
              <NodeStatusBadge status={agent.status} label={agent.label} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-dim">{agent.activity}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ToolCallBoard({ playOnMount }: { playOnMount: boolean }) {
  const [run, setRun] = React.useState(playOnMount ? 1 : 0);
  const index = useSteppedPlayback(run, TOOL_STEPS.length, 700);
  const calls = TOOL_STEPS[run > 0 ? index : TOOL_STEPS.length - 1] ?? [];
  const lookupDone = calls.some((call) => call.id === "lookup" && call.status === "done");

  return (
    <section aria-labelledby="cockpit-tools" data-agui="tool-calls" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cockpit-tools" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
          Tool calls
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={() => setRun((current) => current + 1)}>
          {run === 0 ? "Play tool calls" : "Replay tool calls"}
        </Button>
      </div>
      <ol className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-surface-2">
        {calls.map((call) => {
          const status = TOOL_STATUS[call.status];
          return (
            <li key={call.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
              <NodeStatusBadge status={status.node} label={status.label} size="sm" />
              <code className="font-mono text-[12px] text-ink">{call.name}</code>
              <span className="font-mono text-[11px] text-dim">{call.argsSummary}</span>
            </li>
          );
        })}
      </ol>
      {lookupDone ? (
        <RichToolCallCard
          tool="lookup_vendor"
          latency="0.4s"
          tone="ok"
          input={{ vendor: "Northwind" }}
          blocks={[
            {
              kind: "table",
              caption: "Matched invoice",
              columns: ["Field", "Value"],
              rows: [
                ["Invoice", "NW-2041"],
                ["Vendor", "Northwind"],
              ],
            },
          ]}
        />
      ) : null}
    </section>
  );
}

function StreamBoard({ playOnMount }: { playOnMount: boolean }) {
  const [run, setRun] = React.useState(playOnMount ? 1 : 0);
  const index = useSteppedPlayback(run, STREAM_SCRIPT.length, 320);
  const events = run > 0 ? STREAM_SCRIPT.slice(0, index + 1) : SETTLED_STREAM;
  const streaming = run > 0 && index < STREAM_SCRIPT.length - 1;

  return (
    <section aria-labelledby="cockpit-stream" data-agui="stream" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cockpit-stream" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
          Agent stream
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={() => setRun((current) => current + 1)}>
          {run === 0 ? "Play sample stream" : "Replay sample stream"}
        </Button>
      </div>
      <StreamingMessage aria-label="Agent stream" events={events} streaming={streaming} />
    </section>
  );
}

export type AgentOpsSurface = "all" | "state" | "tools" | "approval" | "stream";

export interface AgentOpsCockpitProps extends React.ComponentProps<"div"> {
  /** Which AG-UI surface to show. `all` is the full cockpit. */
  focus?: AgentOpsSurface;
  /** Play the sample tool-call list or token stream on mount. */
  play?: boolean;
}

function CockpitView({
  className,
  focus = "all",
  play = false,
  ...props
}: AgentOpsCockpitProps) {
  const [items, setItems] = React.useState(INITIAL_QUEUE);
  const [notice, setNotice] = React.useState("");
  const pendingReviews = items.filter((item) => (item.status ?? "pending") === "pending").length;
  const show = (surface: Exclude<AgentOpsSurface, "all">) => focus === "all" || focus === surface;

  function decide(id: string, status: Decision) {
    const item = items.find((entry) => entry.id === id);
    setItems((current) =>
      current.map((entry) =>
        entry.id === id
          ? { ...entry, status, decidedBy: "Demo operator", decidedAt: "just now" }
          : entry,
      ),
    );
    if (item) setNotice(`${item.action}. ${STATUS_LABEL[status]}.`);
  }

  return (
    <div lang="en" className={cn("w-full space-y-6", className)} data-demo="agent-ops-cockpit" {...props}>
      <p className="sr-only" role="status">
        {notice}
      </p>
      <header className="max-w-[70ch] space-y-2">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">Duly · sample data</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Agent operations</h1>
        <p className="text-sm leading-relaxed text-dim">{FOCUS_COPY[focus]}</p>
      </header>

      {show("state") ? <AgentStateBoard /> : null}
      {show("stream") ? <StreamBoard playOnMount={play} /> : null}
      {show("tools") ? <ToolCallBoard playOnMount={play} /> : null}

      {focus === "all" ? (
        <>
          <section aria-labelledby="cockpit-metrics" className="space-y-2">
            <h2 id="cockpit-metrics" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
              Run metrics
            </h2>
            <AgentMetricRow>
              <AgentMetric label="Pending reviews" value={String(pendingReviews)} tone={pendingReviews > 0 ? "warn" : "ok"} />
              <AgentMetric label="Waiting steps" value="1" tone="review" />
              <AgentMetric label="Guardrail warnings" value="1" tone="warn" />
              <AgentMetric label="p95 latency" value="1.8" unit="s" />
              <AgentMetric label="Run cost" value="0.42" unit="USD" tone="ok" />
            </AgentMetricRow>
          </section>

          <section aria-labelledby="cockpit-run" className="space-y-2">
            <h2 id="cockpit-run" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
              Workflow
            </h2>
            <RunTimeline title="Workflow run" hint="run_demo_01 · sample" nodes={RUN_NODES} />
          </section>
        </>
      ) : null}

      {show("approval") ? (
        <div className={focus === "all" ? "grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : undefined}>
          <section aria-labelledby="cockpit-queue" data-agui="hitl">
            <h2 id="cockpit-queue" className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
              Human approval
            </h2>
            <HumanInterruptQueue
              title="Approval queue"
              items={items}
              defaultOpenId="pay-4800"
              onApprove={(id) => decide(id, "approved")}
              onReject={(id) => decide(id, "rejected")}
              onEscalate={(id) => decide(id, "escalated")}
            />
          </section>
          {focus === "all" ? (
            <div className="space-y-4">
              <section aria-labelledby="cockpit-guardrails" className="space-y-2">
                <h2 id="cockpit-guardrails" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
                  Guardrails
                </h2>
                <GuardrailIndicator label="Guardrails" policies={GUARDRAILS} defaultOpen />
              </section>
              <section aria-labelledby="cockpit-cost" className="space-y-2">
                <h2 id="cockpit-cost" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
                  Cost
                </h2>
                <TokenCostMeter
                  title="This run"
                  budgetUsd={2}
                  tokensIn={18420}
                  tokensOut={2104}
                  breakdown={[
                    { label: "Model", costUsd: 0.31, tone: "info" },
                    { label: "Tools", costUsd: 0.08, tone: "review" },
                    { label: "Retrieval", costUsd: 0.03, tone: "ok" },
                  ]}
                />
              </section>
            </div>
          ) : null}
        </div>
      ) : null}

      {focus === "all" ? (
        <section aria-labelledby="cockpit-trace" className="space-y-2">
          <h2 id="cockpit-trace" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
            Event log
          </h2>
          <TraceLog.Root aria-label="Run events">
            <TraceLog.Header title="Run events" hint="run_demo_01" />
            <TraceLog.Body aria-label="Run events">
              <TraceLog.Row tone="info" agent="INTAKE" step="1">
                Matched invoice NW-2041 to vendor Northwind.
              </TraceLog.Row>
              <TraceLog.Row tone="ok" agent="GUARD" step="2">
                Input and tool-scope checks passed.
              </TraceLog.Row>
              <TraceLog.Row tone="warn" agent="GUARD" step="3">
                Confidence 0.71 is below 0.85. Payment held for a person.
              </TraceLog.Row>
              <TraceLog.Row tone="review" agent="TREASURY" step="4">
                Waiting on the approval queue before <TraceLog.Code>transfer_funds</TraceLog.Code>.
              </TraceLog.Row>
            </TraceLog.Body>
          </TraceLog.Root>
        </section>
      ) : null}
    </div>
  );
}

/**
 * Public sample cockpit. Composition order matches
 * `DEMO_COMPOSITION` in `packages/mcp/src/instructions.ts`.
 * Sample copy is English even when a parent CopyProvider uses another locale.
 */
export function AgentOpsCockpit(props: AgentOpsCockpitProps) {
  return (
    <CopyProvider locale="en">
      <CockpitView {...props} />
    </CopyProvider>
  );
}
