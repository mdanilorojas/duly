import * as React from "react";
import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DiscountTier {
  /** Descuento máximo (%) que este nivel puede aprobar. */
  maxDiscountPct: number;
  approverRole: string;
  slaHours: number;
}

export interface PricingApprovalMatrixProps extends Omit<React.ComponentProps<"div">, "children"> {
  tiers: DiscountTier[];
  currentDiscount: number;
}

/**
 * Matriz de aprobación de pricing (área E) — gobernanza de deal-desk: enruta un
 * descuento al nivel de aprobación requerido por umbral. Resalta el tier activo
 * para el descuento actual; si excede todos los tiers, requiere excepción. Es lo
 * que separa la venta enterprise de la SMB (pricing como gobernanza aplicable).
 */
export function PricingApprovalMatrix({
  tiers,
  currentDiscount,
  className,
  ...props
}: PricingApprovalMatrixProps) {
  const sorted = [...tiers].sort((a, b) => a.maxDiscountPct - b.maxDiscountPct);
  const activeIndex = sorted.findIndex((t) => currentDiscount <= t.maxDiscountPct);
  const exception = activeIndex === -1;
  const requiredApprover = exception ? "Excepción (fuera de política)" : sorted[activeIndex].approverRole;

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5",
          exception ? "border-block/40 bg-block/10" : "border-border-subtle bg-surface-header",
        )}
      >
        <span className="font-mono text-[12px] text-dim">
          Descuento actual <span className="font-bold text-ink tabular-nums">{currentDiscount}%</span>
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold",
            exception ? "text-block" : "text-accent",
          )}
        >
          {exception ? <AlertTriangle className="size-3.5" aria-hidden /> : null}
          Aprobador: {requiredApprover}
        </span>
      </div>

      <table className="w-full border-collapse text-left text-[12.5px]">
        <caption className="sr-only">Matriz de aprobación de descuentos</caption>
        <thead>
          <tr className="border-b border-border-subtle">
            {["Hasta", "Aprobador", "SLA", "Estado"].map((h, i) => (
              <th
                key={i}
                scope="col"
                className={cn(
                  "px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-faint",
                  i === 3 && "sr-only",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {sorted.map((t, i) => {
            const isActive = i === activeIndex;
            return (
              <tr
                key={t.maxDiscountPct}
                aria-current={isActive ? "step" : undefined}
                className={cn(isActive && "bg-accent-surface/50")}
              >
                <td className="px-3 py-2 font-mono tabular-nums text-ink">≤{t.maxDiscountPct}%</td>
                <td className={cn("px-3 py-2", isActive ? "font-semibold text-accent" : "text-dim")}>{t.approverRole}</td>
                <td className="px-3 py-2 font-mono tabular-nums text-faint">{t.slaHours === 0 ? "auto" : `${t.slaHours}h`}</td>
                <td className="px-3 py-2">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wide text-accent">
                      <Check className="size-3" aria-hidden />
                      Requerido
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
