import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { AutonomyModeSwitch, type AutonomyLevel } from "./autonomy-mode-switch.js";

const meta: Meta<typeof AutonomyModeSwitch> = {
  title: "Industrial/V001 Autonomy Mode Switch",
  component: AutonomyModeSwitch,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

export const Interactive: StoryObj = {
  render: () => {
    function Demo() {
      const [level, setLevel] = React.useState<AutonomyLevel>("advisory");
      return (
        <div className="flex flex-col gap-4">
          <AutonomyModeSwitch value={level} onChange={setLevel} disabledAbove="supervised" />
          <p className="font-mono text-[12px] text-dim">
            Nivel activo: <span className="text-accent">{level}</span> · tope: supervised
          </p>
        </div>
      );
    }
    return (
      <div className="grid min-h-screen place-items-center bg-bg-base p-10">
        <Demo />
      </div>
    );
  },
};
