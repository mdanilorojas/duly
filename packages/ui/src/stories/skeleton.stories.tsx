import React from "react";
import type { StoryObj } from "@storybook/react";
import { Skeleton } from "../components/ui/skeleton.js";

const meta = { title: "Feedback/Skeleton" };
export default meta;
type S = StoryObj<typeof meta>;

export const Card: S = {
  render: () => (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface-2 w-full max-w-72">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  ),
};

export const List: S = {
  render: () => (
    <div className="flex flex-col gap-3 w-full max-w-72">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
          <Skeleton className="size-8 rounded-md shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  ),
};
