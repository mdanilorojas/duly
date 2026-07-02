import type { Meta, StoryObj } from "@storybook/react";
import { AgentGallery } from "./agent-gallery.js";
import { AgentCard } from "./agent-card.js";
import { NEURAL_AGENTS } from "./neural-agents.js";

const meta: Meta<typeof AgentGallery> = {
  title: "Agentic/Agent Gallery/V001 Neural Cores",
  component: AgentGallery,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof AgentGallery>;

export const NeuralCores: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        subtitle="10 WebGL Shaders • Fractional Brownian Motion & SDFs"
      />
    </div>
  ),
};

export const SingleCard: S = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[320px]">
        <AgentCard agent={NEURAL_AGENTS[0]} />
      </div>
    </div>
  ),
};
