import { useState } from "react";
import {
  AppShell,
  AppSidebar,
  WorkspaceSwitcher,
  Stepper,
  Dropzone,
  Progress,
  BandGauge,
  DeltaList,
  KanbanBoard,
  AgentStatusMatrix,
  ConnectorStatus,
  AuditLogTable,
  HumanInterruptQueue,
  ApprovalGateCard,
  TraceLog,
  RunTimeline,
  type Workspace,
  type KanbanColumn,
  type ConnectorEntry,
  type AuditEvent,
  type InterruptQueueItem,
} from "@duly/ui";

const isoSteps = [
  { label: "Acumulación", state: "done" as const },
  { label: "Recopilación", state: "done" as const },
  { label: "Alcance", state: "done" as const },
  { label: "Inventario", state: "done" as const },
  { label: "2ª Revisión", state: "current" as const },
  { label: "Feedback", state: "pending" as const },
  { label: "Gate HITL", state: "pending" as const },
  { label: "Remediación", state: "pending" as const },
];

type View = "dashboard" | "dataroom" | "cola" | "corrida" | "ciclo";
const VIEWS: { id: View; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "dataroom", label: "Data room" },
  { id: "cola", label: "Cola de revisión" },
  { id: "corrida", label: "Corrida en vivo" },
  { id: "ciclo", label: "Backlog / ciclo" },
];

// Taxonomía real del SGSI: 8 cláusulas (4-10) + 5 dominios del Anexo A.
// Tone mapping 1:1: strong→ok, partial→warn, weak→info, missing→block,
// requires_human_judgment→review.
const sgsiAreas = [
  { code: "SCOPE", label: "Alcance del SGSI (cl. 4)", tone: "ok" as const },
  { code: "CTX", label: "Contexto de la organización", tone: "ok" as const },
  { code: "LEADER", label: "Liderazgo (cl. 5)", tone: "ok" as const },
  { code: "PLAN", label: "Planificación (cl. 6)", tone: "warn" as const },
  { code: "SUPPORT", label: "Soporte (cl. 7)", tone: "warn" as const },
  { code: "OPS", label: "Operación (cl. 8)", tone: "info" as const },
  { code: "EVAL", label: "Evaluación del desempeño (cl. 9)", tone: "ok" as const },
  { code: "CORR-ACT", label: "Acción correctiva (cl. 10)", tone: "review" as const },
  { code: "A5", label: "Controles organizacionales (Anexo A)", tone: "warn" as const },
  { code: "A6", label: "Controles de personas (Anexo A)", tone: "ok" as const },
  { code: "A7", label: "Controles físicos (Anexo A)", tone: "warn" as const },
  { code: "A8", label: "Controles tecnológicos (Anexo A)", tone: "block" as const, critical: true },
  { code: "SOA", label: "Declaración de Aplicabilidad", tone: "warn" as const },
];

const workspaces: Workspace[] = [
  { id: "banco-andino", name: "Banco Andino", description: "SGSI · ronda 2", initials: "BA" },
  { id: "clinica-sur", name: "Clínica Sur", description: "SGSI · ronda 1", initials: "CS" },
];

const connectors: ConnectorEntry[] = [
  { id: "sp", name: "SharePoint /Compliance", kind: "SharePoint", state: "connected", lastSync: "hace 4 min", docCount: 148 },
  { id: "fs", name: "evidencias/", kind: "carpeta local", state: "syncing", lastSync: "ahora", docCount: 12 },
  { id: "s3", name: "backup-logs", kind: "S3", state: "error" },
];

const auditEvents: AuditEvent[] = [
  { id: "evt-1", actorKind: "agent", actor: "Evidence Collector Agent", action: "Ingirió 12 documentos nuevos desde SharePoint", resource: "SharePoint /Compliance · lote 2026-07-14", outcome: "info", timestamp: "2026-07-14 09:14:03 UTC", hash: "a3f9c1e2b7d4" },
  { id: "evt-2", actorKind: "human", actor: "Ana Beltrán", action: "Aprobó excepción de MFA para VPN de terceros", resource: "A8 · excepción EX-114", outcome: "ok", timestamp: "2026-07-14 09:16:41 UTC", hash: "f10e2a9c44b1" },
  { id: "evt-3", actorKind: "agent", actor: "Gap Detector Agent", action: "Marcó 46 controles del Anexo A sin evidencia", resource: "SoA · Declaración de Aplicabilidad", outcome: "warn", timestamp: "2026-07-14 08:52:10 UTC", hash: "7c2d8e91a05f" },
];

const interruptItems: InterruptQueueItem[] = [
  {
    id: "gate-1",
    action: "Aceptar excepción de MFA en VPN de terceros",
    agent: "GAP REMEDIATION AGENT",
    riskTone: "block",
    riskLabel: "Riesgo crítico",
    what: "Registrar excepción temporal al control A.8.5 mientras se implementa MFA.",
    why: "El proveedor no soporta MFA en su cliente VPN actual.",
    blastRadius: "1 proveedor · acceso VPN · sin acceso a producción",
    rollback: "Expira en 30 días; revocable de inmediato desde IAM.",
    requestedAt: "hace 3m",
    ageMinutes: 3,
    expiresIn: "12m",
  },
];

function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--faint)" }}>Veredicto de banda</p>
          <BandGauge value={3} max={6} label="Banda de readiness" hint="Banda 3 — Partial Readiness" />
        </div>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--faint)" }}>Declaración de Aplicabilidad</p>
          <p style={{ marginTop: "0.2rem", fontSize: "0.9rem", fontWeight: 600 }}>47 de 93 controles del Anexo A</p>
          <Progress value={(47 / 93) * 100} />
        </div>
      </div>
      <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
        <p style={{ marginBottom: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--faint)" }}>13 áreas del SGSI</p>
        <AgentStatusMatrix items={sgsiAreas} density="compact" />
      </div>
    </div>
  );
}

function Dataroom() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <Dropzone onFiles={(files) => console.log("evidencia subida", files)} label="Subir evidencia adicional" hint="PDF, XLSX, PNG" />
        </div>
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
          <ConnectorStatus connectors={connectors} />
        </div>
      </div>
      <AuditLogTable title="Registro de auditoría — Banco Andino ronda 2" events={auditEvents} />
    </div>
  );
}

function Cola() {
  const featured = interruptItems[0]!;
  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1.1fr 1fr" }}>
      <HumanInterruptQueue
        title="Cola de revisión humana — 2ª ronda"
        items={interruptItems}
        onApprove={(id) => console.log("approve", id)}
        onReject={(id) => console.log("reject", id)}
        onEscalate={(id) => console.log("escalate", id)}
      />
      <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
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
  );
}

function Corrida() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <TraceLog.Root>
        <TraceLog.Header title="Corrida en vivo — 2ª revisión" hint="run_iso-r2-0091" />
        <TraceLog.Body>
          <TraceLog.Row tone="ok" agent="EVIDENCE COLLECTOR" timestamp="14:02:11">
            148 documentos ingeridos desde SharePoint.
          </TraceLog.Row>
          <TraceLog.Row tone="warn" agent="GAP DETECTOR" step="paso 4">
            46 de 93 controles del Anexo A sin evidencia.
          </TraceLog.Row>
          <TraceLog.Row tone="block" agent="VALIDATE" step="error">
            A8: evidencia insuficiente — corrida bloqueada.
          </TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>
      <RunTimeline
        title="Run del assessment"
        hint="wf_iso-r2 · run 0091"
        nodes={[
          { id: "trigger", title: "Disparo del run", status: "success", owner: "n8n: Webhook", meta: "0.0s" },
          { id: "scope", title: "Cargar alcance SGSI", status: "success", owner: "SCOPE PARSER", meta: "0.4s" },
          { id: "evidence", title: "Recolectar evidencia", status: "running", owner: "EVIDENCE COLLECTOR", meta: "3.1s" },
          { id: "gap", title: "Detectar gaps Anexo A", status: "waiting", owner: "GAP DETECTOR", meta: "en cola" },
        ]}
      />
    </div>
  );
}

function Ciclo() {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: "open",
      title: "Abierto",
      tickets: [
        { id: "t1", title: "Implementar MFA + revisión de accesos", meta: "A8 · crítica", tone: "block" },
        { id: "t2", title: "Evaluación formal de proveedores", meta: "A5 · crítica", tone: "block" },
      ],
    },
    { id: "doing", title: "En remediación", tickets: [{ id: "t3", title: "Completar 46 controles del Anexo A", meta: "SOA · normal", tone: "warn" }] },
    { id: "done", title: "Re-evidenciado", tickets: [{ id: "t4", title: "backup-log-jul.pdf subido", meta: "SUPPORT ▲", tone: "ok" }] },
  ]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
        <DeltaList
          entries={[
            { label: "A8 (controles tecnológicos)", before: { label: "missing", tone: "block" }, after: { label: "missing", tone: "block" } },
            { label: "SUPPORT (cl. 7)", before: { label: "missing", tone: "block" }, after: { label: "partial", tone: "warn" }, improved: true },
          ]}
        />
      </div>
      <div style={{ border: "1px solid var(--border-default)", borderRadius: "0.5rem", background: "var(--surface-2)", padding: "1rem" }}>
        <KanbanBoard
          columns={columns}
          onMove={(id, to, i) =>
            setColumns((cols) => {
              let moved: KanbanColumn["tickets"][number] | undefined;
              const without = cols.map((c) => {
                const idx = c.tickets.findIndex((t) => t.id === id);
                if (idx < 0) return c;
                moved = c.tickets[idx];
                return { ...c, tickets: c.tickets.filter((t) => t.id !== id) };
              });
              if (!moved) return cols;
              return without.map((c) =>
                c.id === to ? { ...c, tickets: [...c.tickets.slice(0, i), moved!, ...c.tickets.slice(i)] } : c,
              );
            })
          }
        />
      </div>
    </div>
  );
}

export function Compliance() {
  const [view, setView] = useState<View>("dashboard");
  const [engagement, setEngagement] = useState("banco-andino");
  return (
    <AppShell
      sidebar={
        <AppSidebar header={<WorkspaceSwitcher workspaces={workspaces} activeId={engagement} onSelect={setEngagement} />}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                style={{
                  textAlign: "left",
                  borderRadius: "0.375rem",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.85rem",
                  border: view === v.id ? "1px solid var(--accent-border)" : "1px solid transparent",
                  background: view === v.id ? "var(--accent-surface)" : "transparent",
                  color: view === v.id ? "var(--accent)" : "var(--dim)",
                  cursor: "pointer",
                }}
              >
                {v.label}
              </button>
            ))}
          </nav>
        </AppSidebar>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
        <Stepper steps={isoSteps} />
        {view === "dashboard" && <Dashboard />}
        {view === "dataroom" && <Dataroom />}
        {view === "cola" && <Cola />}
        {view === "corrida" && <Corrida />}
        {view === "ciclo" && <Ciclo />}
      </div>
    </AppShell>
  );
}
