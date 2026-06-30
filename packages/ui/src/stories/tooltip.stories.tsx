import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Info, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../components/ui/tooltip.js";
import { Button } from "../components/ui/button.js";

const meta: Meta<typeof Tooltip> = {
  title: "Display/Tooltip",
  component: Tooltip,
};
export default meta;
type S = StoryObj<typeof Tooltip>;

export const Default: S = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Run the agent pipeline</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const OnIcon: S = {
  render: () => (
    <TooltipProvider>
      <div className="flex items-center gap-2 text-sm text-ink">
        Pipeline status
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-faint hover:text-ink transition-colors" aria-label="More info">
              <Info size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Shows the last 7 days of pipeline runs</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const Placements: S = {
  render: () => (
    <TooltipProvider>
      <div className="flex flex-wrap items-center justify-center gap-4 p-16">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">{side}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
              <p>Tooltip on the {side}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};

export const WithDelay: S = {
  render: () => (
    <TooltipProvider delayDuration={800}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" aria-label="Run"><Zap /></Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>800ms delay</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
