import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Stepper } from "../components/ui/stepper.js";

const meta: Meta<typeof Stepper> = {
  title: "Primitivas/Forms/Stepper",
  component: Stepper,
};
export default meta;
type S = StoryObj<typeof Stepper>;

// Las 9 etapas del ciclo de readiness ISO 27001 — el caso que motivó el
// componente: el consultor siempre sabe en qué punto del ciclo está.
const isoSteps = [
  { label: "Acumulación", state: "done" as const },
  { label: "Recopilación", state: "done" as const },
  { label: "Alcance", state: "done" as const },
  { label: "Inventario", state: "done" as const },
  { label: "1ª Revisión", state: "current" as const },
  { label: "Feedback", state: "pending" as const },
  { label: "Gate HITL", state: "pending" as const },
  { label: "Remediación", state: "pending" as const },
  { label: "2ª Revisión", state: "pending" as const },
];

export const IsoReadinessCycle: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <Stepper steps={isoSteps} onStepClick={(i) => console.log("goto", i)} />
    </div>
  ),
};
