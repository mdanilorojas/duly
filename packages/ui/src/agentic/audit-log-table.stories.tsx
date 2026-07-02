import type { Meta, StoryObj } from "@storybook/react";
import { AuditLogTable, type AuditEvent } from "./audit-log-table.js";

const meta: Meta<typeof AuditLogTable> = {
  title: "Agentic/Audit Log Table/V001 Immutable Stream",
  component: AuditLogTable,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof AuditLogTable>;

const COMPLIANCE_EVENTS: AuditEvent[] = [
  {
    id: "evt-1",
    actorKind: "agent",
    actor: "Treasury Ops Agent",
    action: "Submitted wire transfer for approval",
    resource: "Wire #WT-88213 · $482,000",
    outcome: "review",
    timestamp: "2026-07-02 09:14:03 UTC",
    hash: "a3f9c1e2b7d4",
  },
  {
    id: "evt-2",
    actorKind: "human",
    actor: "Maria Chen",
    action: "Approved wire transfer",
    resource: "Wire #WT-88213 · $482,000",
    outcome: "ok",
    timestamp: "2026-07-02 09:16:41 UTC",
    hash: "f10e2a9c44b1",
  },
  {
    id: "evt-3",
    actorKind: "agent",
    actor: "Compliance Sweep Agent",
    action: "Flagged dormant accounts for deletion",
    resource: "1,204 accounts · retention policy RP-06",
    outcome: "warn",
    timestamp: "2026-07-02 08:52:10 UTC",
    hash: "7c2d8e91a05f",
  },
  {
    id: "evt-4",
    actorKind: "human",
    actor: "Daniel Osei",
    action: "Escalated deletion request to legal",
    resource: "1,204 accounts · retention policy RP-06",
    outcome: "warn",
    timestamp: "2026-07-02 08:58:47 UTC",
    hash: "9b4f6d13e872",
  },
  {
    id: "evt-5",
    actorKind: "system",
    actor: "Retention Job",
    action: "Purged log records past 6-month window",
    resource: "audit-log-2026-01 · 40,112 rows",
    outcome: "info",
    timestamp: "2026-07-02 03:00:00 UTC",
    hash: "0af38c7d1e29",
  },
  {
    id: "evt-6",
    actorKind: "agent",
    actor: "Incident Response Agent",
    action: "Granted temporary prod DB access",
    resource: "on-call:jlopez · orders-prod · 4h TTL",
    outcome: "ok",
    timestamp: "2026-07-02 07:41:19 UTC",
    hash: "5e1a9f402cb6",
  },
  {
    id: "evt-7",
    actorKind: "human",
    actor: "Priya Natarajan",
    action: "Denied access request",
    resource: "on-call:kwhite · billing-prod",
    outcome: "block",
    timestamp: "2026-07-02 07:12:55 UTC",
    hash: "d827b1f6a3c0",
  },
  {
    id: "evt-8",
    actorKind: "agent",
    actor: "Disputes Agent",
    action: "Batch-refunded disputed orders",
    resource: "12 orders · $9,840",
    outcome: "ok",
    timestamp: "2026-07-02 06:30:02 UTC",
    hash: "68f0c92e1a7d",
  },
  {
    id: "evt-9",
    actorKind: "human",
    actor: "Maria Chen",
    action: "Exported signed evidence bundle",
    resource: "Q2 disbursements · PDF + hash manifest",
    outcome: "info",
    timestamp: "2026-07-01 22:04:38 UTC",
    hash: "c41a7e0f9b52",
  },
  {
    id: "evt-10",
    actorKind: "system",
    actor: "Credential Rotation Job",
    action: "Rotated API credential",
    resource: "partner: northwind-sync",
    outcome: "info",
    timestamp: "2026-07-01 20:00:00 UTC",
    hash: "2f8d0a6c31e9",
  },
];

export const ComplianceAuditTrail: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[900px] space-y-6">
        <AuditLogTable title="Compliance audit trail — Q3 disbursements" events={COMPLIANCE_EVENTS} />
        <p className="max-w-[720px] font-mono text-[11px] leading-relaxed text-faint">
          Stream inmutable: cada fila distingue actor humano/agente/sistema con icono y anillo de
          color propios (no solo texto), y lleva un hash badge como señal de inmutabilidad —
          principios #4 y #5 del NORTH_STAR. Separado a propósito de `RetentionBadge` (Art. 19),
          que es una obligación distinta a este log (Art. 12/13).
        </p>
      </div>
    </div>
  ),
};

export const ScrollableDense: S = {
  name: "Scrollable (maxHeight)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[900px]">
        <AuditLogTable
          title="Compliance audit trail — Q3 disbursements"
          events={[...COMPLIANCE_EVENTS, ...COMPLIANCE_EVENTS].map((e, i) => ({ ...e, id: `${e.id}-${i}` }))}
          maxHeight={360}
        />
      </div>
    </div>
  ),
};

export const EmptyLog: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[900px]">
        <AuditLogTable title="Compliance audit trail — Q3 disbursements" events={[]} />
      </div>
    </div>
  ),
};
