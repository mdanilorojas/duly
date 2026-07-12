# Agent Gallery por industria — diseño

## Contexto

`@duly/ui` tiene una galería plana de 10 "Neural Cores" (`NEURAL_AGENTS` en
`neural-agents.ts`, consumida por `AgentGallery`/`agent-gallery.stories.tsx`)
sin ninguna clasificación. El usuario aportó un HTML de referencia
(`galer_a_de_agentes_ia (1).html`, descargado en `Downloads`) que evoluciona
el concepto: 24 agentes agrupados en 4 sectores operativos — Legal
(jurisprudencia/compliance), Petróleo, Software, Industrial — 6 por sector.
10 de los 24 son los shaders actuales redistribuidos (algunos renombrados
para encajar en su nuevo sector); 14 son completamente nuevos.

Pedido explícito del usuario: agregar los agentes nuevos y poder verlos
agrupados por industria "no todos en el mismo saco" — con páginas (stories
de Storybook) separadas por sector, no una vista plana única. Decisiones
tomadas durante brainstorming (todas confirmadas por el usuario):

1. Se porta al paquete `@duly/ui` (no queda como HTML suelto) — mismo patrón
   ya establecido para Neural Cores y Real Estate (`real-estate-agents.ts`,
   portado desde `predios-quito-arquitectura.html`).
2. El techo real de ~16 contextos WebGL simultáneos del navegador se arregla
   como parte de este trabajo (canvas maestro compartido), aunque con
   6 agentes por story-página el techo no se toque hoy — es una mejora de
   robustez al primitivo compartido, no solo para este caso de uso.
3. Taxonomía: exactamente los 4 sectores del HTML de referencia. Sin
   categorías top-level adicionales.
4. Real Estate / Property Intelligence Console: **no se toca**, sigue
   siendo su propia consola separada — no entra como 5to sector.
5. El set plano de 10 sin sector se retira como default de `AgentGallery`
   (la galería pasa a ser siempre por sector) — pero el dato crudo
   (`NEURAL_AGENTS`) no se borra, porque otros archivos lo consumen por
   índice para demos ajenas a esta feature.

## Fuera de alcance (explícito)

- Vista combinada "todos los sectores en una sola página" — no fue pedida;
  el modelo confirmado es una story por sector. Se puede agregar después
  sin romper nada de este diseño (los datos ya están separados por archivo).
- Badge de sector visible en cada tarjeta — solo tendría sentido en una
  vista combinada, que no existe todavía.
- Un archivo de metadata de sector (`agent-sectors.ts` con tono/color por
  sector) — nada lo consume todavía (ver punto anterior). Se agrega cuando
  haga falta un uso real, no antes (YAGNI).
- Paleta categórica nueva en `@duly/tokens` — el NORTH_STAR ya señala esto
  como gap (`Data-viz tokens ❌`) pero es un proyecto propio, no parte de
  esto. Los colores de sector (si se necesitaran) seguirían el mismo
  precedente ya usado para `glow`: literales de identidad con
  `eslint-disable no-restricted-syntax`, no tokens semánticos.

## 1. Datos — 4 archivos nuevos

`packages/ui/src/agentic/{legal,petroleum,software,industrial}-agents.ts`.
Mismo patrón que `real-estate-agents.ts`: cada uno exporta un
`NeuralAgent[]` de 6 elementos, reusando el tipo `NeuralAgent` ya definido en
`neural-agents.ts` (`id`, `name`, `role`, `glow`, `glsl`). Mismo comentario de
cabecera y el mismo `eslint-disable no-restricted-syntax` que ya llevan
`neural-agents.ts`/`real-estate-agents.ts` para los `glow` literales.

Contenido exacto (portado del HTML de referencia, sin traducir — `role` es
contenido de instancia, no copy de sistema, igual que en
`real-estate-agents.ts`):

**`legal-agents.ts`** — 6 nuevos, ninguno reusado:
`LX-11 Lex Validator`, `DS-12 Docu-Specter`, `AC-13 Aegis Compliance`,
`VR-14 Veritas Core`, `CA-15 Chrono-Audit`, `EQ-16 Equitas Node`.

**`petroleum-agents.ts`** — 3 reusados (renombrados) + 3 nuevos:
`IG-02 Ignis Prime` (rol actualizado a control termodinámico de pozos),
`VD-05` renombrado `Abyssal Extract` (antes "Void Walker"),
`EC-10` renombrado `Seismic Resonator` (antes "Echo Vanguard"),
más nuevos `LS-17 Litho-Scanner`, `FC-18 Flow Catalyst`, `FS-19 Flare Sentinel`.

**`software-agents.ts`** — 4 reusados (mismo nombre, rol actualizado) + 2 nuevos:
`AE-01 Aura Orchestrator`, `NX-03 Nexus Node`, `CP-04 Cipher Sentinel`,
`AX-09 Anomaly X`, más nuevos `QM-20 Quantum Mesh`, `HW-21 Hash Weaver`.

**`industrial-agents.ts`** — 3 reusados (renombrados) + 3 nuevos:
`SY-06` renombrado `Grid Optimizer` (antes "Synapse Architect"),
`GA-07` renombrado `Bio-Synthesizer` (antes "Gaia Catalyst"),
`TH-08` renombrado `Logistics Weaver` (antes "Thread Weaver"),
más nuevos `AT-22 Aero-Turbine`, `TF-23 Thermo-Forge`, `KG-24 Kinetic Gear`.

El shader GLSL (`glsl`/`glow`) de cada agente reusado se copia tal cual del
original en `neural-agents.ts` — no se re-diseña, solo se re-etiqueta
nombre/rol donde el HTML de referencia lo hizo.

## 2. Storybook — story por sector

En `agent-gallery.stories.tsx`:
- Se **elimina** el story `NeuralCores` (vista plana sin sector).
- Se agregan 4 stories nuevas, cada una `<AgentGallery agents={...}
  title="..." subtitle="6 WebGL Shaders" />`:
  - `LegalCompliance` → título "Legal & Compliance"
  - `PetroleumEnergy` → título "Petróleo & Energía"
  - `SoftwareNetworks` → título "Software & Redes"
  - `Industrial` → título "Industrial & Logística"
- `meta.title` sube de `"Agentic/Agent Gallery/V001 Neural Cores"` a
  `"Agentic/Agent Gallery/V002 By Industry"` (mismo versionado ya usado en
  el repo para revisiones que reemplazan, no solo suman, al V001 anterior).
- `SingleCard` (demuestra `AgentCard` suelta) se mantiene sin cambios de
  comportamiento, solo se mueve bajo el nuevo `meta.title`.

## 3. `agent-core.tsx` — contexto WebGL compartido

**Problema real:** hoy cada `AgentCore` monta su propio `<canvas>` +
`gl.getContext("webgl")` independiente. El navegador tiene un techo típico
de ~16 contextos WebGL vivos simultáneos; pasado ese número, `getContext`
devuelve `null` y el core cae al fallback estático (glow radial sin
animación) — no rompe, pero pierde la identidad visual. Con 6 agentes por
story-página esto no ocurre hoy, pero es un límite real del primitivo
compartido que cualquier consumidor futuro (una vista combinada, una
consola con más agentes) puede golpear.

**Solución** (validada visualmente por el HTML de referencia, mismo patrón,
no inventado): un **singleton a nivel de módulo** — no un Context de
React, para no exigirle a ningún consumidor envolver su árbol en un
provider nuevo (`AgentCore` sigue siendo drop-in, cero props nuevas
requeridas).

- Un único WebGL context "maestro" (canvas offscreen, nunca en el DOM) se
  crea de forma perezosa la primera vez que monta un `AgentCore`.
- Cada instancia de `AgentCore` sigue montando su propio `<canvas>` visible
  en el DOM, pero como **contexto 2D** (`getContext("2d")`), no WebGL.
- Cada instancia compila su PROPIO shader program (vertex compartido,
  fragment propio del agente) contra el contexto maestro, y se registra en
  una cola de render compartida (`{ program, locs, state, target2dCanvas
  }`).
- Un único loop `requestAnimationFrame` (vive en el módulo, no por
  instancia) recorre la cola cada frame: para cada entrada, dibuja en el
  canvas maestro (`gl.clear` + `drawArrays`) y proyecta el resultado al
  canvas 2D local de esa instancia vía `ctx2d.drawImage(masterCanvas, 0,
  0)`.
- El pausado por `IntersectionObserver` ya agregado hoy (Workstream 4 de la
  auditoría) se preserva: una instancia fuera de viewport se salta en el
  loop compartido (ni dibuja en el maestro ni proyecta), igual que hoy
  se saltaba su propio `requestAnimationFrame`.
- Fallbacks existentes sin cambios: `prefers-reduced-motion` (un solo frame
  estático) y sin-soporte-WebGL (glow radial vía CSS) — si el contexto
  maestro falla al crearse, **todas** las instancias caen al mismo fallback
  que hoy cae una instancia individual sin WebGL. Mismo comportamiento,
  ahora compartido.
- API pública sin cambios: `AgentCoreProps { agent, size?, active?,
  className, ...props }` idéntica. Ningún consumidor (`AgentCard`,
  `AgentConsentCard`, stories) se entera del refactor.
- Limpieza al desmontar: cada instancia se des-registra de la cola
  compartida; el contexto maestro se libera solo cuando la cola queda
  vacía (última instancia desmontada), no por cada desmonte individual.

## 4. Qué se retira

- Story `NeuralCores`: eliminada (reemplazada por las 4 de sector).
- `AgentGalleryProps.agents`: pasa de `agents?: NeuralAgent[]` con default
  `NEURAL_AGENTS` a **`agents: NeuralAgent[]`** requerida — mismo patrón
  aplicado hoy a `ExecutionHistoryConsoleProps` (Workstream 3). La galería
  ya no tiene modo "genérico sin sector"; todo consumidor debe pasar un
  roster explícito.
- `NEURAL_AGENTS` (el array en `neural-agents.ts`): **no se borra**. Sigue
  exportado y consumido por índice en `agent-consent-card.stories.tsx`
  (`NEURAL_AGENTS[1]`, `[5]`, `[6]`, `[7]`) para prestar shaders a otros
  agentes demo ajenos a esta feature (Treasury Ops, Clinical Documentation,
  Marketing Outreach, Field Inspection). Tocar el orden o el contenido de
  ese array rompería esos índices — no se reordena ni se elimina ninguna
  entrada.
- Real Estate / `real-estate-agents.ts` / `PropertyIntelligenceConsole`:
  sin cambios.

## 5. Verificación

- Pipeline completo (`pnpm turbo run tokens build lint test --force`) en
  verde, igual que cada workstream de hoy.
- `agent-core.test.tsx` (no existe hoy — se crea): cubre que múltiples
  instancias montadas simultáneamente comparten un solo contexto maestro
  (no N contextos), que desmontar una instancia no rompe las demás, y que
  el fallback sin-WebGL/reduced-motion sigue funcionando igual que antes
  del refactor. jsdom no implementa WebGL real (`getContext("webgl")`
  devuelve `null`), así que el camino que se puede testear directamente en
  este entorno es el fallback estático — igual que hoy, `agent-core.tsx`
  ya depende de ese no-op de jsdom para sus tests indirectos (vía
  `agent-gallery`/`agent-consent-card` si los hubiera). El camino WebGL
  real (contexto compartido, blit por instancia) se verifica manualmente
  en Storybook (`pnpm --filter @duly/docs storybook`), confirmando que las
  4 stories nuevas rendericen shaders animados, no glows estáticos.
- Revisar visualmente en Storybook las 4 stories nuevas antes de cerrar el
  trabajo (no hubo browser tooling disponible en la sesión de auditoría de
  hoy — este es el primer punto real donde una pasada visual importa).
