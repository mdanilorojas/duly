import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { MutualActionPlanBoard, type Milestone } from "./mutual-action-plan-board.js";

const NOW = "2026-07-03T00:00:00Z";
const milestones: Milestone[] = [
  { id: "m1", title: "Security review", owner: "Buyer IT", side: "buyer", due: "2026-06-20", status: "todo" },
  { id: "m2", title: "Redlines returned", owner: "Legal", side: "seller", due: "2026-07-10", status: "in-progress" },
  { id: "m3", title: "Kickoff", owner: "CS", side: "seller", due: "2026-07-15", status: "blocked", dependsOn: ["m1"] },
];

describe("MutualActionPlanBoard", () => {
  it("renderiza los hitos con su dueño y lado", () => {
    render(<MutualActionPlanBoard milestones={milestones} now={NOW} />);
    expect(screen.getByText("Security review")).toBeDefined();
    expect(screen.getByText(/comprador/i)).toBeDefined();
    expect(screen.getAllByText(/vendedor/i).length).toBeGreaterThanOrEqual(1);
  });

  it("marca overdue un hito vencido no completado", () => {
    render(<MutualActionPlanBoard milestones={milestones} now={NOW} />);
    // m1 vence 2026-06-20 < now y está todo → overdue
    const row = screen.getByText("Security review").closest("li") as HTMLElement;
    expect(within(row).getByText(/vencid/i)).toBeDefined();
  });

  it("un hito bloqueado por dependencia se ve como bloqueado", () => {
    render(<MutualActionPlanBoard milestones={milestones} now={NOW} />);
    const row = screen.getByText("Kickoff").closest("li") as HTMLElement;
    expect(within(row).getByText(/bloquead/i)).toBeDefined();
  });

  it("marcar completado dispara onToggle con el id", async () => {
    const onToggle = vi.fn();
    render(<MutualActionPlanBoard milestones={milestones} now={NOW} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: /security review/i }));
    expect(onToggle).toHaveBeenCalledWith("m1");
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<MutualActionPlanBoard milestones={milestones} now={NOW} onToggle={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
