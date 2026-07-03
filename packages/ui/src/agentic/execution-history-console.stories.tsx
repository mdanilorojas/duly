import type { Meta, StoryObj } from "@storybook/react";
import {
  ExecutionHistoryConsole,
  DEFAULT_EXECUTIONS,
  DEFAULT_EXECUTION_NODES,
} from "./execution-history-console.js";
import { ExecutionHistoryTable } from "./execution-history-table.js";
import { RunInspector } from "./run-inspector.js";

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
        <ExecutionHistoryConsole />
        <p className="max-w-[760px] font-mono text-[11px] leading-relaxed text-faint">
          Click "Inspect" en cualquier fila para reemplazar el contenido de `RunInspector` a la
          derecha. n8n no ofrece white-label completo ni en su plan OEM (n8n.io/oem/, confirmado
          2026-07-02) — esta consola es una reconstrucción propia de la vista de ejecuciones, no un
          iframe de marca ajena. El nodo `exec_a10f55` (Contract Redline Review) abre con el marcador
          "Failed here" ya expandido por defecto.
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
        <ExecutionHistoryConsole title="Contract Ops — Executions" initialSelectedId="exec_a10f55" />
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
