import * as React from "react";
import {
  ShieldAlert,
  Check,
  X,
  ArrowUpCircle,
  Clock,
  Radar,
  Undo2,
  FileQuestion,
  MessageCircleQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../components/ui/button.js";
import { useCopy } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

/**
 * Estado de una solicitud de aprobación humana. `expired` es el resultado de
 * un timeout no atendido — el NORTH_STAR (principio #3, "un botón Approve
 * nunca va desnudo") pide que el timeout tenga una resolución visible, no que
 * la tarjeta simplemente desaparezca.
 */
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "expired";

export const toneChip: Record<Tone, string> = {
  info: "bg-info/15 text-info",
  ok: "bg-ok/15 text-ok",
  review: "bg-review/15 text-review",
  warn: "bg-warn/15 text-warn",
  block: "bg-block/15 text-block",
};

const riskRing: Record<Tone, string> = {
  info: "border-info/40",
  ok: "border-ok/40",
  review: "border-review/40",
  warn: "border-warn/40",
  block: "border-block/50",
};

interface StatusConfig {
  tone: Tone;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

// label/verb viven en el diccionario de copy (t.approvalStatus) — este mapa
// solo aporta lo visual (tono + ícono), compartido entre locales.
export const approvalStatusConfig: Record<ApprovalStatus, StatusConfig> = {
  pending: { tone: "review", icon: Clock },
  approved: { tone: "ok", icon: Check },
  rejected: { tone: "block", icon: X },
  escalated: { tone: "warn", icon: ArrowUpCircle },
  expired: { tone: "block", icon: Clock },
};

function EvidenceField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
      <dt className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">
        <Icon className="size-3" aria-hidden /> {label}
      </dt>
      <dd className="mt-1 break-words text-[12.5px] leading-relaxed text-ink">{value}</dd>
    </div>
  );
}

function StatusChip({ status }: { status: ApprovalStatus }) {
  const t = useCopy();
  const cfg = approvalStatusConfig[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
        toneChip[cfg.tone],
      )}
    >
      <Icon className="size-3" aria-hidden /> {t.approvalStatus[status].label}
    </span>
  );
}

export interface ApprovalGateCardProps extends Omit<React.ComponentProps<"article">, "children"> {
  /** Acción que el agente quiere ejecutar, ej. "Delete 1,204 dormant customer accounts". */
  action: string;
  /** Agente que solicita la aprobación, ej. "COMPLIANCE SWEEP AGENT". */
  agent: string;
  /** Tono de riesgo — reutiliza el mismo vocabulario de 5 tonos del sistema. */
  riskTone: Tone;
  /** Etiqueta de riesgo visible, ej. "Critical risk". */
  riskLabel: string;
  /** Qué va a pasar si se aprueba. */
  what: string;
  /** Por qué el agente lo está pidiendo (razonamiento / evidencia que lo motivó). */
  why: string;
  /** Alcance del impacto, ej. "1,204 cuentas · 3 regiones · sin afectar cuentas activas". */
  blastRadius: string;
  /** Plan de reversión si la acción resulta incorrecta. */
  rollback: string;
  requestedAt: string;
  /** Cuenta regresiva legible, ej. "4m 12s". Solo se muestra si `status="pending"`. */
  expiresIn?: string;
  status?: ApprovalStatus;
  /** Quién resolvió la solicitud — humano o sistema (auto-escalate por timeout). */
  decidedBy?: string;
  decidedAt?: string;
  /** Nota de resolución, ej. motivo de rechazo. */
  reason?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onEscalate?: () => void;
}

/**
 * Un "gate" de aprobación humana para una acción de agente de alto riesgo.
 * Sigue el principio #3 del NORTH_STAR: un botón Approve nunca va desnudo —
 * siempre lleva evidencia (qué / por qué / blast radius / rollback) visible
 * antes de decidir, no enterrada en un modal aparte. Approve/Reject/Escalate
 * son acciones de igual peso visual (ninguna es "la fácil"), con foco táctil
 * ≥24px (WCAG 2.2 SC 2.5.8) y mobile-first (stack vertical en pantallas
 * angostas — ver nota NORTH_STAR sobre Codex Remote / aprobaciones móviles).
 */
export function ApprovalGateCard({
  action,
  agent,
  riskTone,
  riskLabel,
  what,
  why,
  blastRadius,
  rollback,
  requestedAt,
  expiresIn,
  status = "pending",
  decidedBy,
  decidedAt,
  reason,
  onApprove,
  onReject,
  onEscalate,
  className,
  ...props
}: ApprovalGateCardProps) {
  const t = useCopy();
  const isPending = status === "pending";

  return (
    <article
      aria-label={`${t.approvalGateCard.requestAriaLabel(action, riskLabel)}${isPending ? "" : `, ${t.approvalStatus[status].label}`}`}
      className={cn(
        "overflow-hidden rounded-xl border bg-surface-2",
        riskRing[riskTone],
        !isPending && "opacity-90",
        className,
      )}
      {...props}
    >
      <header className="flex flex-col gap-2 border-b border-border-subtle bg-surface-header px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
                toneChip[riskTone],
              )}
            >
              <ShieldAlert className="size-3" aria-hidden /> {riskLabel}
            </span>
            {!isPending ? <StatusChip status={status} /> : null}
          </div>
          <h3 className="break-words text-sm font-semibold text-ink">{action}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] uppercase tracking-wide text-dim">
            <span>{agent}</span>
            <span aria-hidden>·</span>
            <span>{requestedAt}</span>
          </div>
        </div>
        {isPending && expiresIn ? (
          <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-[10.5px] text-dim">
            <Clock className="size-3" aria-hidden /> {t.approvalGateCard.expiresIn(expiresIn)}
          </span>
        ) : null}
      </header>

      <dl className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-2">
        <EvidenceField icon={FileQuestion} label={t.approvalGateCard.what} value={what} />
        <EvidenceField icon={MessageCircleQuestion} label={t.approvalGateCard.why} value={why} />
        <EvidenceField icon={Radar} label={t.approvalGateCard.blastRadius} value={blastRadius} />
        <EvidenceField icon={Undo2} label={t.approvalGateCard.rollback} value={rollback} />
      </dl>

      {isPending ? (
        <div className="flex flex-col gap-2 border-t border-border-subtle px-4 py-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onEscalate}
            className="w-full border-warn/40 text-warn hover:bg-warn/10 hover:text-warn sm:w-auto"
          >
            <ArrowUpCircle className="size-3.5" aria-hidden /> {t.common.escalate}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            className="w-full border-block/40 text-block hover:bg-block/10 hover:text-block sm:w-auto"
          >
            <X className="size-3.5" aria-hidden /> {t.common.reject}
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            className="w-full bg-ok text-on-ok hover:bg-ok/90 sm:w-auto"
          >
            <Check className="size-3.5" aria-hidden /> {t.common.approve}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border-subtle px-4 py-2.5 font-mono text-[11px] text-dim">
          {decidedBy ? (
            <span>
              {t.approvalGateCard.decidedBy(t.approvalStatus[status].verb, decidedBy)}
              {decidedAt ? ` · ${decidedAt}` : ""}
            </span>
          ) : null}
          {reason ? <span className="text-ink">&ldquo;{reason}&rdquo;</span> : null}
        </div>
      )}
    </article>
  );
}
