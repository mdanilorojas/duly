import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../components/ui/badge.js";

const meta: Meta = {
  title: "Recetas/Consola ISO/Lista de brechas",
};
export default meta;

// Receta, no componente: filas de brecha priorizada por impacto en banda.
// Severidad con texto (crítica/normal), impacto en mono — composición pura.
const gaps = [
  { sev: "crítica", variant: "block" as const, text: "ACCESS-CONTROL sin evidencia operativa", impact: "+2 bandas" },
  { sev: "crítica", variant: "block" as const, text: "SUPPLIER: sin evaluación de proveedores", impact: "+1 banda" },
  { sev: "normal", variant: "warn" as const, text: "SoA incompleto (46 controles)", impact: "tope 5→6" },
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
            <Badge variant={g.variant} className="font-mono text-[0.62rem]">{g.sev}</Badge>
            <span className="text-ink">{g.text}</span>
            <span className="font-mono text-[0.74rem] text-ok">{g.impact}</span>
          </li>
        ))}
      </ul>
    </div>
  ),
};
