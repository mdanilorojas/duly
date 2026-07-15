import type { Meta, StoryObj } from "@storybook/react";
import { ApprovalGateCard } from "./approval-gate-card.js";

const meta: Meta<typeof ApprovalGateCard> = {
  title: "Agentic/Approval Gate/V001 Paquete de evidencia",
  component: ApprovalGateCard,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof ApprovalGateCard>;

export const CriticalPending: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[640px]">
        <ApprovalGateCard
          action="Wire $482,000 to external account ending 7743"
          agent="TREASURY OPS AGENT"
          riskTone="block"
          riskLabel="Critical risk"
          what="Execute an outbound wire transfer for the settled trade batch flagged by the reconciliation agent, using the beneficiary account on file for counterparty Meridian Capital."
          why="Trade batch TB-30291 reconciled clean against custodian records, but the beneficiary account was updated 6 hours ago via an email request — outside the normal SWIFT-verified change process."
          blastRadius="$482,000 · 1 counterparty · irreversible once SWIFT MT103 is submitted"
          rollback="No automatic rollback — recall requires manual SWIFT MT192 request to receiving bank, not guaranteed to succeed."
          requestedAt="2m ago"
          expiresIn="13m"
          onApprove={() => console.log("approve")}
          onReject={() => console.log("reject")}
          onEscalate={() => console.log("escalate")}
        />
      </div>
    </div>
  ),
};

export const ResolutionStates: S = {
  name: "Resolution states (approved / rejected / escalated / expired)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[640px] space-y-5">
        <ApprovalGateCard
          action="Grant temporary prod DB read access to on-call agent"
          agent="INCIDENT RESPONSE AGENT"
          riskTone="warn"
          riskLabel="High risk"
          what="Provision a 4-hour scoped read-only credential against the orders-prod database for incident INC-5510."
          why="P1 incident open 22 minutes with no root cause; on-call engineer requested direct query access to correlate order timestamps against the payment gateway log."
          blastRadius="1 credential · read-only · orders-prod schema only · auto-revokes in 4h"
          rollback="Credential auto-expires; can be revoked immediately via IAM console."
          requestedAt="18m ago"
          status="approved"
          decidedBy="sre-mgoncalves"
          decidedAt="17m ago"
        />
        <ApprovalGateCard
          action="Delete 1,204 dormant customer accounts (no login 3y+)"
          agent="COMPLIANCE SWEEP AGENT"
          riskTone="block"
          riskLabel="Critical risk"
          what="Hard-delete customer records flagged as dormant under the data-retention policy, including PII and order history."
          why="Quarterly retention sweep found 1,204 accounts past the 3-year inactivity threshold defined in the data governance policy."
          blastRadius="1,204 accounts · PII + order history · no active subscriptions among them"
          rollback="None — hard delete. A 30-day soft-delete export was not requested by the agent."
          requestedAt="1h ago"
          status="rejected"
          decidedBy="dpo-review-board"
          decidedAt="41m ago"
          reason="Requires soft-delete with 30-day export first, per updated retention SOP v4."
        />
        <ApprovalGateCard
          action="Roll back checkout-service to v2.41.0"
          agent="RELEASE AGENT"
          riskTone="warn"
          riskLabel="High risk"
          what="Revert the checkout-service deployment to the last known-good tag after a 3.2x error-rate spike since v2.42.0 shipped."
          why="Error budget burn rate exceeds the 1h SLO alert threshold; the last 3 deploys before v2.42.0 were all stable."
          blastRadius="checkout-service · all regions · ~40k requests/min in flight"
          rollback="Forward-fix is the rollback of this rollback — v2.42.0 remains tagged and redeployable."
          requestedAt="4m ago"
          status="escalated"
          decidedBy="platform-oncall"
          decidedAt="1m ago"
          reason="Needs a second approver — checkout touches PCI scope, single-approver limit exceeded."
        />
        <ApprovalGateCard
          action="Suspend API key for partner integration &quot;northwind-sync&quot;"
          agent="ABUSE DETECTION AGENT"
          riskTone="review"
          riskLabel="Medium risk"
          what="Suspend the API key after sustained request volume 18x above the partner's contracted rate limit."
          why="No response from partner's on-call contact after 2 automated notices over 30 minutes; volume pattern matches historical credential-leak incidents."
          blastRadius="1 API key · northwind-sync integration only · other partner keys unaffected"
          rollback="Key can be reinstated instantly once partner confirms the traffic is legitimate."
          requestedAt="32m ago"
          status="expired"
        />
      </div>
    </div>
  ),
};

export const MobileWidth: S = {
  name: "Mobile width (375px)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-4">
      <div className="mx-auto max-w-[375px]">
        <ApprovalGateCard
          action="Approve refund of $9,840 across 12 disputed orders"
          agent="DISPUTES AGENT"
          riskTone="warn"
          riskLabel="High risk"
          what="Batch-refund 12 orders flagged as duplicate charges by the payment reconciliation pass."
          why="Same card, same amount, same merchant, within a 90-second window — matches the duplicate-charge heuristic with 97% historical precision."
          blastRadius="$9,840 · 12 orders · 9 distinct customers"
          rollback="Refunds cannot be reversed once submitted to the payment processor."
          requestedAt="6m ago"
          expiresIn="24m"
          onApprove={() => console.log("approve")}
          onReject={() => console.log("reject")}
          onEscalate={() => console.log("escalate")}
        />
      </div>
    </div>
  ),
};
