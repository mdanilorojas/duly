import React from "react";
import type { StoryObj } from "@storybook/react";
import { Textarea } from "../components/ui/textarea.js";

const meta = { title: "Primitivas/Forms/Textarea" };
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {
  render: () => <Textarea className="w-full max-w-80" placeholder="Describe the agent task..." />,
};

export const Disabled: S = {
  render: () => (
    <Textarea
      className="w-full max-w-80"
      placeholder="Describe the agent task..."
      disabled
      defaultValue="Pipeline processing paused."
    />
  ),
};

export const Error: S = {
  render: () => (
    <Textarea
      className="w-full max-w-80"
      placeholder="Describe the agent task..."
      aria-invalid
      defaultValue="Invalid JSON payload"
    />
  ),
};
