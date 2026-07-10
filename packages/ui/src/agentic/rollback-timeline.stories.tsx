import type { Meta, StoryObj } from "@storybook/react";
import { RollbackTimeline, type RollbackAction } from "./rollback-timeline.js";

const meta: Meta<typeof RollbackTimeline> = {
  title: "Agentic/Rollback Timeline/V001 Revert Executed Actions",
  component: RollbackTimeline,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof RollbackTimeline>;

// Un run que ya tuvo efectos en el mundo: unos deshacibles, uno compensable
// (requiere una transacción inversa) y uno irreversible (correo ya enviado).
const actions: RollbackAction[] = [
  {
    id: "a1",
    label: "Opened case CRM-4471",
    reversibility: "reversible",
    actorKind: "agent",
    actor: "intake-agent",
    at: "10:01",
    effect: "Created a draft case record — deleting it leaves no external trace.",
  },
  {
    id: "cp1",
    label: "Checkpoint: pre-disbursement state persisted",
    reversibility: "reversible",
    state: "restore-point",
    actorKind: "system",
    at: "10:02",
  },
  {
    id: "a2",
    label: "Sent wire transfer $48,200",
    reversibility: "compensating",
    actorKind: "agent",
    actor: "payments-agent",
    at: "10:03",
    effect: "Funds left the account. Reverting issues a compensating reversal entry, not a delete.",
  },
  {
    id: "a3",
    label: "Emailed confirmation to counterparty",
    reversibility: "irreversible",
    actorKind: "agent",
    actor: "notify-agent",
    at: "10:03",
    effect: "External email delivered — cannot be recalled.",
  },
];

export const MixedReversibility: S = {
  args: { actions },
};

// Revertir hasta el checkpoint arrastra 2 acciones posteriores, una de ellas
// irreversible — el confirm lo advierte explícitamente.
export const RevertCrossesIrreversible: S = {
  args: { actions },
};

// Estado tras un revert ya aplicado: la acción compensada se ve tachada y
// marcada "reverted", no desaparece del historial.
export const AfterRevert: S = {
  args: {
    actions: [
      actions[0],
      actions[1],
      { ...actions[2], state: "reverted" },
      actions[3],
    ],
  },
};

export const AllReversible: S = {
  args: {
    actions: [
      { id: "r1", label: "Tagged 12 records as reviewed", reversibility: "reversible", actorKind: "human", actor: "Maria Chen", at: "09:40", effect: "Metadata-only change." },
      { id: "r2", label: "Moved case to queue B", reversibility: "reversible", actorKind: "agent", actor: "router", at: "09:41" },
    ],
  },
};
