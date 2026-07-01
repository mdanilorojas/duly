import * as React from "react";
import { cn } from "@/lib/utils";
import { AgentGallery } from "./agent-gallery.js";
import { AgentMetric, AgentMetricRow } from "./agent-metric.js";
import { AgentStatusMatrix, type AgentStatusEntry } from "./agent-status-matrix.js";
import { REAL_ESTATE_AGENTS } from "./real-estate-agents.js";
import { TraceLog } from "../trace-log/trace-log.js";

export const PARCEL_STATUS_LEGEND: AgentStatusEntry[] = [
  { code: "cód 3", label: "Liberado", tone: "ok" },
  { code: "cód 4", label: "En proceso", tone: "review" },
  { code: "cód 1", label: "Reproceso fichas valorativas", tone: "warn" },
  { code: "cód 2", label: "Juicio de consignación", tone: "block" },
  { code: "cód 5", label: "Nudos críticos / hereditarios", tone: "block" },
  { code: "cód 0", label: "Sin estatus", tone: "info" },
];

export interface PropertyIntelligenceConsoleProps extends React.ComponentProps<"div"> {
  /** Roster de agentes a mostrar. Por defecto los 6 agentes de Property Intelligence. */
  agents?: typeof REAL_ESTATE_AGENTS;
  /** Leyenda de estatus catastral/legal. */
  statusLegend?: AgentStatusEntry[];
}

/**
 * Consola de operaciones inmobiliarias — primera composición alineada a la
 * industria "Inmobiliaria". Orquesta un roster de agentes de inteligencia
 * catastral (parse → query → geo bridge → color → render → revisión humana),
 * un pipeline de ejecución (`TraceLog`) y una matriz de estatus legal de
 * predios (`AgentStatusMatrix`), sobre métricas operacionales (`AgentMetric`).
 *
 * Portada desde la referencia visual `predios-quito-arquitectura.html`
 * (consulta catastral en vivo contra el servidor ArcGIS del Municipio de Quito).
 */
export function PropertyIntelligenceConsole({
  agents = REAL_ESTATE_AGENTS,
  statusLegend = PARCEL_STATUS_LEGEND,
  className,
  ...props
}: PropertyIntelligenceConsoleProps) {
  return (
    <div className={cn("w-full space-y-10", className)} {...props}>
      <header>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
          Property Intelligence Console
        </h1>
        <p className="max-w-[70ch] text-sm leading-relaxed text-dim">
          Roster de agentes que orquestan una consulta catastral en vivo: normalizan la
          lista de predios, la envían al servidor público del municipio, traducen la
          respuesta a GeoJSON, colorean por estatus legal y escalan los casos
          complejos a revisión humana.
        </p>
      </header>

      <section aria-label="Métricas operacionales">
        <AgentMetricRow>
          <AgentMetric label="Predios / request" value="2000" />
          <AgentMetric label="Servidores en vivo" value="3" />
          <AgentMetric label="Latencia p50" value="340" unit="ms" tone="review" />
          <AgentMetric label="Precisión GeoJSON" value="99.4" unit="%" tone="ok" />
          <AgentMetric label="Pendientes revisión" value="7" tone="warn" />
        </AgentMetricRow>
      </section>

      <section aria-label="Roster de agentes">
        <AgentGallery agents={agents} title="" />
      </section>

      <section aria-label="Pipeline de ejecución" className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <TraceLog.Root>
          <TraceLog.Header title="Pipeline de una consulta" hint="lista de predios → mapa" />
          <TraceLog.Body>
            <TraceLog.Row tone="info" agent="CADASTRAL PARSER" step="paso 1">
              Lee líneas <TraceLog.Code>predio, estatus</TraceLog.Code> y arma la lista única de IDs.
            </TraceLog.Row>
            <TraceLog.Row tone="review" agent="QUERY BROKER" step="paso 2">
              Arma la consulta <TraceLog.Code>where=predio IN(...)&outSR=4326&f=geojson</TraceLog.Code>.
            </TraceLog.Row>
            <TraceLog.Row tone="ok" agent="GEOBRIDGE" step="paso 3">
              GeoJSON recibido en lat/lon — sin token, CORS abierto.
            </TraceLog.Row>
            <TraceLog.Row tone="warn" agent="STATUS COLORIZER" step="paso 4">
              3 predios sin geometría — se listan como faltantes.
            </TraceLog.Row>
            <TraceLog.Row tone="ok" agent="MAP RENDERER" step="paso 5">
              <TraceLog.Code>fitBounds</TraceLog.Code> al conjunto + popup con clave y avalúo.
            </TraceLog.Row>
            <TraceLog.Row tone="review" agent="COMPLIANCE REVIEWER" step="paso 6">
              2 predios con nudos hereditarios — requieren revisión humana.
            </TraceLog.Row>
          </TraceLog.Body>
        </TraceLog.Root>

        <div>
          <div className="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-dim">
            Estatus legal de predios
          </div>
          <AgentStatusMatrix items={statusLegend} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-1" />
        </div>
      </section>
    </div>
  );
}
