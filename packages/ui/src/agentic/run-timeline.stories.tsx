import type { Meta, StoryObj } from "@storybook/react";
import { RunTimeline } from "./run-timeline.js";
import { NodeStatusLegend } from "./node-status-badge.js";

const meta: Meta<typeof RunTimeline> = {
  title: "Agentic/Run Timeline/V001 State Grammar",
  component: RunTimeline,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof RunTimeline>;

export const LiveWorkflowRun: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[900px] space-y-6">
        <RunTimeline
          title="Workflow run"
          hint="wf_intake-2026 · run 4821 · started 00:41 ago"
          nodes={[
            { id: "trigger", title: "Webhook trigger", status: "success", owner: "n8n: Webhook", meta: "0.0s" },
            { id: "validate", title: "Validate payload", status: "success", owner: "n8n: Function", meta: "0.2s" },
            { id: "enrich", title: "Enrich via CRM lookup", status: "running", owner: "n8n: HTTP Request", meta: "1.8s so far" },
            { id: "risk", title: "Risk check", status: "waiting", owner: "RISK AGENT", meta: "queued" },
            { id: "notify", title: "Notify underwriting", status: "waiting", owner: "n8n: Slack", meta: "queued" },
            { id: "archive", title: "Archive record", status: "skipped", owner: "n8n: NoOp", meta: "conditional branch" },
          ]}
        />
        <p className="max-w-[640px] font-mono text-[11px] leading-relaxed text-faint">
          El nodo "en curso" y los nodos "en espera" comparten trazo discontinuo, pero el
          conector hacia el nodo en curso pulsa — no hace falta abrir el detalle para saber
          cuál de los dos pasos pendientes es el que realmente está ejecutando ahora mismo.
        </p>
      </div>
    </div>
  ),
};

export const RetryAfterFailure: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[900px] space-y-6">
        <RunTimeline
          title="Workflow run"
          hint="wf_claims-sync · run 1092 · 1 node retrying"
          nodes={[
            { id: "trigger", title: "Schedule trigger", status: "success", owner: "n8n: Cron", meta: "0.0s" },
            { id: "fetch", title: "Fetch claims batch", status: "success", owner: "n8n: HTTP Request", meta: "0.6s" },
            { id: "sync", title: "Sync to claims DB", status: "retrying", owner: "n8n: Postgres", meta: "timeout, retry 2/3", attempt: [2, 3] },
            { id: "downstream", title: "Update policy status", status: "waiting", owner: "n8n: Function", meta: "blocked on retry" },
          ]}
        />
        <NodeStatusLegend />
      </div>
    </div>
  ),
};

export const StatusGrammarLegend: S = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-[520px] space-y-3">
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
          6-state node grammar
        </h2>
        <NodeStatusLegend />
      </div>
    </div>
  ),
};
