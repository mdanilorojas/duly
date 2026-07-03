import * as React from "react";
import { cn } from "@/lib/utils";
import { ExecutionHistoryTable, type ExecutionRecord } from "./execution-history-table.js";
import { RunInspector, type RunInspectorNode } from "./run-inspector.js";
import type { RetryAttemptRecord } from "./retry-controls.js";

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
};

export interface ExecutionHistoryConsoleProps extends React.ComponentProps<"div"> {
  title?: string;
  executions?: ExecutionRecord[];
  /** Mapa de id de ejecución → nodos, para alimentar el `RunInspector`. */
  nodesByExecution?: Record<string, RunInspectorNode[]>;
  /** Id inicialmente seleccionado. Por defecto la primera ejecución. */
  initialSelectedId?: string;
}

/**
 * Master-detail de ejecuciones de workflow: `ExecutionHistoryTable` a la
 * izquierda, `RunInspector` a la derecha — el wrapper enterprise sobre n8n
 * que cierra el ítem #1 de la "Prioridad de construcción" del NORTH_STAR.
 * n8n no ofrece white-label completo ni en su plan OEM (branding visible
 * incluso pagando RBAC/SSO — n8n.io/oem/, confirmado 2026-07-02), así que
 * esta consola es una reconstrucción propia de la vista de ejecuciones, no
 * un iframe del editor n8n. El estado de selección vive en este componente
 * para que la story pueda demostrar el flujo completo con un solo click.
 */
export function ExecutionHistoryConsole({
  title = "Workflow Executions",
  executions = DEFAULT_EXECUTIONS,
  nodesByExecution = DEFAULT_EXECUTION_NODES,
  initialSelectedId,
  className,
  ...props
}: ExecutionHistoryConsoleProps) {
  const [selectedId, setSelectedId] = React.useState(initialSelectedId ?? executions[0]?.id);
  const selected = executions.find((e) => e.id === selectedId);
  const nodes = selectedId ? nodesByExecution[selectedId] ?? [] : [];

  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      <header>
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        <p className="max-w-[70ch] text-sm leading-relaxed text-dim">
          Historial de ejecuciones con replay read-only por nodo. Reconstrucción propia de la vista
          de ejecuciones estilo n8n — no depende de su editor ni de su branding.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ExecutionHistoryTable executions={executions} selectedId={selectedId} onSelect={setSelectedId} />
        <RunInspector
          title="Run inspector"
          hint={selected ? `${selected.id} · ${selected.workflowName}` : undefined}
          nodes={nodes}
        />
      </div>
    </div>
  );
}
