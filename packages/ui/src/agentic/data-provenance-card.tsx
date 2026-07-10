import * as React from "react";
import { Table2, FileText, Search, Plug, UserRound, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { HashBadge } from "./audit-log-table.js";
import { toneChip } from "./approval-gate-card.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

/** Tipo de fuente que alimentó un output de IA. */
export type DataSourceKind = "table" | "document" | "retrieval" | "api" | "user-input";

export interface DataSource {
  kind: DataSourceKind;
  /** Identificador legible de la fuente, ej. "warehouse.transactions" o "policy-handbook.pdf#p12". */
  ref: string;
  /** Cuándo se leyó el dato, ej. "2m ago" o "Jul 9, 2026". */
  retrievedAt?: string;
  /** Frescura legible del dato, ej. "live", "cached 5m", "snapshot Jun 2026". */
  freshness?: string;
  /** Confianza/verificación de la fuente (ok=verificada, warn=stale/parcial, block=no verificada). */
  trust?: Tone;
  /** Hash del snapshot leído — inmutabilidad/reproducibilidad del lineage. */
  hash?: string;
  /** Detalle expandible: rango de filas, query, score de retrieval, endpoint. */
  detail?: string;
}

export interface DataProvenanceCardProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Fuentes que entraron al output, en orden de contribución. */
  sources: DataSource[];
  defaultExpanded?: boolean;
  /** Texto cuando no hay fuentes declaradas — un output sin procedencia es un hallazgo, no un vacío. */
  emptyLabel?: string;
}

interface KindConfig {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export const dataSourceKindConfig: Record<DataSourceKind, KindConfig> = {
  table: { label: "Table", icon: Table2 },
  document: { label: "Document", icon: FileText },
  retrieval: { label: "Retrieval", icon: Search },
  api: { label: "API", icon: Plug },
  "user-input": { label: "User input", icon: UserRound },
};

const dotTone: Record<Tone, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

// Peor tono de la lista = tono resumen de la tarjeta. block > warn > review > ok > info.
const toneRank: Record<Tone, number> = { info: 0, ok: 1, review: 2, warn: 3, block: 4 };
function worstTone(sources: DataSource[]): Tone {
  return sources.reduce<Tone>((worst, s) => {
    const t = s.trust ?? "info";
    return toneRank[t] > toneRank[worst] ? t : worst;
  }, "info");
}

const trustLabel: Record<Tone, string> = {
  info: "declared",
  ok: "verified",
  review: "under review",
  warn: "stale / partial",
  block: "unverified",
};

function SourceChip({ source }: { source: DataSource }) {
  const cfg = dataSourceKindConfig[source.kind];
  const Icon = cfg.icon;
  const trust = source.trust ?? "info";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10.5px] text-dim">
      <Icon className="size-3 shrink-0 text-faint" aria-hidden />
      <span className="truncate text-ink">{source.ref}</span>
      <span
        className={cn("size-1.5 shrink-0 rounded-full", dotTone[trust])}
        aria-hidden
      />
    </span>
  );
}

/**
 * Procedencia de datos — eje "origen de datos" del modelo de confianza. Hermano
 * de `ModelProvenanceCard`: donde aquélla responde "qué modelo/prompt produjo
 * este output" (EU AI Act Art. 12/13), ésta responde "qué DATO lo alimentó" —
 * data lineage: fuente (tabla/documento/retrieval/API/input), frescura,
 * verificación y hash del snapshot leído. Compacto por defecto (fila de chips
 * con dot de confianza); expande al lineage detallado por fuente. Reusa
 * `HashBadge`, `toneChip` y el vocabulario `Tone` del DS.
 */
export function DataProvenanceCard({
  sources,
  defaultExpanded = false,
  emptyLabel = "No declared data sources",
  className,
  ...props
}: DataProvenanceCardProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const bodyId = React.useId();

  if (sources.length === 0) {
    return (
      <div
        className={cn("rounded-xl border border-border-subtle bg-surface-2 p-3", className)}
        {...props}
      >
        <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold", toneChip.warn)}>
          {emptyLabel}
        </span>
      </div>
    );
  }

  const summary = worstTone(sources);
  const label = `${sources.length} source${sources.length === 1 ? "" : "s"}`;

  return (
    <div
      className={cn("rounded-xl border border-border-subtle bg-surface-2 p-3", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold",
            toneChip[summary],
          )}
        >
          <span className={cn("size-1.5 rounded-full", dotTone[summary])} aria-hidden />
          {label} · {trustLabel[summary]}
        </span>

        {sources.slice(0, 3).map((s, i) => (
          <SourceChip key={`${s.ref}-${i}`} source={s} />
        ))}
        {sources.length > 3 ? (
          <span className="font-mono text-[10.5px] text-faint">+{sources.length - 3}</span>
        ) : null}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="ml-auto inline-flex items-center gap-1 rounded font-mono text-[10.5px] text-faint outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
        >
          Lineage
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} aria-hidden />
        </button>
      </div>

      {expanded ? (
        <ul id={bodyId} className="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-3">
          {sources.map((s, i) => {
            const cfg = dataSourceKindConfig[s.kind];
            const Icon = cfg.icon;
            const trust = s.trust ?? "info";
            return (
              <li key={`${s.ref}-${i}`} className="flex gap-2 text-[11.5px]">
                <Icon className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">{cfg.label}</span>
                    <span className="min-w-0 break-words font-mono text-[11.5px] text-ink">{s.ref}</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                        toneChip[trust],
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", dotTone[trust])} aria-hidden />
                      {trustLabel[trust]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-dim">
                    {s.freshness ? (
                      <span className="font-mono text-[10.5px]">
                        <span className="text-faint">freshness</span> {s.freshness}
                      </span>
                    ) : null}
                    {s.retrievedAt ? (
                      <span className="font-mono text-[10.5px]">
                        <span className="text-faint">read</span> {s.retrievedAt}
                      </span>
                    ) : null}
                    {s.hash ? <HashBadge hash={s.hash} /> : null}
                  </div>
                  {s.detail ? <p className="break-words text-dim">{s.detail}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
