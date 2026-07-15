import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { LayoutDashboard, Workflow, Bell } from "lucide-react";
import { AppShell } from "./app-shell.js";
import { AppSidebar, SidebarSection, SidebarItem } from "./app-sidebar.js";
import { AppTopbar, TopbarIconButton, DensityToggle } from "./app-topbar.js";
import { WorkspaceSwitcher } from "./workspace-switcher.js";
import { EnvironmentBadge } from "./environment-badge.js";
import { DataTable, type ColumnDef } from "../data-table/index.js";
import { DensityContext } from "../trace-log/trace-log.context.js";

// jsdom no implementa las APIs de pointer-capture/scroll que usan los
// poppers de radix (DropdownMenu) — mocks mínimos, mismo criterio que el
// mock de ResizeObserver en vitest.setup.ts.
beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const workspaces = [
  { id: "agent-ops", name: "Agent Ops", description: "Swarm console" },
  { id: "iso", name: "ISO Readiness", description: "ISO 42001" },
];

function Harness({ onWorkspaceSelect = () => {} }: { onWorkspaceSelect?: (id: string) => void }) {
  return (
    <AppShell
      sidebar={
        <AppSidebar
          header={
            <WorkspaceSwitcher workspaces={workspaces} activeId="agent-ops" onSelect={onWorkspaceSelect} />
          }
        >
          <SidebarSection>
            <SidebarItem icon={LayoutDashboard} label="Overview" active onClick={() => {}} />
            <SidebarItem icon={Workflow} label="Executions" badge={12} onClick={() => {}} />
          </SidebarSection>
        </AppSidebar>
      }
      topbar={
        <AppTopbar
          breadcrumbs={[{ label: "Agent Ops" }, { label: "Overview" }]}
          actions={
            <>
              <EnvironmentBadge environment="production" />
              <DensityToggle />
              <TopbarIconButton icon={Bell} label="Pending interrupts" count={3} />
            </>
          }
        />
      }
    >
      <p>content</p>
    </AppShell>
  );
}

describe("AppShell", () => {
  it("renderiza skip-link, landmark de navegación y main", () => {
    render(<Harness />);
    expect(screen.getByRole("link", { name: /skip to content/i })).toBeDefined();
    expect(screen.getByRole("navigation", { name: /navigation/i })).toBeDefined();
    expect(screen.getByRole("main")).toBeDefined();
  });

  it("la vista activa lleva aria-current=page y el badge del ítem se muestra", () => {
    render(<Harness />);
    const active = screen.getByRole("button", { name: "Overview" });
    expect(active.getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("12")).toBeDefined();
  });

  it("colapsar la sidebar cambia el toggle a expandir y esconde los labels", async () => {
    render(<Harness />);
    const collapse = screen.getByRole("button", { name: /collapse sidebar/i });
    expect(collapse.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(collapse);
    const expand = screen.getByRole("button", { name: /expand sidebar/i });
    expect(expand.getAttribute("aria-expanded")).toBe("false");
    // colapsado, el label visible desaparece del nav ("Overview" sigue en el
    // breadcrumb del topbar) y el ítem queda nombrado por aria-label
    const nav = screen.getByRole("navigation", { name: /navigation/i });
    expect(within(nav).queryByText("Overview")).toBeNull();
    expect(within(nav).getByRole("button", { name: "Overview" })).toBeDefined();
  });

  it("DensityToggle muta data-density del shell (comfortable → compact)", async () => {
    const { container } = render(<Harness />);
    const root = container.querySelector("[data-density]");
    expect(root?.getAttribute("data-density")).toBe("comfortable");
    await userEvent.click(screen.getByRole("button", { name: /compact density/i }));
    expect(root?.getAttribute("data-density")).toBe("compact");
    const compactBtn = screen.getByRole("button", { name: /compact density/i });
    expect(compactBtn.getAttribute("aria-pressed")).toBe("true");
  });

  it("WorkspaceSwitcher abre el menú y selecciona otro workspace", async () => {
    const onSelect = vi.fn();
    render(<Harness onWorkspaceSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /workspaces/i }));
    await userEvent.click(await screen.findByRole("menuitem", { name: /ISO Readiness/i }));
    expect(onSelect).toHaveBeenCalledWith("iso");
  });

  it("TopbarIconButton anuncia el contador en el nombre accesible", () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Pending interrupts (3)" })).toBeDefined();
  });

  it("EnvironmentBadge production usa tono warn y abrevia (no oculta) en mobile", () => {
    const { container } = render(<EnvironmentBadge environment="production" />);
    const badge = container.firstElementChild!;
    expect(badge.className).toContain("text-warn");
    // ≥sm el label completo; <sm la abreviatura visible + label completo sr-only
    expect(badge.textContent).toContain("Production");
    expect(badge.textContent).toContain("PROD");
  });

  it("el drawer mobile no muestra el toggle de colapso (solo aplica al rail desktop)", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /open navigation/i }));
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).queryByRole("button", { name: /collapse sidebar/i })).toBeNull();
    // la navegación sí está completa dentro del drawer
    expect(within(drawer).getByRole("button", { name: "Overview" })).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    render(<Harness />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("Densidad a nivel de sitio (DensityContext → DataTable)", () => {
  interface Row {
    id: string;
    name: string;
  }
  const columns: ColumnDef<Row, unknown>[] = [{ accessorKey: "name", header: "Name" }];
  const data: Row[] = [{ id: "1", name: "fila" }];

  it("DataTable sin prop hereda la densidad del contexto del shell", () => {
    const { container } = render(
      <DensityContext.Provider value="compact">
        <DataTable caption="t" data={data} columns={columns} getRowId={(r) => r.id} />
      </DensityContext.Provider>,
    );
    const cell = container.querySelector('[role="gridcell"]');
    expect(cell?.className).toContain("py-1.5");
  });

  it("la prop explícita de DataTable le gana al contexto", () => {
    const { container } = render(
      <DensityContext.Provider value="compact">
        <DataTable caption="t" data={data} columns={columns} getRowId={(r) => r.id} density="comfortable" />
      </DensityContext.Provider>,
    );
    const cell = container.querySelector('[role="gridcell"]');
    expect(cell?.className).toContain("py-2.5");
  });
});
