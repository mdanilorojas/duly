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
