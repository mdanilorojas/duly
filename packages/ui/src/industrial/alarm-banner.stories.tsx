import type { Meta, StoryObj } from "@storybook/react";
import { AlarmBanner, type Alarm } from "./alarm-banner.js";

const meta: Meta<typeof AlarmBanner> = {
  title: "Industrial/V001 Alarm Banner",
  component: AlarmBanner,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const critical: Alarm = {
  id: "a1",
  tag: "PT-101",
  description: "Presión de cabezal sobre límite crítico",
  priority: "critical",
  timestamp: "19:12:04",
};

type S = StoryObj<typeof AlarmBanner>;

export const States: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto flex max-w-[720px] flex-col gap-4">
        <AlarmBanner topAlarm={critical} unackCount={7} onAck={() => {}} />
        <AlarmBanner
          topAlarm={{ id: "a2", tag: "FT-220", description: "Flujo bajo en línea de alimentación", priority: "high", timestamp: "19:10:41" }}
          unackCount={2}
          onAck={() => {}}
        />
        <AlarmBanner unackCount={0} />
      </div>
    </div>
  ),
};
