import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Zap, ArrowRight, Trash2, Plus } from "lucide-react";
import { Button } from "../components/ui/button.js";

const meta: Meta<typeof Button> = {
  title: "Primitivas/Forms/Button",
  component: Button,
};
export default meta;
type S = StoryObj<typeof Button>;

export const Variants: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcons: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button><Zap /> Run Agent</Button>
      <Button variant="outline"><Plus /> New Task</Button>
      <Button variant="destructive"><Trash2 /> Delete</Button>
      <Button variant="ghost">Continue <ArrowRight /></Button>
      <Button size="icon" aria-label="Add"><Plus /></Button>
      <Button size="icon-sm" aria-label="Zap"><Zap /></Button>
      <Button size="icon-xs" variant="outline" aria-label="Add"><Plus /></Button>
    </div>
  ),
};

export const Disabled: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button disabled>Default</Button>
      <Button variant="destructive" disabled>Destructive</Button>
      <Button variant="outline" disabled>Outline</Button>
      <Button variant="secondary" disabled>Secondary</Button>
    </div>
  ),
};
