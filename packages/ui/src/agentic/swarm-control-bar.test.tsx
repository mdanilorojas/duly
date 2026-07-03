import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SwarmControlBar } from "./swarm-control-bar.js";

describe("SwarmControlBar", () => {
  it("running muestra Pause y Cancel, no Resume", () => {
    render(<SwarmControlBar state="running" />);
    expect(screen.getByRole("button", { name: /pausar/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDefined();
    expect(screen.queryByRole("button", { name: /reanudar/i })).toBeNull();
  });

  it("paused muestra Resume", () => {
    render(<SwarmControlBar state="paused" />);
    expect(screen.getByRole("button", { name: /reanudar/i })).toBeDefined();
  });

  it("stopping deshabilita las acciones", () => {
    render(<SwarmControlBar state="stopping" onPause={vi.fn()} />);
    const pause = screen.queryByRole("button", { name: /pausar/i });
    // en stopping no hay pause/cancel operables
    expect(pause).toBeNull();
    expect(screen.getByText(/deteniendo/i)).toBeDefined();
  });

  it("onPause / onResume disparan", async () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    const { rerender } = render(<SwarmControlBar state="running" onPause={onPause} />);
    await userEvent.click(screen.getByRole("button", { name: /pausar/i }));
    expect(onPause).toHaveBeenCalled();
    rerender(<SwarmControlBar state="paused" onResume={onResume} />);
    await userEvent.click(screen.getByRole("button", { name: /reanudar/i }));
    expect(onResume).toHaveBeenCalled();
  });

  it("Cancel requiere confirmación antes de disparar onCancel (acción destructiva)", async () => {
    const onCancel = vi.fn();
    render(<SwarmControlBar state="running" onCancel={onCancel} selectionCount={12} />);
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    // aún no
    expect(onCancel).not.toHaveBeenCalled();
    // aparece confirmación
    const confirm = screen.getByRole("button", { name: /confirmar/i });
    await userEvent.click(confirm);
    expect(onCancel).toHaveBeenCalled();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<SwarmControlBar state="running" selectionCount={5} onCancel={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
