import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";

const meta: Meta<typeof Input> = {
  title: "Primitivas/Forms/Input",
  component: Input,
};
export default meta;
type S = StoryObj<typeof Input>;

export const Default: S = {
  render: () => <Input placeholder="Search agents..." />,
};

export const WithLabel: S = {
  render: () => (
    <div className="flex flex-col gap-1.5 max-w-xs">
      <Label htmlFor="predio-id">Predio ID</Label>
      <Input id="predio-id" placeholder="e.g. 001-0023-000-0000" />
    </div>
  ),
};

export const States: S = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-xs">
      <Input placeholder="Default" aria-label="Default" />
      <Input placeholder="Disabled" aria-label="Disabled" disabled />
      <Input defaultValue="Read only" aria-label="Read only" readOnly />
      <div className="flex flex-col gap-1.5">
        <Input
          aria-label="Email"
          aria-invalid="true"
          defaultValue="invalid@"
          aria-describedby="email-err"
        />
        <p id="email-err" className="text-xs text-block">Invalid email format</p>
      </div>
    </div>
  ),
};

export const Types: S = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-xs">
      <Input type="text" placeholder="Text" />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="Number" />
      <Input type="search" placeholder="Search" />
    </div>
  ),
};
