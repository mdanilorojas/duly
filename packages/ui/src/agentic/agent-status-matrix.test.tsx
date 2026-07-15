import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AgentStatusMatrix } from "./agent-status-matrix.js";

const items = [
  { code: "SCOPE", label: "Alcance del SGSI", tone: "ok" as const },
  { code: "ACCESS-CTRL", label: "Control de acceso", tone: "block" as const, critical: true },
];

describe("AgentStatusMatrix — API previa intacta", () => {
  it("renderiza lista con una celda por item (default density)", () => {
    render(<AgentStatusMatrix items={items} />);
    expect(screen.getByRole("list")).toBeDefined();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Alcance del SGSI")).toBeDefined();
  });

  it("sin onSelectItem no hay botones", () => {
    render(<AgentStatusMatrix items={items} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("AgentStatusMatrix — extensión", () => {
  it("density=compact renderiza celdas compactas (code visible, sin label largo)", () => {
    render(<AgentStatusMatrix items={items} density="compact" />);
    expect(screen.getByText("ACCESS-CTRL")).toBeDefined();
    expect(screen.queryByText("Control de acceso")).toBeNull();
  });

  it("critical expone texto accesible", () => {
    render(<AgentStatusMatrix items={items} density="compact" />);
    expect(screen.getByText("critical")).toBeDefined(); // sr-only, copy en
  });

  it("onSelectItem convierte celdas en botones y entrega el item", async () => {
    const onSelectItem = vi.fn();
    render(<AgentStatusMatrix items={items} onSelectItem={onSelectItem} />);
    await userEvent.click(screen.getAllByRole("button")[0]!);
    expect(onSelectItem).toHaveBeenCalledWith(items[0]);
  });

  it("axe limpio en compact + critical", async () => {
    const { container } = render(<AgentStatusMatrix items={items} density="compact" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("critical no descarta el borde de tono (usa ring aditivo, no border-color)", () => {
    const warnCriticalItems = [
      { code: "WARN-01", label: "Revisión pendiente", tone: "warn" as const, critical: true },
    ];
    const { container } = render(<AgentStatusMatrix items={warnCriticalItems} />);
    const listitem = container.querySelector('[role="listitem"]');
    expect(listitem?.className).toContain("border-s-warn");
    expect(listitem?.className).toContain("ring-block/60");
  });
});
