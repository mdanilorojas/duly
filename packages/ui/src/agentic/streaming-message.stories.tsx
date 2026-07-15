import type { Meta, StoryObj } from "@storybook/react";
import { EventType } from "@ag-ui/core";
import { StreamingMessage, type AgUiStreamEvent } from "./streaming-message.js";

const meta: Meta<typeof StreamingMessage> = {
  title: "Agentic/Streaming Message/V001 Flujo AG-UI",
  component: StreamingMessage,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const finished: AgUiStreamEvent[] = [
  { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m1", delta: "Revisé las 3 fuentes catastrales. " },
  { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m1", delta: "El predio 88213 tiene un gravamen activo." },
  { type: EventType.TOOL_CALL_START, toolCallId: "t1", toolCallName: "query_arcgis" },
  { type: EventType.TOOL_CALL_ARGS, toolCallId: "t1", delta: '{"predio":"88213"}' },
  { type: EventType.TOOL_CALL_RESULT, toolCallId: "t1", content: "1 gravamen" },
  { type: EventType.RUN_FINISHED },
];

const midStream: AgUiStreamEvent[] = [
  { type: EventType.THINKING_START },
  { type: EventType.THINKING_END },
  { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m1", delta: "Consultando el servidor catastral" },
  { type: EventType.TOOL_CALL_START, toolCallId: "t1", toolCallName: "query_arcgis" },
  { type: EventType.TOOL_CALL_ARGS, toolCallId: "t1", delta: '{"predio":"8' },
];

type S = StoryObj<typeof StreamingMessage>;

export const Streaming: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[560px]">
        <StreamingMessage events={midStream} streaming />
      </div>
    </div>
  ),
};

export const Finished: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[560px]">
        <StreamingMessage events={finished} />
      </div>
    </div>
  ),
};
