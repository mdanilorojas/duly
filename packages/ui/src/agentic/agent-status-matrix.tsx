import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
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
  /** Marca la celda como crítica: borde reforzado + ⚠ con texto sr-only. */
  critical?: boolean;
}

export interface AgentStatusMatrixProps extends React.ComponentProps<"div"> {
  items: AgentStatusEntry[];
  /** "compact": celda densa tipo heatmap (código + tono), para matrices de 10+ áreas. */
  density?: "default" | "compact";
  /** Si se provee, el contenido de cada celda es un botón. */
  onSelectItem?: (item: AgentStatusEntry) => void;
}

/**
 * Grid de estatus operacionales/legales de agentes o entidades (predios,
 * runs, documentos, áreas de un SGSI). Cada entrada usa uno de los 5 tonos
 * semánticos del sistema — nunca color crudo — para que sea consistente
 * entre industrias. `density="compact"` la vuelve heatmap densa (p. ej. las
 * 13 áreas de un assessment ISO); `critical` marca celdas que piden acción
 * con ⚠ + texto accesible, no solo color.
 */
export function AgentStatusMatrix({
  items,
  density = "default",
  onSelectItem,
  className,
  ...props
}: AgentStatusMatrixProps) {
  const copy = useCopy();
  const compact = density === "compact";

  return (
    <div
      role="list"
      aria-label="Matriz de estatus"
      className={cn(
        compact
          ? "grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2"
          : "grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2.5",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const cell = compact ? (
          <>
            <span className="font-mono text-[10px] uppercase tracking-wide text-dim">{item.code}</span>
            <span className={cn("mt-0.5 block font-mono text-[10px]", swatchText[item.tone])}>
              {item.tone}
              {item.critical ? (
                <>
                  {" "}
                  <span aria-hidden>⚠</span>
                  <span className="sr-only">{copy.statusMatrix.critical}</span>
                </>
              ) : null}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2.5">
            <span aria-hidden className={cn("size-[22px] shrink-0 rounded-[7px]", swatchBg[item.tone])} />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wide text-dim">{item.code}</div>
              <div className="truncate text-[12.5px] font-semibold leading-tight text-ink">{item.label}</div>
              <div className={cn("mt-0.5 font-mono text-[10px]", swatchText[item.tone])}>
                {item.tone}
                {item.critical ? (
                  <>
                    {" "}
                    <span aria-hidden>⚠</span>
                    <span className="sr-only">{copy.statusMatrix.critical}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        );

        const cellClass = cn(
          "rounded-[11px] border border-border-subtle border-s-[3px] bg-surface-2",
          compact ? "px-2.5 py-2" : "px-3 py-2.5",
          swatchBorder[item.tone],
          item.critical && "ring-1 ring-inset ring-block/60",
        );

        return (
          <div role="listitem" key={`${item.code}-${item.label}`} className={cellClass}>
            {onSelectItem ? (
              <button type="button" className="block w-full text-left" onClick={() => onSelectItem(item)}>
                {cell}
              </button>
            ) : (
              cell
            )}
          </div>
        );
      })}
    </div>
  );
}
