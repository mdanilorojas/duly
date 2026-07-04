import type { Meta, StoryObj } from "@storybook/react";
import { AlarmChip, type AlarmPriority, type AlarmState } from "./alarm-chip.js";

const meta: Meta<typeof AlarmChip> = {
  title: "Industrial/V001 Alarm Chip",
  component: AlarmChip,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const priorities: AlarmPriority[] = ["critical", "high", "medium", "low"];
const states: AlarmState[] = ["unack", "ack", "rtn", "shelved"];

export const Matrix: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[560px]">
        <table className="border-separate border-spacing-2">
          <tbody>
            {priorities.map((p) => (
              <tr key={p}>
                {states.map((s) => (
                  <td key={s}>
                    <AlarmChip priority={p} state={s} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
