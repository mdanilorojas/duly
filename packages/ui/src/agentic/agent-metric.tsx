import * as React from "react";
import { cn } from "@/lib/utils";

export type AgentMetricTone = "default" | "ok" | "warn" | "review" | "block" | "info";

const toneText: Record<AgentMetricTone, string> = {
  default: "text-ink",
  ok: "text-ok",
  warn: "text-warn",
  review: "text-review",
  block: "text-block",
  info: "text-info",
};

export interface AgentMetricProps extends React.ComponentProps<"div"> {
  /** Etiqueta corta en mayúsculas, ej. "PREDIOS / REQUEST". */
  label: string;
  /** Valor principal, ej. 2000 o "99.8". */
  value: React.ReactNode;
  /** Unidad o sufijo pequeño, ej. "ms", "html". */
  unit?: string;
  /** Color semántico del valor. Por defecto `ink`. */
  tone?: AgentMetricTone;
}

/**
 * Tile de métrica compacta para dashboards de agentes (throughput, latencia,
 * tokens, confianza). Diseñado para vivir en una grid de N columnas.
 */
export function AgentMetric({
  label,
  value,
  unit,
  tone = "default",
  className,
  ...props
}: AgentMetricProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border-subtle bg-surface-2 px-3.5 py-3",
        className,
      )}
      {...props}
    >
      <div className="font-mono text-[8.5px] font-bold uppercase leading-tight tracking-wide text-dim">
        {label}
      </div>
      <div className={cn("mt-1.5 flex items-baseline gap-1 font-mono text-xl font-extrabold", toneText[tone])}>
        {value}
        {unit ? <small className="text-[11px] font-semibold text-dim">{unit}</small> : null}
      </div>
    </div>
  );
}

export interface AgentMetricRowProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

/** Grid responsiva para agrupar varios `AgentMetric`. */
export function AgentMetricRow({ children, className, ...props }: AgentMetricRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
