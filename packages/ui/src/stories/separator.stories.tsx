import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "../components/ui/separator.js";

const meta: Meta<typeof Separator> = {
  title: "Layout/Separator",
  component: Separator,
};
export default meta;
type S = StoryObj<typeof Separator>;

export const Horizontal: S = {
  render: () => (
    <div className="max-w-sm">
      <div className="text-sm text-ink">Agent Pipeline</div>
      <Separator className="my-3" />
      <div className="text-sm text-faint">138 predios • 4 stages • 2.4s avg</div>
    </div>
  ),
};

export const Vertical: S = {
  render: () => (
    <div className="flex h-5 items-center gap-3 text-sm text-ink">
      <span>Pipeline</span>
      <Separator orientation="vertical" />
      <span>Agents</span>
      <Separator orientation="vertical" />
      <span>Logs</span>
    </div>
  ),
};

export const InNav: S = {
  render: () => (
    <div className="max-w-xs rounded-lg bg-surface-2 p-4">
      <p className="text-xs font-semibold text-dim uppercase tracking-wider mb-2">Workspace</p>
      <nav className="flex flex-col gap-1 text-sm text-ink">
        <a href="#" className="hover:text-accent px-2 py-1 rounded">Dashboard</a>
        <a href="#" className="hover:text-accent px-2 py-1 rounded">Agents</a>
      </nav>
      <Separator className="my-3" />
      <p className="text-xs font-semibold text-dim uppercase tracking-wider mb-2">Data</p>
      <nav className="flex flex-col gap-1 text-sm text-ink">
        <a href="#" className="hover:text-accent px-2 py-1 rounded">Predios</a>
        <a href="#" className="hover:text-accent px-2 py-1 rounded">Reports</a>
      </nav>
    </div>
  ),
};
