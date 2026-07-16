# Diseño — Duly Showcase (`apps/showcase`)

**Fecha:** 2026-07-15

## Problema

Storybook muestra cada componente aislado en su propio frame — útil para desarrollo, pero no comunica cómo se ven los componentes compuestos en un caso de uso real. Falta una superficie que muestre Duly DS "en natural": páginas reales por vertical, no cards sueltas.

## Decisión

Nueva app dentro del monorepo, no un repo separado — `@duly/ui` no está publicado a npm (workflow de release sin `NPM_TOKEN`), así que un repo genuinamente independiente no podría instalarlo. `apps/showcase` consume `@duly/ui: workspace:*` exactamente como `apps/docs` (Storybook) ya lo hace.

### Stack

Vite + React + TypeScript, mismo patrón zero-Tailwind que `examples/minimal-vite`: importa `@duly/ui/styles.css` directo, sin config de Tailwind propia, tema vía `data-theme` + variables CSS. Sin dependencias nuevas.

### Estructura — 5 páginas

Navegación simple (sin router pesado — un `<nav>` + estado de página activa alcanza para 5 páginas). Cada página de vertical es una composición realista, no un catálogo de cards:

| Página | Ruta/vista | Compone |
|---|---|---|
| Inicio | `/` | Nav a las 4 verticales + tira visual de Fundamentos/Primitivas (tokens, botones, badges) |
| Agentic | `/agentic` | Panel de operación de agentes: `AgentGallery`, `RunTimeline`, `TraceLog`, `HumanInterruptQueue`, `ApprovalGateCard`, `TokenCostMeter`, `GuardrailIndicator`, `ConnectorStatus` |
| Compliance | `/compliance` | Consola ISO 27001 — adapta la composición ya existente en Storybook (`Recetas/Consola ISO/V001 Consola completa`, `packages/ui/src/stories/recipes/iso-console.stories.tsx`): `BandGauge`, `AgentStatusMatrix` compact, `DeltaList`, `KanbanBoard`, `Dropzone`, `Stepper`, `AppShell` |
| Comercial | `/comercial` | Panel de RevOps: `PipelineWaterfallChart`, `MRRMovementWaterfall`, `ForecastRollupTable`, `RatioGauge`, `PricingApprovalMatrix`, `RelationshipMap` |
| Industrial | `/industrial` | Sala de control OT: `AlarmBanner`, `AlarmSummaryTable`, `AssetHealthGauge`, `AutonomyModeSwitch`, `OEEWaterfall`, `ProcessValueTile` |

Datos sintéticos: escritos frescos dentro de `apps/showcase`, uno por página — el vocabulario de dominio se modela sobre el que ya usan las stories existentes (mismos nombres de engagement, mismas bandas/tonos), pero no se importan sus consts (las stories no los exportan; exportarlos tocaría ~30 archivos de `packages/ui` fuera del alcance de esta app). Duplicación mínima aceptada a cambio de mantener el showcase autocontenido.

### Deploy

Segundo proyecto Vercel ("duly-sc") en el mismo equipo, apuntando a `apps/showcase` como root directory del mismo repo `duly` — sin `/adeploy` (ese skill asume repo nuevo), sin repo GitHub nuevo. Dominio `duly-sc.auraby.design`, agregado directo vía Vercel CLI (mismo mecanismo que ya usa el proyecto `duly` para sus dominios `auraby.design`).

## Fuera de alcance v1

- Cobertura 1:1 de los ~90 componentes — eso ya lo cubre Storybook; el showcase es composición realista por vertical, no catálogo.
- Router con URLs reales / SSR — 5 vistas con estado local alcanza.
- Cambio de tema/locale en vivo (Storybook ya lo tiene vía toolbar) — el showcase fija tema `cockpit` + locale `es` por defecto; se puede agregar toggle después si hace falta.
- Nuevas fixtures de datos — se reusan las de las stories existentes.

## Extensibilidad

Agregar una vertical nueva = agregar una página que compone componentes existentes + un link en el nav. No requiere tocar las otras páginas ni el layout compartido.
