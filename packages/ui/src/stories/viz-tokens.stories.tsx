import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { CircleAlert, CircleCheck, OctagonX } from "lucide-react";
import { vizCat, vizSeq, vizCategorical, VIZ_CAT_SLOTS, VIZ_SEQ_STEPS } from "../lib/viz.js";

/**
 * Data-viz tokens (área D del NORTH_STAR): paleta categórica CVD-safe validada
 * por tema (≥3:1 sobre las superficies oscuras), rampa sequential con la hue
 * del accent, y alerta = status tokens. Los gates viven en
 * `packages/tokens/src/build.test.ts` — el color de un chart se computa, no se
 * elige a ojo.
 */
const meta: Meta = {
  title: "Fundamentos/Data-viz Tokens/V001 Categórico + secuencial",
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

type S = StoryObj;

const frame = (node: ReactNode) => (
  <div className="min-h-screen bg-bg-base p-10">
    <div className="mx-auto flex max-w-[880px] flex-col gap-6">{node}</div>
  </div>
);

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-2">
      <div className="border-b border-border-subtle bg-surface-header px-4 py-2.5">
        <span className="text-[11px] font-extrabold tracking-wide text-dim uppercase">{title}</span>
      </div>
      <div className="p-4">{children}</div>
      {note && <p className="border-t border-border-subtle px-4 py-2.5 text-xs text-faint">{note}</p>}
    </section>
  );
}

/** Los 8 slots en su orden fijo — el orden ES el mecanismo de seguridad CVD. */
export const Categorical: S = {
  render: () =>
    frame(
      <Section
        title="Categorical — 8 slots, orden fijo"
        note="Asignar por entidad en este orden, nunca ciclar ni repintar al filtrar. Formas all-pairs (scatter, heatmap categórico): cap de 4 series; después Other/facetas/labels directos. La serie 9 no existe."
      >
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {Array.from({ length: VIZ_CAT_SLOTS }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-16 w-full rounded-md" style={{ background: vizCat(i + 1) }} />
              <span className="font-mono text-[10px] text-faint">cat-{i + 1}</span>
            </div>
          ))}
        </div>
      </Section>,
    ),
};

/** Rampa de magnitud: una sola hue (la del accent del tema), L monotónica. */
export const Sequential: S = {
  render: () =>
    frame(
      <Section
        title="Sequential — hue del accent, lightness monotónica"
        note="Paso 1 recede hacia la superficie (cerca de cero); paso 7 es el más contrastado. Para rampas ordinales (etapas discretas) empezar en el paso 2+. Cambia el tema en la toolbar: la rampa sigue al accent (teal en cockpit/light, violeta en violet)."
      >
        <div className="flex overflow-hidden rounded-md">
          {Array.from({ length: VIZ_SEQ_STEPS }, (_, i) => (
            <div key={i} className="flex h-16 flex-1 items-end justify-center pb-1" style={{ background: vizSeq(i + 1) }}>
              <span className="font-mono text-[10px] text-ink mix-blend-difference">{i + 1}</span>
            </div>
          ))}
        </div>
      </Section>,
    ),
};

/** Alerta en charts = status tokens LOCKED, siempre con icono + label. */
export const Alert: S = {
  render: () =>
    frame(
      <Section
        title="Alert — status tokens, nunca un slot categórico"
        note="Un status jamás impersona una serie (gate ΔE en tokens: el rojo categórico se re-escalonó para no parecer `block`). Y un status nunca viaja solo: icono + label siempre."
      >
        <div className="flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok/15 px-2.5 py-1 text-xs font-medium text-ok">
            <CircleCheck aria-hidden className="size-3.5" /> Dentro de presupuesto
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/25 bg-warn/15 px-2.5 py-1 text-xs font-medium text-warn">
            <CircleAlert aria-hidden className="size-3.5" /> 75% del cap
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-block/25 bg-block/15 px-2.5 py-1 text-xs font-medium text-block">
            <OctagonX aria-hidden className="size-3.5" /> Cap excedido — auto-halt
          </span>
        </div>
      </Section>,
    ),
};

const SPEND = [
  { day: "Mon", parser: 12.4, pricing: 8.1, compliance: 5.2, retrieval: 3.9 },
  { day: "Tue", parser: 13.1, pricing: 9.4, compliance: 4.8, retrieval: 4.2 },
  { day: "Wed", parser: 11.8, pricing: 12.2, compliance: 5.9, retrieval: 3.7 },
  { day: "Thu", parser: 14.6, pricing: 10.8, compliance: 6.3, retrieval: 4.9 },
  { day: "Fri", parser: 15.2, pricing: 11.5, compliance: 5.1, retrieval: 5.4 },
  { day: "Sat", parser: 9.3, pricing: 6.2, compliance: 4.4, retrieval: 2.8 },
  { day: "Sun", parser: 8.7, pricing: 5.9, compliance: 4.1, retrieval: 2.5 },
];

const SERIES = [
  { key: "parser", label: "Parser fleet" },
  { key: "pricing", label: "Pricing fleet" },
  { key: "compliance", label: "Compliance fleet" },
  { key: "retrieval", label: "Retrieval fleet" },
];

/** Demo aplicada: 4 flotas de agentes, color por entidad en orden fijo. */
export const AppliedChart: S = {
  render: () => {
    const colors = vizCategorical(SERIES.length);
    return frame(
      <Section
        title="Aplicado — gasto diario por flota de agentes (USD)"
        note="Líneas de 2px, grid recesivo en border-subtle, texto siempre en tokens de tinta (nunca el color de la serie), leyenda presente. El color sigue a la entidad: filtrar una flota no repinta a las demás."
      >
        <div aria-hidden style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SPEND} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
              <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--faint)" tickLine={false} axisLine={{ stroke: "var(--border-default)" }} tick={{ fill: "var(--faint)", fontSize: 11 }} />
              <YAxis stroke="var(--faint)" tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
              {SERIES.map((s, i) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={colors[i]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Series">
          {SERIES.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5 text-xs text-dim">
              <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: colors[i] }} />
              {s.label}
            </li>
          ))}
        </ul>
        <div className="mt-3 overflow-x-auto rounded-md border border-border-subtle">
          <table className="w-full border-collapse text-left text-[12px]">
            <caption className="sr-only">Gasto diario por flota de agentes (USD)</caption>
            <thead>
              <tr className="border-b border-border-subtle">
                <th scope="col" className="px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide text-faint uppercase">Día</th>
                {SERIES.map((s) => (
                  <th key={s.key} scope="col" className="px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide text-faint uppercase">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {SPEND.map((row) => (
                <tr key={row.day}>
                  <td className="px-3 py-1.5 text-ink">{row.day}</td>
                  {SERIES.map((s) => (
                    <td key={s.key} className="px-3 py-1.5 text-dim tabular-nums">${row[s.key as keyof typeof row]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>,
    );
  },
};
