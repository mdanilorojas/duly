import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { BudgetCapGovernor, type BudgetCap } from "./budget-cap-governor.js";

const caps: BudgetCap[] = [
  { scope: "agent:retriever", label: "Retriever", spentUsd: 0.35, capUsd: 1.0 }, // 35% ok
  { scope: "agent:coder", label: "Coder", spentUsd: 0.82, capUsd: 1.0 }, // 82% warn
  { scope: "workflow:research", label: "Research WF", spentUsd: 5.0, capUsd: 5.0 }, // 100% block/halted
];

describe("BudgetCapGovernor", () => {
  it("renderiza un medidor por cap con su gasto y tope", () => {
    render(<BudgetCapGovernor caps={caps} />);
    expect(screen.getByText("Retriever")).toBeDefined();
    expect(screen.getByText("Coder")).toBeDefined();
    expect(screen.getByText("Research WF")).toBeDefined();
  });

  it("cada barra expone valores ARIA de progreso (valuemin/max/now)", () => {
    render(<BudgetCapGovernor caps={caps} />);
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(3);
    expect(bars[0].getAttribute("aria-valuenow")).toBe("35");
    expect(bars[0].getAttribute("aria-valuemax")).toBe("100");
  });

  it("cap al 100% se marca como halted", () => {
    render(<BudgetCapGovernor caps={caps} />);
    // el cap de Research WF está en su tope
    expect(screen.getByText(/tope alcanzado|halted/i)).toBeDefined();
  });

  it("llama onBreach para un cap que alcanzó/superó su tope", () => {
    const onBreach = vi.fn();
    render(
      <BudgetCapGovernor
        caps={[{ scope: "x", label: "X", spentUsd: 6, capUsd: 5, onBreach }]}
      />,
    );
    expect(onBreach).toHaveBeenCalled();
  });

  it("no llama onBreach si está por debajo del tope", () => {
    const onBreach = vi.fn();
    render(<BudgetCapGovernor caps={[{ scope: "x", label: "X", spentUsd: 1, capUsd: 5, onBreach }]} />);
    expect(onBreach).not.toHaveBeenCalled();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<BudgetCapGovernor caps={caps} title="Presupuesto" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
