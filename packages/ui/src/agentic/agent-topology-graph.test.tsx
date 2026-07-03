import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AgentTopologyGraph, type AgentNode, type AgentEdge } from "./agent-topology-graph.js";

const nodes: AgentNode[] = [
  { id: "sup", label: "Supervisor", role: "orchestrator", status: "running", tokens: 12000, costUsd: 0.42 },
  { id: "w1", label: "Retriever", role: "worker", status: "success", tokens: 3000, costUsd: 0.03 },
  { id: "w2", label: "Coder", role: "worker", status: "error", tokens: 8000, costUsd: 0.19 },
];
const edges: AgentEdge[] = [
  { id: "e1", source: "sup", target: "w1", active: true },
  { id: "e2", source: "sup", target: "w2" },
];

describe("AgentTopologyGraph", () => {
  it("renderiza un roster accesible (role=list) con todos los agentes", () => {
    render(<AgentTopologyGraph nodes={nodes} edges={edges} ariaLabel="Flota de agentes" />);
    const list = screen.getByRole("list", { name: /flota de agentes/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByRole("button", { name: /Supervisor/ })).toBeDefined();
    expect(within(list).getByRole("button", { name: /Coder/ })).toBeDefined();
  });

  it("seleccionar un agente del roster llama onSelect con su id", async () => {
    const onSelect = vi.fn();
    render(<AgentTopologyGraph nodes={nodes} edges={edges} onSelect={onSelect} ariaLabel="Flota" />);
    const list = screen.getByRole("list", { name: /flota/i });
    await userEvent.click(within(list).getByRole("button", { name: /Retriever/ }));
    expect(onSelect).toHaveBeenCalledWith("w1");
  });

  it("el estado del agente se comunica con texto, no solo color (role=status)", () => {
    render(<AgentTopologyGraph nodes={nodes} edges={edges} ariaLabel="Flota" />);
    const list = screen.getByRole("list", { name: /flota/i });
    // NodeStatusBadge expone role=status con aria-label del estado
    expect(within(list).getAllByRole("status").length).toBeGreaterThanOrEqual(3);
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <AgentTopologyGraph nodes={nodes} edges={edges} ariaLabel="Flota de agentes" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
