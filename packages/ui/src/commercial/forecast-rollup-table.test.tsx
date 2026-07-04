import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ForecastRollupTable, type ForecastRow } from "./forecast-rollup-table.js";

const rows: ForecastRow[] = [
  {
    id: "m1",
    owner: "West Region",
    level: "manager",
    commit: 800000,
    bestCase: 1200000,
    pipeline: 2400000,
    closed: 750000,
    quota: 1000000,
    delta: 50000,
    children: [
      { id: "r1", owner: "Ana", level: "rep", commit: 300000, bestCase: 450000, pipeline: 900000, closed: 280000, quota: 400000, delta: 20000 },
      { id: "r2", owner: "Ben", level: "rep", commit: 500000, bestCase: 750000, pipeline: 1500000, closed: 470000, quota: 600000, delta: -30000 },
    ],
  },
];

describe("ForecastRollupTable", () => {
  it("muestra las filas de nivel superior", () => {
    render(<ForecastRollupTable rows={rows} caption="Forecast" />);
    expect(screen.getByText("West Region")).toBeDefined();
  });

  it("las filas hijas están colapsadas por defecto y se revelan al expandir", async () => {
    render(<ForecastRollupTable rows={rows} caption="Forecast" />);
    expect(screen.queryByText("Ana")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /expandir/i }));
    expect(screen.getByText("Ana")).toBeDefined();
    expect(screen.getByText("Ben")).toBeDefined();
  });

  it("calcula el attainment (closed / quota) por fila", () => {
    render(<ForecastRollupTable rows={rows} caption="Forecast" />);
    // West: 750000 / 1000000 = 75%
    expect(screen.getByText("75%")).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<ForecastRollupTable rows={rows} caption="Forecast" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
