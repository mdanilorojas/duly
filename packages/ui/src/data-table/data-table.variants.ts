import { cva } from "class-variance-authority";
import type { Tone, Density } from "../trace-log/trace-log.variants.js";

// Padding de celda por densidad — comfortable/compact estilo Spectrum para tablas ops.
export const cellPad = cva("px-3", {
  variants: { density: { comfortable: "py-2.5", compact: "py-1.5" } },
  defaultVariants: { density: "comfortable" },
});

// Alto estimado de fila por densidad — insumo del virtualizador (@tanstack/react-virtual).
export const ROW_HEIGHT: Record<Density, number> = { comfortable: 44, compact: 32 };

// Franja de tono opcional por fila (border-l-2). Reusa el vocabulario Tone del DS.
export const toneBorder: Record<Tone, string> = {
  info: "border-info",
  ok: "border-ok",
  review: "border-review",
  warn: "border-warn",
  block: "border-block",
};
