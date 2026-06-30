import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TraceLog } from "./trace-log.js";
import { toneLabel } from "./copy.js";

describe("TraceLog Root/Header/Body", () => {
  it("renderiza title + hint y aplica role=log", () => {
    render(
      <TraceLog.Root>
        <TraceLog.Header title="Pipeline de una consulta" hint="tu lista → mapa" />
        <TraceLog.Body />
      </TraceLog.Root>,
    );
    expect(screen.getByText("Pipeline de una consulta")).toBeDefined();
    expect(screen.getByText("tu lista → mapa")).toBeDefined();
    expect(screen.getByRole("log")).toBeDefined();
  });

  it("streaming activa aria-live=polite", () => {
    render(<TraceLog.Root streaming><TraceLog.Body /></TraceLog.Root>);
    expect(screen.getByRole("log").getAttribute("aria-live")).toBe("polite");
  });
});

describe("TraceLog.Row", () => {
  it("aplica el borde por tone y muestra label accesible (no solo color)", () => {
    render(
      <TraceLog.Root>
        <TraceLog.Body>
          <TraceLog.Row tone="block" agent="VALIDATE">
            Predio <TraceLog.Code>142099</TraceLog.Code> no existe.
          </TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>,
    );
    const row = screen.getByText(/no existe/).closest("[data-tone]")!;
    expect(row.getAttribute("data-tone")).toBe("block");
    expect(row.className).toContain("border-block");
    // label textual del tone presente para lectores de pantalla
    expect(screen.getByText(toneLabel.block, { selector: ".sr-only,*" })).toBeDefined();
    expect(screen.getByText("VALIDATE")).toBeDefined();
    expect(screen.getByText("142099").tagName).toBe("CODE");
  });
});
