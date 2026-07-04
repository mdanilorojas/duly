import * as React from "react";
import { cn } from "@/lib/utils";
import { AgentCore } from "./agent-core.js";
import type { NeuralAgent } from "./neural-agents.js";

export interface AgentCardProps extends React.ComponentProps<"div"> {
  agent: NeuralAgent;
  /** Tamaño del core en px. */
  coreSize?: number;
}

/**
 * Tarjeta glass de un agente: core WebGL + ID + nombre + rol.
 * El hover sube la actividad del core.
 */
export function AgentCard({
  agent,
  coreSize = 120,
  className,
  ...props
}: AgentCardProps) {
  const [active, setActive] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      tabIndex={0}
      role="group"
      aria-label={`${agent.name} — ${agent.role}`}
      className={cn(
        "group relative flex flex-col items-center overflow-hidden rounded-2xl",
        "border border-border-subtle bg-surface-2/70 px-6 py-8 text-center backdrop-blur-md",
        "transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-border-strong",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        className,
      )}
      {...props}
    >
      <AgentCore agent={agent} size={coreSize} active={active} className="mb-6" />
      <span className="mb-3 rounded bg-surface-3/60 px-2 py-0.5 font-mono text-[0.7rem] tracking-wider text-dim">
        {agent.id}
      </span>
      <span className="mb-1 text-lg font-semibold text-ink">{agent.name}</span>
      <span className="text-sm leading-snug text-dim">{agent.role}</span>
    </div>
  );
}

/**
 * Alias preferido de `AgentCard`. Corrección de nomenclatura: en 2026 "Agent
 * Card" denota el documento de discovery del protocolo A2A (ver
 * `A2AAgentCardViewer`), no una tarjeta de presentación. Esta es la tarjeta de
 * PRESENTACIÓN; usa `AgentTile`. `AgentCard` se conserva por retrocompatibilidad.
 */
export const AgentTile = AgentCard;
export type AgentTileProps = AgentCardProps;
