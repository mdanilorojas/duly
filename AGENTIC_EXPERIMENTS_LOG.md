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

---

## Iteración 5 — V001 Approval Gate + Human Interrupt Queue (HITL)

- **Fecha:** 2026-07-02T05:15:19Z
- **Versión:** `ApprovalGateCardV001` + `HumanInterruptQueueV001`
- **Tipo:** primitive + composition (agent ops UI, agnóstico de industria)
- **Industria:** ninguna en particular — primitive de infraestructura, ítem #1 de la
  "Prioridad de construcción" del NORTH_STAR (2026-07-02): 5 fuentes independientes
  convergieron en el patrón approval/HITL con evidencia esta semana (ver `VANGUARD_REPORT.md`).
- **Storybook:** `Agentic/Approval Gate/V001 Evidence Pack` (stories: `CriticalPending`,
  `ResolutionStates`, `MobileWidth`) y `Agentic/Human Interrupt Queue/V001 Risk-Ordered Inbox`
  (stories: `MixedRiskQueue`, `MobileWidth`, `EmptyQueue`).
- **Inspiración investigada:** guía formal de OpenAI "Guardrails and human review" (patrón
  `interruptions`/`RunState` para pausar-y-aprobar), Microsoft AG-UI (Human-in-the-Loop como una
  de sus 7 features core, GA con Agent Framework 1.0), Codex Remote (aprobación de acciones de
  agente desde el móvil — motivó el requisito mobile-first), patrón fintech "Know Your Agent"
  (perfil + consentimiento explícito por transacción antes de ejecutar), patrón software de "cola
  de aprobación con contexto enriquecido" (confidence/razonamiento + señalización binaria de
  riesgo, no porcentajes). Las 5 fuentes ya estaban documentadas en el NORTH_STAR por el routine
  de vanguardia; esta iteración las tradujo a componentes propios sin copiar ningún layout
  específico de ningún vendor.
- **Razón de producto:** cierra el gap #1 priorizado por `NORTH_STAR.md`/`VANGUARD_REPORT.md` —
  el principio de credibilidad enterprise #3 ("un botón Approve nunca va desnudo: lleva
  evidencia") no tenía ningún componente que lo implementara. `ApprovalGateCard` es el "gate" de
  una sola solicitud (evidencia completa + 3 acciones de igual peso visual); `HumanInterruptQueue`
  es el inbox que un operador o auditor revisa cuando hay varias solicitudes en paralelo,
  ordenadas por riesgo y luego por edad — no por orden de llegada, que es como fallan la mayoría
  de colas de aprobación ingenuas cuando hay una crítica antigua compitiendo con una trivial
  reciente.
- **Componentes creados:**
  - `packages/ui/src/agentic/approval-gate-card.tsx`:
    - `<ApprovalGateCard>` — tarjeta de evidencia (What/Why/Blast radius/Rollback como grid de 4
      campos con icono) + badge de riesgo (reutiliza los 5 tonos del sistema) + chip de
      countdown (`expiresIn`) cuando está pendiente. 3 acciones (`Approve`/`Reject`/`Escalate`)
      de igual peso visual, no una "fácil" y dos secundarias — usa `bg-ok`/`text-on-ok`,
      `border-block`/`text-block`, `border-warn`/`text-warn` en vez de tratar Approve como el
      único botón "primario" tipo `default`. 5 estados (`pending`/`approved`/`rejected`/
      `escalated`/`expired`) — `expired` no desaparece, se resuelve visualmente como "sin
      revisor" (tono `block`), evitando que un timeout no atendido quede invisible.
    - `approvalStatusConfig` + `toneChip` — exportados para reuso en `HumanInterruptQueue` (evita
      duplicar el mapeo de tono/ícono/label por estado).
  - `packages/ui/src/agentic/human-interrupt-queue.tsx`:
    - `<HumanInterruptQueue>` — inbox de solicitudes, cada fila es un `Collapsible.Trigger` de
      una sola línea (dot de riesgo + acción truncada + agente + edad + chip de estado o
      countdown) que expande a un `<ApprovalGateCard>` completo. Orden interno: peso de tono de
      riesgo (`block`>`warn`>`review`>`info`>`ok`) y luego `ageMinutes` descendente — el criterio
      "riesgo primero, edad después" que pide el ítem del catálogo, no orden de llegada.
      Mobile-first: la fila es de ancho completo con `flex-wrap` en pantallas angostas (sin
      depender de hover ni de una tabla ancha), sin JS de temporizador (`ageMinutes` es un dato
      del caller, no `Date.now()`, para que el ordenamiento sea determinístico en Storybook/SSR).
  - `packages/ui/src/agentic/approval-gate-card.stories.tsx` — 3 stories: una solicitud crítica
    pendiente (evidence pack completo), 4 tarjetas mostrando los 4 estados de resolución
    (approved/rejected/escalated/expired) con distintos niveles de riesgo, y una vista a 375px de
    ancho para verificar mobile-first.
  - `packages/ui/src/agentic/human-interrupt-queue.stories.tsx` — 3 stories: cola mixta de 7
    solicitudes (2 críticas con distinta edad, 2 altas, 1 media expirada, 2 ya resueltas) con
    nota explicando el criterio de orden, vista a 375px, y cola vacía.
  - `packages/ui/src/agentic/index.ts` — barrel actualizado con los 2 módulos nuevos.
  - Reutiliza `Tone` de `../trace-log/trace-log.variants.js` (mismos 5 tonos), `Button` de
    `../components/ui/button.js` (variant `outline` + overrides de color por acción), y el
    patrón `Collapsible.Root/Trigger/Content` ya establecido en `TraceLog.Detail`/`RunStep`.
- **Comandos ejecutados:** `git checkout main` + `git pull origin main` (el contenedor arrancó
  con `HEAD` detached, 14 commits detrás del remoto real — sincronizado sin perder nada, todos
  los commits ya estaban en `origin/main`) · `pnpm install` (faltaba `node_modules`) ·
  `pnpm --filter @studio/ui test` (26 passed, sin cambios — no se tocaron tests existentes) ·
  `pnpm exec turbo run build --filter=@studio/ui...` (OK) · `pnpm --filter @studio/ui exec eslint
  src/agentic/approval-gate-card.tsx src/agentic/human-interrupt-queue.tsx
  src/agentic/approval-gate-card.stories.tsx src/agentic/human-interrupt-queue.stories.tsx
  src/agentic/index.ts` (0 errores) · `pnpm exec turbo run build --filter=@studio/docs...`
  (Storybook static build OK, incluye ambos `.stories`).
- **Resultado:** ✅ mergeado a main. `NORTH_STAR.md` actualizado: `ApprovalGateCard` y
  `HumanInterruptQueue` pasan de ❌ a ✅ (sección B), reordenada la "Prioridad de construcción"
  con `AuditLogTable`/`WhoDidWhatTimeline` como nuevo #1 (única área en 0% absoluto).
- **Notas para revisión humana:**
  - `HumanInterruptQueue` reutiliza `ApprovalGateCard` completo dentro de cada fila expandida en
    vez de reimplementar una vista resumida — significa que la evidencia completa siempre está a
    un tap de distancia, nunca hay una versión "recortada" de la evidencia en la cola.
  - El campo `ageMinutes` es deliberadamente numérico y separado de `requestedAt` (string libre
    para mostrar) para que el ordenamiento no dependa de parsear texto como "2m ago" — si una
    futura versión conecta datos reales, `ageMinutes` se deriva una vez en el borde (server/hook),
    no en cada render.
  - Riesgo de accesibilidad menor: la fila de la cola comunica riesgo/estado también por texto
    `sr-only` antes del título (no solo por el dot de color ni por el chip), pero no se probó con
    lector de pantalla real en este entorno — revisar en una pasada de accesibilidad futura junto
    con el resto del catálogo HITL.
  - `AgentConsentCard` (Know-Your-Agent, patrón fintech) quedó fuera de esta iteración a propósito
    — es un componente distinto (perfil + consentimiento previo a UNA acción, no evidencia de una
    solicitud ya generada) que ahora puede apoyarse en el mismo lenguaje visual de `toneChip`/
    `approvalStatusConfig` de `approval-gate-card.tsx`.
  - Próximas versiones sugeridas: `AuditLogTable` + `WhoDidWhatTimeline` (nuevo #1 del NORTH_STAR,
    único área del catálogo en 0% absoluto); `AgentConsentCard`; conectar `HumanInterruptQueue`
    como panel dentro de una futura `ComplianceAgentConsole` o `MissionControlPanel`; segunda
    industria (petróleo & energía) con una consola de operaciones.

---

## Iteración 6 — V001 Audit Log Table + Who Did What Timeline (Auditoría/Compliance)

- **Fecha:** 2026-07-02T10:14:17Z
- **Versión:** `AuditLogTableV001` + `WhoDidWhatTimelineV001`
- **Tipo:** primitive + composition (auditoría/compliance UI, agnóstico de industria)
- **Industria:** ninguna en particular — primitive de infraestructura, prioridad #1 del NORTH_STAR
  (2026-07-02): área C (auditoría/compliance) era la única de las 4 del catálogo en 0% absoluto,
  sosteniendo 3 de los 10 principios de credibilidad enterprise (#3, #4, #10).
- **Storybook:** `Agentic/Audit Log Table/V001 Immutable Stream` (stories: `ComplianceAuditTrail`,
  `ScrollableDense`, `EmptyLog`) y `Agentic/Who Did What Timeline/V001 Auditor Self-Service`
  (stories: `AuditorSelfService`, `MobileWidth`, `EmptyTimeline`).
- **Inspiración investigada:** el propio catálogo NORTH_STAR ya especificaba el propósito exacto
  de ambos componentes (`AuditLogTable`: "stream inmutable: actor/acción/recurso/hash badge";
  `WhoDidWhatTimeline`: "feed cronológico filtrable con saved-query chips") a partir de EU AI Act
  Art. 12/13, SOC2 CC7/CC8 e ISO 42001/prEN 18286 — no se reinventó el alcance. Se tradujo el
  principio #5 ("dualidad de actor: humano vs agente vs sistema, distinguible de un vistazo") a
  icono + anillo de color por tipo de actor (no solo texto), y el principio #10 ("saved queries
  como feature de compliance") a chips de un solo toque con conteo en vivo — patrón visto en
  filtros de auditoría enterprise (Datadog/Retool-style saved views), sin copiar ningún layout
  específico de vendor.
- **Razón de producto:** cierra el gap #1 priorizado por `NORTH_STAR.md`/`VANGUARD_REPORT.md` —
  los principios #4 ("la inmutabilidad se ve") y #10 ("saved queries como feature de compliance")
  no tenían ningún componente. `AuditLogTable` es la vista densa tipo hoja de cálculo para un
  auditor que necesita escanear muchas filas; `WhoDidWhatTimeline` es la vista narrativa
  cronológica con autoservicio de filtro — ambas comparten el mismo tipo `AuditEvent` y el mismo
  vocabulario visual de actor/tono/hash para que una futura `ComplianceAgentConsole` pueda
  combinarlas sin reconciliar dos modelos de datos distintos.
- **Componentes creados:**
  - `packages/ui/src/agentic/audit-log-table.tsx`:
    - Tipo `AuditEvent` (actorKind, actor, action, resource, outcome, timestamp, hash) — modelo
      de datos compartido por ambos componentes de esta iteración.
    - `actorKindConfig` — mapeo icono+anillo de color por `human`/`agent`/`system` (dualidad de
      actor, principio #5), exportado para reuso.
    - `outcomeLabel` — labels de los 5 tonos del sistema aplicados a un "outcome" de auditoría.
    - `<HashBadge>` — chip mono con hash truncado + `title` con el hash completo, señal visual de
      inmutabilidad (principio #4); exportado para reuso en `WhoDidWhatTimeline`.
    - `<AuditLogTable>` — tabla semántica (`<table>`, no virtualizada — ver "DataTable denso" en
      NORTH_STAR como ítem separado) con columnas Actor/Action/Resource/Outcome/Timestamp/Hash,
      header sticky, `maxHeight` opcional con scroll interno.
  - `packages/ui/src/agentic/who-did-what-timeline.tsx`:
    - Tipo `SavedQuery` (id, label, predicate) y `AuditEventGroup` (label de grupo cronológico +
      eventos) — el agrupamiento por fecha lo decide el caller (mismo criterio determinístico que
      `ageMinutes` en `HumanInterruptQueue`: sin `Date.now()` dentro del componente).
    - `<WhoDidWhatTimeline>` — feed vertical agrupado por rango de tiempo con línea conectora,
      icono dual de actor por evento, y una fila de chips de "saved query" (toggle de un toque,
      con conteo recalculado sobre el total de eventos, no solo lo visible) sobre el header.
  - `packages/ui/src/agentic/audit-log-table.stories.tsx` — 3 stories: trail de compliance con 10
    eventos mixtos (humano/agente/sistema, 5 tonos), variante con `maxHeight` + scroll, log vacío.
  - `packages/ui/src/agentic/who-did-what-timeline.stories.tsx` — 3 stories: feed de 3 grupos
    cronológicos (Today/Yesterday/Last week) con 4 saved queries interactivas, vista a 375px, feed
    vacío.
  - `packages/ui/src/agentic/index.ts` — barrel actualizado con los 2 módulos nuevos.
  - Reutiliza `Tone`/`toneChip` (de `trace-log.variants.ts` vía `approval-gate-card.tsx`, mismos 5
    tonos del sistema, sin color crudo) y los tokens `accent`/`accent-surface`/`accent-border` ya
    existentes para el estado activo de los chips de saved query.
- **Comandos ejecutados:** `git checkout main` + `git pull origin main` (el contenedor arrancó con
  `HEAD` detached, 15 commits detrás del remoto real — sincronizado sin perder nada) ·
  `pnpm install` (faltaba `node_modules`) · `pnpm --filter @studio/ui test` (26 passed, sin
  cambios) · `pnpm exec turbo run build --filter=@studio/ui...` (OK) · `pnpm --filter @studio/ui
  exec eslint src/agentic/audit-log-table.tsx src/agentic/audit-log-table.stories.tsx
  src/agentic/who-did-what-timeline.tsx src/agentic/who-did-what-timeline.stories.tsx
  src/agentic/index.ts` (0 errores) · `pnpm exec turbo run build --filter=@studio/docs...`
  (Storybook static build OK, incluye ambos `.stories`, chunks nuevos `audit-log-table-*.js` y
  `who-did-what-timeline.stories-*.js` visibles en el output).
- **Resultado:** ✅ mergeado a main. `NORTH_STAR.md` actualizado: `AuditLogTable` y
  `WhoDidWhatTimeline` pasan de ❌ a ✅ (sección C, primera cobertura no nula del área) y
  reordenada la "Prioridad de construcción" con `TraceTree`/`TokenCostMeter` como nuevo #1.
- **Notas para revisión humana:**
  - `AuditLogTable` no es virtualizada — para el catálogo de tamaño de esta iteración (decenas de
    filas por consola) es suficiente; si una futura consola necesita cientos/miles de filas,
    conviene resolverlo junto con el ítem "DataTable denso" del NORTH_STAR (virtualización +
    roving tabindex) en vez de improvisarlo aquí.
  - `HashBadge` es solo visual (sin copiar al portapapeles) — no había precedente de `clipboard`
    API en el repo; se dejó como chip con `title` del hash completo. Si una futura iteración
    quiere un botón de copiar real, es una extensión aislada del mismo componente.
  - Los chips de "saved query" en `WhoDidWhatTimeline` son single-select con toggle (tocar de
    nuevo el mismo chip activo vuelve a "All activity") — más simple que multi-select para esta
    primera versión; si el catálogo pide combinar filtros (ej. "AI actions" + "blocked") en una
    futura iteración, es un cambio de `activeQueryId: string | null` a un `Set<string>`.
  - No se probó `WhoDidWhatTimeline` con lector de pantalla real — los chips usan `aria-pressed`
    y el actor lleva un `sr-only` con el tipo de actor antes del nombre, pero queda pendiente una
    pasada de accesibilidad con AT real junto con el resto del catálogo HITL/auditoría (misma nota
    dejada en la iteración 5).
  - Próximas versiones sugeridas: `TraceTree` con costo por span + `TokenCostMeter` (nuevo #1 del
    NORTH_STAR); `EvidenceExportDialog`/`ApprovalChainStepper` (pueden reutilizar el vocabulario
    visual de actor/tono/hash de esta iteración); `ComplianceAgentConsole` que combine
    `AuditLogTable` + `WhoDidWhatTimeline` + `HumanInterruptQueue` en una sola consola por
    industria (financiera es la candidata más natural); segunda industria (petróleo & energía).
