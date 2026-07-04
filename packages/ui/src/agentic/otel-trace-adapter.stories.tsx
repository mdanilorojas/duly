import type { Meta, StoryObj } from "@storybook/react";
import {
  ATTR_GEN_AI_OPERATION_NAME,
  ATTR_GEN_AI_USAGE_INPUT_TOKENS,
  ATTR_GEN_AI_USAGE_OUTPUT_TOKENS,
  GEN_AI_OPERATION_NAME_VALUE_INVOKE_AGENT,
  GEN_AI_OPERATION_NAME_VALUE_CHAT,
  GEN_AI_OPERATION_NAME_VALUE_EXECUTE_TOOL,
  GEN_AI_OPERATION_NAME_VALUE_RETRIEVAL,
} from "@opentelemetry/semantic-conventions/incubating";
import { TraceTree } from "./trace-tree.js";
import { otelSpansToTraceSpans, ATTR_STUDIO_USAGE_COST, type OtelGenAiSpan } from "./otel-trace-adapter.js";

const meta: Meta = {
  title: "Agentic/Trace Tree/V001 From OpenTelemetry gen_ai spans",
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

// Spans conformes a OTel GenAI, cross-agent (supervisor → worker), como los
// emitiría un runtime instrumentado. El adapter los convierte a TraceTree.
const otelSpans: OtelGenAiSpan[] = [
  { spanId: "root", traceId: "t1", name: "research supervisor", startTimeUnixMs: 0, endTimeUnixMs: 5200, attributes: { [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_INVOKE_AGENT } },
  { spanId: "plan", parentSpanId: "root", traceId: "t1", name: "plan (chat)", startTimeUnixMs: 120, endTimeUnixMs: 1500, attributes: { [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_CHAT, [ATTR_GEN_AI_USAGE_INPUT_TOKENS]: 2400, [ATTR_GEN_AI_USAGE_OUTPUT_TOKENS]: 380, [ATTR_STUDIO_USAGE_COST]: 0.31 } },
  { spanId: "retr", parentSpanId: "root", traceId: "t1", name: "retrieve_docs", startTimeUnixMs: 1600, endTimeUnixMs: 2400, attributes: { [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_RETRIEVAL } },
  { spanId: "tool", parentSpanId: "retr", traceId: "t1", name: "vector_search", startTimeUnixMs: 1650, endTimeUnixMs: 2300, attributes: { [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_EXECUTE_TOOL } },
  { spanId: "synth", parentSpanId: "root", traceId: "t1", name: "synthesize (chat)", startTimeUnixMs: 2500, endTimeUnixMs: 5100, attributes: { [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_CHAT, [ATTR_GEN_AI_USAGE_INPUT_TOKENS]: 5100, [ATTR_GEN_AI_USAGE_OUTPUT_TOKENS]: 900, [ATTR_STUDIO_USAGE_COST]: 0.74 } },
];

export const FromOtel: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[720px]">
        <TraceTree spans={otelSpansToTraceSpans(otelSpans)} title="Run trace (OTel gen_ai)" />
      </div>
    </div>
  ),
};
