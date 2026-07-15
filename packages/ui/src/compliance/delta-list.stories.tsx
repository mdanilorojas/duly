import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DeltaList } from "./delta-list.js";

const meta: Meta<typeof DeltaList> = {
  title: "Compliance/Delta List/V001 Run Diff",
  component: DeltaList,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;
type S = StoryObj<typeof DeltaList>;

// diffRuns R1 → R2 de un engagement ISO 27001: el avance, medido.
export const RunDiff: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <DeltaList
        className="max-w-lg"
        entries={[
          { label: "ACCESS-CONTROL", before: { label: "missing", tone: "block" }, after: { label: "missing", tone: "block" } },
          { label: "BACKUP", before: { label: "missing", tone: "block" }, after: { label: "partial", tone: "warn" }, improved: true },
          { label: "TRAINING", before: { label: "weak", tone: "warn" }, after: { label: "strong", tone: "ok" }, improved: true },
        ]}
      />
    </div>
  ),
};
