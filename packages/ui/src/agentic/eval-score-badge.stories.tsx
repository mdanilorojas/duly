import type { Meta, StoryObj } from "@storybook/react";
import { EvalScoreBadge, type EvalScoreRun } from "./eval-score-badge.js";

const meta: Meta<typeof EvalScoreBadge> = {
  title: "Agentic/Eval Score Badge/V001 Puntaje vs umbral",
  component: EvalScoreBadge,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof EvalScoreBadge>;

const improvingHistory: EvalScoreRun[] = [
  { runId: "run_1", score: 78 },
  { runId: "run_2", score: 81 },
  { runId: "run_3", score: 79 },
  { runId: "run_4", score: 85 },
  { runId: "run_5", score: 89 },
];

export const PassingWithImprovement: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xs">
        <EvalScoreBadge name="Faithfulness" score={94} threshold={80} history={improvingHistory} />
      </div>
    </div>
  ),
};

const droppingHistory: EvalScoreRun[] = [
  { runId: "run_1", score: 91 },
  { runId: "run_2", score: 90 },
  { runId: "run_3", score: 88 },
  { runId: "run_4", score: 84 },
  { runId: "run_5", score: 79 },
];

/**
 * Score cayó bajo el umbral respecto al run anterior — la flecha de
 * regresión (item explícito del NORTH_STAR: "flechas de regresión") usa
 * tono `block` porque el score actual ya no cumple, no solo `warn` por la
 * dirección de la caída.
 */
export const Regression: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xs">
        <EvalScoreBadge name="Groundedness" score={71} threshold={80} history={droppingHistory} />
      </div>
    </div>
  ),
};

export const NearThreshold: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xs">
        <EvalScoreBadge
          name="Answer relevance"
          score={73}
          threshold={80}
          history={[
            { runId: "run_1", score: 82 },
            { runId: "run_2", score: 80 },
            { runId: "run_3", score: 75 },
          ]}
        />
      </div>
    </div>
  ),
};

export const NoHistoryYet: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xs">
        <EvalScoreBadge name="Toxicity (inverse)" score={98} threshold={90} />
      </div>
    </div>
  ),
};

// Panel tipo LangSmith/dashboard de evals: varios scores del mismo run lado
// a lado — el patrón real en que este primitive vive en producción.
export const EvalPanel: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <EvalScoreBadge name="Faithfulness" score={94} threshold={80} history={improvingHistory} unit="/100" />
        <EvalScoreBadge name="Groundedness" score={71} threshold={80} history={droppingHistory} unit="/100" />
        <EvalScoreBadge
          name="PII leakage (inverse)"
          score={99.6}
          threshold={99}
          history={[
            { runId: "run_1", score: 99.1 },
            { runId: "run_2", score: 99.4 },
          ]}
          unit="%"
        />
        <EvalScoreBadge
          name="Answer relevance"
          score={73}
          threshold={80}
          history={[
            { runId: "run_1", score: 82 },
            { runId: "run_2", score: 80 },
            { runId: "run_3", score: 75 },
          ]}
        />
      </div>
    </div>
  ),
};
