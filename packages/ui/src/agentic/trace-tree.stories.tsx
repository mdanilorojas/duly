import type { Meta, StoryObj } from "@storybook/react";
import { TraceTree, type TraceSpan } from "./trace-tree.js";

const meta: Meta<typeof TraceTree> = {
  title: "Agentic/Trace Tree/V001 Cost-Attributed Spans",
  component: TraceTree,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof TraceTree>;

// Mismo run que Agentic/Execution Timeline (run_8f21c0, document intelligence
// review) visto como árbol de spans en vez de secuencia lineal — TraceTree
// anida (agent → tool/llm) y suma costo/tokens por rama, que es exactamente
// lo que ExecutionTimeline no hace (gap #1 del NORTH_STAR 2026-07-02).
const documentIntelligenceSpans: TraceSpan[] = [
  {
    id: "root",
    kind: "agent",
    name: "Document Intelligence Orchestrator",
    tone: "ok",
    startMs: 0,
    durationMs: 4800,
    children: [
      {
        id: "retrieval",
        kind: "retrieval",
        name: "search_knowledge_base(indemnity clause precedent)",
        tone: "ok",
        startMs: 400,
        durationMs: 212,
        costUsd: 0.0004,
      },
      {
        id: "extraction",
        kind: "agent",
        name: "Extraction Agent",
        tone: "ok",
        startMs: 900,
        durationMs: 340,
        children: [
          {
            id: "extraction-llm",
            kind: "llm",
            name: "claude-sonnet-5 · extract_entities completion",
            tone: "ok",
            startMs: 910,
            durationMs: 260,
            tokens: { input: 3120, output: 480 },
            costUsd: 0.0187,
          },
          {
            id: "extraction-tool",
            kind: "tool",
            name: "validate_clause_schema(clauses.v3)",
            tone: "ok",
            startMs: 1180,
            durationMs: 40,
            costUsd: 0.0001,
          },
        ],
      },
      {
        id: "risk-scorer",
        kind: "agent",
        name: "Risk Scorer",
        tone: "warn",
        startMs: 2100,
        durationMs: 88,
        children: [
          {
            id: "risk-llm",
            kind: "llm",
            name: "claude-haiku-4-5 · risk classification",
            tone: "warn",
            startMs: 2105,
            durationMs: 76,
            tokens: { input: 890, output: 64 },
            costUsd: 0.0009,
          },
        ],
      },
      {
        id: "approval-wait",
        kind: "tool",
        name: "await_human_approval(uncapped indemnity)",
        tone: "review",
        startMs: 2300,
        durationMs: 2500,
      },
    ],
  },
];

export const DocumentIntelligenceRun: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[880px]">
        <TraceTree title="Trace tree" runId="run_8f21c0" spans={documentIntelligenceSpans} />
      </div>
    </div>
  ),
};

// Un run de investigación multi-agente más profundo — 3 niveles de anidamiento
// (orchestrator → sub-agente → llm/tool) para demostrar que el rollup de
// costo/tokens sube correctamente por cada nivel, no solo el inmediato.
const researchSwarmSpans: TraceSpan[] = [
  {
    id: "swarm-root",
    kind: "agent",
    name: "Research Swarm Coordinator",
    tone: "ok",
    startMs: 0,
    durationMs: 9400,
    children: [
      {
        id: "web-agent",
        kind: "agent",
        name: "Web Research Agent",
        tone: "ok",
        startMs: 120,
        durationMs: 3800,
        children: [
          {
            id: "web-search-1",
            kind: "tool",
            name: "web_search(\"n8n OEM white-label 2026\")",
            tone: "ok",
            startMs: 140,
            durationMs: 610,
            costUsd: 0.0012,
          },
          {
            id: "web-llm-1",
            kind: "llm",
            name: "claude-sonnet-5 · summarize_sources",
            tone: "ok",
            startMs: 780,
            durationMs: 1240,
            tokens: { input: 8400, output: 620 },
            costUsd: 0.0512,
          },
        ],
      },
      {
        id: "code-agent",
        kind: "agent",
        name: "Code Analysis Agent",
        tone: "block",
        startMs: 4000,
        durationMs: 4900,
        children: [
          {
            id: "code-retrieval",
            kind: "retrieval",
            name: "search_codebase(\"TraceTree\")",
            tone: "ok",
            startMs: 4020,
            durationMs: 180,
            costUsd: 0.0003,
          },
          {
            id: "code-llm",
            kind: "llm",
            name: "claude-opus-4-8 · static_analysis",
            tone: "block",
            startMs: 4220,
            durationMs: 4600,
            tokens: { input: 24100, output: 1890 },
            costUsd: 0.4021,
          },
        ],
      },
    ],
  },
];

export const NestedResearchSwarm: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[880px]">
        <TraceTree
          title="Trace tree"
          runId="run_2c9f41"
          spans={researchSwarmSpans}
          defaultOpenDepth={3}
        />
      </div>
    </div>
  ),
};

export const CollapsedByDefault: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[880px]">
        <TraceTree
          title="Trace tree"
          runId="run_8f21c0"
          spans={documentIntelligenceSpans}
          defaultOpenDepth={0}
        />
      </div>
    </div>
  ),
};
