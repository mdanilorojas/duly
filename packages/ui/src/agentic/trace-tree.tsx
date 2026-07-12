import * as React from "react";
import { Brain, Bot, Wrench, Search, ChevronRight } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/lib/copy/index.js";
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

interface Rollup {
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}

// Un solo pase post-order que memoiza el rollup por span id en `map` —
// reemplaza el `rollup()` recursivo que antes se recalculaba por FILA en
// cada render (O(n²) en árboles profundos: cada fila re-sumaba todo su
// subárbol). Aquí cada span se visita exactamente una vez.
function computeRollups(spans: TraceSpan[], map: Map<string, Rollup>): void {
  for (const span of spans) {
    let tokensIn = span.tokens?.input ?? 0;
    let tokensOut = span.tokens?.output ?? 0;
    let costUsd = span.costUsd ?? 0;
    if (span.children?.length) {
      computeRollups(span.children, map);
      for (const child of span.children) {
        const r = map.get(child.id)!;
        tokensIn += r.tokensIn;
        tokensOut += r.tokensOut;
        costUsd += r.costUsd;
      }
    }
    map.set(span.id, { tokensIn, tokensOut, costUsd });
  }
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

interface VisibleNode {
  span: TraceSpan;
  depth: number;
  hasChildren: boolean;
  hasBadges: boolean;
}

// Aplana el árbol a las filas realmente visibles (respetando colapso) — la
// virtualización necesita conocer de antemano la lista plana, no puede
// operar sobre un render recursivo donde cada nodo decide su propia
// expansión en aislamiento.
function flattenVisible(
  spans: TraceSpan[],
  depth: number,
  collapsed: ReadonlySet<string>,
  out: VisibleNode[],
): void {
  for (const span of spans) {
    const hasChildren = (span.children?.length ?? 0) > 0;
    const hasBadges = (span.guardrails?.length ?? 0) > 0 || !!span.evalScore;
    out.push({ span, depth, hasChildren, hasBadges });
    if (hasChildren && !collapsed.has(span.id)) {
      flattenVisible(span.children!, depth + 1, collapsed, out);
    }
  }
}

function computeInitialCollapsed(spans: TraceSpan[], defaultOpenDepth: number): Set<string> {
  const ids = new Set<string>();
  function walk(list: TraceSpan[], depth: number) {
    for (const span of list) {
      if ((span.children?.length ?? 0) > 0 && depth >= defaultOpenDepth) ids.add(span.id);
      if (span.children?.length) walk(span.children, depth + 1);
    }
  }
  walk(spans, 0);
  return ids;
}

function EvalScoreChip({ evalScore }: { evalScore: NonNullable<TraceSpan["evalScore"]> }) {
  const tone = scoreTone(evalScore.score, evalScore.threshold);
  return (
    <span
      title={`${evalScore.name}: ${evalScore.score}/${evalScore.threshold} threshold`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
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
  rollup: Rollup;
  collapsed: boolean;
  hasChildren: boolean;
  onToggle: (id: string) => void;
}

// Fila de presentación pura — el colapso ya no vive por-fila (era
// incompatible con virtualizar, que necesita saber de antemano cuáles filas
// están visibles); vive una vez en `TraceTree` vía `collapsedIds`.
function SpanRow({ span, depth, totalDurationMs, rollup, collapsed, hasChildren, onToggle }: SpanRowProps) {
  const fmt = useFormatCurrency();
  const Icon = kindIcon[span.kind];
  const tone: Tone = span.tone ?? "info";
  const { tokensIn, tokensOut, costUsd } = rollup;
  const hasTokens = tokensIn > 0 || tokensOut > 0;

  // Waterfall bar: posición/ancho relativos a la duración total del run, con
  // un piso de 2% de ancho para que spans muy cortos (ej. 4ms de un 8s run)
  // sigan siendo clicables/visibles en vez de desaparecer a 0px.
  const leftPct = totalDurationMs > 0 ? (span.startMs / totalDurationMs) * 100 : 0;
  const widthPct = totalDurationMs > 0 ? Math.max((span.durationMs / totalDurationMs) * 100, 2) : 100;
  const hasBadges = (span.guardrails?.length ?? 0) > 0 || !!span.evalScore;

  return (
    <>
      <div
        className="grid grid-cols-[minmax(0,1fr)_120px_72px_88px] items-center gap-3 py-1.5 pe-2 sm:grid-cols-[minmax(0,1fr)_160px_84px_96px]"
        // TODO(rtl): paddingLeft codifica profundidad del árbol — necesita
        // paddingInlineStart o lógica dir-aware, no un rename de clase.
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          {hasChildren ? (
            <button
              type="button"
              aria-label={collapsed ? `Expand ${span.name}` : `Collapse ${span.name}`}
              aria-expanded={!collapsed}
              onClick={() => onToggle(span.id)}
              className="flex size-6 shrink-0 items-center justify-center rounded text-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight
                className={cn("size-3.5 transition-transform duration-base ease-standard", !collapsed && "rotate-90")}
                aria-hidden
              />
            </button>
          ) : (
            <span className="size-6 shrink-0" aria-hidden />
          )}
          <span
            aria-hidden
            className={cn("flex size-5 shrink-0 items-center justify-center rounded", toneText[tone])}
          >
            <Icon className="size-3.5" aria-hidden />
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-dim shrink-0">
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

        <span className="shrink-0 text-end font-mono text-[11px] text-dim">{formatMs(span.durationMs)}</span>

        <span className="shrink-0 text-end font-mono text-[11px] text-dim">
          {costUsd > 0 ? (
            <>
              <span className={hasChildren ? "text-ink" : undefined}>{fmt(costUsd)}</span>
              {hasTokens ? (
                <span className="ms-1 text-dim/70">
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
          // TODO(rtl): mismo caso que el paddingLeft de arriba — depth-indent, no dir-aware.
          style={{ paddingLeft: `${depth * 18 + 8 + 27}px` }}
        >
          {span.guardrails?.map((g) => <GuardrailChip key={g.id} policy={g} />)}
          {span.evalScore ? <EvalScoreChip evalScore={span.evalScore} /> : null}
        </div>
      ) : null}
    </>
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
  /** Alto máximo con scroll interno — requerido para virtualizar árboles grandes. Por defecto 480. */
  maxHeight?: number;
}

// ponytail: no virtualizar árboles chicos — evita el overhead del
// virtualizador y mantiene los tests deterministas (jsdom no mide layout).
// Mismo umbral que DataTable (data-table.tsx: VIRTUAL_THRESHOLD).
const VIRTUAL_THRESHOLD = 50;
// ponytail: estimate de 2 niveles (con/sin badges) en vez de measureElement
// dinámico — mismo enfoque que DataTable (altura fija por variante), sin
// introducir una técnica de virtualización distinta a la ya probada en el
// repo. Ceiling: filas con múltiples guardrails que envuelven a 2+ líneas
// pueden desalinear el scroll levemente; subir a measureElement si eso
// se vuelve visible en la práctica.
const ROW_ESTIMATE = 34;
const BADGES_ROW_ESTIMATE = ROW_ESTIMATE + 26;

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
 *
 * Árboles grandes (>50 filas visibles) se virtualizan vía
 * `@tanstack/react-virtual` sobre una lista aplanada de nodos visibles — el
 * colapso vive a nivel de árbol (`collapsedIds`), no por fila, porque
 * virtualizar exige saber de antemano qué filas están visibles.
 */
export function TraceTree({
  title = "Trace",
  runId,
  spans,
  defaultOpenDepth = 2,
  maxHeight = 480,
  className,
  ...props
}: TraceTreeProps) {
  const fmt = useFormatCurrency();

  const rollups = React.useMemo(() => {
    const map = new Map<string, Rollup>();
    computeRollups(spans, map);
    return map;
  }, [spans]);

  const totals = React.useMemo(() => {
    let tokensIn = 0;
    let tokensOut = 0;
    let costUsd = 0;
    let maxEnd = 0;
    for (const span of spans) {
      const r = rollups.get(span.id)!;
      tokensIn += r.tokensIn;
      tokensOut += r.tokensOut;
      costUsd += r.costUsd;
      maxEnd = Math.max(maxEnd, span.startMs + span.durationMs);
    }
    return { tokensIn, tokensOut, costUsd, totalDurationMs: maxEnd };
  }, [spans, rollups]);

  // El colapso vive una vez por árbol (no por fila, ver SpanRow) y se
  // reinicia a los defaults de `defaultOpenDepth` cuando `spans` cambia de
  // identidad (nuevo run) — patrón documentado de React para derivar estado
  // de props durante el render, sin efecto extra.
  const [prevSpans, setPrevSpans] = React.useState(spans);
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(() =>
    computeInitialCollapsed(spans, defaultOpenDepth),
  );
  if (spans !== prevSpans) {
    setPrevSpans(spans);
    setCollapsedIds(computeInitialCollapsed(spans, defaultOpenDepth));
  }

  function toggle(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleNodes = React.useMemo(() => {
    const out: VisibleNode[] = [];
    flattenVisible(spans, 0, collapsedIds, out);
    return out;
  }, [spans, collapsedIds]);

  const virtualize = visibleNodes.length > VIRTUAL_THRESHOLD;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => (visibleNodes[index].hasBadges ? BADGES_ROW_ESTIMATE : ROW_ESTIMATE),
    overscan: 8,
  });
  const virtualItems = virtualize ? rowVirtualizer.getVirtualItems() : [];

  function renderNode(index: number) {
    const { span, depth, hasChildren } = visibleNodes[index];
    return (
      <SpanRow
        span={span}
        depth={depth}
        totalDurationMs={totals.totalDurationMs}
        rollup={rollups.get(span.id)!}
        collapsed={collapsedIds.has(span.id)}
        hasChildren={hasChildren}
        onToggle={toggle}
      />
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)} {...props}>
      <div className="flex flex-col gap-2 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
          {runId ? <span className="min-w-0 truncate font-mono text-[11px] text-dim">{runId}</span> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-dim">
          <span>{formatMs(totals.totalDurationMs)} total</span>
          <span className="text-ink font-semibold">{totals.costUsd > 0 ? fmt(totals.costUsd) : "—"}</span>
          <span>{(totals.tokensIn + totals.tokensOut).toLocaleString()} tok</span>
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1fr)_120px_72px_88px] gap-3 border-b border-border-subtle px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-dim sm:grid sm:grid-cols-[minmax(0,1fr)_160px_84px_96px]">
        {/* TODO(rtl): paddingLeft fijo alinea con el ancho del ícono/trigger — necesita paddingInlineStart o lógica dir-aware. */}
        <span style={{ paddingLeft: "27px" }}>Span</span>
        <span>Timeline</span>
        <span className="text-end">Duration</span>
        <span className="text-end">Cost</span>
      </div>

      {visibleNodes.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-dim">No spans recorded for this run.</div>
      ) : virtualize ? (
        <div ref={scrollRef} className="overflow-y-auto overflow-x-hidden px-2 py-2" style={{ maxHeight }}>
          <ul style={{ height: rowVirtualizer.getTotalSize(), position: "relative", width: "100%" }}>
            {virtualItems.map((vi) => (
              <li
                key={visibleNodes[vi.index].span.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                {renderNode(vi.index)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="px-2 py-2">
          {visibleNodes.map((node, index) => (
            <li key={node.span.id}>{renderNode(index)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
