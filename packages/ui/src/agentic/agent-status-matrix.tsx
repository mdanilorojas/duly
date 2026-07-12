import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";

const swatchBg: Record<Tone, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

const swatchBorder: Record<Tone, string> = {
  info: "border-s-info",
  ok: "border-s-ok",
  review: "border-s-review",
  warn: "border-s-warn",
  block: "border-s-block",
};

// "info" usa text-dim: el gris del tono (L 0.61) no llega a 4.5:1 sobre surface-2.
const swatchText: Record<Tone, string> = {
  info: "text-dim",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

export interface AgentStatusEntry {
  /** Código corto, ej. "cód 3" o "RE-03". */
  code: string;
  /** Nombre del estatus, ej. "Liberado". */
  label: string;
  /** Tono semántico del sistema (5 estados: info/ok/review/warn/block). */
  tone: Tone;
}

export interface AgentStatusMatrixProps extends React.ComponentProps<"div"> {
  items: AgentStatusEntry[];
}

/**
 * Grid de estatus operacionales/legales de agentes o entidades (predios,
 * runs, documentos). Cada entrada usa uno de los 5 tonos semánticos del
 * sistema — nunca color crudo — para que sea consistente entre industrias.
 */
export function AgentStatusMatrix({ items, className, ...props }: AgentStatusMatrixProps) {
  return (
    <div
      role="list"
      aria-label="Matriz de estatus"
      className={cn(
        "grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2.5",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <div
          role="listitem"
          key={`${item.code}-${item.label}`}
          className={cn(
            "flex items-center gap-2.5 rounded-[11px] border border-border-subtle border-s-[3px] bg-surface-2 px-3 py-2.5",
            swatchBorder[item.tone],
          )}
        >
          <span
            aria-hidden
            className={cn("size-[22px] shrink-0 rounded-[7px]", swatchBg[item.tone])}
          />
          <div className="min-w-0">
            <div className="font-mono text-[8.5px] uppercase tracking-wide text-dim">
              {item.code}
            </div>
            <div className="truncate text-[12.5px] font-semibold leading-tight text-ink">
              {item.label}
            </div>
            <div className={cn("mt-0.5 font-mono text-[9.5px]", swatchText[item.tone])}>
              {item.tone}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
