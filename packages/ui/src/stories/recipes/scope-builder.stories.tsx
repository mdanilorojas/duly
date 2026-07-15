import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.js";
import { Checkbox } from "../../components/ui/checkbox.js";
import { Label } from "../../components/ui/label.js";
import { Input } from "../../components/ui/input.js";
import { Textarea } from "../../components/ui/textarea.js";
import { Button } from "../../components/ui/button.js";

const meta: Meta = {
  title: "Recipes/ISO Console/Scope Builder",
};
export default meta;

// Receta, no componente: definición del alcance del SGSI (evento #1 de la
// corrida: scope explícito → RunStarted) con primitivas de form existentes.
const units = ["Operaciones TI", "Recursos Humanos", "Finanzas", "Atención al cliente"];

export const AlcanceSgsi: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Definición del SGSI · alcance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="scope-name">Nombre del engagement</Label>
            <Input id="scope-name" defaultValue="Banco Andino · ronda 2" className="mt-1" />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-ink">Unidades incluidas</legend>
            <div className="mt-2 flex flex-col gap-2">
              {units.map((u) => (
                <div key={u} className="flex items-center gap-2">
                  <Checkbox id={`unit-${u}`} defaultChecked={u !== "Finanzas"} />
                  <Label htmlFor={`unit-${u}`}>{u}</Label>
                </div>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="scope-notes">Exclusiones y justificación</Label>
            <Textarea id="scope-notes" className="mt-1" defaultValue="Finanzas queda fuera: tercerizada, cubierta por SOC 2 del proveedor." />
          </div>
          <Button className="self-start">Iniciar corrida (RunStarted)</Button>
        </CardContent>
      </Card>
    </div>
  ),
};
