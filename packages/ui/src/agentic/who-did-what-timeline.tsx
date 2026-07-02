import * as React from "react";
import { cn } from "@/lib/utils";
import { actorKindConfig, outcomeLabel, HashBadge, type AuditEvent } from "./audit-log-table.js";
import { toneChip } from "./approval-gate-card.js";

export interface SavedQuery {
  id: string;
  /** Etiqueta del chip, ej. "AI actions only" o "This user, last 30 days". */
  label: string;
  predicate: (event: AuditEvent) => boolean;
}

export interface AuditEventGroup {
  /** Encabezado cronológico, ej. "Today" o "Jun 28, 2026" — el caller decide
   *  el agrupamiento (el componente no calcula fechas para mantenerse
   *  determinístico en Storybook/SSR, mismo criterio que `ageMinutes` en
   *  `HumanInterruptQueue`). */
  label: string;
  events: AuditEvent[];
}

export interface WhoDidWhatTimelineProps extends React.ComponentProps<"div"> {
  title?: string;
  groups: AuditEventGroup[];
  /** Consultas guardadas como chips de un solo toque — principio #10 del
   *  NORTH_STAR ("el auditor se autoservicia"). Sin selección = toda la actividad. */
  savedQueries?: SavedQuery[];
  emptyLabel?: string;
}

/**
 * Feed cronológico de auditoría, filtrable con saved-query chips — item #1
 * de la "Prioridad de construcción" del NORTH_STAR junto a `AuditLogTable`
 * (área C, 0% de cobertura antes de esta versión). Mientras `AuditLogTable`
 * es la vista densa tipo hoja de cálculo, este componente es la vista
 * narrativa: "quién hizo qué, cuándo" agrupada por rango de tiempo, con
 * chips de consulta guardada que un auditor puede tocar una vez para
 * autoservicio (ej. "todas las acciones de IA de este usuario el mes
 * pasado") en vez de armar un filtro desde cero cada vez.
 */
export function WhoDidWhatTimeline({
  title = "Who did what",
  groups,
  savedQueries = [],
  emptyLabel = "No hay actividad para esta consulta guardada.",
  className,
  ...props
}: WhoDidWhatTimelineProps) {
  const [activeQueryId, setActiveQueryId] = React.useState<string | null>(null);
  const activeQuery = savedQueries.find((q) => q.id === activeQueryId) ?? null;

  const allEvents = React.useMemo(() => groups.flatMap((g) => g.events), [groups]);

  const filteredGroups = React.useMemo(() => {
    if (!activeQuery) return groups;
    return groups
      .map((g) => ({ ...g, events: g.events.filter(activeQuery.predicate) }))
      .filter((g) => g.events.length > 0);
  }, [groups, activeQuery]);

  const totalVisible = filteredGroups.reduce((sum, g) => sum + g.events.length, 0);

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-2 border-b border-border-subtle bg-surface-header px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
          <span className="font-mono text-[11px] text-dim">
            {totalVisible} of {allEvents.length}
          </span>
        </div>
        {savedQueries.length > 0 ? (
          <div role="group" aria-label="Saved queries" className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveQueryId(null)}
              aria-pressed={activeQueryId === null}
              className={cn(
                "min-h-[1.75rem] rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide transition-colors",
                activeQueryId === null
                  ? "border-accent-border bg-accent-surface text-ink"
                  : "border-border-subtle text-dim hover:border-border-strong hover:text-ink",
              )}
            >
              All activity
            </button>
            {savedQueries.map((q) => {
              const count = allEvents.filter(q.predicate).length;
              const active = activeQueryId === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveQueryId(active ? null : q.id)}
                  aria-pressed={active}
                  className={cn(
                    "min-h-[1.75rem] rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide transition-colors",
                    active
                      ? "border-accent-border bg-accent-surface text-ink"
                      : "border-border-subtle text-dim hover:border-border-strong hover:text-ink",
                  )}
                >
                  {q.label} ({count})
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {totalVisible === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-dim">{emptyLabel}</div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto px-4 py-3">
          {filteredGroups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <div className="sticky top-0 z-10 -mx-4 mb-2 bg-surface-2/95 px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-dim backdrop-blur-sm">
                {group.label}
              </div>
              <ol className="relative flex flex-col gap-3 border-l border-border-subtle pl-4">
                {group.events.map((e) => {
                  const cfg = actorKindConfig[e.actorKind];
                  const Icon = cfg.icon;
                  return (
                    <li key={e.id} className="relative">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute -left-[21px] top-0.5 flex size-5 items-center justify-center rounded-full border bg-surface-2",
                          cfg.ring,
                        )}
                      >
                        <Icon className="size-3" aria-hidden />
                      </span>
                      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <p className="min-w-0 text-[12.5px] leading-snug text-ink">
                          <span className="sr-only">{cfg.label} </span>
                          <span className="font-semibold">{e.actor}</span>{" "}
                          <span className="text-dim">{e.action}</span>{" "}
                          <span className="font-mono text-dim">· {e.resource}</span>
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide",
                            toneChip[e.outcome],
                          )}
                        >
                          {outcomeLabel[e.outcome]}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10.5px] text-dim">
                        <span>{e.timestamp}</span>
                        <HashBadge hash={e.hash} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
