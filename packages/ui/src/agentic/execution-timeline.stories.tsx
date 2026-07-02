import type { Meta, StoryObj } from "@storybook/react";
import { ExecutionTimeline, RunStep, ToolCallCard } from "./execution-timeline.js";

const meta: Meta<typeof ExecutionTimeline> = {
  title: "Agentic/Execution Timeline/V001 Agent Run Trace",
  component: ExecutionTimeline,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof ExecutionTimeline>;

export const DocumentIntelligenceRun: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[720px]">
        <ExecutionTimeline title="Run trace" hint="run_8f21c0 · document intelligence review · 4.8s total">
          <RunStep kind="event" tone="info" agent="ORCHESTRATOR" title="Run started — 1 document, 3 candidate agents" timestamp="T+00.0s" duration="—" />
          <RunStep
            kind="tool_call"
            tone="ok"
            agent="RETRIEVAL AGENT"
            title="search_knowledge_base(query)"
            timestamp="T+00.4s"
            duration="212ms"
          >
            <ToolCallCard
              tone="ok"
              tool="search_knowledge_base"
              input={{ query: "\"indemnity clause\" precedent", top_k: 5, index: "contracts-2026" }}
              output="5 matches — top score 0.91 (MSA-Template-C §14.2)."
              latency="212ms"
            />
          </RunStep>
          <RunStep
            kind="tool_call"
            tone="ok"
            agent="EXTRACTION AGENT"
            title="extract_entities(document)"
            timestamp="T+00.9s"
            duration="340ms"
          >
            <ToolCallCard
              tone="ok"
              tool="extract_entities"
              input={{ document: "contract_9931.pdf", schema: "clauses.v3" }}
              output="12 clauses extracted — 1 flagged: non-standard indemnity cap (uncapped)."
              latency="340ms"
            />
          </RunStep>
          <RunStep
            kind="decision"
            tone="warn"
            agent="RISK SCORER"
            title="risk_score = 0.72 → route to human review"
            timestamp="T+02.1s"
            duration="88ms"
          >
            <ToolCallCard
              tone="warn"
              tool="score_risk"
              input={{ clause: "indemnity_cap", precedent_deviation: "high", counterparty_tier: "new" }}
              output="Score 0.72 exceeds auto-approve threshold (0.60) — escalating."
              latency="88ms"
            />
          </RunStep>
          <RunStep
            kind="approval"
            tone="review"
            agent="COMPLIANCE REVIEWER"
            title="Awaiting human decision on uncapped indemnity clause"
            timestamp="T+02.3s"
            duration="pending"
          />
          <RunStep
            kind="event"
            tone="ok"
            agent="ORCHESTRATOR"
            title="Run completed — approved with redline, notified counsel"
            timestamp="T+04.8s"
            duration="—"
            isLast
          />
        </ExecutionTimeline>
      </div>
    </div>
  ),
};

export const ToolCallDetailOnly: S = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-[420px]">
        <ToolCallCard
          tone="review"
          tool="draft_redline(clause, policy)"
          input={{ clause: "indemnity_cap", policy: "max_liability_2x_fees" }}
          output="Proposed cap: 2× annual contract value. Awaiting counsel sign-off."
          latency="164ms"
        />
      </div>
    </div>
  ),
};
