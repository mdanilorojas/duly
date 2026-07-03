import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { ApprovalChainStepper, type ApprovalStep } from "./approval-chain-stepper.js";

const steps: ApprovalStep[] = [
  { approver: "María Chen", role: "Team Lead", decision: "approved", at: "10:02" },
  { approver: "Deal Desk", role: "Finance", decision: "rejected", at: "10:31", note: "Descuento fuera de política" },
  { approver: "VP Sales", role: "Executive", decision: "pending" },
];

describe("ApprovalChainStepper", () => {
  it("renderiza cada paso con aprobador y decisión", () => {
    render(<ApprovalChainStepper steps={steps} />);
    expect(screen.getByText("María Chen")).toBeDefined();
    expect(screen.getByText("Deal Desk")).toBeDefined();
    expect(screen.getByText("VP Sales")).toBeDefined();
  });

  it("la decisión se comunica con texto, no solo color (colorblind-safe)", () => {
    render(<ApprovalChainStepper steps={steps} />);
    expect(screen.getByText(/aprobó/i)).toBeDefined();
    expect(screen.getByText(/rechazó/i)).toBeDefined();
    expect(screen.getByText(/pendiente/i)).toBeDefined();
  });

  it("un rechazo corta la cadena: los pasos posteriores se marcan como no alcanzados", () => {
    render(<ApprovalChainStepper steps={steps} />);
    // VP Sales viene después del rechazo de Deal Desk
    const vp = screen.getByText("VP Sales").closest("li");
    expect(vp).not.toBeNull();
    expect(within(vp as HTMLElement).getByText(/no alcanzad/i)).toBeDefined();
  });

  it("muestra la nota de rechazo", () => {
    render(<ApprovalChainStepper steps={steps} />);
    expect(screen.getByText(/fuera de política/i)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<ApprovalChainStepper steps={steps} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
