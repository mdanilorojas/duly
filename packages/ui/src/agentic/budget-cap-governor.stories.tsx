import type { Meta, StoryObj } from "@storybook/react";
import { BudgetCapGovernor, type BudgetCap } from "./budget-cap-governor.js";

const meta: Meta<typeof BudgetCapGovernor> = {
  title: "Agentic/Orchestration/V001 Budget Cap Governor",
  component: BudgetCapGovernor,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const caps: BudgetCap[] = [
  { scope: "workflow:research-swarm", label: "Research swarm", spentUsd: 3.12, capUsd: 10 },
  { scope: "agent:web-search", label: "Web Search agent", spentUsd: 0.74, capUsd: 1.0 },
  { scope: "agent:coder", label: "Coder agent", spentUsd: 0.95, capUsd: 1.0 },
  { scope: "action:model-calls", label: "Model calls / hora", spentUsd: 12.0, capUsd: 12.0 },
];

type S = StoryObj<typeof BudgetCapGovernor>;

export const Mixed: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[440px]">
        <BudgetCapGovernor caps={caps} />
      </div>
    </div>
  ),
};
