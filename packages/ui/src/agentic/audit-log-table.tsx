import * as React from "react";
import { Bot, Server, User, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";
import { toneChip } from "./approval-gate-card.js";

export type AuditActorKind = "human" | "agent" | "system";

export interface AuditEvent {
  id: string;
  actorKind: AuditActorKind;
  /** Nombre visible del actor, ej. "Maria Chen" | "Compliance Sweep Agent" | "Retention Job". */
  actor: string;
  /** Frase de acción en pasado, ej. "Approved payout". */
  action: string;
  /** Recurso afectado, ej. "Invoice #88213 · $42,500". */
  resource: string;
  outcome: Tone;
  timestamp: string;
  /** Hash del registro (WORM/inmutabilidad) — se muestra truncado con el hash completo en `title`. */
  hash: string;
}

interface ActorKindConfig {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  ring: string;
}

// Dualidad de actor (principio #5 NORTH_STAR): humano/agente/sistema deben
// distinguirse de un vistazo, no solo por texto — icono + anillo de color propios.
export const actorKindConfig: Record<AuditActorKind, ActorKindConfig> = {
  human: { label: "Human", icon: User, ring: "border-info/40 bg-info/10 text-info" },
  agent: { label: "Agent", icon: Bot, ring: "border-review/40 bg-review/10 text-review" },
  system: { label: "System", icon: Server, ring: "border-border-strong bg-bg-elevated text-dim" },
};

export const outcomeLabel: Record<Tone, string> = {
  info: "Info",
  ok: "Success",
  review: "Needs review",
  warn: "Warning",
  block: "Blocked",
};

function ActorCell({ kind, name }: { kind: AuditActorKind; name: string }) {
  const cfg = actorKindConfig[kind];
  const Icon = cfg.icon;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        aria-hidden
        className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border", cfg.ring)}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] font-medium text-ink">{name}</span>
        <span className="block font-mono text-[9.5px] uppercase tracking-wide text-dim">{cfg.label}</span>
      </span>
    </div>
  );
}

function OutcomeChip({ tone }: { tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        toneChip[tone],
      )}
    >
      {outcomeLabel[tone]}
    </span>
  );
}

export function HashBadge({ hash }: { hash: string }) {
  const short = hash.length > 10 ? `${hash.slice(0, 10)}…` : hash;
  return (
    <span
      title={`Immutable record hash: ${hash}`}
      className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10.5px] text-dim"
    >
      <Hash className="size-3" aria-hidden />
      {short}
    </span>
  );
}

export interface AuditLogTableProps extends React.ComponentProps<"div"> {
  title?: string;
  events: AuditEvent[];
  /** Cap opcional de alto visible con scroll interno — mantiene la tabla densa dentro de una consola. */
  maxHeight?: number;
  emptyLabel?: string;
}

/**
 * Stream inmutable de auditoría — item #1 de la "Prioridad de construcción"
 * del NORTH_STAR (área C, 0% de cobertura antes de esta versión). Cada fila
 * muestra actor (humano/agente/sistema, distinguible a un vistazo), acción,
 * recurso, outcome y un hash badge como señal de inmutabilidad (principios
 * #4 y #5). Tabla semántica (`<table>`) para que lectores de pantalla y
 * navegación por teclado funcionen sin JS adicional; no virtualizada todavía
 * — ver "DataTable denso" en NORTH_STAR como ítem separado de table stakes
 * para listas muy largas.
 */
export function AuditLogTable({
  title = "Audit log",
  events,
  maxHeight,
  emptyLabel = "No hay eventos de auditoría en este rango.",
  className,
  ...props
}: AuditLogTableProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-1 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
        <span className="font-mono text-[11px] text-dim">{events.length} events</span>
      </div>

      {events.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-dim">{emptyLabel}</div>
      ) : (
        <div
          className="overflow-x-auto"
          style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
        >
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">{title}: registro inmutable de acciones por actor</caption>
            <thead className="sticky top-0 z-10 bg-surface-header">
              <tr className="border-b border-border-subtle">
                {["Actor", "Action", "Resource", "Outcome", "Timestamp", "Hash"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-surface-3/40">
                  <td className="px-3 py-2.5">
                    <ActorCell kind={e.actorKind} name={e.actor} />
                  </td>
                  <td className="max-w-[220px] px-3 py-2.5 text-[12.5px] text-ink">
                    <span className="line-clamp-2 break-words">{e.action}</span>
                  </td>
                  <td className="max-w-[200px] px-3 py-2.5 font-mono text-[11.5px] text-dim">
                    <span className="line-clamp-2 break-words">{e.resource}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <OutcomeChip tone={e.outcome} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-dim">
                    {e.timestamp}
                  </td>
                  <td className="px-3 py-2.5">
                    <HashBadge hash={e.hash} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
