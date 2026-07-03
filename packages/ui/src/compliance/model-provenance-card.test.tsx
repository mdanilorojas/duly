import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ModelProvenanceCard } from "./model-provenance-card.js";

const props = {
  model: "claude-opus-4-8",
  modelVersion: "2026-06-30",
  promptVersion: "v12",
  configHash: "3f9a1c88e0d24b71",
  temperature: 0.7,
  provider: "Anthropic",
};

describe("ModelProvenanceCard", () => {
  it("renderiza modelo, provider y versión de prompt (procedencia)", () => {
    render(<ModelProvenanceCard {...props} />);
    expect(screen.getByText(/claude-opus-4-8/)).toBeDefined();
    expect(screen.getByText(/Anthropic/)).toBeDefined();
    expect(screen.getByText(/v12/)).toBeDefined();
  });

  it("el config hash se muestra truncado con el hash completo en el title", () => {
    render(<ModelProvenanceCard {...props} />);
    const el = screen.getByTitle(/3f9a1c88e0d24b71/);
    expect(el).toBeDefined();
  });

  it("compacto por defecto; expandir revela temperatura y versión de modelo", async () => {
    render(<ModelProvenanceCard {...props} />);
    expect(screen.queryByText(/0\.7/)).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /detalles/i }));
    expect(screen.getByText(/0\.7/)).toBeDefined();
    expect(screen.getByText(/2026-06-30/)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<ModelProvenanceCard {...props} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
