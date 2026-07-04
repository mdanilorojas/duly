import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AutonomyModeSwitch } from "./autonomy-mode-switch.js";

describe("AutonomyModeSwitch", () => {
  it("renderiza los cuatro niveles", () => {
    render(<AutonomyModeSwitch value="manual" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /manual/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /advisory/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /supervised/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /full-auto/i })).toBeDefined();
  });

  it("bajar de nivel es inmediato (no requiere confirmación)", async () => {
    const onChange = vi.fn();
    render(<AutonomyModeSwitch value="supervised" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /manual/i }));
    expect(onChange).toHaveBeenCalledWith("manual");
  });

  it("subir de nivel pide confirmación (acción sensible)", async () => {
    const onChange = vi.fn();
    render(<AutonomyModeSwitch value="manual" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /full-auto/i }));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));
    expect(onChange).toHaveBeenCalledWith("full-auto");
  });

  it("disabledAbove deshabilita los niveles por encima del tope", () => {
    render(<AutonomyModeSwitch value="manual" onChange={() => {}} disabledAbove="advisory" />);
    expect((screen.getByRole("button", { name: /supervised/i }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /full-auto/i }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /advisory/i }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<AutonomyModeSwitch value="supervised" onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
