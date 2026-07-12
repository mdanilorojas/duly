import * as React from "react";
import { ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";
import {
  ApprovalGateCard,
  approvalStatusConfig,
  toneChip,
  type ApprovalStatus,
} from "./approval-gate-card.js";

export interface InterruptQueueItem {
  id: string;
  action: string;
  agent: string;
  riskTone: Tone;
  riskLabel: string;
  what: string;
  why: string;
  blastRadius: string;
  rollback: string;
  requestedAt: string;
  /** Minutos desde que se creó la solicitud — usado solo para ordenar por
   *  edad dentro del mismo nivel de riesgo, no se muestra directamente. */
  ageMinutes: number;
  expiresIn?: string;
  status?: ApprovalStatus;
  decidedBy?: string;
  decidedAt?: string;
  reason?: string;
}

const RISK_WEIGHT: Record<Tone, number> = { block: 4, warn: 3, review: 2, info: 1, ok: 0 };

const dotTone: Record<Tone, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

function QueueRow({
  item,
  onApprove,
  onReject,
  onEscalate,
}: {
  item: InterruptQueueItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEscalate?: (id: string) => void;
}) {
  const t = useCopy();
  const [open, setOpen] = React.useState(false);
  const status = item.status ?? "pending";
  const isPending = status === "pending";

  return (
    <li>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger
          className={cn(
            "flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left hover:bg-surface-3/50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:flex-nowrap",
            !isPending && "opacity-70",
          )}
        >
          <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", dotTone[item.riskTone])} />
          <span className="min-w-0 flex-1">
            <span className="sr-only">
              {item.riskLabel}, {t.approvalStatus[status].label}.{" "}
            </span>
            <span className="block truncate text-[13px] font-medium text-ink">{item.action}</span>
            <span className="flex flex-wrap items-center gap-x-2 font-mono text-[10px] uppercase tracking-wide text-dim">
              <span>{item.agent}</span>
              <span aria-hidden>·</span>
              <span>{item.requestedAt}</span>
            </span>
          </span>
          {isPending && item.expiresIn ? (
            <span className="shrink-0 font-mono text-[10px] text-dim">
              {t.humanInterruptQueue.expiresIn(item.expiresIn)}
            </span>
          ) : (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide",
                toneChip[approvalStatusConfig[status].tone],
              )}
            >
              {t.approvalStatus[status].label}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-dim transition-transform duration-base ease-standard",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </Collapsible.Trigger>
        <Collapsible.Content className="px-3 pb-3 sm:px-4">
          <ApprovalGateCard
            action={item.action}
            agent={item.agent}
            riskTone={item.riskTone}
            riskLabel={item.riskLabel}
            what={item.what}
            why={item.why}
            blastRadius={item.blastRadius}
            rollback={item.rollback}
            requestedAt={item.requestedAt}
            expiresIn={item.expiresIn}
            status={status}
            decidedBy={item.decidedBy}
            decidedAt={item.decidedAt}
            reason={item.reason}
            onApprove={() => onApprove?.(item.id)}
            onReject={() => onReject?.(item.id)}
            onEscalate={() => onEscalate?.(item.id)}
          />
        </Collapsible.Content>
      </Collapsible.Root>
    </li>
  );
}

export interface HumanInterruptQueueProps extends React.ComponentProps<"div"> {
  title?: string;
  items: InterruptQueueItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEscalate?: (id: string) => void;
  emptyLabel?: string;
}

/**
 * Inbox de runs pausados esperando revisión humana, ordenado por riesgo y
 * luego por edad (más riesgoso y más viejo primero) — item #1 de la
 * "Prioridad de construcción" del NORTH_STAR, validado por 5 fuentes
 * independientes (OpenAI guardrails/approvals, Microsoft AG-UI HITL, Codex
 * Remote mobile approvals, patrón fintech KYA, patrón software de cola de
 * aprobación con confidence score). Diseñado mobile-first: cada fila es una
 * sola línea compacta con un target táctil de fila completa; expande a un
 * `ApprovalGateCard` con la evidencia completa, sin depender de hover ni de
 * pantallas anchas.
 */
export function HumanInterruptQueue({
  title,
  items,
  onApprove,
  onReject,
  onEscalate,
  emptyLabel,
  className,
  ...props
}: HumanInterruptQueueProps) {
  const t = useCopy();
  const resolvedTitle = title ?? t.humanInterruptQueue.title;
  const resolvedEmptyLabel = emptyLabel ?? t.humanInterruptQueue.empty;
  const sorted = React.useMemo(
    () =>
      [...items].sort((a, b) => {
        const wa = RISK_WEIGHT[a.riskTone] ?? 0;
        const wb = RISK_WEIGHT[b.riskTone] ?? 0;
        if (wa !== wb) return wb - wa;
        return b.ageMinutes - a.ageMinutes;
      }),
    [items],
  );

  const pendingCount = items.filter((i) => (i.status ?? "pending") === "pending").length;
  const criticalCount = items.filter(
    (i) => (i.status ?? "pending") === "pending" && i.riskTone === "block",
  ).length;

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-1 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{resolvedTitle}</span>
        <span className="font-mono text-[11px] text-dim">
          {pendingCount} {t.humanInterruptQueue.pending}
          {criticalCount > 0 ? ` · ${criticalCount} ${t.humanInterruptQueue.critical}` : ""}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-dim">{resolvedEmptyLabel}</div>
      ) : (
        <ol className="divide-y divide-border-subtle">
          {sorted.map((item) => (
            <QueueRow key={item.id} item={item} onApprove={onApprove} onReject={onReject} onEscalate={onEscalate} />
          ))}
        </ol>
      )}
    </div>
  );
}
