import type { Meta, StoryObj } from "@storybook/react";
import { PricingApprovalMatrix, type DiscountTier } from "./pricing-approval-matrix.js";

const meta: Meta<typeof PricingApprovalMatrix> = {
  title: "Commercial/V001 Pricing Approval Matrix",
  component: PricingApprovalMatrix,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

const tiers: DiscountTier[] = [
  { maxDiscountPct: 10, approverRole: "Rep (auto)", slaHours: 0 },
  { maxDiscountPct: 20, approverRole: "Sales Manager", slaHours: 4 },
  { maxDiscountPct: 30, approverRole: "Deal Desk", slaHours: 12 },
  { maxDiscountPct: 40, approverRole: "VP Sales", slaHours: 24 },
];

type S = StoryObj<typeof PricingApprovalMatrix>;

export const Cases: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto flex max-w-[480px] flex-col gap-5">
        <PricingApprovalMatrix tiers={tiers} currentDiscount={8} />
        <PricingApprovalMatrix tiers={tiers} currentDiscount={25} />
        <PricingApprovalMatrix tiers={tiers} currentDiscount={48} />
      </div>
    </div>
  ),
};
