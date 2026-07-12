import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy, useFormatCurrency } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export interface CostBreakdownItem {
  /** Categoría de costo, ej. "Model", "Tools", "Retrieval". */
  label: string;
  costUsd: number;
  tone: Tone;
}

const toneBar: Record<Tone, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

const toneText: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

export interface TokenCostMeterProps extends React.ComponentProps<"div"> {
  title?: string;
  /** Costo total del run/periodo agregado — si se omite, se suma `breakdown`. */
  totalCostUsd?: number;
  /** Presupuesto configurado para el umbral visual (warn a 75%, block a 100%). */
  budgetUsd?: number;
  breakdown: CostBreakdownItem[];
  tokensIn?: number;
  tokensOut?: number;
}

/**
 * Costo por run atribuido por categoría (modelo vs tools vs retrieval) con
 * umbral de presupuesto — principio #2 de credibilidad enterprise ("costo y
 * tokens son UI de primera clase, atribuidos por paso — no un reporte
 * enterrado") y #1 de la Prioridad de construcción del NORTH_STAR junto con
 * `TraceTree`. Pensado para vivir en el header de una consola de ops o junto
 * a un `TraceTree` como resumen agregado del mismo run.
 */
export function TokenCostMeter({
  title,
  totalCostUsd,
  budgetUsd,
  breakdown,
  tokensIn,
  tokensOut,
  className,
  ...props
}: TokenCostMeterProps) {
  const t = useCopy();
  const fmt = useFormatCurrency();
  const resolvedTitle = title ?? t.tokenCostMeter.title;
  const total = totalCostUsd ?? breakdown.reduce((sum, item) => sum + item.costUsd, 0);
  const budgetPct = budgetUsd && budgetUsd > 0 ? Math.min((total / budgetUsd) * 100, 100) : null;
  const budgetTone: Tone = budgetUsd
    ? total >= budgetUsd
      ? "block"
      : total >= budgetUsd * 0.75
        ? "warn"
        : "ok"
    : "ok";

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)} {...props}>
      <div className="flex flex-col gap-1 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{resolvedTitle}</span>
        {typeof tokensIn === "number" || typeof tokensOut === "number" ? (
          <span className="font-mono text-[11px] text-dim">
            {(tokensIn ?? 0).toLocaleString()} in → {(tokensOut ?? 0).toLocaleString()} out
          </span>
        ) : null}
      </div>

      <div className="px-4 py-3.5">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-extrabold text-ink">{fmt(total)}</span>
          {budgetUsd ? (
            <span className="font-mono text-[11px] text-dim">
              {t.tokenCostMeter.budgetSuffix(fmt(budgetUsd))}
            </span>
          ) : null}
        </div>

        {breakdown.length > 0 ? (
          <div
            role="img"
            aria-label={`${t.tokenCostMeter.costBreakdown}: ${breakdown
              .map((item) => `${item.label} ${fmt(item.costUsd)}`)
              .join(", ")}`}
            className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-bg-elevated"
          >
            {breakdown.map((item, i) => {
              const pct = total > 0 ? (item.costUsd / total) * 100 : 0;
              return pct > 0 ? (
                <span
                  key={item.label}
                  className={cn(toneBar[item.tone], i > 0 && "border-l border-surface-2")}
                  style={{ width: `${pct}%` }}
                />
              ) : null;
            })}
          </div>
        ) : null}

        {breakdown.length > 0 ? (
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span aria-hidden className={cn("size-2 shrink-0 rounded-full", toneBar[item.tone])} />
                <dt className="font-mono text-[10.5px] uppercase tracking-wide text-dim">{item.label}</dt>
                <dd className={cn("font-mono text-[10.5px] font-semibold", toneText[item.tone])}>
                  {fmt(item.costUsd)}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {budgetPct !== null ? (
          <div className="mt-3.5 border-t border-border-subtle pt-3">
            <div className="mb-1 flex items-center justify-between font-mono text-[10.5px] text-dim">
              <span className="uppercase tracking-wide">{t.tokenCostMeter.budgetUsed}</span>
              <span className={cn("font-semibold", toneText[budgetTone])}>{Math.round(budgetPct)}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={Math.round(budgetPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t.tokenCostMeter.budgetUsed}
              className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated"
            >
              <span
                className={cn("block h-full rounded-full", toneBar[budgetTone])}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
