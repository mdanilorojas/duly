import { readFileSync } from "node:fs";
import {
  contrastPairs,
  lockedTokens,
  semanticKeys,
  tokens,
} from "@enregla-ui/duly-tokens";
import { COMPONENT_INVENTORY, type ComponentArea, type ComponentEntry } from "./catalog.js";
import { GENERATE_UI, type GenerateUiInstructions } from "./instructions.js";

export interface TokenValue {
  name: string;
  cssVar: string;
  hex: string;
  oklch: string;
  locked: boolean;
}

export interface ThemeExport {
  colorScheme: "light" | "dark";
  css: string;
  tokens: TokenValue[];
}

export interface DesignSystemExport {
  name: "Duly";
  description: string;
  packages: {
    tokens: { name: "@enregla-ui/duly-tokens"; version: string; css: string };
    ui: { name: "@enregla-ui/duly-ui"; version: string; styles: string[] };
    mcp: { name: "@duly/mcp"; version: string };
  };
  themes: Record<string, ThemeExport>;
  contrastPairs: [string, string, number][];
  components: ComponentEntry[];
  generateUi: GenerateUiInstructions;
  notes: string[];
}

interface PackageJson {
  name: string;
  version: string;
}

function readJson(url: URL): PackageJson {
  return JSON.parse(readFileSync(url, "utf8")) as PackageJson;
}

function workspacePackage(relativePath: string): PackageJson {
  return readJson(new URL(relativePath, import.meta.url));
}

const locked = new Set<string>(lockedTokens);

function themeCssUrl(theme: string): URL {
  // Workspace path, not import.meta.resolve: Vitest's SSR runner does not implement that.
  // The CSS file is the token build output (@enregla-ui/duly-tokens/theme-<name>.css).
  return new URL(`../../tokens/dist/theme-${theme}.css`, import.meta.url);
}

function oklchByToken(css: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const match of css.matchAll(/--([a-z0-9-]+):\s*(oklch\([^)]+\));/g)) {
    const name = match[1];
    const value = match[2];
    if (name && value) found.set(name, value);
  }
  return found;
}

function colorScheme(css: string): "light" | "dark" {
  return css.includes("color-scheme: light") ? "light" : "dark";
}

export function themeNames(): string[] {
  return Object.keys(tokens);
}

export function buildTheme(theme: string): ThemeExport {
  const hexTokens = tokens[theme as keyof typeof tokens];
  if (!hexTokens) {
    throw new Error(`Unknown theme "${theme}". Known themes: ${themeNames().join(", ")}.`);
  }
  const css = readFileSync(themeCssUrl(theme), "utf8");
  const oklch = oklchByToken(css);
  return {
    colorScheme: colorScheme(css),
    css: `@enregla-ui/duly-tokens/theme-${theme}.css`,
    tokens: semanticKeys.map((name) => {
      const parsed = oklch.get(name);
      if (!parsed) {
        throw new Error(`Theme ${theme} is missing an oklch value for --${name}. Rebuild @enregla-ui/duly-tokens.`);
      }
      return {
        name,
        cssVar: `--${name}`,
        hex: hexTokens[name],
        oklch: parsed,
        locked: locked.has(name),
      };
    }),
  };
}

export function listComponents(filter?: { query?: string; area?: ComponentArea }): ComponentEntry[] {
  const query = filter?.query?.trim().toLowerCase();
  return COMPONENT_INVENTORY.filter((entry) => {
    if (filter?.area && entry.area !== filter.area) return false;
    if (!query) return true;
    return entry.name.toLowerCase().includes(query) || entry.summary.toLowerCase().includes(query);
  });
}

export function buildDesignSystem(): DesignSystemExport {
  const tokensPackage = workspacePackage("../../tokens/package.json");
  const uiPackage = workspacePackage("../../ui/package.json");
  const mcpPackage = workspacePackage("../package.json");
  const themes = Object.fromEntries(themeNames().map((name) => [name, buildTheme(name)]));
  return {
    name: "Duly",
    description:
      "Multi-brand agent-ops design system. Semantic colors are OKLCH custom properties with a hex fallback.",
    packages: {
      tokens: {
        name: "@enregla-ui/duly-tokens",
        version: tokensPackage.version,
        css: "@enregla-ui/duly-tokens/css",
      },
      ui: {
        name: "@enregla-ui/duly-ui",
        version: uiPackage.version,
        styles: ["@enregla-ui/duly-ui/styles.css", "@enregla-ui/duly-ui/reset.css"],
      },
      mcp: { name: "@duly/mcp", version: mcpPackage.version },
    },
    themes,
    contrastPairs: contrastPairs.map((pair) => [pair[0], pair[1], pair[2]]),
    components: [...COMPONENT_INVENTORY],
    generateUi: GENERATE_UI,
    notes: [
      "Regenerate packages/mcp/design-system.json with pnpm --filter @duly/mcp export after token changes.",
      "The component list is curated. Prop types live in packages/ui/src.",
    ],
  };
}

export function tokensPayload(theme?: string): { themes: Record<string, ThemeExport> } | { theme: string; tokens: ThemeExport } {
  const name = theme?.trim();
  if (!name) return { themes: Object.fromEntries(themeNames().map((item) => [item, buildTheme(item)])) };
  return { theme: name, tokens: buildTheme(name) };
}
