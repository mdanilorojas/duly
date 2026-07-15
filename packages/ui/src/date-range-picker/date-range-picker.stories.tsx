import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { CalendarDate } from "@internationalized/date";
import { DateRangePicker, type DateRange } from "./date-range-picker.js";

const meta: Meta<typeof DateRangePicker> = {
  title: "DateRangePicker/V001 Range + Timezone",
  component: DateRangePicker,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

type S = StoryObj<typeof DateRangePicker>;

const frame = (node: ReactNode) => (
  <div className="min-h-screen bg-bg-base p-10">
    <div className="mx-auto flex max-w-[720px] flex-col gap-8">{node}</div>
  </div>
);

const range: DateRange = {
  start: new CalendarDate(2026, 6, 1),
  end: new CalendarDate(2026, 6, 30),
};

/** Zona horaria SIEMPRE visible: offset calculado (GMT-5) con IANA en el title. */
export const Default: S = {
  render: () =>
    frame(
      <DateRangePicker
        timeZone="America/Guayaquil"
        defaultValue={range}
        description="Audit log window — used by evidence exports"
      />,
    ),
};

/** Label editorial del chip cuando el offset crudo no comunica ("hora de planta"). */
export const CustomTimezoneLabel: S = {
  render: () =>
    frame(
      <DateRangePicker
        label="Production window"
        timeZone="America/Mexico_City"
        timeZoneLabel="Planta MTY"
        defaultValue={range}
      />,
    ),
};

/** Popover abierto: presets rápidos (autoservicio del auditor) + calendario dual. */
export const OpenWithPresets: S = {
  render: () => frame(<DateRangePicker timeZone="UTC" defaultValue={range} defaultOpen />),
};

/** Sin presets (`presets={false}`) — solo calendario. */
export const NoPresets: S = {
  render: () => frame(<DateRangePicker timeZone="UTC" defaultValue={range} presets={false} defaultOpen />),
};

/** Estados: error de validación y disabled. */
export const States: S = {
  render: () =>
    frame(
      <>
        <DateRangePicker
          timeZone="UTC"
          defaultValue={range}
          errorMessage="Range exceeds the 90-day export limit."
        />
        <DateRangePicker timeZone="UTC" defaultValue={range} isDisabled />
      </>,
    ),
};

/** Controlado — el consumidor decide el estado (típico de una FilterBar). */
export const Controlled: S = {
  render: function ControlledStory() {
    const [value, setValue] = React.useState<DateRange | null>(range);
    return frame(
      <div className="flex flex-col gap-3">
        <DateRangePicker timeZone="America/Bogota" value={value} onChange={setValue} />
        <p className="text-xs text-faint">
          value: {value ? `${value.start.toString()} → ${value.end.toString()}` : "null"}
        </p>
      </div>,
    );
  },
};
