import * as React from "react";
import { MousePointerClick, Webhook, Timer, ShieldAlert, RotateCcw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeStatusBadge, type NodeStatus } from "./node-status-badge.js";
import type { ErrorHandlerRef } from "./error-workflow-banner.js";

export type TriggerMode = "manual" | "webhook" | "schedule" | "error_handler" | "retry";

interface TriggerConfig {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

const TRIGGER: Record<TriggerMode, TriggerConfig> = {
  manual: { label: "Manual", icon: MousePointerClick },
  webhook: { label: "Webhook", icon: Webhook },
  schedule: { label: "Schedule", icon: Timer },
  error_handler: { label: "Error handler", icon: ShieldAlert },
  retry: { label: "Retry", icon: RotateCcw },
};

export interface ExecutionRecord {
  id: string;
  /** Nombre del workflow, ej. "Invoice Reconciliation". */
  workflowName: string;
  status: NodeStatus;
  triggerMode: TriggerMode;
  /** Hora de inicio ya formateada, ej. "Jul 3, 14:02". */
  startedAt: string;
  /** Duración ya formateada, ej. "1.8s" o "—" si sigue corriendo. */
  duration: string;
  /** Intentos [actual, máx] — se omite si nunca hubo retry. */
  attempt?: [current: number, max: number];
  /** Presente cuando el fallo de esta ejecución fue enrutado a un workflow de error handling. `onOpen` normalmente se wirea en el consumidor (ver `ExecutionHistoryConsole`). */
  errorHandler?: ErrorHandlerRef;
}

function TriggerChip({ mode }: { mode: TriggerMode }) {
  const cfg = TRIGGER[mode];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[10px] text-dim">
      <Icon className="size-3" aria-hidden />
      {cfg.label}
    </span>
  );
}

export interface ExecutionHistoryTableProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  title?: string;
  executions: ExecutionRecord[];
  /** Id de la ejecución resaltada como seleccionada (para uso master-detail con `RunInspector`). */
  selectedId?: string;
  /** Se dispara al elegir "Inspect" en una fila. */
  onSelect?: (id: string) => void;
  maxHeight?: number;
  emptyLabel?: React.ReactNode;
}

/**
 * Lista densa de ejecuciones de workflow — item #1 de la "Prioridad de
 * construcción" del NORTH_STAR (área A: n8n/proceso empresarial, 13% de
 * cobertura). n8n no permite white-label ni en su plan OEM (confirmado
 * 2026-07-02) — esta tabla es una reconstrucción propia de la vista de
 * ejecuciones, no un wrapper de marca ajena. Cada fila expone status, modo de
 * disparo, duración y reintentos de un vistazo; "Inspect" abre el detalle
 * read-only en `RunInspector`. Tabla semántica (no solo divs) para que
 * lectores de pantalla y navegación por teclado funcionen sin JS adicional.
 */
export function ExecutionHistoryTable({
  title = "Executions",
  executions,
  selectedId,
  onSelect,
  maxHeight,
  emptyLabel = "No executions in this range.",
  className,
  ...props
}: ExecutionHistoryTableProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-1 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
        <span className="font-mono text-[11px] text-dim">{executions.length} runs</span>
      </div>

      {executions.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-dim">{emptyLabel}</div>
      ) : (
        <div className="overflow-x-auto" style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
          <table className="w-full min-w-[720px] border-collapse text-start">
            <caption className="sr-only">{title}: historial de ejecuciones de workflow</caption>
            <thead className="sticky top-0 z-10 bg-surface-header">
              <tr className="border-b border-border-subtle">
                {["Status", "Workflow", "Trigger", "Started", "Duration", "Retries", ""].map((h) => (
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
              {executions.map((run) => {
                const selected = run.id === selectedId;
                return (
                  <tr
                    key={run.id}
                    className={cn(
                      "hover:bg-surface-3/40",
                      selected && "bg-surface-3/70 outline outline-1 -outline-offset-1 outline-ring/50",
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <NodeStatusBadge status={run.status} size="sm" attempt={run.attempt} />
                    </td>
                    <td className="max-w-[220px] px-3 py-2.5 text-[12.5px] font-medium text-ink">
                      <span className="line-clamp-1 break-words">{run.workflowName}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <TriggerChip mode={run.triggerMode} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-dim">
                      {run.startedAt}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-dim">
                      {run.duration}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-dim">
                      {run.attempt ? `${run.attempt[0]}/${run.attempt[1]}` : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <button
                        type="button"
                        onClick={() => onSelect?.(run.id)}
                        aria-label={`Inspect execution of ${run.workflowName}, started ${run.startedAt}`}
                        aria-current={selected ? "true" : undefined}
                        className={cn(
                          "inline-flex min-h-6 items-center gap-1 rounded px-2 py-1 font-mono text-[10.5px] font-semibold text-dim hover:text-ink",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring",
                          selected && "text-ink",
                        )}
                      >
                        Inspect
                        <ChevronRight className="size-3" aria-hidden />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
