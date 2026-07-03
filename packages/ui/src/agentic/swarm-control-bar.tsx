import * as React from "react";
import { Pause, Play, Square, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.js";

export type SwarmState = "running" | "paused" | "stopping";

export interface SwarmControlBarProps extends Omit<React.ComponentProps<"div">, "children"> {
  state: SwarmState;
  /** Agentes/runs en el alcance de la acción; si se omite, "toda la flota". */
  selectionCount?: number;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const STATE_META: Record<SwarmState, { label: string; tone: string }> = {
  running: { label: "En ejecución", tone: "text-ok" },
  paused: { label: "En pausa", tone: "text-warn" },
  stopping: { label: "Deteniendo…", tone: "text-block" },
};

/**
 * Barra de control del enjambre — item `SwarmControlBar` del área G. Los
 * controles del DS eran por-run; esto pausa/reanuda/cancela un enjambre o una
 * cohorte filtrada por broadcast (patrón Temporal batch signals). `Cancel` es
 * destructivo → confirmación inline con blast-radius (cuántos runs), en la línea
 * del principio "un botón destructivo nunca va desnudo".
 */
export function SwarmControlBar({
  state,
  selectionCount,
  onPause,
  onResume,
  onCancel,
  disabled = false,
  className,
  ...props
}: SwarmControlBarProps) {
  const [confirming, setConfirming] = React.useState(false);
  const meta = STATE_META[state];
  const scope =
    selectionCount != null ? `${selectionCount} run${selectionCount === 1 ? "" : "s"}` : "toda la flota";
  const busy = state === "stopping" || disabled;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3 py-2",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2" role="status">
        {state === "stopping" ? (
          <Loader2 className="size-4 animate-spin text-block motion-reduce:animate-none" aria-hidden />
        ) : (
          <span
            aria-hidden
            className={cn(
              "size-2.5 rounded-full",
              state === "running" ? "bg-ok" : "bg-warn",
              state === "running" && "motion-safe:animate-pulse",
            )}
          />
        )}
        <span className={cn("font-mono text-[11px] font-semibold", meta.tone)}>{meta.label}</span>
        <span className="font-mono text-[11px] text-faint">· {scope}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {confirming ? (
          <>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-block">
              <AlertTriangle className="size-3.5" aria-hidden />
              ¿Cancelar {scope}?
            </span>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8"
              onClick={() => {
                setConfirming(false);
                onCancel?.();
              }}
            >
              Confirmar
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => setConfirming(false)}>
              Volver
            </Button>
          </>
        ) : state === "stopping" ? null : (
          <>
            {state === "running" ? (
              <Button type="button" size="sm" variant="secondary" className="h-8" onClick={onPause} disabled={busy}>
                <Pause className="size-3.5" aria-hidden />
                Pausar
              </Button>
            ) : (
              <Button type="button" size="sm" variant="secondary" className="h-8" onClick={onResume} disabled={busy}>
                <Play className="size-3.5" aria-hidden />
                Reanudar
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-block hover:text-block"
              onClick={() => setConfirming(true)}
              disabled={busy}
            >
              <Square className="size-3.5" aria-hidden />
              Cancelar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
