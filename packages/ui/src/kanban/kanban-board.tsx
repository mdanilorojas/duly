import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import type { Tone } from "../trace-log/trace-log.variants.js";

const TICKET_EDGE: Record<Tone, string> = {
  info: "border-s-info",
  ok: "border-s-ok",
  review: "border-s-review",
  warn: "border-s-warn",
  block: "border-s-block",
};

export interface KanbanTicket {
  id: string;
  title: string;
  /** Línea meta en mono, ej. "ACCESS-CONTROL · crítica". */
  meta?: string;
  tone?: Tone;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tickets: KanbanTicket[];
}

export interface KanbanBoardProps extends Omit<React.ComponentProps<"div">, "children" | "onDrop"> {
  columns: KanbanColumn[];
  /** Controlado: el consumidor aplica el movimiento y re-renderiza. Sin esto, read-only. */
  onMove?: (ticketId: string, toColumn: string, index: number) => void;
}

/**
 * Resuelve un drag-end de dnd-kit a un movimiento (toColumn, index).
 * `overId` puede ser una columna (drop al final) o un ticket (drop en su
 * posición). Pura y exportada para testear sin simular drags.
 */
export function resolveMove(
  activeId: string,
  overId: string | null,
  columns: KanbanColumn[],
): { toColumn: string; index: number } | null {
  if (overId == null || overId === activeId) return null;
  const col = columns.find((c) => c.id === overId);
  if (col) return { toColumn: col.id, index: col.tickets.length };
  for (const c of columns) {
    const i = c.tickets.findIndex((t) => t.id === overId);
    if (i >= 0) return { toColumn: c.id, index: i };
  }
  return null;
}

function TicketCard({ ticket, draggable }: { ticket: KanbanTicket; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    disabled: !draggable,
  });
  const body = (
    <>
      {ticket.meta ? (
        <span className="block font-mono text-[0.58rem] text-dim">{ticket.meta}</span>
      ) : null}
      <span className="text-[0.78rem] text-ink">{ticket.title}</span>
    </>
  );
  const cardClass = cn(
    "rounded border border-border-subtle bg-bg-elevated px-2.5 py-2 text-left",
    ticket.tone && cn("border-s-2", TICKET_EDGE[ticket.tone]),
    isDragging && "opacity-50",
  );
  if (!draggable) {
    return <li className={cardClass}>{body}</li>;
  }
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="list-none"
    >
      <button type="button" className={cn(cardClass, "block w-full")} {...attributes} {...listeners}>
        {body}
      </button>
    </li>
  );
}

function Column({ column, draggable }: { column: KanbanColumn; draggable: boolean }) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <div className="flex flex-col rounded-md border border-border-subtle bg-surface-sunken p-2">
      <h3 className="mb-2 font-mono text-[0.62rem] uppercase tracking-wider text-faint">
        {column.title}
      </h3>
      <SortableContext items={column.tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-10 flex-1 flex-col gap-1.5">
          {column.tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} draggable={draggable} />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}

/**
 * Tablero kanban controlado (columnas + tickets) — backlogs por estado:
 * remediación de brechas, pipeline de trabajo. Drag & drop con dnd-kit
 * (puntero + teclado, anuncios sr vía copy). El consumidor aplica el
 * movimiento en `onMove` y re-renderiza; sin `onMove` es read-only y no se
 * montan sensores.
 */
export function KanbanBoard({ columns, onMove, className, ...props }: KanbanBoardProps) {
  const copy = useCopy();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: string) => {
    const col = columns.find((c) => c.id === id);
    if (col) return col.title;
    for (const c of columns) {
      const t = c.tickets.find((x) => x.id === id);
      if (t) return t.title;
    }
    return id;
  };

  const grid = (
    <div
      role="group"
      aria-label={copy.kanban.board}
      className={cn("grid gap-2.5", className)}
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      {...props}
    >
      {columns.map((c) => (
        <Column key={c.id} column={c} draggable={onMove != null} />
      ))}
    </div>
  );

  if (!onMove) return grid;

  const handleDragEnd = (event: DragEndEvent) => {
    const move = resolveMove(String(event.active.id), event.over ? String(event.over.id) : null, columns);
    if (move) onMove(String(event.active.id), move.toColumn, move.index);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: { draggable: copy.kanban.instructions },
        announcements: {
          onDragStart: ({ active }) => copy.kanban.pickedUp(titleOf(String(active.id))),
          onDragOver: ({ active, over }) =>
            over ? copy.kanban.movedOver(titleOf(String(active.id)), titleOf(String(over.id))) : undefined,
          onDragEnd: ({ active, over }) =>
            over
              ? copy.kanban.dropped(titleOf(String(active.id)), titleOf(String(over.id)))
              : copy.kanban.canceled(titleOf(String(active.id))),
          onDragCancel: ({ active }) => copy.kanban.canceled(titleOf(String(active.id))),
        },
      }}
    >
      {grid}
    </DndContext>
  );
}
