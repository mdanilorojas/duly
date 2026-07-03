import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { RatioGauge } from "./ratio-gauge.js";

describe("RatioGauge", () => {
  it("formato pct muestra el ratio como porcentaje", () => {
    render(<RatioGauge label="Attainment" value={85} target={100} format="pct" />);
    expect(screen.getByText("85%")).toBeDefined();
    expect(screen.getByText("Attainment")).toBeDefined();
  });

  it("formato x muestra el ratio como múltiplo (coverage)", () => {
    render(<RatioGauge label="Pipeline coverage" value={32} target={10} format="x" />);
    expect(screen.getByText("3.2x")).toBeDefined();
  });

  it("deriva tono block cuando está muy por debajo del target", () => {
    render(<RatioGauge label="Low" value={50} target={100} format="pct" />);
    const headline = screen.getByText("50%");
    expect(headline.className).toContain("text-block");
  });

  it("respeta un tono explícito", () => {
    render(<RatioGauge label="Forced" value={50} target={100} format="pct" tone="ok" />);
    expect(screen.getByText("50%").className).toContain("text-ok");
  });

  it("expone progreso ARIA", () => {
    render(<RatioGauge label="A" value={85} target={100} format="pct" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("85");
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<RatioGauge label="Attainment" value={85} target={100} format="pct" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
