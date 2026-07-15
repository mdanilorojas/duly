import React from "react";
import type { StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet.js";
import { Button } from "../components/ui/button.js";
import { Switch } from "../components/ui/switch.js";
import { Label } from "../components/ui/label.js";

const meta = { title: "Primitivas/Superpuestos/Sheet" };
export default meta;
type S = StoryObj<typeof meta>;

export const AgentSettings: S = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Agent settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Agent settings</SheetTitle>
          <SheetDescription>
            Configure runtime behaviour for this agent.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 mt-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-retry">Auto-retry on failure</Label>
            <Switch id="auto-retry" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="verbose">Verbose logging</Label>
            <Switch id="verbose" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notify">Email notifications</Label>
            <Switch id="notify" defaultChecked />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const FromLeft: S = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open left</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Quick access to all agents.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
