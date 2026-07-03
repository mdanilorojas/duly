import * as React from "react";
import { WaterfallChart, type WaterfallSegment } from "./waterfall-chart.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type PipelineKind = "created" | "expanded" | "pushed" | "slipped" | "won" | "lost";

const KIND_TONE: Record<PipelineKind, Tone> = {
  created: "ok",
  expanded: "ok",
  won: "ok",
  pushed: "warn",
  slipped: "warn",
  lost: "block",
};

export interface PipelineChange {
  label: string;
  kind: PipelineKind;
  delta: number;
}

export interface PipelineWaterfallChartProps
  extends Omit<React.ComponentProps<typeof WaterfallChart>, "segments" | "startValue" | "title"> {
  title?: string;
  startValue: number;
  changes: PipelineChange[];
}

/**
 * Waterfall de cambio de pipeline (área E) — created/expanded/pushed/slipped/
 * won/lost entre dos fechas. Es un wrapper delgado de `WaterfallChart` que mapea
 * cada kind a un tono del DS. Responde "qué cambió y por qué" — la vista
 * diagnóstica de RevOps.
 */
export function PipelineWaterfallChart({
  title = "Cambio de pipeline",
  startValue,
  changes,
  valuePrefix = "$",
  ...props
}: PipelineWaterfallChartProps) {
  const segments: WaterfallSegment[] = changes.map((c) => ({
    label: c.label,
    delta: c.delta,
    tone: KIND_TONE[c.kind],
  }));
  return (
    <WaterfallChart title={title} startValue={startValue} segments={segments} valuePrefix={valuePrefix} {...props} />
  );
}
