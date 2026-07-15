import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AgentStatusMatrix } from "./agent-status-matrix.js";

const meta: Meta<typeof AgentStatusMatrix> = {
  title: "Agentic/Agent Status Matrix/V002 Compact Heatmap",
  component: AgentStatusMatrix,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof AgentStatusMatrix>;

// Las 13 áreas de un SGSI ISO 27001 coloreadas por veredicto de la corrida.
// strong→ok · partial→warn · missing→block · revisión humana→review.
const sgsiAreas = [
  { code: "SCOPE", label: "Alcance", tone: "ok" as const },
  { code: "POLICY-MS", label: "Política del SGSI", tone: "ok" as const },
  { code: "RISK", label: "Gestión de riesgos", tone: "warn" as const },
  { code: "SOA", label: "Declaración de aplicabilidad", tone: "warn" as const },
  { code: "OBJECTIVES", label: "Objetivos", tone: "ok" as const },
  { code: "INT-AUDIT", label: "Auditoría interna", tone: "ok" as const },
  { code: "MGMT-REVIEW", label: "Revisión por dirección", tone: "warn" as const },
  { code: "CORRECTIVE", label: "Acciones correctivas", tone: "review" as const },
  { code: "POLICY", label: "Políticas operativas", tone: "ok" as const },
  { code: "ACCESS-CTRL", label: "Control de acceso", tone: "block" as const, critical: true },
  { code: "BACKUP", label: "Respaldos", tone: "warn" as const },
  { code: "SUPPLIER", label: "Proveedores", tone: "block" as const },
  { code: "TRAINING", label: "Capacitación", tone: "ok" as const },
];

export const CompactSgsiHeatmap: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentStatusMatrix
        items={sgsiAreas}
        density="compact"
        onSelectItem={(item) => console.log("drill-down", item.code)}
      />
    </div>
  ),
};

export const DefaultDensityUnchanged: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <AgentStatusMatrix items={sgsiAreas.slice(0, 4)} />
    </div>
  ),
};
