import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { exampleSurface } from "@duly/catalog/example";
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
  const catalogList = readJson(await client.callTool({ name: "list_components", arguments: {} })) as {
    catalogId: string;
    components: Array<{ name: string }>;
  };
  const approvalSchema = readJson(await client.callTool({ name: "get_component_schema", arguments: { name: "ApprovalGate" } })) as {
    name: string;
    schema: { type?: string };
  };
  const themeTokens = readJson(await client.callTool({ name: "get_theme_tokens", arguments: { theme: "cockpit" } })) as {
    theme: string;
    tokens: { tokens: Array<{ name: string; hex: string; oklch: string }> };
  };
  const composed = readJson(await client.callTool({ name: "compose_surface", arguments: { surface: exampleSurface() } })) as {
    ok: boolean;
    executes: boolean;
    surfaceHash: string | null;
    stripped: unknown[];
  };
  const stripped = readJson(
    await client.callTool({
      name: "compose_surface",
      arguments: {
        surface: {
          version: "1",
          catalogId: "duly://catalog/v1",
          surfaceId: "bad-doc",
          theme: "cockpit",
          root: "raw",
          components: [{ id: "raw", component: { RawHtml: { html: "<b style='color:#ff0000'>nope</b>" } } }],
        },
      },
    }),
  ) as { ok: boolean; stripped: Array<{ component: string }> };

  const expectedTools = [
    "compose_surface",
    "get_component_schema",
    "get_generate_ui_instructions",
    "get_generative_ui_schema",
    "get_theme_tokens",
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
  const themeAccent = themeTokens.tokens.tokens.find((token) => token.name === "accent");
  if (catalogList.catalogId !== "duly://catalog/v1") throw new Error("list_components did not return the emit catalog.");
  if (!catalogList.components.some((entry) => entry.name === "ApprovalGate")) throw new Error("Emit catalog is missing ApprovalGate.");
  if (approvalSchema.name !== "ApprovalGate" || approvalSchema.schema.type !== "object") throw new Error("ApprovalGate schema was not an object.");
  if (!themeAccent?.oklch) throw new Error("get_theme_tokens did not return the cockpit accent.");
  if (!composed.ok || composed.executes !== false || !composed.surfaceHash?.startsWith("sha256:")) {
    throw new Error("compose_surface did not return a checked layout hash.");
  }
  if (composed.stripped.length !== 0) throw new Error("Example surface stripped a component.");
  if (stripped.ok || !stripped.stripped.some((entry) => entry.component === "RawHtml")) {
    throw new Error("Unknown component was not stripped.");
  }

  console.log("Duly design-system MCP demo");
  console.log("transport: stdio");
  console.log(`tools: ${toolNames.join(", ")}`);
  console.log("resource: duly://design-system.json");
  console.log(`theme: ${tokens.theme}`);
  console.log(`accent: ${accent.hex} (${accent.oklch})`);
  console.log(`agentic components: ${components.components.length}`);
  console.log(`cockpit composition: ${instructions.composition.join(" → ")}`);
  console.log(`catalog: ${catalogList.catalogId} (${catalogList.components.map((entry) => entry.name).join(", ")})`);
  console.log(`compose_surface: ${composed.surfaceHash} executes=${composed.executes}`);
  console.log("stripped: unknown component RawHtml");
  console.log(`generative ui: version ${schema.version}, audit ${audit.auditId} (${audit.theme}) ok, ${audit.rules.length} rules`);
  console.log("demo ok");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
} finally {
  clearTimeout(timer);
  await client.close();
}
