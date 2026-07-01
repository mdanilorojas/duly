import { describe, it, expect } from "vitest";
import {
  NEURAL_AGENTS,
  buildFragmentShader,
  SHADER_PREAMBLE,
} from "./neural-agents.js";

describe("neural-agents data", () => {
  it("has 10 agents", () => {
    expect(NEURAL_AGENTS).toHaveLength(10);
  });

  it("all ids are unique", () => {
    const ids = NEURAL_AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every agent defines getColor and non-empty name/role/glow", () => {
    for (const a of NEURAL_AGENTS) {
      expect(a.glsl).toContain("vec3 getColor(");
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.role.length).toBeGreaterThan(0);
      expect(a.glow).toMatch(/^rgba\(/);
    }
  });

  it("buildFragmentShader wraps preamble + getColor + main", () => {
    const src = buildFragmentShader(NEURAL_AGENTS[0].glsl);
    expect(src).toContain(SHADER_PREAMBLE.trim().slice(0, 20));
    expect(src).toContain("void main()");
    expect(src).toContain("gl_FragColor");
  });
});
