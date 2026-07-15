import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert.js";

const meta: Meta<typeof Alert> = {
  title: "Primitivas/Retroalimentación/Alert",
  component: Alert,
};
export default meta;
type S = StoryObj<typeof Alert>;

export const Default: S = {
  render: () => (
    <Alert>
      <Info />
      <AlertTitle>Pipeline scheduled</AlertTitle>
      <AlertDescription>
        The ARCGIS sync will run at 03:00 AM. 138 predios queued.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: S = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Validation failed</AlertTitle>
      <AlertDescription>
        3 predios failed geocoding. Check the error log for details.
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: S = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-md">
      <Alert>
        <Info className="text-info" />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Agent pipeline is processing 138 records.</AlertDescription>
      </Alert>
      <Alert>
        <CheckCircle className="text-ok" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>All records synchronized successfully.</AlertDescription>
      </Alert>
      <Alert>
        <AlertTriangle className="text-warn" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>3 records have missing geometry data.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>ARCGIS API returned 503. Retrying in 30s.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const WithoutIcon: S = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        You can use the alert component without an icon.
      </AlertDescription>
    </Alert>
  ),
};
