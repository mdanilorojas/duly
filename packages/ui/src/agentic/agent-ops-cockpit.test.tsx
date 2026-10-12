import { describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
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

  it("shows the four agent-UI surfaces", () => {
    render(<AgentOpsCockpit />);
    expect(screen.getByRole("region", { name: "Agent state" })).toBeTruthy();
    for (const label of ["Running", "Waiting", "Done", "Error"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText("lookup_vendor").length).toBeGreaterThan(0);
    expect(screen.getAllByText("vendor=Northwind").length).toBeGreaterThan(0);
    expect(screen.getByText("amount=4800 USD, account=••4419")).toBeTruthy();
    expect(screen.getByRole("log", { name: "Agent stream" })).toHaveTextContent("Invoice NW-2041 matches vendor Northwind.");
    const payment = screen.getByRole("article", { name: /send vendor payment of \$4,800/i });
    expect(within(payment).getByRole("button", { name: "Approve" })).toBeTruthy();
  });

  it("reveals tool calls in order when playback starts", () => {
    vi.useFakeTimers();
    render(<AgentOpsCockpit focus="tools" play />);
    expect(screen.getByText("lookup_vendor")).toBeTruthy();
    expect(screen.queryByText("transfer_funds")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByText("transfer_funds")).toBeTruthy();
    expect(screen.getByText("amount=4800 USD, account=••4419")).toBeTruthy();
    vi.useRealTimers();
  });

  it("appends stream tokens when playback starts", () => {
    vi.useFakeTimers();
    render(<AgentOpsCockpit focus="stream" play />);
    const stream = screen.getByRole("log", { name: "Agent stream" });
    expect(stream).not.toHaveTextContent("Holding the payment until a person decides.");
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(stream).toHaveTextContent("Holding the payment until a person decides.");
    expect(stream).toHaveTextContent("transfer_funds");
    vi.useRealTimers();
  });

  it("approves a high-risk request from the keyboard", async () => {
    const user = userEvent.setup();
    render(<AgentOpsCockpit />);
    const row = screen.getByRole("button", { name: /revert checkout-service to v2\.41\.0/i });
    row.focus();
    expect(row).toHaveFocus();
    await user.keyboard("{Enter}");
    const checkout = screen.getByRole("article", { name: /revert checkout-service/i });
    const approve = within(checkout).getByRole("button", { name: "Approve" });
    approve.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Revert checkout-service to v2.41.0. Approved.")).toBeTruthy();
  });

  it("asks for a second confirmation before a critical approval and keeps the decision", async () => {
    const user = userEvent.setup();
    render(<AgentOpsCockpit />);
    const payment = screen.getByRole("article", { name: /send vendor payment of \$4,800/i });
    await user.click(within(payment).getByRole("button", { name: "Approve" }));
    expect(screen.queryByText(/Send vendor payment of \$4,800\. Approved\./)).toBeNull();
    await user.click(within(payment).getByRole("button", { name: "Approve" }));
    expect(await screen.findByText("Send vendor payment of $4,800. Approved.")).toBeTruthy();
    expect(within(payment).getByText("Approved")).toBeTruthy();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<AgentOpsCockpit />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
