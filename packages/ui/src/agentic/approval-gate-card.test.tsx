import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ApprovalGateCard } from "./approval-gate-card.js";

const baseProps = {
  action: "Delete 1,204 dormant customer accounts",
  agent: "COMPLIANCE SWEEP AGENT",
  riskLabel: "Critical risk",
  what: "Delete dormant accounts",
  why: "Retention policy expired",
  blastRadius: "1,204 accounts",
  rollback: "None — hard delete",
  requestedAt: "2m ago",
};

describe("ApprovalGateCard — non-blocking risk", () => {
  it("Approve llama onApprove directamente (sin paso de confirmación)", async () => {
    const onApprove = vi.fn();
    render(<ApprovalGateCard {...baseProps} riskTone="review" onApprove={onApprove} />);
    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });
});

describe("ApprovalGateCard — riskTone block (irreversible)", () => {
  it("Approve muestra un paso de confirmación antes de llamar onApprove", async () => {
    const onApprove = vi.fn();
    render(<ApprovalGateCard {...baseProps} riskTone="block" onApprove={onApprove} />);
    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(onApprove).not.toHaveBeenCalled();
    expect(screen.getByText(/can't be undone/i)).toBeDefined();
  });

  it("Cancelar en el paso de confirmación no llama onApprove y vuelve a los 3 botones", async () => {
    const onApprove = vi.fn();
    render(<ApprovalGateCard {...baseProps} riskTone="block" onApprove={onApprove} />);
    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onApprove).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /reject/i })).toBeDefined();
  });

  it("Confirmar en el paso de confirmación llama onApprove", async () => {
    const onApprove = vi.fn();
    render(<ApprovalGateCard {...baseProps} riskTone="block" onApprove={onApprove} />);
    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    // dos botones "Approve" ahora: ninguno queda tras el primer click salvo el de confirmación
    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });
});

describe("ApprovalGateCard — estado en vuelo", () => {
  it("deshabilita las 3 acciones mientras una está pendiente (onApprove async)", async () => {
    let resolve!: () => void;
    const onApprove = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<ApprovalGateCard {...baseProps} riskTone="review" onApprove={onApprove} />);
    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect((screen.getByRole("button", { name: /reject/i }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /escalate/i }) as HTMLButtonElement).disabled).toBe(true);
    resolve();
    await waitFor(() =>
      expect((screen.getByRole("button", { name: /reject/i }) as HTMLButtonElement).disabled).toBe(false),
    );
  });
});

describe("ApprovalGateCard — a11y", () => {
  it("sin violaciones de accesibilidad (axe) en estado pendiente", async () => {
    const { container } = render(<ApprovalGateCard {...baseProps} riskTone="warn" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("sin violaciones de accesibilidad (axe) en el paso de confirmación (riskTone block)", async () => {
    const { container } = render(<ApprovalGateCard {...baseProps} riskTone="block" />);
    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
