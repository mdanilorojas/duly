import * as React from "react";
import { cn } from "@/lib/utils";
import { NodeStatusBadge, type NodeStatus } from "./node-status-badge.js";

export type AgentRole = "orchestrator" | "worker" | "tool" | "human" | (string & {});

export interface AgentNode {
  id: string;
  label: string;
  role: AgentRole;
  status: NodeStatus;
  tokens?: number;
  costUsd?: number;
  /** Posición opcional para el grafo; si se omite se auto-distribuye. */
  position?: { x: number; y: number };
}

export interface AgentEdge {
  id: string;
  source: string;
  target: string;
  /** Hop activo → edge animado/acentuado. */
  active?: boolean;
  label?: string;
}

// React Flow se carga en diferido — el grafo visual no infla el bundle base y
// el consumidor puede usar solo el roster si no montó los estilos de React Flow.
const LazyFlow = React.lazy(() => import("./agent-topology-graph.flow.js"));

export interface AgentTopologyGraphProps extends Omit<React.ComponentProps<"div">, "children" | "onSelect"> {
  nodes: AgentNode[];
  edges: AgentEdge[];
  onSelect?: (id: string) => void;
  layout?: "hierarchy" | "force";
  ariaLabel?: string;
  graphHeight?: number;
  /** Muestra solo el roster accesible (sin el canvas de React Flow). */
  rosterOnly?: boolean;
}

/**
 * Grafo de topología de la flota de agentes — item `AgentTopologyGraph` del
 * área G (orquestación multi-agente). El DS observaba UN agente; esto muestra
 * qué agentes existen y cómo fluyen los mensajes. Dos representaciones: el grafo
 * visual (React Flow, diferido, `aria-hidden`) y un roster `role="list"`
 * interactivo que es la representación accesible/teclado — el canvas nunca es la
 * única forma de operar (colorblind/AT safe, reusa `NodeStatusBadge`).
 */
export function AgentTopologyGraph({
  nodes,
  edges,
  onSelect,
  layout = "hierarchy",
  ariaLabel = "Topología de agentes",
  graphHeight = 380,
  rosterOnly = false,
  className,
  ...props
}: AgentTopologyGraphProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  function select(id: string) {
    setSelected(id);
    onSelect?.(id);
  }

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      {!rosterOnly ? (
        <div
          aria-hidden
          className="relative border-b border-border-subtle bg-surface-sunken"
          style={{ height: graphHeight }}
        >
          <React.Suspense
            fallback={<div className="grid h-full place-items-center text-xs text-faint">Cargando grafo…</div>}
          >
            <LazyFlow nodes={nodes} edges={edges} layout={layout} selected={selected} onSelect={select} />
          </React.Suspense>
        </div>
      ) : null}

      <ul role="list" aria-label={ariaLabel} className="divide-y divide-border-subtle">
        {nodes.map((n) => {
          const isSelected = selected === n.id;
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => select(n.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isSelected ? "bg-surface-3/60" : "hover:bg-surface-3/30",
                )}
              >
                <NodeStatusBadge status={n.status} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-ink">{n.label}</span>
                  <span className="block font-mono text-[9.5px] uppercase tracking-wide text-faint">{n.role}</span>
                </span>
                {n.tokens != null || n.costUsd != null ? (
                  <span className="shrink-0 text-right font-mono text-[10.5px] tabular-nums text-dim">
                    {n.tokens != null ? <span className="block">{n.tokens.toLocaleString()} tok</span> : null}
                    {n.costUsd != null ? <span className="block text-faint">${n.costUsd.toFixed(2)}</span> : null}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
