import * as React from "react";
import { Check, Loader2, X, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy/index.js";

export type ConnectorState = "connected" | "syncing" | "error" | "paused";

export interface ConnectorEntry {
  id: string;
  name: string;
  /** Tipo de fuente, ej. "SharePoint", "carpeta local", "S3". */
  kind: string;
  state: ConnectorState;
  /** Marca legible, ej. "hace 4 min". */
  lastSync?: string;
  docCount?: number;
}

interface StateConfig {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  chip: string;
  spin?: boolean;
}

const STATE: Record<ConnectorState, StateConfig> = {
  connected: { icon: Check, chip: "text-ok border-ok/50" },
  syncing: { icon: Loader2, chip: "text-review border-review/50", spin: true },
  error: { icon: X, chip: "text-block border-block/50" },
  paused: { icon: Pause, chip: "text-dim border-border-default" },
};

/**
 * Estado de fuentes de ingesta (área B) — los SourceConnector de una corrida:
 * de dónde entran los documentos, cuándo sincronizó cada fuente y cuál está
 * rota. Estado no binario connected/syncing/error/paused con ícono + color +
 * etiqueta de texto (colorblind-safe, principio #1).
 */
export function ConnectorStatus({
  connectors,
  className,
  ...props
}: { connectors: ConnectorEntry[] } & Omit<React.ComponentProps<"ul">, "children">) {
  const copy = useCopy();
  return (
    <ul className={cn("flex flex-col gap-2", className)} {...props}>
      {connectors.map((c) => {
        const cfg = STATE[c.state];
        const Icon = cfg.icon;
        return (
          <li
            key={c.id}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2.5 rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-sm"
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-px font-mono text-[0.66rem]",
                cfg.chip,
              )}
            >
              <Icon aria-hidden className={cn("size-3", cfg.spin && "animate-spin")} />
              {copy.connectorStatus[c.state]}
            </span>
            <span className="min-w-0 truncate text-ink">
              {c.name} <span className="text-faint">· {c.kind}</span>
            </span>
            <span className="font-mono text-[0.66rem] text-faint">{c.lastSync ?? "—"}</span>
            <span className="font-mono text-[0.66rem] text-dim">
              {c.docCount != null ? copy.connectorStatus.docCount(c.docCount) : "—"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
