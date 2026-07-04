import type { Meta, StoryObj } from "@storybook/react";
import { OEEWaterfall, type OEELoss } from "./oee-waterfall.js";

const meta: Meta<typeof OEEWaterfall> = {
  title: "Industrial/V001 OEE Waterfall",
  component: OEEWaterfall,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const losses: OEELoss[] = [
  { label: "Setup & adj.", kind: "availability", minutes: 45 },
  { label: "Breakdowns", kind: "availability", minutes: 30 },
  { label: "Minor stops", kind: "performance", minutes: 38 },
  { label: "Reduced speed", kind: "performance", minutes: 22 },
  { label: "Rework", kind: "quality", minutes: 18 },
];

export const ShiftOEE: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[640px]">
        <OEEWaterfall title="OEE · Turno A" plannedMinutes={480} losses={losses} />
      </div>
    </div>
  ),
};
