import { BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid, ResponsiveContainer } from "recharts";
import type { WaterfallBar } from "./waterfall-chart.js";

const toneColor: Record<string, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  block: "var(--block)",
  review: "var(--review)",
  info: "var(--info)",
};

function barColor(b: WaterfallBar): string {
  if (b.isTotal) return "var(--accent-secondary)";
  if (b.tone) return toneColor[b.tone] ?? "var(--info)";
  return (b.delta ?? 0) >= 0 ? "var(--ok)" : "var(--block)";
}

/**
 * Render de Recharts para `WaterfallChart` (diferido). Barras flotantes vía un
 * apilado: una base transparente + la altura visible. Colores desde tokens del
 * DS. El consumidor no necesita CSS extra (Recharts es SVG inline).
 */
export default function WaterfallRecharts({ bars }: { bars: WaterfallBar[]; valuePrefix?: string; valueSuffix?: string }) {
  const data = bars.map((b) => ({ name: b.label, base: b.base, height: b.height, _bar: b }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "var(--faint)", fontSize: 10 }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />
        <YAxis tick={{ fill: "var(--faint)", fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
        <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="height" stackId="w" radius={[2, 2, 0, 0]} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={barColor(d._bar)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
