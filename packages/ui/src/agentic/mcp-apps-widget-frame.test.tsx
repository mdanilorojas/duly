import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { MCPAppsWidgetFrame, type SandboxConfig } from "./mcp-apps-widget-frame.js";

// El AppRenderer real se carga en diferido → en jsdom queda en el fallback de
// Suspense (no monta el iframe). Testeamos el frame temado + a11y; el render real
// se verifica en Storybook con un proxy de sandbox.
const sandbox = { url: new URL("https://sandbox.example.com/proxy.html") } as SandboxConfig;

describe("MCPAppsWidgetFrame", () => {
  it("enmarca la app con un nombre accesible basado en el tool", () => {
    render(<MCPAppsWidgetFrame toolName="predio_viewer" sandbox={sandbox} html="<div>hi</div>" />);
    expect(screen.getByRole("group", { name: /MCP App: predio_viewer/i })).toBeDefined();
  });

  it("muestra estado de carga mientras el renderer se carga en diferido", () => {
    render(<MCPAppsWidgetFrame toolName="x" sandbox={sandbox} />);
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it("respeta un label explícito", () => {
    render(<MCPAppsWidgetFrame toolName="x" sandbox={sandbox} label="Visor de predios" />);
    expect(screen.getByRole("group", { name: "Visor de predios" })).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<MCPAppsWidgetFrame toolName="predio_viewer" sandbox={sandbox} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
