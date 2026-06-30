import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "../components/ui/label.js";
import { Input } from "../components/ui/input.js";

const meta = { title: "Primitives/Label" };
export default meta;
type S = StoryObj<typeof meta>;

export const Standalone: S = {
  render: () => <Label>Agent name</Label>,
};

export const WithInput: S = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      <Label htmlFor="agent-name">Agent name</Label>
      <Input id="agent-name" placeholder="e.g. pipeline-runner" />
    </div>
  ),
};

export const Required: S = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      <Label htmlFor="api-key">
        API key <span className="text-block">*</span>
      </Label>
      <Input id="api-key" type="password" placeholder="sk-..." />
    </div>
  ),
};
