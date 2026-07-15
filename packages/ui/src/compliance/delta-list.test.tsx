import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DeltaList } from "./delta-list.js";

const entries = [
  { label: "ACCESS-CONTROL", before: { label: "missing", tone: "block" as const }, after: { label: "missing", tone: "block" as const } },
  { label: "BACKUP", before: { label: "missing", tone: "block" as const }, after: { label: "partial", tone: "warn" as const }, improved: true },
];

describe("DeltaList", () => {
  it("renderiza una fila por entrada con before y after", () => {
    render(<DeltaList entries={entries} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("BACKUP")).toBeDefined();
    expect(screen.getByText("partial")).toBeDefined();
  });

  it("marca la mejora con texto accesible, no solo ▲", () => {
    render(<DeltaList entries={entries} />);
    expect(screen.getByText("improved")).toBeDefined(); // sr-only, copy en
  });

  it("sin improved no hay marca", () => {
    render(<DeltaList entries={[entries[0]!]} />);
    expect(screen.queryByText("improved")).toBeNull();
  });

  it("axe limpio", async () => {
    const { container } = render(<DeltaList entries={entries} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
