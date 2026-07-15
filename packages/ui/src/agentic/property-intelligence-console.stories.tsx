import type { Meta, StoryObj } from "@storybook/react";
import { PropertyIntelligenceConsole, PARCEL_STATUS_LEGEND } from "./property-intelligence-console.js";
import { AgentGallery } from "./agent-gallery.js";
import { AgentMetric, AgentMetricRow } from "./agent-metric.js";
import { AgentStatusMatrix } from "./agent-status-matrix.js";
import { REAL_ESTATE_AGENTS } from "./real-estate-agents.js";

const meta: Meta<typeof PropertyIntelligenceConsole> = {
  title: "Agentic/Property Intelligence/V001 Consola inmobiliaria",
  component: PropertyIntelligenceConsole,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof PropertyIntelligenceConsole>;

export const FullConsole: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <PropertyIntelligenceConsole />
    </div>
  ),
};

export const AgentRoster: S = {
  name: "Agent roster only",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentGallery
        agents={REAL_ESTATE_AGENTS}
        title="Property Intelligence"
        subtitle="6 agentes · Pipeline de consulta catastral en vivo"
      />
    </div>
  ),
};

export const MetricsRow: S = {
  name: "AgentMetric row",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentMetricRow className="max-w-3xl">
        <AgentMetric label="Predios / request" value="2000" />
        <AgentMetric label="Servidores en vivo" value="3" />
        <AgentMetric label="Latencia p50" value="340" unit="ms" tone="review" />
        <AgentMetric label="Precisión GeoJSON" value="99.4" unit="%" tone="ok" />
        <AgentMetric label="Pendientes revisión" value="7" tone="warn" />
      </AgentMetricRow>
    </div>
  ),
};

export const StatusMatrix: S = {
  name: "AgentStatusMatrix",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="max-w-3xl">
        <AgentStatusMatrix items={PARCEL_STATUS_LEGEND} />
      </div>
    </div>
  ),
};
