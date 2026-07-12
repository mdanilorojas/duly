import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import { Button } from "@/components/ui/button.js";

export type AutonomyLevel = "manual" | "advisory" | "supervised" | "full-auto";

const LEVELS: { id: AutonomyLevel; label: string }[] = [
  { id: "manual", label: "Manual" },
  { id: "advisory", label: "Advisory" },
  { id: "supervised", label: "Supervised" },
  { id: "full-auto", label: "Full-auto" },
];

const rank = (l: AutonomyLevel) => LEVELS.findIndex((x) => x.id === l);

export interface AutonomyModeSwitchProps extends Omit<React.ComponentProps<"div">, "children" | "onChange"> {
  value: AutonomyLevel;
  onChange: (level: AutonomyLevel) => void;
  /** Máximo nivel permitido; los niveles por encima quedan deshabilitados. */
  disabledAbove?: AutonomyLevel;
}

/**
 * Selector de nivel de autonomía (área F) — Manual→Advisory→Supervised→Full-auto,
 * la válvula maestra de agencia del agente por loop/área. Subir de nivel es una
 * acción sensible → confirmación inline; bajar es inmediato. `disabledAbove` topa
 * el nivel máximo permitido. Reusa `Button` + el patrón de confirmación del DS.
 */
export function AutonomyModeSwitch({
  value,
  onChange,
  disabledAbove,
  className,
  ...props
}: AutonomyModeSwitchProps) {
  const t = useCopy();
  const [pending, setPending] = React.useState<AutonomyLevel | null>(null);
  const capRank = disabledAbove != null ? rank(disabledAbove) : LEVELS.length - 1;

  function choose(level: AutonomyLevel) {
    if (level === value) return;
    if (rank(level) > rank(value)) {
      setPending(level); // subir → confirmar
    } else {
      onChange(level); // bajar → inmediato
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div role="group" aria-label={t.autonomyModeSwitch.levelGroupLabel} className="inline-flex rounded-lg border border-border-default bg-surface-sunken p-0.5">
        {LEVELS.map((lvl) => {
          const selected = lvl.id === value;
          const disabled = rank(lvl.id) > capRank;
          return (
            <button
              key={lvl.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => choose(lvl.id)}
              className={cn(
                "rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
                selected ? "bg-accent text-on-accent" : "text-dim hover:text-ink",
              )}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>

      {pending ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-warn">
            <ShieldAlert className="size-3.5" aria-hidden />
            {t.autonomyModeSwitch.confirmRaise(LEVELS[rank(pending)].label)}
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7"
              onClick={() => {
                onChange(pending);
                setPending(null);
              }}
            >
              {t.autonomyModeSwitch.confirm}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7" onClick={() => setPending(null)}>
              {t.autonomyModeSwitch.cancel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
