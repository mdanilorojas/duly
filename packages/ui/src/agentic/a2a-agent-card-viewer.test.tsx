import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { A2AAgentCardViewer, type A2AAgentCard } from "./a2a-agent-card-viewer.js";

const card: A2AAgentCard = {
  name: "Invoice Reconciler",
  description: "Concilia facturas contra el ERP.",
  url: "https://agents.acme.com/invoice/.well-known/agent.json",
  version: "1.4.0",
  provider: "Acme",
  authRequired: true,
  skills: [
    { id: "reconcile", name: "Reconcile invoice", description: "Match invoice to PO" },
    { id: "flag", name: "Flag anomaly" },
  ],
  inputModes: ["text", "application/json"],
  outputModes: ["application/json"],
};

describe("A2AAgentCardViewer", () => {
  it("muestra nombre, endpoint y skills (discovery A2A)", () => {
    render(<A2AAgentCardViewer card={card} />);
    expect(screen.getByText("Invoice Reconciler")).toBeDefined();
    expect(screen.getByText(/\.well-known\/agent\.json/)).toBeDefined();
    expect(screen.getByText("Reconcile invoice")).toBeDefined();
    expect(screen.getByText("Flag anomaly")).toBeDefined();
  });

  it("indica cuando requiere autenticación", () => {
    render(<A2AAgentCardViewer card={card} />);
    expect(screen.getByText(/auth|autenticaci/i)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<A2AAgentCardViewer card={card} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
