import type { CSSProperties } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import { NodeStatusBadge } from "./node-status-badge.js";
import type { AgentNode, AgentEdge } from "./agent-topology-graph.js";

interface FlowProps {
  nodes: AgentNode[];
  edges: AgentEdge[];
  layout: "hierarchy" | "force";
  selected: string | null;
  onSelect?: (id: string) => void;
}

type AgentNodeData = AgentNode & { selected?: boolean };

function AgentFlowNode({ data }: NodeProps) {
  const d = data as unknown as AgentNodeData;
  return (
    <div
      className={cn(
        "min-w-[132px] rounded-lg border bg-surface-2 px-3 py-2 shadow-sm",
        d.selected ? "border-accent" : "border-border-default",
      )}
    >
      <Handle type="target" position={Position.Top} className="!size-1.5 !border-0 !bg-border-strong" />
      <div className="flex items-center gap-2">
        <NodeStatusBadge status={d.status} size="sm" />
        <div className="leading-tight">
          <div className="text-[11px] font-medium text-ink">{d.label}</div>
          <div className="font-mono text-[10px] uppercase tracking-wide text-faint">{d.role}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-1.5 !border-0 !bg-border-strong" />
    </div>
  );
}

const nodeTypes = { agent: AgentFlowNode };

/**
 * Canvas de React Flow para `AgentTopologyGraph` (cargado en diferido). Nodos
 * custom tokenizados (no estilos default de RF). El consumidor debe importar
 * `@xyflow/react/dist/style.css` una vez (como importa los estilos del DS).
 */
export default function FlowCanvas({ nodes, edges, layout, selected, onSelect }: FlowProps) {
  const rfNodes: Node[] = nodes.map((n, i) => ({
    id: n.id,
    type: "agent",
    position:
      n.position ??
      (layout === "hierarchy"
        ? { x: (i % 4) * 190, y: Math.floor(i / 4) * 130 }
        : { x: (i * 130) % 520, y: (i * 90) % 390 }),
    data: { ...n, selected: selected === n.id } as unknown as Record<string, unknown>,
  }));

  const rfEdges: Edge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: !!e.active,
    style: { stroke: e.active ? "var(--accent)" : "var(--border-strong)" },
  }));

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      fitView
      nodesDraggable={false}
      nodesConnectable={false}
      onNodeClick={(_, n) => onSelect?.(n.id)}
      className="bg-transparent"
      style={
        // xyflow's own stylesheet ships light-mode defaults for pieces we
        // don't render ourselves (Controls buttons, edge labels) — point
        // them at our tokens instead of a hardcoded `.dark` class, so it
        // tracks whichever theme (cockpit/light/violet) is active.
        {
          "--xy-controls-button-background-color": "var(--surface-2)",
          "--xy-controls-button-background-color-hover": "var(--surface-3)",
          "--xy-controls-button-color": "var(--ink)",
          "--xy-controls-button-color-hover": "var(--ink)",
          "--xy-controls-button-border-color": "var(--border-strong)",
          "--xy-edge-label-background-color": "var(--surface-2)",
          "--xy-edge-label-color": "var(--ink)",
        } as CSSProperties
      }
    >
      <Background color="var(--border-subtle)" gap={20} />
      <Controls showInteractive={false} className="!border-border-subtle !bg-surface-2" />
    </ReactFlow>
  );
}
