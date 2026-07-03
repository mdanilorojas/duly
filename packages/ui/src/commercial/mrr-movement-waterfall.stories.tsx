import type { Meta, StoryObj } from "@storybook/react";
import { MRRMovementWaterfall, type MRRMovement } from "./mrr-movement-waterfall.js";

const meta: Meta<typeof MRRMovementWaterfall> = {
  title: "Commercial/V001 MRR Movement Waterfall",
  component: MRRMovementWaterfall,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const movements: MRRMovement[] = [
  { label: "New", kind: "new", amount: 14200 },
  { label: "Expansion", kind: "expansion", amount: 6800 },
  { label: "Reactivation", kind: "reactivation", amount: 1500 },
  { label: "Contraction", kind: "contraction", amount: -3100 },
  { label: "Churn", kind: "churn", amount: -5400 },
];

export const Monthly: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[620px]">
        <MRRMovementWaterfall title="Movimiento de MRR · Junio" startMrr={248000} movements={movements} />
      </div>
    </div>
  ),
};
