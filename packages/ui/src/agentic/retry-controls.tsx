import * as React from "react";
import { RotateCcw, RotateCw, User, Cpu, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../components/ui/button.js";
import { toneChip } from "./approval-gate-card.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

/** Quién disparó el retry — dualidad de actor (principio #5 NORTH_STAR). */
export type RetryTrigger = "manual" | "automatic";

export interface RetryAttemptRecord {
  attempt: number;
  status: "success" | "error" | "retrying";
  trigger: RetryTrigger;
  /** Nombre del actor si `trigger="manual"`, ej. "Maria Chen". Se omite en automático. */
  actor?: string;
  at: string;
}

const attemptStatusTone: Record<RetryAttemptRecord["status"], Tone> = {
  success: "ok",
  error: "block",
  retrying: "warn",
};

const attemptStatusIcon: Record<RetryAttemptRecord["status"], React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  success: Check,
  error: X,
  retrying: Loader2,
};

function AttemptHistoryRow({ record }: { record: RetryAttemptRecord }) {
  const tone = attemptStatusTone[record.status];
  const Icon = attemptStatusIcon[record.status];
  const TriggerIcon = record.trigger === "manual" ? User : Cpu;
  return (
    <li className="flex items-center gap-2 py-1 font-mono text-[10.5px]">
      <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wide", toneChip[tone])}>
        <Icon className={cn("size-2.5", record.status === "retrying" && "motion-safe:animate-spin")} aria-hidden />
        #{record.attempt}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-1 text-dim">
        <TriggerIcon className="size-3 shrink-0" aria-hidden />
        <span className="truncate">
          {record.trigger === "manual" ? `Manual retry${record.actor ? ` by ${record.actor}` : ""}` : "Automatic retry"}
        </span>
      </span>
      <span className="shrink-0 text-dim">{record.at}</span>
    </li>
  );
}

export interface RetryControlsProps extends React.ComponentProps<"div"> {
  /** Intento actual / máximo permitido por la política de retry del workflow. */
  attempt: [current: number, max: number];
  /** Título del nodo que falló, ej. "HTTP Request: Push to DocuSign". Si se omite, solo se ofrece retry-desde-inicio. */
  failedNodeTitle?: string;
  history?: RetryAttemptRecord[];
  onRetryFromStart?: () => void;
  onRetryFromFailedNode?: () => void;
  disabled?: boolean;
  /** `inline` se usa anclado al marcador "Failed here" de `RunInspector` (más compacto, sin marco propio). */
  variant?: "standalone" | "inline";
}

/**
 * Retry-desde-inicio vs retry-desde-nodo-fallido con contador de intentos —
 * nueva prioridad #1 del NORTH_STAR (área A, n8n/proceso empresarial) tras
 * cerrar `EvidenceExportDialog`/`ApprovalChainStepper`. Reutiliza el
 * vocabulario ya establecido: `toneChip` de `ApprovalGateCard` para el tono
 * de cada intento en el historial, y se ancla directamente al marcador
 * "Failed here" de `RunInspector` (variant="inline") en vez de vivir como
 * una consola aparte, tal como pedía la nota de diseño del NORTH_STAR.
 * Cuando `attempt[0] >= attempt[1]` ambos botones se deshabilitan y se
 * muestra el aviso "Max retries reached" — un límite de política nunca debe
 * ser silencioso (principio #1: todo estado está diseñado).
 */
export function RetryControls({
  attempt,
  failedNodeTitle,
  history = [],
  onRetryFromStart,
  onRetryFromFailedNode,
  disabled = false,
  variant = "standalone",
  className,
  ...props
}: RetryControlsProps) {
  const [current, max] = attempt;
  const maxReached = current >= max;
  const isDisabled = disabled || maxReached;

  return (
    <div
      className={cn(
        variant === "standalone" && "overflow-hidden rounded-xl border border-border-subtle bg-surface-2",
        className,
      )}
      {...props}
    >
      {variant === "standalone" ? (
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-header px-4 py-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">Retry controls</span>
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim ring-1 ring-border-subtle"
            aria-label={`Attempt ${current} of ${max}`}
          >
            {current}/{max} attempts
          </span>
        </div>
      ) : null}

      <div className={cn(variant === "standalone" ? "px-4 py-3" : "mt-2")}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={isDisabled}
            onClick={onRetryFromStart}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Retry from start
          </Button>
          {failedNodeTitle ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={onRetryFromFailedNode}
              className="w-full border-block/40 text-block hover:bg-block/10 hover:text-block sm:w-auto"
            >
              <RotateCw className="size-3.5" aria-hidden />
              <span className="truncate">Retry from failed node</span>
            </Button>
          ) : null}
          {variant === "inline" ? (
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim ring-1 ring-border-subtle sm:ml-auto"
              aria-label={`Attempt ${current} of ${max}`}
            >
              {current}/{max} attempts
            </span>
          ) : null}
        </div>

        {maxReached ? (
          <p className="mt-2 text-[11px] font-semibold text-block">
            Max retries reached — escalate to error handler or fix the root cause before retrying manually.
          </p>
        ) : null}

        {history.length > 0 ? (
          <div className="mt-3 border-t border-border-subtle pt-2">
            <div className="mb-1 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">History</div>
            <ol className="divide-y divide-border-subtle">
              {history.map((record) => (
                <AttemptHistoryRow key={record.attempt} record={record} />
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
}
