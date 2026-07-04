import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RelationshipMap, type Stakeholder, type RelationshipLink } from "./relationship-map.js";

const people: Stakeholder[] = [
  { id: "cfo", name: "Dana Wu", title: "CFO", role: "economic-buyer", influence: 5 },
  { id: "vp", name: "Ivo Park", title: "VP Eng", role: "champion", influence: 4 },
  { id: "sec", name: "Mara Kite", title: "CISO", role: "blocker", influence: 3 },
];
const links: RelationshipLink[] = [
  { id: "l1", source: "vp", target: "cfo" },
  { id: "l2", source: "sec", target: "cfo" },
];

describe("RelationshipMap", () => {
  it("renderiza un roster accesible de stakeholders", () => {
    render(<RelationshipMap people={people} links={links} ariaLabel="Comité de compra" />);
    const list = screen.getByRole("list", { name: /comité de compra/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("Dana Wu")).toBeDefined();
  });

  it("el rol se comunica con texto (champion/economic-buyer/blocker)", () => {
    render(<RelationshipMap people={people} links={links} ariaLabel="Comité" />);
    expect(screen.getByText(/economic buyer/i)).toBeDefined();
    expect(screen.getByText(/champion/i)).toBeDefined();
    expect(screen.getByText(/blocker/i)).toBeDefined();
  });

  it("seleccionar un stakeholder llama onSelect con su id", async () => {
    const onSelect = vi.fn();
    render(<RelationshipMap people={people} links={links} onSelect={onSelect} ariaLabel="Comité" />);
    const list = screen.getByRole("list", { name: /comité/i });
    await userEvent.click(within(list).getByRole("button", { name: /Ivo Park/ }));
    expect(onSelect).toHaveBeenCalledWith("vp");
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<RelationshipMap people={people} links={links} ariaLabel="Comité de compra" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
