import * as React from "react";
import { OctagonX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BudgetCap {
  /** Ámbito del cap: agente / workflow / acción. */
  scope: string;
  label: string;
  spentUsd: number;
  capUsd: number;
  /** Callback al alcanzar/superar el tope (auto-halt). */
  onBreach?: (scope: string) => void;
}

export interface BudgetCapGovernorProps extends Omit<React.ComponentProps<"div">, "children"> {
  caps: BudgetCap[];
  title?: string;
}

type CapTone = "ok" | "warn" | "block";
function capTone(pct: number): CapTone {
  if (pct >= 1) return "block";
  if (pct >= 0.7) return "warn";
  return "ok";
}
const BAR: Record<CapTone, string> = { ok: "bg-ok", warn: "bg-warn", block: "bg-block" };
const TXT: Record<CapTone, string> = { ok: "text-ok", warn: "text-warn", block: "text-block" };

const usd = (n: number) => `$${n.toFixed(2)}`;

function CapRow({ cap }: { cap: BudgetCap }) {
  const pct = cap.capUsd > 0 ? cap.spentUsd / cap.capUsd : 0;
  const tone = capTone(pct);
  const halted = pct >= 1;
  const pctLabel = Math.round(pct * 100);

  // auto-halt: notifica una vez cuando el cap está en/ sobre el tope.
  const notified = React.useRef(false);
  React.useEffect(() => {
    if (halted && !notified.current) {
      notified.current = true;
      cap.onBreach?.(cap.scope);
    }
    if (!halted) notified.current = false;
  }, [halted, cap]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
          {cap.label}
          {halted ? (
            <span className="inline-flex items-center gap-1 rounded bg-block/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-block">
              <OctagonX className="size-3" aria-hidden />
              Tope alcanzado
            </span>
          ) : null}
        </span>
        <span className={cn("font-mono text-[11px] tabular-nums", TXT[tone])}>
          {usd(cap.spentUsd)} <span className="text-faint">/ {usd(cap.capUsd)}</span> · {pctLabel}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${cap.label}: presupuesto usado`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pctLabel}
        className="h-2 overflow-hidden rounded-full bg-surface-sunken"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", BAR[tone])}
          style={{ width: `${Math.min(100, pctLabel)}%` }}
        />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wide text-faint">{cap.scope}</span>
    </div>
  );
}

/**
 * Gobernador de presupuesto — item `BudgetCapGovernor` del área G. El
 * `TokenCostMeter` reporta un run ya ocurrido; esto aplica y visualiza topes de
 * gasto por agente/workflow con burn-down vs cap y auto-halt al 100% (2026
 * FinOps: un prompt puede fan-out exponencial y sobregirar antes de que un
 * medidor per-run actualice). Reusa la gramática de umbral ok/warn/block del DS.
 */
export function BudgetCapGovernor({ caps, title = "Topes de presupuesto", className, ...props }: BudgetCapGovernorProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-header px-4 py-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
        <span className="font-mono text-[11px] text-dim">{caps.length} caps</span>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {caps.map((cap) => (
          <CapRow key={cap.scope} cap={cap} />
        ))}
      </div>
    </div>
  );
}
