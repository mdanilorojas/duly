import * as React from "react";
import { cn } from "@/lib/utils";
import { CopyProvider } from "../lib/copy/index.js";
import { TraceLog } from "../trace-log/trace-log.js";
import { AgentMetric, AgentMetricRow } from "./agent-metric.js";
import { GuardrailIndicator, type GuardrailPolicy } from "./guardrail-indicator.js";
import { HumanInterruptQueue, type InterruptQueueItem } from "./human-interrupt-queue.js";
import { RunTimeline, type RunTimelineNode } from "./run-timeline.js";
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

function CockpitView({ className, ...props }: React.ComponentProps<"div">) {
  const [items, setItems] = React.useState(INITIAL_QUEUE);
  const [notice, setNotice] = React.useState("");

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
        <p className="text-sm leading-relaxed text-dim">
          A cockpit composed from Duly components: run status, a human approval queue, guardrails, cost, and the
          event log. Decisions stay in this page. Nothing here is a live agent or a real payment.
        </p>
      </header>

      <section aria-labelledby="cockpit-metrics" className="space-y-2">
        <h2 id="cockpit-metrics" className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
          Run metrics
        </h2>
        <AgentMetricRow>
          <AgentMetric label="Pending reviews" value="2" tone="warn" />
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

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="cockpit-queue">
          <h2 id="cockpit-queue" className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
            Human review
          </h2>
          <HumanInterruptQueue
            title="Approval queue"
            items={items}
            onApprove={(id) => decide(id, "approved")}
            onReject={(id) => decide(id, "rejected")}
            onEscalate={(id) => decide(id, "escalated")}
          />
        </section>
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
      </div>

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
    </div>
  );
}

export type AgentOpsCockpitProps = React.ComponentProps<"div">;

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
