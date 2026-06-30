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
    // label textual del tone presente para lectores de pantalla, scoped to .sr-only
    expect(screen.getByText(/bloqueo/, { selector: ".sr-only" })).toBeDefined();
    expect(screen.getByText("VALIDATE")).toBeDefined();
    expect(screen.getByText("142099").tagName).toBe("CODE");
  });

  it.each(["info", "ok", "review", "warn", "block"] as const)(
    "tone=%s: label sr-only y borde correcto",
    (tone) => {
      render(
        <TraceLog.Root>
          <TraceLog.Body>
            <TraceLog.Row tone={tone} agent="X" />
          </TraceLog.Body>
        </TraceLog.Root>,
      );
      // (a) toneLabel text present inside .sr-only
      expect(
        screen.getByText(new RegExp(toneLabel[tone]), { selector: ".sr-only" }),
      ).toBeDefined();
      // (b) row element has border-{tone} class
      const row = document.querySelector("[data-tone]")!;
      expect(row.className).toContain(`border-${tone}`);
    },
  );

  it("usa íconos distintos por tone (WCAG 1.4.1 — no solo color)", () => {
    const { container } = render(
      <TraceLog.Root>
        <TraceLog.Body>
          {(["info", "ok", "review", "warn", "block"] as const).map((tone) => (
            <TraceLog.Row key={tone} tone={tone} agent="X" />
          ))}
        </TraceLog.Body>
      </TraceLog.Root>,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(5);
    // Lucide emits a per-icon class like lucide-info, lucide-eye, lucide-octagon-x, etc.
    const iconClasses = Array.from(svgs).map(
      (svg) => Array.from(svg.classList).find((c) => c.startsWith("lucide-")),
    );
    expect(new Set(iconClasses).size).toBe(5);
  });
});
