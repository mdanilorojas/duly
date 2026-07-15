import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { AgentConsentCard, type ConsentLimit, type ConsentScopeItem } from "./agent-consent-card.js";
import { NEURAL_AGENTS } from "./neural-agents.js";

const meta: Meta<typeof AgentConsentCard> = {
  title: "Agentic/Agent Consent/V001 Conoce a tu agente",
  component: AgentConsentCard,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof AgentConsentCard>;

// Reutiliza la identidad WebGL de la galería base — el nombre/rol se
// sobreescribe para el contexto de industria de cada story, el shader/glow
// (identidad visual del core) se conserva.
const TREASURY_AGENT = { ...NEURAL_AGENTS[5], id: "FIN-TA-01", name: "Treasury Ops Agent", role: "Ejecuta transferencias y concilia cuentas de tesorería en tiempo real." };
const CLINICAL_AGENT = { ...NEURAL_AGENTS[6], id: "HLT-CD-01", name: "Clinical Documentation Agent", role: "Redacta notas clínicas y actualiza el historial del paciente desde el dictado." };
const OUTREACH_AGENT = { ...NEURAL_AGENTS[7], id: "SW-MO-01", name: "Marketing Outreach Agent", role: "Segmenta audiencias y dispara campañas de email desde el CRM." };
const ENERGY_AGENT = { ...NEURAL_AGENTS[1], id: "OE-FI-01", name: "Field Inspection Agent", role: "Analiza telemetría de pozo y genera órdenes de mantenimiento predictivo." };

const TREASURY_SCOPE: ConsentScopeItem[] = [
  {
    id: "wire-init",
    label: "Initiate wire transfers up to the configured limit",
    detail: "Solo cuentas beneficiarias verificadas por SWIFT — nunca agrega un beneficiario nuevo por sí solo.",
    riskTone: "block",
  },
  {
    id: "ledger-read",
    label: "Read general ledger and reconciliation reports",
    detail: "Acceso de solo lectura a los libros de tesorería del trimestre en curso.",
    riskTone: "review",
  },
  {
    id: "notify",
    label: "Send settlement notifications to finance-ops distribution list",
    riskTone: "info",
  },
];

const TREASURY_LIMITS: ConsentLimit[] = [
  { label: "Max per transfer", value: "$50,000" },
  { label: "Valid until", value: "2026-10-01" },
  { label: "Revocable", value: "Anytime, Agent Settings" },
  { label: "Approval mode", value: "Dual-control > $10k" },
];

const CLINICAL_SCOPE: ConsentScopeItem[] = [
  {
    id: "note-write",
    label: "Draft clinical notes from ambient dictation",
    detail: "Las notas quedan en estado \"draft\" hasta que un clínico las firma.",
    riskTone: "warn",
  },
  {
    id: "record-read",
    label: "Read patient chart during the active encounter",
    riskTone: "review",
  },
  {
    id: "coding-suggest",
    label: "Suggest ICD-10/CPT codes for billing review",
    riskTone: "info",
  },
];

const CLINICAL_LIMITS: ConsentLimit[] = [
  { label: "Scope", value: "Active encounter only" },
  { label: "Signature", value: "Clinician required" },
  { label: "Valid until", value: "Encounter close" },
  { label: "Revocable", value: "Anytime, per-clinician" },
];

const OUTREACH_SCOPE: ConsentScopeItem[] = [
  { id: "contacts-read", label: "Read full CRM contact list including unsubscribed leads", riskTone: "block" },
  { id: "campaign-send", label: "Send email campaigns without per-send review", riskTone: "warn" },
];

const OUTREACH_LIMITS: ConsentLimit[] = [
  { label: "Requested by", value: "growth-team" },
  { label: "Send cap", value: "Unlimited" },
  { label: "Valid until", value: "No expiry requested" },
];

const ENERGY_SCOPE: ConsentScopeItem[] = [
  { id: "telemetry-read", label: "Read live SCADA telemetry for assigned wellpads", riskTone: "review" },
  { id: "wo-create", label: "Create maintenance work orders in the CMMS", riskTone: "warn" },
];

const ENERGY_LIMITS: ConsentLimit[] = [
  { label: "Assets", value: "Permian Basin · Pad 12–19" },
  { label: "Valid until", value: "2026-12-31" },
  { label: "Revocable", value: "Anytime, HSE lead" },
];

function PendingDemo() {
  return (
    <AgentConsentCard
      agent={TREASURY_AGENT}
      requestedAt="just now"
      scope={TREASURY_SCOPE}
      limits={TREASURY_LIMITS}
      onConsent={() => console.log("consent granted")}
      onDecline={() => console.log("consent declined")}
    />
  );
}

export const PendingConsent: S = {
  name: "Pending — financial services (interactive)",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[640px] space-y-4">
        <PendingDemo />
        <p className="max-w-[600px] font-mono text-[11px] leading-relaxed text-faint">
          Patrón &quot;Know Your Agent&quot; (KYA): cada permiso del alcance se reconoce por
          separado — &quot;Grant consent&quot; permanece deshabilitado hasta que los 3 items
          están marcados. Es el paso previo a que existan solicitudes individuales en
          `HumanInterruptQueue`, no un reemplazo — este grant autoriza la clase de acción, cada
          ejecución concreta de alto riesgo sigue pasando por `ApprovalGateCard`.
        </p>
      </div>
    </div>
  ),
};

export const ConsentGranted: S = {
  name: "Consented — healthcare",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[640px]">
        <AgentConsentCard
          agent={CLINICAL_AGENT}
          status="consented"
          requestedAt="2h ago"
          scope={CLINICAL_SCOPE}
          limits={CLINICAL_LIMITS}
          consentedBy="dr.patel"
          consentedAt="1h 48m ago"
          onRevoke={() => console.log("revoke")}
        />
      </div>
    </div>
  ),
};

export const ConsentDeclined: S = {
  name: "Declined — software / marketing",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[640px]">
        <AgentConsentCard
          agent={OUTREACH_AGENT}
          status="declined"
          requestedAt="3d ago"
          scope={OUTREACH_SCOPE}
          limits={OUTREACH_LIMITS}
          declinedReason="Unsubscribed-lead access and unlimited send cap need legal review first."
        />
      </div>
    </div>
  ),
};

export const ConsentRevoked: S = {
  name: "Revoked — oil & energy",
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg-base p-12">
      <div className="w-full max-w-[640px]">
        <AgentConsentCard
          agent={ENERGY_AGENT}
          status="revoked"
          requestedAt="14d ago"
          scope={ENERGY_SCOPE}
          limits={ENERGY_LIMITS}
          revokedBy="hse-lead"
          revokedAt="2h ago"
        />
      </div>
    </div>
  ),
};

export const MobileWidth: S = {
  name: "Mobile width (375px)",
  render: () => (
    <div className="min-h-screen bg-bg-base p-4">
      <div className="mx-auto max-w-[375px]">
        <PendingDemo />
      </div>
    </div>
  ),
};
