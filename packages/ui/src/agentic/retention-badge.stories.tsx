import type { Meta, StoryObj } from "@storybook/react";
import { RetentionBadge, ImmutabilityIndicator, type RetentionRecord } from "./retention-badge.js";

const meta: Meta<typeof ImmutabilityIndicator> = {
  title: "Agentic/Retention Badge/V001 WORM & Immutability",
  component: ImmutabilityIndicator,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof ImmutabilityIndicator>;

// Servicios financieros: registro de auditoría todavía dentro de la ventana
// mínima de retención del EU AI Act Art. 19 (180 días) — protegido, WORM,
// no puede purgarse aunque se solicite.
const protectedRecord: RetentionRecord = {
  recordId: "aud-88213",
  regime: "worm",
  status: "protected",
  retainedSince: "Jan 3, 2026",
  minRetentionLabel: "180 days minimum",
  legalBasis: "EU AI Act Art. 19 · financial services internal policy (2yr)",
  eligibleLabel: "Jul 2, 2026 (Art. 19 minimum) · policy hold until Jan 3, 2028",
  progressPct: 62,
  hash: "sha256:9f21ab0e",
};

export const ProtectedWithinWindow: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto flex max-w-sm flex-col gap-4">
        <RetentionBadge record={protectedRecord} />
        <ImmutabilityIndicator record={protectedRecord} defaultOpen />
      </div>
    </div>
  ),
};

// Software/tech: el mínimo legal ya se cumplió — elegible para purga bajo
// la política de retención de datos, pero eso es una acción disponible, no
// un fallo (tono warn, no block).
const eligibleRecord: RetentionRecord = {
  recordId: "aud-51042",
  regime: "worm",
  status: "eligible-for-deletion",
  retainedSince: "Nov 20, 2025",
  minRetentionLabel: "180 days minimum",
  legalBasis: "SOC2 CC7.2 internal audit trail policy",
  eligibleLabel: "May 19, 2026 — minimum window already elapsed",
  hash: "sha256:44c8e7d0",
};

export const EligibleForDeletion: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto flex max-w-sm flex-col gap-4">
        <RetentionBadge record={eligibleRecord} />
        <ImmutabilityIndicator record={eligibleRecord} defaultOpen />
      </div>
    </div>
  ),
};

// Salud: expediente bajo litigio — retención indefinida que pesa por
// encima de cualquier ventana mínima o política de purga automática.
const legalHoldRecord: RetentionRecord = {
  recordId: "aud-30291",
  regime: "legal-hold",
  status: "hold",
  retainedSince: "Feb 11, 2025",
  minRetentionLabel: "180 days minimum",
  legalBasis: "Active litigation hold — Case No. 26-CV-4471, do not purge",
  hash: "sha256:b710f2aa",
};

export const LegalHoldIndefinite: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto flex max-w-sm flex-col gap-4">
        <RetentionBadge record={legalHoldRecord} />
        <ImmutabilityIndicator record={legalHoldRecord} defaultOpen />
      </div>
    </div>
  ),
};

// Fila de badges compactos junto a otros metadatos — el caso de uso real es
// AuditLogTable/EvidenceExportDialog mostrando el estado de retención de un
// registro sin necesitar el panel expandible completo por fila.
export const CompactBadgeRow: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-4 py-3">
        <span className="mr-1 font-mono text-[10.5px] font-bold uppercase tracking-wide text-dim">
          Audit log · retention
        </span>
        <RetentionBadge record={protectedRecord} />
        <RetentionBadge record={eligibleRecord} />
        <RetentionBadge record={legalHoldRecord} />
      </div>
    </div>
  ),
};
