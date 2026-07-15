import React from "react";
import type { StoryObj } from "@storybook/react";
import { Switch } from "../components/ui/switch.js";
import { Label } from "../components/ui/label.js";

const meta = { title: "Primitivas/Forms/Switch" };
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {
  render: () => <Switch aria-label="Enable auto-retry" />,
};

export const Checked: S = {
  render: () => <Switch aria-label="Enable auto-retry" defaultChecked />,
};

export const Disabled: S = {
  render: () => <Switch aria-label="Enable auto-retry" disabled />,
};

export const WithLabel: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="auto-retry" aria-label="Enable auto-retry" defaultChecked />
      <Label htmlFor="auto-retry">Enable auto-retry</Label>
    </div>
  ),
};

export const AllStates: S = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="s1" aria-label="Off" />
        <Label htmlFor="s1">Off</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s2" aria-label="On" defaultChecked />
        <Label htmlFor="s2">On</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s3" aria-label="Disabled off" disabled />
        <Label htmlFor="s3" className="text-faint">Disabled off</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s4" aria-label="Disabled on" disabled defaultChecked />
        <Label htmlFor="s4" className="text-faint">Disabled on</Label>
      </div>
    </div>
  ),
};
