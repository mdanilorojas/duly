import { describe, it, expect } from "vitest";
import {
  ATTR_GEN_AI_OPERATION_NAME,
  ATTR_GEN_AI_USAGE_INPUT_TOKENS,
  ATTR_GEN_AI_USAGE_OUTPUT_TOKENS,
  GEN_AI_OPERATION_NAME_VALUE_INVOKE_AGENT,
  GEN_AI_OPERATION_NAME_VALUE_CHAT,
  GEN_AI_OPERATION_NAME_VALUE_EXECUTE_TOOL,
  GEN_AI_OPERATION_NAME_VALUE_RETRIEVAL,
} from "@opentelemetry/semantic-conventions/incubating";
import { otelSpansToTraceSpans, type OtelGenAiSpan } from "./otel-trace-adapter.js";

const spans: OtelGenAiSpan[] = [
  {
    spanId: "s0",
    traceId: "t1",
    name: "supervisor",
    startTimeUnixMs: 1000,
    endTimeUnixMs: 4000,
    attributes: { [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_INVOKE_AGENT },
  },
  {
    spanId: "s1",
    parentSpanId: "s0",
    traceId: "t1",
    name: "chat completion",
    startTimeUnixMs: 1100,
    endTimeUnixMs: 2600,
    attributes: {
      [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_CHAT,
      [ATTR_GEN_AI_USAGE_INPUT_TOKENS]: 1200,
      [ATTR_GEN_AI_USAGE_OUTPUT_TOKENS]: 300,
      "gen_ai.usage.cost": 0.42,
    },
  },
  {
    spanId: "s2",
    parentSpanId: "s0",
    traceId: "t1",
    name: "search_kb",
    startTimeUnixMs: 2700,
    endTimeUnixMs: 3200,
    attributes: { [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_RETRIEVAL },
    error: true,
  },
  {
    spanId: "s3",
    parentSpanId: "s2",
    traceId: "t1",
    name: "http_get",
    startTimeUnixMs: 2750,
    endTimeUnixMs: 3100,
    attributes: { [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_EXECUTE_TOOL },
  },
];

describe("otelSpansToTraceSpans", () => {
  it("mapea gen_ai.operation.name a SpanKind del DS", () => {
    const roots = otelSpansToTraceSpans(spans);
    expect(roots).toHaveLength(1);
    expect(roots[0].kind).toBe("agent");
    const chat = roots[0].children!.find((c) => c.id === "s1")!;
    expect(chat.kind).toBe("llm");
    const retrieval = roots[0].children!.find((c) => c.id === "s2")!;
    expect(retrieval.kind).toBe("retrieval");
    expect(retrieval.children![0].kind).toBe("tool");
  });

  it("extrae tokens de usage y costo custom", () => {
    const roots = otelSpansToTraceSpans(spans);
    const chat = roots[0].children!.find((c) => c.id === "s1")!;
    expect(chat.tokens).toEqual({ input: 1200, output: 300 });
    expect(chat.costUsd).toBe(0.42);
  });

  it("normaliza tiempos relativos al inicio del run y marca error como tono block", () => {
    const roots = otelSpansToTraceSpans(spans);
    expect(roots[0].startMs).toBe(0); // el más temprano
    const chat = roots[0].children!.find((c) => c.id === "s1")!;
    expect(chat.startMs).toBe(100);
    expect(chat.durationMs).toBe(1500);
    const retrieval = roots[0].children!.find((c) => c.id === "s2")!;
    expect(retrieval.tone).toBe("block");
  });

  it("respeta la jerarquía cross-agent por parentSpanId", () => {
    const roots = otelSpansToTraceSpans(spans);
    expect(roots[0].children).toHaveLength(2);
  });
});
