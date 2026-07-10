import type { Meta, StoryObj } from "@storybook/react";
import { DataProvenanceCard, type DataSource } from "./data-provenance-card.js";

const meta: Meta<typeof DataProvenanceCard> = {
  title: "Agentic/Data Provenance/V001 Data Lineage",
  component: DataProvenanceCard,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof DataProvenanceCard>;

// Servicios financieros: un resumen de riesgo generado por IA se alimentó de
// varias fuentes con distinta confianza. Verificado (warehouse) + retrieval de
// política + una API externa stale — el peor tono manda el resumen.
const mixedSources: DataSource[] = [
  {
    kind: "table",
    ref: "warehouse.transactions",
    trust: "ok",
    freshness: "live",
    retrievedAt: "2m ago",
    hash: "sha256:1a2b3c4d5e",
    detail: "rows 8,412 · WHERE account_id = 'ACME-091' AND ts >= '2026-06-01'",
  },
  {
    kind: "retrieval",
    ref: "policy-handbook.pdf#p12",
    trust: "ok",
    freshness: "snapshot Jun 2026",
    retrievedAt: "2m ago",
    hash: "sha256:9f0e1d2c3b",
    detail: "similarity 0.91 · chunk 12/340 · 'wire transfer limits for tier-2 accounts'",
  },
  {
    kind: "api",
    ref: "sanctions-screening.gov/v2",
    trust: "warn",
    freshness: "cached 41m",
    retrievedAt: "41m ago",
    detail: "cache hit — upstream returned 503 on refresh; screening may be out of date",
  },
  {
    kind: "user-input",
    ref: "analyst note (Maria Chen)",
    trust: "info",
    retrievedAt: "5m ago",
  },
];

export const MixedTrust: S = {
  args: { sources: mixedSources, defaultExpanded: true },
};

export const CompactByDefault: S = {
  args: { sources: mixedSources },
};

export const AllVerified: S = {
  args: {
    defaultExpanded: true,
    sources: [
      {
        kind: "table",
        ref: "ledger.postings",
        trust: "ok",
        freshness: "live",
        retrievedAt: "just now",
        hash: "sha256:aa11bb22cc",
      },
      {
        kind: "document",
        ref: "signed-contract-4471.pdf",
        trust: "ok",
        freshness: "immutable",
        hash: "sha256:dd33ee44ff",
      },
    ],
  },
};

// Un output sin procedencia declarada es un hallazgo de compliance, no un vacío
// neutro: se marca en tono warn.
export const NoProvenance: S = {
  args: { sources: [] },
};
