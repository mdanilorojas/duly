import {
  AgentGallery,
  LEGAL_AGENTS,
  NEURAL_AGENTS,
  RunTimeline,
  TraceLog,
  HumanInterruptQueue,
  ApprovalGateCard,
  TokenCostMeter,
  GuardrailIndicator,
  ConnectorStatus,
  AgentCard,
  AgentCore,
  AgentMetric,
  AgentMetricRow,
  AgentConsentCard,
  CredentialCard,
  RetentionBadge,
  EvalScoreBadge,
  ErrorWorkflowBanner,
  RetryControls,
  AgentTopologyGraph,
  SwarmControlBar,
  BudgetCapGovernor,
  A2AAgentCardViewer,
  SubworkflowChip,
  StreamingMessage,
  ExecutionTimeline,
  RunStep,
  ToolCallCard,
  TraceTree,
  otelSpansToTraceSpans,
  WhoDidWhatTimeline,
  RichToolCallCard,
  NodeStatusLegend,
  ExecutionHistoryConsole,
  PropertyIntelligenceConsole,
  type InterruptQueueItem,
  type ConnectorEntry,
  type GuardrailPolicy,
  type ConsentScopeItem,
  type ConsentLimit,
  type Credential,
  type RetentionRecord,
  type EvalScoreRun,
  type AgentNode,
  type AgentEdge,
  type A2AAgentCard,
  type AgUiStreamEvent,
  type TraceSpan,
  type OtelGenAiSpan,
  type AuditEventGroup,
  type ToolResultBlock,
  type ExecutionRecord,
  type RunInspectorNode,
} from "@enregla-ui/duly-ui";

const queue: InterruptQueueItem[] = [
  {
    id: "apr-1",
    action: "Enviar $482,000 a cuenta externa terminada en 7743",
    agent: "TREASURY OPS AGENT",
    riskTone: "block",
    riskLabel: "Riesgo crítico",
    what: "Ejecutar transferencia bancaria del lote de trades ya conciliado.",
    why: "La cuenta beneficiaria cambió hace 6 horas por email — fuera del proceso verificado por SWIFT.",
    blastRadius: "$482,000 · 1 contraparte · irreversible una vez enviado",
    rollback: "Sin rollback automático — requiere solicitud manual SWIFT MT192.",
    requestedAt: "hace 2m",
    ageMinutes: 2,
    expiresIn: "13m",
  },
  {
    id: "apr-2",
    action: "Revertir checkout-service a v2.41.0",
    agent: "RELEASE AGENT",
    riskTone: "warn",
    riskLabel: "Riesgo alto",
    what: "Revertir el deploy tras un pico de errores 3.2x desde que se publicó v2.42.0.",
    why: "La tasa de consumo del error budget supera el umbral de SLO de 1h.",
    blastRadius: "checkout-service · todas las regiones · ~40k req/min en curso",
    rollback: "v2.42.0 sigue etiquetado y redeployable — forward-fix directo.",
    requestedAt: "hace 4m",
    ageMinutes: 4,
    expiresIn: "26m",
  },
];

const connectors: ConnectorEntry[] = [
  { id: "gh", name: "GitHub /prod-services", kind: "GitHub", state: "connected", lastSync: "hace 1 min", docCount: 84 },
  { id: "pd", name: "PagerDuty", kind: "webhook", state: "connected", lastSync: "hace 30s" },
  { id: "slk", name: "Slack #incidents", kind: "webhook", state: "syncing", lastSync: "ahora" },
];

const guardrails: GuardrailPolicy[] = [
  { id: "g1", name: "Detección de prompt injection", category: "input", status: "passed", rationale: "Sin patrones de override en el mensaje." },
  { id: "g2", name: "Umbral de confianza", category: "output", status: "warned", rationale: "Confianza 0.71 bajo el umbral 0.85 — se ruteó a revisión humana." },
  { id: "g3", name: "Alcance de la transacción", category: "tool", status: "passed", rationale: "transfer_funds() dentro del límite autorizado del agente." },
];

const consentScope: ConsentScopeItem[] = [
  { id: "s1", label: "Enviar transferencias hasta $50,000", detail: "Requerido para liquidar wires aprobados sin doble captura manual.", riskTone: "warn" },
  { id: "s2", label: "Leer historial de transacciones de la cuenta", riskTone: "info" },
  { id: "s3", label: "Notificar a compliance por Slack", riskTone: "ok" },
];
const consentLimits: ConsentLimit[] = [
  { label: "Tope diario", value: "$200,000" },
  { label: "Vigencia", value: "90 días" },
  { label: "Revocable", value: "Sí, en cualquier momento" },
];

const credential: Credential = {
  id: "cr-1",
  name: "Treasury API Key — prod",
  kind: "api_key",
  owner: "Platform Team",
  lastUsed: "hace 12 min",
  health: "expiring",
  expiresAt: "en 5 días",
  sharedWith: ["wf_wire-transfer", "wf_reconciliation"],
  scopes: ["read:balances", "write:transfers"],
};

const retentionRecord: RetentionRecord = {
  recordId: "rec_88213",
  regime: "worm",
  status: "protected",
  retainedSince: "3 ene 2026",
  minRetentionLabel: "mínimo 180 días",
  legalBasis: "EU AI Act Art. 19",
  progressPct: 62,
  hash: "9f21a0e8",
};

const evalHistory: EvalScoreRun[] = [
  { runId: "r1", score: 91.2 },
  { runId: "r2", score: 89.8 },
  { runId: "r3", score: 93.1 },
];

const errorHandler = {
  executionId: "exec_c98b12",
  workflowName: "Global Error Handler",
  status: "success" as const,
  failedNodeTitle: "HTTP Request: Push to DocuSign",
};

const retryHistory = [
  { attempt: 1, status: "error" as const, trigger: "automatic" as const, at: "10:04:02" },
  { attempt: 2, status: "retrying" as const, trigger: "manual" as const, actor: "Maria Chen", at: "10:06:41" },
];

const topologyNodes: AgentNode[] = [
  { id: "orc", label: "Intake Orchestrator", role: "orchestrator", status: "success", tokens: 1200, costUsd: 0.021, position: { x: 20, y: 20 } },
  { id: "risk", label: "Risk Agent", role: "worker", status: "running", tokens: 3400, costUsd: 0.084, position: { x: 220, y: 10 } },
  { id: "kyc", label: "KYC Agent", role: "worker", status: "waiting", position: { x: 220, y: 140 } },
  { id: "human", label: "Analista de riesgo", role: "human", status: "waiting", position: { x: 420, y: 70 } },
];
const topologyEdges: AgentEdge[] = [
  { id: "e1", source: "orc", target: "risk", active: true, label: "fan-out" },
  { id: "e2", source: "orc", target: "kyc" },
  { id: "e3", source: "risk", target: "human", label: "escala" },
];

const budgetCaps = [
  { scope: "wf_treasury-ops", label: "Treasury Ops · run diario", spentUsd: 42.1, capUsd: 50 },
  { scope: "agent_risk", label: "Risk Agent · por sesión", spentUsd: 8.4, capUsd: 10 },
  { scope: "wf_kyc-batch", label: "KYC Batch · lote nocturno", spentUsd: 120, capUsd: 100 },
];

const a2aCard: A2AAgentCard = {
  name: "Sanctions Screening Agent",
  description: "Verifica contrapartes contra listas OFAC/UE antes de liberar un pago.",
  url: "https://agents.duly.dev/.well-known/agent.json",
  version: "2.3.0",
  provider: "Duly Financial Agents",
  authRequired: true,
  skills: [
    { id: "sk1", name: "screen_counterparty", description: "Screening contra listas de sanciones" },
    { id: "sk2", name: "explain_match", description: "Explica un match ambiguo con evidencia" },
  ],
  inputModes: ["application/json"],
  outputModes: ["application/json", "text/plain"],
};

const subworkflowRef = {
  executionId: "exec_a410cd",
  workflowName: "Customer Onboarding Sync",
  status: "running" as const,
  summary: "4 nodos · 2.1s · 1 retry",
};

const streamEvents: AgUiStreamEvent[] = [
  { type: "THINKING_START" },
  { type: "THINKING_END" },
  { type: "TEXT_MESSAGE_CONTENT", delta: "Revisé la solicitud de wire transfer. " },
  { type: "TEXT_MESSAGE_CONTENT", delta: "Antes de continuar necesito verificar la contraparte." },
  { type: "TOOL_CALL_START", toolCallId: "tc1", toolCallName: "screen_counterparty" },
  { type: "TOOL_CALL_ARGS", toolCallId: "tc1", delta: '{"account":"...7743"}' },
  { type: "TOOL_CALL_RESULT", toolCallId: "tc1", content: "sin coincidencias" },
];

const otelSpans: OtelGenAiSpan[] = [
  {
    spanId: "sp1",
    traceId: "tr1",
    name: "invoke_agent risk-orchestrator",
    startTimeUnixMs: 0,
    endTimeUnixMs: 1400,
    attributes: { "gen_ai.operation.name": "invoke_agent" },
  },
  {
    spanId: "sp2",
    parentSpanId: "sp1",
    traceId: "tr1",
    name: "chat gpt-... risk assessment",
    startTimeUnixMs: 40,
    endTimeUnixMs: 980,
    attributes: {
      "gen_ai.operation.name": "chat",
      "gen_ai.request.model": "gpt-...",
      "gen_ai.usage.input_tokens": 812,
      "gen_ai.usage.output_tokens": 244,
    },
  },
  {
    spanId: "sp3",
    parentSpanId: "sp1",
    traceId: "tr1",
    name: "execute_tool screen_counterparty",
    startTimeUnixMs: 1000,
    endTimeUnixMs: 1380,
    attributes: { "gen_ai.operation.name": "execute_tool" },
  },
];

const whoDidWhatGroups: AuditEventGroup[] = [
  {
    label: "Hoy",
    events: [
      { id: "ev1", actorKind: "agent", actor: "TREASURY OPS AGENT", action: "solicitó aprobación de wire", resource: "Wire #7743", outcome: "review", timestamp: "10:02", hash: "a1b2c3d4" },
      { id: "ev2", actorKind: "human", actor: "Maria Chen", action: "aprobó", resource: "Wire #7743", outcome: "ok", timestamp: "10:07", hash: "e5f6a7b8" },
    ],
  },
  {
    label: "Ayer",
    events: [
      { id: "ev3", actorKind: "system", actor: "Retention Job", action: "purgó registros expirados", resource: "audit_log · 90d", outcome: "info", timestamp: "23:58", hash: "c9d0e1f2" },
    ],
  },
];

const richToolBlocks: ToolResultBlock[] = [
  { kind: "table", columns: ["Cuenta", "Riesgo", "Monto"], rows: [["...7743", "Alto", "$482,000"], ["...2210", "Bajo", "$12,400"]], caption: "screen_counterparty · 2 resultados" },
  { kind: "metrics", items: [{ label: "Latencia", value: "184ms" }, { label: "Confianza", value: "0.94", tone: "ok" }] },
];

const executionHistoryList: ExecutionRecord[] = [
  { id: "exec_1", workflowName: "Invoice Reconciliation", status: "success", triggerMode: "schedule", startedAt: "14:02", duration: "1.8s" },
  { id: "exec_2", workflowName: "Wire Transfer Review", status: "error", triggerMode: "webhook", startedAt: "14:11", duration: "0.6s", attempt: [2, 3] },
  { id: "exec_3", workflowName: "KYC Batch Sync", status: "running", triggerMode: "manual", startedAt: "14:20", duration: "—" },
];
const executionHistoryNodes: Record<string, RunInspectorNode[]> = {
  exec_1: [
    { id: "n1", title: "Webhook trigger", status: "success", meta: "0.0s" },
    { id: "n2", title: "Postgres: Match purchase order", status: "success", meta: "1.2s" },
  ],
  exec_2: [
    { id: "n3", title: "HTTP Request: Push to DocuSign", status: "error", meta: "0.4s", error: "timeout tras 30s", retry: { maxAttempts: 3, history: retryHistory } },
  ],
  exec_3: [
    { id: "n4", title: "Postgres: Extract deltas", status: "running", meta: "en curso" },
  ],
};

export function Agentic() {
  const featured = queue[0]!;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      <div>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Panel de operación de agentes</h1>
        <p style={{ color: "var(--dim)", marginTop: "0.3rem" }}>Flota, corrida en vivo, guardrails y gates pendientes de un vistazo.</p>
      </div>

      <AgentGallery agents={LEGAL_AGENTS} title="Flota activa" subtitle="6 agentes · Legal & Compliance" />

      <RunTimeline
        title="Run del pipeline"
        hint="wf_intake-2026 · run 4821 · iniciado hace 41s"
        nodes={[
          { id: "trigger", title: "Webhook trigger", status: "success", owner: "n8n: Webhook", meta: "0.0s" },
          { id: "validate", title: "Validar payload", status: "success", owner: "n8n: Function", meta: "0.2s" },
          { id: "enrich", title: "Enriquecer vía CRM", status: "running", owner: "n8n: HTTP Request", meta: "1.8s" },
          { id: "risk", title: "Chequeo de riesgo", status: "waiting", owner: "RISK AGENT", meta: "en cola" },
        ]}
      />
      <TraceLog.Root>
        <TraceLog.Header title="Trace del run" hint="run_4821" />
        <TraceLog.Body>
          <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
            Leyendo <TraceLog.Code>config.yaml</TraceLog.Code>
          </TraceLog.Row>
          <TraceLog.Row tone="ok" agent="FETCH" timestamp="10:00:01">
            Datos obtenidos (1.2s).
          </TraceLog.Row>
          <TraceLog.Row tone="warn" agent="TRANSFORM" step="paso 4">
            Campo deprecado detectado.
          </TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <GuardrailIndicator label="Guardrails del run" policies={guardrails} />
        </div>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <TokenCostMeter
            title="Costo del run — run_4821"
            budgetUsd={1.0}
            tokensIn={33390}
            tokensOut={3170}
            breakdown={[
              { label: "Model", costUsd: 0.4533, tone: "review" },
              { label: "Tools", costUsd: 0.0015, tone: "info" },
            ]}
          />
        </div>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Fuentes conectadas</p>
          <ConnectorStatus connectors={connectors} />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1.1fr 1fr" }}>
        <HumanInterruptQueue
          title="Cola de aprobación humana"
          items={queue}
          onApprove={(id) => console.log("approve", id)}
          onReject={(id) => console.log("reject", id)}
          onEscalate={(id) => console.log("escalate", id)}
        />
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Gate más urgente</p>
          <ApprovalGateCard
            action={featured.action}
            agent={featured.agent}
            riskTone={featured.riskTone}
            riskLabel={featured.riskLabel}
            what={featured.what}
            why={featured.why}
            blastRadius={featured.blastRadius}
            rollback={featured.rollback}
            requestedAt={featured.requestedAt}
            expiresIn={featured.expiresIn}
            onApprove={() => console.log("approve", featured.id)}
            onReject={() => console.log("reject", featured.id)}
            onEscalate={() => console.log("escalate", featured.id)}
          />
        </div>
      </div>

      <div>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Roster de agentes</p>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <AgentCard agent={NEURAL_AGENTS[2]} />
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <AgentCore agent={NEURAL_AGENTS[4]} size={64} />
            <div>
              <p style={{ fontWeight: 600 }}>{NEURAL_AGENTS[4].name}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--dim)" }}>{NEURAL_AGENTS[4].role}</p>
            </div>
          </div>
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
            <AgentMetricRow>
              <AgentMetric label="Predios / request" value="2000" />
              <AgentMetric label="Latencia p50" value="340" unit="ms" tone="review" />
              <AgentMetric label="Precisión" value="99.4" unit="%" tone="ok" />
            </AgentMetricRow>
          </div>
        </div>
      </div>

      <div>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Confianza y consentimiento</p>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <AgentConsentCard
            agent={NEURAL_AGENTS[0]}
            status="pending"
            scope={consentScope}
            limits={consentLimits}
            requestedAt="hace 3 min"
            onConsent={() => console.log("consent")}
            onDecline={() => console.log("decline")}
          />
          <CredentialCard credential={credential} />
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem", display: "flex", alignItems: "flex-start" }}>
            <RetentionBadge record={retentionRecord} />
          </div>
        </div>
      </div>

      <div>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Calidad y manejo de errores</p>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <EvalScoreBadge name="Faithfulness" score={91.8} threshold={90} history={evalHistory} />
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
            <ErrorWorkflowBanner handler={errorHandler} />
          </div>
          <RetryControls attempt={[2, 3]} failedNodeTitle="HTTP Request: Push to DocuSign" history={retryHistory} />
        </div>
      </div>

      <div>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Orquestación multi-agente</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <AgentTopologyGraph nodes={topologyNodes} edges={topologyEdges} graphHeight={280} />
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <SwarmControlBar state="running" selectionCount={12} onPause={() => console.log("pause")} onCancel={() => console.log("cancel")} />
            <BudgetCapGovernor caps={budgetCaps} />
            <A2AAgentCardViewer card={a2aCard} />
          </div>
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
            <SubworkflowChip subworkflow={subworkflowRef} />
          </div>
        </div>
      </div>

      <div>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Streaming e integraciones</p>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <StreamingMessage events={streamEvents} streaming />
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--dim)" }}>
              MCPAppsWidgetFrame requiere un proxy sandbox real (<code>SandboxConfig.url</code>) sirviendo el recurso de UI de un tool MCP — no se puede montar en vivo sin un servidor MCP corriendo, así que aquí solo queda documentado.
            </p>
          </div>
        </div>
      </div>

      <div>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Trazabilidad extendida</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ExecutionTimeline title="Pasos del run" hint="run_4821 · 2.4s">
            <RunStep kind="tool_call" tone="info" title="search_knowledge_base(query)" agent="RETRIEVAL AGENT" timestamp="T+00:00.4s" duration="212ms">
              <ToolCallCard tool="search_knowledge_base" input={{ query: "wire transfer policy" }} output="4 documentos relevantes." latency="212ms" />
            </RunStep>
            <RunStep kind="decision" tone="review" title="¿Requiere aprobación humana?" agent="RISK AGENT" timestamp="T+00:01.1s" />
            <RunStep kind="approval" tone="warn" title="Escalado a Maria Chen" agent="RISK AGENT" timestamp="T+00:01.3s" isLast />
          </ExecutionTimeline>
          <TraceTree title="Spans del run" runId="run_4821" spans={otelSpansToTraceSpans(otelSpans)} />
          <p style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--faint)" }}>↑ vía OtelTraceAdapter (otelSpansToTraceSpans)</p>
          <WhoDidWhatTimeline title="Quién hizo qué" groups={whoDidWhatGroups} />
          <RichToolCallCard tool="screen_counterparty" input={{ account: "...7743" }} blocks={richToolBlocks} latency="184ms" />
          <NodeStatusLegend />
        </div>
      </div>

      <div>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Ejecución histórica</p>
        <ExecutionHistoryConsole executions={executionHistoryList} nodesByExecution={executionHistoryNodes} />
      </div>

      <div>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--faint)" }}>Vertical inmobiliaria</p>
        <PropertyIntelligenceConsole />
      </div>
    </div>
  );
}
