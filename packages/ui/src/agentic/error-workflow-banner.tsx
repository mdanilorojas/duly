import * as React from "react";
import { Route, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeStatusBadge, type NodeStatus } from "./node-status-badge.js";

export interface ErrorHandlerRef {
  /** Id de la ejecución del error handler que recibió el fallo, ej. "exec_c98b12". */
  executionId: string;
  /** Nombre del workflow de error handling, ej. "Global Error Handler". */
  workflowName: string;
  status: NodeStatus;
  /** Nodo del workflow original donde ocurrió el fallo que disparó el ruteo. */
  failedNodeTitle?: string;
  /** Deep-link a la ejecución del error handler. */
  onOpen?: () => void;
}

export interface ErrorWorkflowBannerProps extends Omit<React.ComponentProps<"div">, "onOpen"> {
  handler: ErrorHandlerRef;
}

/**
 * "Este fallo se enrutó al error handler X" con cross-link — la otra mitad de
 * la nueva prioridad #1 de área A del NORTH_STAR junto a `SubworkflowChip`.
 * Vive sobre `RunInspector` (banner del run que falló y disparó un Error
 * Trigger en otro workflow) o sobre una fila de `ExecutionHistoryTable`.
 * Tono `warn`, no `block`: el fallo ya fue capturado y ruteado a un manejador
 * — comunicar esto como una remediación en curso, no como una alarma sin
 * resolver, es la misma distinción que ya hace `RetryControls` entre
 * "Failed here" (block) y el propio control de reintento.
 */
export function ErrorWorkflowBanner({ handler, className, ...props }: ErrorWorkflowBannerProps) {
  const { executionId, workflowName, status, failedNodeTitle, onOpen } = handler;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2",
        className,
      )}
      {...props}
    >
      <Route className="size-4 shrink-0 text-warn" aria-hidden />
      <div className="min-w-0 flex-1 text-[11px] leading-snug">
        <span className="font-semibold text-warn">Routed to error handler</span>
        {failedNodeTitle ? (
          <span className="text-dim"> — failure at &ldquo;{failedNodeTitle}&rdquo;</span>
        ) : null}
      </div>
      <NodeStatusBadge status={status} size="sm" />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open error handler execution: ${workflowName}, ${executionId}`}
        className="inline-flex min-h-6 shrink-0 items-center gap-1 rounded font-mono text-[10.5px] font-semibold text-warn hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="max-w-[160px] truncate">{workflowName}</span>
        <ArrowUpRight className="size-3 shrink-0" aria-hidden />
      </button>
    </div>
  );
}
