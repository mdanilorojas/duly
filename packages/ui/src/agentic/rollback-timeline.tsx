import * as React from "react";
import {
  RotateCcw,
  RefreshCcw,
  Ban,
  Flag,
  UserRound,
  Cpu,
  Server,
  AlertTriangle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../components/ui/button.js";
import { toneChip } from "./approval-gate-card.js";
import { toneText, type Tone } from "../trace-log/trace-log.variants.js";

/** Cuán reversible es una acción con efecto en el mundo. */
export type ActionReversibility = "reversible" | "compensating" | "irreversible";
/** Estado de una acción en la línea de tiempo. */
export type RollbackActionState = "active" | "reverted" | "restore-point";
/** Quién ejecutó — dualidad de actor (principio #5 NORTH_STAR). */
export type ActorKind = "human" | "agent" | "system";

export interface RollbackAction {
  id: string;
  /** Qué hizo la acción, ej. "Sent wire transfer $48,200". */
  label: string;
  /** Efecto en el mundo / blast radius de deshacerla. */
  effect?: string;
  reversibility: ActionReversibility;
  actor?: string;
  actorKind?: ActorKind;
  /** Marca temporal legible, ej. "10:02" o "Jul 9, 14:20". */
  at: string;
  /** `restore-point` marca un checkpoint reanudable; `reverted` una acción ya deshecha. */
  state?: RollbackActionState;
}

export interface RollbackTimelineProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Acciones en orden cronológico (la más reciente al final). */
  actions: RollbackAction[];
  /** Se invoca al confirmar revertir hasta —incluyendo— esta acción. */
  onRevertTo?: (actionId: string) => void;
  title?: string;
}

interface ReversibilityConfig {
  label: string;
  tone: Tone;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export const reversibilityConfig: Record<ActionReversibility, ReversibilityConfig> = {
  reversible: { label: "Reversible", tone: "ok", icon: RotateCcw },
  compensating: { label: "Compensating", tone: "warn", icon: RefreshCcw },
  irreversible: { label: "Irreversible", tone: "block", icon: Ban },
};

const actorIcon: Record<ActorKind, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  human: UserRound,
  agent: Cpu,
  system: Server,
};

const dotRing: Record<Tone, string> = {
  info: "border-info/50",
  ok: "border-ok/60",
  review: "border-review/60",
  warn: "border-warn/60",
  block: "border-block/60",
};

/**
 * Número de acciones que se desharían al revertir hasta `targetIndex` (todas las
 * posteriores que aún están activas), y si alguna de ellas es irreversible.
 */
function blastRadius(actions: RollbackAction[], targetIndex: number) {
  const affected = actions.slice(targetIndex + 1).filter((a) => a.state !== "reverted");
  const hasIrreversible = affected.some((a) => a.reversibility === "irreversible");
  return { count: affected.length, hasIrreversible };
}

/**
 * Línea de tiempo de reversibilidad — eje "revocar/revertir" del modelo de
 * confianza. Donde `RetryControls` RE-EJECUTA un run y el estado `revoked` corta
 * autoridad futura, esto DESHACE acciones ya ejecutadas en el mundo: muestra
 * cada acción con su reversibilidad (reversible/compensable/irreversible), su
 * actor (humano/agente/sistema) y puntos de restauración; "Revert to here"
 * deshace todo lo posterior, con confirmación inline y blast-radius explícito.
 * Una acción irreversible se ve y bloquea el revert — nunca se esconde
 * ("un botón destructivo nunca va desnudo"). Reusa `toneChip` y la gramática de
 * conector vertical del DS.
 */
export function RollbackTimeline({
  actions,
  onRevertTo,
  title = "Reversibility timeline",
  className,
  ...props
}: RollbackTimelineProps) {
  const [confirming, setConfirming] = React.useState<string | null>(null);

  return (
    <div
      className={cn("rounded-xl border border-border-subtle bg-surface-2 p-3", className)}
      {...props}
    >
      <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-dim">{title}</h3>
      <ol className="flex flex-col">
        {actions.map((action, i) => {
          const isRestore = action.state === "restore-point";
          const isReverted = action.state === "reverted";
          const cfg = reversibilityConfig[action.reversibility];
          const Icon = isRestore ? Flag : cfg.icon;
          const ActorIcon = actorIcon[action.actorKind ?? "agent"];
          const last = i === actions.length - 1;
          const radius = blastRadius(actions, i);
          const canRevert =
            !isReverted && action.reversibility !== "irreversible" && !last;
          const isConfirming = confirming === action.id;

          return (
            <li key={action.id} className="flex gap-3">
              {/* Riel con nodo + conector vertical */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-surface-2",
                    isRestore ? "border-info/60 text-info" : cn(dotRing[cfg.tone], toneText[cfg.tone]),
                    isReverted && "opacity-50",
                  )}
                >
                  <Icon className="size-3" aria-hidden />
                </span>
                {!last ? <span className="w-px flex-1 bg-border-subtle" aria-hidden /> : null}
              </div>

              {/* Cuerpo */}
              <div className={cn("flex min-w-0 flex-1 flex-col gap-1 pb-4", isReverted && "opacity-60")}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "min-w-0 break-words text-[12px] font-medium text-ink",
                      isReverted && "line-through",
                    )}
                  >
                    {action.label}
                  </span>
                  {isRestore ? (
                    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide", toneChip.info)}>
                      <Flag className="size-2.5" aria-hidden />
                      Restore point
                    </span>
                  ) : (
                    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide", toneChip[cfg.tone])}>
                      <cfg.icon className="size-2.5" aria-hidden />
                      {cfg.label}
                    </span>
                  )}
                  {isReverted ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-faint">
                      <Check className="size-2.5" aria-hidden />
                      reverted
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10.5px] text-dim">
                  <span className="inline-flex items-center gap-1">
                    <ActorIcon className="size-3 shrink-0 text-faint" aria-hidden />
                    {action.actor ?? (action.actorKind === "system" ? "system" : "agent")}
                  </span>
                  <span className="text-faint">· {action.at}</span>
                </div>

                {action.effect ? <p className="break-words text-[11.5px] text-dim">{action.effect}</p> : null}

                {/* Acción de revert */}
                {action.reversibility === "irreversible" && !isReverted && !isRestore ? (
                  <span className="mt-0.5 inline-flex w-fit items-center gap-1 font-mono text-[10.5px] text-block">
                    <Ban className="size-3" aria-hidden />
                    Cannot be undone
                  </span>
                ) : canRevert ? (
                  isConfirming ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-border-subtle bg-surface-1 p-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-warn">
                        <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                        {radius.count === 0
                          ? "Revert this action?"
                          : `Revert this and ${radius.count} later action${radius.count === 1 ? "" : "s"}?`}
                      </span>
                      {radius.hasIrreversible ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold text-block">
                          <Ban className="size-3 shrink-0" aria-hidden />
                          includes an irreversible action
                        </span>
                      ) : null}
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="h-7"
                          onClick={() => {
                            setConfirming(null);
                            onRevertTo?.(action.id);
                          }}
                        >
                          Confirm revert
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7" onClick={() => setConfirming(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-1 h-7 w-fit text-warn hover:text-warn"
                      onClick={() => setConfirming(action.id)}
                    >
                      <RotateCcw className="size-3.5" aria-hidden />
                      Revert to here
                    </Button>
                  )
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
