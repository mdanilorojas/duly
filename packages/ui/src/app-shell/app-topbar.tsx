"use client";

import * as React from "react";
import { ChevronRight, Menu, Rows2, Rows4, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useOptionalAppShell } from "./app-shell.js";

/**
 * Barra superior del `AppShell`: hamburger (mobile) + breadcrumbs + slot
 * central + acciones. Las acciones típicas de una consola enterprise vienen
 * incluidas como piezas: `TopbarSearchButton` (abre el command palette),
 * `TopbarIconButton` (campana con contador — wirea tu `HumanInterruptQueue`
 * en un Sheet), `DensityToggle` (principio #7: comfortable/compact a nivel
 * de sitio) y `EnvironmentBadge` (en qué entorno estás actuando).
 */
export interface AppTopbarProps extends React.ComponentProps<"header"> {
  /** Migas de navegación; la última se marca `aria-current="page"`. */
  breadcrumbs?: BreadcrumbItem[];
  /** Slot de acciones al final (search, campana, density, user menu…). */
  actions?: React.ReactNode;
}

export function AppTopbar({ breadcrumbs, actions, className, children, ...props }: AppTopbarProps) {
  const copy = useCopy();
  const shell = useOptionalAppShell();

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className={cn(
          "flex h-14 shrink-0 items-center gap-3 border-b border-border-subtle bg-bg-elevated px-4",
          className,
        )}
        {...props}
      >
        {shell && (
          <button
            type="button"
            aria-label={copy.appShell.openNavigation}
            onClick={() => shell.setMobileNavOpen(true)}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-dim outline-none hover:bg-surface-2 hover:text-ink focus-visible:ring-[3px] focus-visible:ring-ring lg:hidden"
          >
            <Menu aria-hidden className="size-4" />
          </button>
        )}

        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>

        {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
      </header>
    </TooltipProvider>
  );
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  const copy = useCopy();
  return (
    <nav aria-label={copy.appShell.breadcrumbs} className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            // En <sm solo cabe (y solo importa) la miga actual: las anteriores
            // se ocultan en vez de aplastarse a "A…" ilegible.
            <li
              key={`${item.label}-${i}`}
              className={cn("flex min-w-0 items-center gap-1.5", !last && "max-sm:hidden")}
            >
              {i > 0 && (
                <ChevronRight aria-hidden className="size-3.5 shrink-0 text-faint-deco max-sm:hidden rtl:rotate-180" />
              )}
              {last ? (
                <span aria-current="page" className="truncate font-medium text-ink">
                  {item.label}
                </span>
              ) : item.href ? (
                <a href={item.href} onClick={item.onClick} className="truncate text-dim hover:text-ink">
                  {item.label}
                </a>
              ) : (
                <button type="button" onClick={item.onClick} className="truncate text-dim hover:text-ink">
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface TopbarSearchButtonProps extends Omit<React.ComponentProps<"button">, "children"> {
  /** Pista de atajo mostrada como `<kbd>`. Default "⌘K". */
  shortcutHint?: string;
  /** Texto del botón. Default: copy `appShell.search`. */
  label?: string;
}

/**
 * Botón con aspecto de input que abre el `CommandPalette` — el punto de
 * entrada visible del "keyboard-first ops" para quien no conoce el atajo.
 * En <sm colapsa a icon-button (el input falso aplastado era ilegible);
 * el nombre accesible se mantiene vía aria-label.
 */
export function TopbarSearchButton({
  shortcutHint = "⌘K",
  label,
  className,
  ...props
}: TopbarSearchButtonProps) {
  const copy = useCopy();
  const text = label ?? copy.appShell.search;
  return (
    <button
      type="button"
      aria-label={text}
      className={cn(
        "flex h-8 items-center rounded-md border border-border-subtle text-sm text-faint outline-none hover:border-border-default hover:text-dim focus-visible:ring-[3px] focus-visible:ring-ring",
        "max-sm:w-8 max-sm:shrink-0 max-sm:justify-center",
        "sm:w-full sm:max-w-64 sm:gap-2 sm:bg-surface-2 sm:px-2.5",
        className,
      )}
      {...props}
    >
      <Search aria-hidden className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-start max-sm:hidden">{text}</span>
      <kbd
        aria-hidden
        className="shrink-0 rounded border border-border-subtle bg-bg-base px-1 py-0.5 font-sans text-[10px] leading-none text-faint max-sm:hidden"
      >
        {shortcutHint}
      </kbd>
    </button>
  );
}

export interface TopbarIconButtonProps extends Omit<React.ComponentProps<"button">, "children"> {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** Nombre accesible; con `count` se anuncia "label (count)". */
  label: string;
  /** Contador pendiente (campana de interrupts, alertas). Cap visual en 99+. */
  count?: number;
}

export function TopbarIconButton({ icon: Icon, label, count, className, ...props }: TopbarIconButtonProps) {
  const copy = useCopy();
  const accessibleLabel = count != null && count > 0 ? copy.appShell.withCount(label, count) : label;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={accessibleLabel}
          className={cn(
            "relative flex size-8 shrink-0 items-center justify-center rounded-md text-dim outline-none hover:bg-surface-2 hover:text-ink focus-visible:ring-[3px] focus-visible:ring-ring",
            className,
          )}
          {...props}
        >
          <Icon aria-hidden className="size-4" />
          {count != null && count > 0 && (
            <span
              aria-hidden
              className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-block px-1 text-[10px] leading-none font-semibold text-on-block tabular-nums"
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {accessibleLabel}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Toggle comfortable/compact a nivel de sitio — muta la densidad del shell
 * (`DensityContext`), que `DataTable`/`TraceLog` leen como default. Densidad
 * es una preferencia de pantallas ops de escritorio: en <lg se oculta por
 * defecto (el topbar mobile no tiene espacio y compact no aporta en touch);
 * pásale `className="flex"` si un caso de uso lo necesita visible.
 */
export function DensityToggle({ className }: { className?: string }) {
  const copy = useCopy();
  const shell = useOptionalAppShell();
  if (!shell) return null;

  const options = [
    { value: "comfortable" as const, icon: Rows2, label: copy.appShell.densityComfortable },
    { value: "compact" as const, icon: Rows4, label: copy.appShell.densityCompact },
  ];

  return (
    <div
      role="group"
      aria-label={copy.appShell.density}
      className={cn("hidden items-center rounded-md border border-border-subtle p-0.5 lg:flex", className)}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <Tooltip key={value}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-pressed={shell.density === value}
              aria-label={label}
              onClick={() => shell.setDensity(value)}
              className={cn(
                "flex h-6 w-7 items-center justify-center rounded-[5px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                shell.density === value ? "bg-surface-3 text-ink" : "text-faint hover:text-dim",
              )}
            >
              <Icon aria-hidden className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            {label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
