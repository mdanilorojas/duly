import { mkdirSync, writeFileSync } from "node:fs";
import { themes, LIGHT_THEMES } from "./src/themes.js";
import { SEMANTIC_KEYS } from "./src/contracts.js";
import { FONT } from "./src/primitives.js";

const DIST = new URL("./dist/", import.meta.url);
mkdirSync(DIST, { recursive: true });

const split = (v: string) => v.split("|"); // [hex, oklch]

// Tema por defecto: su set de variables también se aplica en :root (sin data-theme).
const DEFAULT_THEME = "cockpit";

// 1. theme-*.css (set completo, hex fallback + oklch, color-scheme).
//    El tema por defecto aplica bajo :root Y [data-theme="..."]; el resto solo bajo su data-theme.
for (const [name, vars] of Object.entries(themes)) {
  const lines = SEMANTIC_KEYS.map((k) => {
    if (!vars[k]) throw new Error(`theme ${name}: missing token ${k}`);
    const [hex, ok] = split(vars[k]);
    if (!hex || !ok) throw new Error(`theme ${name}: malformed token ${k} (expected "hex|oklch")`);
    return `  --${k}: ${hex};\n  --${k}: ${ok};`;
  });
  const selector = name === DEFAULT_THEME ? `:root, [data-theme="${name}"]` : `[data-theme="${name}"]`;
  const scheme = LIGHT_THEMES.has(name) ? "light" : "dark";
  const css = `${selector} {\n  color-scheme: ${scheme};\n${lines.join("\n")}\n}\n`;
  writeFileSync(new URL(`theme-${name}.css`, DIST), css);
}

// 2. theme.css — @theme inline (var(--token), no hex) + fuentes. Mapea el namespace de color
//    de Tailwind sin arrastrar el motor/preflight, para que @studio/ui lo reutilice.
const themeMap = SEMANTIC_KEYS.map((k) => `  --color-${k}: var(--${k});`).join("\n");
const fontMap = `  --font-sans: ${FONT.sans};\n  --font-display: ${FONT.display};\n  --font-mono: ${FONT.mono};`;
const themeBlock = `@theme inline {\n${themeMap}\n${fontMap}\n}\n`;
writeFileSync(new URL("theme.css", DIST), themeBlock);

// 3. index.css — bundle completo standalone: tailwind (incl. preflight) + temas + @theme inline.
const imports = Object.keys(themes).map((n) => `@import "./theme-${n}.css";`).join("\n");
writeFileSync(
  new URL("index.css", DIST),
  `@import "tailwindcss";\n${imports}\n\n${themeBlock}`,
);

// 4. tokens.js + tokens.d.ts (objeto por tema, solo hex para consumo JS) + tipo.
const tokensObj = Object.fromEntries(
  Object.entries(themes).map(([n, vars]) => [
    n, Object.fromEntries(SEMANTIC_KEYS.map((k) => [k, split(vars[k])[0]])),
  ]),
);
writeFileSync(
  new URL("tokens.js", DIST),
  `export const tokens = ${JSON.stringify(tokensObj, null, 2)};\n`,
);
const themeUnion = Object.keys(themes).map((n) => `"${n}"`).join(" | ");
const tokenUnion = SEMANTIC_KEYS.map((k) => `"${k}"`).join(" | ");
writeFileSync(
  new URL("tokens.d.ts", DIST),
  `export type ThemeableToken = ${tokenUnion};\n` +
    `export declare const tokens: Record<${themeUnion}, Record<ThemeableToken, string>>;\n`,
);

// 5. tokens.lock.json
writeFileSync(
  new URL("tokens.lock.json", DIST),
  JSON.stringify([...SEMANTIC_KEYS].sort(), null, 2) + "\n",
);

console.log(`tokens: built ${Object.keys(themes).length} themes, ${SEMANTIC_KEYS.length} keys`);
