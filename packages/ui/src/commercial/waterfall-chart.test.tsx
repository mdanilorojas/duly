import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { computeWaterfallBars, WaterfallChart, type WaterfallSegment } from "./waterfall-chart.js";

describe("computeWaterfallBars", () => {
  it("acumula deltas y termina en start + Σdelta", () => {
    const { bars, total } = computeWaterfallBars(100, [
      { label: "Nuevos", delta: 50 },
      { label: "Churn", delta: -30 },
    ]);
    expect(total).toBe(120);
    // primer y último bar son totales
    expect(bars[0].isTotal).toBe(true);
    expect(bars[bars.length - 1].isTotal).toBe(true);
    expect(bars[bars.length - 1].value).toBe(120);
  });

  it("posiciona cada barra entre su from y to", () => {
    const { bars } = computeWaterfallBars(100, [{ label: "a", delta: 50 }, { label: "b", delta: -30 }]);
    const a = bars.find((b) => b.label === "a")!;
    expect(a.from).toBe(100);
    expect(a.to).toBe(150);
    const b = bars.find((x) => x.label === "b")!;
    expect(b.from).toBe(150);
    expect(b.to).toBe(120);
  });
});

const segments: WaterfallSegment[] = [
  { label: "Created", delta: 40000, tone: "ok" },
  { label: "Slipped", delta: -15000, tone: "warn" },
  { label: "Lost", delta: -8000, tone: "block" },
];

describe("WaterfallChart", () => {
  it("renderiza una tabla de datos accesible (chart aria-hidden)", () => {
    render(<WaterfallChart title="Pipeline Δ" startValue={100000} segments={segments} valuePrefix="$" />);
    const table = screen.getByRole("table", { name: /Pipeline/i });
    // start + 3 segmentos + end = 5 filas de datos
    expect(within(table).getAllByRole("row").length).toBeGreaterThanOrEqual(5);
    expect(within(table).getByText("Created")).toBeDefined();
    expect(within(table).getByText("Lost")).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <WaterfallChart title="Pipeline" startValue={100000} segments={segments} valuePrefix="$" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
