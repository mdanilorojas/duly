import { sha256Hex } from "./sha256.js";
import { CATALOG_COMPONENTS, CATALOG_ID, CATALOG_VERSION, componentSchemas } from "./schemas.js";
import { themeNames } from "./themes.js";

type CatalogComponent = (typeof CATALOG_COMPONENTS)[number];

const COLOR_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|\brgba?\s*\(|\bhsla?\s*\(|\boklch\s*\(/i;
const HTML_RE = /<\/?[a-z!]/i;
const ID_RE = /^[a-z][a-z0-9-]{0,40}$/;

export interface SurfaceNode {
  id: string;
  component: Record<string, unknown>;
}

export interface CheckedSurface {
  version: string;
  catalogId: string;
  surfaceId: string;
  theme: string;
  root: string;
  components: SurfaceNode[];
}

export interface SurfaceIssue {
  path: string;
  message: string;
}

export interface StrippedComponent {
  id: string;
  component: string;
  reason: "unknown_component";
}

export interface SurfaceCheck {
  ok: boolean;
  executes: false;
  catalogId: string;
  version: string;
  surfaceId: string | null;
  theme: string | null;
  /** SHA-256 of the canonical checked layout. This is the screen a reviewer would see. */
  surfaceHash: string | null;
  checked: CheckedSurface | null;
  stripped: StrippedComponent[];
  errors: SurfaceIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function surfaceHash(surface: CheckedSurface): string {
  return `sha256:${sha256Hex(canonicalize(surface))}`;
}

function scanValue(value: unknown, path: string, errors: SurfaceIssue[]) {
  if (typeof value === "string") {
    if (COLOR_RE.test(value)) errors.push({ path, message: "Raw color values are not allowed. Use a semantic tone." });
    if (HTML_RE.test(value) || /\bstyle\s*=/.test(value)) errors.push({ path, message: "HTML and style attributes are not allowed." });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanValue(item, `${path}[${index}]`, errors));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) scanValue(child, `${path}.${key}`, errors);
}

function componentName(component: Record<string, unknown>): string | null {
  const keys = Object.keys(component);
  if (keys.length !== 1) return null;
  return keys[0] ?? null;
}

export function checkSurface(input: unknown): SurfaceCheck {
  const errors: SurfaceIssue[] = [];
  const stripped: StrippedComponent[] = [];
  const base = {
    executes: false as const,
    catalogId: CATALOG_ID,
    version: CATALOG_VERSION,
  };

  if (!isRecord(input)) {
    return { ...base, ok: false, surfaceId: null, theme: null, surfaceHash: null, checked: null, stripped, errors: [{ path: "$", message: "Surface must be a JSON object." }] };
  }
  if (input.version !== CATALOG_VERSION || input.catalogId !== CATALOG_ID) {
    errors.push({ path: "$", message: `Surface must use version "${CATALOG_VERSION}" and catalogId "${CATALOG_ID}".` });
  }
  const surfaceId = typeof input.surfaceId === "string" && ID_RE.test(input.surfaceId) ? input.surfaceId : null;
  if (!surfaceId) errors.push({ path: "$.surfaceId", message: "surfaceId must match ^[a-z][a-z0-9-]{0,40}$." });
  const theme = typeof input.theme === "string" && themeNames().includes(input.theme) ? input.theme : null;
  if (!theme) errors.push({ path: "$.theme", message: `Unknown theme. Known themes: ${themeNames().join(", ")}.` });
  const root = typeof input.root === "string" && ID_RE.test(input.root) ? input.root : null;
  if (!root) errors.push({ path: "$.root", message: "root must be the id of a component on this surface." });

  const accepted: SurfaceNode[] = [];
  const seen = new Set<string>();
  if (!Array.isArray(input.components)) {
    errors.push({ path: "$.components", message: "components must be an array." });
  } else {
    input.components.forEach((node, index) => {
      const path = `$.components[${index}]`;
      if (!isRecord(node) || typeof node.id !== "string" || !ID_RE.test(node.id) || !isRecord(node.component)) {
        errors.push({ path, message: "Each component needs an id and a single component object." });
        return;
      }
      if (seen.has(node.id)) {
        errors.push({ path: `${path}.id`, message: `Duplicate id "${node.id}".` });
        return;
      }
      seen.add(node.id);
      const name = componentName(node.component);
      if (!name || !(name in componentSchemas)) {
        stripped.push({ id: node.id, component: name ?? "unknown", reason: "unknown_component" });
        return;
      }
      const props = node.component[name];
      if (isRecord(props) && ("skipConfirmation" in props || props.requireConfirmation === false)) {
        errors.push({ path: `${path}.component.${name}`, message: "Confirmation cannot be skipped. The host keeps that step." });
        return;
      }
      const schema = componentSchemas[name as CatalogComponent];
      const parsed = schema.safeParse(props);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        errors.push({
          path: `${path}.component.${name}`,
          message: issue ? `${issue.path.join(".") || name}: ${issue.message}` : `${name} props failed the catalog schema.`,
        });
        return;
      }
      const propErrors: SurfaceIssue[] = [];
      scanValue(parsed.data, `${path}.component.${name}`, propErrors);
      if (propErrors.length > 0) {
        errors.push(...propErrors);
        return;
      }
      accepted.push({ id: node.id, component: { [name]: parsed.data } });
    });
  }

  const live = new Set(accepted.map((node) => node.id));
  const components = accepted.flatMap((node) => {
    const name = componentName(node.component);
    if (name !== "Column") return [node];
    const props = node.component.Column;
    if (!isRecord(props) || !Array.isArray(props.children)) return [node];
    const children = props.children.filter((child): child is string => typeof child === "string" && live.has(child));
    if (children.length === 0) {
      errors.push({ path: `$.components.${node.id}`, message: "Column has no children left after stripping." });
      return [];
    }
    return [{ id: node.id, component: { Column: { children } } }];
  });

  if (root && !components.some((node) => node.id === root)) {
    errors.push({ path: "$.root", message: `Root "${root}" is not in the checked layout.` });
  }

  const checked =
    errors.length === 0 && surfaceId && theme && root
      ? { version: CATALOG_VERSION, catalogId: CATALOG_ID, surfaceId, theme, root, components }
      : null;

  return {
    ...base,
    ok: checked !== null,
    surfaceId,
    theme,
    surfaceHash: checked ? surfaceHash(checked) : null,
    checked,
    stripped,
    errors,
  };
}
