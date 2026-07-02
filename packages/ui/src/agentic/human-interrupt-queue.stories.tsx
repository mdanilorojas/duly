import type { Meta, StoryObj } from "@storybook/react";
import { HumanInterruptQueue, type InterruptQueueItem } from "./human-interrupt-queue.js";

const meta: Meta<typeof HumanInterruptQueue> = {
  title: "Agentic/Human Interrupt Queue/V001 Risk-Ordered Inbox",
  component: HumanInterruptQueue,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof HumanInterruptQueue>;

const MIXED_QUEUE: InterruptQueueItem[] = [
  {
    id: "apr-1",
    action: "Wire $482,000 to external account ending 7743",
    agent: "TREASURY OPS AGENT",
    riskTone: "block",
    riskLabel: "Critical risk",
    what: "Execute an outbound wire transfer for the settled trade batch flagged by the reconciliation agent.",
    why: "Beneficiary account was updated 6 hours ago via email request — outside the SWIFT-verified change process.",
    blastRadius: "$482,000 · 1 counterparty · irreversible once submitted",
    rollback: "No automatic rollback — recall requires manual SWIFT MT192 request.",
    requestedAt: "2m ago",
    ageMinutes: 2,
    expiresIn: "13m",
  },
  {
    id: "apr-2",
    action: "Delete 1,204 dormant customer accounts (no login 3y+)",
    agent: "COMPLIANCE SWEEP AGENT",
    riskTone: "block",
    riskLabel: "Critical risk",
    what: "Hard-delete customer records flagged as dormant under the data-retention policy.",
    why: "Quarterly retention sweep found 1,204 accounts past the 3-year inactivity threshold.",
    blastRadius: "1,204 accounts · PII + order history",
    rollback: "None — hard delete, no soft-delete export requested.",
    requestedAt: "47m ago",
    ageMinutes: 47,
    expiresIn: "unattended, past SLA",
  },
  {
    id: "apr-3",
    action: "Roll back checkout-service to v2.41.0",
    agent: "RELEASE AGENT",
    riskTone: "warn",
    riskLabel: "High risk",
    what: "Revert the checkout-service deployment after a 3.2x error-rate spike since v2.42.0 shipped.",
    why: "Error budget burn rate exceeds the 1h SLO alert threshold.",
    blastRadius: "checkout-service · all regions · ~40k requests/min in flight",
    rollback: "v2.42.0 remains tagged and redeployable — forward-fix is straightforward.",
    requestedAt: "4m ago",
    ageMinutes: 4,
    expiresIn: "26m",
  },
  {
    id: "apr-4",
    action: "Grant temporary prod DB read access to on-call agent",
    agent: "INCIDENT RESPONSE AGENT",
    riskTone: "warn",
    riskLabel: "High risk",
    what: "Provision a 4-hour scoped read-only credential against the orders-prod database for INC-5510.",
    why: "P1 incident open 22 minutes with no root cause; on-call requested direct query access.",
    blastRadius: "1 credential · read-only · orders-prod schema only",
    rollback: "Credential auto-expires in 4h; revocable immediately via IAM.",
    requestedAt: "9m ago",
    ageMinutes: 9,
    expiresIn: "51m",
  },
  {
    id: "apr-5",
    action: "Suspend API key for partner integration “northwind-sync”",
    agent: "ABUSE DETECTION AGENT",
    riskTone: "review",
    riskLabel: "Medium risk",
    what: "Suspend the API key after sustained request volume 18x above the partner's contracted rate limit.",
    why: "No response from partner's on-call contact after 2 automated notices over 30 minutes.",
    blastRadius: "1 API key · northwind-sync integration only",
    rollback: "Key can be reinstated instantly once partner confirms legitimacy.",
    requestedAt: "32m ago",
    ageMinutes: 32,
    status: "expired",
  },
  {
    id: "apr-6",
    action: "Approve refund of $9,840 across 12 disputed orders",
    agent: "DISPUTES AGENT",
    riskTone: "warn",
    riskLabel: "High risk",
    what: "Batch-refund 12 orders flagged as duplicate charges by the payment reconciliation pass.",
    why: "Same card, same amount, same merchant, within a 90-second window.",
    blastRadius: "$9,840 · 12 orders · 9 distinct customers",
    rollback: "Refunds cannot be reversed once submitted to the payment processor.",
    requestedAt: "51m ago",
    ageMinutes: 51,
    status: "approved",
    decidedBy: "finance-oncall",
    decidedAt: "49m ago",
  },
  {
    id: "apr-7",
    action: "Archive 3 low-confidence document extraction results",
    agent: "DOCUMENT INTELLIGENCE AGENT",
    riskTone: "ok",
    riskLabel: "Low risk",
    what: "Move 3 extracted contract summaries below the 0.6 confidence threshold to the manual-review archive.",
    why: "Routine confidence gate — no downstream automation depends on these results yet.",
    blastRadius: "3 documents · archived, not deleted · fully reversible",
    rollback: "Restore from archive with one click, no data loss.",
    requestedAt: "1h ago",
    ageMinutes: 61,
    status: "approved",
    decidedBy: "auto-approved (low risk policy)",
    decidedAt: "58m ago",
  },
];

export const MixedRiskQueue: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[760px] space-y-6">
        <HumanInterruptQueue
          title="Human review queue"
          items={MIXED_QUEUE}
          onApprove={(id) => console.log("approve", id)}
          onReject={(id) => console.log("reject", id)}
          onEscalate={(id) => console.log("escalate", id)}
        />
        <p className="max-w-[640px] font-mono text-[11px] leading-relaxed text-faint">
          El orden es riesgo primero, edad después — la solicitud de $482,000 (crítica, 2m de
          espera) queda arriba de la de eliminación de cuentas (también crítica, pero 47m de
          espera queda segunda porque su timeout ya se pasó de SLA, no porque el riesgo sea
          mayor). Las filas ya resueltas (approved/rejected/escalated/expired) quedan al final
          por peso de tono, atenuadas, para que la cola visible priorice lo pendiente.
        </p>
      </div>
    </div>
  ),
};

export const MobileWidth: S = {
  name: "Mobile width (375px)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-4">
      <div className="mx-auto max-w-[375px]">
        <HumanInterruptQueue
          title="Review queue"
          items={MIXED_QUEUE.slice(0, 4)}
          onApprove={(id) => console.log("approve", id)}
          onReject={(id) => console.log("reject", id)}
          onEscalate={(id) => console.log("escalate", id)}
        />
      </div>
    </div>
  ),
};

export const EmptyQueue: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[640px]">
        <HumanInterruptQueue title="Human review queue" items={[]} />
      </div>
    </div>
  ),
};
