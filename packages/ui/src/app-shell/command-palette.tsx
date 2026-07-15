"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/**
 * CommandPalette — cierra el gap ❌ "CommandPalette: keyboard-first ops" del
 * área D del NORTH_STAR (principio #7: densidad + command palette; "ops vive
 * en tablas"). Construido sobre `cmdk` — la dependencia ya decidida en el
 * spec del ladder ("la misma que usa shadcn") — dentro del `Dialog` temado:
 * cmdk aporta el scoring difuso y la semántica combobox probada; el shell
 * aporta tokens, tipografía y el atajo global.
 *
 * API items-driven: el consumidor pasa comandos como datos (igual que la
 * navegación del sidebar), de modo que cada workspace/caso de uso registra
 * los suyos — "Go to Executions", "Approve pending", "Export evidence",
 * "New RFQ", "Recompute churn cohort", etc.
 */
export interface CommandPaletteItem {
  /** Id estable y único — es el `value` interno de cmdk. */
  id: string;
  /** Texto visible principal. */
  label: string;
  /** Términos extra para el matching (alias, siglas) que no se muestran. */
  keywords?: string[];
  /** Encabezado de grupo; ítems consecutivos con el mismo grupo se agrupan. */
  group?: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** Pista al final de la fila: atajo ("G E") o contexto ("Go to"). */
  hint?: string;
  disabled?: boolean;
  /** Se dispara al elegir (Enter o click); el palette se cierra después. */
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandPaletteItem[];
  /** Placeholder del input. Default: copy `appShell.commandPalette.placeholder`. */
  placeholder?: string;
  /** Mensaje sin resultados. Default: copy `appShell.commandPalette.empty`. */
  emptyLabel?: string;
  /** Título accesible del diálogo. Default: copy `appShell.commandPalette.title`. */
  title?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder,
  emptyLabel,
  title,
}: CommandPaletteProps) {
  const copy = useCopy();

  // Agrupar preservando el orden de primera aparición; los ítems sin grupo
  // van en un bloque inicial sin heading.
  const groups = React.useMemo(() => {
    const order: { name: string | undefined; items: CommandPaletteItem[] }[] = [];
    const byName = new Map<string | undefined, CommandPaletteItem[]>();
    for (const item of items) {
      let bucket = byName.get(item.group);
      if (!bucket) {
        bucket = [];
        byName.set(item.group, bucket);
        order.push({ name: item.group, items: bucket });
      }
      bucket.push(item);
    }
    return order;
  }, [items]);

  const select = (item: CommandPaletteItem) => {
    onOpenChange(false);
    item.onSelect();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{title ?? copy.appShell.commandPalette.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {placeholder ?? copy.appShell.commandPalette.placeholder}
        </DialogDescription>

        <Command label={title ?? copy.appShell.commandPalette.title}>
          <div className="flex items-center gap-2 border-b border-border-subtle px-4">
            <Search aria-hidden className="size-4 shrink-0 text-faint" />
            <Command.Input
              autoFocus
              placeholder={placeholder ?? copy.appShell.commandPalette.placeholder}
              className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-faint">
              {emptyLabel ?? copy.appShell.commandPalette.empty}
            </Command.Empty>

            {groups.map(({ name, items: groupItems }, gi) => {
              const rows = groupItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.id}
                    value={item.id}
                    keywords={[item.label, ...(item.group ? [item.group] : []), ...(item.keywords ?? [])]}
                    disabled={item.disabled}
                    onSelect={() => select(item)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-dim",
                      "data-[selected=true]:bg-accent-surface data-[selected=true]:text-ink",
                      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
                    )}
                  >
                    {Icon && <Icon aria-hidden className="size-4 shrink-0 text-faint" />}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.hint && (
                      <span className="shrink-0 text-xs text-faint tabular-nums">{item.hint}</span>
                    )}
                  </Command.Item>
                );
              });
              return name ? (
                <Command.Group
                  key={name}
                  heading={name}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-faint [&_[cmdk-group-heading]]:uppercase"
                >
                  {rows}
                </Command.Group>
              ) : (
                <React.Fragment key={`ungrouped-${gi}`}>{rows}</React.Fragment>
              );
            })}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Estado abierto/cerrado + atajo global ⌘K / Ctrl+K. Uso:
 * `const cmd = useCommandPalette()` →
 * `<TopbarSearchButton onClick={cmd.toggle} />` +
 * `<CommandPalette open={cmd.open} onOpenChange={cmd.setOpen} items={…} />`.
 */
export function useCommandPalette(): {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
} {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);
  return { open, setOpen, toggle };
}
