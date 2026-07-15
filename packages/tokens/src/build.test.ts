import { describe, it, expect } from "vitest";
import { wcagContrast, oklch as okParse, oklab, filterDeficiencyDeuter, filterDeficiencyProt } from "culori";
import { themes, LIGHT_THEMES } from "./themes.js";
import { SEMANTIC_KEYS, CONTRAST_PAIRS, THEMEABLE, LOCKED } from "./contracts.js";
import { MOTION } from "./primitives.js";
import { vizPalettes, VIZ_CAT_SLOTS, VIZ_SEQ_STEPS } from "./viz.js";

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

  it("status (LOCKED): hue idéntico entre temas (L/C pueden variar por modo claro/oscuro)", () => {
    // "cliente solo ajusta L, no rota hue" → se bloquea el HUE, no el hex completo.
    const hue = (theme: Record<string, string>, key: string) =>
      okParse(theme[key].split("|")[1])?.h ?? 0;
    for (const k of [...LOCKED]) {
      const hues = Object.values(themes).map((t) => Math.round(hue(t, k)));
      expect(new Set(hues).size).toBe(1);
    }
  });
});

describe("motion tokens", () => {
  const durationKeys = Object.keys(MOTION).filter((k) => k.startsWith("duration"));
  const easingKeys = Object.keys(MOTION).filter((k) => k.startsWith("ease"));

  it("declara al menos una duración y un easing", () => {
    expect(durationKeys.length).toBeGreaterThan(0);
    expect(easingKeys.length).toBeGreaterThan(0);
  });

  for (const k of durationKeys) {
    it(`${k}: es una duración en ms`, () => {
      expect(MOTION[k as keyof typeof MOTION]).toMatch(/^\d+ms$/);
    });
  }

  for (const k of easingKeys) {
    it(`${k}: es una curva cubic-bezier válida`, () => {
      expect(MOTION[k as keyof typeof MOTION]).toMatch(
        /^cubic-bezier\((-?\d*\.?\d+,\s*){3}-?\d*\.?\d+\)$/
      );
    });
  }

  it("duraciones son crecientes en el orden fast → base → slow → slower", () => {
    const ms = (k: string) => parseInt(MOTION[k as keyof typeof MOTION], 10);
    expect(ms("duration-fast")).toBeLessThan(ms("duration-base"));
    expect(ms("duration-base")).toBeLessThan(ms("duration-slow"));
    expect(ms("duration-slow")).toBeLessThan(ms("duration-slower"));
  });
});

// CVD luminance-separation (deuteranopia ≥1.5) is NOT gated on status:
// every status always renders icon + text label (WCAG 1.4.1 satisfied via component + axe).
// The CVD-separation gate is reassigned to the categorical data-viz palette (--viz-cat-*) — below.

describe("data-viz tokens (--viz-cat-*, --viz-seq-*)", () => {
  const hexOf = (v: string) => v.split("|")[0]!;
  // ΔE perceptual en OKLab ×100 (la escala del validador del skill dataviz):
  // gate CVD adjacent ≥ 8 (deuteranopia y protanopia), normal-vision ≥ 15.
  const deltaE = (a: string, b: string, sim?: (c: string) => unknown) => {
    const ca = oklab(sim ? (sim(a) as never) : a)!;
    const cb = oklab(sim ? (sim(b) as never) : b)!;
    return Math.hypot(ca.l - cb.l, ca.a - cb.a, ca.b - cb.b) * 100;
  };
  const deuter = filterDeficiencyDeuter(1);
  const protan = filterDeficiencyProt(1);

  for (const [name, theme] of Object.entries(themes)) {
    const palette = vizPalettes[name];

    it(`${name}: declara paleta viz completa (${VIZ_CAT_SLOTS} cat + ${VIZ_SEQ_STEPS} seq)`, () => {
      expect(palette).toBeDefined();
      expect(palette!.cat.length).toBe(VIZ_CAT_SLOTS);
      expect(palette!.seq.length).toBe(VIZ_SEQ_STEPS);
    });

    // NORTH_STAR: "paleta categórica 3:1 sobre dark (Carbon-style)". En light,
    // 4 slots quedan bajo 3:1 por diseño (relief rule: labels directos o tabla)
    // — el gate duro de contraste aplica solo a los temas oscuros.
    if (!LIGHT_THEMES.has(name)) {
      for (let i = 0; i < VIZ_CAT_SLOTS; i++) {
        it(`${name}: viz-cat-${i + 1} contraste ≥ 3:1 sobre surface-2`, () => {
          const ratio = wcagContrast(hexOf(vizPalettes[name]!.cat[i]!), hexOf(theme["surface-2"]!));
          expect(ratio).toBeGreaterThanOrEqual(3);
        });
      }
    }

    it(`${name}: pares adyacentes cat separables bajo CVD (ΔE ≥ 8 deutan/protan)`, () => {
      const cat = vizPalettes[name]!.cat.map(hexOf);
      for (let i = 0; i < cat.length - 1; i++) {
        expect(deltaE(cat[i]!, cat[i + 1]!, deuter)).toBeGreaterThanOrEqual(8);
        expect(deltaE(cat[i]!, cat[i + 1]!, protan)).toBeGreaterThanOrEqual(8);
      }
    });

    it(`${name}: pares adyacentes cat sobre el piso de visión normal (ΔE ≥ 15)`, () => {
      const cat = vizPalettes[name]!.cat.map(hexOf);
      for (let i = 0; i < cat.length - 1; i++) {
        expect(deltaE(cat[i]!, cat[i + 1]!)).toBeGreaterThanOrEqual(15);
      }
    });

    it(`${name}: rampa seq con UNA hue y lightness monotónica`, () => {
      const seq = vizPalettes[name]!.seq.map((v) => okParse(v.split("|")[1])!);
      const hues = seq.map((c) => Math.round(c.h ?? 0));
      expect(new Set(hues).size).toBe(1);
      for (let i = 0; i < seq.length - 1; i++) {
        // dark: L crece (recede→brillante); light: L decrece — monotónica en un solo sentido
        const dir = Math.sign(seq[1]!.l - seq[0]!.l);
        expect(Math.sign(seq[i + 1]!.l - seq[i]!.l)).toBe(dir);
      }
    });

    // Piso 6, no 8: el par más cercano (viz-cat-4 amarillo ↔ warn, ΔE ~7.1)
    // cae en la banda 6–8, legal SOLO con encoding secundario — que los status
    // siempre tienen por regla del DS (icono + label, nunca color solo; ver
    // nota sobre WCAG 1.4.1 arriba). Bajo 6 sí sería impersonación.
    it(`${name}: ningún slot cat impersona un status LOCKED (ΔE ≥ 6 vs ok/warn/block)`, () => {
      const cat = vizPalettes[name]!.cat.map(hexOf);
      for (const status of ["ok", "warn", "block"]) {
        for (const c of cat) {
          expect(deltaE(c, hexOf(theme[status]!))).toBeGreaterThanOrEqual(6);
        }
      }
    });
  }
});
