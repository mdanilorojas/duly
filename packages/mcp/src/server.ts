import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CATALOG_COMPONENTS, CATALOG_ID, COMPONENT_SUMMARIES, REACT_COMPONENTS, buildCatalog, checkSurface } from "@duly/catalog";
import { exampleSurface } from "@duly/catalog/example";
import { buildDesignSystem, listComponents, themeNames, tokensPayload } from "./design-system.js";
import { getGenerativeUiSchema, validateGenerativeUi } from "./generative-ui.js";
import { GENERATE_UI } from "./instructions.js";

const mcpPackage = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  version: string;
};

function toolJson(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function toolError(message: string) {
  return { isError: true as const, content: [{ type: "text" as const, text: message }] };
}

export function createDulyServer(): McpServer {
  const server = new McpServer({
    name: "duly-design-system",
    version: mcpPackage.version,
  });

  server.registerTool(
    "list_tokens",
    {
      title: "List design tokens",
      description:
        "Return Duly semantic tokens for one theme or every theme. Each token includes the CSS variable, hex fallback, and OKLCH value. Omit theme to return all themes.",
      inputSchema: {
        theme: z
          .string()
          .optional()
          .describe(`Theme id. Known themes: ${themeNames().join(", ")}.`),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ theme }) => {
      try {
        return toolJson(tokensPayload(theme));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not read tokens.";
        return toolError(message);
      }
    },
  );

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description:
        "Return the versioned emit catalog (the components an agent may put on a surface). Pass area or query to search the wider hand-maintained inventory instead. The inventory is not a schema.",
      inputSchema: {
        query: z.string().optional().describe("Case-insensitive match against the wider inventory name or summary."),
        area: z.enum(["agentic", "primitive"]).optional().describe("Limit the wider inventory to agent-ops components or primitives."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, area }) => {
      if (query || area) return toolJson({ components: listComponents({ query, area }) });
      return toolJson({
        catalogId: CATALOG_ID,
        components: CATALOG_COMPONENTS.map((name) => ({
          name,
          react: REACT_COMPONENTS[name],
          summary: COMPONENT_SUMMARIES[name],
        })),
      });
    },
  );

  server.registerTool(
    "get_component_schema",
    {
      title: "Get component schema",
      description:
        "Return the A2UI-shaped JSON Schema catalog, or one component schema when name is set. An agent may emit only these components.",
      inputSchema: {
        name: z.string().optional().describe(`Component name. Known names: ${CATALOG_COMPONENTS.join(", ")}.`),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      const catalog = buildCatalog();
      if (!name) return toolJson(catalog);
      const entry = catalog.components[name as keyof typeof catalog.components];
      if (!entry) return toolError(`Unknown component "${name}". Known components: ${CATALOG_COMPONENTS.join(", ")}.`);
      return toolJson({ catalogId: catalog.catalogId, version: catalog.version, name, ...entry });
    },
  );

  server.registerTool(
    "get_theme_tokens",
    {
      title: "Get theme tokens",
      description:
        "Return Duly semantic tokens for one theme or every theme. Each token includes the CSS variable, hex fallback, and OKLCH value. Omit theme to return all themes.",
      inputSchema: {
        theme: z.string().optional().describe(`Theme id. Known themes: ${themeNames().join(", ")}.`),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ theme }) => {
      try {
        return toolJson(tokensPayload(theme));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not read tokens.";
        return toolError(message);
      }
    },
  );

  server.registerTool(
    "compose_surface",
    {
      title: "Compose surface",
      description:
        "Validate one surface against the Duly catalog and return the checked layout plus a SHA-256 reviewer hash. Unknown components are stripped. Nothing is executed, stored, or signed.",
      inputSchema: {
        surface: z.unknown().describe("A2UI-shaped surface document. Omit to check the example surface."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ surface }) => toolJson(checkSurface(surface === undefined ? exampleSurface() : surface)),
  );

  server.registerTool(
    "get_generate_ui_instructions",
    {
      title: "Get generate-UI instructions",
      description:
        "Return instructions for rendering the public agent-ops cockpit from @enregla-ui/duly-ui, including accessibility rules, the generative UI emission path, and known limitations.",
      annotations: { readOnlyHint: true },
    },
    async () => toolJson(GENERATE_UI),
  );

  server.registerTool(
    "get_generative_ui_schema",
    {
      title: "Get generative UI schema",
      description:
        "Return the version 1 contract for UI an agent may emit: allow-listed components, prop fields, accessibility rules, limits, and a valid cockpit example. The agent emits this JSON. It does not emit HTML.",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        return toolJson(getGenerativeUiSchema());
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not read the generative UI schema.";
        return toolError(message);
      }
    },
  );

  server.registerTool(
    "validate_generative_ui",
    {
      title: "Validate generative UI",
      description:
        "Check one generative UI document against the version 1 contract. Returns an audit (theme, locale, node ids, components, and each rule passed or failed). The check is structural and pure. Duly does not store, sign, or certify the result.",
      inputSchema: {
        document: z.unknown().describe("Generative UI document to check."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ document }) => toolJson(validateGenerativeUi(document)),
  );

  const document = () => JSON.stringify(buildDesignSystem(), null, 2);
  server.registerResource(
    "design-system",
    "duly://design-system.json",
    {
      title: "Duly design system",
      description: "Tokens, component inventory, cockpit composition instructions, and the generative UI contract as one JSON document.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: document(),
        },
      ],
    }),
  );

  return server;
}
