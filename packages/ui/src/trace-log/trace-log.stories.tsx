import type { Meta, StoryObj } from "@storybook/react";
import { TraceLog } from "./trace-log.js";

const meta: Meta<typeof TraceLog.Root> = {
  title: "Agentic/Trace Log/V001 Registro de eventos",
  component: TraceLog.Root,
};
export default meta;
type S = StoryObj<typeof TraceLog.Root>;

const Sample = (props: React.ComponentProps<typeof TraceLog.Root>) => (
  <TraceLog.Root {...props}>
    <TraceLog.Header title="Pipeline de una consulta" hint="tu lista → mapa" />
    <TraceLog.Body>
      <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
        Lee líneas <TraceLog.Code>predio</TraceLog.Code>
        <TraceLog.Detail>138 IDs únicos tras dedupe</TraceLog.Detail>
      </TraceLog.Row>
      <TraceLog.Row tone="ok" agent="ARCGIS" timestamp="12:04:01">
        Responde GeoJSON.
      </TraceLog.Row>
      <TraceLog.Row tone="review" agent="HUMAN" step="paso 3">
        Requiere revisión.
      </TraceLog.Row>
      <TraceLog.Row tone="warn" agent="COLOR" step="paso 4">
        3 sin geometría.
      </TraceLog.Row>
      <TraceLog.Row tone="block" agent="VALIDATE" step="error">
        Predio inexistente.
      </TraceLog.Row>
    </TraceLog.Body>
  </TraceLog.Root>
);

export const Default: S = { render: () => <Sample /> };
export const Compact: S = { render: () => <Sample density="compact" /> };
export const Streaming: S = { render: () => <Sample streaming /> };
export const Empty: S = {
  render: () => (
    <TraceLog.Root>
      <TraceLog.Header title="Pipeline" />
      <TraceLog.Body>
        <TraceLog.Empty>Sin eventos todavía</TraceLog.Empty>
      </TraceLog.Body>
    </TraceLog.Root>
  ),
};

export const AllTones: S = {
  render: () => (
    <TraceLog.Root>
      <TraceLog.Header title="All status tones" hint="info → ok → review → warn → block" />
      <TraceLog.Body>
        <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
          Procesando lote de validación desde{" "}
          <TraceLog.Code>predio_validacion_2024_Q4_completo.csv</TraceLog.Code> — 138 IDs
          únicos detectados tras deduplicación.
          <TraceLog.Detail>138 IDs únicos tras dedupe; 12 duplicados omitidos</TraceLog.Detail>
        </TraceLog.Row>
        <TraceLog.Row tone="ok" agent="ARCGIS" step="paso 2">
          GeoJSON recibido correctamente.
        </TraceLog.Row>
        <TraceLog.Row tone="review" agent="HUMAN" step="paso 3">
          Requiere revisión manual.
        </TraceLog.Row>
        <TraceLog.Row tone="warn" agent="COLOR" step="paso 4">
          3 predios sin geometría.
        </TraceLog.Row>
        <TraceLog.Row tone="block" agent="VALIDATE" step="error">
          Predio inexistente — ejecución detenida.
        </TraceLog.Row>
      </TraceLog.Body>
    </TraceLog.Root>
  ),
};

export const Truncated: S = {
  render: () => (
    <TraceLog.Root>
      <TraceLog.Header title="Pipeline truncado" hint="mostrando 2 de 47" />
      <TraceLog.Body>
        <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
          Lee líneas <TraceLog.Code>predio</TraceLog.Code>
        </TraceLog.Row>
        <TraceLog.Row tone="ok" agent="ARCGIS" timestamp="12:04:01">
          Responde GeoJSON.
        </TraceLog.Row>
        <TraceLog.Truncated onShowAll={() => {}}>ver todas (45)</TraceLog.Truncated>
      </TraceLog.Body>
    </TraceLog.Root>
  ),
};
