import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { COMPONENT_INVENTORY } from "./catalog.js";
import { buildDesignSystem, listComponents } from "./design-system.js";
import { DEMO_COMPOSITION } from "./instructions.js";
import { createDulyServer } from "./server.js";

interface ToolResult {
  isError?: boolean;
  content?: Array<{ type: string; text?: string }>;
}

function readJson(result: unknown): unknown {
  const value = result as ToolResult;
  const text = value.content?.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("MCP tool returned no text content.");
  if (value.isError) throw new Error(text);
  return JSON.parse(text) as unknown;
}

async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const server = createDulyServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "duly-test", version: "0.0.0" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    return await run(client);
  } finally {
    await client.close();
    await server.close();
  }
}

describe("design system export", () => {
  it("includes cockpit accent as hex and oklch", () => {
    const cockpit = buildDesignSystem().themes.cockpit;
    expect(cockpit?.colorScheme).toBe("dark");
    const accent = cockpit?.tokens.find((token) => token.name === "accent");
    expect(accent?.cssVar).toBe("--accent");
    expect(accent?.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(accent?.oklch).toMatch(/^oklch\(/);
    expect(accent?.locked).toBe(false);
  });

  it("marks status tokens as locked", () => {
    const ok = buildDesignSystem().themes.cockpit?.tokens.find((token) => token.name === "ok");
    expect(ok?.locked).toBe(true);
  });

  it("lists every demo component in the inventory", () => {
    const flagged = COMPONENT_INVENTORY.filter((entry) => entry.inDemoCockpit).map((entry) => entry.name);
    expect(new Set(flagged)).toEqual(new Set(DEMO_COMPOSITION));
  });

  it("filters components by query", () => {
    const matches = listComponents({ query: "interrupt" });
    expect(matches.map((entry) => entry.name)).toContain("HumanInterruptQueue");
  });

  it("matches the committed design-system.json", () => {
    const committed = JSON.parse(readFileSync(new URL("../design-system.json", import.meta.url), "utf8"));
    expect(committed).toEqual(buildDesignSystem());
  });
});

describe("MCP server", () => {
  it("serves tokens, components, instructions, and the design-system resource", async () => {
    await withClient(async (client) => {
      const tools = await client.listTools();
      expect(tools.tools.map((tool) => tool.name).sort()).toEqual([
        "get_generate_ui_instructions",
        "list_components",
        "list_tokens",
      ]);

      const tokens = readJson(await client.callTool({ name: "list_tokens", arguments: { theme: "light" } })) as {
        theme: string;
        tokens: { colorScheme: string };
      };
      expect(tokens.theme).toBe("light");
      expect(tokens.tokens.colorScheme).toBe("light");

      const components = readJson(
        await client.callTool({ name: "list_components", arguments: { area: "primitive" } }),
      ) as { components: Array<{ area: string }> };
      expect(components.components.length).toBeGreaterThan(0);
      expect(components.components.every((entry) => entry.area === "primitive")).toBe(true);

      const instructions = readJson(
        await client.callTool({ name: "get_generate_ui_instructions", arguments: {} }),
      ) as { composition: string[]; limitations: string[] };
      expect(instructions.composition).toContain("AgentOpsCockpit");
      expect(instructions.limitations.length).toBeGreaterThan(0);

      const resource = await client.readResource({ uri: "duly://design-system.json" });
      const resourceBody = resource.contents[0];
      if (!resourceBody || !("text" in resourceBody)) throw new Error("Design-system resource had no text.");
      const document = JSON.parse(resourceBody.text) as { name?: string };
      expect(document.name).toBe("Duly");
    });
  });

  it("returns an error for an unknown theme", async () => {
    await withClient(async (client) => {
      const result = (await client.callTool({
        name: "list_tokens",
        arguments: { theme: "nope" },
      })) as ToolResult;
      expect(result.isError).toBe(true);
      expect(result.content?.[0]?.text).toMatch(/Unknown theme/);
    });
  });
});
