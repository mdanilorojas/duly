import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AgentOpsCockpit } from "./agent-ops-cockpit.js";

describe("AgentOpsCockpit", () => {
  it("renders one heading and the sample sections", () => {
    render(<AgentOpsCockpit />);
    expect(screen.getByRole("heading", { level: 1, name: "Agent operations" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Workflow run" })).toBeTruthy();
    expect(screen.getByRole("log", { name: "Run events" })).toBeTruthy();
    expect(screen.getByText("Sample data", { exact: false })).toBeTruthy();
  });

  it("approves a high-risk request from the keyboard", async () => {
    const user = userEvent.setup();
    render(<AgentOpsCockpit />);
    const row = screen.getByRole("button", { name: /revert checkout-service to v2\.41\.0/i });
    row.focus();
    expect(row).toHaveFocus();
    await user.keyboard("{Enter}");
    const approve = screen.getByRole("button", { name: "Approve" });
    approve.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Revert checkout-service to v2.41.0. Approved.")).toBeTruthy();
  });

  it("asks for a second confirmation before a critical approval", async () => {
    const user = userEvent.setup();
    render(<AgentOpsCockpit />);
    const row = screen.getByRole("button", { name: /send vendor payment of \$4,800/i });
    await user.click(row);
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.queryByText(/Send vendor payment of \$4,800\. Approved\./)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(await screen.findByText("Send vendor payment of $4,800. Approved.")).toBeTruthy();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<AgentOpsCockpit />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
