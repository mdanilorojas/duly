import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppShell, AppSidebar, WorkspaceSwitcher, type Workspace } from "../../app-shell/index.js";
import { Stepper } from "../../components/ui/stepper.js";
import { Dropzone } from "../../components/ui/dropzone.js";
import { Progress } from "../../components/ui/progress.js";
import { BandGauge } from "../../compliance/band-gauge.js";
import { DeltaList } from "../../compliance/delta-list.js";
import { KanbanBoard, type KanbanColumn } from "../../kanban/index.js";
import { AgentStatusMatrix } from "../../agentic/agent-status-matrix.js";
import { ConnectorStatus, type ConnectorEntry } from "../../agentic/connector-status.js";
import { AuditLogTable, type AuditEvent } from "../../agentic/audit-log-table.js";
import { HumanInterruptQueue, type InterruptQueueItem } from "../../agentic/human-interrupt-queue.js";
import { ApprovalGateCard } from "../../agentic/approval-gate-card.js";
import { TraceLog } from "../../trace-log/trace-log.js";
import { RunTimeline } from "../../agentic/run-timeline.js";

const meta: Meta = {
  title: "Recipes/ISO Console/V001 Full Console",
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

// La consola ISO 27001 completa como composición Duly: la prueba integral
// de que el DS suple los wireframes v0 sin GAPs. Datos sintéticos.

const isoSteps = [
  { label: "Acumulación", state: "done" as const },
  { label: "Recopilación", state: "done" as const },
  { label: "Alcance", state: "done" as const },
  { label: "Inventario", state: "done" as const },
  { label: "1ª Revisión", state: "current" as const },
  { label: "Feedback", state: "pending" as const },
  { label: "Gate HITL", state: "pending" as const },
  { label: "Remediación", state: "pending" as const },
  { label: "2ª Revisión", state: "pending" as const },
];

type View = "dashboard" | "dataroom" | "cola" | "corrida" | "ciclo";
const VIEWS: { id: View; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "dataroom", label: "Data room" },
  { id: "cola", label: "Cola de revisión" },
  { id: "corrida", label: "Corrida en vivo" },
  { id: "ciclo", label: "Backlog / ciclo" },
];

// Taxonomía real del SGSI consumido por el producto: 8 cláusulas (4–10) +
// 5 dominios del Anexo A. Tone mapping 1:1 desde los 5 "kinds" reales del
// modelo de dominio: strong→ok, partial→warn, weak→info, missing→block,
// requires_human_judgment→review. A8 (controles tecnológicos) es el gap de
// mayor impacto — mismo rol narrativo que jugaba el placeholder ACCESS-CTRL.
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

// Workspaces del switcher — shape del interface `Workspace` de
// workspace-switcher.tsx (id/name/description?/initials?).
const workspaces: Workspace[] = [
  { id: "banco-andino", name: "Banco Andino", description: "SGSI · ronda 2", initials: "BA" },
  { id: "clinica-sur", name: "Clínica Sur", description: "SGSI · ronda 1", initials: "CS" },
  { id: "retail-mx", name: "Retail MX", description: "SGSI · recertificación", initials: "RM" },
];

// --- Data room: conectores lifted verbatim de connector-status.stories.tsx
// (IsoDataRoom ya está en escenario ISO 27001 — sin relabeling necesario). ---
const isoConnectors: ConnectorEntry[] = [
  { id: "sp", name: "SharePoint /Compliance", kind: "SharePoint", state: "connected", lastSync: "hace 4 min", docCount: 148 },
  { id: "fs", name: "evidencias/", kind: "carpeta local", state: "syncing", lastSync: "ahora", docCount: 12 },
  { id: "s3", name: "backup-logs", kind: "S3", state: "error", lastSync: "hace 2 h" },
  { id: "gd", name: "Drive legal", kind: "Google Drive", state: "paused", lastSync: "ayer", docCount: 31 },
];

// Filas lifted de audit-log-table.stories.tsx (COMPLIANCE_EVENTS) — mismo
// shape (AuditEvent), relabeled al engagement Banco Andino ronda 2.
const isoAuditEvents: AuditEvent[] = [
  {
    id: "evt-1",
    actorKind: "agent",
    actor: "Evidence Collector Agent",
    action: "Ingirió 12 documentos nuevos desde SharePoint",
    resource: "SharePoint /Compliance · lote 2026-07-14",
    outcome: "info",
    timestamp: "2026-07-14 09:14:03 UTC",
    hash: "a3f9c1e2b7d4",
  },
  {
    id: "evt-2",
    actorKind: "human",
    actor: "Ana Beltrán",
    action: "Aprobó excepción de MFA para VPN de terceros",
    resource: "A8 · excepción EX-114",
    outcome: "ok",
    timestamp: "2026-07-14 09:16:41 UTC",
    hash: "f10e2a9c44b1",
  },
  {
    id: "evt-3",
    actorKind: "agent",
    actor: "Gap Detector Agent",
    action: "Marcó 46 controles del Anexo A sin evidencia",
    resource: "SoA · Declaración de Aplicabilidad",
    outcome: "warn",
    timestamp: "2026-07-14 08:52:10 UTC",
    hash: "7c2d8e91a05f",
  },
  {
    id: "evt-4",
    actorKind: "human",
    actor: "Carlos Mendoza",
    action: "Escaló hallazgo de auditoría interna a dirección",
    resource: "cl. 9 · hallazgo H-07",
    outcome: "warn",
    timestamp: "2026-07-14 08:58:47 UTC",
    hash: "9b4f6d13e872",
  },
  {
    id: "evt-5",
    actorKind: "system",
    actor: "Retention Job",
    action: "Purgó evidencia fuera de la ventana de retención",
    resource: "evidencias/2025-Q1 · 812 archivos",
    outcome: "info",
    timestamp: "2026-07-14 03:00:00 UTC",
    hash: "0af38c7d1e29",
  },
];

// --- Cola de revisión: items lifted de human-interrupt-queue.stories.tsx
// (MIXED_QUEUE) — mismo shape (InterruptQueueItem), relabeled al escenario ISO. ---
const isoInterruptItems: InterruptQueueItem[] = [
  {
    id: "gate-1",
    action: "Aceptar excepción de MFA en VPN de terceros",
    agent: "GAP REMEDIATION AGENT",
    riskTone: "block",
    riskLabel: "Riesgo crítico",
    what: "Registrar una excepción temporal al control A.8.5 (autenticación segura) para el acceso VPN de un proveedor externo mientras se implementa MFA.",
    why: "El proveedor no soporta MFA en su cliente VPN actual; el gap fue detectado en el barrido de Anexo A de esta ronda.",
    blastRadius: "1 proveedor · acceso VPN a red corporativa · sin acceso a producción",
    rollback: "La excepción expira en 30 días; revocable de inmediato desde IAM.",
    requestedAt: "3m ago",
    ageMinutes: 3,
    expiresIn: "12m",
  },
  {
    id: "gate-2",
    action: "Cerrar hallazgo de auditoría interna sin evidencia adicional",
    agent: "INTERNAL AUDIT AGENT",
    riskTone: "warn",
    riskLabel: "Riesgo alto",
    what: "Marcar el hallazgo H-07 (respaldos sin prueba de restauración) como remediado con la evidencia ya adjunta.",
    why: "El plan de acción correctiva CORR-ACT-12 reporta prueba de restauración exitosa el 2026-07-10.",
    blastRadius: "1 hallazgo · dominio de respaldos · afecta el reporte de la 2ª revisión",
    rollback: "El hallazgo puede reabrirse manualmente si el auditor externo lo objeta.",
    requestedAt: "9m ago",
    ageMinutes: 9,
    expiresIn: "51m",
  },
  {
    id: "gate-3",
    action: "Marcar control A.8.24 (criptografía) como no aplicable",
    agent: "SOA AGENT",
    riskTone: "review",
    riskLabel: "Riesgo medio",
    what: "Actualizar la Declaración de Aplicabilidad para excluir A.8.24 con justificación de alcance.",
    why: "El servicio en cuestión no procesa ni almacena datos que requieran cifrado según el análisis de riesgo.",
    blastRadius: "1 control del Anexo A · SoA · sin impacto operativo",
    rollback: "Reversible editando la SoA antes de la 2ª revisión.",
    requestedAt: "22m ago",
    ageMinutes: 22,
    status: "approved",
    decidedBy: "ciso-banco-andino",
    decidedAt: "20m ago",
  },
];

function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-surface-2 p-4">
          <p className="font-mono text-[0.66rem] text-faint">Veredicto de banda</p>
          <BandGauge
            className="mt-3"
            value={3}
            max={6}
            label="Banda de readiness"
            hint="Banda 3 — Partial Readiness · strongFrac=0.46 · coverage=1.00"
          />
        </div>
        <div className="rounded-lg border border-border-default bg-surface-2 p-4">
          <p className="font-mono text-[0.66rem] text-faint">Declaración de Aplicabilidad</p>
          <p className="mt-1 text-sm font-semibold text-ink">47 de 93 controles del Anexo A</p>
          <Progress value={(47 / 93) * 100} className="mt-2" />
          <p className="mt-2 text-xs text-dim">soaComplete=false → tope banda 5</p>
        </div>
      </div>
      <div className="rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="mb-3 font-mono text-[0.66rem] text-faint">13 áreas del SGSI · color por veredicto</p>
        <AgentStatusMatrix items={sgsiAreas} density="compact" />
      </div>
    </div>
  );
}

function Dataroom() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-surface-2 p-4">
          <p className="mb-3 font-mono text-[0.66rem] text-faint">Carga manual de evidencia</p>
          <Dropzone
            onFiles={(files) => console.log("evidencia subida", files)}
            label="Subir evidencia adicional"
            hint="PDF, XLSX, PNG — se hashea y versiona automáticamente"
          />
        </div>
        <div className="rounded-lg border border-border-default bg-surface-2 p-4">
          <p className="mb-3 font-mono text-[0.66rem] text-faint">Fuentes de ingesta conectadas</p>
          <ConnectorStatus connectors={isoConnectors} />
        </div>
      </div>
      <AuditLogTable title="Registro de auditoría — Banco Andino ronda 2" events={isoAuditEvents} />
    </div>
  );
}

function Cola() {
  const featured = isoInterruptItems[0];
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <HumanInterruptQueue
        title="Cola de revisión humana — 2ª ronda"
        items={isoInterruptItems}
        onApprove={(id) => console.log("approve", id)}
        onReject={(id) => console.log("reject", id)}
        onEscalate={(id) => console.log("escalate", id)}
      />
      <div className="rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="mb-3 font-mono text-[0.66rem] text-faint">Detalle del gate más urgente</p>
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
          status={featured.status}
          decidedBy={featured.decidedBy}
          decidedAt={featured.decidedAt}
          reason={featured.reason}
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
    <div className="flex flex-col gap-4">
      <TraceLog.Root>
        <TraceLog.Header title="Corrida en vivo — 2ª revisión" hint="run_iso-r2-0091" />
        <TraceLog.Body>
          <TraceLog.Row tone="info" agent="SCOPE PARSER" step="paso 1">
            Carga alcance del SGSI desde <TraceLog.Code>scope.yaml</TraceLog.Code> — 13 áreas detectadas.
            <TraceLog.Detail>8 cláusulas + 5 dominios del Anexo A</TraceLog.Detail>
          </TraceLog.Row>
          <TraceLog.Row tone="ok" agent="EVIDENCE COLLECTOR" timestamp="14:02:11">
            148 documentos ingeridos desde SharePoint.
          </TraceLog.Row>
          <TraceLog.Row tone="review" agent="HUMAN" step="paso 3">
            Requiere confirmación: excepción de MFA pendiente.
          </TraceLog.Row>
          <TraceLog.Row tone="warn" agent="GAP DETECTOR" step="paso 4">
            46 de 93 controles del Anexo A sin evidencia.
          </TraceLog.Row>
          <TraceLog.Row tone="block" agent="VALIDATE" step="error">
            A8 (controles tecnológicos): evidencia insuficiente — corrida bloqueada.
          </TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>
      <RunTimeline
        title="Run del assessment"
        hint="wf_iso-r2 · run 0091 · iniciado hace 4m"
        nodes={[
          { id: "trigger", title: "Disparo del run", status: "success", owner: "n8n: Webhook", meta: "0.0s" },
          { id: "scope", title: "Cargar alcance SGSI", status: "success", owner: "SCOPE PARSER", meta: "0.4s" },
          { id: "evidence", title: "Recolectar evidencia", status: "running", owner: "EVIDENCE COLLECTOR", meta: "3.1s so far" },
          { id: "gap", title: "Detectar gaps Anexo A", status: "waiting", owner: "GAP DETECTOR", meta: "queued" },
          { id: "gate", title: "Gate HITL", status: "waiting", owner: "Approval gate", meta: "queued" },
        ]}
      />
    </div>
  );
}

function Ciclo() {
  const [columns, setColumns] = React.useState<KanbanColumn[]>([
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
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="mb-3 font-mono text-[0.66rem] text-faint">Qué cambió entre R1 → R2</p>
        <DeltaList
          entries={[
            { label: "A8 (controles tecnológicos)", before: { label: "missing", tone: "block" }, after: { label: "missing", tone: "block" } },
            { label: "SUPPORT (cl. 7)", before: { label: "missing", tone: "block" }, after: { label: "partial", tone: "warn" }, improved: true },
            { label: "A6 (controles de personas)", before: { label: "weak", tone: "warn" }, after: { label: "strong", tone: "ok" }, improved: true },
          ]}
        />
      </div>
      <div className="rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="mb-3 font-mono text-[0.66rem] text-faint">Backlog de remediación · brecha → acción → re-evidencia</p>
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

export const FullConsole: StoryObj = {
  render: function Render() {
    const [view, setView] = React.useState<View>("dashboard");
    const [engagement, setEngagement] = React.useState("banco-andino");
    return (
      <AppShell
        sidebar={
          <AppSidebar
            header={
              <WorkspaceSwitcher
                workspaces={workspaces}
                activeId={engagement}
                onSelect={setEngagement}
              />
            }
          >
            <nav className="flex flex-col gap-1">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={
                    view === v.id
                      ? "rounded-md border border-accent-border bg-accent-surface px-2.5 py-1.5 text-left text-sm text-accent"
                      : "rounded-md px-2.5 py-1.5 text-left text-sm text-dim hover:text-ink"
                  }
                >
                  {v.label}
                </button>
              ))}
            </nav>
          </AppSidebar>
        }
      >
        <div className="flex flex-col gap-4 p-4">
          <Stepper steps={isoSteps} />
          {view === "dashboard" ? <Dashboard /> : null}
          {view === "dataroom" ? <Dataroom /> : null}
          {view === "cola" ? <Cola /> : null}
          {view === "corrida" ? <Corrida /> : null}
          {view === "ciclo" ? <Ciclo /> : null}
        </div>
      </AppShell>
    );
  },
};
