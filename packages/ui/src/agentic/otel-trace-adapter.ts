import {
  ATTR_GEN_AI_OPERATION_NAME,
  ATTR_GEN_AI_REQUEST_MODEL,
  ATTR_GEN_AI_USAGE_INPUT_TOKENS,
  ATTR_GEN_AI_USAGE_OUTPUT_TOKENS,
  GEN_AI_OPERATION_NAME_VALUE_CHAT,
  GEN_AI_OPERATION_NAME_VALUE_TEXT_COMPLETION,
  GEN_AI_OPERATION_NAME_VALUE_GENERATE_CONTENT,
  GEN_AI_OPERATION_NAME_VALUE_EMBEDDINGS,
  GEN_AI_OPERATION_NAME_VALUE_EXECUTE_TOOL,
  GEN_AI_OPERATION_NAME_VALUE_RETRIEVAL,
  GEN_AI_OPERATION_NAME_VALUE_INVOKE_AGENT,
  GEN_AI_OPERATION_NAME_VALUE_CREATE_AGENT,
  GEN_AI_OPERATION_NAME_VALUE_INVOKE_WORKFLOW,
} from "@opentelemetry/semantic-conventions/incubating";
import type { TraceSpan, SpanKind } from "./trace-tree.js";

/** Costo por span — no es convención OTel estándar; atributo custom del DS. */
export const ATTR_STUDIO_USAGE_COST = "gen_ai.usage.cost";

/**
 * Span mínimo conforme a OpenTelemetry GenAI (subset de ReadableSpan). Los
 * tiempos van en epoch-ms para evitar el HrTime de OTel en la capa de UI.
 */
export interface OtelGenAiSpan {
  spanId: string;
  parentSpanId?: string;
  /** Correlaciona spans a través de agentes/procesos (traza distribuida). */
  traceId: string;
  name: string;
  startTimeUnixMs: number;
  endTimeUnixMs: number;
  attributes: Record<string, string | number | boolean | undefined>;
  /** status = ERROR en OTel → tono block. */
  error?: boolean;
}

function kindFromOperation(op: string | undefined): SpanKind {
  switch (op) {
    case GEN_AI_OPERATION_NAME_VALUE_EXECUTE_TOOL:
      return "tool";
    case GEN_AI_OPERATION_NAME_VALUE_RETRIEVAL:
      return "retrieval";
    case GEN_AI_OPERATION_NAME_VALUE_INVOKE_AGENT:
    case GEN_AI_OPERATION_NAME_VALUE_CREATE_AGENT:
    case GEN_AI_OPERATION_NAME_VALUE_INVOKE_WORKFLOW:
      return "agent";
    case GEN_AI_OPERATION_NAME_VALUE_CHAT:
    case GEN_AI_OPERATION_NAME_VALUE_TEXT_COMPLETION:
    case GEN_AI_OPERATION_NAME_VALUE_GENERATE_CONTENT:
    case GEN_AI_OPERATION_NAME_VALUE_EMBEDDINGS:
      return "llm";
    default:
      return "agent";
  }
}

/**
 * Adapta spans conformes a las convenciones semánticas GenAI de OpenTelemetry
 * (`gen_ai.*`, el estándar de observabilidad de agentes 2026) al árbol `TraceSpan`
 * que consume `TraceTree`. Soporta trazas distribuidas cross-agent: la jerarquía
 * se reconstruye por `parentSpanId`, correlacionando spans emitidos por distintos
 * agentes/procesos que comparten `traceId`. Usa los nombres de atributo REALES de
 * `@opentelemetry/semantic-conventions`, no strings inventados.
 */
export function otelSpansToTraceSpans(spans: OtelGenAiSpan[]): TraceSpan[] {
  if (spans.length === 0) return [];
  const minStart = Math.min(...spans.map((s) => s.startTimeUnixMs));

  const byId = new Map<string, TraceSpan>();
  const wrapped = spans.map((s) => {
    const op = s.attributes[ATTR_GEN_AI_OPERATION_NAME] as string | undefined;
    const node: TraceSpan = {
      id: s.spanId,
      kind: kindFromOperation(op),
      name: s.name || (s.attributes[ATTR_GEN_AI_REQUEST_MODEL] as string) || s.spanId,
      startMs: s.startTimeUnixMs - minStart,
      durationMs: Math.max(0, s.endTimeUnixMs - s.startTimeUnixMs),
      tone: s.error ? "block" : undefined,
      children: [],
    };
    const tin = s.attributes[ATTR_GEN_AI_USAGE_INPUT_TOKENS];
    const tout = s.attributes[ATTR_GEN_AI_USAGE_OUTPUT_TOKENS];
    if (typeof tin === "number" || typeof tout === "number") {
      node.tokens = { input: typeof tin === "number" ? tin : 0, output: typeof tout === "number" ? tout : 0 };
    }
    const cost = s.attributes[ATTR_STUDIO_USAGE_COST];
    if (typeof cost === "number") node.costUsd = cost;

    byId.set(s.spanId, node);
    return { s, node };
  });

  const roots: TraceSpan[] = [];
  for (const { s, node } of wrapped) {
    const parent = s.parentSpanId ? byId.get(s.parentSpanId) : undefined;
    if (parent) parent.children!.push(node);
    else roots.push(node);
  }
  return roots;
}
