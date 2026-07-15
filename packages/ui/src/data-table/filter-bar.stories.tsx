import type { Meta, StoryObj } from "@storybook/react";
import { DataTable, FilterBar, useDataTable, type ColumnDef } from "./index.js";

const meta: Meta<typeof FilterBar> = {
  title: "Primitivas/DataTable/V001 FilterBar",
  component: FilterBar,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

interface Run {
  id: string;
  workflow: string;
  trigger: string;
}
const data: Run[] = Array.from({ length: 24 }, (_, i) => ({
  id: `run_${(i + 1).toString().padStart(3, "0")}`,
  workflow: ["Invoice sync", "Lead enrich", "OT alarm route", "KYC check"][i % 4],
  trigger: ["webhook", "schedule", "manual"][i % 3],
}));
const columns: ColumnDef<Run>[] = [
  { accessorKey: "id", header: "Run" },
  { accessorKey: "workflow", header: "Workflow" },
  { accessorKey: "trigger", header: "Trigger" },
];

// FilterBar + DataTable comparten una instancia vía useDataTable — el FilterBar
// escribe filtros de columna y la tabla re-renderiza filtrada.
export const InToolbar: StoryObj = {
  render: () => {
    function Demo() {
      const table = useDataTable({ data, columns, getRowId: (r) => r.id });
      return (
        <DataTable
          table={table}
          caption="Ejecuciones filtrables"
          getRowId={(r: Run) => r.id}
          toolbar={
            <FilterBar
              table={table}
              fields={[
                { columnId: "id", kind: "text", label: "Run" },
                {
                  columnId: "workflow",
                  kind: "select",
                  label: "Workflow",
                  options: [
                    { value: "Invoice sync", label: "Invoice sync" },
                    { value: "Lead enrich", label: "Lead enrich" },
                    { value: "OT alarm route", label: "OT alarm route" },
                    { value: "KYC check", label: "KYC check" },
                  ],
                },
                {
                  columnId: "trigger",
                  kind: "select",
                  label: "Trigger",
                  options: [
                    { value: "webhook", label: "webhook" },
                    { value: "schedule", label: "schedule" },
                    { value: "manual", label: "manual" },
                  ],
                },
              ]}
            />
          }
        />
      );
    }
    return (
      <div className="min-h-screen bg-bg-base p-10">
        <div className="mx-auto max-w-[820px]">
          <Demo />
        </div>
      </div>
    );
  },
};
