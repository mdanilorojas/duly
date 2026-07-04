import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { PricingApprovalMatrix, type DiscountTier } from "./pricing-approval-matrix.js";

const tiers: DiscountTier[] = [
  { maxDiscountPct: 10, approverRole: "Rep (auto)", slaHours: 0 },
  { maxDiscountPct: 20, approverRole: "Sales Manager", slaHours: 4 },
  { maxDiscountPct: 30, approverRole: "Deal Desk", slaHours: 12 },
];

describe("PricingApprovalMatrix", () => {
  it("renderiza cada tier con su aprobador", () => {
    render(<PricingApprovalMatrix tiers={tiers} currentDiscount={15} />);
    // Sales Manager aparece en el header (aprobador requerido) y en su fila → getAllByText
    expect(screen.getAllByText(/Sales Manager/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Deal Desk/)).toBeDefined();
  });

  it("marca como activo el tier que cubre el descuento actual", () => {
    render(<PricingApprovalMatrix tiers={tiers} currentDiscount={15} />);
    // 15% cae en el tier ≤20 → Sales Manager es el aprobador requerido
    const active = screen.getByRole("row", { current: "step" });
    expect(active.textContent).toMatch(/Sales Manager/);
  });

  it("un descuento sobre todos los tiers requiere excepción", () => {
    render(<PricingApprovalMatrix tiers={tiers} currentDiscount={42} />);
    expect(screen.getByText(/excepci[oó]n/i)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<PricingApprovalMatrix tiers={tiers} currentDiscount={15} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
