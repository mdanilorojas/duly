import * as React from "react";
import { FileDown, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { HashBadge } from "@/agentic/audit-log-table.js";
import { useCopy } from "@/lib/copy/index.js";

export type ExportFormat = "pdf" | "csv" | "json";

export interface ExportResult {
  /** Hash del manifiesto que cubre todos los hashes de registro incluidos. */
  manifestHash: string;
  url?: string;
}

export interface EvidenceExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Etiqueta legible del rango filtrado, ej. "1–30 jun 2026". */
  range: string;
  recordCount: number;
  formats?: ExportFormat[];
  onExport: (format: ExportFormat, opts: { range: string; recordCount: number }) => Promise<ExportResult>;
}

type Status = "idle" | "generating" | "done" | "error";
const FORMAT_LABEL: Record<ExportFormat, string> = { pdf: "PDF", csv: "CSV", json: "JSON" };

/**
 * Diálogo de export de evidencia firmada — item `EvidenceExportDialog` del área
 * C. Exporta un rango filtrado (PDF/CSV/JSON) con un manifiesto de hashes: el
 * botón "nunca va desnudo" (muestra qué, cuántos registros y qué rango, antes de
 * ejecutar), y al terminar expone el hash del manifiesto como prueba de
 * integridad (principios #3 y #4 del NORTH_STAR). Reusa `Dialog` y `HashBadge`.
 */
export function EvidenceExportDialog({
  open,
  onOpenChange,
  range,
  recordCount,
  formats = ["pdf", "csv", "json"],
  onExport,
}: EvidenceExportDialogProps) {
  const t = useCopy();
  const [status, setStatus] = React.useState<Status>("idle");
  const [result, setResult] = React.useState<ExportResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Reinicia el estado cada vez que se abre.
  React.useEffect(() => {
    if (open) {
      setStatus("idle");
      setResult(null);
      setError(null);
    }
  }, [open]);

  async function runExport(format: ExportFormat) {
    setStatus("generating");
    setError(null);
    try {
      const r = await onExport(format, { range, recordCount });
      setResult(r);
      setStatus("done");
    } catch (e) {
      // TODO(i18n): fallback error copy
      setError(e instanceof Error ? e.message : "No se pudo generar el export.");
      setStatus("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" aria-hidden />
            {t.evidenceExportDialog.title}
          </DialogTitle>
          <DialogDescription>
            {t.evidenceExportDialog.description(recordCount.toLocaleString(), range)}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[92px] py-1" aria-live="polite">
          {status === "idle" ? (
            <div className="flex flex-wrap gap-2">
              {formats.map((f) => (
                <Button key={f} type="button" variant="outline" size="sm" onClick={() => runExport(f)}>
                  <FileDown className="size-3.5" aria-hidden />
                  {FORMAT_LABEL[f]}
                </Button>
              ))}
            </div>
          ) : null}

          {status === "generating" ? (
            <div className="flex items-center gap-2 text-[13px] text-dim">
              <Loader2 className="size-4 animate-spin text-accent motion-reduce:animate-none" aria-hidden />
              {t.evidenceExportDialog.generating}
            </div>
          ) : null}

          {status === "done" && result ? (
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ok">
                <ShieldCheck className="size-4" aria-hidden />
                {t.evidenceExportDialog.ready}
              </span>
              <div className="flex items-center gap-2 text-[12px] text-dim">
                <span className="text-faint">{t.evidenceExportDialog.manifest}</span>
                <HashBadge hash={result.manifestHash} />
              </div>
              {result.url ? (
                <a href={result.url} className="text-[12.5px] text-accent underline-offset-2 hover:underline">
                  {t.evidenceExportDialog.download}
                </a>
              ) : null}
            </div>
          ) : null}

          {status === "error" ? (
            <div className="flex items-start gap-2 rounded-md border border-block/40 bg-block/10 px-3 py-2 text-[12.5px] text-block">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{error} {t.evidenceExportDialog.errorSuffix}</span>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="sm">
              {t.evidenceExportDialog.close}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
