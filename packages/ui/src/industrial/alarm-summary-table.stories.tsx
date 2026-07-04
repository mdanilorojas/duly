import type { Meta, StoryObj } from "@storybook/react";
import { AlarmSummaryTable, type AlarmRow } from "./alarm-summary-table.js";

const meta: Meta<typeof AlarmSummaryTable> = {
  title: "Industrial/V001 Alarm Summary Table",
  component: AlarmSummaryTable,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const alarms: AlarmRow[] = [
  { id: "a1", tag: "PT-101", description: "Presión de cabezal sobre límite crítico", priority: "critical", state: "unack", timestamp: "19:12:04", area: "Header" },
  { id: "a2", tag: "TT-330", description: "Temperatura de reactor alta", priority: "high", state: "unack", timestamp: "19:10:41", area: "Reactor" },
  { id: "a3", tag: "FT-220", description: "Flujo bajo en alimentación", priority: "medium", state: "ack", timestamp: "19:05:10", area: "Feed" },
  { id: "a4", tag: "LT-140", description: "Nivel de tanque en banda de aviso", priority: "low", state: "shelved", timestamp: "18:58:22", area: "Storage" },
];

export const Triage: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[900px]">
        <AlarmSummaryTable alarms={alarms} onAck={() => {}} onShelve={() => {}} />
      </div>
    </div>
  ),
};
