import type { Meta, StoryObj } from "@storybook/react";
import { TraceTree, type TraceSpan } from "./trace-tree.js";
import type { GuardrailPolicy } from "./guardrail-indicator.js";

const meta: Meta<typeof TraceTree> = {
  title: "Agentic/Trace Tree/V001 Spans con costo atribuido",
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

const pinjection: GuardrailPolicy = {
  id: "g-pinj",
  name: "Prompt injection detection",
  category: "input",
  status: "passed",
  rationale: "No instruction-override patterns found in the user message.",
};

const piiRedaction: GuardrailPolicy = {
  id: "g-pii",
  name: "PII redaction",
  category: "output",
  status: "passed",
  rationale: "Response contains no unmasked account numbers or SSNs.",
};

const advisoryDisclaimer: GuardrailPolicy = {
  id: "g-advice",
  name: "Regulated advice disclaimer",
  category: "output",
  status: "warned",
  rationale: "Response references investment allocation — appended mandatory disclaimer before send.",
};

const transferScope: GuardrailPolicy = {
  id: "g-scope",
  name: "Transaction scope check",
  category: "tool",
  status: "blocked",
  rationale: "transfer_funds() amount ($48,000.00) exceeds the agent's $5,000 authorization limit — routed to human approval.",
};

// Run de un agente de asesoría financiera (servicios financieros) — cada
// span de LLM carga guardrails de política y, en el paso de redacción, un
// eval score de faithfulness con historial — item #1 de la Prioridad de
// construcción del NORTH_STAR (área B), demostrado sobre el mismo
// vocabulario de tono que ya usa el waterfall de costo.
const financialAdvisorySpans: TraceSpan[] = [
  {
    id: "fa-root",
    kind: "agent",
    name: "Financial Advisory Agent",
    tone: "warn",
    startMs: 0,
    durationMs: 3600,
    children: [
      {
        id: "fa-intake",
        kind: "llm",
        name: "claude-sonnet-5 · parse_client_request",
        tone: "ok",
        startMs: 80,
        durationMs: 340,
        tokens: { input: 1240, output: 180 },
        costUsd: 0.0071,
        guardrails: [pinjection],
      },
      {
        id: "fa-draft",
        kind: "llm",
        name: "claude-sonnet-5 · draft_portfolio_recommendation",
        tone: "warn",
        startMs: 460,
        durationMs: 1620,
        tokens: { input: 5200, output: 940 },
        costUsd: 0.0398,
        guardrails: [piiRedaction, advisoryDisclaimer],
        evalScore: {
          name: "Faithfulness",
          score: 91,
          threshold: 85,
          history: [
            { runId: "run_1", score: 84 },
            { runId: "run_2", score: 88 },
            { runId: "run_3", score: 87 },
          ],
        },
      },
      {
        id: "fa-transfer",
        kind: "tool",
        name: "transfer_funds(account: 4471, amount: 48000.00)",
        tone: "block",
        startMs: 2100,
        durationMs: 40,
        guardrails: [transferScope],
      },
      {
        id: "fa-wait",
        kind: "tool",
        name: "await_human_approval(transfer over authorization limit)",
        tone: "review",
        startMs: 2150,
        durationMs: 1450,
      },
    ],
  },
];

export const WithGuardrailsAndEvalScore: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[880px]">
        <TraceTree
          title="Trace tree"
          runId="run_a30f18"
          spans={financialAdvisorySpans}
          defaultOpenDepth={2}
        />
      </div>
    </div>
  ),
};
