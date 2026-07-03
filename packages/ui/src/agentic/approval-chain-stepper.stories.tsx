import type { Meta, StoryObj } from "@storybook/react";
import { ApprovalChainStepper, type ApprovalChainStep } from "./approval-chain-stepper.js";

const meta: Meta<typeof ApprovalChainStepper> = {
  title: "Agentic/Approval Chain/V001 Multi-Level Sign-Off",
  component: ApprovalChainStepper,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof ApprovalChainStepper>;

const WIRE_TRANSFER_STEPS: ApprovalChainStep[] = [
  {
    id: "step-1",
    actorKind: "agent",
    actor: "Treasury Ops Agent",
    role: "Wire initiator (Level 1)",
    status: "approved",
    decidedAt: "2026-07-02 09:14:03 UTC",
    reason: "Auto-approved: within $50k standing authorization, verified payee on allowlist.",
    hash: "a3f9c1e2b7d4",
  },
  {
    id: "step-2",
    actorKind: "human",
    actor: "Daniel Osei",
    role: "Finance Manager (Level 2)",
    status: "approved",
    decidedAt: "2026-07-02 09:22:17 UTC",
    reason: "Confirmed with vendor via callback per SOP-14 before sign-off.",
    hash: "f10e2a9c44b1",
  },
  {
    id: "step-3",
    actorKind: "human",
    actor: "Maria Chen",
    role: "Compliance Lead (Level 3, final)",
    status: "approved",
    decidedAt: "2026-07-02 09:31:52 UTC",
    reason: "Cleared against sanctions list, no flags.",
    hash: "9b4f6d13e872",
  },
];

const REJECTED_AND_REROUTED_STEPS: ApprovalChainStep[] = [
  {
    id: "step-1",
    actorKind: "agent",
    actor: "Treasury Ops Agent",
    role: "Wire initiator (Level 1)",
    status: "approved",
    decidedAt: "2026-07-01 14:02:11 UTC",
    hash: "5e1a9f402cb6",
  },
  {
    id: "step-2",
    actorKind: "human",
    actor: "Daniel Osei",
    role: "Finance Manager (Level 2)",
    status: "rejected",
    decidedAt: "2026-07-01 14:18:44 UTC",
    reason: "Amount exceeds my delegation of authority for this vendor category — needs VP sign-off.",
    hash: "d827b1f6a3c0",
  },
  {
    id: "step-2b",
    actorKind: "human",
    actor: "Priya Natarajan",
    role: "VP Finance (delegated escalation)",
    status: "approved",
    decidedAt: "2026-07-01 15:44:09 UTC",
    reason: "Approved with reduced amount after vendor category exception review.",
    hash: "68f0c92e1a7d",
    branchFrom: "step-2",
  },
  {
    id: "step-3",
    actorKind: "human",
    actor: "Maria Chen",
    role: "Compliance Lead (Level 3, final)",
    status: "pending",
  },
];

const PRIOR_AUTH_STEPS: ApprovalChainStep[] = [
  {
    id: "step-1",
    actorKind: "agent",
    actor: "Prior Auth Intake Agent",
    role: "Clinical criteria match (Level 1)",
    status: "approved",
    decidedAt: "2026-07-02 07:40:22 UTC",
    reason: "CPT 70553 matches medical necessity criteria MN-2201 for this diagnosis code.",
    hash: "0af38c7d1e29",
  },
  {
    id: "step-2",
    actorKind: "human",
    actor: "Dr. Alan Reyes",
    role: "Medical Director (Level 2, final)",
    status: "pending",
  },
];

export const WireTransferFullyApproved: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[620px] space-y-6">
        <ApprovalChainStepper
          subject="Wire #WT-88213 · $482,000 to Northwind Supply Co."
          steps={WIRE_TRANSFER_STEPS}
        />
        <p className="max-w-[560px] font-mono text-[11px] leading-relaxed text-faint">
          Cadena de 3 niveles totalmente resuelta — cada paso reutiliza el vocabulario de actor
          dual y hash badge de `AuditLogTable`, sin introducir tonos nuevos.
        </p>
      </div>
    </div>
  ),
};

export const RejectedThenReroutedThenPending: S = {
  name: "Rejected → re-routed → pending",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[620px] space-y-6">
        <ApprovalChainStepper
          subject="Wire #WT-91004 · $310,000 to Meridian Logistics"
          steps={REJECTED_AND_REROUTED_STEPS}
        />
        <p className="max-w-[560px] font-mono text-[11px] leading-relaxed text-faint">
          El rechazo en Level 2 no detiene el flujo silenciosamente: se re-enruta a un aprobador
          alternativo (rama con conector punteado), y la cadena queda pendiente del paso final.
        </p>
      </div>
    </div>
  ),
};

export const HealthcarePriorAuthPending: S = {
  name: "Healthcare — prior authorization",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[620px] space-y-6">
        <ApprovalChainStepper
          title="Prior authorization chain"
          subject="MRI, lumbar spine w/o contrast · Patient #PT-40218"
          steps={PRIOR_AUTH_STEPS}
        />
      </div>
    </div>
  ),
};

export const EmptyChain: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[620px]">
        <ApprovalChainStepper subject="No approval workflow attached yet" steps={[]} />
      </div>
    </div>
  ),
};
