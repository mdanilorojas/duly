import type { Meta, StoryObj } from "@storybook/react";
import { ApprovalChainStepper, type ApprovalStep } from "./approval-chain-stepper.js";

const meta: Meta<typeof ApprovalChainStepper> = {
  title: "Compliance/V001 Approval Chain Stepper",
  component: ApprovalChainStepper,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const approved: ApprovalStep[] = [
  { approver: "María Chen", role: "Team Lead", decision: "approved", at: "10:02" },
  { approver: "Deal Desk", role: "Finance", decision: "approved", at: "10:31" },
  { approver: "VP Sales", role: "Executive", decision: "approved", at: "11:15" },
];
const rejected: ApprovalStep[] = [
  { approver: "María Chen", role: "Team Lead", decision: "approved", at: "10:02" },
  { approver: "Deal Desk", role: "Finance", decision: "rejected", at: "10:31", note: "Descuento 42% fuera de política (máx 30%)." },
  { approver: "VP Sales", role: "Executive", decision: "pending" },
];
const escalated: ApprovalStep[] = [
  { approver: "Compliance Agent", role: "System", decision: "approved", at: "09:58" },
  { approver: "Risk Officer", role: "Risk", decision: "escalated", at: "10:10", note: "Requiere revisión legal." },
  { approver: "General Counsel", role: "Legal", decision: "pending" },
];

type S = StoryObj<typeof ApprovalChainStepper>;

export const Cases: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto grid max-w-[860px] gap-6 sm:grid-cols-3">
        {[
          ["Aprobada", approved],
          ["Rechazada", rejected],
          ["Escalada", escalated],
        ].map(([title, steps]) => (
          <div key={title as string} className="rounded-xl border border-border-subtle bg-surface-2 p-4">
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-wide text-dim">{title as string}</h3>
            <ApprovalChainStepper steps={steps as ApprovalStep[]} />
          </div>
        ))}
      </div>
    </div>
  ),
};
