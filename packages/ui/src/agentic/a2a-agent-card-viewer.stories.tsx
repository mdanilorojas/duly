import type { Meta, StoryObj } from "@storybook/react";
import { A2AAgentCardViewer, type A2AAgentCard } from "./a2a-agent-card-viewer.js";

const meta: Meta<typeof A2AAgentCardViewer> = {
  title: "Agentic/Orchestration/V001 A2A Agent Card Viewer",
  component: A2AAgentCardViewer,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const card: A2AAgentCard = {
  name: "Invoice Reconciler",
  description: "Concilia facturas contra el ERP y marca anomalías para revisión humana.",
  url: "https://agents.acme.com/invoice/.well-known/agent.json",
  version: "1.4.0",
  provider: "Acme Financial Agents",
  authRequired: true,
  skills: [
    { id: "reconcile", name: "Reconcile invoice", description: "Match invoice líneas a PO" },
    { id: "flag", name: "Flag anomaly", description: "Marca desviaciones > umbral" },
    { id: "export", name: "Export evidence" },
  ],
  inputModes: ["text", "application/json"],
  outputModes: ["application/json"],
};

export const Discovery: StoryObj = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-10">
      <div className="w-full max-w-[420px]">
        <A2AAgentCardViewer card={card} />
      </div>
    </div>
  ),
};
