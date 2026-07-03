import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type RatioFormat = "pct" | "x" | "usd";

export interface RatioGaugeProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: string;
  value: number;
  target: number;
  format?: RatioFormat;
  /** Tono explícito; si se omite se deriva del ratio vs target. */
  tone?: Tone;
  /** Sub-etiqueta opcional bajo el titular. */
  hint?: string;
}

const TXT: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};
const BAR: Record<Tone, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

function formatValue(value: number, target: number, format: RatioFormat): string {
  const ratio = target > 0 ? value / target : 0;
  if (format === "x") return `${ratio.toFixed(1)}x`;
  if (format === "usd") return `$${value.toLocaleString()}`;
  return `${Math.round(ratio * 100)}%`;
}

/**
 * Medidor de ratio — primitiva compartida del ladder (consolidación notada en
 * el gap analysis): la reusan `QuotaAttainmentGauge`/`PipelineCoverageGauge`
 * (área E) y `AssetHealthGauge` (área F). Muestra un valor relativo a un target
 * con barra y tono por umbral (o tono explícito). Titular `tabular-nums`.
 */
export function RatioGauge({
  label,
  value,
  target,
  format = "pct",
  tone,
  hint,
  className,
  ...props
}: RatioGaugeProps) {
  const ratio = target > 0 ? value / target : 0;
  const resolvedTone: Tone = tone ?? (ratio >= 1 ? "ok" : ratio >= 0.7 ? "warn" : "block");
  const barPct = Math.round(Math.min(100, Math.max(0, ratio * 100)));
  const headline = formatValue(value, target, format);

  return (
    <div
      className={cn("flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-2 p-3", className)}
      {...props}
    >
      <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">{label}</span>
      <span className={cn("font-mono text-2xl font-semibold tabular-nums leading-none", TXT[resolvedTone])}>
        {headline}
      </span>
      <div
        role="progressbar"
        aria-label={`${label}: ${headline}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={barPct}
        className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
      >
        <div className={cn("h-full rounded-full", BAR[resolvedTone])} style={{ width: `${barPct}%` }} />
      </div>
      <span className="font-mono text-[10px] text-faint tabular-nums">
        {hint ?? `${value.toLocaleString()} / ${target.toLocaleString()}`}
      </span>
    </div>
  );
}
