import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildCatalog } from "./catalog.js";
import { exampleSurface } from "./example.js";
import { CATALOG_COMPONENTS } from "./schemas.js";
import { sha256Hex } from "./sha256.js";
import { checkSurface } from "./surface.js";

describe("sha256", () => {
  it("matches the empty-string and abc test vectors", () => {
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("duly-catalog", () => {
  it("matches the committed catalog.json", () => {
    const committed = JSON.parse(readFileSync(new URL("../catalog.json", import.meta.url), "utf8"));
    expect(committed).toEqual(buildCatalog());
  });

  it("publishes JSON Schema for the emit set", () => {
    const catalog = buildCatalog();
    expect(Object.keys(catalog.components)).toEqual([...CATALOG_COMPONENTS]);
    for (const name of CATALOG_COMPONENTS) {
      const entry = catalog.components[name];
      expect(entry?.schema).toMatchObject({ type: "object" });
    }
    expect(catalog.themes).toEqual(expect.arrayContaining(["cockpit", "light", "violet", "ganapliego"]));
  });

  it("accepts the example surface and is pure", () => {
    const surface = exampleSurface();
    const first = checkSurface(surface);
    const second = checkSurface(surface);
    expect(first.ok).toBe(true);
    expect(first.errors).toEqual([]);
    expect(first.stripped).toEqual([]);
    expect(first.executes).toBe(false);
    expect(first.surfaceHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(first).toEqual(second);
    expect(first.checked?.components.map((node) => node.id)).toEqual(["layout", "gate", "guard", "cost", "tool", "audit"]);
  });

  it("strips an unknown component and rejects a raw color", () => {
    const audit = checkSurface({
      version: "1",
      catalogId: "duly://catalog/v1",
      surfaceId: "bad-doc",
      theme: "cockpit",
      root: "raw",
      components: [
        {
          id: "raw",
          component: { RawHtml: { html: "<div style='color:#ff0000'>nope</div>" } },
        },
      ],
    });
    expect(audit.ok).toBe(false);
    expect(audit.checked).toBeNull();
    expect(audit.stripped).toEqual([{ id: "raw", component: "RawHtml", reason: "unknown_component" }]);
    expect(audit.surfaceHash).toBeNull();
  });

  it("rejects skipConfirmation instead of rendering a weaker approval", () => {
    const surface = exampleSurface() as { components: Array<{ id: string; component: Record<string, unknown> }> };
    const gate = surface.components.find((node) => node.id === "gate");
    const props = gate?.component.ApprovalGate as Record<string, unknown>;
    props.skipConfirmation = true;
    const audit = checkSurface(surface);
    expect(audit.ok).toBe(false);
    expect(audit.errors.some((error) => error.message.includes("Confirmation cannot be skipped"))).toBe(true);
    expect(audit.checked?.components.some((node) => node.id === "gate")).toBeFalsy();
  });
});
