import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TraceLog } from "./trace-log.js";
import { enCopy } from "../lib/copy/index.js";

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

  it("streaming aplica aria-live=polite aunque Body no sea hijo directo de Root", () => {
    render(
      <TraceLog.Root streaming>
        <div>
          <TraceLog.Body />
        </div>
      </TraceLog.Root>,
    );
    expect(screen.getByRole("log").getAttribute("aria-live")).toBe("polite");
  });

  it("sin streaming Body tiene aria-live=off para silenciar el role=log implícito", () => {
    render(<TraceLog.Root><TraceLog.Body /></TraceLog.Root>);
    expect(screen.getByRole("log").getAttribute("aria-live")).toBe("off");
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
    expect(screen.getByText(new RegExp(enCopy.tone.block), { selector: ".sr-only" })).toBeDefined();
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
      // (a) copy.tone text present inside .sr-only (default locale: English)
      expect(
        screen.getByText(new RegExp(enCopy.tone[tone]), { selector: ".sr-only" }),
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

  it("tone inválido (JS consumer sin TS) degrada a 'info' sin crashear", () => {
    render(
      <TraceLog.Root>
        <TraceLog.Body>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <TraceLog.Row tone={"danger" as any} agent="X">contenido</TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>,
    );
    const row = document.querySelector("[data-tone]")!;
    expect(row.getAttribute("data-tone")).toBe("info");
    expect(row.className).toContain("border-info");
    expect(screen.getByText("contenido")).toBeDefined();
  });
});

describe("TraceLog.Detail + estados", () => {
  it("expande/colapsa el detalle con teclado (Enter y Space)", async () => {
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

    // Expand with Enter
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/138 IDs/)).toBeDefined();

    // Collapse with Enter
    await user.keyboard("{Enter}");
    expect(screen.queryByText(/138 IDs/)).toBeNull();

    // Re-expand with Space
    await user.keyboard(" ");
    expect(screen.getByText(/138 IDs/)).toBeDefined();
  });

  it("Detail acepta label para aria-label personalizado (distingue múltiples triggers)", () => {
    render(
      <TraceLog.Root>
        <TraceLog.Body>
          <TraceLog.Row agent="PARSER">
            <TraceLog.Detail label="Ver trazas del parser">Detalles del parser</TraceLog.Detail>
          </TraceLog.Row>
          <TraceLog.Row agent="VALIDATOR">
            <TraceLog.Detail label="Ver errores del validador">Detalles del validador</TraceLog.Detail>
          </TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>,
    );
    expect(screen.getByRole("button", { name: /ver trazas del parser/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /ver errores del validador/i })).toBeDefined();
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
