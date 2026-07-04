import { AppRenderer, type SandboxConfig } from "@mcp-ui/client";

export interface McpAppRenderProps {
  toolName: string;
  sandbox: SandboxConfig;
  html?: string;
  toolInput?: Record<string, unknown>;
  onLoggingMessage?: (params: unknown) => void;
}

/**
 * Render real del host MCP Apps (diferido) — usa `AppRenderer` de
 * `@mcp-ui/client`, que monta el recurso de UI del tool en un iframe sandbox y
 * habla con él por postMessage/JSON-RPC (MCP Apps, ratificado 2026-01-26). El
 * `sandbox.url` (proxy) lo provee el consumidor, como cualquier setup MCP Apps.
 */
export default function McpAppRender({ toolName, sandbox, html, toolInput, onLoggingMessage }: McpAppRenderProps) {
  return (
    <AppRenderer
      toolName={toolName}
      sandbox={sandbox}
      html={html}
      toolInput={toolInput}
      onLoggingMessage={onLoggingMessage as never}
    />
  );
}
