import * as React from "react";
import { WaterfallChart, type WaterfallSegment } from "./waterfall-chart.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type MRRKind = "new" | "expansion" | "reactivation" | "contraction" | "churn";

const KIND_TONE: Record<MRRKind, Tone> = {
  new: "ok",
  expansion: "ok",
  reactivation: "review",
  contraction: "warn",
  churn: "block",
};

export interface MRRMovement {
  label: string;
  kind: MRRKind;
  /** Monto con signo (contraction/churn negativos). */
  amount: number;
}

export interface MRRMovementWaterfallProps
  extends Omit<React.ComponentProps<typeof WaterfallChart>, "segments" | "startValue" | "title"> {
  title?: string;
  startMrr: number;
  movements: MRRMovement[];
}

/**
 * Bridge de MRR (área E) — new/expansion/reactivation/contraction/churn entre
 * dos períodos. Wrapper delgado de `WaterfallChart`; la vista canónica de la
 * mecánica de ingresos SaaS, distinta de una línea de MRR.
 */
export function MRRMovementWaterfall({
  title = "Movimiento de MRR",
  startMrr,
  movements,
  valuePrefix = "$",
  ...props
}: MRRMovementWaterfallProps) {
  const segments: WaterfallSegment[] = movements.map((m) => ({
    label: m.label,
    delta: m.amount,
    tone: KIND_TONE[m.kind],
  }));
  return (
    <WaterfallChart title={title} startValue={startMrr} segments={segments} valuePrefix={valuePrefix} {...props} />
  );
}
