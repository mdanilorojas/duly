import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";

export interface EvalScoreRun {
  runId: string;
  score: number;
}

const toneText: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

const toneChip: Record<Tone, string> = {
  info: "bg-info/15 text-info",
  ok: "bg-ok/15 text-ok",
  review: "bg-review/15 text-review",
  warn: "bg-warn/15 text-warn",
  block: "bg-block/15 text-block",
};

export function scoreTone(score: number, threshold: number): Tone {
  if (score >= threshold) return "ok";
  if (score >= threshold * 0.9) return "warn";
  return "block";
}

function formatScore(score: number, unit: string): string {
  return unit === "%" ? `${Math.round(score)}${unit}` : `${score.toFixed(1)}${unit}`;
}

/**
 * Trend en miniatura de los últimos runs de un eval, con línea punteada del
 * umbral — item #1 de la Prioridad de construcción del NORTH_STAR (área B,
 * "EvalScoreBadge + Sparkline"). Requiere al menos 2 puntos (historial +
 * score actual); con menos, no dibuja nada en vez de un sparkline plano
 * engañoso.
 */
export function EvalScoreSparkline({
  history,
  score,
  threshold,
  tone,
  className,
}: {
  history: EvalScoreRun[];
  score: number;
  threshold: number;
  tone: Tone;
  className?: string;
}) {
  const points = [...history.map((h) => h.score), score];
  if (points.length < 2) return null;

  const w = 100;
  const h = 28;
  const pad = 3;
  const min = Math.min(...points, threshold);
  const max = Math.max(...points, threshold);
  const range = Math.max(max - min, 1);
  const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const toXY = (value: number, i: number) => {
    const x = pad + i * stepX;
    const y = h - pad - ((value - min) / range) * (h - pad * 2);
    return [x, y] as const;
  };
  const coords = points.map((p, i) => toXY(p, i));
  const [lastX, lastY] = coords[coords.length - 1]!;
  const [, thresholdY] = toXY(threshold, 0);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-7 w-full", toneText[tone], className)}
      role="img"
      aria-label={`Score trend over last ${points.length} runs: ${points.map((p) => p.toFixed(1)).join(", ")}. Threshold ${threshold}.`}
    >
      <line
        x1={0}
        x2={w}
        y1={thresholdY}
        y2={thresholdY}
        stroke="currentColor"
        className="text-dim"
        strokeOpacity={0.35}
        strokeWidth={1}
        strokeDasharray="2,2"
      />
      <polyline
        points={coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.25} fill="currentColor" />
    </svg>
  );
}

export interface EvalScoreBadgeProps extends React.ComponentProps<"div"> {
  /** Nombre del eval, ej. "Faithfulness", "Answer relevance". */
  name: string;
  /** Score actual. */
  score: number;
  /** Umbral mínimo aceptable — mismo rango que `score`. */
  threshold: number;
  /** Unidad mostrada junto al score. Por defecto "/100". */
  unit?: string;
  /** Historial cronológico de runs previos (sin incluir el actual). */
  history?: EvalScoreRun[];
}

/**
 * Score de un eval vs su umbral, con flecha de regresión respecto al run
 * anterior y sparkline de tendencia — item #1 de la Prioridad de
 * construcción del NORTH_STAR (área B). Reutiliza el vocabulario de 5 tonos
 * ya establecido por `TraceTree`/`TokenCostMeter`: bajo el umbral es
 * "block", cerca (90–100% del umbral) es "warn" — nunca solo un color de
 * "malo" binario.
 */
export function EvalScoreBadge({
  name,
  score,
  threshold,
  unit = "/100",
  history = [],
  className,
  ...props
}: EvalScoreBadgeProps) {
  const tone = scoreTone(score, threshold);
  const previous = history.length > 0 ? history[history.length - 1]!.score : null;
  const delta = previous !== null ? score - previous : null;

  let DeltaIcon = Minus;
  let deltaTone: Tone = "info";
  let deltaLabel = "No prior run";
  if (delta !== null) {
    if (delta > 0.5) {
      DeltaIcon = TrendingUp;
      deltaTone = "ok";
      deltaLabel = `+${delta.toFixed(1)} vs last run`;
    } else if (delta < -0.5) {
      DeltaIcon = TrendingDown;
      deltaTone = tone === "ok" ? "warn" : "block";
      deltaLabel = `${delta.toFixed(1)} vs last run — regression`;
    } else {
      DeltaIcon = Minus;
      deltaTone = "info";
      deltaLabel = "No change vs last run";
    }
  }

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-header px-3.5 py-2">
        <span className="min-w-0 truncate text-[11px] font-extrabold uppercase tracking-wide text-dim">
          {name}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            toneChip[deltaTone],
          )}
          title={deltaLabel}
        >
          <DeltaIcon className="size-2.5" aria-hidden /> {deltaLabel}
        </span>
      </div>

      <div className="px-3.5 py-3">
        <div className="flex items-baseline gap-2">
          <span className={cn("font-mono text-2xl font-extrabold", toneText[tone])}>
            {formatScore(score, unit)}
          </span>
          <span className="font-mono text-[11px] text-dim">threshold {formatScore(threshold, unit)}</span>
        </div>

        <EvalScoreSparkline history={history} score={score} threshold={threshold} tone={tone} className="mt-3" />
      </div>
    </div>
  );
}
