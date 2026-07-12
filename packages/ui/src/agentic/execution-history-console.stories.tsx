import type { Meta, StoryObj } from "@storybook/react";
import { ExecutionHistoryConsole } from "./execution-history-console.js";
import { ExecutionHistoryTable, type ExecutionRecord } from "./execution-history-table.js";
import { RunInspector, type RunInspectorNode } from "./run-inspector.js";
import type { RetryAttemptRecord } from "./retry-controls.js";

// Fixtures del storybook (antes vivían como export de execution-history-console.tsx;
// movidas aquí porque este es su único consumidor real — el componente de librería
// no debe traer demo data como default de producción).
export const DEFAULT_EXECUTIONS: ExecutionRecord[] = [
  {
    id: "exec_8f21a0",
    workflowName: "Invoice Reconciliation",
    status: "success",
    triggerMode: "manual",
    startedAt: "Jul 3, 09:12",
    duration: "2.4s",
  },
  {
    id: "exec_7c39d2",
    workflowName: "Lead Enrichment",
    status: "running",
    triggerMode: "webhook",
    startedAt: "Jul 3, 14:02",
    duration: "—",
  },
  {
    id: "exec_a10f55",
    workflowName: "Contract Redline Review",
    status: "error",
    triggerMode: "schedule",
    startedAt: "Jul 3, 06:00",
    duration: "8.1s",
    // El Error Trigger de "Global Error Handler" (exec_5e01f0) capturó este
    // fallo — `onOpen` se agrega genéricamente en `ExecutionHistoryConsole`.
    errorHandler: {
      executionId: "exec_5e01f0",
      workflowName: "Global Error Handler",
      status: "success",
      failedNodeTitle: "HTTP Request: Push to DocuSign",
    },
  },
  {
    id: "exec_c98b12",
    workflowName: "Customer Onboarding Sync",
    status: "retrying",
    triggerMode: "error_handler",
    startedAt: "Jul 3, 13:47",
    duration: "—",
    attempt: [2, 3],
  },
  {
    id: "exec_e44a90",
    workflowName: "Data Warehouse Nightly Sync",
    status: "success",
    triggerMode: "schedule",
    startedAt: "Jul 3, 02:00",
    duration: "41.2s",
  },
  {
    id: "exec_0091cd",
    workflowName: "Incident Escalation",
    status: "waiting",
    triggerMode: "webhook",
    startedAt: "Jul 3, 14:05",
    duration: "—",
  },
  {
    id: "exec_9931aa",
    workflowName: "Vendor Compliance Check",
    status: "success",
    triggerMode: "manual",
    startedAt: "Jul 3, 09:12",
    duration: "1.1s",
  },
  {
    id: "exec_5e01f0",
    workflowName: "Global Error Handler",
    status: "success",
    triggerMode: "error_handler",
    startedAt: "Jul 3, 06:00",
    duration: "640ms",
  },
];

const DOCUSIGN_RETRY_HISTORY: RetryAttemptRecord[] = [
  { attempt: 1, status: "error", trigger: "automatic", at: "05:59:12" },
  { attempt: 2, status: "error", trigger: "automatic", at: "05:59:47" },
  { attempt: 3, status: "error", trigger: "automatic", at: "06:00:52" },
];

export const DEFAULT_EXECUTION_NODES: Record<string, RunInspectorNode[]> = {
  exec_8f21a0: [
    { id: "n1", title: "Manual Trigger", status: "success", nodeType: "n8n-nodes-base.manualTrigger", meta: "T+00.0s" },
    {
      id: "n2",
      title: "HTTP Request: Fetch invoice",
      status: "success",
      nodeType: "n8n-nodes-base.httpRequest",
      meta: "312ms",
      input: { url: "/api/invoices/88213", method: "GET" },
      output: { status: "200", "amount_usd": "42,500", vendor: "Acme Supply Co." },
    },
    {
      id: "n3",
      title: "Postgres: Match purchase order",
      status: "success",
      nodeType: "n8n-nodes-base.postgres",
      meta: "89ms",
      input: { table: "purchase_orders", where: "vendor_id = 4471" },
      output: { matched: "true", po_number: "PO-20388" },
    },
    {
      id: "n4",
      title: "IF: Amount > $10,000",
      status: "success",
      nodeType: "n8n-nodes-base.if",
      meta: "4ms",
      input: { amount_usd: "42,500", threshold: "10,000" },
      output: { branch: "true" },
    },
    {
      id: "n4b",
      title: "Execute Workflow: Vendor compliance check",
      status: "success",
      nodeType: "n8n-nodes-base.executeWorkflow",
      meta: "1.1s",
      input: { vendor: "Acme Supply Co.", workflow_id: "wf_vendor_compliance" },
      output: { verdict: "clear" },
      // Ejecución hija — `onOpen` se agrega genéricamente en `ExecutionHistoryConsole`.
      subworkflow: {
        executionId: "exec_9931aa",
        workflowName: "Vendor Compliance Check",
        status: "success",
        summary: "3 nodes · 1.1s",
      },
    },
    {
      id: "n5",
      title: "Slack: Notify finance",
      status: "success",
      nodeType: "n8n-nodes-base.slack",
      meta: "228ms",
      input: { channel: "#finance-ops" },
      output: { message_ts: "1751558.221" },
    },
  ],
  exec_7c39d2: [
    { id: "n1", title: "Webhook: New lead", status: "success", nodeType: "n8n-nodes-base.webhook", meta: "T+00.0s", input: { source: "marketo" }, output: { lead_id: "L-99120" } },
    {
      id: "n2",
      title: "HTTP Request: Enrich via Clearbit",
      status: "running",
      nodeType: "n8n-nodes-base.httpRequest",
      meta: "T+01.1s",
      input: { email: "j.rivera@northfield-realty.com" },
    },
    { id: "n3", title: "Set: Normalize fields", status: "waiting", nodeType: "n8n-nodes-base.set", meta: "pending" },
    { id: "n4", title: "CRM: Upsert contact", status: "waiting", nodeType: "n8n-nodes-base.hubspot", meta: "pending" },
  ],
  exec_a10f55: [
    { id: "n1", title: "Schedule Trigger", status: "success", nodeType: "n8n-nodes-base.scheduleTrigger", meta: "T+00.0s" },
    {
      id: "n2",
      title: "HTTP Request: Fetch contract",
      status: "success",
      nodeType: "n8n-nodes-base.httpRequest",
      meta: "410ms",
      input: { contract_id: "CT-2201" },
      output: { pages: "14", format: "docx" },
    },
    {
      id: "n3",
      title: "LLM: Extract clauses",
      status: "success",
      nodeType: "n8n-nodes-base.openAi",
      meta: "2.9s",
      input: { model: "claude-sonnet-5", clause_types: "termination, liability, indemnity" },
      output: { clauses_found: "9", flagged: "2" },
    },
    {
      id: "n4",
      title: "HTTP Request: Push to DocuSign",
      status: "error",
      nodeType: "n8n-nodes-base.httpRequest",
      meta: "4.8s",
      input: { envelope_id: "env_77c1", endpoint: "/envelopes/send" },
      output: { status: "504" },
      error: "504 Gateway Timeout after 3 retries — DocuSign API unreachable.",
      attempt: [3, 3],
      retry: {
        maxAttempts: 3,
        history: DOCUSIGN_RETRY_HISTORY,
      },
    },
    { id: "n5", title: "Slack: Notify legal", status: "skipped", nodeType: "n8n-nodes-base.slack", meta: "not reached" },
  ],
  exec_c98b12: [
    { id: "n1", title: "Error Trigger", status: "success", nodeType: "n8n-nodes-base.errorTrigger", meta: "T+00.0s", input: { source_workflow: "Customer Onboarding" } },
    {
      id: "n2",
      title: "Postgres: Reload failed record",
      status: "success",
      nodeType: "n8n-nodes-base.postgres",
      meta: "61ms",
      output: { customer_id: "C-40921" },
    },
    {
      id: "n3",
      title: "HTTP Request: Retry CRM sync",
      status: "retrying",
      nodeType: "n8n-nodes-base.httpRequest",
      meta: "T+02.4s",
      attempt: [2, 3],
      input: { endpoint: "/crm/v2/contacts/upsert" },
      output: { last_error: "429 rate limited" },
    },
  ],
  exec_e44a90: [
    { id: "n1", title: "Schedule Trigger", status: "success", nodeType: "n8n-nodes-base.scheduleTrigger", meta: "T+00.0s" },
    { id: "n2", title: "Postgres: Extract deltas", status: "success", nodeType: "n8n-nodes-base.postgres", meta: "18.6s", output: { rows: "412,003" } },
    { id: "n3", title: "Function: Transform schema", status: "success", nodeType: "n8n-nodes-base.function", meta: "12.1s" },
    { id: "n4", title: "S3: Write parquet", status: "success", nodeType: "n8n-nodes-base.awsS3", meta: "9.9s", output: { bytes: "88.4MB" } },
    { id: "n5", title: "Slack: Post summary", status: "success", nodeType: "n8n-nodes-base.slack", meta: "612ms" },
  ],
  exec_0091cd: [
    { id: "n1", title: "Webhook: PagerDuty alert", status: "success", nodeType: "n8n-nodes-base.webhook", meta: "T+00.0s", output: { severity: "SEV-2" } },
    { id: "n2", title: "Function: Classify severity", status: "success", nodeType: "n8n-nodes-base.function", meta: "22ms" },
    { id: "n3", title: "Human Approval: Page on-call?", status: "waiting", nodeType: "n8n-nodes-base.wait", meta: "awaiting response" },
  ],
  // Ejecución hija de "Execute Workflow: Vendor compliance check" (n4b de
  // exec_8f21a0) — llega aquí navegando el `SubworkflowChip`.
  exec_9931aa: [
    {
      id: "n1",
      title: "Execute Workflow Trigger",
      status: "success",
      nodeType: "n8n-nodes-base.executeWorkflowTrigger",
      meta: "T+00.0s",
      input: { parent_execution: "exec_8f21a0", vendor: "Acme Supply Co." },
    },
    {
      id: "n2",
      title: "HTTP Request: Check sanctions list",
      status: "success",
      nodeType: "n8n-nodes-base.httpRequest",
      meta: "340ms",
      input: { vendor: "Acme Supply Co." },
      output: { flagged: "false" },
    },
    {
      id: "n3",
      title: "Set: Compliance verdict",
      status: "success",
      nodeType: "n8n-nodes-base.set",
      meta: "6ms",
      output: { verdict: "clear" },
    },
  ],
  // Disparada por el Error Trigger de "Contract Redline Review" (exec_a10f55)
  // — llega aquí navegando el `ErrorWorkflowBanner`.
  exec_5e01f0: [
    {
      id: "n1",
      title: "Error Trigger",
      status: "success",
      nodeType: "n8n-nodes-base.errorTrigger",
      meta: "T+00.0s",
      input: { source_workflow: "Contract Redline Review", failed_node: "HTTP Request: Push to DocuSign" },
    },
    {
      id: "n2",
      title: "Slack: Notify legal ops",
      status: "success",
      nodeType: "n8n-nodes-base.slack",
      meta: "212ms",
      input: { channel: "#legal-ops" },
      output: { message_ts: "1751558.640" },
    },
    {
      id: "n3",
      title: "Postgres: Log incident",
      status: "success",
      nodeType: "n8n-nodes-base.postgres",
      meta: "58ms",
      output: { incident_id: "INC-3092" },
    },
  ],
};

const meta: Meta<typeof ExecutionHistoryConsole> = {
  title: "Agentic/Execution History/V001 n8n-style Runs",
  component: ExecutionHistoryConsole,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof ExecutionHistoryConsole>;

export const MasterDetail: S = {
  name: "Master-detail console",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <ExecutionHistoryConsole executions={DEFAULT_EXECUTIONS} nodesByExecution={DEFAULT_EXECUTION_NODES} />
        <p className="max-w-[760px] font-mono text-[11px] leading-relaxed text-faint">
          Click "Inspect" en cualquier fila para reemplazar el contenido de `RunInspector` a la
          derecha. n8n no ofrece white-label completo ni en su plan OEM (n8n.io/oem/, confirmado
          2026-07-02) — esta consola es una reconstrucción propia de la vista de ejecuciones, no un
          iframe de marca ajena. El nodo `exec_a10f55` (Contract Redline Review) abre con el marcador
          "Failed here" ya expandido por defecto. `exec_8f21a0` (Invoice Reconciliation) tiene un
          nodo "Execute Workflow" con un `SubworkflowChip` — click en el nombre del workflow para
          saltar a la ejecución hija `exec_9931aa`. `exec_a10f55` además muestra un
          `ErrorWorkflowBanner` que enlaza a `exec_5e01f0` (Global Error Handler) que capturó su
          fallo.
        </p>
      </div>
    </div>
  ),
};

export const StartedOnFailedRun: S = {
  name: "Deep-link into a failed run",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[1200px]">
        <ExecutionHistoryConsole
          title="Contract Ops — Executions"
          executions={DEFAULT_EXECUTIONS}
          nodesByExecution={DEFAULT_EXECUTION_NODES}
          initialSelectedId="exec_a10f55"
        />
      </div>
    </div>
  ),
};

export const TableOnly: S = {
  name: "ExecutionHistoryTable (standalone)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[900px]">
        <ExecutionHistoryTable executions={DEFAULT_EXECUTIONS} />
      </div>
    </div>
  ),
};

export const InspectorOnly: S = {
  name: "RunInspector (standalone, failed run)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[720px]">
        <RunInspector
          title="Run inspector"
          hint="exec_a10f55 · Contract Redline Review"
          nodes={DEFAULT_EXECUTION_NODES.exec_a10f55}
        />
      </div>
    </div>
  ),
};

export const InspectorEmpty: S = {
  name: "RunInspector (no selection)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[720px]">
        <RunInspector title="Run inspector" nodes={[]} />
      </div>
    </div>
  ),
};
