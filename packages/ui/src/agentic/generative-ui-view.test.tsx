import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import cockpitDocument from "./cockpit.generative.json";
import { GENERATIVE_UI_HOST_COMPONENTS, GenerativeUiView, type GenerativeUiDocument } from "./generative-ui-view.js";

const document = cockpitDocument as GenerativeUiDocument;

function componentsIn(nodes: GenerativeUiDocument["nodes"]): string[] {
  const names: string[] = [];
  for (const node of nodes ?? []) {
    if (node.component) names.push(node.component);
    names.push(...componentsIn(node.children));
  }
  return names;
}

describe("GenerativeUiView", () => {
  it("renders the cockpit document with Duly regions", () => {
    render(<GenerativeUiView document={document} />);
    expect(screen.getByRole("heading", { level: 1, name: "Agent operations" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Workflow run" })).toBeTruthy();
    expect(screen.getByRole("log", { name: "Run events" })).toBeTruthy();
    expect(screen.getByText("Prompt injection")).toBeTruthy();
    expect(screen.getByText("This run")).toBeTruthy();
    expect(document.theme).toBe("cockpit");
    const used = new Set(componentsIn(document.nodes));
    for (const name of used) expect(GENERATIVE_UI_HOST_COMPONENTS).toContain(name);
  });

  it("approves a high-risk request from the keyboard", async () => {
    const user = userEvent.setup();
    render(<GenerativeUiView document={document} />);
    const row = screen.getByRole("button", { name: /revert checkout-service to v2\.41\.0/i });
    row.focus();
    await user.keyboard("{Enter}");
    const approve = screen.getByRole("button", { name: "Approve" });
    approve.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Revert checkout-service to v2.41.0. Approved.")).toBeTruthy();
  });

  it("asks for a second confirmation before a critical approval", async () => {
    const user = userEvent.setup();
    render(<GenerativeUiView document={document} />);
    const row = screen.getByRole("button", { name: /send vendor payment of \$4,800/i });
    await user.click(row);
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.queryByText(/Send vendor payment of \$4,800\. Approved\./)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(await screen.findByText("Send vendor payment of $4,800. Approved.")).toBeTruthy();
  });

  it("shows an unknown component instead of dropping it", () => {
    const { container } = render(
      <GenerativeUiView
        document={{
          version: "1",
          auditId: "bad-doc",
          theme: "light",
          locale: "en",
          title: "Broken emission",
          nodes: [{ id: "raw", component: "RawHtml", props: { html: "nope" } }],
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Broken emission" })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/RawHtml/);
    expect(container.querySelector("[data-theme='light']")).toBeTruthy();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<GenerativeUiView document={document} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
