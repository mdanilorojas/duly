"use client";

import * as React from "react";
import {
  DateRangePicker as AriaDateRangePicker,
  Label as AriaLabel,
  Group as AriaGroup,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  Button as AriaButton,
  Popover as AriaPopover,
  Dialog as AriaDialog,
  RangeCalendar as AriaRangeCalendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
  Heading as AriaHeading,
  Text as AriaText,
} from "react-aria-components";
import { today, type DateValue } from "@internationalized/date";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy, useLocale } from "@/lib/copy/index.js";

/**
 * DateRangePicker — cierra el gap ❌ "DateRangePicker + timezone" del área D
 * (table stakes) del NORTH_STAR. Construido sobre `react-aria-components`
 * (la dependencia ya decidida en el spec del ladder por su a11y de fechas:
 * segmentos spinbutton editables por teclado, calendario navegable, i18n).
 *
 * Decisiones de diseño:
 * - **La zona horaria siempre es visible** (chip junto al rango): en una
 *   consola de auditoría, "¿las 09:00 de quién?" es una pregunta de
 *   compliance, no un detalle. El chip muestra el offset (GMT-5) con el
 *   nombre IANA como title, o un `timeZoneLabel` editorial.
 * - **Presets rápidos** (últimos 7/30 días, mes/trimestre a la fecha) en el
 *   popover — el insumo típico de una saved query del principio #10 ("el
 *   auditor se autoservicia").
 * - Calendario dual (2 meses) para rangos largos, temado 100% con tokens.
 */
export interface DateRange {
  start: DateValue;
  end: DateValue;
}

export interface DateRangePreset {
  id: string;
  label: string;
  range: DateRange;
}

export interface DateRangePickerProps {
  /** Etiqueta visible. Default: copy `dateRangePicker.label`. */
  label?: string;
  /** Texto de ayuda bajo el control. */
  description?: string;
  /** Mensaje de error — activa `isInvalid` en el grupo. */
  errorMessage?: string;
  /** Zona horaria IANA (obligatoria: siempre visible junto al rango). */
  timeZone: string;
  /** Override editorial del chip, ej. "Hora de planta (Quito)". */
  timeZoneLabel?: string;
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (range: DateRange | null) => void;
  /**
   * Presets del popover. Omitido → set estándar (7/30 días, mes/trimestre a
   * la fecha) calculado en `timeZone`. `false` → sin presets.
   */
  presets?: DateRangePreset[] | false;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDisabled?: boolean;
  /** Popover abierto de entrada (stories/tests). */
  defaultOpen?: boolean;
  className?: string;
}

/** Offset legible ("GMT-5") de una zona IANA — fallback al nombre si Intl falla. */
function tzOffsetLabel(timeZone: string, locale: string): string {
  try {
    const parts = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "shortOffset" }).formatToParts(
      new Date(),
    );
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

function useDefaultPresets(timeZone: string): DateRangePreset[] {
  const copy = useCopy();
  return React.useMemo(() => {
    const now = today(timeZone);
    const quarterStartMonth = Math.floor((now.month - 1) / 3) * 3 + 1;
    return [
      { id: "last7", label: copy.dateRangePicker.presets.last7, range: { start: now.subtract({ days: 6 }), end: now } },
      { id: "last30", label: copy.dateRangePicker.presets.last30, range: { start: now.subtract({ days: 29 }), end: now } },
      { id: "mtd", label: copy.dateRangePicker.presets.monthToDate, range: { start: now.set({ day: 1 }), end: now } },
      {
        id: "qtd",
        label: copy.dateRangePicker.presets.quarterToDate,
        range: { start: now.set({ month: quarterStartMonth, day: 1 }), end: now },
      },
    ];
  }, [timeZone, copy]);
}

const segmentClass = cn(
  "rounded-sm px-0.5 text-sm text-ink caret-transparent outline-none tabular-nums",
  "data-[placeholder]:text-faint",
  "focus:bg-accent focus:text-on-accent data-[placeholder]:focus:text-on-accent",
);

function RangeDateInput({ slot }: { slot: "start" | "end" }) {
  return (
    <AriaDateInput slot={slot} className="flex items-center">
      {(segment) => <AriaDateSegment segment={segment} className={segmentClass} />}
    </AriaDateInput>
  );
}

const calendarCellClass = cn(
  "flex size-8 items-center justify-center rounded-md text-sm text-dim outline-none",
  "data-[hovered]:bg-surface-2 data-[hovered]:text-ink",
  "data-[selected]:rounded-none data-[selected]:bg-accent-surface data-[selected]:text-ink",
  "data-[selection-start]:rounded-md data-[selection-start]:bg-accent data-[selection-start]:text-on-accent",
  "data-[selection-end]:rounded-md data-[selection-end]:bg-accent data-[selection-end]:text-on-accent",
  "data-[disabled]:opacity-40 data-[unavailable]:line-through data-[outside-month]:hidden",
  "data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-ring",
);

function CalendarMonthGrid({ offset }: { offset?: { months: number } }) {
  return (
    <CalendarGrid offset={offset} weekdayStyle="short" className="border-separate border-spacing-0.5">
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell className="size-8 text-[11px] font-semibold text-faint">{day}</CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>{(date) => <CalendarCell date={date} className={calendarCellClass} />}</CalendarGridBody>
    </CalendarGrid>
  );
}

const navButtonClass = cn(
  "flex size-7 items-center justify-center rounded-md text-dim outline-none",
  "data-[hovered]:bg-surface-2 data-[hovered]:text-ink data-[disabled]:opacity-40",
  "data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-ring",
);

export function DateRangePicker({
  label,
  description,
  errorMessage,
  timeZone,
  timeZoneLabel,
  value,
  defaultValue,
  onChange,
  presets,
  minValue,
  maxValue,
  isDisabled,
  defaultOpen = false,
  className,
}: DateRangePickerProps) {
  const copy = useCopy();
  const { locale } = useLocale();
  const defaultPresets = useDefaultPresets(timeZone);
  const presetList = presets === false ? [] : presets ?? defaultPresets;

  // Controlado-o-no: los presets necesitan poder fijar el valor y cerrar el
  // popover sin obligar al consumidor a controlar el estado.
  const [internal, setInternal] = React.useState<DateRange | null>(defaultValue ?? null);
  const current = value !== undefined ? value : internal;
  const [open, setOpen] = React.useState(defaultOpen);

  const commit = (range: DateRange | null) => {
    setInternal(range);
    onChange?.(range);
  };

  const tzChip = timeZoneLabel ?? tzOffsetLabel(timeZone, locale);

  return (
    <AriaDateRangePicker
      value={current}
      onChange={commit}
      minValue={minValue}
      maxValue={maxValue}
      isDisabled={isDisabled}
      isInvalid={errorMessage ? true : undefined}
      isOpen={open}
      onOpenChange={setOpen}
      className={cn("flex w-fit flex-col gap-1.5", className)}
    >
      <AriaLabel className="text-sm font-medium text-ink">{label ?? copy.dateRangePicker.label}</AriaLabel>

      <AriaGroup
        className={cn(
          "flex h-9 w-fit items-center gap-1 rounded-md border border-border-subtle bg-surface-2 ps-2.5 pe-1",
          "data-[focus-within]:border-ring data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/40",
          "data-[invalid]:border-block data-[invalid]:ring-block/20",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        )}
      >
        <RangeDateInput slot="start" />
        <span aria-hidden className="px-0.5 text-faint">
          –
        </span>
        <RangeDateInput slot="end" />

        {/* Principio de diseño: la zona horaria SIEMPRE visible junto al rango. */}
        <span
          title={timeZone}
          className="ms-1.5 shrink-0 rounded-full border border-border-subtle bg-bg-base px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wide text-faint uppercase"
        >
          {tzChip}
          <span className="sr-only">{copy.dateRangePicker.timezoneNote(timeZone)}</span>
        </span>

        <AriaButton
          aria-label={copy.dateRangePicker.openCalendar}
          className={cn(
            "ms-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-dim outline-none",
            "data-[hovered]:bg-surface-3 data-[hovered]:text-ink",
            "data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-ring",
          )}
        >
          <CalendarDays aria-hidden className="size-4" />
        </AriaButton>
      </AriaGroup>

      {description && !errorMessage && (
        <AriaText slot="description" className="text-xs text-faint">
          {description}
        </AriaText>
      )}
      {errorMessage && (
        <AriaText slot="errorMessage" className="text-xs text-block">
          {errorMessage}
        </AriaText>
      )}

      <AriaPopover
        placement="bottom start"
        className={cn(
          "rounded-lg border border-border-subtle bg-bg-elevated shadow-lg shadow-black/30",
          "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
          "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
        )}
      >
        <AriaDialog className="flex outline-none max-sm:flex-col">
          {presetList.length > 0 && (
            <div className="flex flex-col gap-0.5 border-e border-border-subtle p-2 max-sm:border-e-0 max-sm:border-b">
              <div className="px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-wide text-faint uppercase">
                {copy.dateRangePicker.presets.label}
              </div>
              {presetList.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    commit(preset.range);
                    setOpen(false);
                  }}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-start text-sm text-dim outline-none",
                    "hover:bg-surface-2 hover:text-ink focus-visible:ring-[3px] focus-visible:ring-ring",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <AriaRangeCalendar visibleDuration={{ months: 2 }} className="p-3">
            <header className="mb-2 flex items-center justify-between gap-2">
              <AriaButton slot="previous" className={navButtonClass}>
                <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
              </AriaButton>
              <AriaHeading className="text-sm font-semibold text-ink" />
              <AriaButton slot="next" className={navButtonClass}>
                <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
              </AriaButton>
            </header>
            <div className="flex gap-6 max-sm:flex-col max-sm:gap-3">
              <CalendarMonthGrid />
              <CalendarMonthGrid offset={{ months: 1 }} />
            </div>
          </AriaRangeCalendar>
        </AriaDialog>
      </AriaPopover>
    </AriaDateRangePicker>
  );
}
