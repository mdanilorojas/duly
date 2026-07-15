import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CalendarDate } from "@internationalized/date";
import { DateRangePicker, type DateRange } from "./date-range-picker.js";

// react-aria posiciona el popover midiendo el DOM — jsdom no implementa
// scrollIntoView (mismo criterio que los mocks de vitest.setup.ts).
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const range: DateRange = {
  start: new CalendarDate(2026, 6, 1),
  end: new CalendarDate(2026, 6, 30),
};

describe("DateRangePicker", () => {
  it("muestra la zona horaria SIEMPRE visible, con IANA en el title", () => {
    render(<DateRangePicker timeZone="UTC" defaultValue={range} />);
    const chip = screen.getByTitle("UTC");
    // El offset legible de UTC es "GMT" en Intl shortOffset
    expect(chip.textContent).toMatch(/GMT|UTC/);
  });

  it("timeZoneLabel reemplaza el offset del chip", () => {
    render(<DateRangePicker timeZone="America/Mexico_City" timeZoneLabel="Planta MTY" defaultValue={range} />);
    expect(screen.getByTitle("America/Mexico_City").textContent).toContain("Planta MTY");
  });

  it("los segmentos son spinbuttons editables por teclado y disparan onChange", async () => {
    const onChange = vi.fn();
    render(<DateRangePicker timeZone="UTC" defaultValue={range} onChange={onChange} />);
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.length).toBeGreaterThanOrEqual(6); // d/m/y × start/end
    segments[0]!.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0]![0] as DateRange;
    expect(next.start.toString()).not.toBe(range.start.toString());
  });

  it("un preset fija el rango completo y cierra el popover", async () => {
    const onChange = vi.fn();
    render(<DateRangePicker timeZone="UTC" defaultValue={range} onChange={onChange} defaultOpen />);
    await userEvent.click(screen.getByRole("button", { name: /last 7 days/i }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0]![0] as DateRange;
    // 7 días inclusivos: start = end - 6
    expect(picked.end.subtract({ days: 6 }).toString()).toBe(picked.start.toString());
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("presets={false} no renderiza el rail de rangos rápidos", () => {
    render(<DateRangePicker timeZone="UTC" defaultValue={range} presets={false} defaultOpen />);
    expect(screen.queryByText(/quick ranges/i)).toBeNull();
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("errorMessage marca el grupo como inválido y muestra el mensaje", () => {
    render(<DateRangePicker timeZone="UTC" defaultValue={range} errorMessage="Range too wide" />);
    expect(screen.getByText("Range too wide")).toBeDefined();
    expect(screen.getByRole("group").getAttribute("data-invalid")).toBe("true");
  });

  it("sin violaciones de accesibilidad (axe) — cerrado y abierto", async () => {
    const { container, unmount } = render(<DateRangePicker timeZone="UTC" defaultValue={range} />);
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    // abierto, el popover se portalea a body — auditamos el documento entero,
    // con el picker dentro de un landmark como en una página real
    render(
      <main>
        <DateRangePicker timeZone="UTC" defaultValue={range} defaultOpen />
      </main>,
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
