import { z } from "zod";

/** Catalog version. Bump only when a stored surface would change meaning. */
export const CATALOG_VERSION = "1";
export const CATALOG_ID = "duly://catalog/v1";

const text = z.string().trim().min(1).max(400);
const tone = z.enum(["info", "ok", "review", "warn", "block"]);
const id = z.string().regex(/^[a-z][a-z0-9-]{0,40}$/);

export const columnSchema = z
  .object({
    children: z.array(id).min(1).max(12),
  })
  .strict();

export const approvalGateSchema = z
  .object({
    action: text,
    agent: text,
    riskTone: tone,
    riskLabel: text,
    what: text,
    why: text,
    blastRadius: text,
    rollback: text,
    requestedAt: text,
    expiresIn: text.optional(),
    status: z.enum(["pending", "approved", "rejected", "escalated", "expired"]).optional(),
  })
  .strict();

export const auditLogSchema = z
  .object({
    title: text.optional(),
    events: z
      .array(
        z
          .object({
            id,
            actorKind: z.enum(["human", "agent", "system"]),
            actor: text,
            action: text,
            resource: text,
            outcome: tone,
            timestamp: text,
            hash: z.string().regex(/^[a-f0-9]{8,64}$/i),
          })
          .strict(),
      )
      .min(1)
      .max(12),
  })
  .strict();

const toolBlockSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("table"),
      columns: z.array(text).min(1).max(6),
      rows: z.array(z.array(z.union([text, z.number().finite()]))).max(8),
      caption: text.optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("metrics"),
      items: z
        .array(
          z
            .object({
              label: text,
              value: text,
              tone: tone.optional(),
            })
            .strict(),
        )
        .min(1)
        .max(8),
    })
    .strict(),
  z
    .object({
      kind: z.literal("code"),
      content: text,
      language: text.optional(),
    })
    .strict(),
]);

export const richToolCallSchema = z
  .object({
    tool: text,
    input: z.record(text).optional(),
    blocks: z.array(toolBlockSchema).min(1).max(4),
    latency: text.optional(),
    tone: tone.optional(),
  })
  .strict();

export const tokenCostSchema = z
  .object({
    title: text,
    budgetUsd: z.number().finite().nonnegative().optional(),
    tokensIn: z.number().int().nonnegative().optional(),
    tokensOut: z.number().int().nonnegative().optional(),
    breakdown: z
      .array(
        z
          .object({
            label: text,
            costUsd: z.number().finite().nonnegative(),
            tone,
          })
          .strict(),
      )
      .min(1)
      .max(8),
  })
  .strict();

export const guardrailSchema = z
  .object({
    label: text,
    defaultOpen: z.boolean().optional(),
    policies: z
      .array(
        z
          .object({
            id,
            name: text,
            category: z.enum(["input", "output", "tool"]),
            status: z.enum(["passed", "warned", "blocked"]),
            rationale: text,
          })
          .strict(),
      )
      .min(1)
      .max(8),
  })
  .strict();

export const componentSchemas = {
  Column: columnSchema,
  ApprovalGate: approvalGateSchema,
  AuditLog: auditLogSchema,
  RichToolCall: richToolCallSchema,
  TokenCost: tokenCostSchema,
  Guardrail: guardrailSchema,
} as const;

export const CATALOG_COMPONENTS = Object.keys(componentSchemas) as Array<keyof typeof componentSchemas>;

export const REACT_COMPONENTS = {
  Column: null,
  ApprovalGate: "ApprovalGateCard",
  AuditLog: "AuditLogTable",
  RichToolCall: "RichToolCallCard",
  TokenCost: "TokenCostMeter",
  Guardrail: "GuardrailIndicator",
} as const;

export const COMPONENT_SUMMARIES: Record<keyof typeof componentSchemas, string> = {
  Column: "Host layout. Children are ids of other components on the same surface. Not a published React export.",
  ApprovalGate: "One human approval. The host renders ApprovalGateCard and keeps the second confirmation for block risk.",
  AuditLog: "Audit rows with actor, outcome, and a record hash. The host renders AuditLogTable.",
  RichToolCall: "A tool result made of table, metrics, or code blocks. The host renders RichToolCallCard. Callbacks are not in the schema.",
  TokenCost: "Run cost by category. The host renders TokenCostMeter.",
  Guardrail: "Passed, warned, and blocked policy checks. The host renders GuardrailIndicator.",
};
