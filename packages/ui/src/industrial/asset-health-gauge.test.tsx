import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AssetHealthGauge } from "./asset-health-gauge.js";

describe("AssetHealthGauge", () => {
  it("renderiza el índice de salud como porcentaje con su label", () => {
    render(<AssetHealthGauge label="Pump P-12" value={85} />);
    expect(screen.getByText("85%")).toBeDefined();
    expect(screen.getByText("Pump P-12")).toBeDefined();
  });

  it("banda healthy (>=70) → tono ok", () => {
    render(<AssetHealthGauge label="A" value={85} />);
    expect(screen.getByText("85%").className).toContain("text-ok");
  });

  it("banda watch (40-69) → tono warn", () => {
    render(<AssetHealthGauge label="A" value={55} />);
    expect(screen.getByText("55%").className).toContain("text-warn");
  });

  it("banda critical (<40) → tono block", () => {
    render(<AssetHealthGauge label="A" value={22} />);
    expect(screen.getByText("22%").className).toContain("text-block");
  });

  it("muestra la tendencia", () => {
    render(<AssetHealthGauge label="A" value={85} trend={3} />);
    expect(screen.getByText(/\+3/)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<AssetHealthGauge label="Pump P-12" value={85} trend={-4} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
