import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";

export type StepState = "done" | "current" | "pending";

export interface StepperStep {
  label: string;
  state: StepState;
}

export interface StepperProps extends Omit<React.ComponentProps<"ol">, "children"> {
  steps: StepperStep[];
  /** Si se provee, los pasos `done` son clickeables (navegación hacia atrás). */
  onStepClick?: (index: number) => void;
}

const PILL: Record<StepState, string> = {
  done: "text-ok border-ok/50",
  current: "text-accent border-accent-border bg-accent-surface",
  pending: "text-faint border-border-subtle",
};

/**
 * Stepper horizontal de etapas de proceso (pills numeradas) — la stagebar de
 * cualquier ciclo multi-etapa (readiness ISO, wizard, pipeline). Distinto de
 * `ApprovalChainStepper` (cadena vertical de aprobadores, área C). El estado
 * se codifica con número + color + texto sr-only + `aria-current`
 * (colorblind-safe).
 */
export function Stepper({ steps, onStepClick, className, ...props }: StepperProps) {
  const copy = useCopy();
  return (
    <ol aria-label={copy.stepper.label} className={cn("flex flex-wrap gap-1.5", className)} {...props}>
      {steps.map((step, i) => {
        const pill = cn(
          "whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[0.64rem]",
          PILL[step.state],
        );
        const clickable = step.state === "done" && onStepClick != null;
        return (
          <li key={`${step.label}-${i}`} aria-current={step.state === "current" ? "step" : undefined}>
            {clickable ? (
              <button type="button" className={cn(pill, "hover:border-ok")} onClick={() => onStepClick(i)}>
                {i + 1} {step.label}
              </button>
            ) : (
              <span className={pill}>
                {i + 1} {step.label}
              </span>
            )}
            <span className="sr-only">{copy.stepper.state[step.state]}</span>
          </li>
        );
      })}
    </ol>
  );
}
