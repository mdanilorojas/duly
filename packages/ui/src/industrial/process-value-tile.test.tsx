import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ProcessValueTile } from "./process-value-tile.js";

describe("ProcessValueTile", () => {
  it("muestra label, valor y unidad", () => {
    render(<ProcessValueTile label="Header pressure" value={48.2} unit="bar" min={0} max={100} />);
    expect(screen.getByText("Header pressure")).toBeDefined();
    expect(screen.getByText(/48.2/)).toBeDefined();
    expect(screen.getByText("bar")).toBeDefined();
  });

  it("dentro de límites: sin color de alarma (grayscale ISA-101)", () => {
    render(<ProcessValueTile label="P" value={50} unit="bar" min={0} max={100} loLimit={10} hiLimit={90} />);
    const value = screen.getByText(/^50/);
    expect(value.className).not.toContain("text-block");
    expect(screen.queryByText(/fuera de límite/i)).toBeNull();
  });

  it("sobre el límite alto: tono block + etiqueta (no solo color)", () => {
    render(<ProcessValueTile label="P" value={95} unit="bar" min={0} max={100} loLimit={10} hiLimit={90} />);
    expect(screen.getByText(/^95/).className).toContain("text-block");
    expect(screen.getByText(/fuera de límite/i)).toBeDefined();
  });

  it("bajo el límite bajo: también fuera de límite", () => {
    render(<ProcessValueTile label="P" value={5} unit="bar" min={0} max={100} loLimit={10} hiLimit={90} />);
    expect(screen.getByText(/fuera de límite/i)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <ProcessValueTile label="Header pressure" value={95} unit="bar" min={0} max={100} setpoint={45} loLimit={10} hiLimit={90} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
