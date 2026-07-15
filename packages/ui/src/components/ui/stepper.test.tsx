import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Stepper } from "./stepper.js";

const steps = [
  { label: "Acumulación", state: "done" as const },
  { label: "1ª Revisión", state: "current" as const },
  { label: "Feedback", state: "pending" as const },
];

describe("Stepper", () => {
  it("marca exactamente un paso con aria-current=step", () => {
    render(<Stepper steps={steps} />);
    const current = screen
      .getAllByRole("listitem")
      .filter((li) => li.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0]!.textContent).toContain("1ª Revisión");
  });

  it("sin onStepClick no renderiza botones", () => {
    render(<Stepper steps={steps} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("onStepClick solo en pasos done, con su índice", async () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} onStepClick={onStepClick} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]!);
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it("axe limpio", async () => {
    const { container } = render(<Stepper steps={steps} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
