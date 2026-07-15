import type { Meta, StoryObj } from "@storybook/react";
import "@xyflow/react/dist/style.css";
import { AgentTopologyGraph, type AgentNode, type AgentEdge } from "./agent-topology-graph.js";

const meta: Meta<typeof AgentTopologyGraph> = {
  title: "Agentic/Orchestration/V001 Grafo de topología de agentes",
  component: AgentTopologyGraph,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

// Patrón supervisor→worker (Anthropic orchestrator-worker): un orquestador
// delega en especialistas; el edge activo (dashed animado) es el hop en curso.
const nodes: AgentNode[] = [
  { id: "sup", label: "Research Supervisor", role: "orchestrator", status: "running", tokens: 41200, costUsd: 0.88, position: { x: 210, y: 10 } },
  { id: "ret", label: "Retriever", role: "worker", status: "success", tokens: 9100, costUsd: 0.06, position: { x: 20, y: 170 } },
  { id: "web", label: "Web Search", role: "tool", status: "running", tokens: 4300, costUsd: 0.02, position: { x: 210, y: 170 } },
  { id: "syn", label: "Synthesizer", role: "worker", status: "waiting", tokens: 0, costUsd: 0, position: { x: 400, y: 170 } },
  { id: "rev", label: "Human Reviewer", role: "human", status: "waiting", position: { x: 210, y: 320 } },
];
const edges: AgentEdge[] = [
  { id: "e1", source: "sup", target: "ret", active: false },
  { id: "e2", source: "sup", target: "web", active: true, label: "querying" },
  { id: "e3", source: "sup", target: "syn" },
  { id: "e4", source: "syn", target: "rev" },
];

type S = StoryObj<typeof AgentTopologyGraph>;

export const SupervisorWorkers: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[720px]">
        <AgentTopologyGraph
          nodes={nodes}
          edges={edges}
          ariaLabel="Flota de investigación"
          onSelect={(id) => console.log("select", id)}
        />
      </div>
    </div>
  ),
};

export const RosterOnly: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[420px]">
        <AgentTopologyGraph nodes={nodes} edges={edges} rosterOnly ariaLabel="Roster de agentes" />
      </div>
    </div>
  ),
};
