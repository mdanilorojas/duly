import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { EventType } from "@ag-ui/core";
import { reduceAgUiEvents, StreamingMessage, type AgUiStreamEvent } from "./streaming-message.js";

const events: AgUiStreamEvent[] = [
  { type: EventType.THINKING_START },
  { type: EventType.THINKING_END },
  { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m1", delta: "Hola " },
  { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m1", delta: "mundo" },
  { type: EventType.TOOL_CALL_START, toolCallId: "t1", toolCallName: "search_kb" },
  { type: EventType.TOOL_CALL_ARGS, toolCallId: "t1", delta: '{"q":"' },
  { type: EventType.TOOL_CALL_ARGS, toolCallId: "t1", delta: 'reactor"}' },
  { type: EventType.TOOL_CALL_END, toolCallId: "t1" },
  { type: EventType.TOOL_CALL_RESULT, toolCallId: "t1", content: "3 documentos" },
  { type: EventType.RUN_FINISHED },
];

describe("reduceAgUiEvents", () => {
  it("acumula el texto de los deltas TEXT_MESSAGE_CONTENT", () => {
    expect(reduceAgUiEvents(events).text).toBe("Hola mundo");
  });

  it("resuelve el ciclo de thinking y marca done en RUN_FINISHED", () => {
    const v = reduceAgUiEvents(events);
    expect(v.thinking).toBe(false);
    expect(v.done).toBe(true);
  });

  it("reconstruye tool calls con args y resultado", () => {
    const v = reduceAgUiEvents(events);
    expect(v.toolCalls).toHaveLength(1);
    expect(v.toolCalls[0]).toMatchObject({
      name: "search_kb",
      args: '{"q":"reactor"}',
      status: "done",
      result: "3 documentos",
    });
  });

  it("thinking queda activo si no llegó THINKING_END", () => {
    expect(reduceAgUiEvents([{ type: EventType.THINKING_START }]).thinking).toBe(true);
  });
});

describe("StreamingMessage", () => {
  it("renderiza el texto y los tool-calls inline", () => {
    render(<StreamingMessage events={events} />);
    expect(screen.getByText(/Hola mundo/)).toBeDefined();
    expect(screen.getByText(/search_kb/)).toBeDefined();
  });

  it("en streaming expone aria-live=polite (role=log)", () => {
    render(<StreamingMessage events={events} streaming />);
    expect(screen.getByRole("log").getAttribute("aria-live")).toBe("polite");
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<StreamingMessage events={events} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
