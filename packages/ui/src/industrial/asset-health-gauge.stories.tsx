import type { Meta, StoryObj } from "@storybook/react";
import { AssetHealthGauge } from "./asset-health-gauge.js";

const meta: Meta<typeof AssetHealthGauge> = {
  title: "Industrial/V001 Asset Health Gauge",
  component: AssetHealthGauge,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

export const Fleet: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto grid max-w-[720px] grid-cols-2 gap-4 sm:grid-cols-4">
        <AssetHealthGauge label="Pump P-12" value={88} trend={2} />
        <AssetHealthGauge label="Compressor C-3" value={64} trend={-6} />
        <AssetHealthGauge label="Motor M-7" value={34} trend={-9} />
        <AssetHealthGauge label="Valve V-21" value={96} trend={0} />
      </div>
    </div>
  ),
};
