import * as React from "react";
import { Brain, Bot, Wrench, Search, ChevronRight } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";
import { toneChip } from "./approval-gate-card.js";
import { GuardrailChip, type GuardrailPolicy } from "./guardrail-indicator.js";
import { scoreTone, type EvalScoreRun } from "./eval-score-badge.js";

export type SpanKind = "llm" | "tool" | "agent" | "retrieval";

export interface TraceSpan {
  id: string;
  kind: SpanKind;
  /** Nombre del span, ej. "gpt-... completion" o "search_knowledge_base". */
  name: string;
  /** Tono de outcome del span (por defecto "info" — no todos los spans fallan/tienen riesgo). */
  tone?: Tone;
  /** Offset desde el inicio del run, en ms — posiciona la barra en el waterfall. */
  startMs: number;
  /** Duración propia del span, en ms — ancho de la barra en el waterfall. */
  durationMs: number;
  tokens?: { input: number; output: number };
  /** Costo propio del span (no incluye hijos) en USD. */
  costUsd?: number;
  /** Guardrail checks evaluados en este span (ej. output guardrail tras un LLM call). */
  guardrails?: GuardrailPolicy[];
  /** Eval score adjunto a este span (ej. faithfulness tras una llamada RAG). */
  evalScore?: { name: string; score: number; threshold: number; history?: EvalScoreRun[] };
  children?: TraceSpan[];
}

const kindIcon: Record<SpanKind, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  llm: Brain,
  tool: Wrench,
  agent: Bot,
  retrieval: Search,
};

const kindLabel: Record<SpanKind, string> = {
  llm: "LLM",
  tool: "Tool",
  agent: "Agent",
  retrieval: "Retrieval",
};

const kindBar: Record<SpanKind, string> = {
  llm: "bg-review",
  tool: "bg-info",
  agent: "bg-ok",
  retrieval: "bg-warn",
};

const toneText: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

function rollup(span: TraceSpan): { tokensIn: number; tokensOut: number; costUsd: number } {
  let tokensIn = span.tokens?.input ?? 0;
  let tokensOut = span.tokens?.output ?? 0;
  let costUsd = span.costUsd ?? 0;
  for (const child of span.children ?? []) {
    const r = rollup(child);
    tokensIn += r.tokensIn;
    tokensOut += r.tokensOut;
    costUsd += r.costUsd;
  }
  return { tokensIn, tokensOut, costUsd };
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function formatCost(usd: number): string {
  if (usd === 0) return "—";
  return usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(2)}`;
}

function EvalScoreChip({ evalScore }: { evalScore: NonNullable<TraceSpan["evalScore"]> }) {
  const tone = scoreTone(evalScore.score, evalScore.threshold);
  return (
    <span
      title={`${evalScore.name}: ${evalScore.score}/${evalScore.threshold} threshold`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide",
        toneChip[tone],
      )}
    >
      {evalScore.name} {evalScore.score.toFixed(0)}
    </span>
  );
}

interface SpanRowProps {
  span: TraceSpan;
  depth: number;
  totalDurationMs: number;
  defaultOpenDepth: number;
}

function SpanRow({ span, depth, totalDurationMs, defaultOpenDepth }: SpanRowProps) {
  const [open, setOpen] = React.useState(depth < defaultOpenDepth);
  const hasChildren = (span.children?.length ?? 0) > 0;
  const Icon = kindIcon[span.kind];
  const tone: Tone = span.tone ?? "info";
  const { tokensIn, tokensOut, costUsd } = rollup(span);
  const hasTokens = tokensIn > 0 || tokensOut > 0;

  // Waterfall bar: posición/ancho relativos a la duración total del run, con
  // un piso de 2% de ancho para que spans muy cortos (ej. 4ms de un 8s run)
  // sigan siendo clicables/visibles en vez de desaparecer a 0px.
  const leftPct = totalDurationMs > 0 ? (span.startMs / totalDurationMs) * 100 : 0;
  const widthPct = totalDurationMs > 0 ? Math.max((span.durationMs / totalDurationMs) * 100, 2) : 100;
  const hasBadges = (span.guardrails?.length ?? 0) > 0 || !!span.evalScore;

  const row = (
    <>
    <div
      className="grid grid-cols-[minmax(0,1fr)_120px_72px_88px] items-center gap-3 py-1.5 pr-2 sm:grid-cols-[minmax(0,1fr)_160px_84px_96px]"
      style={{ paddingLeft: `${depth * 18 + 8}px` }}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {hasChildren ? (
          <Collapsible.Trigger
            aria-label={open ? `Collapse ${span.name}` : `Expand ${span.name}`}
            className="flex size-5 shrink-0 items-center justify-center rounded text-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className={cn("size-3.5 transition-transform duration-base ease-standard", open && "rotate-90")} aria-hidden />
          </Collapsible.Trigger>
        ) : (
          <span className="size-5 shrink-0" aria-hidden />
        )}
        <span
          aria-hidden
          className={cn("flex size-5 shrink-0 items-center justify-center rounded", toneText[tone])}
        >
          <Icon className="size-3.5" aria-hidden />
        </span>
        <span className="font-mono text-[8.5px] font-bold uppercase tracking-wide text-dim shrink-0">
          {kindLabel[span.kind]}
        </span>
        <span className="min-w-0 truncate font-mono text-[12px] text-ink">{span.name}</span>
      </div>

      <div className="relative hidden h-4 rounded bg-bg-elevated sm:block" aria-hidden>
        <span
          className={cn("absolute top-0 h-4 rounded", kindBar[span.kind])}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>

      <span className="shrink-0 text-right font-mono text-[11px] text-dim">{formatMs(span.durationMs)}</span>

      <span className="shrink-0 text-right font-mono text-[11px] text-dim">
        {costUsd > 0 ? (
          <>
            <span className={hasChildren ? "text-ink" : undefined}>{formatCost(costUsd)}</span>
            {hasTokens ? (
              <span className="ml-1 hidden text-dim/70 md:inline">
                {tokensIn.toLocaleString()}→{tokensOut.toLocaleString()}
              </span>
            ) : null}
          </>
        ) : (
          "—"
        )}
      </span>
    </div>
    {hasBadges ? (
      <div
        className="flex flex-wrap items-center gap-1.5 pb-1.5"
        style={{ paddingLeft: `${depth * 18 + 8 + 27}px` }}
      >
        {span.guardrails?.map((g) => <GuardrailChip key={g.id} policy={g} />)}
        {span.evalScore ? <EvalScoreChip evalScore={span.evalScore} /> : null}
      </div>
    ) : null}
    </>
  );

  if (!hasChildren) {
    return <li>{row}</li>;
  }

  return (
    <li>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        {row}
        <Collapsible.Content asChild>
          <ul>
            {span.children!.map((child) => (
              <SpanRow
                key={child.id}
                span={child}
                depth={depth + 1}
                totalDurationMs={totalDurationMs}
                defaultOpenDepth={defaultOpenDepth}
              />
            ))}
          </ul>
        </Collapsible.Content>
      </Collapsible.Root>
    </li>
  );
}

export interface TraceTreeProps extends React.ComponentProps<"div"> {
  title?: string;
  /** Id del run mostrado como hint, ej. "run_8f21a0". */
  runId?: string;
  spans: TraceSpan[];
  /**
   * Cuántos niveles de profundidad empiezan expandidos (0 = todo colapsado
   * salvo raíces). Por defecto 2.
   */
  defaultOpenDepth?: number;
}

/**
 * Árbol de spans anidados (LLM/tool/agente/retrieval) de un run, con costo y
 * tokens acumulados por rama (rollup) y una barra tipo waterfall/flame-graph
 * que ubica cada span en el tiempo total del run — item #1 de la "Prioridad
 * de construcción" del NORTH_STAR: `TraceLog`/`ExecutionTimeline` no anidan
 * spans ni suman costo, y "costo y tokens como UI de primera clase" es el
 * principio #2 de credibilidad enterprise.
 *
 * Un span opcionalmente carga `guardrails` (policy checks) y `evalScore`
 * (score vs umbral) — se renderizan como chips compactos justo debajo del
 * span, reutilizando `GuardrailChip`/`scoreTone` para exponer policy checks
 * y regresión de eval en el mismo vocabulario de tono que el costo (nueva
 * prioridad #1 del NORTH_STAR, área B).
 */
export function TraceTree({
  title = "Trace",
  runId,
  spans,
  defaultOpenDepth = 2,
  className,
  ...props
}: TraceTreeProps) {
  const totals = React.useMemo(() => {
    let tokensIn = 0;
    let tokensOut = 0;
    let costUsd = 0;
    let maxEnd = 0;
    for (const span of spans) {
      const r = rollup(span);
      tokensIn += r.tokensIn;
      tokensOut += r.tokensOut;
      costUsd += r.costUsd;
      maxEnd = Math.max(maxEnd, span.startMs + span.durationMs);
    }
    return { tokensIn, tokensOut, costUsd, totalDurationMs: maxEnd };
  }, [spans]);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)} {...props}>
      <div className="flex flex-col gap-2 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
          {runId ? <span className="min-w-0 truncate font-mono text-[11px] text-dim">{runId}</span> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-dim">
          <span>{formatMs(totals.totalDurationMs)} total</span>
          <span className="text-ink font-semibold">{formatCost(totals.costUsd)}</span>
          <span>{(totals.tokensIn + totals.tokensOut).toLocaleString()} tok</span>
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1fr)_120px_72px_88px] gap-3 border-b border-border-subtle px-4 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wide text-dim sm:grid sm:grid-cols-[minmax(0,1fr)_160px_84px_96px]">
        <span style={{ paddingLeft: "27px" }}>Span</span>
        <span>Timeline</span>
        <span className="text-right">Duration</span>
        <span className="text-right">Cost</span>
      </div>

      {spans.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-dim">No spans recorded for this run.</div>
      ) : (
        <ul className="px-2 py-2">
          {spans.map((span) => (
            <SpanRow
              key={span.id}
              span={span}
              depth={0}
              totalDurationMs={totals.totalDurationMs}
              defaultOpenDepth={defaultOpenDepth}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
