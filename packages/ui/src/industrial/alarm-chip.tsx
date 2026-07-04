import * as React from "react";
import { AlertTriangle, Check, CornerUpLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type AlarmPriority = "critical" | "high" | "medium" | "low";
export type AlarmState = "unack" | "ack" | "rtn" | "shelved";

const PRIORITY: Record<AlarmPriority, { label: string; tone: Tone }> = {
  critical: { label: "Critical", tone: "block" },
  high: { label: "High", tone: "warn" },
  medium: { label: "Medium", tone: "review" },
  low: { label: "Low", tone: "info" },
};

const STATE: Record<
  AlarmState,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  }
> = {
  unack: { label: "Unacked", icon: AlertTriangle },
  ack: { label: "Acked", icon: Check },
  rtn: { label: "Returned", icon: CornerUpLeft },
  shelved: { label: "Shelved", icon: Clock },
};

const TONE_SOLID: Record<Tone, string> = {
  info: "border-info/50 bg-info/15 text-info",
  ok: "border-ok/50 bg-ok/15 text-ok",
  review: "border-review/50 bg-review/15 text-review",
  warn: "border-warn/50 bg-warn/15 text-warn",
  block: "border-block/60 bg-block/20 text-block",
};

export interface AlarmChipProps extends Omit<React.ComponentProps<"span">, "children"> {
  priority: AlarmPriority;
  state: AlarmState;
}

/**
 * Chip de alarma (área F, ISA-18.2) — prioridad (critical/high/medium/low) ×
 * estado (unack/ack/rtn/shelved). Primitiva base del área: la reusan
 * `AlarmBanner` y `AlarmSummaryTable`. Severidad codificada con color + FORMA +
 * etiqueta (nunca solo color — requisito ISA-101/colorblind). `unack` va sólido;
 * `ack` outline; `shelved` punteado y atenuado.
 */
export function AlarmChip({ priority, state, className, ...props }: AlarmChipProps) {
  const p = PRIORITY[priority];
  const s = STATE[state];
  const Icon = s.icon;

  return (
    <span
      role="status"
      aria-label={`Alarma ${p.label}, ${s.label}`}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide",
        TONE_SOLID[p.tone],
        state === "ack" && "bg-transparent",
        state === "rtn" && "bg-transparent opacity-80",
        state === "shelved" && "border-dashed bg-transparent opacity-60",
        className,
      )}
      {...props}
    >
      <Icon className="size-3" aria-hidden />
      {p.label}
    </span>
  );
}
