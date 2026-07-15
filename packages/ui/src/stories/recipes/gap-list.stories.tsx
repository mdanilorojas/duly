import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Recipes/ISO Console/Gap List",
};
export default meta;

// Receta, no componente: filas de brecha priorizada por impacto en banda.
// Severidad con texto (crítica/normal), impacto en mono — composición pura.
const gaps = [
  { sev: "crítica", tone: "text-block border-block/40 bg-block/10", text: "ACCESS-CONTROL sin evidencia operativa", impact: "+2 bandas" },
  { sev: "crítica", tone: "text-block border-block/40 bg-block/10", text: "SUPPLIER: sin evaluación de proveedores", impact: "+1 banda" },
  { sev: "normal", tone: "text-warn border-warn/40 bg-warn/10", text: "SoA incompleto (46 controles)", impact: "tope 5→6" },
];

export const PriorizadaPorImpacto: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <ul className="flex max-w-xl flex-col gap-2">
        {gaps.map((g) => (
          <li
            key={g.text}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-sm"
          >
            <span className={`rounded-full border px-2 py-px font-mono text-[0.62rem] ${g.tone}`}>{g.sev}</span>
            <span className="text-ink">{g.text}</span>
            <span className="font-mono text-[0.74rem] text-ok">{g.impact}</span>
          </li>
        ))}
      </ul>
    </div>
  ),
};
