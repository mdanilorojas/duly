import * as React from "react";
import { Check, X, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../components/ui/button.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const toneText: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

const toneChip: Record<Tone, string> = {
  info: "bg-info/15 text-info",
  ok: "bg-ok/15 text-ok",
  review: "bg-review/15 text-review",
  warn: "bg-warn/15 text-warn",
  block: "bg-block/15 text-block",
};

/**
 * Un bloque de contenido enriquecido dentro del resultado de un tool call.
 * Sigue el patrón "Controlled Generative UI" que convergió esta semana en 3
 * vendors (MCP Apps de Vercel, AG-UI Tool-based Generative UI de Microsoft,
 * widgets de ChatKit de OpenAI): el agente elige un tipo de widget
 * pre-construido y le pasa datos — no genera markup libre. `table`/`diff`/
 * `citations`/`metrics`/`code` cubren los tipos de contenido más comunes de
 * un tool result que no son texto plano; `confirm` cubre el patrón "Card as
 * Form" de ChatKit (confirm/cancel embebido en el resultado del tool, no en
 * un modal aparte).
 */
export type ToolResultBlock =
  | { kind: "table"; columns: string[]; rows: Array<Array<string | number>>; caption?: string }
  | { kind: "diff"; before: string; after: string; beforeLabel?: string; afterLabel?: string }
  | {
      kind: "citations";
      items: Array<{ label: string; source: string; snippet?: string; score?: number }>;
    }
  | {
      kind: "confirm";
      prompt: string;
      status: "pending" | "confirmed" | "declined";
      confirmLabel?: string;
      declineLabel?: string;
      onConfirm?: () => void;
      onDecline?: () => void;
    }
  | { kind: "metrics"; items: Array<{ label: string; value: string; tone?: Tone }> }
  | { kind: "code"; content: string; language?: string };

function TableBlock({ columns, rows, caption }: Extract<ToolResultBlock, { kind: "table" }>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-[11.5px]">
        <thead>
          <tr className="border-b border-border-subtle bg-surface-header">
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="whitespace-nowrap px-2.5 py-1.5 text-left font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border-subtle last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="whitespace-nowrap px-2.5 py-1.5 text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption ? <p className="px-2.5 py-1.5 font-mono text-[10px] text-dim">{caption}</p> : null}
    </div>
  );
}

function DiffBlock({ before, after, beforeLabel = "Before", afterLabel = "After" }: Extract<ToolResultBlock, { kind: "diff" }>) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <div className="bg-block/5 px-3 py-2">
        <div className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-block">{beforeLabel}</div>
        <p className="mt-1 break-words font-mono text-[11.5px] leading-relaxed text-block line-through">
          {before}
        </p>
      </div>
      <div className="bg-ok/5 px-3 py-2">
        <div className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-ok">{afterLabel}</div>
        <p className="mt-1 break-words font-mono text-[11.5px] leading-relaxed text-ink">{after}</p>
      </div>
    </div>
  );
}

function CitationsBlock({ items }: Extract<ToolResultBlock, { kind: "citations" }>) {
  return (
    <ul className="divide-y divide-border-subtle">
      {items.map((item) => (
        <li key={item.source} className="flex items-start gap-2 px-3 py-2">
          <ExternalLink className="mt-0.5 size-3 shrink-0 text-dim" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="break-words text-[12px] font-medium text-ink">{item.label}</span>
              <span className="font-mono text-[10px] text-dim">{item.source}</span>
            </div>
            {item.snippet ? (
              <p className="mt-0.5 break-words font-mono text-[10.5px] leading-relaxed text-dim">
                &ldquo;{item.snippet}&rdquo;
              </p>
            ) : null}
          </div>
          {item.score !== undefined ? (
            <span className="shrink-0 rounded bg-info/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-info">
              {item.score.toFixed(2)}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ConfirmBlock({
  prompt,
  status,
  confirmLabel = "Confirm",
  declineLabel = "Decline",
  onConfirm,
  onDecline,
}: Extract<ToolResultBlock, { kind: "confirm" }>) {
  if (status !== "pending") {
    const resolved =
      status === "confirmed"
        ? { icon: Check, label: "Confirmed", tone: "ok" as Tone }
        : { icon: X, label: "Declined", tone: "block" as Tone };
    const Icon = resolved.icon;
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
        <p className="break-words text-[12px] text-ink">{prompt}</p>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
            toneChip[resolved.tone],
          )}
        >
          <Icon className="size-3" aria-hidden /> {resolved.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="break-words text-[12px] text-ink">{prompt}</p>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDecline}
          className="border-block/40 text-block hover:bg-block/10 hover:text-block"
        >
          <X className="size-3.5" aria-hidden /> {declineLabel}
        </Button>
        <Button size="sm" onClick={onConfirm} className="bg-ok text-on-ok hover:bg-ok/90">
          <Check className="size-3.5" aria-hidden /> {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

function MetricsBlock({ items }: Extract<ToolResultBlock, { kind: "metrics" }>) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border-subtle sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-bg-elevated px-2.5 py-2">
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">{item.label}</div>
          <div className={cn("mt-0.5 font-mono text-[14px] font-bold", item.tone ? toneText[item.tone] : "text-ink")}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ content, language }: Extract<ToolResultBlock, { kind: "code" }>) {
  return (
    <div className="bg-bg-elevated">
      {language ? (
        <div className="border-b border-border-subtle px-3 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">
          {language}
        </div>
      ) : null}
      <pre className="overflow-x-auto px-3 py-2 font-mono text-[11px] leading-relaxed text-ink">
        <code>{content}</code>
      </pre>
    </div>
  );
}

function ToolResultBlockView({ block }: { block: ToolResultBlock }) {
  switch (block.kind) {
    case "table":
      return <TableBlock {...block} />;
    case "diff":
      return <DiffBlock {...block} />;
    case "citations":
      return <CitationsBlock {...block} />;
    case "confirm":
      return <ConfirmBlock {...block} />;
    case "metrics":
      return <MetricsBlock {...block} />;
    case "code":
      return <CodeBlock {...block} />;
  }
}

export interface RichToolCallCardProps extends React.ComponentProps<"div"> {
  /** Nombre de la función/tool invocada. */
  tool: string;
  /** Parámetros de entrada, como pares clave/valor. Opcional — algunos tools no tienen input relevante para mostrar. */
  input?: Record<string, React.ReactNode>;
  /** Uno o más bloques de contenido enriquecido, renderizados en secuencia. */
  blocks: ToolResultBlock[];
  latency?: string;
  tone?: Tone;
}

/**
 * Extensión de `ToolCallCard` con contenido enriquecido por tipo de resultado
 * — no solo texto/JSON plano. Responde al gap #1 del `NORTH_STAR.md`
 * (2026-07-02): 3 vendors convergieron en "Rich Tool-UI"/"Tool-based
 * Generative UI" (MCP Apps, AG-UI, ChatKit widgets) esta semana. Vive en el
 * mismo lugar que `ToolCallCard` (contenido expandible de un `RunStep` con
 * `kind="tool_call"`) pero para resultados que se comunican mejor como
 * tabla, diff, lista de fuentes, métricas, código o una confirmación
 * embebida que como una sola línea de texto.
 */
export function RichToolCallCard({
  tool,
  input,
  blocks,
  latency,
  tone = "info",
  className,
  ...props
}: RichToolCallCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-header px-3 py-1.5">
        <code className="truncate font-mono text-[11px] text-review">{tool}</code>
        {latency ? (
          <span className={cn("shrink-0 font-mono text-[10px] font-semibold", toneText[tone])}>
            <Clock className="mr-1 inline size-2.5" aria-hidden />
            {latency}
          </span>
        ) : null}
      </div>
      {input && Object.keys(input).length > 0 ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-b border-border-subtle px-3 py-2 text-[11.5px]">
          {Object.entries(input).map(([key, value]) => (
            <React.Fragment key={key}>
              <dt className="font-mono text-dim">{key}</dt>
              <dd className="min-w-0 truncate text-dim">{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : null}
      <div className="divide-y divide-border-subtle">
        {blocks.map((block, i) => (
          <ToolResultBlockView key={i} block={block} />
        ))}
      </div>
    </div>
  );
}
