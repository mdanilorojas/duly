import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CommandPalette, useCommandPalette, type CommandPaletteItem } from "./command-palette.js";

// cmdk hace scrollIntoView sobre el ítem seleccionado — jsdom no lo implementa.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

function makeItems(overrides?: Partial<Record<string, () => void>>): CommandPaletteItem[] {
  return [
    { id: "go-exec", label: "Go to Executions", group: "Navigate", hint: "G E", onSelect: overrides?.["go-exec"] ?? vi.fn() },
    { id: "go-audit", label: "Go to Audit log", group: "Navigate", onSelect: overrides?.["go-audit"] ?? vi.fn() },
    { id: "pause", label: "Pause swarm", group: "Actions", keywords: ["halt", "stop"], onSelect: overrides?.["pause"] ?? vi.fn() },
    { id: "locked", label: "Delete workspace", group: "Actions", disabled: true, onSelect: overrides?.["locked"] ?? vi.fn() },
  ];
}

describe("CommandPalette", () => {
  it("muestra grupos e ítems con sus hints", () => {
    render(<CommandPalette open onOpenChange={() => {}} items={makeItems()} />);
    expect(screen.getByText("Navigate")).toBeDefined();
    expect(screen.getByText("Actions")).toBeDefined();
    expect(screen.getByText("Go to Executions")).toBeDefined();
    expect(screen.getByText("G E")).toBeDefined();
  });

  it("filtra al escribir — también por keywords/alias", async () => {
    render(<CommandPalette open onOpenChange={() => {}} items={makeItems()} />);
    await userEvent.type(screen.getByRole("combobox"), "halt");
    expect(screen.getByText("Pause swarm")).toBeDefined();
    expect(screen.queryByText("Go to Executions")).toBeNull();
  });

  it("sin coincidencias muestra el empty state", async () => {
    render(<CommandPalette open onOpenChange={() => {}} items={makeItems()} />);
    await userEvent.type(screen.getByRole("combobox"), "zzzz");
    expect(screen.getByText(/no results/i)).toBeDefined();
  });

  it("Enter ejecuta el comando seleccionado y cierra el palette", async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(<CommandPalette open onOpenChange={onOpenChange} items={makeItems({ pause: onSelect })} />);
    await userEvent.type(screen.getByRole("combobox"), "pause");
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("un ítem disabled no se puede ejecutar", async () => {
    const onSelect = vi.fn();
    render(<CommandPalette open onOpenChange={() => {}} items={makeItems({ locked: onSelect })} />);
    await userEvent.type(screen.getByRole("combobox"), "delete workspace");
    await userEvent.keyboard("{Enter}");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    render(<CommandPalette open onOpenChange={() => {}} items={makeItems()} />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("useCommandPalette", () => {
  function Probe() {
    const cmd = useCommandPalette();
    return <span data-testid="state">{String(cmd.open)}</span>;
  }

  it("⌘K / Ctrl+K alterna el estado abierto", async () => {
    render(<Probe />);
    expect(screen.getByTestId("state").textContent).toBe("false");
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByTestId("state").textContent).toBe("true");
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByTestId("state").textContent).toBe("false");
  });
});
