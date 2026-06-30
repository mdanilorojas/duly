import { describe, it, expect } from "vitest";
import { wcagContrast, filterDeficiencyDeuter, formatHex, parse } from "culori";
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

describe("CVD separation (deuteranopia)", () => {
  const deuter = filterDeficiencyDeuter(1);
  const deuterSim = (h: string) => formatHex(deuter(parse(h))!)!;

  // Status colors are LOCKED — identical across themes; use cockpit as source.
  const cockpit = themes.cockpit;
  const statusHex = {
    ok:     hex(cockpit, "ok"),
    review: hex(cockpit, "review"),
    warn:   hex(cockpit, "warn"),
    block:  hex(cockpit, "block"),
  } as const;

  const pairs: [keyof typeof statusHex, keyof typeof statusHex][] = [
    ["ok", "review"],
    ["ok", "warn"],
    ["ok", "block"],
    ["review", "warn"],
    ["review", "block"],
    ["warn", "block"],
  ];

  for (const [a, b] of pairs) {
    it(`deuteranopia contrast ${a}×${b} ≥ 1.5`, () => {
      const ratio = wcagContrast(deuterSim(statusHex[a]), deuterSim(statusHex[b]));
      expect(ratio).toBeGreaterThanOrEqual(1.5);
    });
  }
});
