import * as React from "react";
import { Check, X, Play, Clock, RotateCw, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Los 6 estados de nodo de ejecución del catálogo NORTH_STAR (sección A:
 * n8n / proceso empresarial → `NodeStatusBadge`). La gramática visual no
 * depende solo del color: combina tono semántico + estilo de trazo (sólido/
 * punteado/discontinuo) + movimiento, siguiendo el principio de credibilidad
 * enterprise #1 ("todo estado está diseñado", ref. Temporal: dashed animado
 * = pending, dashed rojo = retry).
 */
export type NodeStatus = "success" | "error" | "running" | "waiting" | "retrying" | "skipped";

interface StatusConfig {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** Borde del anillo: color + estilo de trazo + animación (motion-safe). */
  ring: string;
  iconTone: string;
  chip: string;
  connector: string;
  defaultLabel: string;
}

const STATUS: Record<NodeStatus, StatusConfig> = {
  success: {
    icon: Check,
    ring: "border-2 border-solid border-ok/70",
    iconTone: "text-ok",
    chip: "bg-ok/15 text-ok",
    connector: "border-t-2 border-solid border-ok/45",
    defaultLabel: "Success",
  },
  error: {
    icon: X,
    ring: "border-2 border-solid border-block/70",
    iconTone: "text-block",
    chip: "bg-block/15 text-block",
    connector: "border-t-2 border-solid border-block/45",
    defaultLabel: "Failed",
  },
  running: {
    icon: Play,
    ring: "border-2 border-dashed border-info/70 motion-safe:animate-spin",
    iconTone: "text-info",
    chip: "bg-info/15 text-info",
    connector: "border-t-2 border-dashed border-info/40 motion-safe:animate-pulse",
    defaultLabel: "Running",
  },
  waiting: {
    icon: Clock,
    ring: "border-2 border-dashed border-review/60 motion-safe:animate-pulse",
    iconTone: "text-review",
    chip: "bg-review/15 text-review",
    connector: "border-t-2 border-dashed border-review/35",
    defaultLabel: "Waiting",
  },
  retrying: {
    icon: RotateCw,
    ring: "border-2 border-dashed border-block/70 motion-safe:animate-spin",
    iconTone: "text-block",
    chip: "bg-block/15 text-block",
    defaultLabel: "Retrying",
    connector: "border-t-2 border-dashed border-block/45 motion-safe:animate-pulse",
  },
  skipped: {
    icon: MinusCircle,
    ring: "border-2 border-dotted border-faint-deco/70",
    iconTone: "text-faint",
    chip: "bg-surface-3 text-faint",
    connector: "border-t-2 border-dotted border-faint-deco/35",
    defaultLabel: "Skipped",
  },
};

const sizeRing: Record<"sm" | "md", string> = { sm: "size-6", md: "size-8" };
const sizeIcon: Record<"sm" | "md", string> = { sm: "size-3", md: "size-3.5" };

export interface NodeStatusBadgeProps extends Omit<React.ComponentProps<"div">, "children"> {
  status: NodeStatus;
  size?: "sm" | "md";
  /** Texto visible junto al anillo, ej. "Retrying". Si se omite, no se muestra texto. */
  label?: string;
  /** Intento actual / máximo — solo se pinta cuando `status="retrying"`. */
  attempt?: [current: number, max: number];
}

/**
 * Anillo de estado de un nodo (paso de workflow, run, tool call). Encodea el
 * estado con color + trazo + movimiento simultáneamente para que sea legible
 * sin depender solo del color (accesible a daltonismo) y para que "en curso"
 * se distinga de "resuelto" de un vistazo, como pide un CISO/auditor.
 * Respeta `prefers-reduced-motion` vía `motion-safe:`.
 */
export function NodeStatusBadge({
  status,
  size = "md",
  label,
  attempt,
  className,
  ...props
}: NodeStatusBadgeProps) {
  const cfg = STATUS[status];
  const Icon = cfg.icon;
  const showAttempt = status === "retrying" && attempt;
  const a11yLabel = label ?? cfg.defaultLabel;

  return (
    <div className={cn("inline-flex items-center gap-2", className)} {...props}>
      <span
        role="status"
        aria-label={showAttempt ? `${a11yLabel}, intento ${attempt[0]} de ${attempt[1]}` : a11yLabel}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-full bg-surface-2",
          sizeRing[size],
          cfg.ring,
        )}
      >
        <Icon className={cn(sizeIcon[size], cfg.iconTone)} aria-hidden />
        {showAttempt ? (
          <span
            aria-hidden
            className="absolute -bottom-1.5 -right-1.5 rounded border border-border-subtle bg-surface-3 px-0.5 font-mono text-[8px] font-semibold leading-tight text-faint"
          >
            {attempt[0]}/{attempt[1]}
          </span>
        ) : null}
      </span>
      {label ? (
        <span className={cn("rounded px-1.5 py-0.5 text-[10.5px] font-semibold", cfg.chip)}>
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function nodeStatusConnectorClass(status: NodeStatus): string {
  return STATUS[status].connector;
}

const LEGEND_ORDER: NodeStatus[] = ["success", "running", "retrying", "waiting", "error", "skipped"];

const LEGEND_HINT: Record<NodeStatus, string> = {
  success: "sólido",
  running: "punteado animado",
  retrying: "punteado animado, rojo",
  waiting: "punteado, pulso lento",
  error: "sólido, rojo",
  skipped: "punteado fino, apagado",
};

/**
 * Leyenda de la gramática de 6 estados — para demostrar en revisión que cada
 * estado tiene un trazo distinto, no solo un color (principio NORTH_STAR #1).
 */
export function NodeStatusLegend({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-5 gap-y-3 rounded-lg border border-border-subtle bg-surface-2 px-4 py-3",
        className,
      )}
      {...props}
    >
      {LEGEND_ORDER.map((status) => (
        <div key={status} className="flex items-center gap-2">
          <NodeStatusBadge status={status} size="sm" attempt={status === "retrying" ? [2, 3] : undefined} />
          <div className="leading-tight">
            <div className="text-[11px] font-semibold text-ink">{STATUS[status].defaultLabel}</div>
            <div className="font-mono text-[9px] text-faint">{LEGEND_HINT[status]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
