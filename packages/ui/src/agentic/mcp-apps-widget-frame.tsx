import * as React from "react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";
import type { SandboxConfig } from "@mcp-ui/client";

export type { SandboxConfig };

const LazyRender = React.lazy(() => import("./mcp-apps-widget-frame.render.js"));

export interface MCPAppsWidgetFrameProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Nombre del tool MCP cuyo recurso de UI se renderiza. */
  toolName: string;
  /** Config del sandbox (incluye la URL del proxy) — la provee el consumidor. */
  sandbox: SandboxConfig;
  /** HTML del recurso de UI ya obtenido (evita el fetch por resource uri). */
  html?: string;
  toolInput?: Record<string, unknown>;
  onLoggingMessage?: (params: unknown) => void;
  height?: number;
  label?: string;
}

/**
 * Host de MCP Apps (área G) — enmarca y tematiza el `AppRenderer` real de
 * `@mcp-ui/client`, que renderiza el recurso de UI de un tool MCP en un iframe
 * sandbox con puente postMessage/JSON-RPC (estándar MCP Apps, ratificado
 * 2026-01-26; sucesor de los renderers propios de tool-UI). Es el primitive a
 * través del cual `RichToolCallCard` debe montar sus bloques de app: en vez de un
 * renderer bespoke, delega en el sandbox estándar. El `AppRenderer` se carga en
 * diferido; el frame aporta contenedor temado + estado de carga accesible.
 */
export function MCPAppsWidgetFrame({
  toolName,
  sandbox,
  html,
  toolInput,
  onLoggingMessage,
  height = 320,
  label,
  className,
  ...props
}: MCPAppsWidgetFrameProps) {
  const t = useCopy();
  return (
    <div
      role="group"
      aria-label={label ?? `MCP App: ${toolName}`}
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <React.Suspense
        fallback={
          <div style={{ height }} className="grid place-items-center text-xs text-faint">
            {t.common.loading}
          </div>
        }
      >
        <div style={{ height }}>
          <LazyRender
            toolName={toolName}
            sandbox={sandbox}
            html={html}
            toolInput={toolInput}
            onLoggingMessage={onLoggingMessage}
          />
        </div>
      </React.Suspense>
    </div>
  );
}
