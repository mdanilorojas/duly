"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import { DensityContext } from "../trace-log/trace-log.context.js";
import type { Density } from "../trace-log/trace-log.variants.js";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

/**
 * AppShell — el chrome de aplicación que faltaba en el catálogo: hasta ahora
 * cada consola (`ExecutionHistoryConsole`, `PropertyIntelligenceConsole`, …)
 * era un composite suelto sin navegación, sin switcher de workspace y sin
 * densidad a nivel de sitio. Este shell es **config-driven**: navegación,
 * workspace activo, comandos del palette y acciones del topbar entran como
 * datos, de modo que el mismo chrome sirve para orquestación de agentes,
 * auditoría/compliance, certificación ISO, cotizaciones industriales, churn
 * radar — cualquier vertical construida sobre este design system.
 *
 * Principios NORTH_STAR que cierra:
 * - #7 densidad + keyboard-first: `density` vive aquí (comfortable/compact),
 *   se propaga por `DensityContext` (la misma del `TraceLog`/`DataTable`) y
 *   se marca como `data-density` para estilos derivados.
 * - Área D "CommandPalette": ver `command-palette.tsx` (cmdk, la dependencia
 *   ya decidida en el spec del ladder).
 * - WCAG 2.2: skip-link al contenido, landmarks (`nav`/`main`), targets 24px.
 */
export interface AppShellContextValue {
  density: Density;
  setDensity: (d: Density) => void;
  /** Sidebar de desktop colapsada a rail de iconos. */
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  /** Drawer de navegación en mobile (< lg). */
  mobileNavOpen: boolean;
  setMobileNavOpen: (o: boolean) => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used within <AppShell>");
  return ctx;
}

/**
 * Variante no-throw — para componentes que también viven fuera de un
 * `AppShell` (tests, stories standalone): devuelven `null` y degradan solo
 * la parte que depende del shell (cerrar el drawer mobile, toggle de colapso).
 */
export function useOptionalAppShell(): AppShellContextValue | null {
  return React.useContext(AppShellContext);
}

/**
 * La sidebar se renderiza dos veces (aside desktop + Sheet mobile); este
 * contexto le dice a cada instancia si debe pintarse colapsada — en el Sheet
 * siempre va expandida aunque el rail de desktop esté colapsado — y si vive
 * dentro del drawer mobile (donde el toggle de colapso no tiene sentido).
 */
export const SidebarViewContext = React.createContext<{ collapsed: boolean; inDrawer: boolean }>({
  collapsed: false,
  inDrawer: false,
});

export interface AppShellProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Navegación lateral — normalmente un `<AppSidebar>`. */
  sidebar: React.ReactNode;
  /** Barra superior — normalmente un `<AppTopbar>`. */
  topbar?: React.ReactNode;
  /** Contenido de la vista activa; se envuelve en `<main>` con skip-link. */
  children: React.ReactNode;
  /** Densidad controlada. Si se omite, el shell la maneja internamente. */
  density?: Density;
  defaultDensity?: Density;
  onDensityChange?: (d: Density) => void;
  /** Estado inicial del rail de desktop. */
  defaultCollapsed?: boolean;
}

export function AppShell({
  sidebar,
  topbar,
  children,
  density: densityProp,
  defaultDensity = "comfortable",
  onDensityChange,
  defaultCollapsed = false,
  className,
  ...props
}: AppShellProps) {
  const copy = useCopy();
  const [densityState, setDensityState] = React.useState<Density>(defaultDensity);
  const density = densityProp ?? densityState;
  const setDensity = React.useCallback(
    (d: Density) => {
      setDensityState(d);
      onDensityChange?.(d);
    },
    [onDensityChange],
  );

  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const mainId = React.useId();

  const ctx = React.useMemo<AppShellContextValue>(
    () => ({ density, setDensity, collapsed, setCollapsed, mobileNavOpen, setMobileNavOpen }),
    [density, setDensity, collapsed, mobileNavOpen],
  );

  return (
    <AppShellContext.Provider value={ctx}>
      <DensityContext.Provider value={density}>
        <div
          data-density={density}
          className={cn("flex h-dvh w-full overflow-hidden bg-bg-base text-ink", className)}
          {...props}
        >
          {/* Skip-link — primer elemento tabulable (WCAG 2.4.1). */}
          <a
            href={`#${mainId}`}
            className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-sm font-medium text-on-accent focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:start-2"
          >
            {copy.appShell.skipToContent}
          </a>

          {/* Rail/sidebar de desktop. */}
          <SidebarViewContext.Provider value={{ collapsed, inDrawer: false }}>
            <div className="hidden shrink-0 lg:flex">{sidebar}</div>
          </SidebarViewContext.Provider>

          {/* Drawer de navegación en mobile — misma sidebar, siempre expandida. */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" className="w-72 gap-0 p-0 lg:hidden">
              <SheetTitle className="sr-only">{copy.appShell.navigation}</SheetTitle>
              <SheetDescription className="sr-only">{copy.appShell.navigation}</SheetDescription>
              <SidebarViewContext.Provider value={{ collapsed: false, inDrawer: true }}>
                {sidebar}
              </SidebarViewContext.Provider>
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 flex-col">
            {topbar}
            <main id={mainId} tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto outline-none">
              {children}
            </main>
          </div>
        </div>
      </DensityContext.Provider>
    </AppShellContext.Provider>
  );
}
