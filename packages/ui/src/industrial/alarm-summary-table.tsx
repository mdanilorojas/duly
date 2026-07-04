import * as React from "react";
import { Check, Clock } from "lucide-react";
import { DataTable, type ColumnDef } from "../data-table/data-table.js";
import { AlarmChip, type AlarmPriority, type AlarmState } from "./alarm-chip.js";

export interface AlarmRow {
  id: string;
  tag: string;
  description: string;
  priority: AlarmPriority;
  state: AlarmState;
  timestamp: string;
  area?: string;
}

const PRIORITY_RANK: Record<AlarmPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };

/**
 * Orden ISA-18.2: prioridad descendente y luego tiempo descendente (más reciente
 * primero) — el orden de triage durante un alarm flood. Pura y testeable.
 */
export function sortAlarms(alarms: AlarmRow[]): AlarmRow[] {
  return [...alarms].sort((a, b) => {
    const p = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    if (p !== 0) return p;
    return b.timestamp.localeCompare(a.timestamp);
  });
}

export interface AlarmSummaryTableProps extends Omit<React.ComponentProps<"div">, "children"> {
  alarms: AlarmRow[];
  caption?: string;
  onAck?: (id: string) => void;
  onShelve?: (id: string) => void;
}

/**
 * Lista de alarmas activas (área F, ISA-18.2) — la superficie de triage del
 * operador durante un flood, ordenada por prioridad y tiempo, con reconocer /
 * shelve por fila. Compuesta sobre `DataTable` (virtualiza en flood) y `AlarmChip`.
 */
export function AlarmSummaryTable({
  alarms,
  caption = "Alarmas activas",
  onAck,
  onShelve,
  className,
  ...props
}: AlarmSummaryTableProps) {
  const sorted = React.useMemo(() => sortAlarms(alarms), [alarms]);

  const columns = React.useMemo<ColumnDef<AlarmRow>[]>(
    () => [
      {
        accessorKey: "priority",
        header: "Prioridad",
        enableSorting: false,
        cell: ({ row }) => <AlarmChip priority={row.original.priority} state={row.original.state} />,
      },
      { accessorKey: "tag", header: "Tag" },
      { accessorKey: "description", header: "Descripción" },
      { accessorKey: "area", header: "Área", cell: ({ getValue }) => (getValue() as string) ?? "—" },
      { accessorKey: "timestamp", header: "Hora" },
      {
        id: "actions",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex gap-1">
              {onAck ? (
                <button
                  type="button"
                  onClick={() => onAck(a.id)}
                  aria-label={`Reconocer ${a.tag}`}
                  className="inline-flex size-6 items-center justify-center rounded border border-border-default text-dim outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Check className="size-3.5" aria-hidden />
                </button>
              ) : null}
              {onShelve ? (
                <button
                  type="button"
                  onClick={() => onShelve(a.id)}
                  aria-label={`Silenciar ${a.tag}`}
                  className="inline-flex size-6 items-center justify-center rounded border border-border-default text-dim outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Clock className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [onAck, onShelve],
  );

  return (
    <DataTable
      className={className}
      data={sorted}
      columns={columns}
      getRowId={(a) => a.id}
      caption={caption}
      density="compact"
      rowTone={(a) => (a.priority === "critical" ? "block" : a.priority === "high" ? "warn" : undefined)}
      {...props}
    />
  );
}
