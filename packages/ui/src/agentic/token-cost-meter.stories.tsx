import type { Meta, StoryObj } from "@storybook/react";
import { TokenCostMeter } from "./token-cost-meter.js";

const meta: Meta<typeof TokenCostMeter> = {
  title: "Agentic/Token Cost Meter/V001 Atribución de presupuesto",
  component: TokenCostMeter,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof TokenCostMeter>;

// Mismo run_2c9f41 de Agentic/Trace Tree (research swarm) — el desglose por
// categoría (Model/Tools/Retrieval) es la vista agregada que TraceTree no da
// de un vistazo: cuánto costó el run y en qué se fue, no solo el total.
export const WithinBudget: S = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[420px]">
        <TokenCostMeter
          title="Run cost — run_2c9f41"
          budgetUsd={1.0}
          tokensIn={33390}
          tokensOut={3170}
          breakdown={[
            { label: "Model", costUsd: 0.4533, tone: "review" },
            { label: "Tools", costUsd: 0.0015, tone: "info" },
            { label: "Retrieval", costUsd: 0.0003, tone: "warn" },
          ]}
        />
      </div>
    </div>
  ),
};

export const OverBudget: S = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[420px]">
        <TokenCostMeter
          title="Run cost — run_44a1f2"
          budgetUsd={0.5}
          tokensIn={128400}
          tokensOut={9800}
          breakdown={[
            { label: "Model", costUsd: 0.612, tone: "review" },
            { label: "Tools", costUsd: 0.031, tone: "info" },
            { label: "Retrieval", costUsd: 0.008, tone: "warn" },
          ]}
        />
      </div>
    </div>
  ),
};

// Meter sin presupuesto configurado — vista mínima para dashboards donde el
// costo se reporta sin umbral (ej. exploración, no producción con budget cap).
export const NoBudgetConfigured: S = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[420px]">
        <TokenCostMeter
          title="Run cost — run_8f21c0"
          tokensIn={4010}
          tokensOut={544}
          breakdown={[
            { label: "Model", costUsd: 0.0196, tone: "review" },
            { label: "Tools", costUsd: 0.0005, tone: "info" },
          ]}
        />
      </div>
    </div>
  ),
};

export const AggregatedFleetSpend: S = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[420px]">
        <TokenCostMeter
          title="Fleet spend — last 24h"
          budgetUsd={250}
          tokensIn={18_400_000}
          tokensOut={1_260_000}
          breakdown={[
            { label: "Model", costUsd: 142.3, tone: "review" },
            { label: "Tools", costUsd: 18.6, tone: "info" },
            { label: "Retrieval", costUsd: 6.1, tone: "warn" },
          ]}
        />
      </div>
    </div>
  ),
};
