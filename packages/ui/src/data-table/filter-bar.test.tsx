import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useDataTable, type ColumnDef } from "./data-table.js";
import { FilterBar } from "./filter-bar.js";

interface Row {
  id: string;
  name: string;
  group: string;
}
const data: Row[] = [
  { id: "1", name: "Alpha", group: "A" },
  { id: "2", name: "Bravo", group: "B" },
  { id: "3", name: "Charlie", group: "A" },
];
const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "group", header: "Group" },
];

function Harness() {
  const table = useDataTable({ data, columns, getRowId: (r) => r.id });
  return (
    <div>
      <FilterBar
        table={table}
        fields={[
          { columnId: "name", kind: "text", label: "Name" },
          { columnId: "group", kind: "select", label: "Group", options: [
            { value: "A", label: "Group A" },
            { value: "B", label: "Group B" },
          ] },
        ]}
      />
      <output data-testid="count">{table.getFilteredRowModel().rows.length}</output>
    </div>
  );
}

describe("FilterBar", () => {
  it("filtro de texto reduce las filas visibles", async () => {
    render(<Harness />);
    expect(screen.getByTestId("count").textContent).toBe("3");
    await userEvent.type(screen.getByLabelText("Name"), "alp");
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("filtro select filtra por valor de columna", async () => {
    render(<Harness />);
    await userEvent.selectOptions(screen.getByLabelText("Group"), "A");
    // group A = Alpha + Charlie
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("limpiar el texto restaura las filas", async () => {
    render(<Harness />);
    const input = screen.getByLabelText("Name");
    await userEvent.type(input, "bravo");
    expect(screen.getByTestId("count").textContent).toBe("1");
    await userEvent.clear(input);
    expect(screen.getByTestId("count").textContent).toBe("3");
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<Harness />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
