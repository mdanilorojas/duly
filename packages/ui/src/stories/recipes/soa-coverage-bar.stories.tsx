import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "../../components/ui/progress.js";

const meta: Meta = {
  title: "Recipes/ISO Console/SoA Coverage Bar",
};
export default meta;

// Receta, no componente: Progress + labels cubre la cobertura de la
// Declaración de Aplicabilidad (X de 93 controles del Anexo A).
export const AnexoA: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="max-w-md rounded-lg border border-border-default bg-surface-2 p-4">
        <p className="font-mono text-[0.66rem] text-faint">Declaración de Aplicabilidad</p>
        <p className="mt-1 text-sm font-semibold text-ink">47 de 93 controles del Anexo A</p>
        <Progress value={(47 / 93) * 100} className="mt-2" />
        <p className="mt-2 text-xs text-dim">
          completa: <span className="text-block">no</span> — 46 controles sin decisión · soaComplete=false → tope banda 5
        </p>
      </div>
    </div>
  ),
};
