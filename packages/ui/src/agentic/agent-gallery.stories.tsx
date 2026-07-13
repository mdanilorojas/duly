import type { Meta, StoryObj } from "@storybook/react";
import { AgentGallery } from "./agent-gallery.js";
import { AgentCard } from "./agent-card.js";
import { NEURAL_AGENTS } from "./neural-agents.js";
import { LEGAL_AGENTS } from "./legal-agents.js";
import { PETROLEUM_AGENTS } from "./petroleum-agents.js";
import { SOFTWARE_AGENTS } from "./software-agents.js";
import { INDUSTRIAL_AGENTS } from "./industrial-agents.js";

const meta: Meta<typeof AgentGallery> = {
  title: "Agentic/Agent Gallery/V002 By Industry",
  component: AgentGallery,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof AgentGallery>;

export const LegalCompliance: S = {
  name: "Legal & Compliance",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={LEGAL_AGENTS}
        title="Legal & Compliance"
        subtitle="6 WebGL Shaders • Jurisprudencia & Compliance"
      />
    </div>
  ),
};

export const PetroleumEnergy: S = {
  name: "Petróleo & Energía",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={PETROLEUM_AGENTS}
        title="Petróleo & Energía"
        subtitle="6 WebGL Shaders • Oil & Gas Operations"
      />
    </div>
  ),
};

export const SoftwareNetworks: S = {
  name: "Software & Redes",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={SOFTWARE_AGENTS}
        title="Software & Redes"
        subtitle="6 WebGL Shaders • Infra & Networks"
      />
    </div>
  ),
};

export const Industrial: S = {
  name: "Industrial & Logística",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={INDUSTRIAL_AGENTS}
        title="Industrial & Logística"
        subtitle="6 WebGL Shaders • Manufacturing & Logistics"
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
