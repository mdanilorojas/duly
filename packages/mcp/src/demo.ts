import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { exampleGenerativeUi, validateGenerativeUi } from "./generative-ui.js";
import { DEMO_COMPOSITION } from "./instructions.js";

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

const root = fileURLToPath(new URL("..", import.meta.url));
const cli = fileURLToPath(new URL("./cli.ts", import.meta.url));
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["--import", "tsx", cli],
  cwd: root,
  stderr: "inherit",
});
const client = new Client({ name: "duly-demo", version: "0.1.0" });

const timer = setTimeout(() => {
  console.error("Timed out waiting for the Duly MCP demo (20s).");
  process.exit(1);
}, 20_000);

try {
  await client.connect(transport);
  const listed = await client.listTools();
  const toolNames = listed.tools.map((tool) => tool.name).sort();
  const tokens = readJson(await client.callTool({ name: "list_tokens", arguments: { theme: "cockpit" } })) as {
    theme: string;
    tokens: { tokens: Array<{ name: string; hex: string; oklch: string }> };
  };
  const components = readJson(await client.callTool({ name: "list_components", arguments: { area: "agentic" } })) as {
    components: Array<{ name: string }>;
  };
  const instructions = readJson(await client.callTool({ name: "get_generate_ui_instructions", arguments: {} })) as {
    composition: string[];
    example: string;
  };
  const resource = await client.readResource({ uri: "duly://design-system.json" });
  const resourceBody = resource.contents[0];
  if (!resourceBody || !("text" in resourceBody)) throw new Error("Design-system resource had no text.");
  const document = JSON.parse(resourceBody.text) as { name?: string };

  const schema = readJson(await client.callTool({ name: "get_generative_ui_schema", arguments: {} })) as {
    version: string;
    components: string[];
  };
  const example = exampleGenerativeUi();
  const audit = readJson(await client.callTool({ name: "validate_generative_ui", arguments: { document: example } })) as {
    ok: boolean;
    auditId: string | null;
    theme: string | null;
    rules: Array<{ id: string; passed: boolean }>;
    errors: Array<{ rule: string }>;
  };
  const rejected = readJson(
    await client.callTool({
      name: "validate_generative_ui",
      arguments: {
        document: {
          version: "1",
          auditId: "bad-doc",
          theme: "cockpit",
          locale: "en",
          title: "Bad emission",
          nodes: [
            {
              id: "raw",
              component: "RawHtml",
              props: { html: "<div style='color:#ff0000'>nope</div>" },
            },
          ],
        },
      },
    }),
  ) as { ok: boolean; errors: Array<{ rule: string }> };

  const accent = tokens.tokens.tokens.find((token) => token.name === "accent");
  const expectedTools = [
    "get_generate_ui_instructions",
    "get_generative_ui_schema",
    "list_components",
    "list_tokens",
    "validate_generative_ui",
  ];
  const missingTools = expectedTools.filter((name) => !toolNames.includes(name));
  const missingComposition = DEMO_COMPOSITION.filter((name) => !instructions.composition.includes(name));
  const rejectedRules = new Set(rejected.errors.map((error) => error.rule));
  if (!accent?.hex || !accent.oklch) throw new Error("cockpit accent token was missing.");
  if (missingTools.length > 0) throw new Error(`Missing tools: ${missingTools.join(", ")}`);
  if (missingComposition.length > 0) throw new Error(`Recipe is missing: ${missingComposition.join(", ")}`);
  if (!components.components.some((entry) => entry.name === "AgentOpsCockpit")) {
    throw new Error("Component inventory does not include AgentOpsCockpit.");
  }
  if (document.name !== "Duly") throw new Error("Design-system resource did not return the Duly document.");
  if (!instructions.example.includes("AgentOpsCockpit")) throw new Error("Generate-UI example does not mount AgentOpsCockpit.");
  if (schema.version !== "1") throw new Error("Generative UI schema is not version 1.");
  if (!schema.components.includes("HumanInterruptQueue")) throw new Error("Generative UI schema is missing HumanInterruptQueue.");
  if (!audit.ok) throw new Error(`Example cockpit document failed validation: ${audit.errors.map((error) => error.rule).join(", ")}`);
  if (audit.rules.some((rule) => !rule.passed)) throw new Error("Example audit has a failing rule.");
  if (rejected.ok || !rejectedRules.has("components.allow_list") || !rejectedRules.has("props.no_raw_color")) {
    throw new Error("Invalid document was not rejected for an unknown component and a raw color.");
  }
  const localAudit = validateGenerativeUi(example);
  if (!localAudit.ok || localAudit.auditId !== audit.auditId) throw new Error("Local audit does not match the MCP audit.");

  console.log("Duly design-system MCP demo");
  console.log("transport: stdio");
  console.log(`tools: ${toolNames.join(", ")}`);
  console.log("resource: duly://design-system.json");
  console.log(`theme: ${tokens.theme}`);
  console.log(`accent: ${accent.hex} (${accent.oklch})`);
  console.log(`agentic components: ${components.components.length}`);
  console.log(`cockpit composition: ${instructions.composition.join(" → ")}`);
  console.log(`generative ui: version ${schema.version}, audit ${audit.auditId} (${audit.theme}) ok, ${audit.rules.length} rules`);
  console.log("rejected: unknown component RawHtml, raw color");
  console.log("demo ok");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
} finally {
  clearTimeout(timer);
  await client.close();
}
