import * as React from "react";
import { useCopy } from "@/lib/copy/index.js";
import { WaterfallChart, type WaterfallSegment } from "../commercial/waterfall-chart.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type OEELossKind = "availability" | "performance" | "quality";

const KIND_TONE: Record<OEELossKind, Tone> = {
  availability: "warn",
  performance: "warn",
  quality: "block",
};

export interface OEELoss {
  label: string;
  kind: OEELossKind;
  /** Minutos perdidos (positivo). */
  minutes: number;
}

export interface OEEWaterfallProps
  extends Omit<React.ComponentProps<typeof WaterfallChart>, "segments" | "startValue" | "title"> {
  title?: string;
  plannedMinutes: number;
  losses: OEELoss[];
}

/**
 * Waterfall de OEE (área F, ISO 22400) — de tiempo planificado a productivo neto
 * restando pérdidas de disponibilidad → rendimiento → calidad. Muestra *dónde*
 * se pierde producción, no solo el número. Wrapper de `WaterfallChart`.
 */
export function OEEWaterfall({
  title,
  plannedMinutes,
  losses,
  valueSuffix = " min",
  ...props
}: OEEWaterfallProps) {
  const t = useCopy();
  const resolvedTitle = title ?? t.oeeWaterfall.title;
  const segments: WaterfallSegment[] = losses.map((l) => ({
    label: l.label,
    delta: -Math.abs(l.minutes),
    tone: KIND_TONE[l.kind],
  }));
  return (
    <WaterfallChart title={resolvedTitle} startValue={plannedMinutes} segments={segments} valueSuffix={valueSuffix} {...props} />
  );
}
