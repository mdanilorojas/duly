import type { Meta, StoryObj } from "@storybook/react";
import { PipelineWaterfallChart, type PipelineChange } from "./pipeline-waterfall-chart.js";

const meta: Meta<typeof PipelineWaterfallChart> = {
  title: "Commercial/V001 Pipeline Waterfall",
  component: PipelineWaterfallChart,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const changes: PipelineChange[] = [
  { label: "Created", kind: "created", delta: 420000 },
  { label: "Expanded", kind: "expanded", delta: 135000 },
  { label: "Pushed", kind: "pushed", delta: -70000 },
  { label: "Slipped", kind: "slipped", delta: -110000 },
  { label: "Won", kind: "won", delta: -180000 },
  { label: "Lost", kind: "lost", delta: -55000 },
];

export const Q3Change: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[640px]">
        <PipelineWaterfallChart title="Cambio de pipeline · Q3" startValue={1_000_000} changes={changes} />
      </div>
    </div>
  ),
};
