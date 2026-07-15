import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { themes, LIGHT_THEMES } from "./src/themes.js";
import { SEMANTIC_KEYS, LOCKED, CONTRAST_PAIRS } from "./src/contracts.js";
import { FONT, MOTION } from "./src/primitives.js";
import { vizPalettes, VIZ_CAT_SLOTS, VIZ_SEQ_STEPS } from "./src/viz.js";

// Nombres de las variables de data-viz, en orden estable (cat 1..8, seq 1..7).
const VIZ_KEYS = [
  ...Array.from({ length: VIZ_CAT_SLOTS }, (_, i) => `viz-cat-${i + 1}`),
  ...Array.from({ length: VIZ_SEQ_STEPS }, (_, i) => `viz-seq-${i + 1}`),
];
const vizValues = (theme: string): string[] => {
  const p = vizPalettes[theme];
  if (!p) throw new Error(`theme ${theme}: missing viz palette (src/viz.ts)`);
  if (p.cat.length !== VIZ_CAT_SLOTS || p.seq.length !== VIZ_SEQ_STEPS)
    throw new Error(`theme ${theme}: viz palette wrong length`);
  return [...p.cat, ...p.seq];
};

const DIST = new URL("./dist/", import.meta.url);
// Clean first: writeFileSync only adds/overwrites, so a renamed/removed theme
// (or stale key) would otherwise leave orphaned files in the published tarball.
rmSync(DIST, { recursive: true, force: true });
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
  // Data-viz: mismas reglas de emisión (hex fallback + oklch) que los semantic.
  const vizLines = vizValues(name).map((v, i) => {
    const [hexV, ok] = split(v);
    if (!hexV || !ok) throw new Error(`theme ${name}: malformed viz token ${VIZ_KEYS[i]}`);
    return `  --${VIZ_KEYS[i]}: ${hexV};\n  --${VIZ_KEYS[i]}: ${ok};`;
  });
  const selector = name === DEFAULT_THEME ? `:root, [data-theme="${name}"]` : `[data-theme="${name}"]`;
  const scheme = LIGHT_THEMES.has(name) ? "light" : "dark";
  const css = `${selector} {\n  color-scheme: ${scheme};\n${lines.join("\n")}\n${vizLines.join("\n")}\n}\n`;
  writeFileSync(new URL(`theme-${name}.css`, DIST), css);
}

// 2. motion.css — duración + easing, agnóstico de tema (:root, no [data-theme]). Honra
//    prefers-reduced-motion (WCAG 2.3.3) colapsando duraciones a ~instantáneo; los componentes
//    cambian de estado igual, sin animación perceptible.
const motionLines = Object.entries(MOTION).map(([k, v]) => `  --${k}: ${v};`).join("\n");
const durationKeys = Object.keys(MOTION).filter((k) => k.startsWith("duration"));
const reducedMotionLines = durationKeys.map((k) => `    --${k}: 1ms;`).join("\n");
const motionCss =
  `:root {\n${motionLines}\n}\n\n` +
  `@media (prefers-reduced-motion: reduce) {\n  :root {\n${reducedMotionLines}\n  }\n}\n`;
writeFileSync(new URL("motion.css", DIST), motionCss);

// 3. theme.css — @theme inline (var(--token), no hex) + fuentes. Mapea el namespace de color
//    y motion de Tailwind sin arrastrar el motor/preflight, para que @duly/ui lo reutilice.
//    Tailwind resuelve la utilidad "duration-*" contra el theme key "--transition-duration-*"
//    (no "--duration-*"); "ease-*" sí resuelve directo contra "--ease-*".
const themeMap = [...SEMANTIC_KEYS, ...VIZ_KEYS].map((k) => `  --color-${k}: var(--${k});`).join("\n");
const fontMap = `  --font-sans: ${FONT.sans};\n  --font-display: ${FONT.display};\n  --font-mono: ${FONT.mono};`;
const motionMap = Object.keys(MOTION)
  .map((k) => `  --${k.startsWith("duration-") ? `transition-${k}` : k}: var(--${k});`)
  .join("\n");
const themeBlock = `@theme inline {\n${themeMap}\n${fontMap}\n${motionMap}\n}\n`;
writeFileSync(new URL("theme.css", DIST), themeBlock);

// 4. index.css — bundle completo standalone: tailwind (incl. preflight) + temas + motion + @theme inline.
const imports = Object.keys(themes).map((n) => `@import "./theme-${n}.css";`).join("\n");
writeFileSync(
  new URL("index.css", DIST),
  `@import "tailwindcss";\n${imports}\n@import "./motion.css";\n\n${themeBlock}`,
);

// 5. tokens.js + tokens.d.ts (objeto por tema, solo hex para consumo JS) + tipo.
const tokensObj = Object.fromEntries(
  Object.entries(themes).map(([n, vars]) => [
    n, Object.fromEntries(SEMANTIC_KEYS.map((k) => [k, split(vars[k])[0]])),
  ]),
);
// Data-viz en JS: solo hex, misma convención que `tokens`.
const vizObj = Object.fromEntries(
  Object.keys(themes).map((n) => [
    n,
    {
      cat: vizPalettes[n].cat.map((v) => split(v)[0]),
      seq: vizPalettes[n].seq.map((v) => split(v)[0]),
    },
  ]),
);
writeFileSync(
  new URL("tokens.js", DIST),
  `export const tokens = ${JSON.stringify(tokensObj, null, 2)};\n` +
    // Contrato público (packages/tokens/src/contracts.ts): consumidores pueden
    // validar o autorizar un tema de marca fuera de este repo sin forkear.
    `export const semanticKeys = ${JSON.stringify(SEMANTIC_KEYS)};\n` +
    `export const lockedTokens = ${JSON.stringify([...LOCKED])};\n` +
    `export const contrastPairs = ${JSON.stringify(CONTRAST_PAIRS)};\n` +
    `export const viz = ${JSON.stringify(vizObj, null, 2)};\n`,
);
const themeUnion = Object.keys(themes).map((n) => `"${n}"`).join(" | ");
const tokenUnion = SEMANTIC_KEYS.map((k) => `"${k}"`).join(" | ");
writeFileSync(
  new URL("tokens.d.ts", DIST),
  `export type ThemeableToken = ${tokenUnion};\n` +
    `export declare const tokens: Record<${themeUnion}, Record<ThemeableToken, string>>;\n` +
    `export declare const semanticKeys: readonly ThemeableToken[];\n` +
    `export declare const lockedTokens: readonly string[];\n` +
    `export declare const contrastPairs: readonly [string, string, number][];\n` +
    `export declare const viz: Record<${themeUnion}, { cat: string[]; seq: string[] }>;\n`,
);

// 6. tokens.lock.json
writeFileSync(
  new URL("tokens.lock.json", DIST),
  JSON.stringify([...SEMANTIC_KEYS].sort(), null, 2) + "\n",
);

console.log(`tokens: built ${Object.keys(themes).length} themes, ${SEMANTIC_KEYS.length} keys`);
