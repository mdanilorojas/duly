import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/cn.js";
import { useCopy } from "../lib/copy/index.js";
import { Input } from "@/components/ui/input.js";
import type { Table } from "./data-table.js";

export interface FilterField {
  /** Id de la columna de TanStack sobre la que filtra. */
  columnId: string;
  kind: "text" | "select";
  label: string;
  placeholder?: string;
  /** Opciones para `kind="select"`. */
  options?: { value: string; label: string }[];
}

export interface FilterBarProps<T> extends Omit<React.ComponentProps<"div">, "children"> {
  /** Instancia compartida (ver `useDataTable`). */
  table: Table<T>;
  fields: FilterField[];
}

/**
 * Barra de filtros tipada sobre el estado de columnas de `@tanstack/react-table`
 * — no reimplementa el filtrado, solo lee/escribe `column.getFilterValue()`.
 * `text` reutiliza la primitiva `Input`; `select` usa un `<select>` nativo
 * (accesible y liviano) estilado con tokens — ponytail: no montar el Select de
 * Radix (portal) para un dropdown de filtro. Pensada para el slot `toolbar` del
 * `DataTable`. Es el FilterBar del NORTH_STAR (área D, "DataTable denso").
 */
export function FilterBar<T>({ table, fields, className, ...props }: FilterBarProps<T>) {
  const t = useCopy();
  return (
    <div role="search" className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      {fields.map((f) => {
        const col = table.getColumn(f.columnId);
        if (!col) return null;
        const value = (col.getFilterValue() as string | undefined) ?? "";

        if (f.kind === "select") {
          return (
            <select
              key={f.columnId}
              aria-label={f.label}
              value={value}
              onChange={(e) => col.setFilterValue(e.target.value || undefined)}
              className={cn(
                "h-8 rounded-md border border-border-default bg-surface-sunken px-2 text-[12.5px] text-ink outline-none",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring",
              )}
            >
              <option value="">{f.placeholder ?? t.filterBar.allOption}</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        }

        return (
          <div key={f.columnId} className="relative">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-faint"
              aria-hidden
            />
            <Input
              type="search"
              aria-label={f.label}
              placeholder={f.placeholder ?? t.filterBar.searchPlaceholder(f.label)}
              value={value}
              onChange={(e) => col.setFilterValue(e.target.value || undefined)}
              className="h-8 w-auto max-w-[200px] pl-7 text-[12.5px]"
            />
          </div>
        );
      })}
    </div>
  );
}
