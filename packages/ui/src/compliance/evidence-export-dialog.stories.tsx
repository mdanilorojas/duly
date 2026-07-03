import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { EvidenceExportDialog, type ExportFormat, type ExportResult } from "./evidence-export-dialog.js";
import { Button } from "@/components/ui/button.js";

const meta: Meta<typeof EvidenceExportDialog> = {
  title: "Compliance/V001 Evidence Export Dialog",
  component: EvidenceExportDialog,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

// Export simulado: resuelve tras ~900ms con un hash de manifiesto determinista.
function fakeExport(format: ExportFormat): Promise<ExportResult> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ manifestHash: `sha256:${format}9f8c2a41b0d3` }), 900),
  );
}

export const Trigger: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Exportar evidencia…</Button>
          <EvidenceExportDialog
            open={open}
            onOpenChange={setOpen}
            range="1–30 jun 2026"
            recordCount={342}
            onExport={fakeExport}
          />
        </>
      );
    }
    return (
      <div className="grid min-h-screen place-items-center bg-bg-base p-10">
        <Demo />
      </div>
    );
  },
};
