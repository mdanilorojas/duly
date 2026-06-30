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
    const keys = [...LOCKED];
    for (const k of keys) {
      const values = Object.values(themes).map((t) => hex(t, k));
      expect(new Set(values).size).toBe(1);
    }
  });
});

// CVD luminance-separation (deuteranopia ≥1.5) is NOT gated on status:
// every status always renders icon + text label (WCAG 1.4.1 satisfied via component + axe).
// The CVD-separation gate is reassigned to the categorical data-viz palette (--viz-cat-*) in sub-project #3.
