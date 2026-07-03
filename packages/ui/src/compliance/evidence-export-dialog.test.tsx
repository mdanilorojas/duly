import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { EvidenceExportDialog } from "./evidence-export-dialog.js";

describe("EvidenceExportDialog", () => {
  it("el botón de export no va desnudo: muestra qué, cuántos y el rango", () => {
    render(
      <EvidenceExportDialog
        open
        onOpenChange={() => {}}
        range="1–30 jun 2026"
        recordCount={342}
        onExport={vi.fn()}
      />,
    );
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/342/)).toBeDefined();
    expect(screen.getByText(/1–30 jun 2026/)).toBeDefined();
  });

  it("exportar llama onExport con el formato y muestra el hash del manifiesto al terminar", async () => {
    const onExport = vi.fn().mockResolvedValue({ manifestHash: "9f8c2a41b0" });
    render(
      <EvidenceExportDialog open onOpenChange={() => {}} range="jun 2026" recordCount={10} onExport={onExport} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /JSON/i }));
    expect(onExport).toHaveBeenCalledWith("json", expect.objectContaining({ recordCount: 10 }));
    expect(await screen.findByText(/9f8c2a41b0/)).toBeDefined();
  });

  it("un fallo de export muestra un mensaje de error accionable", async () => {
    const onExport = vi.fn().mockRejectedValue(new Error("firma no disponible"));
    render(
      <EvidenceExportDialog open onOpenChange={() => {}} range="jun 2026" recordCount={10} onExport={onExport} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /CSV/i }));
    expect(await screen.findByText(/firma no disponible/i)).toBeDefined();
  });

  it("sin violaciones de accesibilidad (axe)", async () => {
    render(
      <EvidenceExportDialog open onOpenChange={() => {}} range="jun 2026" recordCount={10} onExport={vi.fn()} />,
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
