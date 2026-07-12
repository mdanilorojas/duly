import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AlarmBanner, type Alarm } from "./alarm-banner.js";

const alarm: Alarm = {
  id: "a1",
  tag: "PT-101",
  description: "Presión de cabezal sobre límite crítico",
  priority: "critical",
  timestamp: "19:12:04",
};

describe("AlarmBanner", () => {
  it("muestra la alarma de mayor prioridad y el conteo sin reconocer", () => {
    render(<AlarmBanner topAlarm={alarm} unackCount={7} onAck={() => {}} />);
    expect(screen.getByText(/presión de cabezal/i)).toBeDefined();
    expect(screen.getByText("PT-101")).toBeDefined();
    expect(screen.getByText(/7/)).toBeDefined();
  });

  it("reconocer dispara onAck", async () => {
    const onAck = vi.fn();
    render(<AlarmBanner topAlarm={alarm} unackCount={7} onAck={onAck} />);
    await userEvent.click(screen.getByRole("button", { name: /acknowledge/i }));
    expect(onAck).toHaveBeenCalled();
  });

  it("sin alarmas: estado calmo, sin botón de reconocer (ISA-101 grayscale)", () => {
    render(<AlarmBanner unackCount={0} />);
    expect(screen.getByText(/no active alarms/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: /acknowledge/i })).toBeNull();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<AlarmBanner topAlarm={alarm} unackCount={7} onAck={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
