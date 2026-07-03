import { describe, it, expect, vi } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useDataTable, type ColumnDef } from "./data-table.js";
import { useSavedViews, SavedViews, type StorageLike } from "./saved-views.js";

interface Row {
  id: string;
  name: string;
}
const data: Row[] = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Bravo" },
];
const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];

function makeStorage(): StorageLike {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
}

describe("useSavedViews", () => {
  it("save captura el estado actual y persiste en storage", () => {
    const storage = makeStorage();
    const { result } = renderHook(() => {
      const table = useDataTable({ data, columns, getRowId: (r) => r.id });
      return useSavedViews({ table, storageKey: "k", density: "comfortable", storage });
    });
    expect(result.current.views.length).toBe(0);
    act(() => {
      result.current.save("Mi vista");
    });
    expect(result.current.views.length).toBe(1);
    expect(result.current.views[0].name).toBe("Mi vista");
    // persistido
    expect(JSON.parse(storage.getItem("k")!)).toHaveLength(1);
  });

  it("carga vistas persistidas de un montaje anterior (mismo storage)", () => {
    const storage = makeStorage();
    storage.setItem(
      "k",
      JSON.stringify([{ id: "v1", name: "Guardada", sorting: [], columnFilters: [], density: "compact" }]),
    );
    const { result } = renderHook(() => {
      const table = useDataTable({ data, columns, getRowId: (r) => r.id });
      return useSavedViews({ table, storageKey: "k", density: "comfortable", storage });
    });
    expect(result.current.views.map((v) => v.name)).toEqual(["Guardada"]);
  });

  it("apply restaura density vía callback; remove elimina y persiste", () => {
    const storage = makeStorage();
    const onApplyDensity = vi.fn();
    const { result } = renderHook(() => {
      const table = useDataTable({ data, columns, getRowId: (r) => r.id });
      return useSavedViews({ table, storageKey: "k", density: "compact", onApplyDensity, storage });
    });
    let id = "";
    act(() => {
      id = result.current.save("V1").id;
    });
    act(() => {
      result.current.apply(id);
    });
    expect(onApplyDensity).toHaveBeenCalledWith("compact");
    act(() => {
      result.current.remove(id);
    });
    expect(result.current.views.length).toBe(0);
    expect(JSON.parse(storage.getItem("k")!)).toHaveLength(0);
  });
});

describe("SavedViews component", () => {
  function Comp({ storage }: { storage: StorageLike }) {
    const table = useDataTable({ data, columns, getRowId: (r) => r.id });
    return <SavedViews table={table} storageKey="k" density="comfortable" storage={storage} />;
  }

  it("guardar crea un chip con el nombre dado", async () => {
    render(<Comp storage={makeStorage()} />);
    await userEvent.type(screen.getByLabelText(/nombre de la vista/i), "Ventas Q3");
    await userEvent.click(screen.getByRole("button", { name: /guardar vista/i }));
    // nombre exacto (string, no regex) para no chocar con "Eliminar vista Ventas Q3"
    expect(screen.getByRole("button", { name: "Ventas Q3" })).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<Comp storage={makeStorage()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
