import * as React from "react";
import { cn } from "@/lib/utils";
import { AgentCard } from "./agent-card.js";
import { NEURAL_AGENTS, type NeuralAgent } from "./neural-agents.js";

export interface AgentGalleryProps extends React.ComponentProps<"div"> {
  /** Agentes a mostrar. Por defecto los 10 Neural Cores. */
  agents?: NeuralAgent[];
  /** Título opcional del encabezado. */
  title?: string;
  /** Subtítulo opcional (mono). */
  subtitle?: string;
}

/**
 * Galería en grid de agentes IA con cores WebGL. Composición V001 "Neural Cores".
 */
export function AgentGallery({
  agents = NEURAL_AGENTS,
  title = "Neural Cores",
  subtitle,
  className,
  ...props
}: AgentGalleryProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {(title || subtitle) && (
        <header className="mb-12 text-center">
          {title && (
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-ink">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="font-mono text-sm uppercase tracking-widest text-dim">
              {subtitle}
            </p>
          )}
        </header>
      )}
      <div className="mx-auto grid max-w-[1400px] grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-8">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
