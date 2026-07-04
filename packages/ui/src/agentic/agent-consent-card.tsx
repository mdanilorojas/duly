import * as React from "react";
import { ShieldCheck, ShieldOff, Ban, Clock, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../components/ui/button.js";
import { Checkbox } from "../components/ui/checkbox.js";
import { AgentCore } from "./agent-core.js";
import type { NeuralAgent } from "./neural-agents.js";
import type { Tone } from "../trace-log/trace-log.variants.js";
import { toneChip } from "./approval-gate-card.js";

export type ConsentStatus = "pending" | "consented" | "declined" | "revoked";

export interface ConsentScopeItem {
  id: string;
  /** Acción concreta dentro del alcance, ej. "Initiate wire transfers up to $50,000". */
  label: string;
  /** Por qué el agente necesita este permiso. */
  detail?: string;
  riskTone: Tone;
}

export interface ConsentLimit {
  label: string;
  value: string;
}

const dotTone: Record<Tone, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

interface ConsentStatusConfig {
  label: string;
  tone: Tone;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export const consentStatusConfig: Record<ConsentStatus, ConsentStatusConfig> = {
  pending: { label: "Awaiting consent", tone: "review", icon: Clock },
  consented: { label: "Consent granted", tone: "ok", icon: ShieldCheck },
  declined: { label: "Consent declined", tone: "block", icon: ShieldOff },
  revoked: { label: "Consent revoked", tone: "block", icon: Ban },
};

export interface AgentConsentCardProps extends Omit<React.ComponentProps<"article">, "children"> {
  /** Identidad del agente — reutiliza el core WebGL de la galería de agentes. */
  agent: NeuralAgent;
  status?: ConsentStatus;
  /** Permisos que el agente ejercerá — cada uno debe reconocerse (checkbox) antes de poder otorgar consentimiento. */
  scope: ConsentScopeItem[];
  /** Límites configurables del grant, ej. tope de gasto, vigencia, revocabilidad. */
  limits: ConsentLimit[];
  requestedAt: string;
  consentedBy?: string;
  consentedAt?: string;
  declinedReason?: string;
  revokedBy?: string;
  revokedAt?: string;
  onConsent?: () => void;
  onDecline?: () => void;
  onRevoke?: () => void;
}

/**
 * Perfil de agente + alcance + consentimiento explícito antes de una acción
 * sensible — patrón "Know Your Agent" (KYA) confirmado en fintech (ver
 * NORTH_STAR B, nueva fila 2026-07-02): perfil visible del agente,
 * consentimiento explícito por permiso y límites configurables antes de
 * ejecutar, no un solo botón "Allow" genérico como un OAuth scope grant
 * tradicional. Reutiliza `AgentCore` (identidad WebGL) para que el usuario
 * reconozca al agente visualmente, y el mismo vocabulario de tono/estado que
 * `ApprovalGateCard` (principio #3 NORTH_STAR: un estado resuelto nunca
 * desaparece silenciosamente — declined/revoked quedan visibles con motivo).
 * A diferencia de `ApprovalGateCard` (aprobación puntual de una acción ya
 * decidida por el agente), `AgentConsentCard` es el grant de autoridad previo
 * y reusable: cada permiso se acepta por separado, y un grant ya otorgado
 * puede revocarse en cualquier momento.
 */
export function AgentConsentCard({
  agent,
  status = "pending",
  scope,
  limits,
  requestedAt,
  consentedBy,
  consentedAt,
  declinedReason,
  revokedBy,
  revokedAt,
  onConsent,
  onDecline,
  onRevoke,
  className,
  ...props
}: AgentConsentCardProps) {
  const [acked, setAcked] = React.useState<Set<string>>(new Set());
  const isPending = status === "pending";
  const allAcked = scope.length > 0 && scope.every((item) => acked.has(item.id));
  const cfg = consentStatusConfig[status];
  const StatusIcon = cfg.icon;

  function toggle(id: string) {
    setAcked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <article
      aria-label={`Agent consent request: ${agent.name} — ${cfg.label}`}
      className={cn(
        "overflow-hidden rounded-xl border border-border-subtle bg-surface-2",
        !isPending && "opacity-90",
        className,
      )}
      {...props}
    >
      <header className="flex flex-col gap-3 border-b border-border-subtle bg-surface-header px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <AgentCore agent={agent} size={44} className="shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-ink">{agent.name}</span>
              <span className="rounded bg-surface-3/60 px-1.5 py-0.5 font-mono text-[9.5px] tracking-wider text-dim">
                {agent.id}
              </span>
            </div>
            <p className="truncate text-[11.5px] text-dim">{agent.role}</p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-faint">
              Requested {requestedAt}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 self-start rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide sm:self-auto",
            toneChip[cfg.tone],
          )}
        >
          <StatusIcon className="size-3" aria-hidden /> {cfg.label}
        </span>
      </header>

      <div className="border-b border-border-subtle px-4 py-3">
        <h4 className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">
          <ScrollText className="size-3" aria-hidden /> Requested scope
        </h4>
        <ul className="space-y-2">
          {scope.map((item) => {
            const checked = acked.has(item.id);
            const fieldId = `consent-${agent.id}-${item.id}`;
            return (
              <li
                key={item.id}
                className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2"
              >
                {isPending ? (
                  <Checkbox
                    id={fieldId}
                    checked={checked}
                    onCheckedChange={() => toggle(item.id)}
                    aria-describedby={item.detail ? `${fieldId}-detail` : undefined}
                    className="mt-0.5"
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn("mt-1.5 size-2 shrink-0 rounded-full", dotTone[item.riskTone])}
                  />
                )}
                <label
                  htmlFor={isPending ? fieldId : undefined}
                  className={cn("min-w-0 flex-1", isPending && "cursor-pointer")}
                >
                  <span className="block text-[12.5px] font-medium text-ink">{item.label}</span>
                  {item.detail ? (
                    <span id={`${fieldId}-detail`} className="mt-0.5 block text-[11px] leading-relaxed text-dim">
                      {item.detail}
                    </span>
                  ) : null}
                </label>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                    toneChip[item.riskTone],
                  )}
                >
                  {item.riskTone}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-4">
        {limits.map((limit) => (
          <div
            key={limit.label}
            className="min-w-0 rounded-lg border border-border-subtle bg-bg-elevated px-2.5 py-2"
          >
            <dt className="font-mono text-[9px] font-bold uppercase tracking-wide text-dim">{limit.label}</dt>
            <dd className="mt-0.5 truncate text-[12px] font-semibold text-ink">{limit.value}</dd>
          </div>
        ))}
      </dl>

      {isPending ? (
        <div className="flex flex-col gap-2 border-t border-border-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-dim">
            {allAcked
              ? "All scope items acknowledged."
              : `${acked.size}/${scope.length} scope items acknowledged — check each to continue.`}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={onDecline}
              className="w-full border-block/40 text-block hover:bg-block/10 hover:text-block sm:w-auto"
            >
              <ShieldOff className="size-3.5" aria-hidden /> Decline
            </Button>
            <Button
              size="sm"
              onClick={onConsent}
              disabled={!allAcked}
              className="w-full bg-ok text-on-ok hover:bg-ok/90 disabled:pointer-events-none disabled:opacity-40 sm:w-auto"
            >
              <ShieldCheck className="size-3.5" aria-hidden /> Grant consent
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle px-4 py-2.5 font-mono text-[11px] text-dim">
          <span>
            {status === "consented" && consentedBy
              ? `Consented by ${consentedBy}${consentedAt ? ` · ${consentedAt}` : ""}`
              : null}
            {status === "declined"
              ? `Declined${declinedReason ? ` — "${declinedReason}"` : ""}`
              : null}
            {status === "revoked" && revokedBy
              ? `Revoked by ${revokedBy}${revokedAt ? ` · ${revokedAt}` : ""}`
              : null}
          </span>
          {status === "consented" && onRevoke ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRevoke}
              className="border-block/40 text-block hover:bg-block/10 hover:text-block"
            >
              <Ban className="size-3.5" aria-hidden /> Revoke
            </Button>
          ) : null}
        </div>
      )}
    </article>
  );
}
