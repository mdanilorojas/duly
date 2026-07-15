import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type Table,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/cn.js";
import { useCopy } from "../lib/copy/index.js";
import { useDensity } from "../trace-log/trace-log.context.js";
import type { Tone, Density } from "../trace-log/trace-log.variants.js";
import { cellPad, ROW_HEIGHT, toneBorder } from "./data-table.variants.js";

// Re-export de la API headless de TanStack — los consumidores del DS arman
// columnas con estos, sin depender de un import externo distinto.
export { flexRender, createColumnHelper } from "@tanstack/react-table";
export type { Table, ColumnDef, SortingState, ColumnFiltersState } from "@tanstack/react-table";

// ponytail: no virtualizar tablas chicas — evita el overhead del virtualizador y
// mantiene los tests deterministas (jsdom no mide layout). Suben a virtual >50 filas.
const VIRTUAL_THRESHOLD = 50;

/**
 * Construye una instancia de tabla con estado de sorting + column filters, para
 * compartirla entre `<DataTable table={t}/>` y `<FilterBar table={t}/>` /
 * `<SavedViews table={t}/>`. Úsalo cuando necesites toolbar; para una tabla
 * simple basta con `<DataTable data columns/>` (crea la suya internamente).
 */
export function useDataTable<T>(options: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  getRowId?: (row: T, index: number) => string;
}): Table<T> {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  return useReactTable<T>({
    data: options.data,
    columns: options.columns,
    getRowId: options.getRowId,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
}

export interface DataTableProps<T> extends Omit<React.ComponentProps<"div">, "children"> {
  /** Filas. Ignorado si se pasa `table` ya construida. */
  data?: T[];
  /** Definición de columnas (TanStack). Ignorado si se pasa `table`. */
  columns?: ColumnDef<T, unknown>[];
  /** Instancia externa opcional — para compartir estado con `<FilterBar>`/`<SavedViews>`. */
  table?: Table<T>;
  /** Nombre accesible de la tabla (obligatorio). */
  caption: string;
  /** Default: densidad de sitio del `DensityContext` (la fija el `AppShell`). */
  density?: Density;
  getRowId?: (row: T, index: number) => string;
  /** Franja de tono por fila (ej. severidad). */
  rowTone?: (row: T) => Tone | undefined;
  /** Activación de fila (Enter/Space/click) — master-detail. */
  onRowActivate?: (row: T) => void;
  stickyHeader?: boolean;
  maxHeight?: number;
  emptyState?: React.ReactNode;
  /** Slot sobre la grid (ej. `<FilterBar>` + `<SavedViews>`). */
  toolbar?: React.ReactNode;
}

/**
 * Primitiva de tabla densa, virtualizada y accesible — item "DataTable denso"
 * del NORTH_STAR (área D, table stakes). Es la columna vertebral reutilizable:
 * toda tabla del DS (auditoría, ejecución, forecast, alarmas, registro de
 * agentes) se compone encima en vez de reimplementar virtualización/teclado.
 *
 * Reusa los row models headless de `@tanstack/react-table` (sorting/filtering)
 * y `@tanstack/react-virtual` (filas) — no reimplementa esa lógica. Patrón de
 * accesibilidad: `role="grid"` con `aria-activedescendant` (roving sin foco por
 * fila, compatible con virtualización), `aria-rowcount` sobre el total real
 * (no el subconjunto montado), y navegación por teclado (↑/↓/Home/End/Enter).
 */
export function DataTable<T>({
  data,
  columns,
  table: externalTable,
  caption,
  density: densityProp,
  getRowId,
  rowTone,
  onRowActivate,
  stickyHeader = true,
  maxHeight = 480,
  emptyState,
  toolbar,
  className,
  ...props
}: DataTableProps<T>) {
  const t = useCopy();
  // Densidad a nivel de sitio (NORTH_STAR área D): sin prop explícita, la
  // tabla hereda la densidad del shell vía DensityContext (default
  // "comfortable" sin provider — comportamiento previo intacto).
  const siteDensity = useDensity();
  const density = densityProp ?? siteDensity;
  const internalTable = useReactTable<T>({
    data: data ?? [],
    columns: columns ?? [],
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const table = externalTable ?? internalTable;

  const rows = table.getRowModel().rows;
  const colCount = table.getVisibleLeafColumns().length;
  const gridTemplateColumns = `repeat(${colCount}, minmax(0, 1fr))`;
  const virtualize = rows.length > VIRTUAL_THRESHOLD;

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT[density],
    overscan: 8,
  });

  const [activeIndex, setActiveIndex] = React.useState(-1);
  const reactId = React.useId();
  const gridId = `dt-${reactId}`;
  const activeDescendant = activeIndex >= 0 ? `${gridId}-row-${activeIndex}` : undefined;

  // rowVirtualizer es estable entre renders; solo re-scroll al cambiar la fila activa.
  React.useEffect(() => {
    if (virtualize && activeIndex >= 0) rowVirtualizer.scrollToIndex(activeIndex);
  }, [activeIndex, virtualize, rowVirtualizer]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (rows.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(rows.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i < 0 ? 0 : Math.max(0, i - 1)));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(rows.length - 1);
        break;
      case "Enter":
      case " ":
        if (activeIndex >= 0) {
          e.preventDefault();
          onRowActivate?.(rows[activeIndex].original);
        }
        break;
    }
  }

  function renderRow(index: number, style?: React.CSSProperties) {
    const row = rows[index];
    const tone = rowTone?.(row.original);
    const isActive = activeIndex === index;
    return (
      <div
        key={row.id}
        id={`${gridId}-row-${index}`}
        role="row"
        aria-rowindex={index + 2}
        aria-selected={isActive || undefined}
        onClick={() => {
          setActiveIndex(index);
          onRowActivate?.(row.original);
        }}
        className={cn(
          "grid items-center border-b border-s-2 border-b-border-subtle",
          tone ? toneBorder[tone] : "border-s-transparent",
          onRowActivate && "cursor-pointer",
          isActive ? "bg-surface-3/60" : "hover:bg-surface-3/30",
        )}
        style={{ gridTemplateColumns, ...style }}
      >
        {row.getVisibleCells().map((cell) => (
          <div
            key={cell.id}
            role="gridcell"
            className={cn(cellPad({ density }), "min-w-0 truncate text-[12.5px] text-ink")}
          >
            {cell.column.columnDef.cell
              ? flexRender(cell.column.columnDef.cell, cell.getContext())
              : String(cell.getValue() ?? "")}
          </div>
        ))}
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      {toolbar ? (
        <div className="border-b border-border-subtle bg-surface-header px-3 py-2">{toolbar}</div>
      ) : null}

      <div
        role="grid"
        aria-label={caption}
        aria-rowcount={rows.length + 1}
        aria-activedescendant={activeDescendant}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {/* Header */}
        <div
          role="row"
          aria-rowindex={1}
          className={cn(
            "grid border-b border-border-subtle bg-surface-header",
            stickyHeader && "sticky top-0 z-10",
          )}
          style={{ gridTemplateColumns }}
        >
          {table.getHeaderGroups()[0]?.headers.map((header) => {
            const sortDir = header.column.getIsSorted();
            const canSort = header.column.getCanSort();
            const SortIcon =
              sortDir === "asc" ? ChevronUp : sortDir === "desc" ? ChevronDown : ChevronsUpDown;
            const content = header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext());
            return (
              <div
                key={header.id}
                role="columnheader"
                aria-sort={sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none"}
                className={cn(
                  cellPad({ density }),
                  "flex items-center font-mono text-[10px] font-bold uppercase tracking-wide text-dim",
                )}
              >
                {canSort && !header.isPlaceholder ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="inline-flex min-h-6 items-center gap-1 rounded outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {content}
                    <SortIcon className="size-3 opacity-60" aria-hidden />
                  </button>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div
          ref={scrollRef}
          className="overflow-y-auto overflow-x-hidden"
          style={{ maxHeight }}
        >
          {rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-dim">
              {emptyState ?? t.dataTable.empty}
            </div>
          ) : virtualize ? (
            <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative", width: "100%" }}>
              {virtualItems.map((vi) =>
                renderRow(vi.index, {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: vi.size,
                  transform: `translateY(${vi.start}px)`,
                }),
              )}
            </div>
          ) : (
            rows.map((_, index) => renderRow(index))
          )}
        </div>
      </div>
    </div>
  );
}
