import * as React from "react";
import { Cpu, ScrollText, GitCompare, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneChip } from "./approval-gate-card.js";
import { HashBadge } from "./audit-log-table.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

export interface ModelSamplingParams {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  seed?: number;
}

/**
 * Procedencia de un output de IA — EU AI Act Art. 12/13 ("registro técnico
 * que permita identificar... el modelo, su versión"). Deliberadamente
 * separado de `RetentionBadge` (Art. 19, cuánto tiempo se conserva ese
 * registro): esto es *qué produjo el output*, no cuánto dura la evidencia.
 */
export interface ModelProvenance {
  provider: string;
  model: string;
  /** Identificador de versión exacto, ej. "claude-sonnet-5-20260630". */
  modelVersion: string;
  promptVersion: string;
  /** Nombre legible del prompt, ej. "Loan risk summary v14". */
  promptLabel?: string;
  /** Hash del bundle de config (params de sampling + system prompt + tools habilitadas). */
  configHash: string;
  params?: ModelSamplingParams;
  generatedAt: string;
  /** Hash de config del run anterior con el mismo prompt, para detectar drift silencioso. */
  previousConfigHash?: string;
}

function driftVerdict(p: ModelProvenance): { label: string; tone: Tone } | null {
  if (!p.previousConfigHash) return null;
  if (p.previousConfigHash === p.configHash) {
    return { label: "Unchanged since last run", tone: "ok" };
  }
  return { label: "Config changed since last run", tone: "warn" };
}

function ParamChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10.5px] text-dim">
      <span className="uppercase tracking-wide">{label}</span>
      <span className="text-ink">{value}</span>
    </span>
  );
}

export interface ModelProvenanceCardProps extends React.ComponentProps<"div"> {
  title?: string;
  /** Run u output al que aplica esta procedencia, ej. "Run #4471 · step 3". */
  subject?: string;
  provenance: ModelProvenance;
}

/**
 * Modelo, versión, prompt version y config hash por run — item #1 de la
 * Prioridad de construcción del NORTH_STAR (área C). Modela el principio #8
 * ("procedencia sobre magia: chips de modelo/prompt/versión en cada output
 * de IA"): nunca solo texto plano, el modelo y el prompt son chips con la
 * misma jerarquía visual que un guardrail o un hash de auditoría, y un
 * drift de config entre runs del mismo prompt es una señal explícita, no
 * algo que el operador tenga que diffear a mano.
 */
export function ModelProvenanceCard({
  title = "Model provenance",
  subject,
  provenance: p,
  className,
  ...props
}: ModelProvenanceCardProps) {
  const drift = driftVerdict(p);
  const params = p.params ?? {};
  const hasParams =
    params.temperature !== undefined ||
    params.topP !== undefined ||
    params.maxTokens !== undefined ||
    params.seed !== undefined;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)} {...props}>
      <div className="flex flex-col gap-1 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
        <span className="font-mono text-[11px] text-dim">{p.generatedAt}</span>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5">
        {subject ? <span className="break-words text-[12.5px] text-ink">{subject}</span> : null}

        <div className="flex flex-wrap gap-2">
          <span
            title={`${p.provider} · ${p.modelVersion}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-elevated px-2.5 py-1.5"
          >
            <Cpu className="size-3.5 shrink-0 text-info" aria-hidden />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[12px] font-semibold text-ink">{p.model}</span>
              <span className="truncate font-mono text-[9.5px] text-dim">{p.provider}</span>
            </span>
          </span>

          <span
            title={p.promptLabel ?? `Prompt ${p.promptVersion}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-elevated px-2.5 py-1.5"
          >
            <ScrollText className="size-3.5 shrink-0 text-review" aria-hidden />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[12px] font-semibold text-ink">{p.promptVersion}</span>
              <span className="truncate font-mono text-[9.5px] text-dim">
                {p.promptLabel ?? "Prompt version"}
              </span>
            </span>
          </span>
        </div>

        {hasParams ? (
          <div className="flex flex-wrap gap-1.5">
            {params.temperature !== undefined ? (
              <ParamChip label="temp" value={params.temperature} />
            ) : null}
            {params.topP !== undefined ? <ParamChip label="top_p" value={params.topP} /> : null}
            {params.maxTokens !== undefined ? (
              <ParamChip label="max_tokens" value={params.maxTokens.toLocaleString()} />
            ) : null}
            {params.seed !== undefined ? <ParamChip label="seed" value={params.seed} /> : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">Config hash</span>
            <HashBadge hash={p.configHash} />
          </div>
          {drift ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                toneChip[drift.tone],
              )}
            >
              {drift.tone === "ok" ? <Check className="size-2.5" aria-hidden /> : <GitCompare className="size-2.5" aria-hidden />}
              {drift.label}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export interface ModelProvenanceChipProps {
  provenance: ModelProvenance;
}

/**
 * Versión inline compacta para embeber junto a *cada* output de IA (no solo
 * en un panel de detalle dedicado) — el caso de uso literal del principio
 * #8. El `title` nativo expone modelo/prompt/config completos sin abrir
 * ningún panel; pensado para vivir en el footer de un mensaje de chat, una
 * fila de `TraceTree` o una celda de tabla.
 */
export function ModelProvenanceChip({ provenance: p }: ModelProvenanceChipProps) {
  return (
    <span
      title={`${p.model} (${p.modelVersion}) · prompt ${p.promptVersion} · config ${p.configHash}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[10px] text-dim"
    >
      <Cpu className="size-3 text-info" aria-hidden />
      <span className="text-ink">{p.model}</span>
      <span aria-hidden>·</span>
      <span>prompt {p.promptVersion}</span>
    </span>
  );
}
