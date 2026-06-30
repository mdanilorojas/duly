import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "../components/ui/switch.js";
import { Label } from "../components/ui/label.js";

const meta = { title: "Primitives/Switch" };
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {
  render: () => <Switch />,
};

export const Checked: S = {
  render: () => <Switch defaultChecked />,
};

export const Disabled: S = {
  render: () => <Switch disabled />,
};

export const WithLabel: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="auto-retry" defaultChecked />
      <Label htmlFor="auto-retry">Enable auto-retry</Label>
    </div>
  ),
};

export const AllStates: S = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="s1" />
        <Label htmlFor="s1">Off</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s2" defaultChecked />
        <Label htmlFor="s2">On</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s3" disabled />
        <Label htmlFor="s3" className="text-faint">Disabled off</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s4" disabled defaultChecked />
        <Label htmlFor="s4" className="text-faint">Disabled on</Label>
      </div>
    </div>
  ),
};
