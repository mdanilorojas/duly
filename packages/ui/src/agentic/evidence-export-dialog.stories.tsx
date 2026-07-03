import type { Meta, StoryObj } from "@storybook/react";
import { EvidenceExportDialog } from "./evidence-export-dialog.js";

const meta: Meta<typeof EvidenceExportDialog> = {
  title: "Agentic/Evidence Export/V001 Signed Manifest",
  component: EvidenceExportDialog,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof EvidenceExportDialog>;

const Q2_DISBURSEMENT_HASHES = [
  "a3f9c1e2b7d4",
  "f10e2a9c44b1",
  "7c2d8e91a05f",
  "9b4f6d13e872",
  "0af38c7d1e29",
  "5e1a9f402cb6",
  "d827b1f6a3c0",
  "68f0c92e1a7d",
];

export const FinancialServicesQuarterlyExport: S = {
  name: "Financial services — quarterly export",
  render: () => (
    <div className="flex min-h-screen items-start justify-center bg-bg-base p-12">
      <div className="max-w-[560px] space-y-4">
        <p className="font-mono text-[11px] leading-relaxed text-faint">
          Click &ldquo;Export evidence&rdquo; to open the dialog — elige formato, revisa el
          manifiesto de hashes incluidos, y confirma para ver el hash del manifiesto firmado
          (principio #4 del NORTH_STAR: la inmutabilidad se ve, no es una caja negra).
        </p>
        <EvidenceExportDialog
          rangeLabel="Apr 1 – Jun 30, 2026 · All actors · Wire transfers"
          eventCount={128}
          manifestHashes={Q2_DISBURSEMENT_HASHES}
          signedBy="Maria Chen (Compliance Lead)"
        />
      </div>
    </div>
  ),
};

export const HealthcareAuditExport: S = {
  name: "Healthcare — HIPAA access log export",
  render: () => (
    <div className="flex min-h-screen items-start justify-center bg-bg-base p-12">
      <div className="max-w-[560px] space-y-4">
        <EvidenceExportDialog
          title="Export access log"
          rangeLabel="Jun 1 – Jun 30, 2026 · PHI access events only"
          eventCount={412}
          manifestHashes={["c41a7e0f9b52", "2f8d0a6c31e9", "68f0c92e1a7d"]}
          signedBy="Dr. Alan Reyes (Privacy Officer)"
          defaultFormat="json"
        />
      </div>
    </div>
  ),
};

export const EmptyRange: S = {
  render: () => (
    <div className="flex min-h-screen items-start justify-center bg-bg-base p-12">
      <div className="max-w-[560px]">
        <EvidenceExportDialog
          rangeLabel="Jul 3, 2026 (today) · No matching events"
          eventCount={0}
          manifestHashes={[]}
          signedBy="Maria Chen (Compliance Lead)"
        />
      </div>
    </div>
  ),
};
