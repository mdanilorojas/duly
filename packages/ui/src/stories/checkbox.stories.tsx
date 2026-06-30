import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "../components/ui/checkbox.js";
import { Label } from "../components/ui/label.js";

const meta = { title: "Primitives/Checkbox" };
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {
  render: () => <Checkbox />,
};

export const Checked: S = {
  render: () => <Checkbox defaultChecked />,
};

export const Disabled: S = {
  render: () => <Checkbox disabled />,
};

export const WithLabel: S = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="notify" defaultChecked />
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
          <Checkbox id={id} defaultChecked={checked} />
          <Label htmlFor={id}>{label}</Label>
        </div>
      ))}
    </div>
  ),
};
