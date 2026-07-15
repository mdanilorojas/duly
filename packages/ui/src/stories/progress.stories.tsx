import React from "react";
import type { StoryObj } from "@storybook/react";
import { Progress } from "../components/ui/progress.js";

const meta = { title: "Primitivas/Retroalimentación/Progress" };
export default meta;
type S = StoryObj<typeof meta>;

export const Steps: S = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-72">
      {[0, 25, 50, 75, 100].map((v) => (
        <div key={v} className="flex flex-col gap-1">
          <span className="text-xs text-faint">{v}%</span>
          <Progress value={v} aria-label={`${v}% complete`} />
        </div>
      ))}
    </div>
  ),
};

export const Processing: S = {
  render: () => (
    <div className="flex flex-col gap-2 w-full max-w-72">
      <div className="flex justify-between text-xs text-faint">
        <span>Processing records…</span>
        <span>33%</span>
      </div>
      <Progress value={33} aria-label="Processing records" />
    </div>
  ),
};
