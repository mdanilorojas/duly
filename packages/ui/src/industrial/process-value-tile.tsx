import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProcessValueTileProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  setpoint?: number;
  loLimit?: number;
  hiLimit?: number;
  /** Decimales del valor mostrado (default 1). */
  precision?: number;
}

function pctOf(v: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
}

/**
 * Tile de valor de proceso (área F, ISA-101 High-Performance HMI) — valor
 * numérico grande + barra analógica embebida con marca de setpoint y bandas de
 * límite. Disciplina ISA-101: estado normal en grises (sin color); el color solo
 * aparece cuando el valor sale de límite (lo/hi), acompañado de etiqueta "fuera
 * de límite" (nunca solo color). Desviación del setpoint visible por posición.
 */
export function ProcessValueTile({
  label,
  value,
  unit,
  min,
  max,
  setpoint,
  loLimit,
  hiLimit,
  precision = 1,
  className,
  ...props
}: ProcessValueTileProps) {
  const breached = (loLimit != null && value < loLimit) || (hiLimit != null && value > hiLimit);
  const valuePct = pctOf(value, min, max);
  const setpointPct = setpoint != null ? pctOf(setpoint, min, max) : null;
  const loPct = loLimit != null ? pctOf(loLimit, min, max) : null;
  const hiPct = hiLimit != null ? pctOf(hiLimit, min, max) : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-surface-2 p-3",
        breached ? "border-block/50" : "border-border-subtle",
        className,
      )}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">{label}</span>
        {breached ? (
          <span className="font-mono text-[9px] font-bold uppercase tracking-wide text-block">Fuera de límite</span>
        ) : null}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={cn("font-mono text-2xl font-semibold tabular-nums leading-none", breached ? "text-block" : "text-ink")}>
          {value.toFixed(precision)}
        </span>
        <span className="font-mono text-[11px] text-faint">{unit}</span>
      </div>

      {/* Barra analógica: track gris, bandas de límite, marca de setpoint. */}
      <div className="relative mt-0.5 h-2 rounded-full bg-surface-sunken" aria-hidden>
        {loPct != null ? <span className="absolute inset-y-0 left-0 rounded-l-full bg-block/15" style={{ width: `${loPct}%` }} /> : null}
        {hiPct != null ? <span className="absolute inset-y-0 rounded-r-full bg-block/15" style={{ left: `${hiPct}%`, right: 0 }} /> : null}
        <span
          className={cn("absolute inset-y-0 left-0 rounded-full", breached ? "bg-block" : "bg-dim")}
          style={{ width: `${valuePct}%` }}
        />
        {setpointPct != null ? (
          <span className="absolute inset-y-[-2px] w-0.5 bg-accent" style={{ left: `${setpointPct}%` }} title="Setpoint" />
        ) : null}
      </div>

      <div className="flex justify-between font-mono text-[9px] text-faint tabular-nums">
        <span>{min}</span>
        {setpoint != null ? <span className="text-accent">SP {setpoint}</span> : null}
        <span>{max}</span>
      </div>
    </div>
  );
}
