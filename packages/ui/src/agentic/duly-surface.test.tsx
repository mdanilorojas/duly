import { CATALOG_COMPONENTS, checkSurface } from "@duly/catalog";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import example from "./duly-surface.example.json";
import { DULY_SURFACE_COMPONENTS, DulySurface } from "./duly-surface.js";

describe("DulySurface", () => {
  it("renders the catalog example and shows the reviewer hash", () => {
    const audit = checkSurface(example);
    expect(audit.ok).toBe(true);
    expect([...DULY_SURFACE_COMPONENTS].sort()).toEqual([...CATALOG_COMPONENTS].sort());
    render(<DulySurface message={example} />);
    expect(screen.getByRole("heading", { level: 1, name: "Checked layout" })).toBeTruthy();
    expect(screen.getByText("Send vendor payment of $4,800")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Approval" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Guardrails" })).toBeTruthy();
    expect(screen.getByText("Prompt injection")).toBeTruthy();
    expect(screen.getByText("Tool scope")).toBeTruthy();
    expect(screen.getByText("This run")).toBeTruthy();
    expect(screen.getByText("transfer_funds")).toBeTruthy();
    expect(screen.getByText("GUARD")).toBeTruthy();
    expect(screen.getByText(audit.surfaceHash ?? "")).toBeTruthy();
  });

  it("asks for a second confirmation before a critical approval", async () => {
    const user = userEvent.setup();
    render(<DulySurface message={example} />);
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.queryByText("Send vendor payment of $4,800. Approved.")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(await screen.findByText("Send vendor payment of $4,800. Approved.")).toBeTruthy();
    expect(screen.getByText("Approved by Demo operator · just now")).toBeTruthy();
  });

  it("shows bad props instead of an unlabeled approval", () => {
    render(
      <DulySurface
        message={{
          version: "1",
          catalogId: "duly://catalog/v1",
          surfaceId: "bad-props",
          theme: "cockpit",
          root: "gate",
          components: [{ id: "gate", component: { ApprovalGate: { agent: "TREASURY", riskTone: "warn" } } }],
        }}
      />,
    );
    expect(screen.getByText(/action: Required/)).toBeTruthy();
    expect(screen.queryByText(/not in the checked layout/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
  });

  it("shows an unknown component instead of dropping it silently", () => {
    const { container } = render(
      <DulySurface
        message={{
          version: "1",
          catalogId: "duly://catalog/v1",
          surfaceId: "unknown-component",
          theme: "light",
          root: "raw",
          components: [{ id: "raw", component: { RawHtml: { html: "<b>nope</b>" } } }],
        }}
      />,
    );
    expect(screen.getByText(/Unknown component "RawHtml"/)).toBeTruthy();
    expect(screen.queryByText(/not in the checked layout/)).toBeNull();
    expect(screen.queryByText("nope")).toBeNull();
    expect(container.querySelector("[data-theme='light']")).toBeTruthy();
  });

  it("has no accessibility violations on the valid surface", async () => {
    const { container } = render(<DulySurface message={example} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
