import * as React from "react";
import { cn } from "@/lib/utils";
import { ExecutionHistoryTable, type ExecutionRecord } from "./execution-history-table.js";
import { RunInspector, type RunInspectorNode } from "./run-inspector.js";

export interface ExecutionHistoryConsoleProps extends React.ComponentProps<"div"> {
  title?: string;
  executions: ExecutionRecord[];
  /** Mapa de id de ejecución → nodos, para alimentar el `RunInspector`. */
  nodesByExecution: Record<string, RunInspectorNode[]>;
  /** Id inicialmente seleccionado. Por defecto la primera ejecución. */
  initialSelectedId?: string;
}

/**
 * Master-detail de ejecuciones de workflow: `ExecutionHistoryTable` a la
 * izquierda, `RunInspector` a la derecha — el wrapper enterprise sobre n8n
 * que cierra el ítem #1 de la "Prioridad de construcción" del NORTH_STAR.
 * n8n no ofrece white-label completo ni en su plan OEM (branding visible
 * incluso pagando RBAC/SSO — n8n.io/oem/, confirmado 2026-07-02), así que
 * esta consola es una reconstrucción propia de la vista de ejecuciones, no
 * un iframe del editor n8n. El estado de selección vive en este componente
 * para que el consumidor pueda demostrar el flujo completo con un solo click.
 */
export function ExecutionHistoryConsole({
  title = "Workflow Executions",
  executions,
  nodesByExecution,
  initialSelectedId,
  className,
  ...props
}: ExecutionHistoryConsoleProps) {
  const [selectedId, setSelectedId] = React.useState(initialSelectedId ?? executions[0]?.id);
  const selected = executions.find((e) => e.id === selectedId);
  const rawNodes = selectedId ? nodesByExecution[selectedId] ?? [] : [];
  // `SubworkflowChip`/`ErrorWorkflowBanner` son deep-links a otra fila de esta
  // misma consola — el `onOpen` se agrega aquí, genérico para cualquier nodo/ejecución.
  const nodes = rawNodes.map((node) =>
    node.subworkflow
      ? { ...node, subworkflow: { ...node.subworkflow, onOpen: () => setSelectedId(node.subworkflow!.executionId) } }
      : node,
  );
  const errorHandler = selected?.errorHandler
    ? { ...selected.errorHandler, onOpen: () => setSelectedId(selected.errorHandler!.executionId) }
    : undefined;

  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      <header>
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ExecutionHistoryTable executions={executions} selectedId={selectedId} onSelect={setSelectedId} />
        <RunInspector
          title="Run inspector"
          hint={selected ? `${selected.id} · ${selected.workflowName}` : undefined}
          nodes={nodes}
          errorHandler={errorHandler}
        />
      </div>
    </div>
  );
}
