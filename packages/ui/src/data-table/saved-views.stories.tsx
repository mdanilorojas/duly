import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { DataTable, FilterBar, SavedViews, useDataTable, type ColumnDef } from "./index.js";
import type { Density } from "../trace-log/trace-log.variants.js";

const meta: Meta<typeof SavedViews> = {
  title: "DataTable/V001 Saved Views",
  component: SavedViews,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

interface Lead {
  id: string;
  account: string;
  stage: string;
}
const data: Lead[] = Array.from({ length: 30 }, (_, i) => ({
  id: `L-${(i + 1).toString().padStart(3, "0")}`,
  account: ["Acme", "Globex", "Initech", "Umbrella"][i % 4],
  stage: ["Discovery", "Proposal", "Negotiation", "Closed"][i % 4],
}));
const columns: ColumnDef<Lead>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "account", header: "Account" },
  { accessorKey: "stage", header: "Stage" },
];

// Toolbar completa: FilterBar + SavedViews sobre la misma instancia. Guarda el
// estado de filtros/sorting/density y reaplícalo con un chip (autoservicio).
export const FullToolbar: StoryObj = {
  render: () => {
    function Demo() {
      const [density, setDensity] = React.useState<Density>("comfortable");
      const table = useDataTable({ data, columns, getRowId: (r) => r.id });
      return (
        <DataTable
          table={table}
          caption="Leads — vista guardable"
          density={density}
          getRowId={(r: Lead) => r.id}
          toolbar={
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <FilterBar
                table={table}
                fields={[
                  { columnId: "account", kind: "select", label: "Account", options: [
                    { value: "Acme", label: "Acme" },
                    { value: "Globex", label: "Globex" },
                    { value: "Initech", label: "Initech" },
                    { value: "Umbrella", label: "Umbrella" },
                  ] },
                ]}
              />
              <SavedViews
                table={table}
                storageKey="sb-leads-demo"
                density={density}
                onApplyDensity={setDensity}
              />
            </div>
          }
        />
      );
    }
    return (
      <div className="min-h-screen bg-bg-base p-10">
        <div className="mx-auto max-w-[900px]">
          <Demo />
        </div>
      </div>
    );
  },
};
