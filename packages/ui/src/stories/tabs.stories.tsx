import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs.js";

const meta = { title: "Display/Tabs" };
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {
  render: () => (
    <Tabs defaultValue="overview" className="w-80">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-faint pt-2">
          Agent processed 138 records in 4.2s with 0 errors.
        </p>
      </TabsContent>
      <TabsContent value="logs">
        <p className="text-sm text-faint pt-2">
          No errors logged in the last 24 hours.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-faint pt-2">
          Configure retry policy and notification targets.
        </p>
      </TabsContent>
    </Tabs>
  ),
};
