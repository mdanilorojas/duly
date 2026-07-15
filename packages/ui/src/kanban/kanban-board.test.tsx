import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { KanbanBoard, resolveMove, type KanbanColumn } from "./kanban-board.js";

const columns: KanbanColumn[] = [
  {
    id: "open",
    title: "Abierto",
    tickets: [
      { id: "t1", title: "Implementar MFA", meta: "ACCESS-CONTROL · crítica", tone: "block" },
      { id: "t2", title: "Evaluar proveedores", meta: "SUPPLIER · crítica", tone: "block" },
    ],
  },
  { id: "doing", title: "En remediación", tickets: [{ id: "t3", title: "Completar SoA", tone: "warn" }] },
  { id: "done", title: "Re-evidenciado", tickets: [] },
];

describe("resolveMove", () => {
  it("drop sobre una columna → al final de esa columna", () => {
    expect(resolveMove("t1", "doing", columns)).toEqual({ toColumn: "doing", index: 1 });
  });

  it("drop sobre otro ticket → columna e índice de ese ticket", () => {
    expect(resolveMove("t1", "t3", columns)).toEqual({ toColumn: "doing", index: 0 });
  });

  it("drop sobre sí mismo o sobre nada → null", () => {
    expect(resolveMove("t1", "t1", columns)).toBeNull();
    expect(resolveMove("t1", null, columns)).toBeNull();
  });

  it("overId desconocido → null", () => {
    expect(resolveMove("t1", "ghost", columns)).toBeNull();
  });
});

describe("KanbanBoard", () => {
  it("renderiza columnas con título y tickets", () => {
    render(<KanbanBoard columns={columns} />);
    expect(screen.getByText("Abierto")).toBeDefined();
    expect(screen.getByText("Implementar MFA")).toBeDefined();
    expect(screen.getByText("ACCESS-CONTROL · crítica")).toBeDefined();
  });

  it("read-only (sin onMove): tickets no son botones arrastrables", () => {
    render(<KanbanBoard columns={columns} />);
    expect(screen.queryByRole("button", { name: /Implementar MFA/ })).toBeNull();
  });

  it("con onMove los tickets son focusables (drag por teclado disponible)", () => {
    render(<KanbanBoard columns={columns} onMove={() => {}} />);
    expect(screen.getByRole("button", { name: /Implementar MFA/ })).toBeDefined();
  });

  it("axe limpio", async () => {
    const { container } = render(<KanbanBoard columns={columns} onMove={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
