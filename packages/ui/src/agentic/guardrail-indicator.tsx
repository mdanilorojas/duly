import * as React from "react";
import { ShieldCheck, ShieldAlert, ShieldBan, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import { toneChip } from "./approval-gate-card.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type GuardrailStatus = "passed" | "warned" | "blocked";
export type GuardrailCategory = "input" | "output" | "tool";

/**
 * Un policy check evaluado sobre un turno de agente. El vocabulario
 * input/output/tool sigue la guía "Guardrails and human review" de OpenAI
 * (NORTH_STAR, área B, nota 2026-07-02) — un guardrail nunca es genérico,
 * siempre corre en una de esas tres superficies.
 */
export interface GuardrailPolicy {
  id: string;
  /** Nombre de la política, ej. "PII redaction". */
  name: string;
  category: GuardrailCategory;
  status: GuardrailStatus;
  /** Qué evaluó y por qué disparó (o no) este resultado. */
  rationale: string;
}

const statusTone: Record<GuardrailStatus, Tone> = {
  passed: "ok",
  warned: "warn",
  blocked: "block",
};

const statusIcon: Record<GuardrailStatus, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  passed: ShieldCheck,
  warned: ShieldAlert,
  blocked: ShieldBan,
};

const statusLabel: Record<GuardrailStatus, string> = {
  passed: "Passed",
  warned: "Warned",
  blocked: "Blocked",
};

const categoryLabel: Record<GuardrailCategory, string> = {
  input: "Input",
  output: "Output",
  tool: "Tool",
};

// Orden de severidad para el pill resumen: un solo guardrail bloqueado pesa
// más que 10 pasados — nunca se promedia ni se oculta detrás de un conteo.
const severity: Record<GuardrailStatus, number> = { passed: 0, warned: 1, blocked: 2 };

function worstStatus(policies: GuardrailPolicy[]): GuardrailStatus {
  return policies.reduce<GuardrailStatus>(
    (worst, p) => (severity[p.status] > severity[worst] ? p.status : worst),
    "passed",
  );
}

function summaryText(policies: GuardrailPolicy[]): string {
  const counts = policies.reduce(
    (acc, p) => {
      acc[p.status] += 1;
      return acc;
    },
    { passed: 0, warned: 0, blocked: 0 } as Record<GuardrailStatus, number>,
  );
  const parts: string[] = [];
  if (counts.blocked > 0) parts.push(`${counts.blocked} blocked`);
  if (counts.warned > 0) parts.push(`${counts.warned} warned`);
  if (counts.passed > 0) parts.push(`${counts.passed} passed`);
  return parts.join(" · ") || "No checks run";
}

interface PolicyRowProps {
  policy: GuardrailPolicy;
}

function PolicyRow({ policy }: PolicyRowProps) {
  const Icon = statusIcon[policy.status];
  const tone = statusTone[policy.status];
  return (
    <li className="flex items-start gap-2.5 border-t border-border-subtle px-3.5 py-2.5 first:border-t-0">
      <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded", toneChip[tone])}>
        <Icon className="size-3" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-dim">
            {categoryLabel[policy.category]}
          </span>
          <span className="text-[12.5px] font-semibold text-ink">{policy.name}</span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              toneChip[tone],
            )}
          >
            {statusLabel[policy.status]}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-dim">{policy.rationale}</p>
      </div>
    </li>
  );
}

export interface GuardrailIndicatorProps extends Omit<React.ComponentProps<"div">, "children"> {
  label?: string;
  policies: GuardrailPolicy[];
  defaultOpen?: boolean;
}

/**
 * Pill resumen passed/warned/blocked que expande a la lista de políticas que
 * lo componen — item #1 de la Prioridad de construcción del NORTH_STAR
 * (área B). El tono resumen es siempre el peor de la lista (bloqueado gana
 * sobre pasado), consistente con el principio #1 de credibilidad enterprise
 * ("todo estado está diseñado" — un guardrail bloqueado nunca se diluye
 * dentro de un conteo agregado).
 */
export function GuardrailIndicator({
  label = "Guardrails",
  policies,
  defaultOpen = false,
  className,
  ...props
}: GuardrailIndicatorProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const overall = worstStatus(policies);
  const OverallIcon = statusIcon[overall];

  if (policies.length === 0) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-[11px] text-dim", className)} {...props}>
        <ShieldCheck className="size-3.5" aria-hidden /> No guardrails configured
      </div>
    );
  }

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={cn("overflow-hidden rounded-lg border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <Collapsible.Trigger
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
          "hover:bg-bg-elevated/60",
        )}
        aria-label={`${label}: ${summaryText(policies)}. ${open ? "Collapse" : "Expand"} policy detail.`}
      >
        <span className={cn("flex size-5 shrink-0 items-center justify-center rounded", toneChip[statusTone[overall]])}>
          <OverallIcon className="size-3" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wide text-dim">{label}</span>
          <span className="block text-[12px] font-medium text-ink">{summaryText(policies)}</span>
        </span>
        <ChevronDown
          className={cn("size-3.5 shrink-0 text-dim transition-transform duration-base ease-standard", open && "rotate-180")}
          aria-hidden
        />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <ul>
          {policies.map((policy) => (
            <PolicyRow key={policy.id} policy={policy} />
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

/**
 * Chip compacto de un solo guardrail, sin expandir — para embeber en filas
 * densas (ej. junto al costo de un span en `TraceTree`) donde una tarjeta
 * completa no cabe. El `title` nativo expone la rationale sin depender de
 * JS adicional para el caso de uso inline.
 */
export function GuardrailChip({ policy }: { policy: GuardrailPolicy }) {
  const Icon = statusIcon[policy.status];
  const tone = statusTone[policy.status];
  return (
    <span
      title={`${policy.name} (${categoryLabel[policy.category]}): ${policy.rationale}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        toneChip[tone],
      )}
    >
      <Icon className="size-2.5" aria-hidden /> {policy.name}
    </span>
  );
}
