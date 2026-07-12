import * as React from "react";
import { X, Bookmark } from "lucide-react";
import { cn } from "../lib/cn.js";
import { useCopy } from "../lib/copy/index.js";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import type { Table, SortingState, ColumnFiltersState } from "./data-table.js";
import type { Density } from "../trace-log/trace-log.variants.js";

export interface SavedView {
  id: string;
  name: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  density: Density;
}

/** Subconjunto de la Storage API — inyectable para test. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function loadViews(storage: StorageLike, key: string): SavedView[] {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}

const noopStorage: StorageLike = { getItem: () => null, setItem: () => {} };

interface UseSavedViewsOptions<T> {
  table: Table<T>;
  storageKey: string;
  density: Density;
  onApplyDensity?: (density: Density) => void;
  storage?: StorageLike;
}

/**
 * Vistas guardadas de una tabla — {sorting, columnFilters, density} nombradas y
 * persistidas. Feature de compliance del NORTH_STAR (principio #10, autoservicio
 * del auditor): "todas las acciones de IA de este usuario el mes pasado" se
 * guarda una vez y se reaplica. Persistencia inyectable (`storage`) para test.
 */
export function useSavedViews<T>({
  table,
  storageKey,
  density,
  onApplyDensity,
  storage,
}: UseSavedViewsOptions<T>) {
  const store =
    storage ?? (typeof localStorage !== "undefined" ? (localStorage as StorageLike) : noopStorage);
  const [views, setViews] = React.useState<SavedView[]>(() => loadViews(store, storageKey));
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const counter = React.useRef(0);

  const persist = React.useCallback(
    (next: SavedView[]) => {
      setViews(next);
      store.setItem(storageKey, JSON.stringify(next));
    },
    [store, storageKey],
  );

  const save = React.useCallback(
    (name: string): SavedView => {
      const state = table.getState();
      const view: SavedView = {
        id: `${storageKey}-${counter.current++}-${name}`,
        name,
        sorting: state.sorting,
        columnFilters: state.columnFilters,
        density,
      };
      persist([...views, view]);
      setActiveId(view.id);
      return view;
    },
    [table, storageKey, density, views, persist],
  );

  const apply = React.useCallback(
    (id: string) => {
      const view = views.find((v) => v.id === id);
      if (!view) return;
      table.setSorting(view.sorting);
      table.setColumnFilters(view.columnFilters);
      onApplyDensity?.(view.density);
      setActiveId(id);
    },
    [views, table, onApplyDensity],
  );

  const remove = React.useCallback(
    (id: string) => {
      persist(views.filter((v) => v.id !== id));
      setActiveId((cur) => (cur === id ? null : cur));
    },
    [views, persist],
  );

  return { views, activeId, save, apply, remove };
}

export interface SavedViewsProps<T> extends Omit<React.ComponentProps<"div">, "children"> {
  table: Table<T>;
  storageKey: string;
  density: Density;
  onApplyDensity?: (density: Density) => void;
  storage?: StorageLike;
}

/**
 * UI de chips para `useSavedViews` — guardar la vista actual y reaplicar vistas
 * guardadas. Reutiliza las primitivas `Input`/`Button` y el patrón de chips de
 * consulta guardada de `WhoDidWhatTimeline`.
 */
export function SavedViews<T>({
  table,
  storageKey,
  density,
  onApplyDensity,
  storage,
  className,
  ...props
}: SavedViewsProps<T>) {
  const t = useCopy();
  const { views, activeId, save, apply, remove } = useSavedViews({
    table,
    storageKey,
    density,
    onApplyDensity,
    storage,
  });
  const [name, setName] = React.useState("");

  function onSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    save(trimmed);
    setName("");
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      <div className="flex items-center gap-1.5">
        <Input
          aria-label={t.savedViews.nameLabel}
          placeholder={t.savedViews.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            }
          }}
          className="h-8 w-[150px] text-[12.5px]"
        />
        <Button type="button" size="sm" variant="outline" onClick={onSave} className="h-8">
          <Bookmark className="size-3.5" aria-hidden />
          {t.savedViews.save}
        </Button>
      </div>

      {views.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-1.5" aria-label={t.savedViews.savedViewsLabel}>
          {views.map((v) => {
            const isActive = v.id === activeId;
            return (
              <li key={v.id} className="inline-flex">
                <button
                  type="button"
                  onClick={() => apply(v.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-s-md border py-1 ps-2.5 pe-2 font-mono text-[11px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "border-accent-border bg-accent-surface text-accent"
                      : "border-border-subtle bg-surface-2 text-dim hover:text-ink",
                  )}
                >
                  {v.name}
                </button>
                <button
                  type="button"
                  onClick={() => remove(v.id)}
                  aria-label={t.savedViews.remove(v.name)}
                  className="inline-flex items-center rounded-e-md border border-s-0 border-border-subtle bg-surface-2 px-1.5 text-faint outline-none hover:text-block focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
