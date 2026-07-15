import React from "react";
import type { StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group.js";
import { Label } from "../components/ui/label.js";

const meta = { title: "Primitivas/Forms/RadioGroup" };
export default meta;
type S = StoryObj<typeof meta>;

const priorities = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const Default: S = {
  render: () => (
    <RadioGroup defaultValue="high">
      {priorities.map(({ value, label }) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={`p-${value}`} aria-label={label} />
          <Label htmlFor={`p-${value}`}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};

export const Horizontal: S = {
  render: () => (
    <RadioGroup defaultValue="medium" className="flex flex-row flex-wrap gap-6">
      {priorities.map(({ value, label }) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={`h-${value}`} aria-label={label} />
          <Label htmlFor={`h-${value}`}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};
