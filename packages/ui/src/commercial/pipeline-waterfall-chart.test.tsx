import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { PipelineWaterfallChart, type PipelineChange } from "./pipeline-waterfall-chart.js";

const changes: PipelineChange[] = [
  { label: "Created", kind: "created", delta: 400000 },
  { label: "Expanded", kind: "expanded", delta: 120000 },
  { label: "Slipped", kind: "slipped", delta: -90000 },
  { label: "Lost", kind: "lost", delta: -60000 },
];

describe("PipelineWaterfallChart", () => {
  it("renderiza el desglose con cada cambio y el total acumulado", () => {
    render(<PipelineWaterfallChart startValue={1_000_000} changes={changes} />);
    const table = screen.getByRole("table", { name: /pipeline/i });
    expect(within(table).getByText("Created")).toBeDefined();
    expect(within(table).getByText("Lost")).toBeDefined();
    // total final = 1,000,000 + 400k + 120k − 90k − 60k = 1,370,000
    const finalRow = within(table).getByText("Final").closest("tr") as HTMLElement;
    expect(within(finalRow).getByText(/1,370,000/)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<PipelineWaterfallChart startValue={1_000_000} changes={changes} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
