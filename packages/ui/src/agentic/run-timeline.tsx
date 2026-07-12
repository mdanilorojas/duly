import * as React from "react";
import { cn } from "@/lib/utils";
import { NodeStatusBadge, nodeStatusConnectorClass, type NodeStatus } from "./node-status-badge.js";

export interface RunTimelineNode {
  id: string;
  /** Nombre del nodo/paso, ej. "Validate schema" o "Notify underwriter". */
  title: string;
  status: NodeStatus;
  /** Agente o sistema dueño del paso, ej. "PARSER AGENT" o "n8n: HTTP Request". */
  owner?: string;
  /** Hora relativa o duración, ej. "T+02.1s" o "1.4s". */
  meta?: string;
  attempt?: [current: number, max: number];
}

export interface RunTimelineProps extends React.ComponentProps<"div"> {
  title?: string;
  /** Etiqueta corta, ej. id del workflow o run. */
  hint?: string;
  nodes: RunTimelineNode[];
}

/**
 * Stepper horizontal estilo Temporal/n8n para un run de workflow: un nodo por
 * paso, conectado por una línea cuyo trazo (sólido/discontinuo/punteado) y
 * movimiento heredan del estado del nodo — así la cadena completa se lee de
 * un vistazo sin abrir el detalle de cada paso. Complementa a
 * `ExecutionTimeline` (vista vertical "un paso a la vez" de un run de
 * agentes) con la vista horizontal de "estado del workflow completo" que
 * n8n/Temporal usan para listas de ejecuciones.
 */
export function RunTimeline({ title, hint, nodes, className, ...props }: RunTimelineProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      {title ? (
        <div className="flex flex-col gap-1 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
          {hint ? <span className="min-w-0 truncate font-mono text-[11px] text-dim">{hint}</span> : null}
        </div>
      ) : null}

      {/* El contenedor scrolleable necesita foco de teclado + nombre accesible (WCAG 2.1.1). */}
      <div
        tabIndex={0}
        role="region"
        aria-label={title ?? "Run timeline"}
        className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <ol className="flex items-start px-5 py-5">
          {nodes.map((node, i) => (
            <li key={node.id} className="flex items-start last:flex-none">
              <div className="flex w-[118px] shrink-0 flex-col items-center gap-2 text-center">
                <NodeStatusBadge status={node.status} attempt={node.attempt} />
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-semibold leading-tight text-ink">{node.title}</div>
                  {node.owner ? (
                    <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wide text-dim">
                      {node.owner}
                    </div>
                  ) : null}
                  {node.meta ? (
                    <div className="mt-0.5 font-mono text-[10px] text-dim">{node.meta}</div>
                  ) : null}
                </div>
              </div>
              {i < nodes.length - 1 ? (
                <div
                  aria-hidden
                  className={cn("mt-4 h-0 min-w-8 flex-1", nodeStatusConnectorClass(node.status))}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
