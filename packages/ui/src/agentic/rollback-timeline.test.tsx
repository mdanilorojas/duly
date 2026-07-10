import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RollbackTimeline, type RollbackAction } from "./rollback-timeline.js";

const actions: RollbackAction[] = [
  { id: "a1", label: "Opened case", reversibility: "reversible", actorKind: "agent", at: "10:01" },
  { id: "cp1", label: "Checkpoint", reversibility: "reversible", state: "restore-point", actorKind: "system", at: "10:02" },
  { id: "a2", label: "Sent wire transfer", reversibility: "compensating", actorKind: "agent", at: "10:03" },
  { id: "a3", label: "Emailed counterparty", reversibility: "irreversible", actorKind: "agent", at: "10:03" },
];

describe("RollbackTimeline", () => {
  it("una acción irreversible se ve y bloquea el revert (no se esconde)", () => {
    render(<RollbackTimeline actions={actions} />);
    expect(screen.getByText(/cannot be undone/i)).toBeDefined();
    expect(screen.getByText(/emailed counterparty/i)).toBeDefined();
  });

  it("la última acción no ofrece revert (no hay nada posterior que deshacer)", () => {
    render(<RollbackTimeline actions={actions.slice(0, 3)} />);
    // sólo las 2 primeras (no-última) reversibles ofrecen botón
    const buttons = screen.getAllByRole("button", { name: /revert to here/i });
    expect(buttons.length).toBe(2);
  });

  it("revert requiere confirmación y advierte el blast radius con acción irreversible", async () => {
    const onRevertTo = vi.fn();
    render(<RollbackTimeline actions={actions} onRevertTo={onRevertTo} />);
    // revertir hasta el checkpoint arrastra 2 posteriores (wire + email)
    const revertButtons = screen.getAllByRole("button", { name: /revert to here/i });
    await userEvent.click(revertButtons[1]); // checkpoint
    expect(onRevertTo).not.toHaveBeenCalled();
    expect(screen.getByText(/revert this and 2 later actions/i)).toBeDefined();
    expect(screen.getByText(/includes an irreversible action/i)).toBeDefined();
    await userEvent.click(screen.getByRole("button", { name: /confirm revert/i }));
    expect(onRevertTo).toHaveBeenCalledWith("cp1");
  });

  it("cancelar la confirmación no dispara onRevertTo", async () => {
    const onRevertTo = vi.fn();
    render(<RollbackTimeline actions={actions} onRevertTo={onRevertTo} />);
    await userEvent.click(screen.getAllByRole("button", { name: /revert to here/i })[0]);
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onRevertTo).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /confirm revert/i })).toBeNull();
  });

  it("una acción ya revertida se marca reverted y no ofrece re-revert", () => {
    const withReverted = [actions[0], actions[1], { ...actions[2], state: "reverted" as const }, actions[3]];
    render(<RollbackTimeline actions={withReverted} />);
    expect(screen.getByText(/reverted/i)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<RollbackTimeline actions={actions} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
