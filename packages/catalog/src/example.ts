import { readFileSync } from "node:fs";

/** Node-only reader. Import from `@duly/catalog/example`, not the package root, so browser bundles do not load node:fs. */
export function exampleSurface(): unknown {
  return JSON.parse(
    readFileSync(new URL("../../ui/src/agentic/duly-surface.example.json", import.meta.url), "utf8"),
  ) as unknown;
}
