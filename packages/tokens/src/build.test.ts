import { describe, it, expect } from "vitest";
import { wcagContrast, oklch as okParse } from "culori";
import { themes } from "./themes.js";
import { SEMANTIC_KEYS, CONTRAST_PAIRS, THEMEABLE, LOCKED } from "./contracts.js";
import { MOTION } from "./primitives.js";

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
// The CVD-separation gate is reassigned to the categorical data-viz palette (--viz-cat-*) in sub-project #3.
