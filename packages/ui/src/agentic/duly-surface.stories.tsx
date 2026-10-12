import type { Meta, StoryObj } from "@storybook/react";
import example from "./duly-surface.example.json";
import { DulySurface } from "./duly-surface.js";

const meta: Meta<typeof DulySurface> = {
  title: "Agentic/Demo/Duly Surface",
  component: DulySurface,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof DulySurface>;

/** Valid catalog surface. compose_surface returns this layout and its reviewer hash. */
export const Valid: Story = {
  render: () => (
    <div data-theme="cockpit" className="min-h-screen bg-bg-base p-6 md:p-10">
      <DulySurface message={example} />
    </div>
  ),
};

/** A required approval field is missing. The host shows the failure and does not invent the card. */
export const BadProps: Story = {
  render: () => (
    <div data-theme="cockpit" className="min-h-screen bg-bg-base p-6 md:p-10">
      <DulySurface
        message={{
          version: "1",
          catalogId: "duly://catalog/v1",
          surfaceId: "bad-props",
          theme: "cockpit",
          root: "gate",
          components: [
            {
              id: "gate",
              component: {
                ApprovalGate: {
                  agent: "TREASURY",
                  riskTone: "warn",
                  riskLabel: "High risk",
                },
              },
            },
          ],
        }}
      />
    </div>
  ),
};

function catalogNode(id: string) {
  const node = example.components.find((entry) => entry.id === id);
  if (!node) throw new Error(`Missing sample node ${id}`);
  return node;
}

/** Catalog ApprovalGate on its own, so the human gate is the whole story. */
export const ApprovalGate: Story = {
  render: () => (
    <div data-theme="cockpit" className="min-h-screen bg-bg-base p-6 md:p-10">
      <DulySurface
        message={{
          version: "1",
          catalogId: "duly://catalog/v1",
          surfaceId: "approval-gate",
          theme: "cockpit",
          root: "layout",
          components: [{ id: "layout", component: { Column: { children: ["gate"] } } }, catalogNode("gate")],
        }}
      />
    </div>
  ),
};

/** Catalog RichToolCall on its own: tool name, args, and result blocks. */
export const ToolCall: Story = {
  render: () => (
    <div data-theme="cockpit" className="min-h-screen bg-bg-base p-6 md:p-10">
      <DulySurface
        message={{
          version: "1",
          catalogId: "duly://catalog/v1",
          surfaceId: "tool-call",
          theme: "cockpit",
          root: "layout",
          components: [{ id: "layout", component: { Column: { children: ["tool"] } } }, catalogNode("tool")],
        }}
      />
    </div>
  ),
};

/** A component outside the catalog stays visible as a fallback and is not injected as HTML. */
export const UnknownComponent: Story = {
  render: () => (
    <div data-theme="light" className="min-h-screen bg-bg-base p-6 md:p-10">
      <DulySurface
        message={{
          version: "1",
          catalogId: "duly://catalog/v1",
          surfaceId: "unknown-component",
          theme: "light",
          root: "raw",
          components: [{ id: "raw", component: { RawHtml: { html: "<b>nope</b>" } } }],
        }}
      />
    </div>
  ),
};
