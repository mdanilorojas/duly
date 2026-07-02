# Agentic Experiments Log

Registro versionado del laboratorio agentic de `studio-ds`. Cada iteración agrega
UNA versión visible en Storybook bajo la categoría `Agentic/`. No se reemplazan ni
borran versiones anteriores — se acumulan para revisión.

Ver estado del loop en `AGENTIC_LOOP_STATE.json` (max 48 iteraciones ≈ 2 días).

---

## Iteración 1 — V001 Neural Cores

- **Fecha:** 2026-07-01T20:34:27Z
- **Versión:** `AgentGalleryV001` (Neural Cores)
- **Tipo:** composition + primitives (WebGL)
- **Storybook:** `Agentic/Agent Gallery/V001 Neural Cores` (stories: `NeuralCores`, `SingleCard`)
- **Inspiración:** referencia interna `galer_a_de_agentes_ia.html` (10 shader cores WebGL, FBM + SDF).
- **Razón de producto:** primer bloque de UI de agentes IA — galería de "cores" con
  identidad visual por agente (ID, nombre, rol, glow). Base para dashboards de
  orquestación y consolas de agentes.
- **Componentes creados:**
  - `packages/ui/src/agentic/neural-agents.ts` — data de 10 agentes + builder de shaders.
  - `packages/ui/src/agentic/agent-core.tsx` — `<AgentCore>` canvas WebGL (easing de hover,
    degrada a glow estático sin WebGL, respeta `prefers-reduced-motion`).
  - `packages/ui/src/agentic/agent-card.tsx` — `<AgentCard>` tarjeta glass.
  - `packages/ui/src/agentic/agent-gallery.tsx` — `<AgentGallery>` grid.
  - `packages/ui/src/agentic/index.ts` — barrel (re-exportado en `packages/ui/src/index.ts`).
- **Verificación:** `pnpm test` (22 passed) · `pnpm build` (tsup OK) · `turbo build --filter=@studio/docs` (storybook static OK) · `eslint src/agentic` (0 errores).
- **Resultado:** ✅ mergeado a main.
- **Notas para revisión humana:**
  - Los cores usan un `<canvas>` WebGL por agente (10 contextos). Riesgo de performance
    con muchas instancias simultáneas; hoy los 10 corren a la vez en la story. Si se abusa,
    considerar pausar cores fuera de viewport (IntersectionObserver) en una V-futura.
  - Colores de `glow` son identidad por agente (no tokens del tema) — excepción de lint documentada.
  - Próximas versiones sugeridas: alinear agentes a industrias (inmobiliaria, petróleo,
    software, finanzas, salud); AgentCard variantes; OrchestrationDashboard V001.

---

## Iteración 2 — V001 Property Intelligence Console (Inmobiliaria)

- **Fecha:** 2026-07-01T21:16:19Z
- **Versión:** `PropertyIntelligenceConsoleV001` + primitives `AgentMetric`, `AgentStatusMatrix`
- **Tipo:** composition + primitives + data (primera versión alineada a industria)
- **Industria:** Inmobiliaria (predios / catastro)
- **Storybook:** `Agentic/Property Intelligence/V001 Real Estate Console` (stories: `FullConsole`,
  `Agent roster only`, `AgentMetric row`, `AgentStatusMatrix`)
- **Inspiración:** referencia interna de solo lectura `predios-quito-arquitectura.html`
  (arquitectura de "Predios Quito" — visor de un solo HTML que consulta en vivo el servidor
  catastral ArcGIS de Quito). Se tradujeron sus patrones visuales (grid de métricas, pipeline
  de request→respuesta, matriz de estatus con color por código) a componentes React
  reutilizables — el HTML no fue modificado. También se reutilizó `TraceLog` (ya existente en
  `packages/ui/src/trace-log/`, con tonos info/ok/review/warn/block) en vez de reinventar un log
  de pipeline nuevo.
- **Razón de producto:** primera composición de negocio real (no genérica) del laboratorio —
  un "Property Intelligence Console" que orquesta agentes de inteligencia catastral (parse →
  query → geo bridge → color → render → revisión humana) sobre métricas operacionales y una
  matriz de estatus legal de predios. Sienta el patrón para futuras consolas por industria
  (petróleo, finanzas, salud, software) reutilizando `AgentGallery` + `TraceLog` + nuevas
  primitives `AgentMetric`/`AgentStatusMatrix`.
- **Componentes creados:**
  - `packages/ui/src/agentic/real-estate-agents.ts` — roster `REAL_ESTATE_AGENTS` (6 agentes:
    Cadastral Parser, Query Broker, GeoBridge, Status Colorizer, Map Renderer, Compliance
    Reviewer), reutilizando el mismo `AgentCore` WebGL (`buildFragmentShader`/`SHADER_PREAMBLE`)
    de V001 — solo cambia la data e identidad visual (glow + GLSL por agente).
  - `packages/ui/src/agentic/agent-metric.tsx` — `<AgentMetric>` + `<AgentMetricRow>`, tile de
    métrica compacta con tono semántico opcional (ok/warn/review/block/info).
  - `packages/ui/src/agentic/agent-status-matrix.tsx` — `<AgentStatusMatrix>`, grid de estatus
    (código + label + swatch) mapeado a los 5 tonos del sistema (`Tone` de `TraceLog`) — sin
    color crudo.
  - `packages/ui/src/agentic/property-intelligence-console.tsx` — `<PropertyIntelligenceConsole>`,
    composición que combina `AgentGallery`, `AgentMetricRow`, `TraceLog` y `AgentStatusMatrix`.
  - `packages/ui/src/agentic/property-intelligence-console.stories.tsx` — 4 stories.
  - `packages/ui/src/agentic/real-estate-agents.test.ts` — tests de data (ids únicos, shaders
    válidos).
  - `packages/ui/src/agentic/index.ts` — barrel actualizado con los 4 módulos nuevos.
- **Comandos ejecutados:** `pnpm install` · `pnpm --filter @studio/ui test` (26 passed) ·
  `pnpm exec turbo run build --filter=@studio/ui...` (OK) · `pnpm --filter @studio/ui lint`
  (13 errores preexistentes en `src/stories/*.stories.tsx`, no relacionados — verificado con
  `git stash` que ya fallaban en `main` antes de este cambio; lint dirigido a los archivos
  nuevos: 0 errores) · `pnpm exec turbo run build --filter=@studio/docs...` (Storybook static
  build OK, incluye `property-intelligence-console.stories`).
- **Resultado:** ✅ mergeado a main.
- **Notas para revisión humana:**
  - El lint global de `@studio/ui` sigue roto por 13 `no-unused-vars` en stories preexistentes
    de `src/stories/` (imports `Meta` sin usar) — no introducido por esta iteración; candidato
    a limpieza rápida en una futura iteración de mantenimiento (no se tocó para mantener el
    diff acotado a la mejora de esta iteración).
  - `AgentStatusMatrix` mapea 6 estatus de negocio (predios) a solo 5 tonos del sistema —
    "Juicio de consignación" y "Nudos críticos / hereditarios" comparten tono `block`. Si una
    futura industria necesita más granularidad, evaluar agregar un tono extra al sistema en vez
    de forzarlo con color crudo.
  - Próximas versiones sugeridas: `AgentHealth`/`AgentRisk`/`AgentConfidence` primitives;
    `ExecutionTimeline`/`WorkflowCanvas` para orquestación multi-agente; segunda industria
    (petróleo & energía) reutilizando el mismo patrón de consola.

---

## Iteración 3 — V001 Execution Timeline (Orchestration UI)

- **Fecha:** 2026-07-02T00:12:03Z
- **Versión:** `ExecutionTimelineV001` + primitives `RunStep`, `ToolCallCard`
- **Tipo:** primitives + composition (orchestration UI, agnóstico de industria)
- **Industria:** ninguna en particular — primitive de infraestructura reutilizable por las 5
  industrias (cualquier consola de negocio necesita mostrar el detalle de un run multi-agente).
- **Storybook:** `Agentic/Execution Timeline/V001 Agent Run Trace` (stories:
  `DocumentIntelligenceRun`, `ToolCallDetailOnly`)
- **Inspiración investigada:** LangSmith (trace tree de un run), Temporal UI (timeline vertical
  de un workflow con pasos conectados), Anthropic Console (tool call cards con input/output),
  GitHub Actions (steps conectados por línea vertical con iconos de estado). Se tradujo el
  patrón común — "línea vertical + nodo por paso + detalle expandible" — a componentes propios,
  sin copiar ningún layout específico.
- **Razón de producto:** el laboratorio ya tenía `TraceLog` (log lineal denso, bueno para un
  stream de eventos) pero nada que muestre la ejecución de un único run multi-agente como
  secuencia espacial "un paso a la vez" con tipos de paso distintos (tool call / decisión /
  aprobación humana / evento). Esto es la base para "Agent Run Detail" y "Tool Execution
  Timeline" del brief, y para el detalle de cualquier consola futura por industria (ej. abrir
  un run específico desde `PropertyIntelligenceConsole` o una futura `ComplianceAgentConsole`).
- **Componentes creados:**
  - `packages/ui/src/agentic/execution-timeline.tsx`:
    - `<RunStep>` — nodo del timeline (icono + tono por `kind`: `tool_call`/`decision`/
      `approval`/`event`, conector vertical continuo, agente, timestamp, duración, detalle
      expandible vía `@radix-ui/react-collapsible`, ya usado por `TraceLog.Detail`).
    - `<ToolCallCard>` — tarjeta de detalle de una tool call (nombre, input clave/valor,
      output, latencia), pensada para vivir dentro de un `RunStep` de tipo `tool_call`.
    - `<ExecutionTimeline>` — contenedor con header (título + hint de run id/duración total).
  - `packages/ui/src/agentic/execution-timeline.stories.tsx` — 2 stories: un run completo de
    "document intelligence review" (6 pasos: evento inicial → 2 tool calls → decisión de riesgo
    → aprobación humana pendiente → evento final) y un `ToolCallCard` aislado.
  - `packages/ui/src/agentic/index.ts` — barrel actualizado.
  - Reutiliza `Tone` de `../trace-log/trace-log.variants.js` (mismos 5 tonos del sistema, sin
    color crudo) y el patrón de `Collapsible.Root`/`Trigger`/`Content` ya establecido en
    `TraceLog.Detail`.
- **Comandos ejecutados:** `pnpm install` (lockfile ya resuelto, solo instala node_modules) ·
  `pnpm --filter @studio/ui test` (26 passed) · `pnpm exec turbo run build --filter=@studio/ui...`
  (falló primero por un mismatch de tipos en el `Record` de iconos de lucide-react —
  `"aria-hidden"?: boolean` vs `boolean | "true" | "false"` — corregido para calzar con el mismo
  patrón que `TraceLog`'s `toneIcon`; luego OK) · `pnpm --filter @studio/ui exec eslint
  src/agentic/execution-timeline.tsx src/agentic/execution-timeline.stories.tsx
  src/agentic/index.ts` (0 errores) · `pnpm exec turbo run build --filter=@studio/docs...`
  (Storybook static build OK, incluye `execution-timeline.stories`).
- **Resultado:** ✅ mergeado a main.
- **Notas para revisión humana:**
  - Nota externa: entre la iteración 2 y esta, el usuario aplicó manualmente el commit
    `50ec23e` ("lift dark elevation ladder + visible borders; fix Tabs segmented control") —
    no generado por este loop, pero ya integrado en `main` antes de esta iteración.
  - `ExecutionTimeline` es intencionalmente genérico (no atado a industria) — moverse rápido
    en primitives de infraestructura antes de multiplicar consolas por industria evita
    reconstruir el mismo patrón 5 veces.
  - El icono de `RunStep` toma su color de `text-{tone}` heredado por `currentColor` en el SVG
    de lucide-react — si se cambia el ícono por uno sin `currentColor` habría que revisar.
  - Próximas versiones sugeridas: segunda industria (petróleo & energía) con una consola de
    operaciones reutilizando `AgentGallery` + `ExecutionTimeline`; o `AgentHealth`/`AgentRisk`/
    `AgentConfidence` primitives; o conectar `ExecutionTimeline` como drill-down dentro de
    `PropertyIntelligenceConsole` en una V002.

---

## Iteración 4 — V001 State Grammar (NodeStatusBadge + RunTimeline)

- **Fecha:** 2026-07-02T03:34:16Z
- **Versión:** `NodeStatusBadgeV001` + `RunTimelineV001`
- **Tipo:** primitive + composition (n8n / agent ops UI, agnóstico de industria)
- **Industria:** ninguna en particular — primitive de infraestructura, ítem #1 de la
  "Prioridad de construcción" del NORTH_STAR ("la gramática de estados es la base de todo lo
  demás").
- **Storybook:** `Agentic/Run Timeline/V001 State Grammar` (stories: `LiveWorkflowRun`,
  `RetryAfterFailure`, `StatusGrammarLegend`)
- **Nota de housekeeping:** al iniciar la iteración, `git status` reportó `HEAD` en estado
  detached y la copia local de `origin/main` desactualizada (apuntando 8 commits atrás del
  remoto real). Se corrió `git fetch origin main` + `git checkout main` + `git reset --hard
  origin/main` para sincronizar antes de tocar código — no se perdió ningún commit, los 8
  commits (iteraciones 1-3 + docs NORTH_STAR) ya estaban en el remoto, solo desactualizada la
  referencia local del contenedor.
- **Inspiración investigada:** Temporal UI (estados de step con trazo distinto — dashed
  animado = pending, dashed rojo = retry — es la referencia explícita del principio #1 del
  NORTH_STAR), n8n (executions: nodos success/error/waiting/running en el canvas del workflow,
  conectores que heredan el estado del nodo previo), LangSmith (badges de estado de span). Se
  tradujo el patrón "gramática de estado ≠ solo color" a un componente propio: cada uno de los
  6 estados combina tono semántico + estilo de trazo (sólido/discontinuo/punteado) + animación
  vía `motion-safe:`, sin copiar ningún layout específico de las referencias.
- **Razón de producto:** el NORTH_STAR marca esto como la base de todo lo demás — sin una
  gramática de estado consistente, cualquier `ExecutionHistoryTable`, `RunInspector` o
  `ApprovalGateCard` futuro tendría que inventar su propia codificación de "en curso" vs
  "resuelto" vs "reintentando". Este componente resuelve eso una vez y queda disponible para
  toda consola futura (las 5 industrias comparten el mismo vocabulario visual de ejecución).
- **Componentes creados:**
  - `packages/ui/src/agentic/node-status-badge.tsx`:
    - `<NodeStatusBadge>` — anillo de estado (icono + tono + trazo + animación) para los 6
      estados del catálogo (`success`/`error`/`running`/`waiting`/`retrying`/`skipped`).
      Accesible: `role="status"` + `aria-label` describe el estado en texto (incluye intento
      actual/máximo si aplica), no depende solo de color para daltonismo. Tamaños `sm`/`md`.
    - `nodeStatusConnectorClass()` — helper que expone el trazo de conector correspondiente a
      un estado, reutilizado por `RunTimeline`.
    - `<NodeStatusLegend>` — leyenda de los 6 estados con su descripción de trazo, para
      demostrar en revisión que la gramática es intencional y no solo color.
  - `packages/ui/src/agentic/run-timeline.tsx` — `<RunTimeline>`, stepper horizontal estilo
    n8n/Temporal: un `NodeStatusBadge` por nodo de workflow, conectados por líneas cuyo trazo
    hereda el estado del nodo previo (sólido = resuelto, discontinuo animado = en curso/
    reintentando, punteado = omitido). Complementa a `ExecutionTimeline` (vista vertical
    "un paso a la vez" de un run de agentes) con la vista horizontal "estado del workflow
    completo" típica de listas de ejecuciones n8n/Temporal.
  - `packages/ui/src/agentic/run-timeline.stories.tsx` — 3 stories: un workflow en vivo con
    nodo corriendo + 2 nodos en espera + 1 omitido (rama condicional), un workflow con un nodo
    reintentando tras timeout (con contador de intento), y la leyenda de gramática sola.
  - `packages/ui/src/agentic/index.ts` — barrel actualizado con los 2 módulos nuevos.
  - Reutiliza `cn` de `@/lib/utils` y los 5 tonos semánticos existentes (`ok`/`review`/`warn`/
    `block`/`info`) — el estado `skipped` usa el tono neutral `faint`/`faint-deco` ya existente
    en tokens (no agrega tono nuevo).
- **Comandos ejecutados:** `git fetch origin main` + `git reset --hard origin/main` (housekeeping,
  ver nota arriba) · `pnpm install` (faltaba `node_modules` en el contenedor fresco) ·
  `pnpm --filter @studio/ui test` (26 passed) · `pnpm exec turbo run build --filter=@studio/ui...`
  (OK) · `pnpm --filter @studio/ui exec eslint src/agentic/node-status-badge.tsx
  src/agentic/run-timeline.tsx src/agentic/run-timeline.stories.tsx src/agentic/index.ts` —
  primera corrida falló con 2 falsos positivos de la regla anti-color-crudo: los mocks
  `run #4821`/`run #1092` matchean el regex `#[0-9a-fA-F]{3,8}` por parecer un hex de 4
  dígitos; corregido cambiando el mock a `run 4821`/`run 1092` (sin `#`) — 0 errores tras el
  fix · `pnpm exec turbo run build --filter=@studio/docs...` (Storybook static build OK,
  incluye `run-timeline.stories`).
- **Resultado:** ✅ mergeado a main.
- **Notas para revisión humana:**
  - `NodeStatusBadge` marca ✅ dos filas del catálogo NORTH_STAR de una vez
    (`NodeStatusBadge` en sección A y `RunTimeline` en sección B) porque el brief los agrupa
    como una sola prioridad de construcción — decisión deliberada, no scope creep.
  - El estado `retrying` y `running` comparten el mismo trazo visual (discontinuo + animado)
    pero distinto tono (`block` rojo vs `info`) — esto sigue literalmente la referencia del
    NORTH_STAR ("dashed rojo = retry"). Si una futura revisión quiere diferenciarlos también
    por velocidad de animación o forma de icono, es un ajuste aislado en `node-status-badge.tsx`.
  - La animación usa `motion-safe:animate-spin` / `motion-safe:animate-pulse` de Tailwind, que
    ya respeta `prefers-reduced-motion` a nivel de navegador sin JS adicional — degradación
    verificada por inspección de clase (no hay fallback manual porque Tailwind lo maneja).
  - Riesgo de performance: si `RunTimeline` se usa con muchos nodos "running"/"retrying"
    simultáneos (>20), múltiples `animate-spin` en paralelo son baratos (solo CSS transform)
    pero no se probó a esa escala — no crítico para el uso previsto (listas de un run, no
    listas masivas).
  - Próximas versiones sugeridas: `ExecutionHistoryTable` (prioridad #5 del NORTH_STAR,
    ahora desbloqueada porque puede reusar `NodeStatusBadge` como status dot por fila);
    `ApprovalGateCard` (prioridad #3, evidence pack + approve/reject/escalate); conectar
    `RunTimeline` como header resumen dentro de `ExecutionTimeline` o `PropertyIntelligenceConsole`
    en una V002; segunda industria (petróleo & energía) con una consola de operaciones.
