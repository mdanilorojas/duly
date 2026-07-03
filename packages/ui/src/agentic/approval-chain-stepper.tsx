import * as React from "react";
import { Check, X, Clock, CircleDashed, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { actorKindConfig, HashBadge, type AuditActorKind } from "./audit-log-table.js";
import { toneChip } from "./approval-gate-card.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type ChainStepStatus = "approved" | "rejected" | "pending" | "skipped";

interface StepStatusConfig {
  label: string;
  tone: Tone;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export const chainStepStatusConfig: Record<ChainStepStatus, StepStatusConfig> = {
  approved: { label: "Approved", tone: "ok", icon: Check },
  rejected: { label: "Rejected", tone: "block", icon: X },
  pending: { label: "Awaiting decision", tone: "review", icon: Clock },
  skipped: { label: "Skipped", tone: "info", icon: CircleDashed },
};

const stepIconTone: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

export interface ApprovalChainStep {
  id: string;
  actorKind: AuditActorKind;
  /** Nombre del aprobador, ej. "Maria Chen" | "Compliance Sweep Agent". */
  actor: string;
  /** Rol o cargo, ej. "Finance Manager" | "Level 2 auto-reviewer". */
  role: string;
  status: ChainStepStatus;
  decidedAt?: string;
  /** Motivo de la decisión — obligatorio narrativamente para `rejected`. */
  reason?: string;
  /** Hash del registro de decisión (principio #4 — inmutabilidad visible). */
  hash?: string;
  /**
   * Si este paso es la rama alternativa a la que un rechazo anterior fue
   * enrutado (ej. "re-routed to VP Finance after rejection"), se renderiza
   * desplazado con un conector propio en vez de continuar la columna
   * principal — la cadena no es siempre lineal.
   */
  branchFrom?: string;
}

export interface ApprovalChainStepperProps extends React.ComponentProps<"div"> {
  title?: string;
  /** Qué se está aprobando, ej. "Payout #4471 · $128,400 wire transfer". */
  subject?: string;
  steps: ApprovalChainStep[];
}

function chainVerdict(steps: ApprovalChainStep[]): { label: string; tone: Tone } {
  if (steps.length === 0) return { label: "No steps", tone: "info" };
  if (steps.some((s) => s.status === "rejected")) {
    return { label: "Rejected — chain halted", tone: "block" };
  }
  const pendingIndex = steps.findIndex((s) => s.status === "pending");
  if (pendingIndex >= 0) {
    return { label: `Pending — awaiting step ${pendingIndex + 1} of ${steps.length}`, tone: "review" };
  }
  return { label: "Fully approved", tone: "ok" };
}

function StepConnector({ tone }: { tone: Tone }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-px",
        tone === "block" ? "bg-block/40" : "bg-border-subtle",
      )}
    />
  );
}

function StepNode({ step, isLast }: { step: ApprovalChainStep; isLast: boolean }) {
  const actorCfg = actorKindConfig[step.actorKind];
  const statusCfg = chainStepStatusConfig[step.status];
  const StatusIcon = statusCfg.icon;
  const ActorIcon = actorCfg.icon;
  const isBranch = Boolean(step.branchFrom);

  return (
    <li className={cn("relative pb-6 last:pb-0", isBranch && "ml-6 border-l border-dashed border-border-subtle pl-4")}>
      {!isLast && !isBranch ? <StepConnector tone={statusCfg.tone} /> : null}
      {isBranch ? (
        <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-dim">
          <GitBranch className="size-3" aria-hidden /> re-routed after rejection
        </div>
      ) : null}
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-surface-2",
            step.status === "rejected"
              ? "border-block/60"
              : step.status === "approved"
                ? "border-ok/60"
                : step.status === "pending"
                  ? "border-review/60 border-dashed"
                  : "border-border-strong",
          )}
        >
          <StatusIcon className={cn("size-3.5", stepIconTone[statusCfg.tone])} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2.5">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", actorCfg.ring)}
              >
                <ActorIcon className="size-3" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-semibold text-ink">{step.actor}</span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-wide text-dim">
                  {step.role}
                </span>
              </span>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                toneChip[statusCfg.tone],
              )}
            >
              {statusCfg.label}
            </span>
          </div>
          {step.reason ? (
            <p className="mt-2 break-words text-[12px] leading-relaxed text-ink">&ldquo;{step.reason}&rdquo;</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10.5px] text-dim">
            {step.decidedAt ? <span>{step.decidedAt}</span> : null}
            {step.hash ? <HashBadge hash={step.hash} /> : null}
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Quién aprobó qué, cuándo, en qué orden — item #1 de la "Prioridad de
 * construcción" del NORTH_STAR (área C). Complementa `ApprovalGateCard`
 * (evidencia de una sola decisión pendiente): este componente narra la
 * cadena completa de un flujo de aprobación multi-nivel ya resuelto (o en
 * curso), incluyendo ramas de rechazo (un paso rechazado puede re-enrutar
 * a un aprobador alternativo en vez de simplemente detener el flujo).
 * Reutiliza el vocabulario de `AuditLogTable` (actor dual, hash badge) sin
 * introducir tonos ni iconografía nueva.
 */
export function ApprovalChainStepper({
  title = "Approval chain",
  subject,
  steps,
  className,
  ...props
}: ApprovalChainStepperProps) {
  const verdict = chainVerdict(steps);

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-1.5 border-b border-border-subtle bg-surface-header px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              toneChip[verdict.tone],
            )}
          >
            {verdict.label}
          </span>
        </div>
        {subject ? <span className="break-words text-[12.5px] text-ink">{subject}</span> : null}
      </div>

      {steps.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-dim">No approval steps recorded yet.</div>
      ) : (
        <ol className="px-4 py-4">
          {steps.map((step, i) => (
            <StepNode key={step.id} step={step} isLast={i === steps.length - 1} />
          ))}
        </ol>
      )}
    </div>
  );
}
