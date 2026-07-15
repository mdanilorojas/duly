import type { Meta, StoryObj } from "@storybook/react";
import { ForecastRollupTable, type ForecastRow } from "./forecast-rollup-table.js";

const meta: Meta<typeof ForecastRollupTable> = {
  title: "Comercial/V001 Forecast Rollup Table",
  component: ForecastRollupTable,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const rows: ForecastRow[] = [
  {
    id: "exec",
    owner: "Global Sales",
    level: "exec",
    commit: 4200000,
    bestCase: 6100000,
    pipeline: 14800000,
    closed: 3600000,
    quota: 5000000,
    delta: 220000,
    children: [
      {
        id: "west",
        owner: "West Region",
        level: "manager",
        commit: 2100000,
        bestCase: 3050000,
        pipeline: 7400000,
        closed: 1850000,
        quota: 2500000,
        delta: 120000,
        children: [
          { id: "ana", owner: "Ana Ríos", level: "rep", commit: 700000, bestCase: 1050000, pipeline: 2500000, closed: 640000, quota: 900000, delta: 40000 },
          { id: "ben", owner: "Ben Cho", level: "rep", commit: 1400000, bestCase: 2000000, pipeline: 4900000, closed: 1210000, quota: 1600000, delta: -80000 },
        ],
      },
      {
        id: "east",
        owner: "East Region",
        level: "manager",
        commit: 2100000,
        bestCase: 3050000,
        pipeline: 7400000,
        closed: 1750000,
        quota: 2500000,
        delta: 100000,
        children: [
          { id: "dee", owner: "Dee Park", level: "rep", commit: 2100000, bestCase: 3050000, pipeline: 7400000, closed: 1750000, quota: 2500000, delta: 100000 },
        ],
      },
    ],
  },
];

export const OrgRollup: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[880px]">
        <ForecastRollupTable rows={rows} caption="Forecast · FY26 Q3" defaultExpandedIds={["exec", "west"]} />
      </div>
    </div>
  ),
};
