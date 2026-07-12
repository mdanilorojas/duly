import * as React from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import { NodeStatusBadge, nodeStatusConnectorClass, type NodeStatus } from "./node-status-badge.js";
import { RetryControls, type RetryAttemptRecord } from "./retry-controls.js";
import { SubworkflowChip, type SubworkflowRef } from "./subworkflow-chip.js";
import { ErrorWorkflowBanner, type ErrorHandlerRef } from "./error-workflow-banner.js";

export interface RunInspectorNode {
  id: string;
  /** Nombre del nodo, ej. "HTTP Request: Fetch invoice". */
  title: string;
  status: NodeStatus;
  /** Tipo de nodo, ej. "n8n-nodes-base.httpRequest". */
  nodeType?: string;
  /** Hora relativa o duración, ej. "T+01.2s" o "184ms". */
  meta?: string;
  attempt?: [current: number, max: number];
  /** Datos de entrada del nodo, pares clave/valor tipo JSON. */
  input?: Record<string, React.ReactNode>;
  /** Datos de salida del nodo, pares clave/valor tipo JSON. Se omite en nodos sin output (ej. skipped). */
  output?: Record<string, React.ReactNode>;
  /** Mensaje de error — solo se pinta cuando `status="error"`. */
  error?: string;
  /** Controles de retry anclados al marcador "Failed here" — solo se pintan cuando `status="error"`. */
  retry?: {
    maxAttempts: number;
    history?: RetryAttemptRecord[];
    onRetryFromStart?: () => void;
    onRetryFromFailedNode?: () => void;
  };
  /** Referencia a la ejecución hija — solo en nodos tipo "Execute Workflow". */
  subworkflow?: SubworkflowRef;
}

function DataPane({ title, data }: { title: string; data?: Record<string, React.ReactNode> }) {
  const entries = data ? Object.entries(data) : [];
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated">
      <div className="border-b border-border-subtle bg-surface-header px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-dim">
        {title}
      </div>
      {entries.length === 0 ? (
        <div className="px-2.5 py-2 font-mono text-[10.5px] text-dim">—</div>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 px-2.5 py-2 text-[11px]">
          {entries.map(([key, value]) => (
            <React.Fragment key={key}>
              <dt className="font-mono text-dim">{key}</dt>
              <dd className="min-w-0 truncate font-mono text-ink">{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
    </div>
  );
}

interface InspectorNodeRowProps {
  node: RunInspectorNode;
  isLast: boolean;
  defaultOpen: boolean;
}

function InspectorNodeRow({ node, isLast, defaultOpen }: InspectorNodeRowProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const isFailure = node.status === "error";
  const hasDetail = Boolean(node.input || node.output || node.error);

  return (
    <li className="relative flex gap-4 pb-6">
      {!isLast ? (
        <span
          aria-hidden
          className={cn("absolute start-[15px] top-8 bottom-0 w-px", nodeStatusConnectorClass(node.status))}
        />
      ) : null}
      <NodeStatusBadge status={node.status} attempt={node.attempt} className="relative z-10 shrink-0" />

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-[13px] font-medium leading-snug text-ink">{node.title}</span>
          {node.nodeType ? (
            <span className="font-mono text-[10px] text-dim">{node.nodeType}</span>
          ) : null}
          {node.meta ? (
            <span className="ms-auto font-mono text-[10px] text-dim">{node.meta}</span>
          ) : null}
        </div>

        {node.subworkflow ? (
          <div className="mt-2">
            <SubworkflowChip subworkflow={node.subworkflow} />
          </div>
        ) : null}

        {isFailure ? (
          <div className="mt-2 rounded-md border border-block/40 bg-block/10 px-2.5 py-1.5">
            <div className="flex items-start gap-1.5 text-[11px] font-semibold text-block">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>Failed here{node.error ? ` — ${node.error}` : ""}</span>
            </div>
            {node.retry ? (
              <RetryControls
                variant="inline"
                attempt={[node.attempt?.[0] ?? 1, node.retry.maxAttempts]}
                failedNodeTitle={node.title}
                history={node.retry.history}
                onRetryFromStart={node.retry.onRetryFromStart}
                onRetryFromFailedNode={node.retry.onRetryFromFailedNode}
              />
            ) : null}
          </div>
        ) : null}

        {hasDetail ? (
          <Collapsible.Root open={open} onOpenChange={setOpen} className="mt-2">
            <Collapsible.Trigger className="inline-flex items-center gap-1 rounded font-mono text-[10px] text-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring">
              <ChevronDown
                className={cn("size-3 transition-transform duration-base ease-standard", open && "rotate-180")}
                aria-hidden
              />
              {open ? "hide input/output" : "view input/output"}
            </Collapsible.Trigger>
            <Collapsible.Content className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <DataPane title="Input" data={node.input} />
              <DataPane title="Output" data={node.output} />
            </Collapsible.Content>
          </Collapsible.Root>
        ) : null}
      </div>
    </li>
  );
}

export interface RunInspectorProps extends React.ComponentProps<"div"> {
  title?: string;
  /** Id del run o workflow, mostrado como hint, ej. "exec_9f21a0". */
  hint?: string;
  nodes: RunInspectorNode[];
  emptyLabel?: string;
  /** Se pinta cuando el fallo de este run fue enrutado a un workflow de error handling. */
  errorHandler?: ErrorHandlerRef;
}

/**
 * Replay read-only de una ejecución, nodo por nodo — segunda mitad del ítem
 * #1 de la "Prioridad de construcción" del NORTH_STAR (`ExecutionHistoryTable`
 * + `RunInspector`). A diferencia de `ExecutionTimeline`/`RunStep` (pensado
 * para pasos de un run de agentes: tool call/decisión/aprobación),
 * `RunInspector` habla el vocabulario de nodos de workflow estilo n8n — cada
 * nodo expone input/output como panes JSON separados, y el nodo que falló
 * lleva un marcador "Failed here" inequívoco y expandido por defecto, sin
 * depender solo del color del anillo de estado. El resto es de solo
 * lectura — la única acción disponible es `RetryControls` (retry-desde-
 * inicio vs desde-nodo-fallido), anclada directamente al marcador "Failed
 * here" cuando `node.retry` está presente, tal como pedía la nota de diseño
 * del NORTH_STAR para esta prioridad #1. Extendido con dos filas más de área
 * A: `node.subworkflow` pinta un `SubworkflowChip` inline en un nodo tipo
 * "Execute Workflow"; `errorHandler` pinta un `ErrorWorkflowBanner` cuando el
 * fallo de este run fue enrutado a otro workflow de error handling.
 */
export function RunInspector({
  title = "Run inspector",
  hint,
  nodes,
  emptyLabel = "Select an execution to inspect its nodes.",
  errorHandler,
  className,
  ...props
}: RunInspectorProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border-subtle bg-surface-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-1 border-b border-border-subtle bg-surface-header px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">{title}</span>
        <span className="flex items-center gap-2">
          <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-dim ring-1 ring-border-subtle">
            read-only
          </span>
          {hint ? <span className="min-w-0 truncate font-mono text-[11px] text-dim">{hint}</span> : null}
        </span>
      </div>

      {errorHandler ? (
        <div className="px-4 pt-4">
          <ErrorWorkflowBanner handler={errorHandler} />
        </div>
      ) : null}

      {nodes.length === 0 ? (
        <div className="px-4 py-10 text-center text-xs text-dim">{emptyLabel}</div>
      ) : (
        <ol className="px-4 pt-4">
          {nodes.map((node, i) => (
            <InspectorNodeRow
              key={node.id}
              node={node}
              isLast={i === nodes.length - 1}
              defaultOpen={node.status === "error"}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
