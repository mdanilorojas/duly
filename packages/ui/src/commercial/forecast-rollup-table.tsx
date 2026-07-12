import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, type ColumnDef } from "../data-table/data-table.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export interface ForecastRow {
  id: string;
  owner: string;
  /** rep / manager / exec (u otro). */
  level: string;
  commit: number;
  bestCase: number;
  pipeline: number;
  closed: number;
  quota: number;
  /** Cambio vs submission previa. */
  delta?: number;
  children?: ForecastRow[];
}

type FlatRow = ForecastRow & { _depth: number; _hasChildren: boolean; _expanded: boolean };

function flatten(rows: ForecastRow[], expanded: Set<string>, depth = 0): FlatRow[] {
  const out: FlatRow[] = [];
  for (const r of rows) {
    const hasChildren = !!r.children?.length;
    const isExpanded = expanded.has(r.id);
    out.push({ ...r, _depth: depth, _hasChildren: hasChildren, _expanded: isExpanded });
    if (hasChildren && isExpanded) out.push(...flatten(r.children!, expanded, depth + 1));
  }
  return out;
}

const TXT: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

function money(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${sign}$${Math.round(a / 1e3)}K`;
  return `${sign}$${a}`;
}

function attainmentTone(pct: number): Tone {
  return pct >= 1 ? "ok" : pct >= 0.7 ? "warn" : "block";
}

export interface ForecastRollupTableProps extends Omit<React.ComponentProps<"div">, "children"> {
  rows: ForecastRow[];
  caption?: string;
  /** Ids expandidos por defecto (por defecto todo colapsado). */
  defaultExpandedIds?: string[];
}

/**
 * Roll-up de forecast jerárquico (área E) — rep→manager→exec con commit/
 * best-case/pipeline y delta submitted-vs-current. El artefacto central de toda
 * llamada de forecast enterprise: un roll-up multi-nivel auditable, no una hoja
 * de cálculo. Compuesto sobre `DataTable` (columna vertebral) con filas
 * expandibles; attainment por fila con tono de umbral.
 */
export function ForecastRollupTable({
  rows,
  caption = "Forecast roll-up",
  defaultExpandedIds,
  className,
  ...props
}: ForecastRollupTableProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(defaultExpandedIds ?? []));

  const toggle = React.useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const flat = React.useMemo(() => flatten(rows, expanded), [rows, expanded]);

  const columns = React.useMemo<ColumnDef<FlatRow>[]>(
    () => [
      {
        accessorKey: "owner",
        header: "Owner",
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-1.5" style={{ paddingLeft: r._depth * 16 }}>
              {r._hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(r.id);
                  }}
                  aria-label={r._expanded ? `Colapsar ${r.owner}` : `Expandir ${r.owner}`}
                  aria-expanded={r._expanded}
                  className="inline-flex size-6 items-center justify-center rounded text-faint outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronRight className={cn("size-3.5 transition-transform", r._expanded && "rotate-90")} aria-hidden />
                </button>
              ) : (
                <span className="inline-block w-6" aria-hidden />
              )}
              <span className="truncate font-medium text-ink">{r.owner}</span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-faint">{r.level}</span>
            </div>
          );
        },
      },
      { accessorKey: "commit", header: "Commit", cell: ({ getValue }) => money(Number(getValue())) },
      { accessorKey: "bestCase", header: "Best case", cell: ({ getValue }) => money(Number(getValue())) },
      { accessorKey: "pipeline", header: "Pipeline", cell: ({ getValue }) => money(Number(getValue())) },
      {
        id: "delta",
        header: "Δ",
        enableSorting: false,
        cell: ({ row }) => {
          const d = row.original.delta;
          if (d == null) return "—";
          return <span className={d >= 0 ? "text-ok" : "text-block"}>{d >= 0 ? "+" : "−"}{money(Math.abs(d))}</span>;
        },
      },
      {
        id: "attainment",
        header: "Attain.",
        cell: ({ row }) => {
          const r = row.original;
          const pct = r.quota > 0 ? r.closed / r.quota : 0;
          return (
            <span className={cn("font-semibold tabular-nums", TXT[attainmentTone(pct)])}>
              {Math.round(pct * 100)}%
            </span>
          );
        },
      },
    ],
    [toggle],
  );

  return (
    <DataTable
      className={className}
      data={flat}
      columns={columns}
      getRowId={(r) => r.id}
      caption={caption}
      density="compact"
      rowTone={(r) => (r._depth === 0 ? "info" : undefined)}
      {...props}
    />
  );
}
