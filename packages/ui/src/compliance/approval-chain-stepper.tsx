import * as React from "react";
import { Check, X, Clock, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ApprovalDecision = "approved" | "rejected" | "pending" | "escalated";

export interface ApprovalStep {
  approver: string;
  role: string;
  decision: ApprovalDecision;
  /** Marca temporal legible, ej. "10:02". */
  at?: string;
  note?: string;
}

interface DecisionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  ring: string;
  text: string;
}

const DECISION: Record<ApprovalDecision, DecisionConfig> = {
  approved: { label: "Aprobó", icon: Check, ring: "border-ok/70 text-ok", text: "text-ok" },
  rejected: { label: "Rechazó", icon: X, ring: "border-block/70 text-block", text: "text-block" },
  pending: { label: "Pendiente", icon: Clock, ring: "border-review/60 text-review", text: "text-review" },
  escalated: { label: "Escaló", icon: ArrowUpCircle, ring: "border-warn/70 text-warn", text: "text-warn" },
};

export interface ApprovalChainStepperProps extends Omit<React.ComponentProps<"ol">, "children"> {
  steps: ApprovalStep[];
}

/**
 * Cadena de aprobación — item `ApprovalChainStepper` del área C. Muestra quién
 * aprobó qué, cuándo y en qué orden, con la rama de rechazo visible: un rechazo
 * corta la cadena y los pasos posteriores quedan "no alcanzados". La decisión se
 * codifica con ícono + color + etiqueta (colorblind-safe, principio #1). Reusa
 * el vocabulario Tone y el patrón de conector vertical del DS.
 */
export function ApprovalChainStepper({ steps, className, ...props }: ApprovalChainStepperProps) {
  const rejectedIndex = steps.findIndex((s) => s.decision === "rejected");

  return (
    <ol className={cn("flex flex-col", className)} {...props}>
      {steps.map((step, i) => {
        const cfg = DECISION[step.decision];
        const Icon = cfg.icon;
        const unreached = rejectedIndex >= 0 && i > rejectedIndex;
        const isLast = i === steps.length - 1;

        return (
          <li key={`${step.approver}-${i}`} className={cn("flex gap-3", unreached && "opacity-45")}>
            {/* Riel: ícono + conector */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 bg-surface-2",
                  cfg.ring,
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
              {!isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    "w-0.5 flex-1",
                    i < rejectedIndex || rejectedIndex < 0 ? "bg-border-strong" : "bg-border-subtle",
                  )}
                  style={{ minHeight: 20 }}
                />
              ) : null}
            </div>

            {/* Contenido */}
            <div className="flex-1 pb-5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[13px] font-medium text-ink">{step.approver}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">{step.role}</span>
                <span className={cn("font-mono text-[11px] font-semibold", cfg.text)}>· {cfg.label}</span>
                {step.at ? <span className="font-mono text-[10.5px] text-faint">{step.at}</span> : null}
                {unreached ? (
                  <span className="font-mono text-[9.5px] uppercase tracking-wide text-faint">(no alcanzada)</span>
                ) : null}
              </div>
              {step.note ? <p className="mt-1 text-[12px] text-dim">{step.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
