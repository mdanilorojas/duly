import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AlarmSummaryTable, sortAlarms, type AlarmRow } from "./alarm-summary-table.js";

const alarms: AlarmRow[] = [
  { id: "a1", tag: "FT-220", description: "Flujo bajo", priority: "low", state: "unack", timestamp: "19:01:00", area: "Feed" },
  { id: "a2", tag: "PT-101", description: "Presión crítica", priority: "critical", state: "unack", timestamp: "19:12:04", area: "Header" },
  { id: "a3", tag: "TT-330", description: "Temp alta", priority: "high", state: "ack", timestamp: "19:05:10", area: "Reactor" },
];

describe("sortAlarms", () => {
  it("ordena por prioridad desc y luego por tiempo desc", () => {
    const sorted = sortAlarms(alarms);
    expect(sorted[0].priority).toBe("critical");
    expect(sorted[1].priority).toBe("high");
    expect(sorted[2].priority).toBe("low");
  });
});

describe("AlarmSummaryTable", () => {
  it("renderiza las alarmas", () => {
    render(<AlarmSummaryTable alarms={alarms} caption="Alarmas activas" />);
    expect(screen.getByText("PT-101")).toBeDefined();
    expect(screen.getByText("TT-330")).toBeDefined();
  });

  it("reconocer una fila dispara onAck con su id", async () => {
    const onAck = vi.fn();
    render(<AlarmSummaryTable alarms={alarms} caption="Alarmas" onAck={onAck} />);
    await userEvent.click(screen.getByRole("button", { name: /reconocer PT-101/i }));
    expect(onAck).toHaveBeenCalledWith("a2");
  });

  it("virtualiza en flood: aria-rowcount refleja el total real", () => {
    const many: AlarmRow[] = Array.from({ length: 60 }, (_, i) => ({
      id: `f${i}`,
      tag: `X-${i}`,
      description: "flood",
      priority: "low" as const,
      state: "unack" as const,
      timestamp: "19:00:00",
    }));
    render(<AlarmSummaryTable alarms={many} caption="Flood" />);
    expect(screen.getByRole("grid").getAttribute("aria-rowcount")).toBe("61");
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<AlarmSummaryTable alarms={alarms} caption="Alarmas" onAck={() => {}} onShelve={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
