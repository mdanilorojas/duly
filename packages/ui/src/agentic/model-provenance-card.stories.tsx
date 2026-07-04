import type { Meta, StoryObj } from "@storybook/react";
import {
  ModelProvenanceCard,
  ModelProvenanceChip,
  type ModelProvenance,
} from "./model-provenance-card.js";

const meta: Meta<typeof ModelProvenanceCard> = {
  title: "Agentic/Model Provenance/V001 Model, Prompt, Config Hash",
  component: ModelProvenanceCard,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof ModelProvenanceCard>;

// Salud: agente de resumen clínico — EU AI Act Art. 12/13 exige poder
// identificar exactamente qué modelo/versión/prompt produjo un resumen que
// entra al expediente del paciente.
const clinicalSummary: ModelProvenance = {
  provider: "Anthropic",
  model: "Claude Sonnet 5",
  modelVersion: "claude-sonnet-5-20260630",
  promptVersion: "v6",
  promptLabel: "Discharge summary — cardiology",
  configHash: "sha256:a3f9c2e1",
  params: { temperature: 0.2, topP: 0.9, maxTokens: 2048 },
  generatedAt: "Jul 4, 2026 · 09:14 UTC",
  previousConfigHash: "sha256:a3f9c2e1",
};

export const UnchangedConfig: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-md">
        <ModelProvenanceCard
          subject="Discharge summary · Patient MRN-88213 · Cardiology"
          provenance={clinicalSummary}
        />
      </div>
    </div>
  ),
};

// Servicios financieros: un cambio de config no anunciado entre dos runs
// del mismo prompt de asesoría es exactamente el tipo de drift silencioso
// que un auditor necesita que salte a la vista, no que descubra a mano.
const financialAdvisoryDrifted: ModelProvenance = {
  provider: "Anthropic",
  model: "Claude Opus 4.8",
  modelVersion: "claude-opus-4-8-20260615",
  promptVersion: "v14",
  promptLabel: "Portfolio risk summary",
  configHash: "sha256:7be0d941",
  params: { temperature: 0.4, topP: 0.95, maxTokens: 4096, seed: 1024 },
  generatedAt: "Jul 4, 2026 · 14:02 UTC",
  previousConfigHash: "sha256:2c18aa07",
};

export const ConfigDrift: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-md">
        <ModelProvenanceCard
          subject="Run 4471 · step 3 · Portfolio risk summary"
          provenance={financialAdvisoryDrifted}
        />
      </div>
    </div>
  ),
};

// Software/tech: primer run de un prompt nuevo — sin config anterior con la
// que comparar, el chip de drift simplemente no se muestra en vez de
// forzar un estado "sin cambios" engañoso.
const firstRun: ModelProvenance = {
  provider: "OpenAI",
  model: "GPT-5.1",
  modelVersion: "gpt-5.1-2026-05-20",
  promptVersion: "v1",
  promptLabel: "PR review comment drafting",
  configHash: "sha256:0f61b3aa",
  params: { temperature: 0.3, maxTokens: 1024 },
  generatedAt: "Jul 4, 2026 · 16:47 UTC",
};

export const NoPriorRunToCompare: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-md">
        <ModelProvenanceCard subject="PR 3021 · review comment draft" provenance={firstRun} />
      </div>
    </div>
  ),
};

// Uso inline (principio #8): chip compacto junto a cada output de IA, no
// solo en un panel de detalle dedicado — footer de un mensaje de chat.
export const InlineChipOnOutput: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-lg rounded-xl border border-border-subtle bg-surface-2 p-4">
        <p className="text-[13px] leading-relaxed text-ink">
          Patient presents with resolved acute decompensated heart failure. Discharged on optimized
          GDMT with follow-up scheduled in 7 days. No adverse events during admission.
        </p>
        <div className="mt-3 flex items-center gap-2 border-t border-border-subtle pt-2.5">
          <ModelProvenanceChip provenance={clinicalSummary} />
        </div>
      </div>
    </div>
  ),
};
