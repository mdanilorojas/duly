# Diseño — Componentes gap para la consola ISO 27001

**Fecha:** 2026-07-15
**Fuente:** `wireframes-consola-iso27001.html` (wireframes v0 + user journey map, OXTEAMS × Production Agents)
**Decisiones del usuario:** (A) todo genérico en el DS, semántica ISO vía props · (B) alcance completo incluido ConnectorStatus · (C) KanbanBoard con dnd-kit.

## Contexto

Los wireframes de la consola ISO 27001 mapean cada pantalla del user journey (9 etapas, actores cliente/consultor/agente) a componentes Duly, marcando Duly ✓ / ADAPT / GAP. Al verificar contra el repo real, el inventario del wireframe estaba desactualizado:

| Wireframe decía | Repo real | Veredicto corregido |
|---|---|---|
| AppShell → GAP | `app-shell/` completo (AppShell, AppSidebar, AppTopbar, CommandPalette, WorkspaceSwitcher, EnvironmentBadge) | Composición, no gap |
| AreaMatrix → GAP | `AgentStatusMatrix` existe (grid `{code,label,tone}`, 5 tonos) | Extender, no crear |
| BandGauge → GAP | `RatioGauge` existe pero es ratio continuo | Gap real: escala discreta |
| RemediationBoard → GAP | `MutualActionPlanBoard` es lista, no kanban | Gap real: KanbanBoard |
| Stepper etapas | `ApprovalChainStepper` es cadena vertical de aprobadores | Gap real: Stepper horizontal |
| Dropzone → ADAPT | No existe nada | Gap real |
| DeltaView, ConnectorStatus → GAP | Nada cercano | Gaps reales |
| SoaCoverageBar, GapList, ScopeBuilder | Progress ✓, primitivas de form ✓ | Recetas de composición |
| 7 "Duly ✓" (TraceLog, HumanInterruptQueue, ApprovalGateCard, TokenCostMeter, AuditLogTable, RunTimeline/WhoDidWhatTimeline, Progress) | Confirmados | ✓ |

## Alcance

**7 entregas de componente** (6 nuevos + 1 extensión) + **4 recetas Storybook** + actualización de NORTH_STAR.md + 1 dependencia nueva (dnd-kit).

Regla transversal: el DS entrega primitivas genéricas; la semántica ISO (banda 1–6, 13 áreas SGSI, 93 controles del Anexo A) entra por props desde la app consumidora. Ningún componente hardcodea vocabulario ISO.

## Componentes

### 1. `BandGauge` — `src/compliance/band-gauge.tsx`

Escala discreta de N segmentos con número grande. Cubre el veredicto de banda 1–6 y cualquier score discreto.

```ts
export interface BandGaugeProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Valor actual, 1..max. */
  value: number;
  /** Total de segmentos. Default 6. */
  max?: number;
  label: string;
  /** Texto secundario, ej. "Partial Readiness" o la regla que produjo el valor. */
  hint?: string;
  /** Tono explícito; si se omite se deriva de value/max (≥.7 ok, ≥.4 warn, <.4 block). */
  tone?: Tone;
}
```

- Segmentos llenos = `value`, vacíos = resto. Número grande `value/max` en mono.
- Colorblind-safe: número + segmentos + etiqueta de texto (el tono nunca es el único canal).
- A11y: `role="meter"`, `aria-valuenow/min/max`, `aria-label`.

### 2. `AgentStatusMatrix` extendido — `src/agentic/agent-status-matrix.tsx`

Extensión backward-compatible, no componente nuevo:

```ts
export interface AgentStatusEntry {
  code: string;
  label: string;
  tone: Tone;
  /** Marca la celda como crítica (borde reforzado + ⚠ accesible). */
  critical?: boolean;   // NUEVO
}

export interface AgentStatusMatrixProps extends React.ComponentProps<"div"> {
  items: AgentStatusEntry[];
  /** "compact": celda densa tipo heatmap (código + chip kind). Default "default". */
  density?: "default" | "compact";   // NUEVO
  /** Si se provee, las celdas son botones. */
  onSelectItem?: (item: AgentStatusEntry) => void;   // NUEVO
}
```

- `density="compact"` reproduce la AreaMatrix del wireframe (13 celdas, minmax ~120px).
- `critical` añade ⚠ con texto accesible (`<span class="sr-only">crítica</span>`), no solo color.
- Con `onSelectItem` las celdas se vuelven `<button>` con focus visible; sin él, se mantiene `role="list"` actual.

### 3. `DeltaList` — `src/compliance/delta-list.tsx`

Filas antes → después. Cubre diffRuns (qué áreas subieron de banda) y cualquier comparación entre corridas.

```ts
export interface DeltaEntry {
  label: string;
  before: { label: string; tone: Tone };
  after: { label: string; tone: Tone };
  /** Mejora explícita (el DS no infiere ranking de tonos). */
  improved?: boolean;
}

export interface DeltaListProps extends Omit<React.ComponentProps<"ul">, "children"> {
  entries: DeltaEntry[];
}
```

- Fila: label · chip before · → · chip after · ▲ si `improved`.
- El cálculo del diff es del consumidor (fold en pack-kit); el DS solo presenta.

### 4. `KanbanBoard` — `src/kanban/kanban-board.tsx` (dir propio, patrón `data-table/`)

Tablero de columnas con drag & drop vía dnd-kit. Cubre RemediationBoard y cualquier backlog por estados.

```ts
export interface KanbanTicket {
  id: string;
  title: string;
  /** Línea meta en mono, ej. "ACCESS-CONTROL · crítica". */
  meta?: string;
  tone?: Tone;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tickets: KanbanTicket[];
}

export interface KanbanBoardProps extends Omit<React.ComponentProps<"div">, "children" | "onDrop"> {
  columns: KanbanColumn[];
  /** Controlado: el consumidor aplica el movimiento y re-renderiza. */
  onMove?: (ticketId: string, toColumn: string, index: number) => void;
  /** Sin onMove el tablero es read-only (sin drag). */
}
```

- **Dependencia nueva:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Componente controlado: nunca muta estado propio; `onMove` y el consumidor decide.
- A11y: KeyboardSensor + `announcements` en español vía `useCopy` (pick up / move / drop / cancel).
- Sin `onMove`: render estático, cero sensores montados.

### 5. `Dropzone` — `src/components/ui/dropzone.tsx`

Zona de carga presentacional. Cubre el data room y cualquier ingesta manual.

```ts
export interface DropzoneProps extends Omit<React.ComponentProps<"div">, "onDrop" | "children"> {
  onFiles: (files: File[]) => void;
  accept?: string;        // pasa directo al <input type="file">
  multiple?: boolean;     // default true
  disabled?: boolean;
  /** Título y hint visibles; defaults vía useCopy. */
  label?: string;
  hint?: string;
}
```

- Estados: idle / drag-over (borde accent + surface accent) / disabled.
- `<input type="file">` oculto como fallback accesible: la zona entera es un `<button>` focusable; Enter/Space abre el picker.
- Cero lógica de upload, hash o custodia — eso es de la app (evento DocumentoRecibido).

### 6. `ConnectorStatus` — `src/agentic/connector-status.tsx`

Estado de fuentes de ingesta (SourceConnector, D5).

```ts
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

export interface ConnectorStatusProps extends Omit<React.ComponentProps<"ul">, "children"> {
  connectors: ConnectorEntry[];
}
```

- Mapeo de tono: connected→ok, syncing→review (con spinner), error→block, paused→info.
- Ícono + color + etiqueta de texto por estado (colorblind-safe).

### 7. `Stepper` — `src/components/ui/stepper.tsx`

Stepper horizontal de etapas de proceso. Cubre la stagebar del shell (9 etapas ISO) y cualquier wizard/proceso.

```ts
export type StepState = "done" | "current" | "pending";

export interface StepperStep {
  label: string;
  state: StepState;
}

export interface StepperProps extends Omit<React.ComponentProps<"ol">, "children"> {
  steps: StepperStep[];
  /** Si se provee, los pasos done son clickeables (navegación hacia atrás). */
  onStepClick?: (index: number) => void;
}
```

- Pills numeradas como el wireframe: done→ok, current→accent+surface, pending→faint.
- `aria-current="step"` en el actual; lista ordenada semántica.

## Recetas (stories, cero componentes nuevos)

Ubicación: `src/stories/recipes/` (las stories por componente van co-locadas junto a cada componente, como el resto del repo). Cada receta es una story con datos sintéticos del dominio ISO que demuestra que la composición cubre el wireframe:

1. **SoaCoverageBar** — `Progress` + fila de labels ("47 de 93 controles del Anexo A" / "51%") + nota de tope de banda.
2. **GapList** — filas con `Badge` severidad (crítica/normal) + descripción + chip de impacto ("+2 bandas"). Primitivas: Card/Badge existentes.
3. **ScopeBuilder** — form de alcance con Checkbox/Select/Input/Textarea existentes: unidades, procesos, controles incluidos.
4. **Consola ISO completa** — demo integrada: `AppShell` + `WorkspaceSwitcher` (engagements) + `Stepper` (9 etapas) + lienzo con las pantallas compuestas (BandGauge + AgentStatusMatrix compact + GapList + DeltaList + KanbanBoard + Dropzone + ConnectorStatus + los 7 Duly ✓ existentes). Es la prueba de que el DS suple los wireframes completos.

## Fuera de alcance

- Lógica de upload, hashing, custodia, SSE, folds de eventos (diffRuns) — viven en pack-kit / la consola.
- Vocabulario ISO hardcodeado en el DS (áreas, bandas, Anexo A) — entra por props/stories.
- La consola como app — este repo entrega el DS y la demo Storybook, no el producto.
- White-label del editor n8n (nota NORTH_STAR 2026-07-02, no aplica aquí).

## Testing

Por componente nuevo/extendido: test vitest + Testing Library + jest-axe (patrón del repo).

- `BandGauge`: segmentos llenos = value, `role="meter"` con aria correctos, tono derivado en los 3 rangos, axe limpio.
- `AgentStatusMatrix`: API previa intacta (density default), compact renderiza, critical expone texto accesible, onSelectItem convierte celdas en botones.
- `DeltaList`: render de before/after/▲, axe limpio.
- `KanbanBoard`: render controlado, `onMove` dispara con (ticketId, toColumn, index) al soltar, read-only sin onMove, announcements presentes, axe limpio.
- `Dropzone`: onFiles con drop y con input, estado drag-over, disabled no dispara, axe limpio.
- `ConnectorStatus`: 4 estados con etiqueta de texto, axe limpio.
- `Stepper`: `aria-current="step"` único, onStepClick solo en done, axe limpio.

## Criterio de éxito

Cada bloque de los wireframes (v0) tiene componente o receta Duly asignada sin ningún GAP restante; la story "Consola ISO completa" replica las 5 pantallas + shell con el tema cockpit; `pnpm test` y `pnpm lint` verdes; NORTH_STAR.md actualizado con las filas nuevas (área C y donde corresponda).
