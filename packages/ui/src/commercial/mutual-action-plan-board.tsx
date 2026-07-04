import * as React from "react";
import { Check, Circle, Loader2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

export type MilestoneStatus = "todo" | "in-progress" | "blocked" | "done";
export type MilestoneSide = "buyer" | "seller";

export interface Milestone {
  id: string;
  title: string;
  owner: string;
  side: MilestoneSide;
  /** Fecha límite ISO, ej. "2026-07-10". */
  due: string;
  status: MilestoneStatus;
  dependsOn?: string[];
}

const SIDE = {
  buyer: { label: "Comprador", chip: "border-accent-secondary/40 bg-accent-secondary/10 text-accent-secondary" },
  seller: { label: "Vendedor", chip: "border-accent-border bg-accent-surface text-accent" },
} as const;

const STATUS_ICON: Record<
  MilestoneStatus,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  todo: Circle,
  "in-progress": Loader2,
  blocked: Ban,
  done: Check,
};

export interface MutualActionPlanBoardProps extends Omit<React.ComponentProps<"ul">, "children"> {
  milestones: Milestone[];
  onToggle?: (id: string) => void;
  /** Referencia "ahora" (ISO o epoch) para el cálculo de vencidos — inyectable para test. */
  now?: string | number;
}

/**
 * Plan de acción mutuo comprador/vendedor (área E) — hitos con dueño, fecha,
 * dependencias y estado; el primitive definitorio del digital sales room que
 * mantiene a ambas partes accountables en un cierre complejo. Detecta vencidos y
 * bloqueos por dependencia; distingue comprador/vendedor de un vistazo (dualidad
 * de actor). Estado por ícono+color+etiqueta (colorblind-safe).
 */
export function MutualActionPlanBoard({
  milestones,
  onToggle,
  now,
  className,
  ...props
}: MutualActionPlanBoardProps) {
  const nowMs = now != null ? new Date(now).getTime() : Date.now();

  return (
    <ul className={cn("flex flex-col gap-2", className)} {...props}>
      {milestones.map((m) => {
        const dueMs = new Date(m.due).getTime();
        const overdue = m.status !== "done" && dueMs < nowMs;
        const Icon = STATUS_ICON[m.status];
        const iconTone =
          m.status === "done"
            ? "text-ok"
            : m.status === "blocked"
              ? "text-block"
              : m.status === "in-progress"
                ? "text-review"
                : "text-faint";

        return (
          <li
            key={m.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-surface-2 px-3 py-2.5",
              overdue ? "border-warn/40" : "border-border-subtle",
            )}
          >
            <button
              type="button"
              onClick={() => onToggle?.(m.id)}
              aria-label={
                m.status === "done"
                  ? `Marcar ${m.title} como pendiente`
                  : `Marcar ${m.title} como completado`
              }
              aria-pressed={m.status === "done"}
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                m.status === "done" ? "border-ok/70 bg-ok/15" : "border-border-strong",
              )}
            >
              <Icon
                className={cn("size-3.5", iconTone, m.status === "in-progress" && "animate-spin motion-reduce:animate-none")}
                aria-hidden
              />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={cn("text-[13px] font-medium text-ink", m.status === "done" && "line-through opacity-60")}>
                  {m.title}
                </span>
                <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide", SIDE[m.side].chip)}>
                  {SIDE[m.side].label}
                </span>
                {m.status === "blocked" ? (
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-block">Bloqueado</span>
                ) : null}
                {overdue ? (
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-warn">Vencido</span>
                ) : null}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[10.5px] text-faint">
                <span>{m.owner}</span>
                <span aria-hidden>·</span>
                <span className={cn(overdue && "text-warn")}>vence {m.due}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
