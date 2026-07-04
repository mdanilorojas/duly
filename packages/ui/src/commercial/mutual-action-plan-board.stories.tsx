import type { Meta, StoryObj } from "@storybook/react";
import { MutualActionPlanBoard, type Milestone } from "./mutual-action-plan-board.js";

const meta: Meta<typeof MutualActionPlanBoard> = {
  title: "Commercial/V001 Mutual Action Plan Board",
  component: MutualActionPlanBoard,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const milestones: Milestone[] = [
  { id: "m1", title: "Discovery workshop", owner: "AE + Champion", side: "seller", due: "2026-06-10", status: "done" },
  { id: "m2", title: "Security review", owner: "Buyer IT", side: "buyer", due: "2026-06-20", status: "todo" },
  { id: "m3", title: "Business case sign-off", owner: "Economic Buyer", side: "buyer", due: "2026-07-05", status: "in-progress" },
  { id: "m4", title: "Redlines returned", owner: "Legal", side: "seller", due: "2026-07-10", status: "in-progress" },
  { id: "m5", title: "Kickoff", owner: "CS", side: "seller", due: "2026-07-20", status: "blocked", dependsOn: ["m2"] },
];

export const ClosePlan: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[560px]">
        <MutualActionPlanBoard milestones={milestones} now="2026-07-03T00:00:00Z" onToggle={() => {}} />
      </div>
    </div>
  ),
};
