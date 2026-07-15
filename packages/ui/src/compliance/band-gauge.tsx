import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";

const SEG_FILL: Record<Tone, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

const NUM_TEXT: Record<Tone, string> = {
  info: "text-dim",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

export interface BandGaugeProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Valor actual, 1..max. */
  value: number;
  /** Total de segmentos. */
  max?: number;
  /** Nombre accesible del meter. */
  label: string;
  /** Texto secundario, ej. "Banda 3 — Partial Readiness" o la regla que produjo el valor. */
  hint?: string;
  /** Tono explícito; si se omite se deriva de value/max (≥.7 ok · ≥.4 warn · <.4 block). */
  tone?: Tone;
}

function bandTone(value: number, max: number): Tone {
  const frac = value / max;
  if (frac >= 0.7) return "ok";
  if (frac >= 0.4) return "warn";
  return "block";
}

/**
 * Escala discreta de N segmentos con número grande (área C) — veredicto de
 * banda (readiness ISO 1–6, madurez, score discreto). Complementa
 * `RatioGauge` (continuo): acá el valor ES uno de N escalones, no un
 * porcentaje. Número + segmentos + hint de texto: el tono nunca es el único
 * canal (colorblind-safe).
 */
export function BandGauge({ value, max = 6, label, hint, tone, className, ...props }: BandGaugeProps) {
  const t = tone ?? bandTone(value, max);
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-4", className)}
      {...props}
    >
      <span className={cn("font-mono text-4xl font-bold leading-none", NUM_TEXT[t])}>
        {value}
        <span className="text-base text-faint">/{max}</span>
      </span>
      <div>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: max }, (_, i) => (
            <span
              key={i}
              data-seg={i < value ? "filled" : "empty"}
              className={cn(
                "h-3.5 w-8 rounded-[2px] border border-border-subtle bg-surface-3",
                i < value && cn(SEG_FILL[t], "border-transparent"),
              )}
            />
          ))}
        </div>
        {hint ? <p className="mt-1.5 text-sm text-dim">{hint}</p> : null}
      </div>
    </div>
  );
}
