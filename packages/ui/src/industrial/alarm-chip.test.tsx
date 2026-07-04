import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AlarmChip } from "./alarm-chip.js";

describe("AlarmChip", () => {
  it("comunica prioridad con texto, no solo color (colorblind-safe)", () => {
    render(<AlarmChip priority="critical" state="unack" />);
    expect(screen.getByText(/critical/i)).toBeDefined();
  });

  it("expone prioridad + estado en el nombre accesible", () => {
    render(<AlarmChip priority="high" state="shelved" />);
    expect(screen.getByLabelText(/high/i)).toBeDefined();
    expect(screen.getByLabelText(/shelved|silenciad/i)).toBeDefined();
  });

  it("distingue unack de ack (estado, no solo color)", () => {
    const { rerender } = render(<AlarmChip priority="medium" state="unack" />);
    const unack = screen.getByRole("status").getAttribute("aria-label");
    rerender(<AlarmChip priority="medium" state="ack" />);
    const ack = screen.getByRole("status").getAttribute("aria-label");
    expect(unack).not.toEqual(ack);
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <div>
        <AlarmChip priority="critical" state="unack" />
        <AlarmChip priority="high" state="ack" />
        <AlarmChip priority="medium" state="rtn" />
        <AlarmChip priority="low" state="shelved" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
