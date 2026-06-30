import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./button.js";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: /guardar/i })).toBeDefined();
  });

  it("disabled prevents click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button disabled onClick={onClick}>Guardar</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("asChild renders as anchor", () => {
    render(<Button asChild><a href="/ruta">Ir</a></Button>);
    expect(screen.getByRole("link", { name: /ir/i })).toBeDefined();
  });

  it("variant=destructive has data-variant attribute", () => {
    render(<Button variant="destructive">Eliminar</Button>);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("data-variant")).toBe("destructive");
  });

  it("axe: no violations", async () => {
    const { container } = render(<Button>Acción</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
