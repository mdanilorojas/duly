import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { KanbanBoard, type KanbanColumn } from "./kanban-board.js";

const meta: Meta<typeof KanbanBoard> = {
  title: "Kanban/Kanban Board/V001 Remediation Backlog",
  component: KanbanBoard,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof KanbanBoard>;

// Backlog de remediación ISO 27001: brecha → acción → re-evidencia. Vivo,
// no un PDF muerto. El estado vive en el consumidor (componente controlado).
const initial: KanbanColumn[] = [
  {
    id: "open",
    title: "Abierto",
    tickets: [
      { id: "t1", title: "Implementar MFA + revisión de accesos", meta: "ACCESS-CONTROL · crítica", tone: "block" },
      { id: "t2", title: "Evaluación formal de proveedores", meta: "SUPPLIER · crítica", tone: "block" },
    ],
  },
  {
    id: "doing",
    title: "En remediación",
    tickets: [{ id: "t3", title: "Completar 46 controles del Anexo A · resp. CISO", meta: "SOA · normal", tone: "warn" }],
  },
  {
    id: "done",
    title: "Re-evidenciado",
    tickets: [{ id: "t4", title: "backup-log-jul.pdf subido · re-run pendiente", meta: "BACKUP ▲ partial", tone: "ok" }],
  },
];

function applyMove(cols: KanbanColumn[], ticketId: string, toColumn: string, index: number): KanbanColumn[] {
  let moved: (typeof cols)[number]["tickets"][number] | undefined;
  const without = cols.map((c) => {
    const i = c.tickets.findIndex((t) => t.id === ticketId);
    if (i < 0) return c;
    moved = c.tickets[i];
    return { ...c, tickets: c.tickets.filter((t) => t.id !== ticketId) };
  });
  if (!moved) return cols;
  return without.map((c) =>
    c.id === toColumn ? { ...c, tickets: [...c.tickets.slice(0, index), moved!, ...c.tickets.slice(index)] } : c,
  );
}

export const RemediationBacklog: S = {
  render: function Render() {
    const [columns, setColumns] = React.useState(initial);
    return (
      <div className="min-h-screen bg-bg-base p-12">
        <KanbanBoard
          columns={columns}
          onMove={(ticketId, toColumn, index) => setColumns((c) => applyMove(c, ticketId, toColumn, index))}
        />
      </div>
    );
  },
};

export const ReadOnly: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <KanbanBoard columns={initial} />
    </div>
  ),
};
