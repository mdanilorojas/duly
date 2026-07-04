import type { Meta, StoryObj } from "@storybook/react";
import { ProcessValueTile } from "./process-value-tile.js";

const meta: Meta<typeof ProcessValueTile> = {
  title: "Industrial/V001 Process Value Tile",
  component: ProcessValueTile,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

export const Grid: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto grid max-w-[720px] grid-cols-2 gap-4 sm:grid-cols-3">
        <ProcessValueTile label="Header pressure" value={48.2} unit="bar" min={0} max={100} setpoint={45} loLimit={10} hiLimit={90} />
        <ProcessValueTile label="Reactor temp" value={512} unit="°C" min={0} max={600} setpoint={500} loLimit={100} hiLimit={550} />
        <ProcessValueTile label="Feed flow" value={95} unit="m³/h" min={0} max={100} setpoint={60} loLimit={10} hiLimit={90} />
        <ProcessValueTile label="Tank level" value={4} unit="%" min={0} max={100} setpoint={50} loLimit={10} hiLimit={90} />
      </div>
    </div>
  ),
};
