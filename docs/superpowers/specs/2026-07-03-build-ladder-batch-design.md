# Batch Design Spec — §07 Build Ladder (19 unidades)

> Fecha: 2026-07-03 · Companion visual: `2026-07-03-build-ladder-batch-design.html`
> **Aprobación única.** Este doc fija TODAS las decisiones de diseño. Aprobado esto,
> el loop autónomo construye unidad por unidad sin más gates.
> Deriva de `2026-07-03-design-system-gap-analysis.md` (§07 prioridades).

## Cómo lo consume el loop

Por cada unidad, en orden: **failing test → implementar → `build+test+axe` verde → self-review → commit → log → siguiente.**
Si una unidad no pasa su gate: entrada `BLOCKED` en `AGENTIC_EXPERIMENTS_LOG.md` con la razón, y sigue con la próxima (skip, no stop). Resumen al final.

## Decisiones transversales

### Dependencias nuevas (headless/maduras — cero invención)

| Dep | Rung que la introduce | Uso | Peso |
|---|---|---|---|
| `@tanstack/react-table` + `@tanstack/react-virtual` | 1 | DataTable (sorting/filtering/virtualización headless) | ~14kb+5kb, tree-shakeable |
| `@xyflow/react` (React Flow) | 2 | AgentTopologyGraph, RelationshipMap, mímicos | ~40kb, lazy-loaded |
| `recharts` | 4 | PipelineWaterfall, MRRWaterfall, OEEWaterfall, sparklines | usa el mismo patrón que shadcn charts |
| `cmdk` | (D, futuro) | CommandPalette | el que ya usa shadcn |
| `react-aria-components` | (D, futuro) | DateRangePicker | a11y de fechas |

Regla: cada dep se **envuelve** en un componente propio con tokens OKLCH + estilo shadcn. Nunca se expone la API cruda de la lib al consumidor del DS. Charts y grafos se cargan con `React.lazy` para no inflar el bundle base.

### Layout de archivos

```
packages/ui/src/
  data-table/            # rung 1  — DataTable, FilterBar, SavedViews, useSavedViews
  agentic/               # existente — orchestration (rung 2) vive aquí, junto a lo agentic
  compliance/            # rung 3  — EvidenceExportDialog, ApprovalChainStepper, ModelProvenanceCard
  commercial/            # rung 4  — área E
  industrial/            # rung 5  — área F (disciplina ISA-101)
```
Cada carpeta: `component.tsx`, `component.variants.ts` (si hay CVA), `component.stories.tsx`, `component.test.tsx`, y re-export en el barrel + `src/index.ts`.

### Convenciones de casa (recap — obligatorias en cada unidad)

- `cn` desde `@/lib/utils`. Variantes con `cva`. Reutilizar `Tone`/`Density` de `trace-log/trace-log.variants.ts`.
- Solo tokens semánticos como clases: `text-ink|dim|faint`, `bg-bg-base|bg-elevated|surface-2|surface-3|surface-header`, `border-border-subtle|default|strong`, `text-ok|review|warn|block|info`, `bg-{tone}/15`.
- a11y: tabla semántica (`<table>`, `scope`, `<caption class="sr-only">`), `role="status"`, `aria-label`, foco visible, hit-area ≥24px, `motion-safe:` en toda animación, estado nunca solo por color (color + forma/ícono/trazo).
- Props extienden `React.ComponentProps<"div">` y hacen spread `...props`. JSDoc citando el principio NORTH_STAR relevante.
- Sin datos inventados en producción: los componentes reciben data por props; los mocks viven en stories.

### Regla de refactor seguro (rung 6)

`AuditLogTable` y `ExecutionHistoryTable` se re-montan sobre `DataTable` **sin cambiar su API pública** (mismos props `events`/`runs`, mismo render). Los tests existentes son el guard: pasan antes y después. Nada se construye encima de algo a medias — el DataTable base (rung 1) debe estar ✅ y mergeado antes de tocar estas dos.

---

## Rung 1 — DataTable denso virtualizado (fundamento)

**Desbloquea A/C/E/F/G. Corrige 2 bugs (nada virtualiza hoy).**

### `DataTable<T>`
- **Framework:** `@tanstack/react-table` (modelo headless) + `@tanstack/react-virtual` (filas).
- **Purpose:** primitiva de tabla densa, virtualizada, accesible y tokenizada. Todas las tablas del DS se componen encima.
- **API:**
  ```ts
  interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];          // re-export del tipo de TanStack
    density?: Density;                // "comfortable" | "compact" (default comfortable)
    getRowId?: (row: T) => string;
    rowTone?: (row: T) => Tone;       // franja de tono opcional por fila (reusa border-l-{tone})
    onRowActivate?: (row: T) => void; // Enter/click → detalle (master-detail)
    stickyHeader?: boolean;           // default true
    maxHeight?: number;               // alto del viewport virtualizado (default 480)
    caption: string;                  // obligatorio (a11y)
    emptyState?: React.ReactNode;     // slot; default EmptyState (rung D-triad mínima)
    toolbar?: React.ReactNode;        // slot para <FilterBar/> + <SavedViews/>
  }
  ```
- **Estados:** loading (skeleton rows), empty (EmptyState), populated, row-hover, row-selected/active. Density comfortable/compact cambia `py` y font-size.
- **Virtualización:** `rowVirtualizer` con `overscan=8`; header sticky real (`<thead>` sticky). Solo se virtualiza el body; el `<table>` sigue siendo semántico (roles ARIA de grid donde virtualización rompe el `<tr>` nativo — usar `role="row/gridcell"` en el modo virtual, con `aria-rowcount`/`aria-rowindex`).
- **Teclado (roving tabindex):** ↑/↓ mueve fila activa, Enter activa, Home/End salta, PageUp/Down por viewport. Foco visible en la fila.
- **Reuse:** `Tone`/`Density` existentes; `cn`; tokens. No reescribe sorting/filtering — usa los row models de TanStack.
- **Test (TDD):** (1) renderiza N filas pero solo monta ~viewport (assert nodos < data.length); (2) ↓ mueve `aria-rowindex` activo; (3) Enter dispara `onRowActivate`; (4) density compact reduce padding class; (5) axe 0 violaciones; (6) empty state cuando `data=[]`.
- **a11y:** `aria-rowcount` total real (no el virtual), `caption`, header `scope="col"`, foco de fila visible, targets 24px.

### `FilterBar`
- **Purpose:** barra de filtros tipada sobre el estado de columnas de TanStack (text/select/tone/date-range placeholder).
- **API:** `{ table: Table<T>; fields: FilterField[] }` donde `FilterField = { columnId; kind: "text"|"select"|"tone"; options? }`.
- **Reuse:** primitivas `Input`, `Select`, `Badge` ya existentes.
- **Test:** escribir en un filtro reduce filas visibles; limpiar restaura.

### `SavedViews` + `useSavedViews`
- **Purpose:** guardar/restaurar `{ filters, sorting, density }` como vistas nombradas (feature de compliance — autoservicio del auditor, principio #10).
- **API:** `useSavedViews(key: string)` → `{ views, save(name), apply(id), remove(id) }`. Persistencia: `localStorage` por `key` (inyectable para test). `<SavedViews>` = chips de vista con conteo.
- **Reuse:** patrón de saved-query chips que ya existe en `WhoDidWhatTimeline`.
- **Test:** save crea vista; apply restaura sorting+filters; persiste entre montajes (mock storage).

---

## Rung 2 — Orquestación mínima (área G) · React Flow

### `AgentTopologyGraph`
- **Framework:** `@xyflow/react` (lazy). **Purpose:** grafo vivo de la flota; nodos = agentes con estado/costo/tokens, edges = hops activos (animados motion-safe).
- **API:** `{ nodes: AgentNode[]; edges: AgentEdge[]; onSelect?(id); layout?: "hierarchy"|"force" }`. `AgentNode = { id; label; role; status: NodeStatus; tokens?; costUsd? }` — **reusa `NodeStatus`** (6 estados) y `NodeStatusBadge` dentro del nodo custom.
- **Estados:** nodo idle/running/error/waiting (via NodeStatus), edge activo (dashed animado) vs inactivo.
- **Reuse:** `NodeStatusBadge`, tokens, `AgentTile` (ver rung 6 rename). Custom node/edge renderers, no estilos default de React Flow.
- **Test:** render de N nodos; click nodo → `onSelect`; edge activo tiene clase de animación; axe en controles.
- **a11y:** grafo tiene fallback de lista navegable por teclado (React Flow es canvas — proveer `role="list"` alterno con los mismos nodos); no depender solo del canvas.

### `SwarmControlBar`
- **Purpose:** pausar/reanudar/cancelar el enjambre o cohorte filtrada (broadcast). **Sin framework nuevo** (composición de primitivas).
- **API:** `{ state: "running"|"paused"|"stopping"; selectionCount?; onPause; onResume; onCancel; disabled? }`.
- **Estados:** running (Pause+Cancel activos), paused (Resume), stopping (spinner, todo disabled). Cancel = acción destructiva → confirm inline (patrón `ApprovalGateCard`).
- **Reuse:** `Button` variants, `NodeStatusBadge` para el estado agregado.
- **Test:** onPause/Resume/Cancel disparan; cancel pide confirmación; stopping deshabilita todo.

### `BudgetCapGovernor`
- **Purpose:** cap de gasto por agente/workflow con burn-down vs cap y auto-halt visual al 100%. **Purpose FinOps** (alimenta desde `TokenCostMeter`).
- **API:** `{ caps: BudgetCap[] }` con `BudgetCap = { scope; label; spentUsd; capUsd; onBreach? }`. Barra de progreso con umbrales ok(<70%)/warn(70–99%)/block(≥100%) — **reusa la gramática de umbral de `TokenCostMeter`**.
- **Estados:** ok/warn/block por cap; halted (≥cap) con badge block.
- **Test:** spent/cap calcula % y tono correcto; ≥100% marca halted; umbrales en los cortes.

---

## Rung 3 — Cerrar compliance (área C)

### `EvidenceExportDialog`
- **Framework:** `Dialog` existente (Radix). **Purpose:** export firmado (PDF/CSV/JSON) de un rango filtrado con manifiesto de hashes.
- **API:** `{ open; onOpenChange; range; recordCount; formats?; onExport(format, opts): Promise<ExportResult> }`. Muestra manifiesto = lista de hashes incluidos + hash del manifiesto.
- **Estados:** idle → generating (progress) → done (link+hash del manifiesto) / error. Botón Export "nunca desnudo" (muestra qué se exporta, cuántos registros, rango).
- **Reuse:** `Dialog`, `HashBadge` (exportado desde audit-log-table), `Progress`, `Button`.
- **Test:** onExport recibe formato+rango; estado generating deshabilita; done muestra hash del manifiesto; error muestra mensaje accionable.

### `ApprovalChainStepper`
- **Purpose:** quién aprobó qué, cuándo, en qué orden, con ramas de rechazo. **Sin framework nuevo.**
- **API:** `{ steps: ApprovalStep[] }`, `ApprovalStep = { approver; role; decision: "approved"|"rejected"|"pending"|"escalated"; at?; note? }`.
- **Estados:** por paso — reusa `Tone` (approved=ok, rejected=block, pending=info, escalated=warn) con ícono + color (colorblind-safe). Conector vertical entre pasos (reusa patrón de `nodeStatusConnectorClass`).
- **Reuse:** `actorKindConfig`/`ActorCell` de audit-log-table para el approver; tone chips.
- **Test:** render de N pasos en orden; rechazo corta la cadena visualmente; pending distinguible sin color (ícono).

### `ModelProvenanceCard`
- **Purpose:** modelo, versión, prompt version, config hash por run (procedencia sobre magia, principio #8).
- **API:** `{ model; modelVersion; promptVersion; configHash; temperature?; provider? }`.
- **Estados:** compacto (chips inline) y expandido (todos los campos). Chips de procedencia reusan estilo de `HashBadge`.
- **Reuse:** `HashBadge`, `Badge`, tokens.
- **Test:** renderiza cada campo; configHash truncado con full en title; expand/collapse.

---

## Rung 4 — Núcleo comercial (área E) · Recharts

### `ForecastRollupTable`
- **Framework:** `DataTable` (rung 1) — filas expandibles (rep→manager→exec). **Purpose:** roll-up jerárquico commit/best-case/pipeline con delta submitted-vs-current.
- **API:** `{ rows: ForecastRow[] }`, `ForecastRow = { id; owner; level; commit; bestCase; pipeline; closed; quota; children?; delta? }`. Delta con flecha ↑/↓ y tono.
- **Reuse:** `DataTable` con `getSubRows`, `ActorCell` para owner, `RatioGauge` (ver abajo) para attainment. Números `tabular-nums`.
- **Test:** expand fila muestra children; delta positivo=ok/negativo=block; totales por nivel.

### `RatioGauge` (primitiva compartida)
- **Purpose:** medidor de ratio reutilizado por `QuotaAttainmentGauge` y `PipelineCoverageGauge` (consolidación notada en gap analysis).
- **API:** `{ value; target; label; format?: "pct"|"x"|"usd"; tone? }`. Barra + valor grande `tabular-nums`, tono por umbral vs target.
- **Test:** value/target → % y tono; formato x vs pct.

### `PipelineWaterfallChart`
- **Framework:** `recharts` (lazy). **Purpose:** cambio período-a-período (created/expanded/pushed/slipped/won/lost) como waterfall.
- **API:** `{ segments: WaterfallSegment[]; startValue; endValue }`, cada segment `{ label; delta; kind }`. Colores por kind desde tokens (positivo=ok, negativo=block, neutro=info).
- **Reuse:** wrapper `ChartFrame` (contenedor temado común para todos los charts recharts — grid faint, ejes dim, tooltip surface-3). Se crea una vez aquí, lo reusan MRR y OEE.
- **Test:** suma de deltas = endValue−startValue; kinds mapean a tono; tooltip accesible.

### `MutualActionPlanBoard`
- **Purpose:** plan de hitos comprador/vendedor con owners, due, dependencias, estado. **Sin framework nuevo** (lista/board).
- **API:** `{ milestones: Milestone[]; onToggle?(id) }`, `Milestone = { id; title; owner; side: "buyer"|"seller"; due; status; dependsOn? }`.
- **Estados:** milestone done/in-progress/blocked/overdue (reusa Tone + NodeStatus vocab). Side buyer/seller distinguible (reusa dualidad de actor).
- **Test:** overdue (due<now) marca warn; toggle cambia estado; dependencia bloqueada visible.

### `RelationshipMap`
- **Framework:** `@xyflow/react` (reusa infra de rung 2). **Purpose:** org-chart de stakeholders con rol (champion/economic-buyer/blocker), influencia, fuerza de conexión.
- **API:** `{ people: Stakeholder[]; links: Link[] }`, `Stakeholder = { id; name; title; role; influence: 1-5 }`.
- **Reuse:** infra de nodo/edge de `AgentTopologyGraph`; `ActorCell` style. Rol por color+ícono (colorblind-safe).
- **Test:** render nodos; rol=blocker tono block; fallback de lista navegable.

### `PricingApprovalMatrix`
- **Purpose:** ruteo de aprobación por umbral de descuento/margen → cadena de aprobador, con estado y audit trail. **Sin framework nuevo.**
- **API:** `{ tiers: DiscountTier[]; currentDiscount }`, `DiscountTier = { maxDiscountPct; approverRole; slaHours }`. Resalta el tier activo según currentDiscount.
- **Reuse:** `DataTable` o grid simple; `ApprovalChainStepper` (rung 3) para la cadena; tone chips.
- **Test:** currentDiscount selecciona el tier correcto; tier sobre umbral marca warn/block.

### `MRRMovementWaterfall`
- **Framework:** `recharts` via `ChartFrame`. **Purpose:** bridge de MRR (new/expansion/contraction/churn/reactivation).
- **API:** `{ start; movements: {kind; amount}[] }`. Reusa `PipelineWaterfallChart` como base (misma mecánica de waterfall) parametrizado por kinds de MRR.
- **Test:** movimientos suman al MRR final; contraction/churn=block, expansion/new=ok.

---

## Rung 5 — Núcleo industrial OT (área F) · disciplina ISA-101

> **Regla ISA-101 (obligatoria en toda el área F):** base grayscale (superficies dark del tema), color saturado SOLO en estado anormal/accionable. Estado normal = sin color. Severidad nunca solo por color (color + forma + etiqueta).

### `AlarmChip` / `PriorityBadge` (primitiva base del área)
- **Purpose:** indicador prioridad+estado (Critical/High/Med/Low × Active/Ack/RTN) colorblind-safe. **Se construye primero — lo reusan Banner y Table.**
- **API:** `{ priority: "critical"|"high"|"medium"|"low"; state: "unack"|"ack"|"rtn"|"shelved" }`. Mapea a Tone (critical=block, high=warn, medium=review, low=info) + forma por estado.
- **Test:** cada combinación priority×state; distinguible sin color (assert ícono/forma).

### `AlarmBanner`
- **Purpose:** strip persistente con la alarma no-reconocida de mayor prioridad + conteo + ack (ISA-18.2). Siempre visible.
- **API:** `{ topAlarm?: Alarm; unackCount; onAck() }`. Vacío/silencioso cuando no hay alarmas (grayscale, sin color).
- **Reuse:** `AlarmChip`, `Button`. **Test:** muestra la de mayor prioridad; onAck dispara; 0 alarmas → estado calmo sin color.

### `AlarmSummaryTable`
- **Framework:** `DataTable` (rung 1). **Purpose:** lista de alarmas activas (prioridad/estado/timestamp/área/ack) ordenable por prioridad y tiempo.
- **API:** `{ alarms: Alarm[]; onAck(id); onShelve(id) }`. Orden default: prioridad desc, luego tiempo.
- **Reuse:** `DataTable`, `AlarmChip`. **Test:** orden por prioridad; ack/shelve por fila; virtualiza en flood (1000 alarmas).

### `ProcessValueTile`
- **Purpose:** valor de proceso con barra analógica embebida + desviación de setpoint; color solo en límite (ISA-101).
- **API:** `{ label; value; unit; setpoint?; min; max; loLimit?; hiLimit? }`. Barra posicional; texto grande `tabular-nums`.
- **Estados:** normal (grayscale), warn (fuera de límite operativo), block (fuera de límite crítico). **Test:** value fuera de hiLimit → block; dentro → sin color; barra posiciona correcto.

### `AssetHealthGauge`
- **Purpose:** índice de salud 0–100 con bandas healthy(≥70)/watch(40–69)/critical(<40).
- **API:** `{ value; label; trend?: number }`. Reusa `RatioGauge` (rung 4) o arco propio; tono por banda + flecha de tendencia.
- **Test:** value en cada banda → tono correcto; trend flecha.

### `OEEWaterfall`
- **Framework:** `recharts` via `ChartFrame`. **Purpose:** waterfall planned→availability→performance→quality→OEE (ISO 22400).
- **API:** `{ plannedTime; losses: {kind; amount}[] }`. Reusa base de waterfall (rung 4). **Test:** pérdidas restan hasta OEE neto; kinds mapean.

### `AutonomyModeSwitch`
- **Purpose:** selector de nivel de autonomía por loop/área (Manual→Advisory→Supervised→Full-Auto) — la válvula maestra de agencia.
- **API:** `{ value: AutonomyLevel; onChange(level); disabledAbove?: AutonomyLevel }`. Segmented control; subir nivel = acción sensible → confirm.
- **Reuse:** patrón de `Switch`/segmented; confirm de `ApprovalGateCard`. **Test:** onChange dispara; subir a Full-Auto pide confirmación; disabledAbove bloquea niveles.

---

## Rung 6 — Adopción de estándares + correcciones

> Toca código existente. Cada uno mantiene la API pública estable salvo el rename (que actualiza consumidores en el mismo commit). Tests existentes = guard.

1. **DataTable refactor:** re-montar `AuditLogTable` + `ExecutionHistoryTable` sobre `DataTable`. API pública intacta; sus tests pasan antes/después; ahora virtualizan. **Corrige el bug de no-virtualización.**
2. **`a11y-audit.mjs` fix:** `ROOT` hardcodeado → ruta relativa (`path.resolve(fileURLToPath(import.meta.url), "../..")`). **Corrige bug de portabilidad CI.** (Unidad mecánica, sin diseño.)
3. **`AgentCard → AgentTile` rename:** renombrar presentación; añadir stub `A2AAgentCardViewer` (discovery doc A2A). Actualizar barrel + consumidores en el mismo commit.
4. **`RichToolCallCard` → MCP Apps:** añadir modo de render vía iframe sandbox + postMessage (MCP Apps, ratif. 2026-01-26) además del render propio (no romper el existente — es aditivo, `variant="mcp-app"`).
5. **`StreamingMessage`** (nuevo, cierra gap B): conformar eventos AG-UI (~16 tipados). Construir nuevo conforme al estándar desde el inicio.
6. **`TraceTree` → OTel GenAI:** mapear spans a atributos `gen_ai.*` + soportar `traceId` cross-agent. Aditivo sobre el TraceTree existente.

---

## Estrategia de test & verificación (gate por unidad)

- **TDD:** cada unidad arranca con su `*.test.tsx` fallando (Testing Library + `jest-axe`).
- **Gate verde para mergear:** `pnpm --filter @studio/ui test` (toda la suite) + `pnpm --filter @studio/ui build` (tsup) + `turbo build --filter=@studio/docs` (Storybook static) + axe 0 violaciones en las nuevas stories. Si algo falla → `BLOCKED` en el log, skip.
- **Story obligatoria** por componente bajo su categoría (`DataTable/…`, `Agentic/Orchestration/…`, `Compliance/…`, `Commercial/…`, `Industrial/…`).

## Estado del loop & logging

- Reusar el patrón existente: append por unidad a `AGENTIC_EXPERIMENTS_LOG.md` (fecha, unidad, tipo, storybook, verificación, resultado ✅/BLOCKED, notas para revisión humana).
- Commit por unidad, convención Conventional Commits (`feat(data-table): add DataTable`, `feat(compliance): add EvidenceExportDialog`, `refactor(agentic): mount AuditLogTable on DataTable`, `fix(scripts): relative path in a11y-audit`).
- Orden de construcción = orden de este doc (rung 1 → 6). Rung 1 debe estar mergeado antes de rung 6.1.
- Resumen final: tabla de unidades ✅/BLOCKED + link a cada commit.
