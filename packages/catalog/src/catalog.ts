import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodTypeAny } from "zod";
import {
  CATALOG_COMPONENTS,
  CATALOG_ID,
  CATALOG_VERSION,
  COMPONENT_SUMMARIES,
  REACT_COMPONENTS,
  componentSchemas,
} from "./schemas.js";
import { themeNames } from "./themes.js";

export { themeNames };

function jsonSchema(schema: ZodTypeAny): Record<string, unknown> {
  const generated = zodToJsonSchema(schema, { $refStrategy: "none", target: "jsonSchema7" }) as Record<string, unknown>;
  delete generated.$schema;
  return generated;
}

/** A2UI-shaped catalog: one JSON Schema per component an agent may emit. */
export function buildCatalog() {
  return {
    catalogId: CATALOG_ID,
    version: CATALOG_VERSION,
    pattern:
      "Fixed component catalog. An agent emits a surface whose component keys are in this document. The host renders them. Unknown components are stripped. This follows the public A2UI, AG-UI, and MCP Apps pattern. It is not an OpenAI DIL document. DIL is not a public spec implemented here.",
    themes: themeNames(),
    components: Object.fromEntries(
      CATALOG_COMPONENTS.map((name) => [
        name,
        {
          react: REACT_COMPONENTS[name],
          summary: COMPONENT_SUMMARIES[name],
          schema: jsonSchema(componentSchemas[name]),
        },
      ]),
    ),
  };
}
