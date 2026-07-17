import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./combobox";

const TIPOS_PLIEGO = [
  { value: "PLI.SUBINV", label: "Subasta Inversa Electrónica" },
  { value: "PLI.LICOBR", label: "Licitación de Obras" },
];

describe("Combobox", () => {
  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        items={TIPOS_PLIEGO}
        value={null}
        onChange={() => {}}
        getLabel={(i) => i.label}
        getValue={(i) => i.value}
        placeholder="Buscar tipo de proceso..."
      />,
    );
    await user.click(screen.getByPlaceholderText("Buscar tipo de proceso..."));
    await user.type(screen.getByPlaceholderText("Buscar tipo de proceso..."), "Subasta");
    expect(screen.getByText("Subasta Inversa Electrónica")).toBeInTheDocument();
    expect(screen.queryByText("Licitación de Obras")).not.toBeInTheDocument();
  });

  it("calls onChange with the selected item's value on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox
        items={TIPOS_PLIEGO}
        value={null}
        onChange={onChange}
        getLabel={(i) => i.label}
        getValue={(i) => i.value}
        placeholder="Buscar..."
      />,
    );
    await user.click(screen.getByPlaceholderText("Buscar..."));
    await user.click(screen.getByText("Licitación de Obras"));
    expect(onChange).toHaveBeenCalledWith(TIPOS_PLIEGO[1]);
  });
});
