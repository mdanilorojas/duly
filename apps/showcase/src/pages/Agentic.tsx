import {
  AgentGallery,
  LEGAL_AGENTS,
  RunTimeline,
  TraceLog,
  HumanInterruptQueue,
  ApprovalGateCard,
  TokenCostMeter,
  GuardrailIndicator,
  ConnectorStatus,
  type InterruptQueueItem,
  type ConnectorEntry,
  type GuardrailPolicy,
} from "@duly/ui";

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
    </div>
  );
}
