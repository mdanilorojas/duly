import * as React from "react";
import { Cpu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { HashBadge } from "@/agentic/audit-log-table.js";

export interface ModelProvenanceCardProps extends Omit<React.ComponentProps<"div">, "children"> {
  model: string;
  modelVersion?: string;
  promptVersion?: string;
  configHash: string;
  temperature?: number;
  provider?: string;
  defaultExpanded?: boolean;
}

function Chip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10.5px] text-dim">
      <span className="text-faint">{label}</span>
      {value}
    </span>
  );
}

/**
 * Procedencia de modelo — item `ModelProvenanceCard` del área C. Chips de
 * modelo/prompt/config-hash en cada output de IA (principio #8, "procedencia
 * sobre magia"): qué modelo, qué versión, qué prompt y qué config produjeron un
 * run, para auditoría (EU AI Act Art. 12/13). Compacto por defecto; expande a
 * todos los campos. Reusa `HashBadge`.
 */
export function ModelProvenanceCard({
  model,
  modelVersion,
  promptVersion,
  configHash,
  temperature,
  provider,
  defaultExpanded = false,
  className,
  ...props
}: ModelProvenanceCardProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const bodyId = React.useId();

  return (
    <div
      className={cn("rounded-xl border border-border-subtle bg-surface-2 p-3", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
          <Cpu className="size-3" aria-hidden />
          {model}
        </span>
        {provider ? <Chip label="" value={<span className="text-dim">{provider}</span>} /> : null}
        {promptVersion ? <Chip label="prompt" value={<span className="text-ink">{promptVersion}</span>} /> : null}
        <span className="inline-flex items-center gap-1">
          <span className="font-mono text-[10px] text-faint">config</span>
          <HashBadge hash={configHash} />
        </span>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="ml-auto inline-flex items-center gap-1 rounded font-mono text-[10.5px] text-faint outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
        >
          Detalles
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} aria-hidden />
        </button>
      </div>

      {expanded ? (
        <dl
          id={bodyId}
          className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-border-subtle pt-3 text-[11.5px]"
        >
          <Row label="Modelo" value={model} />
          {modelVersion ? <Row label="Versión de modelo" value={modelVersion} /> : null}
          {provider ? <Row label="Proveedor" value={provider} /> : null}
          {promptVersion ? <Row label="Versión de prompt" value={promptVersion} /> : null}
          {temperature != null ? <Row label="Temperatura" value={String(temperature)} /> : null}
          <Row label="Config hash" value={configHash} mono />
        </dl>
      ) : null}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="font-mono text-[9.5px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className={cn("min-w-0 break-words text-dim", mono && "font-mono text-[11px]")}>{value}</dd>
    </>
  );
}
