import * as React from "react";
import { BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.js";
import { AlarmChip, type AlarmPriority } from "./alarm-chip.js";

export interface Alarm {
  id: string;
  /** Tag del punto/instrumento, ej. "PT-101". */
  tag: string;
  description: string;
  priority: AlarmPriority;
  timestamp?: string;
}

const PRIORITY_BORDER: Record<AlarmPriority, string> = {
  critical: "border-l-block",
  high: "border-l-warn",
  medium: "border-l-review",
  low: "border-l-info",
};

const PRIORITY_TEXT: Record<AlarmPriority, string> = {
  critical: "text-block",
  high: "text-warn",
  medium: "text-review",
  low: "text-info",
};

export interface AlarmBannerProps extends Omit<React.ComponentProps<"div">, "children"> {
  topAlarm?: Alarm;
  unackCount: number;
  onAck?: () => void;
}

/**
 * Banner de alarma persistente (área F, ISA-18.2) — muestra siempre la alarma
 * no-reconocida de mayor prioridad + conteo + reconocer, sin importar la
 * pantalla actual. Cuando no hay alarmas queda calmo y en grises (ISA-101: el
 * color se reserva a lo anormal). Reusa `AlarmChip`.
 */
export function AlarmBanner({ topAlarm, unackCount, onAck, className, ...props }: AlarmBannerProps) {
  const active = topAlarm && unackCount > 0;

  if (!active) {
    return (
      <div
        role="status"
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-[12.5px] text-faint",
          className,
        )}
        {...props}
      >
        <BellOff className="size-4" aria-hidden />
        Sin alarmas activas
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-l-4 border-border-subtle bg-surface-2 px-3 py-2",
        PRIORITY_BORDER[topAlarm.priority],
        className,
      )}
      {...props}
    >
      <AlarmChip priority={topAlarm.priority} state="unack" />
      <div className="min-w-0 flex-1">
        <span className="font-mono text-[11px] font-semibold text-ink">{topAlarm.tag}</span>
        <span className="ml-2 text-[12.5px] text-dim">{topAlarm.description}</span>
      </div>
      {topAlarm.timestamp ? (
        <span className="font-mono text-[10.5px] text-faint tabular-nums">{topAlarm.timestamp}</span>
      ) : null}
      <span className={cn("font-mono text-[11px] font-bold tabular-nums", PRIORITY_TEXT[topAlarm.priority])}>
        {unackCount} sin reconocer
      </span>
      <Button type="button" size="sm" variant="outline" className="h-8" onClick={onAck}>
        Reconocer
      </Button>
    </div>
  );
}
