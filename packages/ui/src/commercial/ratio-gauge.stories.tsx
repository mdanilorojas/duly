import type { Meta, StoryObj } from "@storybook/react";
import { RatioGauge } from "./ratio-gauge.js";

const meta: Meta<typeof RatioGauge> = {
  title: "Commercial/V001 Ratio Gauge",
  component: RatioGauge,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

type S = StoryObj<typeof RatioGauge>;

export const Grid: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto grid max-w-[720px] grid-cols-2 gap-4 sm:grid-cols-4">
        <RatioGauge label="Quota attainment" value={1_020_000} target={1_000_000} format="pct" hint="$1.02M / $1.0M" />
        <RatioGauge label="Attainment" value={620_000} target={1_000_000} format="pct" hint="$620K / $1.0M" />
        <RatioGauge label="Pipeline coverage" value={3_200_000} target={1_000_000} format="x" hint="3.2× gap" />
        <RatioGauge label="Coverage" value={900_000} target={1_000_000} format="x" hint="0.9× gap" />
      </div>
    </div>
  ),
};
