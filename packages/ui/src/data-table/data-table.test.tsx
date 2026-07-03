import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { ColumnDef } from "./data-table.js";
import { DataTable } from "./data-table.js";

interface Row {
  id: string;
  name: string;
  score: number;
}

const data: Row[] = [
  { id: "1", name: "Alpha", score: 10 },
  { id: "2", name: "Bravo", score: 20 },
  { id: "3", name: "Charlie", score: 30 },
  { id: "4", name: "Delta", score: 40 },
  { id: "5", name: "Echo", score: 50 },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "score", header: "Score" },
];

describe("DataTable", () => {
  it("renderiza grid semántico con headers y celdas", () => {
    render(<DataTable caption="Test table" data={data} columns={columns} getRowId={(r) => r.id} />);
    expect(screen.getByRole("grid")).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Score/ })).toBeDefined();
    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("Echo")).toBeDefined();
  });

  it("aria-rowcount cuenta todas las filas + header (independiente de virtualización)", () => {
    render(<DataTable caption="t" data={data} columns={columns} getRowId={(r) => r.id} />);
    // 5 datos + 1 header = 6
    expect(screen.getByRole("grid").getAttribute("aria-rowcount")).toBe("6");
  });

  it("teclado: ArrowDown mueve la fila activa (aria-activedescendant) y Enter la activa", async () => {
    const onRowActivate = vi.fn();
    render(
      <DataTable
        caption="t"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        onRowActivate={onRowActivate}
      />,
    );
    const grid = screen.getByRole("grid");
    grid.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(grid.getAttribute("aria-activedescendant")).toMatch(/row-0$/);
    await userEvent.keyboard("{ArrowDown}");
    expect(grid.getAttribute("aria-activedescendant")).toMatch(/row-1$/);
    await userEvent.keyboard("{Enter}");
    expect(onRowActivate).toHaveBeenCalledWith(data[1]);
  });

  it("density=compact reduce el padding de celda", () => {
    const { container } = render(
      <DataTable caption="t" data={data} columns={columns} getRowId={(r) => r.id} density="compact" />,
    );
    const cell = container.querySelector('[role="gridcell"]');
    expect(cell?.className).toContain("py-1.5");
  });

  it("density=comfortable (default) usa padding cómodo", () => {
    const { container } = render(
      <DataTable caption="t" data={data} columns={columns} getRowId={(r) => r.id} />,
    );
    const cell = container.querySelector('[role="gridcell"]');
    expect(cell?.className).toContain("py-2.5");
  });

  it("data vacía muestra el empty state", () => {
    render(<DataTable caption="t" data={[]} columns={columns} emptyState="Sin registros" />);
    expect(screen.getByText("Sin registros")).toBeDefined();
    // no debe renderizar filas de datos
    expect(screen.queryAllByRole("gridcell").length).toBe(0);
  });

  it("rowTone pinta la franja de tono en la fila", () => {
    const { container } = render(
      <DataTable
        caption="t"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        rowTone={(r) => (r.id === "1" ? "block" : undefined)}
      />,
    );
    const firstRow = container.querySelector('[id$="row-0"]');
    expect(firstRow?.className).toContain("border-block");
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(
      <DataTable caption="Tabla accesible" data={data} columns={columns} getRowId={(r) => r.id} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
