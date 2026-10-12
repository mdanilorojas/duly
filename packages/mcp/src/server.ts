import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildDesignSystem, listComponents, themeNames, tokensPayload } from "./design-system.js";
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
        "Return the curated Duly component inventory. Filter with a substring query or an area (agentic or primitive). This is not every export and does not include prop types.",
      inputSchema: {
        query: z.string().optional().describe("Case-insensitive match against the component name or summary."),
        area: z.enum(["agentic", "primitive"]).optional().describe("Limit the list to agent-ops components or primitives."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, area }) => toolJson({ components: listComponents({ query, area }) }),
  );

  server.registerTool(
    "get_generate_ui_instructions",
    {
      title: "Get generate-UI instructions",
      description:
        "Return instructions for rendering the public agent-ops cockpit from @enregla-ui/duly-ui, including accessibility rules and known limitations.",
      annotations: { readOnlyHint: true },
    },
    async () => toolJson(GENERATE_UI),
  );

  const document = () => JSON.stringify(buildDesignSystem(), null, 2);
  server.registerResource(
    "design-system",
    "duly://design-system.json",
    {
      title: "Duly design system",
      description: "Tokens, component inventory, and cockpit composition instructions as one JSON document.",
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
