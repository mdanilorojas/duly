import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RetryControls, type RetryAttemptRecord } from "./retry-controls.js";
import { RunInspector, type RunInspectorNode } from "./run-inspector.js";

const meta: Meta<typeof RetryControls> = {
  title: "Agentic/Retry Controls/V001 Reinicio vs nodo fallido",
  component: RetryControls,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof RetryControls>;

const HISTORY: RetryAttemptRecord[] = [
  { attempt: 1, status: "error", trigger: "automatic", at: "14:02:11" },
  { attempt: 2, status: "error", trigger: "automatic", at: "14:02:41" },
  { attempt: 3, status: "retrying", trigger: "manual", actor: "Daniel Osei", at: "14:05:03" },
];

export const Standalone: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-md space-y-6">
        <RetryControls
          attempt={[3, 5]}
          failedNodeTitle="HTTP Request: Push to DocuSign"
          history={HISTORY}
          onRetryFromStart={() => {}}
          onRetryFromFailedNode={() => {}}
        />
        <p className="max-w-[520px] font-mono text-[11px] leading-relaxed text-faint">
          Nueva prioridad #1 del NORTH_STAR (área A). Retry-desde-inicio vs retry-desde-nodo-fallido
          con contador de intentos y un historial que distingue reintentos automáticos de manuales
          (dualidad de actor, principio #5).
        </p>
      </div>
    </div>
  ),
};

export const MaxRetriesReached: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-md">
        <RetryControls
          attempt={[5, 5]}
          failedNodeTitle="Postgres: Upsert ledger entry"
          history={[...HISTORY, { attempt: 4, status: "error", trigger: "automatic", at: "14:06:20" }, { attempt: 5, status: "error", trigger: "manual", actor: "Daniel Osei", at: "14:11:52" }]}
        />
      </div>
    </div>
  ),
};

function InlineDemo() {
  const [attempt, setAttempt] = React.useState<[number, number]>([2, 4]);
  const [history, setHistory] = React.useState<RetryAttemptRecord[]>([
    { attempt: 1, status: "error", trigger: "automatic", at: "T+00.0s" },
    { attempt: 2, status: "error", trigger: "automatic", at: "T+04.8s" },
  ]);

  const nodes: RunInspectorNode[] = [
    { id: "n1", title: "Schedule Trigger", status: "success", nodeType: "n8n-nodes-base.scheduleTrigger", meta: "T+00.0s" },
    {
      id: "n2",
      title: "HTTP Request: Sync claims to payer API",
      status: "error",
      nodeType: "n8n-nodes-base.httpRequest",
      meta: "4.8s",
      input: { endpoint: "/claims/v3/submit", batch_size: "40" },
      output: { status: "503" },
      error: "503 Service Unavailable — payer API rate limit exceeded.",
      retry: {
        maxAttempts: attempt[1],
        history,
        onRetryFromStart: () =>
          setHistory((h) => [...h, { attempt: h.length + 1, status: "retrying", trigger: "manual", actor: "You", at: "now" }]),
        onRetryFromFailedNode: () => {
          setAttempt(([, max]) => [Math.min(attempt[0] + 1, max), max]);
          setHistory((h) => [...h, { attempt: h.length + 1, status: "retrying", trigger: "manual", actor: "You", at: "now" }]);
        },
      },
      attempt,
    },
    { id: "n3", title: "Slack: Notify claims ops", status: "skipped", nodeType: "n8n-nodes-base.slack", meta: "not reached" },
  ];

  return <RunInspector title="Run inspector" hint="exec_c1a04f · Payer Claims Sync" nodes={nodes} />;
}

export const AnchoredToFailedHere: S = {
  name: "Anchored to Failed Here (RunInspector)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <InlineDemo />
        <p className="max-w-[640px] font-mono text-[11px] leading-relaxed text-faint">
          `variant=&quot;inline&quot;` se ancla directamente al marcador &quot;Failed here&quot; de
          `RunInspector` vía `node.retry` — click en &quot;Retry from failed node&quot; para ver el
          historial crecer en vivo.
        </p>
      </div>
    </div>
  ),
};
