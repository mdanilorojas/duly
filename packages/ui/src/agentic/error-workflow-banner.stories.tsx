import type { Meta, StoryObj } from "@storybook/react";
import { ErrorWorkflowBanner, type ErrorHandlerRef } from "./error-workflow-banner.js";

const meta: Meta<typeof ErrorWorkflowBanner> = {
  title: "Agentic/Error Workflow Banner/V001 Routed to Handler",
  component: ErrorWorkflowBanner,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};
export default meta;

type S = StoryObj<typeof ErrorWorkflowBanner>;

// Software/tech: "Contract Redline Review" agotó sus reintentos contra
// DocuSign y su Error Trigger disparó "Global Error Handler" — el caso base
// que cierra la fila `ErrorWorkflowBanner` del NORTH_STAR (área A).
const handledByGlobalHandler: ErrorHandlerRef = {
  executionId: "exec_5e01f0",
  workflowName: "Global Error Handler",
  status: "success",
  failedNodeTitle: "HTTP Request: Push to DocuSign",
};

export const Handled: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xl">
        <ErrorWorkflowBanner
          handler={handledByGlobalHandler}
          onOpen={() => alert(`Deep-link → ${handledByGlobalHandler.executionId}`)}
        />
      </div>
    </div>
  ),
};

// Petróleo/energía: el propio error handler todavía está corriendo — no
// asumir que "ruteado" implica "ya resuelto"; el `NodeStatusBadge` inline
// hereda la gramática de 6 estados en vez de una tercera codificación de
// color para "en curso".
const handlerStillRunning: ErrorHandlerRef = {
  executionId: "exec_71b0c4",
  workflowName: "HSE Incident Response",
  status: "running",
  failedNodeTitle: "Modbus Read: Wellhead pressure sensor",
};

export const HandlerRunning: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xl">
        <ErrorWorkflowBanner handler={handlerStillRunning} />
      </div>
    </div>
  ),
};

// El handler en sí también puede fallar — un fallo enrutado no es garantía
// de resolución; el propio banner puede llevar a otro fallo.
const handlerAlsoFailed: ErrorHandlerRef = {
  executionId: "exec_8802ee",
  workflowName: "Compliance Escalation",
  status: "error",
  failedNodeTitle: "HTTP Request: Submit SAR filing",
};

export const HandlerAlsoFailed: S = {
  name: "Handler itself failed",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xl">
        <ErrorWorkflowBanner handler={handlerAlsoFailed} />
      </div>
    </div>
  ),
};

export const WithoutFailedNodeTitle: S = {
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xl">
        <ErrorWorkflowBanner handler={{ ...handledByGlobalHandler, failedNodeTitle: undefined }} />
      </div>
    </div>
  ),
};

// Cómo se ve al pie de un RunInspector fallido — el caso de uso principal.
export const OnFailedRunInspector: S = {
  name: "On a failed RunInspector",
  render: () => (
    <div className="min-h-screen bg-bg-base p-12">
      <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-border-subtle bg-surface-2">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-header px-4 py-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-dim">Run inspector</span>
          <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-dim ring-1 ring-border-subtle">
            read-only
          </span>
        </div>
        <div className="p-4">
          <ErrorWorkflowBanner handler={handledByGlobalHandler} />
        </div>
      </div>
      <p className="mx-auto mt-3 max-w-xl font-mono text-[11px] leading-relaxed text-faint">
        Ver la demo integrada completa (banner + botón "Retry" + nodos) en{" "}
        <code className="text-dim">Agentic/Execution History/V001 n8n-style Runs</code>, ejecución{" "}
        <code className="text-dim">exec_a10f55</code>.
      </p>
    </div>
  ),
};
