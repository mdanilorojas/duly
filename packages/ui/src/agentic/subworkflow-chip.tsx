import * as React from "react";
import { Workflow, ArrowUpRight, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import { NodeStatusBadge, type NodeStatus } from "./node-status-badge.js";

export interface SubworkflowRef {
  /** Id de la ejecución hija, ej. "exec_c98b12". */
  executionId: string;
  /** Nombre del workflow hijo, ej. "Customer Onboarding Sync". */
  workflowName: string;
  status: NodeStatus;
  /** Resumen breve sin necesidad de navegar, ej. "4 nodes · 2.1s · 1 retry". */
  summary?: string;
  /** Deep-link al detalle de la ejecución hija — normalmente cambia la selección de un `ExecutionHistoryConsole`. */
  onOpen?: () => void;
}

export interface SubworkflowChipProps extends Omit<React.ComponentProps<"div">, "onOpen"> {
  subworkflow: SubworkflowRef;
}

/**
 * Referencia expandible/deep-link a una ejecución hija — última fila fácil de
 * área A (n8n/proceso empresarial) del NORTH_STAR antes de `WorkflowCanvasFrame`
 * (que requiere diseño propio, mayor esfuerzo). Vive inline junto a un nodo de
 * `RunInspector` (un "Execute Workflow" node en vocabulario n8n) o en una celda
 * de `ExecutionHistoryTable`. Dos affordances distintas y deliberadas: el botón
 * principal es un deep-link (navega a la ejecución hija vía `onOpen`); el
 * caret solo expande un resumen inline sin navegar — así el operador puede
 * confirmar "¿qué corrió ahí?" sin perder el contexto del padre.
 */
export function SubworkflowChip({ subworkflow, className, ...props }: SubworkflowChipProps) {
  const [open, setOpen] = React.useState(false);
  const { executionId, workflowName, status, summary, onOpen } = subworkflow;

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={cn("inline-flex flex-col items-start gap-1", className)}
      {...props}
    >
      <div className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-elevated py-0.5 pl-1 pr-1.5">
        <NodeStatusBadge status={status} size="sm" />
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open subworkflow execution: ${workflowName}, ${executionId}`}
          className="inline-flex min-h-6 items-center gap-1 rounded font-mono text-[10.5px] font-semibold text-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Workflow className="size-3 shrink-0" aria-hidden />
          <span className="max-w-[180px] truncate">{workflowName}</span>
          <ArrowUpRight className="size-3 shrink-0" aria-hidden />
        </button>
        {summary ? (
          <Collapsible.Trigger
            aria-label={open ? "Hide subworkflow summary" : "Show subworkflow summary"}
            className="inline-flex size-5 shrink-0 items-center justify-center rounded text-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown
              className={cn("size-3 transition-transform duration-base ease-standard", open && "rotate-180")}
              aria-hidden
            />
          </Collapsible.Trigger>
        ) : null}
      </div>
      {summary ? (
        <Collapsible.Content className="rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-[10px] text-dim">
          {summary} · <span className="text-faint">{executionId}</span>
        </Collapsible.Content>
      ) : null}
    </Collapsible.Root>
  );
}
