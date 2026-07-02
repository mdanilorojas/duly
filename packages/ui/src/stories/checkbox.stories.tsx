import React from "react";
import type { StoryObj } from "@storybook/react";
import { Checkbox } from "../components/ui/checkbox.js";
import { Label } from "../components/ui/label.js";

const meta = { title: "Primitives/Checkbox" };
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {
  render: () => <Checkbox aria-label="Run preflight checks" />,
};

export const Checked: S = {
  render: () => <Checkbox aria-label="Run preflight checks" defaultChecked />,
};

export const Disabled: S = {
  render: () => <Checkbox aria-label="Run preflight checks" disabled />,
};

export const WithLabel: S = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="notify" aria-label="Notify on failure" defaultChecked />
      <Label htmlFor="notify">Notify on failure</Label>
    </div>
  ),
};

export const List: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        { id: "c1", label: "Run preflight checks", checked: true },
        { id: "c2", label: "Validate output schema", checked: true },
        { id: "c3", label: "Retry on timeout", checked: false },
        { id: "c4", label: "Log to audit trail", checked: false },
      ].map(({ id, label, checked }) => (
        <div key={id} className="flex items-center gap-2">
          <Checkbox id={id} aria-label={label} defaultChecked={checked} />
          <Label htmlFor={id}>{label}</Label>
        </div>
      ))}
    </div>
  ),
};
