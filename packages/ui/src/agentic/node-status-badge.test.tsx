import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NodeStatusBadge } from "./node-status-badge.js";

describe("NodeStatusBadge — contador de reintentos", () => {
  it("el spin vive en un overlay, no en el contenedor role=status", () => {
    render(<NodeStatusBadge status="retrying" attempt={[2, 3]} label="Retrying" />);
    const status = screen.getByRole("status");
    expect(status.className).not.toContain("animate-spin");
  });

  it("el contador 2/3 NO es descendiente de un elemento que rota", () => {
    render(<NodeStatusBadge status="retrying" attempt={[2, 3]} label="Retrying" />);
    const counter = screen.getByText("2/3");
    let el: HTMLElement | null = counter.parentElement;
    let hasSpinningAncestor = false;
    while (el) {
      if (String(el.className ?? "").includes("animate-spin")) hasSpinningAncestor = true;
      el = el.parentElement;
    }
    expect(hasSpinningAncestor).toBe(false);
  });

  it("sigue rotando el anillo (overlay con animate-spin) en running/retrying", () => {
    const { container } = render(<NodeStatusBadge status="retrying" attempt={[2, 3]} />);
    // la clase es `motion-safe:animate-spin` (token con prefijo) → selector por substring
    const spinner = container.querySelector('[class*="animate-spin"]');
    expect(spinner).not.toBeNull();
    // el overlay que rota está oculto a AT
    expect(spinner?.getAttribute("aria-hidden")).toBe("true");
  });
});
