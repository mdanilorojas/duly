import * as React from "react";
import { Wrench, GitBranch, UserCheck, Zap, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import type { Tone } from "../trace-log/trace-log.variants.js";

export type RunStepKind = "tool_call" | "decision" | "approval" | "event";

const kindIcon: Record<RunStepKind, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  tool_call: Wrench,
  decision: GitBranch,
  approval: UserCheck,
  event: Zap,
};

const kindLabel: Record<RunStepKind, string> = {
  tool_call: "Tool call",
  decision: "Decision",
  approval: "Human approval",
  event: "Event",
};

const toneRing: Record<Tone, string> = {
  info: "ring-info/30 text-info",
  ok: "ring-ok/30 text-ok",
  review: "ring-review/30 text-review",
  warn: "ring-warn/30 text-warn",
  block: "ring-block/30 text-block",
};

const toneChip: Record<Tone, string> = {
  info: "bg-info/15 text-info",
  ok: "bg-ok/15 text-ok",
  review: "bg-review/15 text-review",
  warn: "bg-warn/15 text-warn",
  block: "bg-block/15 text-block",
};

const toneText: Record<Tone, string> = {
  info: "text-info",
  ok: "text-ok",
  review: "text-review",
  warn: "text-warn",
  block: "text-block",
};

export interface RunStepProps extends React.ComponentProps<"li"> {
  kind: RunStepKind;
  tone?: Tone;
  /** Título corto del paso, ej. "search_knowledge_base(query)". */
  title: string;
  /** Agente que ejecutó el paso, ej. "RETRIEVAL AGENT". */
  agent: string;
  /** Hora relativa o absoluta, ej. "T+00:00.4s". */
  timestamp?: string;
  /** Duración del paso, ej. "212ms". */
  duration?: string;
  /** Si es el último paso, no dibuja el conector hacia abajo. */
  isLast?: boolean;
  /** Contenido expandible (ej. `ToolCallCard`). */
  children?: React.ReactNode;
}

/**
 * Un nodo del timeline de ejecución de un run multi-agente. Icono + tono por
 * tipo de paso (tool call / decision / human approval / event), conectados
 * por una línea vertical continua — la ejecución se lee como una secuencia,
 * no como un log plano.
 */
export function RunStep({
  kind,
  tone = "info",
  title,
  agent,
  timestamp,
  duration,
  isLast = false,
  children,
  className,
  ...props
}: RunStepProps) {
  const Icon = kindIcon[kind];
  const [open, setOpen] = React.useState(false);

  return (
    <li className={cn("relative flex gap-4 pb-6", className)} {...props}>
      {!isLast ? (
        <span
          aria-hidden
          className="absolute left-[15px] top-8 bottom-0 w-px bg-border-divider"
        />
      ) : null}
      <span
        aria-hidden
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1",
          toneRing[tone],
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-[8.5px] font-bold uppercase tracking-wide text-dim">
            {kindLabel[kind]}
          </span>
          <span className="font-mono text-[8.5px] uppercase tracking-wide text-dim">
            {agent}
          </span>
          <span className="ml-auto flex items-center gap-2 font-mono text-[10px] text-dim">
            {timestamp}
            {duration ? (
              <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-semibold", toneChip[tone])}>
                {duration}
              </span>
            ) : null}
          </span>
        </div>

        <div className="mt-1 break-words font-mono text-[13px] leading-snug text-ink">{title}</div>

        {children ? (
          <Collapsible.Root open={open} onOpenChange={setOpen} className="mt-2">
            <Collapsible.Trigger className="inline-flex items-center gap-1 rounded font-mono text-[10px] text-dim hover:text-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring">
              <ChevronDown className={cn("size-3 transition-transform duration-base ease-standard", open && "rotate-180")} aria-hidden />
              {open ? "ocultar detalle" : "ver detalle"}
            </Collapsible.Trigger>
            <Collapsible.Content className="mt-2">{children}</Collapsible.Content>
          </Collapsible.Root>
        ) : null}
      </div>
    </li>
  );
}

export interface ToolCallCardProps extends React.ComponentProps<"div"> {
  /** Nombre de la función/tool invocada. */
  tool: string;
  /** Parámetros de entrada, como pares clave/valor. */
  input: Record<string, React.ReactNode>;
  /** Resultado, texto libre o estructurado. */
  output: React.ReactNode;
  /** Latencia de la llamada, ej. "184ms". */
  latency?: string;
  tone?: Tone;
}

/**
 * Tarjeta de detalle para una llamada a tool/función dentro de un `RunStep`.
 * Pensada para vivir dentro del contenido expandible de un paso `tool_call`.
 */
export function ToolCallCard({
  tool,
  input,
  output,
  latency,
  tone = "info",
  className,
  ...props
}: ToolCallCardProps) {
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
            {latency}
          </span>
        ) : null}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-3 py-2 text-[11.5px]">
        {Object.entries(input).map(([key, value]) => (
          <React.Fragment key={key}>
            <dt className="font-mono text-dim">{key}</dt>
            <dd className="min-w-0 truncate text-dim">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
      <div className="border-t border-border-subtle px-3 py-2 text-[11.5px] leading-relaxed text-ink">
        {output}
      </div>
    </div>
  );
}

export interface ExecutionTimelineProps extends React.ComponentProps<"div"> {
  title?: string;
  /** Etiqueta corta, ej. id del run o duración total. */
  hint?: string;
  children: React.ReactNode;
}

/**
 * Contenedor del timeline de ejecución: agrupa `RunStep`s bajo un encabezado
 * con el id del run y su duración total. Complementa a `TraceLog` (log lineal
 * denso) con una vista espacial de "un paso a la vez" para inspeccionar un
 * único run multi-agente en detalle.
 */
export function ExecutionTimeline({ title, hint, children, className, ...props }: ExecutionTimelineProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border-subtle bg-surface-2",
        className,
      )}
      {...props}
    >
      {title ? (
        <div className="flex flex-col gap-1 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
          {hint ? <span className="min-w-0 truncate font-mono text-[11px] text-dim">{hint}</span> : null}
        </div>
      ) : null}
      <ol className="px-4 pt-4">{children}</ol>
    </div>
  );
}
