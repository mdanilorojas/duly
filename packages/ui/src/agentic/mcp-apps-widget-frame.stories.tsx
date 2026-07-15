import type { Meta, StoryObj } from "@storybook/react";
import { MCPAppsWidgetFrame, type SandboxConfig } from "./mcp-apps-widget-frame.js";

const meta: Meta<typeof MCPAppsWidgetFrame> = {
  title: "Agentic/Orchestration/V001 Marco de widget MCP Apps",
  component: MCPAppsWidgetFrame,
  parameters: { layout: "fullscreen", backgrounds: { default: "dark" } },
};
export default meta;

// El sandbox.url apunta al proxy MCP Apps que provee el consumidor (aquí un
// placeholder). Con un proxy real, AppRenderer monta el iframe del recurso de UI.
const sandbox = { url: new URL("https://mcp-sandbox.studio-ds.dev/proxy.html") } as SandboxConfig;

// HTML del recurso de UI (lo sirve el tool MCP). Sin colores crudos aquí — el
// guest real trae su propio estilo; esto es solo un placeholder de demo.
const html = "<!doctype html><body style=\"font-family:system-ui;padding:16px\"><h3>Predio 88213</h3><p>Gravamen activo · área 420 m²</p></body>";

export const Widget: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-10">
      <div className="mx-auto max-w-[520px]">
        <MCPAppsWidgetFrame toolName="predio_viewer" sandbox={sandbox} html={html} label="Visor de predios" />
        <p className="mt-3 font-mono text-[11px] text-faint">
          Nota: requiere un proxy de sandbox real en <code>sandbox.url</code> para montar el iframe.
        </p>
      </div>
    </div>
  ),
};
