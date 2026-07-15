import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BandGauge } from "./band-gauge.js";

const meta: Meta<typeof BandGauge> = {
  title: "Compliance/Band Gauge/V001 Discrete Bands",
  component: BandGauge,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof BandGauge>;

// Veredicto de banda de una corrida de readiness ISO 27001: banda 3 de 6,
// con la regla que la produjo como hint (procedencia sobre magia).
export const PartialReadiness: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="flex max-w-md flex-col gap-8">
        <BandGauge
          value={3}
          max={6}
          label="Banda de readiness"
          hint="Banda 3 — Partial Readiness · strongFrac=0.46 · coverage=1.00"
        />
        <BandGauge value={5} max={6} label="Banda alta" hint="Banda 5 — Audit Ready" />
        <BandGauge value={1} max={6} label="Banda baja" hint="Banda 1 — Initial" />
      </div>
    </div>
  ),
};
