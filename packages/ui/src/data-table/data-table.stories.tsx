import type { Meta, StoryObj } from "@storybook/react";
import { DataTable, type ColumnDef } from "./data-table.js";
import { NodeStatusBadge, type NodeStatus } from "../agentic/node-status-badge.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const meta: Meta<typeof DataTable> = {
  title: "DataTable/V001 Dense Virtualized",
  component: DataTable,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

interface Run {
  id: string;
  workflow: string;
  status: NodeStatus;
  trigger: string;
  durationMs: number;
  tone: Tone;
}

const STATUSES: NodeStatus[] = ["success", "running", "error", "waiting", "retrying", "skipped"];
const TONE_BY_STATUS: Record<NodeStatus, Tone> = {
  success: "ok",
  running: "info",
  error: "block",
  waiting: "review",
  retrying: "warn",
  skipped: "info",
};

// Data determinista (sin Math.random — reproducible en Storybook/CI).
function makeRuns(n: number): Run[] {
  return Array.from({ length: n }, (_, i) => {
    const status = STATUSES[i % STATUSES.length];
    return {
      id: `run_${(i + 1).toString().padStart(4, "0")}`,
      workflow: ["Invoice sync", "Lead enrich", "OT alarm route", "KYC check"][i % 4],
      status,
      trigger: ["webhook", "schedule", "manual"][i % 3],
      durationMs: 400 + ((i * 137) % 9000),
      tone: TONE_BY_STATUS[status],
    };
  });
}

const columns: ColumnDef<Run>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <NodeStatusBadge status={row.original.status} size="sm" />,
    enableSorting: false,
  },
  { accessorKey: "id", header: "Run" },
  { accessorKey: "workflow", header: "Workflow" },
  { accessorKey: "trigger", header: "Trigger" },
  {
    accessorKey: "durationMs",
    header: "Duration",
    cell: ({ getValue }) => `${(Number(getValue()) / 1000).toFixed(1)}s`,
  },
];

type S = StoryObj<typeof DataTable>;

export const Comfortable: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[820px]">
        <DataTable
          caption="Ejecuciones — densidad comfortable"
          data={makeRuns(12)}
          columns={columns}
          getRowId={(r) => r.id}
          rowTone={(r) => r.tone}
          onRowActivate={(r) => alert(`Abrir ${r.id}`)}
        />
      </div>
    </div>
  ),
};

export const Compact: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[820px]">
        <DataTable
          caption="Ejecuciones — densidad compact"
          data={makeRuns(20)}
          columns={columns}
          getRowId={(r) => r.id}
          density="compact"
          rowTone={(r) => r.tone}
        />
      </div>
    </div>
  ),
};

// 2000 filas — prueba de virtualización: el DOM solo monta el viewport + overscan.
export const Virtualized2000Rows: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[820px]">
        <DataTable
          caption="Ejecuciones — 2000 runs virtualizados"
          data={makeRuns(2000)}
          columns={columns}
          getRowId={(r) => r.id}
          density="compact"
          rowTone={(r) => r.tone}
          maxHeight={520}
        />
      </div>
    </div>
  ),
};

export const Empty: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[820px]">
        <DataTable
          caption="Ejecuciones — vacío"
          data={[]}
          columns={columns}
          emptyState="No hay ejecuciones en este rango."
        />
      </div>
    </div>
  ),
};
