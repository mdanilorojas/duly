# Studio DS — Fundación + Trace/Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar el monorepo del Studio DS con una arquitectura de tokens en capas (OKLCH, multi-tema, contraste garantizado por CI) y el primer componente vertical-slice — el `TraceLog` timeline — funcionando, testeado y documentado.

**Architecture:** Monorepo pnpm + Turborepo. `packages/tokens` genera CSS por tema (`@theme inline`) + `tokens.ts` tipado + lock desde una fuente única. `packages/ui` consume esos tokens vía Tailwind v4 y expone componentes Radix-based con variantes `cva`. El `TraceLog` es un compound component (`Root/Header/Body/Row/Code/Detail`) sobre Radix Collapsible + ScrollArea.

**Tech Stack:** TypeScript · pnpm workspaces · Turborepo · Tailwind v4 · Radix UI · class-variance-authority · lucide-react · tsup · Vitest + Testing Library + jest-axe · culori · Changesets · Storybook 8.

## Global Constraints

- **Node** ≥ 20, **pnpm** ≥ 9. Monorepo gestionado con pnpm workspaces + Turborepo.
- **Solo React.** Sin soporte multi-framework.
- **Cero hex/rgba crudo en `packages/ui`** — todo color via token semantic. Enforced por ESLint.
- **`@theme inline`** (nunca `@theme` normal) en el preset Tailwind, o el theming por `[data-theme]` muere en build.
- **Tokens en OKLCH** con fallback hex declarado antes de la línea `oklch()`.
- **Severidad nunca solo por color** — todo `tone` lleva icono + label (WCAG 1.4.1).
- **Contraste mínimo (gate CI, por tema):** texto `fg × surface ≥ 4.5`; status como texto `≥ 4.5`; borde funcional/focus `≥ 3.0`.
- **Temas exhaustivos:** cada bloque `[data-theme]` declara el set semantic completo (no diffs).
- **Scope npm:** `@studio` (placeholder — buscar/reemplazar si cambia).
- **Tema default:** `cockpit` (dark). Segundo tema `test` solo para validar multi-tema.
- **Commits frecuentes**, formato Conventional Commits.

---

## File Structure

```
design-system/
├─ package.json                      # root, workspaces scripts
├─ pnpm-workspace.yaml
├─ turbo.json
├─ .changeset/config.json
├─ packages/
│  ├─ tsconfig/base.json             # tsconfig compartido
│  ├─ eslint-config/index.js         # lint compartido + regla no-hex
│  ├─ tokens/
│  │  ├─ package.json
│  │  ├─ src/primitives.ts           # rampas OKLCH (constante)
│  │  ├─ src/themes.ts               # semantic por tema (cockpit, test) + flag themeable
│  │  ├─ src/contracts.ts            # SEMANTIC_KEYS, THEMEABLE, LOCKED, contrast pairs
│  │  ├─ build.ts                    # genera dist/*
│  │  └─ dist/                       # (generado) theme-*.css, index.css, tokens.ts, tokens.lock.json
│  └─ ui/
│     ├─ package.json
│     ├─ tsup.config.ts
│     ├─ src/styles.css              # @import tailwind + @theme inline
│     ├─ src/lib/cn.ts               # merge de clases
│     ├─ src/trace-log/
│     │  ├─ trace-log.tsx            # compound component
│     │  ├─ trace-log.variants.ts    # cva tone/density
│     │  ├─ trace-log.context.ts     # density context
│     │  ├─ copy.ts                  # labels i18n
│     │  ├─ trace-log.test.tsx       # vitest + jest-axe
│     │  ├─ trace-log.stories.tsx    # Storybook
│     │  └─ README.md                # API · a11y · do/don't
│     └─ src/index.ts                # barrel export
└─ apps/
   └─ docs/                          # Storybook host (config en Task 9)
```

---

### Task 1: Monorepo skeleton + tooling

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.changeset/config.json`, `.gitignore`
- Create: `packages/tsconfig/base.json`, `packages/tsconfig/package.json`
- Create: `packages/eslint-config/index.js`, `packages/eslint-config/package.json`

**Interfaces:**
- Produces: workspace ejecutable — `pnpm install`, `pnpm turbo run build lint test` corren (no-op verde sobre paquetes vacíos). tsconfig base `@studio/tsconfig/base.json`. eslint base `@studio/eslint-config`.

- [ ] **Step 1: Init git + estructura**

```bash
git init
mkdir -p packages/tsconfig packages/eslint-config .changeset apps
```

- [ ] **Step 2: Root `package.json`**

```json
{
  "name": "studio-ds",
  "private": true,
  "packageManager": "pnpm@10.33.2",
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "tokens": "turbo run tokens",
    "changeset": "changeset",
    "version": "changeset version"
  },
  "devDependencies": {
    "turbo": "^2.1.0",
    "typescript": "^5.6.0",
    "@changesets/cli": "^2.27.0"
  }
}
```

- [ ] **Step 3: `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 4: `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "tokens": { "outputs": ["dist/**"] },
    "build": { "dependsOn": ["^build", "tokens"], "outputs": ["dist/**"] },
    "lint": {},
    "test": { "dependsOn": ["tokens"] }
  }
}
```

- [ ] **Step 5: `.gitignore`**

```
node_modules
dist
.turbo
storybook-static
*.log
```

- [ ] **Step 6: `.changeset/config.json`**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

- [ ] **Step 7: Shared tsconfig**

`packages/tsconfig/package.json`:
```json
{ "name": "@studio/tsconfig", "version": "0.0.0", "private": true, "files": ["base.json"] }
```

`packages/tsconfig/base.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true
  }
}
```

- [ ] **Step 8: Shared eslint-config (con regla no-hex)**

`packages/eslint-config/package.json`:
```json
{
  "name": "@studio/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.8.0",
    "@typescript-eslint/parser": "^8.8.0"
  }
}
```

`packages/eslint-config/index.js`:
```js
// Bloquea hex/rgba crudo en código de componentes (deben ser tokens).
const NO_RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: `Literal[value=/${NO_RAW_COLOR.source}/]`,
        message: "Color crudo prohibido en ui — usá un token semantic.",
      },
    ],
  },
};
```

- [ ] **Step 9: Install + verify**

Run: `pnpm install`
Then: `pnpm turbo run build`
Expected: turbo corre sin tareas (no packages con script `build` aún) y termina con código 0.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: monorepo skeleton (pnpm + turborepo + changesets + shared configs)"
```

---

### Task 2: Tokens — fuente única + build (cockpit + test)

**Files:**
- Create: `packages/tokens/package.json`, `packages/tokens/tsconfig.json`
- Create: `packages/tokens/src/primitives.ts`, `src/themes.ts`, `src/contracts.ts`, `build.ts`
- Test (Task 3): `packages/tokens/src/build.test.ts`

**Interfaces:**
- Produces:
  - `dist/theme-cockpit.css`, `dist/theme-test.css` — bloque `[data-theme="…"]{ … ; color-scheme:dark }` con set semantic completo (hex fallback + `oklch()`).
  - `dist/index.css` — `@import "tailwindcss";` + `@theme inline { --color-*: var(--token); ... }` + import de ambos temas.
  - `dist/tokens.ts` — `export const tokens` (objeto por tema) + `export type ThemeableToken`.
  - `dist/tokens.lock.json` — array ordenado de nombres de token públicos.
  - Exports nombrados desde `contracts.ts`: `SEMANTIC_KEYS: string[]`, `THEMEABLE: Set<string>`, `LOCKED: Set<string>`, `CONTRAST_PAIRS: [fg, bg, min][]`, `STATUS_KEYS: string[]`.

> `ponytail:` build propio (~80 líneas) en vez de Style Dictionary. Cubre los 4 outputs con un platform (CSS+TS). Upgrade a Style Dictionary si se necesita salida multiplataforma (iOS/Android) — entonces `build.ts` se reemplaza por `sd.config`.

- [ ] **Step 1: `packages/tokens/package.json`**

```json
{
  "name": "@studio/tokens",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    "./css": "./dist/index.css",
    ".": "./dist/tokens.ts"
  },
  "scripts": {
    "tokens": "tsx build.ts",
    "build": "tsx build.ts",
    "test": "vitest run",
    "lint": "eslint src --max-warnings 0"
  },
  "devDependencies": {
    "@studio/tsconfig": "workspace:*",
    "@studio/eslint-config": "workspace:*",
    "tsx": "^4.19.0",
    "vitest": "^2.1.0",
    "culori": "^4.0.1",
    "typescript": "^5.6.0"
  }
}
```

`packages/tokens/tsconfig.json`:
```json
{ "extends": "@studio/tsconfig/base.json", "include": ["src", "build.ts"] }
```

- [ ] **Step 2: `src/primitives.ts` (rampas OKLCH, constantes)**

```ts
// Cada color = "hexFallback | oklch(...)". El consumidor emite ambas líneas.
export const FONT = {
  sans: "'Manrope', ui-sans-serif, system-ui, sans-serif",
  display: "'Geist', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
};

// Neutros anclados a hue 285, ΔL≈0.04
export const NEUTRAL = {
  "0": "#07070a|oklch(0.13 0.008 285)",
  "1": "#0c0d11|oklch(0.17 0.008 285)",
  "2": "#131418|oklch(0.21 0.010 285)",
  "3": "#191a1f|oklch(0.25 0.012 285)",
  ink: "#f0f0f2|oklch(0.95 0.004 285)",
  dim: "#b4b4be|oklch(0.78 0.008 285)",
  faint: "#7b8799|oklch(0.58 0.016 285)",
  faintDeco: "#5a6478|oklch(0.50 0.034 264)",
};
```

- [ ] **Step 3: `src/contracts.ts` (contratos + pares de contraste)**

```ts
// Lista canónica de keys semantic. Cada tema DEBE declararlas todas.
export const SEMANTIC_KEYS = [
  "bg-base", "bg-elevated", "surface-2", "surface-3", "surface-header", "surface-sunken",
  "ink", "dim", "faint", "faint-deco",
  "border-subtle", "border-default", "border-strong", "border-divider", "ring",
  "accent", "on-accent", "accent-surface", "accent-border",
  "accent-secondary", "on-accent-secondary",
  "ok", "on-ok", "review", "on-review", "warn", "on-warn", "block", "on-block", "info",
  "glow-seed",
] as const;

export type ThemeableTokenName = (typeof SEMANTIC_KEYS)[number];

// Hue de status + ring = system-owned (un cliente solo ajusta L, no rota hue).
export const LOCKED = new Set<string>(["ok", "review", "warn", "block", "info", "ring"]);
export const THEMEABLE = new Set<string>(SEMANTIC_KEYS.filter((k) => !LOCKED.has(k)));

export const STATUS_KEYS = ["ok", "review", "warn", "block", "info"] as const;

// [fg, bg, minRatio] verificados por tema.
export const CONTRAST_PAIRS: [string, string, number][] = [
  ["ink", "bg-base", 4.5], ["ink", "surface-2", 4.5], ["ink", "surface-3", 4.5],
  ["dim", "surface-2", 4.5], ["faint", "surface-2", 4.5],
  ["accent", "surface-2", 4.5], ["on-accent", "accent", 4.5],
  ["ok", "surface-2", 4.5], ["review", "surface-2", 4.5],
  ["warn", "surface-2", 4.5], ["block", "surface-2", 4.5],
  ["border-strong", "surface-2", 3.0], ["ring", "surface-2", 3.0],
];
```

- [ ] **Step 4: `src/themes.ts` (semantic por tema — set completo)**

```ts
import { NEUTRAL } from "./primitives.js";

// Cada valor = "hexFallback|oklch(...)". Set semantic COMPLETO por tema.
export const themes: Record<string, Record<string, string>> = {
  cockpit: {
    "bg-base": NEUTRAL["0"], "bg-elevated": NEUTRAL["1"],
    "surface-2": NEUTRAL["2"], "surface-3": NEUTRAL["3"],
    "surface-header": "#0e0f12|oklch(0.19 0.008 285)",
    "surface-sunken": "#0a0b10|oklch(0.15 0.008 285)",
    "ink": NEUTRAL.ink, "dim": NEUTRAL.dim, "faint": NEUTRAL.faint, "faint-deco": NEUTRAL.faintDeco,
    "border-subtle": "#1d2127|oklch(0.26 0.012 285)",
    "border-default": "#2e2e32|oklch(0.32 0.006 285)",
    "border-strong": "#666670|oklch(0.52 0.008 285)",
    "border-divider": "#23303a|oklch(0.31 0.02 241)",
    "ring": "#23d2d7|oklch(0.78 0.13 198)",
    "accent": "#23d2d7|oklch(0.78 0.13 198)", "on-accent": "#042427|oklch(0.22 0.03 198)",
    "accent-surface": "#0e2b2c|oklch(0.27 0.05 198)", "accent-border": "#1c5557|oklch(0.40 0.07 198)",
    "accent-secondary": "#8f9bff|oklch(0.74 0.13 275)", "on-accent-secondary": "#06091e|oklch(0.18 0.04 275)",
    "ok": "#39E0A0|oklch(0.81 0.16 162)", "on-ok": "#04231a|oklch(0.24 0.04 162)",
    "review": "#6cb8ff|oklch(0.76 0.13 256)", "on-review": "#04122b|oklch(0.20 0.05 256)",
    "warn": "#E8961A|oklch(0.74 0.15 70)", "on-warn": "#2a1600|oklch(0.22 0.05 70)",
    "block": "#ff6b78|oklch(0.72 0.18 19)", "on-block": "#2b0407|oklch(0.22 0.06 19)",
    "info": "#6b7384|oklch(0.55 0.02 270)",
    "glow-seed": "#5fe3e6|oklch(0.88 0.12 192)",
  },
  // Segundo tema: rota brand hue + sube superficies un punto. Status (LOCKED) intactos.
  test: {
    "bg-base": "#0a0810|oklch(0.14 0.012 300)", "bg-elevated": "#100d18|oklch(0.18 0.012 300)",
    "surface-2": "#171320|oklch(0.22 0.014 300)", "surface-3": "#1e1929|oklch(0.26 0.016 300)",
    "surface-header": "#130f1b|oklch(0.20 0.012 300)", "surface-sunken": "#0d0a14|oklch(0.16 0.012 300)",
    "ink": "#f1eff5|oklch(0.95 0.006 300)", "dim": "#b8b4c2|oklch(0.78 0.012 300)",
    "faint": "#827d97|oklch(0.58 0.022 300)", "faint-deco": "#5d566f|oklch(0.50 0.03 300)",
    "border-subtle": "#221d2b|oklch(0.27 0.014 300)", "border-default": "#332d3c|oklch(0.33 0.012 300)",
    "border-strong": "#6b6577|oklch(0.53 0.012 300)", "border-divider": "#352b40|oklch(0.32 0.02 300)",
    "ring": "#23d2d7|oklch(0.78 0.13 198)",
    "accent": "#b07cff|oklch(0.70 0.17 300)", "on-accent": "#190a2b|oklch(0.20 0.06 300)",
    "accent-surface": "#241433|oklch(0.27 0.06 300)", "accent-border": "#4a2c66|oklch(0.40 0.10 300)",
    "accent-secondary": "#7c8cff|oklch(0.70 0.16 275)", "on-accent-secondary": "#06091e|oklch(0.18 0.04 275)",
    "ok": "#39E0A0|oklch(0.81 0.16 162)", "on-ok": "#04231a|oklch(0.24 0.04 162)",
    "review": "#6cb8ff|oklch(0.76 0.13 256)", "on-review": "#04122b|oklch(0.20 0.05 256)",
    "warn": "#E8961A|oklch(0.74 0.15 70)", "on-warn": "#2a1600|oklch(0.22 0.05 70)",
    "block": "#ff6b78|oklch(0.72 0.18 19)", "on-block": "#2b0407|oklch(0.22 0.06 19)",
    "info": "#6b7384|oklch(0.55 0.02 270)",
    "glow-seed": "#c9a8ff|oklch(0.84 0.12 300)",
  },
};
```

- [ ] **Step 5: `build.ts` (genera dist/*)**

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { themes } from "./src/themes.js";
import { SEMANTIC_KEYS } from "./src/contracts.js";
import { FONT } from "./src/primitives.js";

const DIST = new URL("./dist/", import.meta.url);
mkdirSync(DIST, { recursive: true });

const split = (v: string) => v.split("|"); // [hex, oklch]

// 1. theme-*.css (set completo, hex fallback + oklch, color-scheme)
for (const [name, vars] of Object.entries(themes)) {
  const lines = SEMANTIC_KEYS.map((k) => {
    const [hex, ok] = split(vars[k]);
    return `  --${k}: ${hex};\n  --${k}: ${ok};`;
  });
  const css = `[data-theme="${name}"] {\n  color-scheme: dark;\n${lines.join("\n")}\n}\n`;
  writeFileSync(new URL(`theme-${name}.css`, DIST), css);
}

// 2. index.css — tailwind + @theme INLINE (var(--token), no hex) + fuentes
const themeMap = SEMANTIC_KEYS.map((k) => `  --color-${k}: var(--${k});`).join("\n");
const fontMap = `  --font-sans: ${FONT.sans};\n  --font-display: ${FONT.display};\n  --font-mono: ${FONT.mono};`;
const imports = Object.keys(themes).map((n) => `@import "./theme-${n}.css";`).join("\n");
writeFileSync(
  new URL("index.css", DIST),
  `@import "tailwindcss";\n${imports}\n\n@theme inline {\n${themeMap}\n${fontMap}\n}\n`,
);

// 3. tokens.ts (objeto por tema, solo hex para consumo JS) + tipo
const tokensObj = Object.fromEntries(
  Object.entries(themes).map(([n, vars]) => [
    n, Object.fromEntries(SEMANTIC_KEYS.map((k) => [k, split(vars[k])[0]])),
  ]),
);
writeFileSync(
  new URL("tokens.ts", DIST),
  `export const tokens = ${JSON.stringify(tokensObj, null, 2)} as const;\n` +
    `export type ThemeableToken = ${SEMANTIC_KEYS.map((k) => `"${k}"`).join(" | ")};\n`,
);

// 4. tokens.lock.json
writeFileSync(
  new URL("tokens.lock.json", DIST),
  JSON.stringify([...SEMANTIC_KEYS].sort(), null, 2) + "\n",
);

console.log(`tokens: built ${Object.keys(themes).length} themes, ${SEMANTIC_KEYS.length} keys`);
```

- [ ] **Step 6: Build + verify**

Run: `pnpm --filter @studio/tokens tokens`
Expected: imprime `tokens: built 2 themes, 31 keys` y crea `dist/theme-cockpit.css`, `dist/theme-test.css`, `dist/index.css`, `dist/tokens.ts`, `dist/tokens.lock.json`. `index.css` debe contener `@theme inline` y `--color-accent: var(--accent);` (NO un hex).

- [ ] **Step 7: Commit**

```bash
git add packages/tokens
git commit -m "feat(tokens): OKLCH source + multi-theme build (@theme inline, cockpit + test)"
```

---

### Task 3: Tokens — gates de CI (contraste + contrato themeable)

**Files:**
- Create: `packages/tokens/src/build.test.ts`

**Interfaces:**
- Consumes: `themes` (themes.ts), `SEMANTIC_KEYS/THEMEABLE/LOCKED/CONTRAST_PAIRS` (contracts.ts), `culori`.
- Produces: suite vitest que falla si un tema baja contraste, omite una key, o pisa una locked.

- [ ] **Step 1: Write the failing test**

`packages/tokens/src/build.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { wcagContrast } from "culori";
import { themes } from "./themes.js";
import { SEMANTIC_KEYS, CONTRAST_PAIRS, THEMEABLE, LOCKED } from "./contracts.js";

const hex = (theme: Record<string, string>, key: string) => theme[key].split("|")[0];

describe("token contracts", () => {
  for (const [name, vars] of Object.entries(themes)) {
    it(`${name}: declara el set semantic completo`, () => {
      expect(Object.keys(vars).sort()).toEqual([...SEMANTIC_KEYS].sort());
    });

    it(`${name}: solo keys conocidas (themeable ∪ locked)`, () => {
      for (const k of Object.keys(vars)) {
        expect(THEMEABLE.has(k) || LOCKED.has(k)).toBe(true);
      }
    });

    for (const [fg, bg, min] of CONTRAST_PAIRS) {
      it(`${name}: contraste ${fg}×${bg} ≥ ${min}`, () => {
        const ratio = wcagContrast(hex(vars, fg), hex(vars, bg));
        expect(ratio).toBeGreaterThanOrEqual(min);
      });
    }
  }

  it("status (LOCKED) idéntico entre temas (hue no rota)", () => {
    const keys = ["ok", "review", "warn", "block"];
    for (const k of keys) {
      const values = Object.values(themes).map((t) => hex(t, k));
      expect(new Set(values).size).toBe(1);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails (si hay algún fallo de contraste)**

Run: `pnpm --filter @studio/tokens test`
Expected: PASS si los valores de Task 2 cumplen; si algún par reprueba, FAIL nombrando `tema: contraste fg×bg`. **Arreglar el valor del token en `themes.ts` hasta verde** (subir L del fg o de la surface). No relajar el umbral.

- [ ] **Step 3: Run test to verify it passes**

Run: `pnpm --filter @studio/tokens test`
Expected: PASS — todos los pares, completitud y status-lock.

- [ ] **Step 4: Commit**

```bash
git add packages/tokens/src/build.test.ts packages/tokens/src/themes.ts
git commit -m "test(tokens): CI gate de contraste + contrato themeable/exhaustivo"
```

---

### Task 4: UI package scaffold + Tailwind v4 + `cn`

**Files:**
- Create: `packages/ui/package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `vitest.setup.ts`
- Create: `packages/ui/src/styles.css`, `src/lib/cn.ts`, `src/lib/cn.test.ts`, `src/index.ts`

**Interfaces:**
- Consumes: `@studio/tokens/css`.
- Produces: `cn(...inputs): string` (merge tailwind-aware). Build tsup → `dist`. Vitest con jsdom + jest-axe disponible globalmente.

- [ ] **Step 1: `packages/ui/package.json`**

```json
{
  "name": "@studio/ui",
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./dist/index.js", "./styles.css": "./src/styles.css" },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "lint": "eslint src --max-warnings 0"
  },
  "dependencies": {
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.451.0"
  },
  "peerDependencies": { "react": "^18.3.0 || ^19.0.0", "react-dom": "^18.3.0 || ^19.0.0" },
  "devDependencies": {
    "@studio/tokens": "workspace:*",
    "@studio/tsconfig": "workspace:*",
    "@studio/eslint-config": "workspace:*",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "jest-axe": "^9.0.0",
    "jsdom": "^25.0.0",
    "react": "^18.3.0", "react-dom": "^18.3.0",
    "@types/react": "^18.3.0", "@types/jest-axe": "^3.5.0",
    "tailwindcss": "^4.0.0", "@tailwindcss/postcss": "^4.0.0",
    "tsup": "^8.3.0", "vitest": "^2.1.0", "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Config files**

`packages/ui/tsconfig.json`:
```json
{ "extends": "@studio/tsconfig/base.json", "include": ["src"] }
```

`packages/ui/tsup.config.ts`:
```ts
import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"], dts: true, clean: true, external: ["react", "react-dom"],
});
```

`packages/ui/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
});
```

`packages/ui/vitest.setup.ts`:
```ts
import "@testing-library/react";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);
```

- [ ] **Step 3: `src/styles.css`**

```css
@import "@studio/tokens/css";
```

- [ ] **Step 4: Write the failing test for `cn`**

`src/lib/cn.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cn } from "./cn.js";

describe("cn", () => {
  it("mergea y dedup-resuelve clases tailwind en conflicto", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-ink", false && "hidden", "font-mono")).toBe("text-ink font-mono");
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `pnpm --filter @studio/ui test`
Expected: FAIL — `cn` no existe.

- [ ] **Step 6: Implement `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
```

- [ ] **Step 7: `src/index.ts` (barrel inicial)**

```ts
export { cn } from "./lib/cn.js";
```

- [ ] **Step 8: Run tests + build**

Run: `pnpm --filter @studio/ui test` → Expected: PASS
Run: `pnpm --filter @studio/ui build` → Expected: emite `dist/index.js` + `dist/index.d.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): scaffold paquete + Tailwind v4 + util cn"
```

---

### Task 5: TraceLog — variants + Root/Header/Body + density context

**Files:**
- Create: `packages/ui/src/trace-log/trace-log.variants.ts`, `trace-log.context.ts`, `trace-log.tsx`
- Create (parcial): `trace-log.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Produces:
  - `type Tone = "info" | "ok" | "review" | "warn" | "block"`
  - `type Density = "comfortable" | "compact"`
  - `rowVariants({ tone }): string` y `bodyVariants({ density }): string` (cva)
  - `TraceLog.Root` (props: `density?: Density`, `streaming?: boolean`, HTML div), `TraceLog.Header` (props: `title: string`, `hint?: string`), `TraceLog.Body`.
  - Context `useDensity(): Density`.

- [ ] **Step 1: `trace-log.variants.ts`**

```ts
import { cva } from "class-variance-authority";

export type Tone = "info" | "ok" | "review" | "warn" | "block";
export type Density = "comfortable" | "compact";

// border-l-{tone} y text-{tone} requieren --color-{tone} (mapeados en @theme inline).
export const rowVariants = cva("border-l-2 pl-3", {
  variants: {
    tone: {
      info: "border-info",
      ok: "border-ok",
      review: "border-review",
      warn: "border-warn",
      block: "border-block",
    },
  },
  defaultVariants: { tone: "info" },
});

export const toneText: Record<Tone, string> = {
  info: "text-info", ok: "text-ok", review: "text-review", warn: "text-warn", block: "text-block",
};

export const bodyVariants = cva("flex flex-col px-3.5 py-3", {
  variants: { density: { comfortable: "gap-3", compact: "gap-1.5" } },
  defaultVariants: { density: "comfortable" },
});
```

- [ ] **Step 2: `trace-log.context.ts`**

```ts
import { createContext, useContext } from "react";
import type { Density } from "./trace-log.variants.js";

export const DensityContext = createContext<Density>("comfortable");
export const useDensity = (): Density => useContext(DensityContext);
```

- [ ] **Step 3: Write the failing test (Root/Header/Body)**

`trace-log.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TraceLog } from "./trace-log.js";

describe("TraceLog Root/Header/Body", () => {
  it("renderiza title + hint y aplica role=log", () => {
    render(
      <TraceLog.Root>
        <TraceLog.Header title="Pipeline de una consulta" hint="tu lista → mapa" />
        <TraceLog.Body />
      </TraceLog.Root>,
    );
    expect(screen.getByText("Pipeline de una consulta")).toBeDefined();
    expect(screen.getByText("tu lista → mapa")).toBeDefined();
    expect(screen.getByRole("log")).toBeDefined();
  });

  it("streaming activa aria-live=polite", () => {
    render(<TraceLog.Root streaming><TraceLog.Body /></TraceLog.Root>);
    expect(screen.getByRole("log").getAttribute("aria-live")).toBe("polite");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm --filter @studio/ui test trace-log`
Expected: FAIL — `TraceLog` no existe.

- [ ] **Step 5: Implement `trace-log.tsx` (Root/Header/Body — Row en Task 6)**

```tsx
import * as React from "react";
import { cn } from "../lib/cn.js";
import { DensityContext } from "./trace-log.context.js";
import { bodyVariants, type Density } from "./trace-log.variants.js";

interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: Density;
  streaming?: boolean;
}

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  ({ density = "comfortable", streaming = false, className, children, ...rest }, ref) => (
    <DensityContext.Provider value={density}>
      <section
        ref={ref}
        data-density={density}
        className={cn(
          "overflow-hidden rounded-xl border border-border-subtle bg-surface-2",
          className,
        )}
        {...rest}
      >
        {children}
      </section>
    </DensityContext.Provider>
  ),
);
Root.displayName = "TraceLog.Root";

interface HeaderProps {
  title: string;
  hint?: string;
}

const Header = ({ title, hint }: HeaderProps) => (
  <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-header px-3.5 py-2.5">
    <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
    {hint ? <span className="font-mono text-[11px] text-faint">{hint}</span> : null}
  </div>
);
Header.displayName = "TraceLog.Header";

interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  streaming?: boolean;
}

const Body = ({ className, children, ...rest }: BodyProps) => {
  const density = React.useContext(DensityContext);
  // streaming se setea desde Root via data-attr; aquí solo expone role=log.
  return (
    <div role="log" className={cn(bodyVariants({ density }), className)} {...rest}>
      {children}
    </div>
  );
};
Body.displayName = "TraceLog.Body";

// streaming: el aria-live vive en el role=log. Root pasa streaming al Body via clone.
const RootWithStreaming = React.forwardRef<HTMLDivElement, RootProps>((props, ref) => {
  const { streaming, children, ...rest } = props;
  const mapped = React.Children.map(children, (child) =>
    React.isValidElement(child) && (child.type as { displayName?: string })?.displayName === "TraceLog.Body"
      ? React.cloneElement(child as React.ReactElement<BodyProps>, {
          "aria-live": streaming ? "polite" : undefined,
        } as Partial<BodyProps> & { "aria-live"?: "polite" })
      : child,
  );
  return <Root ref={ref} streaming={streaming} {...rest}>{mapped}</Root>;
});
RootWithStreaming.displayName = "TraceLog.Root";

export const TraceLog = { Root: RootWithStreaming, Header, Body };
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter @studio/ui test trace-log`
Expected: PASS (role=log presente; streaming→aria-live=polite).

- [ ] **Step 7: Export + commit**

`src/index.ts`:
```ts
export { cn } from "./lib/cn.js";
export { TraceLog } from "./trace-log/trace-log.js";
export type { Tone, Density } from "./trace-log/trace-log.variants.js";
```

```bash
git add packages/ui/src
git commit -m "feat(ui): TraceLog Root/Header/Body + density context"
```

---

### Task 6: TraceLog — Row (tones + icono + meta) + Code

**Files:**
- Modify: `packages/ui/src/trace-log/trace-log.tsx`, `trace-log.test.tsx`
- Create: `packages/ui/src/trace-log/copy.ts`

**Interfaces:**
- Consumes: `rowVariants`, `toneText`, `Tone`.
- Produces:
  - `TraceLog.Row` (props: `tone?: Tone`, `agent: string`, `step?: string`, `timestamp?: string`, children).
  - `TraceLog.Code` (inline `<code>`).
  - Cada Row pinta un **icono por tone** (lucide) + un **label textual** del tone (de `copy.ts`) — no solo color.

- [ ] **Step 1: `copy.ts` (labels externalizados)**

```ts
import type { Tone } from "./trace-log.variants.js";
export const toneLabel: Record<Tone, string> = {
  info: "info", ok: "ok", review: "revisar", warn: "advertencia", block: "bloqueo",
};
```

- [ ] **Step 2: Write the failing test (tones + icono accesible)**

Añadir a `trace-log.test.tsx`:
```tsx
import { toneLabel } from "./copy.js";

describe("TraceLog.Row", () => {
  it("aplica el borde por tone y muestra label accesible (no solo color)", () => {
    render(
      <TraceLog.Root>
        <TraceLog.Body>
          <TraceLog.Row tone="block" agent="VALIDATE">
            Predio <TraceLog.Code>142099</TraceLog.Code> no existe.
          </TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>,
    );
    const row = screen.getByText(/no existe/).closest("[data-tone]")!;
    expect(row.getAttribute("data-tone")).toBe("block");
    expect(row.className).toContain("border-block");
    // label textual del tone presente para lectores de pantalla
    expect(screen.getByText(toneLabel.block, { selector: ".sr-only,*" })).toBeDefined();
    expect(screen.getByText("VALIDATE")).toBeDefined();
    expect(screen.getByText("142099").tagName).toBe("CODE");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @studio/ui test trace-log`
Expected: FAIL — `TraceLog.Row`/`Code` no existen.

- [ ] **Step 4: Implement Row + Code (añadir a `trace-log.tsx`)**

```tsx
import { Info, CheckCircle2, Eye, AlertTriangle, OctagonX } from "lucide-react";
import { rowVariants, toneText, type Tone } from "./trace-log.variants.js";
import { toneLabel } from "./copy.js";

const toneIcon: Record<Tone, React.ComponentType<{ className?: string }>> = {
  info: Info, ok: CheckCircle2, review: Eye, warn: AlertTriangle, block: OctagonX,
};

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  agent: string;
  step?: string;
  timestamp?: string;
}

const Row = ({ tone = "info", agent, step, timestamp, className, children, ...rest }: RowProps) => {
  const Icon = toneIcon[tone];
  const meta = timestamp ?? step ?? "";
  return (
    <div data-tone={tone} className={cn(rowVariants({ tone }), className)} {...rest}>
      <div className="flex items-center justify-between gap-2 font-mono text-[8.5px] uppercase tracking-wide text-faint">
        <span className={cn("flex items-center gap-1.5 font-bold", toneText[tone])}>
          <Icon className="size-3" aria-hidden />
          <span className="sr-only">{toneLabel[tone]}: </span>
          {agent}
        </span>
        {meta ? <span>{meta}</span> : null}
      </div>
      <div className="mt-1 text-xs leading-relaxed text-ink">{children}</div>
    </div>
  );
};
Row.displayName = "TraceLog.Row";

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-accent-surface px-1.5 py-px font-mono text-[11px] text-review">{children}</code>
);
Code.displayName = "TraceLog.Code";
```

Actualizar el export:
```tsx
export const TraceLog = { Root: RootWithStreaming, Header, Body, Row, Code };
```

> Nota: requiere `.sr-only` (clase Tailwind estándar) — disponible con Tailwind v4 por defecto.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @studio/ui test trace-log`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/trace-log
git commit -m "feat(ui): TraceLog.Row con icono+label por tone (a11y) + Code"
```

---

### Task 7: TraceLog — Detail (Radix Collapsible) + ScrollArea + estados empty/truncated

**Files:**
- Modify: `packages/ui/src/trace-log/trace-log.tsx`, `trace-log.test.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-collapsible`, `@radix-ui/react-scroll-area`.
- Produces:
  - `TraceLog.Detail` — contenido expandible dentro de una Row (Radix Collapsible, operable por teclado).
  - `TraceLog.Body` envuelto en ScrollArea con `maxHeight?: number` opcional.
  - `TraceLog.Empty` (mensaje vacío) y `TraceLog.Truncated` (con `onShowAll?: () => void`).

- [ ] **Step 1: Write the failing test (expand por teclado + empty)**

Añadir a `trace-log.test.tsx`:
```tsx
import userEvent from "@testing-library/user-event";

describe("TraceLog.Detail + estados", () => {
  it("expande/colapsa el detalle con teclado", async () => {
    const user = userEvent.setup();
    render(
      <TraceLog.Root>
        <TraceLog.Body>
          <TraceLog.Row tone="info" agent="PARSER">
            Lee líneas
            <TraceLog.Detail>138 IDs únicos tras dedupe</TraceLog.Detail>
          </TraceLog.Row>
        </TraceLog.Body>
      </TraceLog.Root>,
    );
    const trigger = screen.getByRole("button", { name: /detalle/i });
    expect(screen.queryByText(/138 IDs/)).toBeNull();
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText(/138 IDs/)).toBeDefined();
  });

  it("Empty muestra mensaje", () => {
    render(<TraceLog.Root><TraceLog.Body><TraceLog.Empty>Sin eventos</TraceLog.Empty></TraceLog.Body></TraceLog.Root>);
    expect(screen.getByText("Sin eventos")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @studio/ui test trace-log`
Expected: FAIL — `TraceLog.Detail`/`Empty` no existen.

- [ ] **Step 3: Implement Detail + Empty + Truncated + ScrollArea (añadir a `trace-log.tsx`)**

```tsx
import * as Collapsible from "@radix-ui/react-collapsible";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { ChevronDown } from "lucide-react";
import { toneLabel as _toneLabel } from "./copy.js";

const Detail = ({ children }: { children: React.ReactNode }) => (
  <Collapsible.Root className="mt-1">
    <Collapsible.Trigger className="inline-flex items-center gap-1 font-mono text-[10px] text-faint hover:text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
      <ChevronDown className="size-3" aria-hidden /> detalle
    </Collapsible.Trigger>
    <Collapsible.Content className="mt-2 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-[11.5px] leading-relaxed text-dim">
      {children}
    </Collapsible.Content>
  </Collapsible.Root>
);
Detail.displayName = "TraceLog.Detail";

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="px-1 py-6 text-center text-xs text-faint">{children}</div>
);
Empty.displayName = "TraceLog.Empty";

const Truncated = ({ children, onShowAll }: { children: React.ReactNode; onShowAll?: () => void }) => (
  <button
    type="button"
    onClick={onShowAll}
    className="mt-1 w-full rounded-md border border-border-subtle py-1.5 text-[11px] text-dim hover:border-border-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {children}
  </button>
);
Truncated.displayName = "TraceLog.Truncated";
```

Reemplazar `Body` para envolver en ScrollArea cuando hay `maxHeight`:
```tsx
interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: number;
}

const Body = ({ className, children, maxHeight, ...rest }: BodyProps) => {
  const density = React.useContext(DensityContext);
  const inner = (
    <div role="log" className={cn(bodyVariants({ density }), className)} {...rest}>
      {children}
    </div>
  );
  if (!maxHeight) return inner;
  return (
    <ScrollArea.Root style={{ height: maxHeight }} className="overflow-hidden">
      <ScrollArea.Viewport className="size-full">{inner}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" className="flex w-2 touch-none select-none">
        <ScrollArea.Thumb className="flex-1 rounded-full bg-border-divider" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};
Body.displayName = "TraceLog.Body";
```

Actualizar export:
```tsx
export const TraceLog = { Root: RootWithStreaming, Header, Body, Row, Code, Detail, Empty, Truncated };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @studio/ui test trace-log`
Expected: PASS (Enter expande el Collapsible; Empty visible).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/trace-log
git commit -m "feat(ui): TraceLog Detail (Collapsible) + ScrollArea + estados empty/truncated"
```

---

### Task 8: TraceLog — a11y gate (jest-axe) + README

**Files:**
- Modify: `packages/ui/src/trace-log/trace-log.test.tsx`
- Create: `packages/ui/src/trace-log/README.md`

**Interfaces:**
- Produces: test axe sobre un TraceLog completo (todos los tones + detail + streaming). README con API, contrato a11y, do/don't.

- [ ] **Step 1: Write the failing test (axe)**

Añadir a `trace-log.test.tsx`:
```tsx
import { axe } from "jest-axe";

it("no tiene violaciones axe con todos los tones + detail + streaming", async () => {
  const { container } = render(
    <TraceLog.Root streaming density="comfortable">
      <TraceLog.Header title="Pipeline" hint="tu lista → mapa" />
      <TraceLog.Body maxHeight={300}>
        <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
          Lee líneas <TraceLog.Code>predio</TraceLog.Code>
          <TraceLog.Detail>138 IDs únicos</TraceLog.Detail>
        </TraceLog.Row>
        <TraceLog.Row tone="ok" agent="ARCGIS" timestamp="12:04:01">Responde GeoJSON.</TraceLog.Row>
        <TraceLog.Row tone="review" agent="HUMAN" step="paso 3">Requiere revisión.</TraceLog.Row>
        <TraceLog.Row tone="warn" agent="COLOR" step="paso 4">3 sin geometría.</TraceLog.Row>
        <TraceLog.Row tone="block" agent="VALIDATE" step="error">Predio inexistente.</TraceLog.Row>
      </TraceLog.Body>
    </TraceLog.Root>,
  );
  expect(await axe(container)).toHaveNoViolations();
});
```

- [ ] **Step 2: Run test**

Run: `pnpm --filter @studio/ui test trace-log`
Expected: PASS. Si axe reporta (ej. contraste, roles), corregir el componente — no silenciar la regla.

- [ ] **Step 3: Write `README.md`**

```markdown
# TraceLog

Timeline de eventos/log para vistas de agent-ops. Compound component sobre Radix.

## API
- `TraceLog.Root` — `density?: "comfortable" | "compact"`, `streaming?: boolean`.
- `TraceLog.Header` — `title: string`, `hint?: string`.
- `TraceLog.Body` — `maxHeight?: number` (activa scroll).
- `TraceLog.Row` — `tone?: "info"|"ok"|"review"|"warn"|"block"`, `agent: string`, `step?`, `timestamp?`.
- `TraceLog.Code` · `TraceLog.Detail` · `TraceLog.Empty` · `TraceLog.Truncated`.

## Contrato a11y
- `Body` expone `role="log"`; con `streaming`, `aria-live="polite"`.
- Cada `Row` lleva icono + label textual del tone (`.sr-only`) — la severidad nunca es solo color.
- `Detail` es Radix Collapsible: operable con Enter/Espacio, focus ring vía `--ring`.

## Do / Don't
- ✅ Usar `tone` para severidad; ✅ `streaming` solo mientras hay proceso vivo.
- ❌ No poner texto de color hardcodeado; ❌ no usar `Detail` para contenido crítico siempre-visible.
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/trace-log
git commit -m "test(ui): gate axe del TraceLog + README (API/a11y/do-don't)"
```

---

### Task 9: Storybook — stories por estado bajo 2 temas

**Files:**
- Create: `apps/docs/package.json`, `.storybook/main.ts`, `.storybook/preview.tsx`, `postcss.config.mjs`
- Create: `packages/ui/src/trace-log/trace-log.stories.tsx`

**Interfaces:**
- Consumes: `@studio/ui`, `@studio/ui/styles.css`.
- Produces: Storybook con un toolbar de tema (`cockpit`/`test`) y una story por estado (default, compact, streaming, empty, truncated, allTones).

- [ ] **Step 1: `apps/docs/package.json`**

```json
{
  "name": "@studio/docs",
  "private": true,
  "scripts": { "storybook": "storybook dev -p 6006", "build": "storybook build" },
  "dependencies": { "@studio/ui": "workspace:*", "react": "^18.3.0", "react-dom": "^18.3.0" },
  "devDependencies": {
    "@studio/tokens": "workspace:*",
    "storybook": "^8.3.0", "@storybook/react-vite": "^8.3.0", "@storybook/addon-a11y": "^8.3.0",
    "@tailwindcss/postcss": "^4.0.0", "tailwindcss": "^4.0.0", "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Config Storybook**

`apps/docs/.storybook/main.ts`:
```ts
import type { StorybookConfig } from "@storybook/react-vite";
const config: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
};
export default config;
```

`apps/docs/postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`apps/docs/.storybook/preview.tsx`:
```tsx
import type { Preview } from "@storybook/react";
import "@studio/ui/styles.css";

const preview: Preview = {
  globalTypes: {
    theme: { defaultValue: "cockpit", toolbar: { items: ["cockpit", "test"], title: "Tema" } },
  },
  decorators: [
    (Story, ctx) => (
      <div data-theme={ctx.globals.theme} style={{ background: "var(--bg-base)", padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};
export default preview;
```

- [ ] **Step 3: `trace-log.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { TraceLog } from "./trace-log.js";

const meta: Meta<typeof TraceLog.Root> = { title: "Agent-ops/TraceLog", component: TraceLog.Root };
export default meta;
type S = StoryObj<typeof TraceLog.Root>;

const Sample = (props: React.ComponentProps<typeof TraceLog.Root>) => (
  <TraceLog.Root {...props}>
    <TraceLog.Header title="Pipeline de una consulta" hint="tu lista → mapa" />
    <TraceLog.Body>
      <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
        Lee líneas <TraceLog.Code>predio</TraceLog.Code>
        <TraceLog.Detail>138 IDs únicos tras dedupe</TraceLog.Detail>
      </TraceLog.Row>
      <TraceLog.Row tone="ok" agent="ARCGIS" timestamp="12:04:01">Responde GeoJSON.</TraceLog.Row>
      <TraceLog.Row tone="review" agent="HUMAN" step="paso 3">Requiere revisión.</TraceLog.Row>
      <TraceLog.Row tone="warn" agent="COLOR" step="paso 4">3 sin geometría.</TraceLog.Row>
      <TraceLog.Row tone="block" agent="VALIDATE" step="error">Predio inexistente.</TraceLog.Row>
    </TraceLog.Body>
  </TraceLog.Root>
);

export const Default: S = { render: () => <Sample /> };
export const Compact: S = { render: () => <Sample density="compact" /> };
export const Streaming: S = { render: () => <Sample streaming /> };
export const Empty: S = {
  render: () => (
    <TraceLog.Root><TraceLog.Header title="Pipeline" /><TraceLog.Body><TraceLog.Empty>Sin eventos todavía</TraceLog.Empty></TraceLog.Body></TraceLog.Root>
  ),
};
```

- [ ] **Step 4: Verify**

Run: `pnpm --filter @studio/docs storybook`
Expected: Storybook abre en `:6006`, muestra las stories, el toolbar cambia `cockpit`/`test` y el addon-a11y no reporta violaciones en `Default`.

- [ ] **Step 5: Commit**

```bash
git add apps/docs packages/ui/src/trace-log/trace-log.stories.tsx
git commit -m "docs(ui): Storybook + stories del TraceLog por estado y tema"
```

---

### Task 10: Changeset + verificación final del pipeline

**Files:**
- Create: `.changeset/initial-foundation.md`

**Interfaces:**
- Produces: changeset inicial; `pnpm turbo run build lint test` verde de punta a punta.

- [ ] **Step 1: Changeset**

`.changeset/initial-foundation.md`:
```markdown
---
"@studio/tokens": minor
"@studio/ui": minor
---

Fundación del Studio DS: tokens OKLCH multi-tema (@theme inline, gate de contraste) + componente TraceLog.
```

- [ ] **Step 2: Verificación completa**

Run: `pnpm turbo run tokens build lint test`
Expected: todas las tareas PASS — tokens generados, ui y docs buildeados, lint sin hex crudo, vitest verde (tokens + ui), axe sin violaciones.

- [ ] **Step 3: Commit**

```bash
git add .changeset
git commit -m "chore: changeset inicial de la fundación del Studio DS"
```

---

## Self-Review

**1. Spec coverage:**
- Monorepo (spec §3) → Task 1. ✅
- Tokens 3 capas + OKLCH + @theme inline + themeable + pipeline + lock (spec §4) → Tasks 2–3. ✅
- Modelo de componente (cva, Radix, forwardRef, co-localización) (spec §5) → Tasks 5–8. ✅
- Trace/Log slice: tones+icono, Collapsible, ScrollArea, streaming, empty/truncated, a11y, copy, README (spec §6) → Tasks 6–8. ✅
- Gobernanza: lint no-hex, axe, contraste CI, Changesets (spec §7) → Tasks 1,3,8,10. ✅
- WebGL (spec §8) → fuera de scope (sub-proyecto #3, no en este plan). ✅ intencional.
- Done criteria (spec §10): 5 tones+icono (T6), expand teclado (T7), streaming (T5/T7), empty/truncated (T7), axe (T8), stories (T9), solo semantic/lint (T1/T4), 2 temas @theme inline (T2/T9), gate contraste (T3). ✅
- Decomposición/roadmap (spec §11) → este plan = sub-proyecto #1. ✅

**2. Placeholder scan:** sin TBD/TODO; todo step con código o comando concreto. ✅

**3. Type consistency:** `Tone`/`Density` definidos en `trace-log.variants.ts` y reusados en context, component, copy, tests. `TraceLog` namespace crece consistente (Root/Header/Body→+Row/Code→+Detail/Empty/Truncated). `SEMANTIC_KEYS` única fuente para build + tests + tipo. `cn` firma estable. ✅

## Notas de decisión abierta (heredadas del spec)
- **Style Dictionary vs build TS** — el plan usa build TS (`ponytail:`). Si se requiere SD, reemplazar `build.ts` por config SD en Task 2 (resto del plan no cambia: consume `dist/*`).
- **Scope `@studio`** — placeholder; buscar/reemplazar antes de publicar.
- **Hue `review`** — azul `#6cb8ff` fijado en `themes.ts`.
