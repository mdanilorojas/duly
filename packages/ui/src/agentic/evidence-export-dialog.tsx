import * as React from "react";
import { FileText, FileJson, FileSpreadsheet, ShieldCheck, Download, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../components/ui/button.js";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group.js";
import { Label } from "../components/ui/label.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog.js";
import { HashBadge } from "./audit-log-table.js";

export type EvidenceExportFormat = "pdf" | "csv" | "json";

const formatConfig: Record<
  EvidenceExportFormat,
  {
    label: string;
    hint: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  }
> = {
  pdf: { label: "PDF", hint: "Signed report, human-readable", icon: FileText },
  csv: { label: "CSV", hint: "Row-per-event, spreadsheet-ready", icon: FileSpreadsheet },
  json: { label: "JSON", hint: "Machine-readable, full fidelity", icon: FileJson },
};

export interface EvidenceExportDialogProps {
  /** Elemento que abre el diálogo — por defecto un botón "Export evidence". */
  trigger?: React.ReactNode;
  title?: string;
  /** Rango filtrado que se va a exportar, ej. "Jun 1 – Jun 30, 2026 · All actors". */
  rangeLabel: string;
  eventCount: number;
  /** Hashes de los registros incluidos, para el manifiesto de inmutabilidad. */
  manifestHashes: string[];
  /** Identidad que firma el export, ej. "Maria Chen (Compliance Lead)". */
  signedBy: string;
  defaultFormat?: EvidenceExportFormat;
  onExport?: (format: EvidenceExportFormat) => void;
}

/**
 * Export firmado de un rango de auditoría filtrado — item #1 de la
 * "Prioridad de construcción" del NORTH_STAR (área C), junto a
 * `ApprovalChainStepper`. Modela el principio #4 ("la inmutabilidad se ve"):
 * antes de exportar, el auditor ve exactamente cuántos registros y qué
 * hashes van incluidos en el manifiesto — el export no es una caja negra.
 * Tras exportar, la confirmación muestra el hash del manifiesto firmado
 * completo, no solo un toast de "listo".
 */
export function EvidenceExportDialog({
  trigger,
  title = "Export evidence",
  rangeLabel,
  eventCount,
  manifestHashes,
  signedBy,
  defaultFormat = "pdf",
  onExport,
}: EvidenceExportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [format, setFormat] = React.useState<EvidenceExportFormat>(defaultFormat);
  const [phase, setPhase] = React.useState<"form" | "done">("form");

  const manifestHash = React.useMemo(() => {
    if (manifestHashes.length === 0) return "0x0";
    // Firma sintética y determinística del manifiesto para demo — no criptográfica.
    const joined = manifestHashes.join("");
    let sum = 0;
    for (let i = 0; i < joined.length; i++) sum = (sum * 31 + joined.charCodeAt(i)) >>> 0;
    return `sha256:${sum.toString(16).padStart(8, "0")}${joined.slice(0, 6)}`;
  }, [manifestHashes]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setPhase("form");
  }

  function handleExport() {
    onExport?.(format);
    setPhase("done");
  }

  const previewHashes = manifestHashes.slice(0, 4);
  const remaining = manifestHashes.length - previewHashes.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Download className="size-3.5" aria-hidden /> Export evidence
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-surface-2 sm:max-w-md">
        {phase === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-ok" aria-hidden /> {title}
              </DialogTitle>
              <DialogDescription>
                Signed export of the currently filtered range — a manifest of record hashes travels
                with the file so a reviewer can verify nothing was altered after export.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2.5">
                <dt className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">Range</dt>
                <dd className="mt-0.5 text-[12.5px] text-ink">{rangeLabel}</dd>
                <dd className="mt-1 font-mono text-[11px] text-dim">{eventCount} events included</dd>
              </div>

              <fieldset>
                <legend className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">
                  Format
                </legend>
                <RadioGroup
                  value={format}
                  onValueChange={(v) => setFormat(v as EvidenceExportFormat)}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                >
                  {(Object.keys(formatConfig) as EvidenceExportFormat[]).map((key) => {
                    const cfg = formatConfig[key];
                    const Icon = cfg.icon;
                    return (
                      <Label
                        key={key}
                        htmlFor={`evidence-format-${key}`}
                        className={cn(
                          "flex cursor-pointer flex-col items-start gap-1 rounded-lg border px-2.5 py-2 transition-colors",
                          format === key
                            ? "border-accent-border bg-accent-surface"
                            : "border-border-subtle hover:border-border-strong",
                        )}
                      >
                        <span className="flex w-full items-center justify-between gap-1.5">
                          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                            <Icon className="size-3.5" aria-hidden /> {cfg.label}
                          </span>
                          <RadioGroupItem value={key} id={`evidence-format-${key}`} />
                        </span>
                        <span className="text-[10.5px] leading-snug text-dim">{cfg.hint}</span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </fieldset>

              <div className="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2.5">
                <dt className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">
                  Manifest preview
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {previewHashes.map((h) => (
                    <HashBadge key={h} hash={h} />
                  ))}
                  {remaining > 0 ? (
                    <span className="inline-flex items-center rounded-md border border-border-subtle bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-dim">
                      +{remaining} more
                    </span>
                  ) : null}
                </dd>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-dim">
                <Lock className="size-3" aria-hidden />
                Will be signed by <span className="text-ink">{signedBy}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleExport}>
                <Download className="size-3.5" aria-hidden /> Export {formatConfig[format].label}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-ok" aria-hidden /> Export signed
              </DialogTitle>
              <DialogDescription>
                {eventCount} events exported as {formatConfig[format].label} — the manifest below is
                the immutability record for this export.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-ok/40 bg-ok/10 px-3 py-2.5">
                <dt className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-ok">
                  Manifest hash
                </dt>
                <dd className="mt-1">
                  <HashBadge hash={manifestHash} />
                </dd>
              </div>
              <p className="text-[11.5px] leading-relaxed text-dim">
                Keep this hash to verify the export later — recomputing it from the same file must
                match, or the file was altered after signing.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
              <Button size="sm" onClick={() => handleOpenChange(false)}>
                <Download className="size-3.5" aria-hidden /> Download file
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
