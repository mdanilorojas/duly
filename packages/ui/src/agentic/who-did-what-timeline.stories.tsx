import type { Meta, StoryObj } from "@storybook/react";
import type { AuditEvent } from "./audit-log-table.js";
import { WhoDidWhatTimeline, type AuditEventGroup, type SavedQuery } from "./who-did-what-timeline.js";

const meta: Meta<typeof WhoDidWhatTimeline> = {
  title: "Agentic/Who Did What Timeline/V001 Auditor Self-Service",
  component: WhoDidWhatTimeline,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof WhoDidWhatTimeline>;

const TODAY: AuditEvent[] = [
  {
    id: "t-1",
    actorKind: "agent",
    actor: "Treasury Ops Agent",
    action: "submitted wire transfer for approval on",
    resource: "Wire #WT-88213 · $482,000",
    outcome: "review",
    timestamp: "09:14 UTC",
    hash: "a3f9c1e2b7d4",
  },
  {
    id: "t-2",
    actorKind: "human",
    actor: "Maria Chen",
    action: "approved wire transfer on",
    resource: "Wire #WT-88213 · $482,000",
    outcome: "ok",
    timestamp: "09:16 UTC",
    hash: "f10e2a9c44b1",
  },
  {
    id: "t-3",
    actorKind: "agent",
    actor: "Compliance Sweep Agent",
    action: "flagged 1,204 dormant accounts under",
    resource: "retention policy RP-06",
    outcome: "warn",
    timestamp: "08:52 UTC",
    hash: "7c2d8e91a05f",
  },
  {
    id: "t-4",
    actorKind: "human",
    actor: "Priya Natarajan",
    action: "denied access request for",
    resource: "on-call:kwhite · billing-prod",
    outcome: "block",
    timestamp: "07:12 UTC",
    hash: "d827b1f6a3c0",
  },
  {
    id: "t-5",
    actorKind: "system",
    actor: "Credential Rotation Job",
    action: "rotated API credential for",
    resource: "partner: northwind-sync",
    outcome: "info",
    timestamp: "06:00 UTC",
    hash: "2f8d0a6c31e9",
  },
];

const YESTERDAY: AuditEvent[] = [
  {
    id: "y-1",
    actorKind: "human",
    actor: "Maria Chen",
    action: "exported signed evidence bundle for",
    resource: "Q2 disbursements · PDF + hash manifest",
    outcome: "info",
    timestamp: "22:04 UTC",
    hash: "c41a7e0f9b52",
  },
  {
    id: "y-2",
    actorKind: "agent",
    actor: "Disputes Agent",
    action: "batch-refunded 12 disputed orders totalling",
    resource: "$9,840",
    outcome: "ok",
    timestamp: "18:30 UTC",
    hash: "68f0c92e1a7d",
  },
  {
    id: "y-3",
    actorKind: "agent",
    actor: "Incident Response Agent",
    action: "granted temporary prod DB access to",
    resource: "on-call:jlopez · orders-prod · 4h TTL",
    outcome: "ok",
    timestamp: "14:41 UTC",
    hash: "5e1a9f402cb6",
  },
];

const LAST_WEEK: AuditEvent[] = [
  {
    id: "w-1",
    actorKind: "system",
    actor: "Retention Job",
    action: "purged log records past the 6-month window from",
    resource: "audit-log-2026-01 · 40,112 rows",
    outcome: "info",
    timestamp: "Jun 28, 03:00 UTC",
    hash: "0af38c7d1e29",
  },
  {
    id: "w-2",
    actorKind: "human",
    actor: "Daniel Osei",
    action: "escalated a deletion request to legal for",
    resource: "1,204 accounts · retention policy RP-06",
    outcome: "warn",
    timestamp: "Jun 27, 16:12 UTC",
    hash: "9b4f6d13e872",
  },
];

const GROUPS: AuditEventGroup[] = [
  { label: "Today", events: TODAY },
  { label: "Yesterday", events: YESTERDAY },
  { label: "Last week", events: LAST_WEEK },
];

const SAVED_QUERIES: SavedQuery[] = [
  {
    id: "ai-only",
    label: "AI actions only",
    predicate: (e) => e.actorKind === "agent",
  },
  {
    id: "maria-chen",
    label: "Maria Chen — this month",
    predicate: (e) => e.actor === "Maria Chen",
  },
  {
    id: "blocked",
    label: "Blocked outcomes",
    predicate: (e) => e.outcome === "block",
  },
  {
    id: "needs-review",
    label: "Needs review or worse",
    predicate: (e) => e.outcome === "block" || e.outcome === "warn" || e.outcome === "review",
  },
];

export const AuditorSelfService: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[760px] space-y-6">
        <WhoDidWhatTimeline
          title="Who did what — Treasury &amp; Compliance"
          groups={GROUPS}
          savedQueries={SAVED_QUERIES}
        />
        <p className="max-w-[640px] font-mono text-[11px] leading-relaxed text-faint">
          Principio #10 del NORTH_STAR: "saved queries como feature de compliance — el auditor se
          autoservicia". Los chips son toggle de un toque (ej. "AI actions only" filtra por
          `actorKind === agent`); el conteo junto a cada chip se recalcula sobre el total, no solo
          lo visible, para que el auditor sepa cuánto hay antes de aplicar el filtro.
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
        <WhoDidWhatTimeline
          title="Who did what"
          groups={[{ label: "Today", events: TODAY }]}
          savedQueries={SAVED_QUERIES.slice(0, 2)}
        />
      </div>
    </div>
  ),
};

export const EmptyTimeline: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[640px]">
        <WhoDidWhatTimeline title="Who did what" groups={[]} savedQueries={SAVED_QUERIES} />
      </div>
    </div>
  ),
};
