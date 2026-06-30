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
    if (!vars[k]) throw new Error(`theme ${name}: missing token ${k}`);
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
