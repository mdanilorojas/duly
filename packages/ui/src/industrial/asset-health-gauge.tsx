import * as React from "react";
import { RatioGauge } from "../commercial/ratio-gauge.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export interface AssetHealthGaugeProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: string;
  /** Índice de salud 0–100. */
  value: number;
  /** Cambio vs medición previa (para la tendencia). */
  trend?: number;
}

function healthTone(v: number): Tone {
  if (v >= 70) return "ok";
  if (v >= 40) return "warn";
  return "block";
}

/**
 * Medidor de salud de activo (área F) — índice 0–100 con bandas healthy(≥70)/
 * watch(40–69)/critical(<40) y tendencia. Rueda sensores + mantenimiento en un
 * número de triage a nivel de flota. Reusa la primitiva compartida `RatioGauge`.
 */
export function AssetHealthGauge({ label, value, trend, ...props }: AssetHealthGaugeProps) {
  const hint =
    trend != null ? `${trend >= 0 ? "▲" : "▼"} ${trend >= 0 ? "+" : ""}${trend} vs previo` : `${value} / 100`;
  return (
    <RatioGauge label={label} value={value} target={100} format="pct" tone={healthTone(value)} hint={hint} {...props} />
  );
}
