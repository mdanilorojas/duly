import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RichToolCallCard, type ToolResultBlock } from "./rich-tool-call-card.js";

const meta: Meta<typeof RichToolCallCard> = {
  title: "Agentic/Tool Call Card/V002 Rich Tool-UI",
  component: RichToolCallCard,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof RichToolCallCard>;

export const TableResult: S = {
  name: "Table — SQL query result",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[560px]">
        <RichToolCallCard
          tone="ok"
          tool="query_claims_db(status='flagged', region='gulf-coast')"
          input={{ rows_limit: 50, database: "claims_prod_readonly" }}
          latency="118ms"
          blocks={[
            {
              kind: "table",
              columns: ["Claim ID", "Policy", "Amount", "Risk"],
              rows: [
                ["CLM-88213", "POL-4471", "$212,400", "High"],
                ["CLM-88240", "POL-9902", "$18,900", "Low"],
                ["CLM-88251", "POL-2216", "$94,000", "Medium"],
                ["CLM-88267", "POL-7734", "$401,200", "High"],
              ],
              caption: "4 of 4 rows shown — full result set under limit.",
            },
          ]}
        />
      </div>
    </div>
  ),
};

export const DiffResult: S = {
  name: "Diff — contract redline",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[640px]">
        <RichToolCallCard
          tone="warn"
          tool="draft_redline(clause='indemnity_cap', policy='max_liability_2x_fees')"
          latency="164ms"
          blocks={[
            {
              kind: "diff",
              beforeLabel: "Original clause",
              afterLabel: "Proposed redline",
              before: "Contractor's liability under this indemnity shall be unlimited.",
              after: "Contractor's liability under this indemnity shall not exceed 2× the annual contract value.",
            },
          ]}
        />
      </div>
    </div>
  ),
};

export const CitationsResult: S = {
  name: "Citations — retrieval agent sources",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[560px]">
        <RichToolCallCard
          tone="ok"
          tool="search_knowledge_base(query='indemnity clause precedent')"
          input={{ top_k: 3, index: "contracts-2026" }}
          latency="212ms"
          blocks={[
            {
              kind: "citations",
              items: [
                {
                  label: "MSA-Template-C §14.2",
                  source: "contracts/msa-template-c.pdf",
                  snippet: "Liability under this indemnity shall not exceed two times the fees paid in the preceding 12 months.",
                  score: 0.91,
                },
                {
                  label: "Vendor Agreement — Meridian Corp",
                  source: "contracts/vendor-meridian-2025.pdf",
                  snippet: "Indemnity obligations capped at annual contract value.",
                  score: 0.84,
                },
                {
                  label: "Legal playbook — indemnity clauses",
                  source: "policy/legal-playbook.md",
                  score: 0.77,
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  ),
};

export const MetricsResult: S = {
  name: "Metrics — risk scoring tool",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[520px]">
        <RichToolCallCard
          tone="warn"
          tool="score_risk(clause='indemnity_cap')"
          latency="88ms"
          blocks={[
            {
              kind: "metrics",
              items: [
                { label: "Risk score", value: "0.72", tone: "warn" },
                { label: "Threshold", value: "0.60", tone: "info" },
                { label: "Precedent dev.", value: "High", tone: "block" },
                { label: "Counterparty", value: "New", tone: "review" },
              ],
            },
          ]}
        />
      </div>
    </div>
  ),
};

export const CodeResult: S = {
  name: "Code — generated config",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[560px]">
        <RichToolCallCard
          tone="ok"
          tool="generate_workflow_config(trigger='invoice.created')"
          latency="340ms"
          blocks={[
            {
              kind: "code",
              language: "json",
              content: `{
  "trigger": "invoice.created",
  "conditions": [{ "field": "amount_usd", "gt": 50000 }],
  "actions": ["route_to_approval", "notify_finance_ops"]
}`,
            },
          ]}
        />
      </div>
    </div>
  ),
};

function ConfirmDemo() {
  const [status, setStatus] = React.useState<"pending" | "confirmed" | "declined">("pending");
  return (
    <RichToolCallCard
      tone="review"
      tool="schedule_wire_transfer(amount=48200.00, recipient='Meridian Corp')"
      input={{ currency: "USD", settlement: "T+1" }}
      blocks={[
        {
          kind: "confirm",
          prompt: "Confirm wire transfer of $48,200.00 to Meridian Corp (new payee, first transfer)?",
          status,
          confirmLabel: "Confirm transfer",
          declineLabel: "Cancel",
          onConfirm: () => setStatus("confirmed"),
          onDecline: () => setStatus("declined"),
        },
      ]}
    />
  );
}

export const ConfirmResultInteractive: S = {
  name: "Confirm — inline HITL widget (interactive)",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[560px]">
        <ConfirmDemo />
      </div>
    </div>
  ),
};

export const MultiBlockResult: S = {
  name: "Composed — multiple blocks in one tool result",
  render: () => {
    const blocks: ToolResultBlock[] = [
      {
        kind: "metrics",
        items: [
          { label: "Documents scanned", value: "1,204", tone: "info" },
          { label: "Flagged", value: "18", tone: "warn" },
          { label: "Auto-cleared", value: "1,186", tone: "ok" },
        ],
      },
      {
        kind: "table",
        columns: ["Document", "Issue", "Severity"],
        rows: [
          ["invoice_9931.pdf", "Missing PO reference", "Medium"],
          ["invoice_9944.pdf", "Amount mismatch vs. contract", "High"],
        ],
      },
      {
        kind: "citations",
        items: [
          { label: "Procurement policy §4.1", source: "policy/procurement.md", score: 0.88 },
        ],
      },
    ];
    return (
      <div className="grid min-h-screen place-items-center bg-bg-base p-12">
        <div className="w-full max-w-[600px]">
          <RichToolCallCard
            tone="warn"
            tool="reconcile_invoices(batch='2026-07-01')"
            latency="1.9s"
            blocks={blocks}
          />
        </div>
      </div>
    );
  },
};
