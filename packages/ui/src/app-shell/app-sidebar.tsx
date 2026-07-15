"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useDensity } from "../trace-log/trace-log.context.js";
import { SidebarViewContext, useOptionalAppShell } from "./app-shell.js";

/**
 * Navegación lateral del `AppShell`. Config-driven: las secciones e ítems
 * entran como children declarativos (`SidebarSection`/`SidebarItem`), así el
 * mismo componente navega una consola de orquestación de agentes, un tablero
 * de certificación ISO o un pipeline de cotizaciones — solo cambia la config.
 *
 * Colapsable a rail de iconos (labels → tooltips, badges → dot). El estado de
 * colapso vive en el shell (`useAppShell`), pero la *vista* la decide
 * `SidebarViewContext`: la misma sidebar se pinta expandida dentro del drawer
 * mobile aunque el rail de desktop esté colapsado.
 */

export interface AppSidebarProps extends React.ComponentProps<"div"> {
  /** Slot superior — normalmente `<WorkspaceSwitcher>` o la marca. */
  header?: React.ReactNode;
  /** Slot inferior — usuario, links legales, etc. Va antes del toggle de colapso. */
  footer?: React.ReactNode;
  /** aria-label del landmark `nav`. Default: copy `appShell.navigation`. */
  label?: string;
  /** Oculta el botón de colapsar (p. ej. si el shell no quiere rail). */
  collapsible?: boolean;
}

export function AppSidebar({
  header,
  footer,
  label,
  collapsible = true,
  className,
  children,
  ...props
}: AppSidebarProps) {
  const copy = useCopy();
  const { collapsed, inDrawer } = React.useContext(SidebarViewContext);
  const shell = useOptionalAppShell();
  const navId = React.useId();

  return (
    <TooltipProvider delayDuration={300}>
      <div
        data-collapsed={collapsed || undefined}
        className={cn(
          "flex h-full flex-col border-e border-border-subtle bg-bg-elevated",
          "motion-safe:transition-[width] motion-safe:duration-base motion-safe:ease-standard",
          collapsed ? "w-[3.75rem]" : "w-64",
          className,
        )}
        {...props}
      >
        {header && <div className={cn("border-b border-border-subtle", collapsed ? "p-2" : "p-3")}>{header}</div>}

        <nav
          id={navId}
          aria-label={label ?? copy.appShell.navigation}
          className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3", collapsed ? "px-2" : "px-3")}
        >
          {children}
        </nav>

        {footer && <div className={cn("border-t border-border-subtle", collapsed ? "p-2" : "p-3")}>{footer}</div>}

        {/* El toggle de colapso solo aplica al rail de desktop — en el drawer
            mobile la sidebar siempre va expandida y colapsar no significa nada. */}
        {collapsible && shell && !inDrawer && (
          <div className={cn("border-t border-border-subtle", collapsed ? "p-2" : "p-3")}>
            <button
              type="button"
              aria-expanded={!collapsed}
              aria-controls={navId}
              aria-label={collapsed ? copy.appShell.expandSidebar : copy.appShell.collapseSidebar}
              onClick={() => shell.setCollapsed(!collapsed)}
              className={cn(
                "flex h-8 items-center gap-2 rounded-md text-xs text-faint outline-none hover:bg-surface-2 hover:text-dim focus-visible:ring-[3px] focus-visible:ring-ring",
                collapsed ? "w-full justify-center" : "w-full px-2.5",
              )}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden className="size-4 shrink-0 rtl:rotate-180" />
              ) : (
                <>
                  <PanelLeftClose aria-hidden className="size-4 shrink-0 rtl:rotate-180" />
                  <span className="truncate">{copy.appShell.collapseSidebar}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export interface SidebarSectionProps extends React.ComponentProps<"div"> {
  /** Encabezado de la sección; colapsado se reemplaza por un divisor. */
  label?: string;
}

export function SidebarSection({ label, className, children, ...props }: SidebarSectionProps) {
  const { collapsed } = React.useContext(SidebarViewContext);
  return (
    <div className={cn("mb-4 last:mb-0", className)} {...props}>
      {label &&
        (collapsed ? (
          <div role="presentation" className="mx-2 mb-2 border-t border-border-subtle" />
        ) : (
          <div className="mb-1 px-2.5 text-[11px] font-semibold tracking-wide text-faint uppercase">
            {label}
          </div>
        ))}
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

type ToneName = "info" | "ok" | "review" | "warn" | "block";

const badgeTone: Record<ToneName, string> = {
  info: "bg-info/15 text-info",
  ok: "bg-ok/15 text-ok",
  review: "bg-review/15 text-review",
  warn: "bg-warn/15 text-warn",
  block: "bg-block/15 text-block",
};

const dotTone: Record<ToneName, string> = {
  info: "bg-info",
  ok: "bg-ok",
  review: "bg-review",
  warn: "bg-warn",
  block: "bg-block",
};

export interface SidebarItemProps {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  /** Contador o texto corto al final de la fila; colapsado se vuelve un dot. */
  badge?: string | number;
  /** Tono semántico del badge (default neutral). */
  badgeTone?: ToneName;
  /** Marca la vista activa (`aria-current="page"`). */
  active?: boolean;
  disabled?: boolean;
  /** Con `href` renderiza `<a>`; sin él, `<button>`. */
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function SidebarItem({
  icon: Icon,
  label,
  badge,
  badgeTone: tone,
  active = false,
  disabled = false,
  href,
  onClick,
  className,
}: SidebarItemProps) {
  const { collapsed } = React.useContext(SidebarViewContext);
  const shell = useOptionalAppShell();
  const density = useDensity();

  // Al navegar desde el drawer mobile, cerrarlo — el consumidor no debe
  // tener que wirear esto a mano.
  const handleClick = () => {
    onClick?.();
    shell?.setMobileNavOpen(false);
  };

  const inner = (
    <>
      {Icon && <Icon aria-hidden className="size-4 shrink-0" />}
      {!collapsed && <span className="min-w-0 flex-1 truncate text-start">{label}</span>}
      {!collapsed && badge != null && (
        <span
          className={cn(
            "ms-auto shrink-0 rounded-full px-1.5 py-0.5 text-[11px] leading-none font-medium tabular-nums",
            tone ? badgeTone[tone] : "bg-surface-3 text-dim",
          )}
        >
          {badge}
        </span>
      )}
      {collapsed && badge != null && (
        <span
          aria-hidden
          className={cn(
            "absolute top-1 end-1 size-1.5 rounded-full",
            tone ? dotTone[tone] : "bg-border-strong",
          )}
        />
      )}
    </>
  );

  const sharedClass = cn(
    "relative flex w-full items-center gap-2.5 rounded-md text-sm outline-none",
    density === "compact" ? "h-8" : "h-9",
    collapsed ? "justify-center px-0" : "px-2.5",
    active
      ? "bg-accent-surface font-medium text-ink"
      : "text-dim hover:bg-surface-2 hover:text-ink",
    disabled && "pointer-events-none opacity-40",
    "focus-visible:ring-[3px] focus-visible:ring-ring",
    className,
  );

  // Indicador de vista activa en el borde inicial — legible también colapsado.
  const activeBar = active && (
    <span aria-hidden className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-accent" />
  );

  const control = href ? (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
      aria-label={collapsed ? label : undefined}
      onClick={handleClick}
      className={sharedClass}
    >
      {activeBar}
      {inner}
    </a>
  ) : (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      aria-label={collapsed ? label : undefined}
      onClick={handleClick}
      className={sharedClass}
    >
      {activeBar}
      {inner}
    </button>
  );

  return (
    <li className="list-none">
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{control}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={6}>
            {label}
            {badge != null && <span className="ms-1.5 text-faint tabular-nums">{badge}</span>}
          </TooltipContent>
        </Tooltip>
      ) : (
        control
      )}
    </li>
  );
}
