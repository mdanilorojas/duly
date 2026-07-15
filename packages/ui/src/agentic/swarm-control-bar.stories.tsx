import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { SwarmControlBar } from "./swarm-control-bar.js";

const meta: Meta<typeof SwarmControlBar> = {
  title: "Agentic/Orchestration/V001 Barra de control de enjambre",
  component: SwarmControlBar,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

type S = StoryObj<typeof SwarmControlBar>;

const frame = (node: ReactNode) => (
  <div className="min-h-screen bg-bg-base p-10">
    <div className="mx-auto flex max-w-[640px] flex-col gap-4">{node}</div>
  </div>
);

export const States: S = {
  render: () =>
    frame(
      <>
        <SwarmControlBar state="running" selectionCount={12} onPause={() => {}} onCancel={() => {}} />
        <SwarmControlBar state="paused" selectionCount={12} onResume={() => {}} onCancel={() => {}} />
        <SwarmControlBar state="stopping" selectionCount={12} />
        <SwarmControlBar state="running" onPause={() => {}} onCancel={() => {}} />
      </>,
    ),
};
