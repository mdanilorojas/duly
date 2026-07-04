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
import { ROLE_META, type Stakeholder, type RelationshipLink } from "./relationship-map.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const BORDER: Record<Tone, string> = {
  info: "border-info",
  ok: "border-ok",
  review: "border-review",
  warn: "border-warn",
  block: "border-block",
};

interface FlowProps {
  people: Stakeholder[];
  links: RelationshipLink[];
  selected: string | null;
  onSelect?: (id: string) => void;
}

type StakeholderData = Stakeholder & { selected?: boolean };

function StakeholderNode({ data }: NodeProps) {
  const d = data as unknown as StakeholderData;
  const meta = ROLE_META[d.role];
  return (
    <div className={cn("min-w-[128px] rounded-lg border-2 bg-surface-2 px-3 py-2 shadow-sm", d.selected ? "border-accent" : BORDER[meta.tone])}>
      <Handle type="target" position={Position.Top} className="!size-1.5 !border-0 !bg-border-strong" />
      <div className="text-[11px] font-medium text-ink">{d.name}</div>
      <div className="font-mono text-[8px] uppercase tracking-wide text-faint">{meta.label}</div>
      <Handle type="source" position={Position.Bottom} className="!size-1.5 !border-0 !bg-border-strong" />
    </div>
  );
}

const nodeTypes = { stakeholder: StakeholderNode };

/**
 * Canvas de React Flow para `RelationshipMap` (diferido). Nodos por rol con
 * color de tono. El consumidor importa `@xyflow/react/dist/style.css` una vez.
 */
export default function RelationshipFlow({ people, links, selected, onSelect }: FlowProps) {
  const nodes: Node[] = people.map((p, i) => ({
    id: p.id,
    type: "stakeholder",
    position: p.position ?? { x: (i % 3) * 190, y: Math.floor(i / 3) * 130 },
    data: { ...p, selected: selected === p.id } as unknown as Record<string, unknown>,
  }));
  const edges: Edge[] = links.map((l) => ({
    id: l.id,
    source: l.source,
    target: l.target,
    label: l.label,
    style: { stroke: "var(--border-strong)" },
  }));
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      nodesDraggable={false}
      nodesConnectable={false}
      onNodeClick={(_, n) => onSelect?.(n.id)}
      className="bg-transparent"
    >
      <Background color="var(--border-subtle)" gap={20} />
      <Controls showInteractive={false} className="!border-border-subtle !bg-surface-2" />
    </ReactFlow>
  );
}
