import { readFileSync } from "node:fs";
import { tokens } from "@enregla-ui/duly-tokens";

/** Version 1 contract. Bump only when a stored document would change meaning. */
export const GENERATIVE_UI_VERSION = "1";

export const MAX_NODES = 48;
export const MAX_DEPTH = 6;
export const MAX_TEXT = 400;
export const MAX_ITEMS = 24;

/**
 * Components an agent may emit. Section and Stack are host layout nodes.
 * The rest are @enregla-ui/duly-ui components used by the cockpit.
 * Keep this list aligned with GenerativeUiView.
 */
export const GENERATIVE_COMPONENTS = [
  "Section",
  "Stack",
  "AgentMetricRow",
  "AgentMetric",
  "RunTimeline",
  "HumanInterruptQueue",
  "GuardrailIndicator",
  "TokenCostMeter",
  "TraceLog",
] as const;

export type GenerativeComponent = (typeof GENERATIVE_COMPONENTS)[number];

const COMPONENT_SET = new Set<string>(GENERATIVE_COMPONENTS);

export const GENERATIVE_RULES = [
  {
    id: "document.version",
    detail: 'version is "1" and locale is en or es.',
  },
  {
    id: "theme.known",
    detail: "theme is one of the themes shipped by @enregla-ui/duly-tokens.",
  },
  {
    id: "components.allow_list",
    detail: "Every node uses an allow-listed component, within the node and depth caps, and children are legal for that component.",
  },
  {
    id: "props.no_raw_color",
    detail: "No hex, rgb, hsl, or oklch color literals. Color is a theme token name such as ok or warn.",
  },
  {
    id: "props.no_style_escape",
    detail: "No style, className, css, html, or other props outside the allow-list, and no HTML in text.",
  },
  {
    id: "a11y.text_labels",
    detail: "Visible text is present for titles, labels, actions, and rationales.",
  },
  {
    id: "a11y.status_enum",
    detail: "Status, tone, category, and approval fields use the design-system enums, so state is not a free-form color.",
  },
  {
    id: "a11y.single_title",
    detail: "The document has one title. The host renders it as the only h1. Section headings are h2.",
  },
  {
    id: "audit.stable_ids",
    detail: "auditId, node ids, and nested record ids are unique and match ^[a-z][a-z0-9-]{0,40}$.",
  },
  {
    id: "approval.no_skip_confirm",
    detail: "A document cannot set skipConfirmation or requireConfirmation false. Block-risk approvals keep the host's second confirmation.",
  },
] as const;

export type GenerativeRuleId = (typeof GENERATIVE_RULES)[number]["id"];

export interface GenerativeUiError {
  path: string;
  rule: GenerativeRuleId;
  message: string;
}

export interface GenerativeUiAudit {
  ok: boolean;
  version: typeof GENERATIVE_UI_VERSION;
  auditId: string | null;
  theme: string | null;
  locale: string | null;
  nodeIds: string[];
  components: string[];
  rules: Array<{ id: GenerativeRuleId; passed: boolean; detail: string }>;
  errors: GenerativeUiError[];
}

const ID_RE = /^[a-z][a-z0-9-]{0,40}$/;
const COLOR_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|\brgba?\s*\(|\bhsla?\s*\(|\boklch\s*\(/i;
const HTML_RE = /<\/?[a-z!]/i;

const DOCUMENT_KEYS = new Set(["version", "auditId", "theme", "locale", "title", "description", "nodes"]);
const NODE_KEYS = new Set(["id", "component", "props", "children"]);

const METRIC_TONES = new Set(["default", "ok", "warn", "review", "block", "info"]);
const TONES = new Set(["info", "ok", "review", "warn", "block"]);
const NODE_STATUSES = new Set(["success", "error", "running", "waiting", "retrying", "skipped"]);
const APPROVAL_STATUSES = new Set(["pending", "approved", "rejected", "escalated", "expired"]);
const GUARDRAIL_STATUSES = new Set(["passed", "warned", "blocked"]);
const GUARDRAIL_CATEGORIES = new Set(["input", "output", "tool"]);

const CHILDREN: Record<GenerativeComponent, "none" | "any" | "metrics"> = {
  Section: "any",
  Stack: "any",
  AgentMetricRow: "metrics",
  AgentMetric: "none",
  RunTimeline: "none",
  HumanInterruptQueue: "none",
  GuardrailIndicator: "none",
  TokenCostMeter: "none",
  TraceLog: "none",
};

const EXAMPLE_URL = new URL("../../ui/src/agentic/cockpit.generative.json", import.meta.url);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function knownThemes(): string[] {
  return Object.keys(tokens);
}

export function exampleGenerativeUi(): unknown {
  return JSON.parse(readFileSync(EXAMPLE_URL, "utf8")) as unknown;
}

export function getGenerativeUiSchema() {
  return {
    version: GENERATIVE_UI_VERSION,
    pattern:
      "The agent emits this JSON document. The host renders it with GenerativeUiView from @enregla-ui/duly-ui. Do not emit HTML, CSS, or raw colors.",
    limits: { maxNodes: MAX_NODES, maxDepth: MAX_DEPTH, maxText: MAX_TEXT, maxItems: MAX_ITEMS },
    idPattern: "^[a-z][a-z0-9-]{0,40}$",
    themes: knownThemes(),
    locales: ["en", "es"],
    components: [...GENERATIVE_COMPONENTS],
    layout: {
      Section: "Host region with an h2 heading and child nodes. Not a published React export.",
      Stack: 'Host layout. props.direction is "column" or "split". Not a published React export.',
    },
    rules: GENERATIVE_RULES.map((rule) => ({ id: rule.id, detail: rule.detail })),
    audit:
      "validate_generative_ui returns a structural audit for the same input every time. Duly does not store, sign, or certify that object. It is not a SOC 2 report, an ISO certificate, or a bank attestation.",
    example: exampleGenerativeUi(),
  };
}

interface Walk {
  errors: GenerativeUiError[];
  nodeIds: string[];
  components: string[];
  seen: Set<string>;
}

function push(walk: Walk, path: string, rule: GenerativeRuleId, message: string) {
  walk.errors.push({ path, rule, message });
}

function scanString(walk: Walk, value: string, path: string) {
  if (value.length > MAX_TEXT) {
    push(walk, path, "props.no_style_escape", `Text is longer than ${MAX_TEXT} characters.`);
  }
  if (COLOR_RE.test(value)) {
    push(walk, path, "props.no_raw_color", "Raw color values are not allowed. Use a semantic tone or theme token.");
  }
  if (HTML_RE.test(value) || /\bstyle\s*=/.test(value)) {
    push(walk, path, "props.no_style_escape", "HTML and style attributes are not allowed.");
  }
}

function takeId(walk: Walk, value: unknown, path: string): string | null {
  if (typeof value !== "string" || !ID_RE.test(value)) {
    push(walk, path, "audit.stable_ids", "Id must match ^[a-z][a-z0-9-]{0,40}$.");
    return null;
  }
  if (walk.seen.has(value)) {
    push(walk, path, "audit.stable_ids", `Duplicate id "${value}".`);
  } else {
    walk.seen.add(value);
  }
  walk.nodeIds.push(value);
  return value;
}

function requireText(walk: Walk, value: unknown, path: string, label: string): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    push(walk, path, "a11y.text_labels", `${label} is required.`);
    return null;
  }
  scanString(walk, value, path);
  return value;
}

function optionalText(walk: Walk, value: unknown, path: string) {
  if (value === undefined) return;
  if (typeof value !== "string") {
    push(walk, path, "props.no_style_escape", "Expected a string.");
    return;
  }
  scanString(walk, value, path);
}

function enumValue(walk: Walk, value: unknown, path: string, allowed: Set<string>, label: string) {
  if (typeof value !== "string" || !allowed.has(value)) {
    push(walk, path, "a11y.status_enum", `${label} must be one of: ${[...allowed].join(", ")}.`);
    return;
  }
  scanString(walk, value, path);
}

function finiteNumber(walk: Walk, value: unknown, path: string, label: string, { min = 0, integer = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || (integer && !Number.isInteger(value))) {
    push(walk, path, "props.no_style_escape", `${label} must be a finite ${integer ? "integer " : ""}number${min > 0 ? ` of at least ${min}` : " of zero or more"}.`);
  }
}

function rejectEscapeKeys(walk: Walk, record: Record<string, unknown>, path: string, allowed: Set<string>) {
  for (const key of Object.keys(record)) {
    if (key === "skipConfirmation" || (key === "requireConfirmation" && record[key] === false)) {
      push(
        walk,
        `${path}.${key}`,
        "approval.no_skip_confirm",
        "Confirmation cannot be skipped. Block-risk approvals keep a second confirmation in the host.",
      );
      continue;
    }
    if (!allowed.has(key)) {
      push(walk, `${path}.${key}`, "props.no_style_escape", `Field "${key}" is not in the allow-list.`);
      const extra = record[key];
      if (typeof extra === "string") scanString(walk, extra, `${path}.${key}`);
    }
  }
}

const STYLE_KEYS = new Set(["style", "className", "class", "css", "html", "color", "dangerouslySetInnerHTML", "sx", "tw"]);

function looseScan(walk: Walk, value: unknown, path: string) {
  if (typeof value === "string") {
    scanString(walk, value, path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => looseScan(walk, item, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "skipConfirmation" || (key === "requireConfirmation" && child === false)) {
      push(walk, `${path}.${key}`, "approval.no_skip_confirm", "Confirmation cannot be skipped. Block-risk approvals keep a second confirmation in the host.");
    } else if (STYLE_KEYS.has(key)) {
      push(walk, `${path}.${key}`, "props.no_style_escape", `Field "${key}" is not in the allow-list.`);
    }
    looseScan(walk, child, `${path}.${key}`);
  }
}

const QUEUE_ITEM_KEYS = new Set([
  "id",
  "action",
  "agent",
  "riskTone",
  "riskLabel",
  "what",
  "why",
  "blastRadius",
  "rollback",
  "requestedAt",
  "ageMinutes",
  "expiresIn",
  "status",
]);

function validateQueueItem(walk: Walk, value: unknown, path: string) {
  if (!isRecord(value)) {
    push(walk, path, "components.allow_list", "Queue item must be an object.");
    return;
  }
  rejectEscapeKeys(walk, value, path, QUEUE_ITEM_KEYS);
  takeId(walk, value.id, `${path}.id`);
  for (const key of ["action", "agent", "riskLabel", "what", "why", "blastRadius", "rollback", "requestedAt"] as const) {
    requireText(walk, value[key], `${path}.${key}`, key);
  }
  enumValue(walk, value.riskTone, `${path}.riskTone`, TONES, "riskTone");
  if (value.ageMinutes === undefined) {
    push(walk, `${path}.ageMinutes`, "props.no_style_escape", "ageMinutes is required.");
  } else {
    finiteNumber(walk, value.ageMinutes, `${path}.ageMinutes`, "ageMinutes", { integer: true });
  }
  optionalText(walk, value.expiresIn, `${path}.expiresIn`);
  if (value.status !== undefined) enumValue(walk, value.status, `${path}.status`, APPROVAL_STATUSES, "status");
}

function validateProps(walk: Walk, component: GenerativeComponent, props: Record<string, unknown>, path: string) {
  if (component === "Section") {
    rejectEscapeKeys(walk, props, path, new Set(["heading"]));
    requireText(walk, props.heading, `${path}.heading`, "heading");
    return;
  }
  if (component === "Stack") {
    rejectEscapeKeys(walk, props, path, new Set(["direction"]));
    if (props.direction !== undefined && props.direction !== "column" && props.direction !== "split") {
      push(walk, `${path}.direction`, "props.no_style_escape", 'direction must be "column" or "split".');
      if (typeof props.direction === "string") scanString(walk, props.direction, `${path}.direction`);
    }
    return;
  }
  if (component === "AgentMetricRow") {
    rejectEscapeKeys(walk, props, path, new Set());
    return;
  }
  if (component === "AgentMetric") {
    rejectEscapeKeys(walk, props, path, new Set(["label", "value", "unit", "tone"]));
    requireText(walk, props.label, `${path}.label`, "label");
    requireText(walk, props.value, `${path}.value`, "value");
    optionalText(walk, props.unit, `${path}.unit`);
    if (props.tone !== undefined) enumValue(walk, props.tone, `${path}.tone`, METRIC_TONES, "tone");
    return;
  }
  if (component === "RunTimeline") {
    rejectEscapeKeys(walk, props, path, new Set(["title", "hint", "nodes"]));
    requireText(walk, props.title, `${path}.title`, "title");
    optionalText(walk, props.hint, `${path}.hint`);
    if (!Array.isArray(props.nodes) || props.nodes.length === 0) {
      push(walk, `${path}.nodes`, "a11y.text_labels", "nodes needs at least one titled step.");
      return;
    }
    if (props.nodes.length > MAX_ITEMS) {
      push(walk, `${path}.nodes`, "components.allow_list", `At most ${MAX_ITEMS} nodes.`);
    }
    props.nodes.forEach((node, index) => {
      const itemPath = `${path}.nodes[${index}]`;
      if (!isRecord(node)) {
        push(walk, itemPath, "components.allow_list", "Timeline node must be an object.");
        return;
      }
      rejectEscapeKeys(walk, node, itemPath, new Set(["id", "title", "status", "owner", "meta"]));
      takeId(walk, node.id, `${itemPath}.id`);
      requireText(walk, node.title, `${itemPath}.title`, "title");
      enumValue(walk, node.status, `${itemPath}.status`, NODE_STATUSES, "status");
      optionalText(walk, node.owner, `${itemPath}.owner`);
      optionalText(walk, node.meta, `${itemPath}.meta`);
    });
    return;
  }
  if (component === "HumanInterruptQueue") {
    rejectEscapeKeys(walk, props, path, new Set(["title", "items"]));
    requireText(walk, props.title, `${path}.title`, "title");
    if (!Array.isArray(props.items)) {
      push(walk, `${path}.items`, "a11y.text_labels", "items must be an array.");
      return;
    }
    if (props.items.length > MAX_ITEMS) {
      push(walk, `${path}.items`, "components.allow_list", `At most ${MAX_ITEMS} items.`);
    }
    props.items.forEach((item, index) => validateQueueItem(walk, item, `${path}.items[${index}]`));
    return;
  }
  if (component === "GuardrailIndicator") {
    rejectEscapeKeys(walk, props, path, new Set(["label", "defaultOpen", "policies"]));
    requireText(walk, props.label, `${path}.label`, "label");
    if (props.defaultOpen !== undefined && typeof props.defaultOpen !== "boolean") {
      push(walk, `${path}.defaultOpen`, "props.no_style_escape", "defaultOpen must be a boolean.");
    }
    if (!Array.isArray(props.policies) || props.policies.length === 0) {
      push(walk, `${path}.policies`, "a11y.text_labels", "policies needs at least one named check.");
      return;
    }
    if (props.policies.length > MAX_ITEMS) {
      push(walk, `${path}.policies`, "components.allow_list", `At most ${MAX_ITEMS} policies.`);
    }
    props.policies.forEach((policy, index) => {
      const itemPath = `${path}.policies[${index}]`;
      if (!isRecord(policy)) {
        push(walk, itemPath, "components.allow_list", "Policy must be an object.");
        return;
      }
      rejectEscapeKeys(walk, policy, itemPath, new Set(["id", "name", "category", "status", "rationale"]));
      takeId(walk, policy.id, `${itemPath}.id`);
      requireText(walk, policy.name, `${itemPath}.name`, "name");
      requireText(walk, policy.rationale, `${itemPath}.rationale`, "rationale");
      enumValue(walk, policy.category, `${itemPath}.category`, GUARDRAIL_CATEGORIES, "category");
      enumValue(walk, policy.status, `${itemPath}.status`, GUARDRAIL_STATUSES, "status");
    });
    return;
  }
  if (component === "TokenCostMeter") {
    rejectEscapeKeys(walk, props, path, new Set(["title", "budgetUsd", "tokensIn", "tokensOut", "breakdown"]));
    requireText(walk, props.title, `${path}.title`, "title");
    if (props.budgetUsd !== undefined) finiteNumber(walk, props.budgetUsd, `${path}.budgetUsd`, "budgetUsd", { min: 0 });
    if (props.tokensIn !== undefined) finiteNumber(walk, props.tokensIn, `${path}.tokensIn`, "tokensIn", { integer: true });
    if (props.tokensOut !== undefined) finiteNumber(walk, props.tokensOut, `${path}.tokensOut`, "tokensOut", { integer: true });
    if (!Array.isArray(props.breakdown) || props.breakdown.length === 0) {
      push(walk, `${path}.breakdown`, "a11y.text_labels", "breakdown needs at least one labeled cost.");
      return;
    }
    props.breakdown.forEach((item, index) => {
      const itemPath = `${path}.breakdown[${index}]`;
      if (!isRecord(item)) {
        push(walk, itemPath, "components.allow_list", "Breakdown item must be an object.");
        return;
      }
      rejectEscapeKeys(walk, item, itemPath, new Set(["label", "costUsd", "tone"]));
      requireText(walk, item.label, `${itemPath}.label`, "label");
      finiteNumber(walk, item.costUsd, `${itemPath}.costUsd`, "costUsd");
      enumValue(walk, item.tone, `${itemPath}.tone`, TONES, "tone");
    });
    return;
  }
  rejectEscapeKeys(walk, props, path, new Set(["title", "hint", "label", "rows"]));
  requireText(walk, props.title, `${path}.title`, "title");
  requireText(walk, props.label, `${path}.label`, "label");
  optionalText(walk, props.hint, `${path}.hint`);
  if (!Array.isArray(props.rows) || props.rows.length === 0) {
    push(walk, `${path}.rows`, "a11y.text_labels", "rows needs at least one event.");
    return;
  }
  if (props.rows.length > MAX_ITEMS) {
    push(walk, `${path}.rows`, "components.allow_list", `At most ${MAX_ITEMS} rows.`);
  }
  props.rows.forEach((row, index) => {
    const itemPath = `${path}.rows[${index}]`;
    if (!isRecord(row)) {
      push(walk, itemPath, "components.allow_list", "Row must be an object.");
      return;
    }
    rejectEscapeKeys(walk, row, itemPath, new Set(["tone", "agent", "text", "step"]));
    enumValue(walk, row.tone, `${itemPath}.tone`, TONES, "tone");
    requireText(walk, row.agent, `${itemPath}.agent`, "agent");
    requireText(walk, row.text, `${itemPath}.text`, "text");
    optionalText(walk, row.step, `${itemPath}.step`);
  });
}

function walkNode(walk: Walk, value: unknown, path: string, depth: number, count: number): number {
  if (!isRecord(value)) {
    push(walk, path, "components.allow_list", "Node must be an object.");
    return count;
  }
  rejectEscapeKeys(walk, value, path, NODE_KEYS);
  takeId(walk, value.id, `${path}.id`);
  const nextCount = count + 1;
  if (nextCount > MAX_NODES) {
    push(walk, path, "components.allow_list", `A document can contain at most ${MAX_NODES} nodes.`);
  }
  if (depth > MAX_DEPTH) {
    push(walk, path, "components.allow_list", `A node can be nested at most ${MAX_DEPTH} levels deep.`);
  }

  const component = value.component;
  if (typeof component !== "string" || !COMPONENT_SET.has(component)) {
    push(walk, `${path}.component`, "components.allow_list", `Unknown component "${String(component)}".`);
    looseScan(walk, value.props, `${path}.props`);
    let cursor = nextCount;
    if (Array.isArray(value.children)) {
      value.children.forEach((child, index) => {
        cursor = walkNode(walk, child, `${path}.children[${index}]`, depth + 1, cursor);
      });
    }
    return cursor;
  }
  const name = component as GenerativeComponent;
  if (!walk.components.includes(name)) walk.components.push(name);

  const props = value.props === undefined ? {} : value.props;
  if (!isRecord(props)) {
    push(walk, `${path}.props`, "props.no_style_escape", "props must be an object.");
  } else {
    validateProps(walk, name, props, `${path}.props`);
  }

  const childrenKind = CHILDREN[name];
  const children = value.children;
  if (childrenKind === "none") {
    if (children !== undefined) {
      push(walk, `${path}.children`, "components.allow_list", `${name} does not take children.`);
    }
    return nextCount;
  }
  if (!Array.isArray(children) || children.length === 0) {
    push(walk, `${path}.children`, "components.allow_list", `${name} needs at least one child node.`);
    return nextCount;
  }
  if (children.length > MAX_ITEMS) {
    push(walk, `${path}.children`, "components.allow_list", `${name} can contain at most ${MAX_ITEMS} children.`);
  }
  let cursor = nextCount;
  children.forEach((child, index) => {
    const childPath = `${path}.children[${index}]`;
    if (childrenKind === "metrics" && (!isRecord(child) || child.component !== "AgentMetric")) {
      push(walk, childPath, "components.allow_list", "AgentMetricRow only contains AgentMetric nodes.");
    }
    cursor = walkNode(walk, child, childPath, depth + 1, cursor);
  });
  return cursor;
}

function finish(
  walk: Walk,
  auditId: string | null,
  theme: string | null,
  locale: string | null,
): GenerativeUiAudit {
  const failed = new Set(walk.errors.map((error) => error.rule));
  return {
    ok: walk.errors.length === 0,
    version: GENERATIVE_UI_VERSION,
    auditId,
    theme,
    locale,
    nodeIds: walk.nodeIds,
    components: walk.components,
    rules: GENERATIVE_RULES.map((rule) => ({
      id: rule.id,
      passed: !failed.has(rule.id),
      detail: rule.detail,
    })),
    errors: walk.errors,
  };
}

/** Pure structural check. The same document always produces the same audit. */
export function validateGenerativeUi(input: unknown): GenerativeUiAudit {
  const walk: Walk = { errors: [], nodeIds: [], components: [], seen: new Set() };
  if (!isRecord(input)) {
    push(walk, "$", "document.version", "Document must be a JSON object.");
    return finish(walk, null, null, null);
  }

  rejectEscapeKeys(walk, input, "$", DOCUMENT_KEYS);

  if (input.version !== GENERATIVE_UI_VERSION) {
    push(walk, "$.version", "document.version", `version must be "${GENERATIVE_UI_VERSION}".`);
  }
  const locale = typeof input.locale === "string" ? input.locale : null;
  if (locale !== "en" && locale !== "es") {
    push(walk, "$.locale", "document.version", 'locale must be "en" or "es".');
  }

  const auditId = typeof input.auditId === "string" ? input.auditId : null;
  if (!auditId || !ID_RE.test(auditId)) {
    push(walk, "$.auditId", "audit.stable_ids", "auditId must match ^[a-z][a-z0-9-]{0,40}$.");
  } else {
    walk.seen.add(auditId);
  }

  const theme = typeof input.theme === "string" ? input.theme : null;
  if (!theme || !knownThemes().includes(theme)) {
    push(walk, "$.theme", "theme.known", `Unknown theme. Known themes: ${knownThemes().join(", ")}.`);
  }

  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    push(walk, "$.title", "a11y.single_title", "title is required. The host renders it as the only h1.");
  } else {
    scanString(walk, input.title, "$.title");
  }
  if (input.description !== undefined) optionalText(walk, input.description, "$.description");

  if (!Array.isArray(input.nodes)) {
    push(walk, "$.nodes", "components.allow_list", "nodes must be an array.");
  } else if (input.nodes.length === 0) {
    push(walk, "$.nodes", "components.allow_list", "nodes needs at least one component.");
  } else {
    let count = 0;
    input.nodes.forEach((node, index) => {
      count = walkNode(walk, node, `$.nodes[${index}]`, 1, count);
    });
  }

  return finish(walk, auditId, theme, locale);
}

export function generativeUiContract() {
  return {
    version: GENERATIVE_UI_VERSION,
    tools: ["get_generative_ui_schema", "validate_generative_ui"],
    components: [...GENERATIVE_COMPONENTS],
    rules: GENERATIVE_RULES.map((rule) => rule.id),
    example: "packages/ui/src/agentic/cockpit.generative.json",
    host: "GenerativeUiView from @enregla-ui/duly-ui",
    audit:
      "validate_generative_ui checks structure only and returns the same audit for the same document. Duly does not store, sign, or certify it. It is not a SOC 2 report, an ISO certificate, or a bank attestation.",
  };
}
