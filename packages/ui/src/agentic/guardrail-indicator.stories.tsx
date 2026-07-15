import type { Meta, StoryObj } from "@storybook/react";
import { GuardrailIndicator, GuardrailChip, type GuardrailPolicy } from "./guardrail-indicator.js";

const meta: Meta<typeof GuardrailIndicator> = {
  title: "Agentic/Guardrail Indicator/V001 Verificación de políticas",
  component: GuardrailIndicator,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof GuardrailIndicator>;

// Vocabulario input/output/tool guardrail de la guía "Guardrails and human
// review" de OpenAI (NORTH_STAR, área B) — un agente de soporte financiero
// que valida la petición del usuario, la respuesta generada y los argumentos
// de una tool call antes de ejecutarla.
const allPassed: GuardrailPolicy[] = [
  {
    id: "g1",
    name: "Prompt injection detection",
    category: "input",
    status: "passed",
    rationale: "No instruction-override patterns found in the user message.",
  },
  {
    id: "g2",
    name: "PII redaction",
    category: "output",
    status: "passed",
    rationale: "Response contains no unmasked account numbers or SSNs.",
  },
  {
    id: "g3",
    name: "Transaction scope check",
    category: "tool",
    status: "passed",
    rationale: "transfer_funds() amount ($240.00) is within the agent's $5,000 authorization limit.",
  },
];

export const AllPassed: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-sm">
        <GuardrailIndicator label="Guardrails" policies={allPassed} />
      </div>
    </div>
  ),
};

const mixedResults: GuardrailPolicy[] = [
  {
    id: "g1",
    name: "Prompt injection detection",
    category: "input",
    status: "passed",
    rationale: "No instruction-override patterns found in the user message.",
  },
  {
    id: "g2",
    name: "Confidence threshold",
    category: "output",
    status: "warned",
    rationale: "Model confidence (0.71) below the 0.85 auto-send threshold — routed for a lighter human skim.",
  },
  {
    id: "g3",
    name: "Regulated financial advice",
    category: "output",
    status: "warned",
    rationale: "Response references investment allocation — appended mandatory disclaimer before send.",
  },
];

export const WithWarnings: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-sm">
        <GuardrailIndicator label="Guardrails" policies={mixedResults} defaultOpen />
      </div>
    </div>
  ),
};

const blockedRun: GuardrailPolicy[] = [
  {
    id: "g1",
    name: "Prompt injection detection",
    category: "input",
    status: "passed",
    rationale: "No instruction-override patterns found in the user message.",
  },
  {
    id: "g2",
    name: "PII exfiltration",
    category: "tool",
    status: "blocked",
    rationale:
      'send_email() call args include a full customer SSN in the body, addressed to an external domain — blocked before execution and routed to security review.',
  },
  {
    id: "g3",
    name: "Toxicity filter",
    category: "output",
    status: "passed",
    rationale: "No toxic or harassing language detected in the generated response.",
  },
];

/**
 * Un guardrail bloqueado nunca se diluye entre los que pasaron — el tono
 * resumen del pill es siempre el peor de la lista (principio #1 del
 * NORTH_STAR: "todo estado está diseñado").
 */
export const Blocked: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-sm">
        <GuardrailIndicator label="Guardrails" policies={blockedRun} defaultOpen />
      </div>
    </div>
  ),
};

export const NoChecksConfigured: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-sm">
        <GuardrailIndicator label="Guardrails" policies={[]} />
      </div>
    </div>
  ),
};

// Uso inline: fila de chips compactos junto a otros metadatos de un run,
// sin el marco de tarjeta completo — el caso de uso real es TraceTree
// embebiéndolos junto al costo de un span.
export const InlineChipsRow: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-4 py-3">
        <span className="mr-1 font-mono text-[10.5px] font-bold uppercase tracking-wide text-dim">
          claude-sonnet-5 · draft_response
        </span>
        {allPassed.map((p) => (
          <GuardrailChip key={p.id} policy={p} />
        ))}
        {mixedResults.filter((p) => p.status === "warned").map((p) => (
          <GuardrailChip key={p.id} policy={p} />
        ))}
      </div>
    </div>
  ),
};
