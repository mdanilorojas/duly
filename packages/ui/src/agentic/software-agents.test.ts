import { describe, it, expect } from "vitest";
import { SOFTWARE_AGENTS } from "./software-agents.js";
import { buildFragmentShader, SHADER_PREAMBLE } from "./neural-agents.js";

describe("software-agents data", () => {
  it("has 6 agents", () => {
    expect(SOFTWARE_AGENTS).toHaveLength(6);
  });

  it("all ids are unique", () => {
    const ids = SOFTWARE_AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every agent defines getColor and non-empty name/role/glow", () => {
    for (const a of SOFTWARE_AGENTS) {
      expect(a.glsl).toContain("vec3 getColor(");
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.role.length).toBeGreaterThan(0);
      expect(a.glow).toMatch(/^rgba\(/);
    }
  });

  it("shaders compile against the shared preamble wrapper", () => {
    const src = buildFragmentShader(SOFTWARE_AGENTS[0].glsl);
    expect(src).toContain(SHADER_PREAMBLE.trim().slice(0, 20));
    expect(src).toContain("void main()");
  });
});
