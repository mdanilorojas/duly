import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DataProvenanceCard, type DataSource } from "./data-provenance-card.js";

const sources: DataSource[] = [
  { kind: "table", ref: "warehouse.transactions", trust: "ok", hash: "sha256:1a2b3c4d5e", detail: "rows 8,412" },
  { kind: "api", ref: "sanctions.gov/v2", trust: "warn", freshness: "cached 41m" },
];

describe("DataProvenanceCard", () => {
  it("resume por el peor tono de confianza de las fuentes", () => {
    render(<DataProvenanceCard sources={sources} />);
    // warn (API stale) manda sobre ok (table)
    expect(screen.getByText(/stale \/ partial/i)).toBeDefined();
    expect(screen.getByText(/2 sources/i)).toBeDefined();
  });

  it("expande a lineage detallado y muestra el detalle de cada fuente", async () => {
    render(<DataProvenanceCard sources={sources} />);
    // colapsado: el detalle no está visible
    expect(screen.queryByText(/rows 8,412/i)).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /lineage/i }));
    expect(screen.getByText(/rows 8,412/i)).toBeDefined();
    // el ref aparece en el chip compacto y de nuevo en el lineage expandido
    expect(screen.getAllByText(/warehouse\.transactions/i).length).toBeGreaterThan(0);
  });

  it("defaultExpanded muestra el lineage sin interacción", () => {
    render(<DataProvenanceCard sources={sources} defaultExpanded />);
    expect(screen.getByText(/rows 8,412/i)).toBeDefined();
  });

  it("sin fuentes marca la falta de procedencia como hallazgo (warn), no vacío neutro", () => {
    render(<DataProvenanceCard sources={[]} emptyLabel="No declared data sources" />);
    expect(screen.getByText(/no declared data sources/i)).toBeDefined();
  });

  it("singulariza el conteo con una sola fuente", () => {
    render(<DataProvenanceCard sources={[sources[0]]} />);
    expect(screen.getByText(/1 source\b/i)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    const { container } = render(<DataProvenanceCard sources={sources} defaultExpanded />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
