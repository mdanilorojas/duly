import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Zap } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card.js";
import { Button } from "../components/ui/button.js";
import { Badge } from "../components/ui/badge.js";

const meta: Meta<typeof Card> = {
  title: "Primitivas/Layout/Card",
  component: Card,
};
export default meta;
type S = StoryObj<typeof Card>;

export const Basic: S = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Agent Pipeline</CardTitle>
        <CardDescription>Automated property sync workflow</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-dim">
          Processes 138 predios through geocoding, validation, and enrichment stages.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full"><Zap /> Run Now</Button>
      </CardFooter>
    </Card>
  ),
};

export const AgentStatus: S = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ARCGIS Agent</CardTitle>
          <Badge variant="outline" className="text-ok border-ok/40">Active</Badge>
        </div>
        <CardDescription>Geocoding &amp; GeoJSON enrichment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-dim">Processed</p>
            <p className="text-xl font-semibold text-ink">1,248</p>
          </div>
          <div>
            <p className="text-dim">Errors</p>
            <p className="text-xl font-semibold text-block">3</p>
          </div>
          <div>
            <p className="text-dim">Avg latency</p>
            <p className="text-xl font-semibold text-ink">142ms</p>
          </div>
          <div>
            <p className="text-dim">Uptime</p>
            <p className="text-xl font-semibold text-ok">99.8%</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" className="flex-1">Logs</Button>
        <Button size="sm" className="flex-1">Configure</Button>
      </CardFooter>
    </Card>
  ),
};

export const Plain: S = {
  render: () => (
    <Card className="max-w-sm p-0">
      <CardContent className="p-6">
        <p className="text-sm text-ink">
          A minimal card with only content, no header or footer.
        </p>
      </CardContent>
    </Card>
  ),
};
