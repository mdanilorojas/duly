import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
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

describe("TraceLog.Detail + estados", () => {
  it("expande/colapsa el detalle con teclado", async () => {
    const user = userEvent.setup();
    render(
      <TraceLog.Root>
        <TraceLog.Body>
          <TraceLog.Row tone="info" agent="PARSER">
            Lee líneas
            <TraceLog.Detail>138 IDs únicos tras dedupe</TraceLog.Detail>
          </TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>,
    );
    const trigger = screen.getByRole("button", { name: /detalle/i });
    expect(screen.queryByText(/138 IDs/)).toBeNull();
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/138 IDs/)).toBeDefined();
  });

  it("Empty muestra mensaje", () => {
    render(<TraceLog.Root><TraceLog.Body><TraceLog.Empty>Sin eventos</TraceLog.Empty></TraceLog.Body></TraceLog.Root>);
    expect(screen.getByText("Sin eventos")).toBeDefined();
  });
});

describe("TraceLog.Truncated", () => {
  it("renders as a button and calls onShowAll on click", async () => {
    const user = userEvent.setup();
    const onShowAll = vi.fn();
    render(
      <TraceLog.Root>
        <TraceLog.Body>
          <TraceLog.Truncated onShowAll={onShowAll}>Mostrar 42 más</TraceLog.Truncated>
        </TraceLog.Body>
      </TraceLog.Root>,
    );
    const btn = screen.getByRole("button", { name: /mostrar 42 más/i });
    expect(btn).toBeDefined();
    await user.click(btn);
    expect(onShowAll).toHaveBeenCalledOnce();
  });
});

it("no tiene violaciones axe con todos los tones + detail + streaming", async () => {
  const { container } = render(
    <TraceLog.Root streaming density="comfortable">
      <TraceLog.Header title="Pipeline" hint="tu lista → mapa" />
      <TraceLog.Body maxHeight={300}>
        <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
          Lee líneas <TraceLog.Code>predio</TraceLog.Code>
          <TraceLog.Detail>138 IDs únicos</TraceLog.Detail>
        </TraceLog.Row>
        <TraceLog.Row tone="ok" agent="ARCGIS" timestamp="12:04:01">Responde GeoJSON.</TraceLog.Row>
        <TraceLog.Row tone="review" agent="HUMAN" step="paso 3">Requiere revisión.</TraceLog.Row>
        <TraceLog.Row tone="warn" agent="COLOR" step="paso 4">3 sin geometría.</TraceLog.Row>
        <TraceLog.Row tone="block" agent="VALIDATE" step="error">Predio inexistente.</TraceLog.Row>
      </TraceLog.Body>
    </TraceLog.Root>,
  );
  expect(await axe(container)).toHaveNoViolations();
});
