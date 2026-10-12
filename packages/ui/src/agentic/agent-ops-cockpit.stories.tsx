import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { AgentOpsCockpit } from "./agent-ops-cockpit.js";

const meta: Meta<typeof AgentOpsCockpit> = {
  title: "Agentic/Demo/Agent Ops Cockpit",
  component: AgentOpsCockpit,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof AgentOpsCockpit>;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="cockpit" className="min-h-screen bg-bg-base p-6 md:p-10">
      {children}
    </div>
  );
}

/** Full cockpit. The payment gate starts open. Play buttons reveal tool calls and the token stream. */
export const Cockpit: Story = {
  render: () => (
    <Shell>
      <AgentOpsCockpit />
    </Shell>
  ),
};

/** Running, waiting, done, and error as labels with an icon. */
export const AgentState: Story = {
  render: () => (
    <Shell>
      <AgentOpsCockpit focus="state" />
    </Shell>
  ),
};

/** Tool name, args summary, and status. Playback starts on open. */
export const ToolCalls: Story = {
  render: () => (
    <Shell>
      <AgentOpsCockpit focus="tools" play />
    </Shell>
  ),
};

/** Approval gate is already open. The decision stays on the page. */
export const HumanApproval: Story = {
  render: () => (
    <Shell>
      <AgentOpsCockpit focus="approval" />
    </Shell>
  ),
};

/** Sample AG-UI token stream. Events append on open. */
export const Streaming: Story = {
  render: () => (
    <Shell>
      <AgentOpsCockpit focus="stream" play />
    </Shell>
  ),
};
