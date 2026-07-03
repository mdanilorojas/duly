import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { MRRMovementWaterfall, type MRRMovement } from "./mrr-movement-waterfall.js";

const movements: MRRMovement[] = [
  { label: "New", kind: "new", amount: 12000 },
  { label: "Expansion", kind: "expansion", amount: 5000 },
  { label: "Contraction", kind: "contraction", amount: -2000 },
  { label: "Churn", kind: "churn", amount: -4000 },
];

describe("MRRMovementWaterfall", () => {
  it("suma los movimientos al MRR final", () => {
    render(<MRRMovementWaterfall startMrr={100000} movements={movements} />);
    const table = screen.getByRole("table", { name: /MRR/i });
    // 100000 + 12000 + 5000 − 2000 − 4000 = 111000
    const finalRow = within(table).getByText("Final").closest("tr") as HTMLElement;
    expect(within(finalRow).getByText(/111,000/)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<MRRMovementWaterfall startMrr={100000} movements={movements} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
