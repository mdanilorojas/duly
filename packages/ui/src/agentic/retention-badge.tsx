import * as React from "react";
import { LockKeyhole, Archive, Gavel, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import { toneChip } from "./approval-gate-card.js";
import { HashBadge } from "./audit-log-table.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type RetentionRegime = "worm" | "mutable" | "legal-hold";
export type RetentionStatus = "protected" | "eligible-for-deletion" | "hold";

interface StatusConfig {
  label: string;
  tone: Tone;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

// Separado deliberadamente de `ModelProvenanceCard` (Art. 12/13, qué produjo
// un output) — esto es Art. 19 (cuánto tiempo se conserva ese registro).
// `legal-hold` es indefinido por diseño: no tiene tono "block" porque no es
// un fallo, es una obligación activa de conservación que pesa sobre WORM.
export const retentionStatusConfig: Record<RetentionStatus, StatusConfig> = {
  protected: { label: "Protected", tone: "ok", icon: LockKeyhole },
  "eligible-for-deletion": { label: "Eligible for deletion", tone: "warn", icon: Archive },
  hold: { label: "Legal hold — indefinite", tone: "review", icon: Gavel },
};

export const retentionRegimeLabel: Record<RetentionRegime, string> = {
  worm: "WORM",
  mutable: "Mutable",
  "legal-hold": "Legal hold",
};

export interface RetentionRecord {
  recordId: string;
  regime: RetentionRegime;
  status: RetentionStatus;
  /** Fecha desde la que se retiene el registro, ej. "Jan 3, 2026". */
  retainedSince: string;
  /** Ventana mínima legible, ej. "180 days minimum". */
  minRetentionLabel: string;
  /** Base legal/normativa, ej. "EU AI Act Art. 19". */
  legalBasis: string;
  /** Fecha en que se cumple la ventana mínima — omitido si `status` es `hold`. */
  eligibleLabel?: string;
  /** % transcurrido de la ventana mínima (0-100) — solo aplica a `protected`. */
  progressPct?: number;
  /** Hash del registro retenido, reutilizando el vocabulario de inmutabilidad de `AuditLogTable`. */
  hash?: string;
}

/**
 * Pill compacto "WORM, retenido 6+ meses" — señal de confianza de una sola
 * mirada (principio #4, "la inmutabilidad se ve"). Para el detalle completo
 * (base legal, progreso, hash) usar `ImmutabilityIndicator`.
 */
export function RetentionBadge({ record, className }: { record: RetentionRecord; className?: string }) {
  const cfg = retentionStatusConfig[record.status];
  const Icon = cfg.icon;
  return (
    <span
      title={`${retentionRegimeLabel[record.regime]} · ${cfg.label} · ${record.legalBasis}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        toneChip[cfg.tone],
        className,
      )}
    >
      <Icon className="size-2.5" aria-hidden />
      {retentionRegimeLabel[record.regime]}
      <span aria-hidden>·</span>
      {record.minRetentionLabel}
    </span>
  );
}

export interface ImmutabilityIndicatorProps extends Omit<React.ComponentProps<"div">, "children"> {
  title?: string;
  record: RetentionRecord;
  defaultOpen?: boolean;
}

/**
 * Detalle expandible de retención/inmutabilidad — item #1 de la Prioridad
 * de construcción del NORTH_STAR (área C), complemento de `RetentionBadge`.
 * Separa explícitamente Art. 19 (esta tarjeta) de Art. 12/13
 * (`AuditLogTable`/`ModelProvenanceCard`): un mismo registro puede tener un
 * hash de auditoría *y* una obligación de retención distinta, y ambas deben
 * poder auditarse por separado. Reutiliza el patrón `Collapsible` de
 * `GuardrailIndicator` en vez de introducir un primitive nuevo.
 */
export function ImmutabilityIndicator({
  title = "Retention & immutability",
  record,
  defaultOpen = false,
  className,
  ...props
}: ImmutabilityIndicatorProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const cfg = retentionStatusConfig[record.status];
  const Icon = cfg.icon;
  const showProgress = record.status === "protected" && typeof record.progressPct === "number";

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={cn("overflow-hidden rounded-lg border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <Collapsible.Trigger
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bg-elevated/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        aria-label={`${title}: ${retentionRegimeLabel[record.regime]}, ${cfg.label}. ${open ? "Collapse" : "Expand"} detail.`}
      >
        <span className={cn("flex size-5 shrink-0 items-center justify-center rounded", toneChip[cfg.tone])}>
          <Icon className="size-3" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wide text-dim">{title}</span>
          <span className="block text-[12px] font-medium text-ink">
            {retentionRegimeLabel[record.regime]} · {cfg.label}
          </span>
        </span>
        <ChevronDown
          className={cn("size-3.5 shrink-0 text-dim transition-transform duration-base ease-standard", open && "rotate-180")}
          aria-hidden
        />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div className="flex flex-col gap-3 border-t border-border-subtle px-3.5 py-3">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-dim">Retained since</dt>
              <dd className="mt-0.5 text-[12px] text-ink">{record.retainedSince}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-dim">
                {record.status === "hold" ? "Eligible" : "Minimum window"}
              </dt>
              <dd className="mt-0.5 text-[12px] text-ink">
                {record.status === "hold" ? "Held indefinitely" : record.minRetentionLabel}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-dim">Legal basis</dt>
              <dd className="mt-0.5 text-[12px] text-ink">{record.legalBasis}</dd>
            </div>
            {record.eligibleLabel ? (
              <div className="col-span-2">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-dim">
                  Deletion eligible
                </dt>
                <dd className="mt-0.5 text-[12px] text-ink">{record.eligibleLabel}</dd>
              </div>
            ) : null}
          </dl>

          {showProgress ? (
            <div>
              <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-dim">
                <span className="uppercase tracking-wide">Retention window elapsed</span>
                <span className="font-semibold text-ink">{Math.round(record.progressPct!)}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(record.progressPct!)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Retention window elapsed"
                className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated"
              >
                <span
                  className="block h-full rounded-full bg-ok"
                  style={{ width: `${Math.min(record.progressPct!, 100)}%` }}
                />
              </div>
            </div>
          ) : null}

          {record.hash ? (
            <div className="flex items-center gap-1.5 border-t border-border-subtle pt-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-dim">Record hash</span>
              <HashBadge hash={record.hash} />
            </div>
          ) : null}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
