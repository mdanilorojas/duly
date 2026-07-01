import { describe, it, expect } from "vitest";
import { REAL_ESTATE_AGENTS } from "./real-estate-agents.js";
import { buildFragmentShader, SHADER_PREAMBLE } from "./neural-agents.js";

describe("real-estate-agents data", () => {
  it("has 6 agents", () => {
    expect(REAL_ESTATE_AGENTS).toHaveLength(6);
  });

  it("all ids are unique and prefixed RE-", () => {
    const ids = REAL_ESTATE_AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^RE-\d{2}$/);
  });

  it("every agent defines getColor and non-empty name/role/glow", () => {
    for (const a of REAL_ESTATE_AGENTS) {
      expect(a.glsl).toContain("vec3 getColor(");
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.role.length).toBeGreaterThan(0);
      expect(a.glow).toMatch(/^rgba\(/);
    }
  });

  it("shaders compile against the shared preamble wrapper", () => {
    const src = buildFragmentShader(REAL_ESTATE_AGENTS[0].glsl);
    expect(src).toContain(SHADER_PREAMBLE.trim().slice(0, 20));
    expect(src).toContain("void main()");
  });
});
