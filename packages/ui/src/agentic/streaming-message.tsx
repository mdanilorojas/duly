import * as React from "react";
import { Wrench, Loader2, Check } from "lucide-react";
import { EventType } from "@ag-ui/core";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";

/**
 * Evento del protocolo AG-UI (subset consumido por la UI). El `type` es el
 * `EventType` real de `@ag-ui/core`; los campos siguen las formas del protocolo
 * (delta, toolCallId, toolCallName, content).
 */
export interface AgUiStreamEvent {
  type: string;
  delta?: string;
  messageId?: string;
  toolCallId?: string;
  toolCallName?: string;
  content?: string;
  [key: string]: unknown;
}

export interface ToolCallView {
  id: string;
  name: string;
  args: string;
  status: "running" | "done";
  result?: string;
}

export interface StreamView {
  text: string;
  thinking: boolean;
  toolCalls: ToolCallView[];
  done: boolean;
}

/**
 * Reduce un stream de eventos AG-UI a una vista renderizable: texto acumulado,
 * estado de "thinking", tool-calls (con args y resultado) y done. Pura y
 * testeable. Conforme al estándar AG-UI (usa `EventType` real de `@ag-ui/core`).
 */
export function reduceAgUiEvents(events: readonly AgUiStreamEvent[]): StreamView {
  let text = "";
  let thinking = false;
  let done = false;
  const calls = new Map<string, ToolCallView>();

  for (const e of events) {
    switch (e.type) {
      case EventType.TEXT_MESSAGE_CONTENT:
        text += e.delta ?? "";
        break;
      case EventType.THINKING_START:
        thinking = true;
        break;
      case EventType.THINKING_END:
        thinking = false;
        break;
      case EventType.TOOL_CALL_START:
        if (e.toolCallId) {
          calls.set(e.toolCallId, {
            id: e.toolCallId,
            name: e.toolCallName ?? "tool",
            args: "",
            status: "running",
          });
        }
        break;
      case EventType.TOOL_CALL_ARGS: {
        const c = e.toolCallId ? calls.get(e.toolCallId) : undefined;
        if (c) c.args += e.delta ?? "";
        break;
      }
      case EventType.TOOL_CALL_END: {
        const c = e.toolCallId ? calls.get(e.toolCallId) : undefined;
        if (c) c.status = "done";
        break;
      }
      case EventType.TOOL_CALL_RESULT: {
        const c = e.toolCallId ? calls.get(e.toolCallId) : undefined;
        if (c) {
          c.status = "done";
          c.result = e.content ?? "";
        }
        break;
      }
      case EventType.RUN_FINISHED:
      case EventType.RUN_ERROR:
        done = true;
        break;
    }
  }

  return { text, thinking, toolCalls: [...calls.values()], done };
}

function ToolCallChip({ call }: { call: ToolCallView }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border-subtle bg-surface-3/60 px-2 py-0.5 align-middle font-mono text-[10.5px] text-dim">
      {call.status === "running" ? (
        <Loader2 className="size-3 animate-spin text-review motion-reduce:animate-none" aria-hidden />
      ) : (
        <Check className="size-3 text-ok" aria-hidden />
      )}
      <Wrench className="size-3 text-faint" aria-hidden />
      <span className="text-ink">{call.name}</span>
      {call.args ? <span className="truncate text-faint">{call.args}</span> : null}
    </span>
  );
}

export interface StreamingMessageProps extends Omit<React.ComponentProps<"div">, "children"> {
  events: readonly AgUiStreamEvent[];
  /** Stream en curso → aria-live=polite + caret. */
  streaming?: boolean;
}

/**
 * Mensaje en streaming conforme a AG-UI (área B, cierra el gap `StreamingMessage`)
 * — consume el stream de eventos tipados de `@ag-ui/core` (el transporte
 * agente→frontend estándar 2026) y renderiza texto incremental, indicador de
 * thinking y chips de tool-call inline, sin layout shift. `aria-live=polite` en
 * streaming (patrón de `TraceLog`).
 */
export function StreamingMessage({ events, streaming = false, className, ...props }: StreamingMessageProps) {
  const t = useCopy();
  const view = React.useMemo(() => reduceAgUiEvents(events), [events]);
  const showCaret = streaming && !view.done;

  return (
    <div
      role="log"
      aria-live={streaming ? "polite" : "off"}
      className={cn("flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-2 p-3", className)}
      {...props}
    >
      {view.thinking ? (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-faint">
          <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden />
          {t.streamingMessage.thinking}
        </span>
      ) : null}

      <p className="text-[13px] leading-relaxed text-ink">
        {view.text}
        {showCaret ? <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-accent motion-safe:animate-pulse" aria-hidden /> : null}
      </p>

      {view.toolCalls.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {view.toolCalls.map((c) => (
            <ToolCallChip key={c.id} call={c} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
