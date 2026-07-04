import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CredentialCard, CredentialPicker, type Credential } from "./credential-card.js";

const meta: Meta<typeof CredentialCard> = {
  title: "Agentic/Credential Card/V001 Type Owner Health",
  component: CredentialCard,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof CredentialCard>;

const FINANCIAL_CREDENTIALS: Credential[] = [
  {
    id: "cred-1",
    name: "Plaid — production API key",
    kind: "api_key",
    owner: "Platform Team",
    lastUsed: "2 minutes ago",
    health: "valid",
    sharedWith: ["Invoice Reconciliation", "Lead Enrichment", "ACH Payout Batch"],
    scopes: ["transactions:read", "auth:read"],
  },
  {
    id: "cred-2",
    name: "Stripe — Treasury OAuth connection",
    kind: "oauth",
    owner: "Maria Chen",
    lastUsed: "18 minutes ago",
    health: "expiring",
    expiresAt: "in 3 days",
    sharedWith: ["ACH Payout Batch"],
    scopes: ["payouts:write", "balance:read"],
  },
  {
    id: "cred-3",
    name: "SWIFT gateway — service account",
    kind: "service_account",
    owner: "Treasury Ops",
    lastUsed: "41 days ago",
    health: "expired",
    expiresAt: "38 days ago",
    sharedWith: [],
    scopes: ["mt103:submit"],
  },
  {
    id: "cred-4",
    name: "Core banking DB — read replica",
    kind: "database",
    owner: "Data Platform",
    lastUsed: "3 hours ago",
    health: "valid",
    sharedWith: ["Nightly Reconciliation", "Fraud Scoring Pipeline", "Regulatory Reporting", "Data Warehouse Sync"],
  },
];

const HEALTHCARE_CREDENTIALS: Credential[] = [
  {
    id: "cred-h1",
    name: "Epic FHIR — clinical OAuth connection",
    kind: "oauth",
    owner: "Health IT",
    lastUsed: "6 minutes ago",
    health: "valid",
    sharedWith: ["Prior Authorization Agent", "Care Gap Outreach"],
    scopes: ["patient.read", "coverage.read"],
  },
  {
    id: "cred-h2",
    name: "HL7 lab results — webhook secret",
    kind: "webhook_secret",
    owner: "Interop Team",
    lastUsed: "1 hour ago",
    health: "expiring",
    expiresAt: "tomorrow",
    sharedWith: ["Lab Results Router"],
  },
  {
    id: "cred-h3",
    name: "PHI archive — service account",
    kind: "service_account",
    owner: "Former contractor (offboarded)",
    lastUsed: "112 days ago",
    health: "revoked",
    sharedWith: [],
  },
];

export const FinancialServicesRoster: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[720px] space-y-3">
        {FINANCIAL_CREDENTIALS.map((c) => (
          <CredentialCard key={c.id} credential={c} />
        ))}
        <p className="max-w-[640px] font-mono text-[11px] leading-relaxed text-faint">
          Segunda mitad de la nueva prioridad #1 del NORTH_STAR (área A). Salud no binaria
          (valid/expiring/expired/revoked) y &quot;shared with&quot; siempre visible — una
          credencial compartida por 4 workflows (Core banking DB) es superficie de riesgo que un
          CISO necesita ver sin abrir un modal.
        </p>
      </div>
    </div>
  ),
};

export const HealthcareRoster: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-[720px] space-y-3">
        {HEALTHCARE_CREDENTIALS.map((c) => (
          <CredentialCard key={c.id} credential={c} />
        ))}
      </div>
    </div>
  ),
};

function PickerDemo() {
  const [selectedId, setSelectedId] = React.useState<string | undefined>(FINANCIAL_CREDENTIALS[0].id);
  const selected = FINANCIAL_CREDENTIALS.find((c) => c.id === selectedId);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <CredentialPicker credentials={FINANCIAL_CREDENTIALS} selectedId={selectedId} onSelect={setSelectedId} />
      <div>
        <div className="mb-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-dim">Selected</div>
        {selected ? <CredentialCard credential={selected} /> : null}
      </div>
    </div>
  );
}

export const PickerWithSearch: S = {
  name: "Credential Picker (searchable listbox)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <PickerDemo />
        <p className="max-w-[640px] font-mono text-[11px] leading-relaxed text-faint">
          Listbox accesible (flechas ↑/↓, Home/End) con filtro por nombre/owner/tipo — evita
          conectar un workflow a una credencial expirada o sobre-compartida sin darse cuenta.
        </p>
      </div>
    </div>
  ),
};
