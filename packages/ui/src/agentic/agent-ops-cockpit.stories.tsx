import type { Meta, StoryObj } from "@storybook/react";
import { AgentOpsCockpit } from "./agent-ops-cockpit.js";

const meta: Meta<typeof AgentOpsCockpit> = {
  title: "Agentic/Demo/Agent Ops Cockpit",
  component: AgentOpsCockpit,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof AgentOpsCockpit>;

/** Reference render of the composition described by the Duly MCP server. */
export const Cockpit: Story = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-6 md:p-10">
      <AgentOpsCockpit />
    </div>
  ),
};
