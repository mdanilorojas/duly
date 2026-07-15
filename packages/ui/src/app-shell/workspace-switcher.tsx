"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SidebarViewContext } from "./app-shell.js";

/**
 * WorkspaceSwitcher — el punto donde el shell se vuelve multi-caso-de-uso.
 * Cada workspace es una *solución* construida sobre el design system
 * (orquestación de agentes, auditoría/compliance, certificación ISO,
 * cotizaciones industriales, churn radar, …) con su propia navegación y
 * comandos; este switcher es el pivote entre ellas, al estilo del org/project
 * switcher de Vercel/Linear. Vive en el `header` del `AppSidebar`.
 */
export interface Workspace {
  id: string;
  name: string;
  /** Línea secundaria: producto/caso de uso, ej. "ISO 42001 readiness". */
  description?: string;
  /** Icono de la marca del workspace; si falta, se usan `initials`. */
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** Fallback de 1–2 letras cuando no hay icono. */
  initials?: string;
}

export interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Acción final del menú, ej. "New workspace". */
  action?: { label: string; onSelect: () => void };
  /** aria-label del trigger. Default: copy `appShell.workspaces`. */
  label?: string;
  className?: string;
}

function WorkspaceMark({ workspace, className }: { workspace: Workspace; className?: string }) {
  const Icon = workspace.icon;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-surface text-accent",
        className,
      )}
    >
      {Icon ? (
        <Icon aria-hidden className="size-4" />
      ) : (
        <span className="text-xs font-bold">{workspace.initials ?? workspace.name.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

export function WorkspaceSwitcher({
  workspaces,
  activeId,
  onSelect,
  action,
  label,
  className,
}: WorkspaceSwitcherProps) {
  const copy = useCopy();
  const { collapsed } = React.useContext(SidebarViewContext);
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];
  if (!active) return null;

  const trigger = (
    <DropdownMenuTrigger
      aria-label={label ?? copy.appShell.workspaces}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md text-start outline-none hover:bg-surface-2 focus-visible:ring-[3px] focus-visible:ring-ring",
        collapsed ? "justify-center p-1" : "p-1.5",
        className,
      )}
    >
      <WorkspaceMark workspace={active} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink">{active.name}</span>
            {active.description && (
              <span className="block truncate text-[11px] text-faint">{active.description}</span>
            )}
          </span>
          <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-faint" />
        </>
      )}
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={6}>
            {active.name}
          </TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-[11px] font-semibold tracking-wide text-faint uppercase">
          {copy.appShell.workspaces}
        </DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onSelect={() => onSelect(w.id)}
            aria-current={w.id === active.id || undefined}
            className="gap-2.5"
          >
            <WorkspaceMark workspace={w} className="size-7 rounded-md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink">{w.name}</span>
              {w.description && <span className="block truncate text-[11px] text-faint">{w.description}</span>}
            </span>
            {w.id === active.id && <Check aria-hidden className="size-4 shrink-0 text-accent" />}
          </DropdownMenuItem>
        ))}
        {action && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={action.onSelect} className="gap-2.5 text-dim">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed border-border-default">
                <Plus aria-hidden className="size-3.5" />
              </span>
              {action.label}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
