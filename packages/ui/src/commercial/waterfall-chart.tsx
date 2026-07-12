import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export interface WaterfallSegment {
  label: string;
  /** Cambio (positivo o negativo) sobre el acumulado. */
  delta: number;
  tone?: Tone;
}

export interface WaterfallBar {
  label: string;
  isTotal: boolean;
  /** Acumulado tras esta barra (o el total, para las barras total). */
  value: number;
  delta?: number;
  from?: number;
  to?: number;
  /** Base flotante para el apilado (min de from/to). */
  base: number;
  height: number;
  tone?: Tone;
}

/**
 * Cálculo puro de un waterfall: parte de `start`, aplica cada delta y produce
 * barras flotantes (base + alto) más barras total de inicio/fin. Es la base
 * reutilizable de `PipelineWaterfallChart`, `MRRMovementWaterfall` y
 * `OEEWaterfall`.
 */
export function computeWaterfallBars(
  start: number,
  segments: WaterfallSegment[],
): { bars: WaterfallBar[]; total: number } {
  const bars: WaterfallBar[] = [
    { label: "Inicio", isTotal: true, value: start, base: 0, height: start },
  ];
  let running = start;
  for (const s of segments) {
    const from = running;
    const to = running + s.delta;
    bars.push({
      label: s.label,
      isTotal: false,
      value: to,
      delta: s.delta,
      from,
      to,
      base: Math.min(from, to),
      height: Math.abs(s.delta),
      tone: s.tone,
    });
    running = to;
  }
  bars.push({ label: "Final", isTotal: true, value: running, base: 0, height: running });
  return { bars, total: running };
}

const LazyRecharts = React.lazy(() => import("./waterfall-chart.recharts.js"));

export interface WaterfallChartProps extends Omit<React.ComponentProps<"div">, "children"> {
  title: string;
  startValue: number;
  segments: WaterfallSegment[];
  valuePrefix?: string;
  valueSuffix?: string;
  height?: number;
}

/**
 * Base de gráficos waterfall del área E/F — item `PipelineWaterfallChart` y
 * reusado por MRR/OEE. Dos representaciones: el gráfico de Recharts (diferido,
 * `aria-hidden`) y una tabla de datos accesible (la representación para AT, ya
 * que el SVG de Recharts no es navegable por lectores de pantalla). Contenedor
 * temado común (ChartFrame) con tokens del DS.
 */
export function WaterfallChart({
  title,
  startValue,
  segments,
  valuePrefix = "",
  valueSuffix = "",
  height = 260,
  className,
  ...props
}: WaterfallChartProps) {
  const t = useCopy();
  const { bars } = computeWaterfallBars(startValue, segments);
  const fmt = (n: number) => `${valuePrefix}${Math.abs(n).toLocaleString("en-US")}${valueSuffix}`;
  const signed = (n: number) => `${n >= 0 ? "+" : "−"}${fmt(n)}`;

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="border-b border-border-subtle bg-surface-header px-4 py-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
      </div>

      <div aria-hidden className="px-2 pt-3" style={{ height }}>
        <React.Suspense
          fallback={<div className="grid h-full place-items-center text-xs text-faint">{t.common.loading}</div>}
        >
          <LazyRecharts bars={bars} valuePrefix={valuePrefix} valueSuffix={valueSuffix} />
        </React.Suspense>
      </div>

      <div className="overflow-x-auto border-t border-border-subtle">
        <table className="w-full border-collapse text-left text-[12px]">
          <caption className="sr-only">{title} — desglose</caption>
          <thead>
            <tr className="border-b border-border-subtle">
              {["Concepto", "Δ", "Acumulado"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-faint"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {bars.map((b) => (
              <tr key={b.label}>
                <td className="px-3 py-1.5 text-ink">{b.label}</td>
                <td
                  className={cn(
                    "px-3 py-1.5 font-mono tabular-nums",
                    b.isTotal
                      ? "text-faint"
                      : (b.delta ?? 0) >= 0
                        ? "text-ok"
                        : "text-block",
                  )}
                >
                  {b.isTotal ? "—" : signed(b.delta ?? 0)}
                </td>
                <td className="px-3 py-1.5 font-mono tabular-nums text-dim">{fmt(b.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
