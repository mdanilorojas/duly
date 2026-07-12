import type { Meta, StoryObj } from "@storybook/react";
import { SubworkflowChip, type SubworkflowRef } from "./subworkflow-chip.js";

const meta: Meta<typeof SubworkflowChip> = {
  title: "Agentic/Subworkflow Chip/V001 Child Execution Reference",
  component: SubworkflowChip,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof SubworkflowChip>;

// Software/tech: n8n's "Execute Workflow" node called a shared subworkflow —
// the chip's caret expands a summary inline before deciding whether to
// actually navigate away from the parent run.
const cleared: SubworkflowRef = {
  executionId: "exec_9931aa",
  workflowName: "Vendor Compliance Check",
  status: "success",
  summary: "3 nodes · 1.1s",
};

export const Success: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-sm">
        <SubworkflowChip subworkflow={cleared} onOpen={() => alert(`Deep-link → ${cleared.executionId}`)} />
      </div>
    </div>
  ),
};

// Petróleo/energía: subworkflow hijo todavía corriendo — el anillo de
// NodeStatusBadge hereda la gramática de 6 estados de área A sin reinventar
// una segunda paleta de estado para "referencia a otra ejecución".
const running: SubworkflowRef = {
  executionId: "exec_60a1f2",
  workflowName: "Wellhead Pressure Escalation",
  status: "running",
  summary: "2 of 4 nodes complete",
};

export const Running: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-sm">
        <SubworkflowChip subworkflow={running} />
      </div>
    </div>
  ),
};

// Servicios financieros: la ejecución hija falló — el chip por sí solo no
// reemplaza el marcador "Failed here" de RunInspector, solo señala dónde ir
// a verlo con detalle.
const failed: SubworkflowRef = {
  executionId: "exec_20f9c1",
  workflowName: "AML Sanctions Screening",
  status: "error",
  summary: "Failed at node 2 of 3 — screening API timeout",
};

export const Failed: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-sm">
        <SubworkflowChip subworkflow={failed} />
      </div>
    </div>
  ),
};

export const NoSummary: S = {
  name: "Without expandable summary",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-sm">
        <SubworkflowChip subworkflow={{ ...cleared, summary: undefined }} />
      </div>
    </div>
  ),
};

// Cómo se ve dentro de una fila de nodo real de RunInspector — el caso de
// uso principal, no un componente flotante suelto.
export const InlineOnNodeRow: S = {
  name: "Inline on a node row",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-lg rounded-xl border border-border-subtle bg-surface-2 p-4">
        <div className="font-mono text-[13px] font-medium text-ink">
          Execute Workflow: Vendor compliance check
        </div>
        <div className="mt-1 font-mono text-[10px] text-dim">n8n-nodes-base.executeWorkflow</div>
        <div className="mt-2">
          <SubworkflowChip subworkflow={cleared} />
        </div>
      </div>
      <p className="mx-auto mt-3 max-w-lg font-mono text-[11px] leading-relaxed text-faint">
        Ver la demo integrada completa en{" "}
        <code className="text-dim">Agentic/Execution History/V001 n8n-style Runs</code> — el nodo
        "n4b" de <code className="text-dim">exec_8f21a0</code> navega a esta ejecución hija con un
        click.
      </p>
    </div>
  ),
};
