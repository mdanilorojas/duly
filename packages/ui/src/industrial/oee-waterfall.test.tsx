import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { OEEWaterfall, type OEELoss } from "./oee-waterfall.js";

const losses: OEELoss[] = [
  { label: "Availability", kind: "availability", minutes: 60 },
  { label: "Performance", kind: "performance", minutes: 40 },
  { label: "Quality", kind: "quality", minutes: 20 },
];

describe("OEEWaterfall", () => {
  it("renderiza las pérdidas y el tiempo productivo neto", () => {
    render(<OEEWaterfall plannedMinutes={480} losses={losses} />);
    const table = screen.getByRole("table", { name: /oee/i });
    expect(within(table).getByText("Availability")).toBeDefined();
    // 480 − 60 − 40 − 20 = 360
    const finalRow = within(table).getByText("Final").closest("tr") as HTMLElement;
    expect(within(finalRow).getByText(/360/)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<OEEWaterfall plannedMinutes={480} losses={losses} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
