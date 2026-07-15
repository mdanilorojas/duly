import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../components/ui/badge.js";

const meta: Meta<typeof Badge> = {
  title: "Primitivas/Forms/Badge",
  component: Badge,
};
export default meta;
type S = StoryObj<typeof Badge>;

export const Variants: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

export const StatusBadges: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="text-ok border-ok/40">OK</Badge>
      <Badge variant="outline" className="text-review border-review/40">Review</Badge>
      <Badge variant="outline" className="text-warn border-warn/40">Warn</Badge>
      <Badge variant="outline" className="text-block border-block/40">Block</Badge>
      <Badge variant="outline" className="text-info border-info/40">Info</Badge>
    </div>
  ),
};

export const InContext: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-ink">
        Agent Pipeline <Badge variant="secondary">3 tasks</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-ink">
        EnRegla Sync <Badge variant="outline" className="text-ok border-ok/40">Passing</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-ink">
        Data Export <Badge variant="outline" className="text-warn border-warn/40">Pending</Badge>
      </div>
    </div>
  ),
};
