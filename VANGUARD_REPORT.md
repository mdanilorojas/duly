# VANGUARD REPORT — Duly

> Se sobreescribe cada semana. Historial real vive en `git log -- VANGUARD_REPORT.md`.

**Fecha:** 2026-07-20 · **Generado por:** routine cloud "vanguard check" #4

## Resumen ejecutivo

Dos bloqueos de larga data se cerraron esta semana. (1) **Distribución RESUELTA**: los paquetes
ya **están publicados en npm** — `@enregla-ui/duly-ui@0.2.0` y `@enregla-ui/duly-tokens@0.1.0`
(el scope `@duly` no estaba libre, se renombró a `@enregla-ui/duly-*`); Release y CI **en verde**
en HEAD. Era el riesgo #1 arrastrado varias semanas. (2) **Regulatorio RESUELTO**: el EU AI Act
Digital Omnibus fue **firmado el 8-jul-2026** — la incertidumbre "¿se publica antes del 30-jul?"
dejó de existir. El loop de construcción invirtió la semana en distribución + 4 primitivas
(Toast/Combobox/FormField/FlowStepper) + un 4º tema + `apps/showcase`, pero **cero gaps del catálogo
A/B/C se cerraron**: `AgentHandoffMarker`/`CheckpointBadge` cruzan **4 semanas** como prioridad #1.
La cobertura sube fuerte (a 78%/80%) — pero eso refleja el score poniéndose al día con la ola de
build del 07-15, no trabajo de catálogo de esta semana.

## Novedades de la semana (con fuente)

### Interno (lo más importante)

- **npm publish — RESUELTO.** El bloqueador #1 de semanas ("nada en npm", marcado P0-dist por el
  audit impeccable) se cerró: `@enregla-ui/duly-ui` está en el registry con versiones `0.1.0` y
  `0.2.0` (latest `0.2.0`), y `@enregla-ui/duly-tokens@0.1.0`. La causa raíz del fallo previo era
  doble: el scope `@duly` no estaba disponible en npm (rename a `@enregla-ui/duly-*`, `920f0e2`) y
  el filtro de publish del workflow apuntaba al scope viejo (`f786617`). El Release workflow corrió
  **success** en el último run (2026-07-20, sha `d472144`). Verificado contra el registry real, no
  solo contra el estado del workflow.
- **CI/Release en verde en HEAD** (`d472144`, 2026-07-20). Un commit intermedio (`7014f42`) rompió
  CI y Release por `@import` de CSS y entrada de Storybook que el rename dejó apuntando al scope
  viejo (funcionaba local por tolerancia del resolver de tailwind CLI, rompía bajo Vite/lightningcss);
  el fix `d472144` lo corrigió y dejó ambos workflows verdes.
- **4 primitivas nuevas** (todas dependencias table-stakes que faltaban): `Toast`/`Toaster`
  (`583efaa`, con story en Storybook), `Combobox` (`e471ef9`), `FormField`/`useZodForm`
  (`e471ef9`, `packages/ui/src/form/`), `FlowStepper` (wizard multi-paso, `7014f42`). Toast queda
  ✅; las otras 3 en 🟡 (existen + test + demostradas en `apps/showcase`, pero sin story standalone
  en Storybook — mismo criterio con que `ErrorState` quedó en 🟡).
- **4º tema `ganapliego`** (`59b2701`) — tema de producto light-based (clon de `light` en v1). El
  theming white-label sube a 4 temas pero sigue en 🟡: aún falta la guía white-label documentada.
- **`apps/showcase`** (Duly Showcase, `d33bced`→`9744a36`) — primera superficie de demostración
  compuesta por vertical (Agentic/Comercial/Compliance/Industrial/Primitivas), desplegada en Vercel.
  Refuerza directamente el principio "demostrable, no un demo bonito".

Todo esto es infraestructura de "producto consumible" real y necesaria — pero ninguna fila de gap
del catálogo (área A/B/C) se construyó.

### Externo

- **EU AI Act Digital Omnibus — RESUELTO.** Cronología completa: Parlamento 16-jun, Consejo 29-jun,
  **acto final FIRMADO 8-jul-2026**; entra en vigor al 3er día tras publicación en el Diario Oficial
  (ya firmado, publicación inminente). La fecha de aplicación de alto-riesgo **2-ago-2026 queda
  oficialmente diferida**: standalone → **2-dic-2027**, embebido en productos regulados →
  **2-ago-2028**. El watermarking/transparencia de contenido IA sigue en **2-dic-2026** (NO diferido)
  y es ahora la obligación exigible más próxima — ya cubierta por `ModelProvenanceChip` (principio #8).
  Fuentes:
  [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/eu-ai-act-unpacked-34-the-final-digital-omnibus-on-ai-key-amendments-to-the-a-102nber),
  [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/),
  [DLA Piper](https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2026/The-Digital-AI-Omnibus-Proposed-deferral-of-high-risk-AI-obligations-under-the-AI-Act).
- **Patrón nuevo "planning visibility"** — fuentes de UX de agentes 2026 tratan "ver la secuencia de
  acciones intencionada ANTES de ejecutar" como 1 de 5 patrones universales de agente enterprise
  (junto a tool-use disclosure, memory surfacing, workflow tracking, recovery routing). Es distinto
  de aprobar una acción puntual (`ApprovalGateCard`) o consentir alcance (`AgentConsentCard`): es el
  plan completo de N pasos por adelantado, editable. Sin componente hoy → nueva fila
  `AgentPlanPreview` (área B). Fuente:
  [fuselabcreative.com/ui-design-for-ai-agents](https://fuselabcreative.com/ui-design-for-ai-agents/).
- **n8n** — releases de julio: bug fixes de editor/AI-builder/nodos + soporte de **OAuth 2.0 Token
  Exchange (RFC 8693)** para embed en iframe sin login separado. Mejora la *auth* del embed, no el
  *branding*: sigue sin white-label completo, el análisis de `WorkflowCanvasFrame` no cambia. Fuente:
  [n8n release notes](https://docs.n8n.io/release-notes/), [n8n Embed docs](https://docs.n8n.io/embed/).
- **Vercel AI SDK** — `ai@7.0.30` (16-jul-2026): parche de seguridad de URLs de provider
  (`trustedOrigin`/`credentialedOrigin`, validación de redirects) + grok-4.5. Sin componente nuevo,
  pero refuerza la línea "integridad/seguridad de la superficie de tools" que motivó
  `ToolIntegrityIndicator`. Fuente:
  [github.com/vercel/ai/releases](https://github.com/vercel/ai/releases).
- **OpenAI / Anthropic** — sin patrón nuevo de UI de agentes esta semana. OpenAI: transporte
  websocket para modelos Responses + sandbox nativo (tooling). Anthropic: subagent text streaming,
  progress heartbeats, tool `EndConversation` en Claude Code (dev tooling, no UI de agentes).
- **IBM Carbon / Adobe Spectrum** — sin release notes de patrón nuevo esta semana.

## Score de cobertura

**Recuento completo reconciliado contra el `NORTH_STAR.md` actual.** El salto grande vs el reporte
anterior (72%/75% → 78%/80%) **no es trabajo de catálogo de esta semana**: es el score poniéndose al
día con la ola de build del **2026-07-15** (AppShell, CommandPalette, DateRangePicker, data-viz
tokens, BandGauge, DeltaList, ConnectorStatus), que aterrizó *después* del reporte #3 y quedó
reflejada en el `NORTH_STAR` pero nunca fue puntuada por un reporte. Esta semana solo agrega 1 gap
nuevo (`AgentPlanPreview`, ❌ en B) y 0 cierres de catálogo.

| Área | ✅ | 🟡 | ❌ | Total | Cobertura (✅) | Ponderada (✅=1, 🟡=0.5) |
|---|---|---|---|---|---|---|
| A. n8n / proceso empresarial | 7 | 0 | 1 | 8 | 88% | 88% |
| B. Agent ops / consola de IA | 19 | 0 | 5 | 24 | 79% | 79% |
| C. Auditoría / compliance | 8 | 0 | 5 | 13 | 62% | 62% |
| D. Table stakes enterprise | 7 | 3 | 1 | 11 | 64% | 77% |
| E. Comercial / RevOps | 6 | 0 | 0 | 6 | 100% | 100% |
| F. Industrial / OT | 7 | 0 | 0 | 7 | 100% | 100% |
| **Total (A–F)** | **54** | **3** | **12** | **69** | **78%** | **80%** |

(Las **primitivas** — Stepper/Dropzone/KanbanBoard/Toast/Combobox/FormField/FlowStepper — se
documentan pero, como en reportes previos, **no se puntúan** en la tabla A–F para mantener la
comparación limpia. De sumarse, 4 son ✅ y 3 son 🟡.)

Área D deja de ser la más rezagada del catálogo (subió de 20%/40% a 64%/77% con la ola del 07-15).
**C (compliance) es ahora la de menor cobertura ✅ (62%)** — 5 gaps abiertos: `RBACMatrixViewer`,
`DataLineageGraph`, `ChangeRecordCard`, `IncidentView`, `VendorRiskCard`.

## Top 5 gaps priorizados (backlog para el loop de construcción de 5h)

1. **AgentHandoffMarker + CheckpointBadge** — prioridad #1 por **cuarta semana consecutiva** (iter.15
   → ladder §07 → semana de calidad → semana de distribución/npm, ninguna las tocó). Marcadores
   puntuales sobre `RunTimeline`/`TraceTree`/`ExecutionTimeline` ya existentes; bajo esfuerzo. **El
   patrón ya no es "orden de prioridad" sino que el top-5 de este documento no está llegando al loop
   de construcción.** Acción concreta sugerida: sembrarlas como el PRIMER ítem de la próxima sesión,
   o promover el par a un spec explícito en `docs/`.
2. **RBACMatrixViewer** — C es ahora la peor área (62%); el vocabulario actor/provider ya existe en
   `ModelProvenanceCard`/`ApprovalChainStepper`. "Por qué este usuario tiene acceso" sigue sin UI.
3. **ToolIntegrityIndicator (tool-definition drift)** — Vercel AI SDK ya lo resuelve a nivel SDK
   (`fingerprintTools`/`detectToolDrift`), reforzado por el parche de seguridad de tools de esta
   semana; sin UI equivalente. Extender `GuardrailIndicator` en vez de construir desde cero.
4. **AgentAnomalyIndicator + VendorRiskCard** — arrastradas (FINRA behavioral baselining / auditores
   SOC2 2026 respectivamente); ambas reusan vocabulario `Tone`/`NodeStatus` o `ModelProvenanceCard`.
5. **AgentPlanPreview (planning visibility)** — nuevo esta semana; patrón emergente de UX de agentes
   enterprise (secuencia de acciones antes de ejecutar). Bajo-medio esfuerzo reusando la gramática de
   pasos. Menor urgencia que 1–4 por ser de esta semana, pero de valor transversal a las 5 verticales.

(Las 3 primitivas en 🟡 — `Combobox`/`FlowStepper`/`FormField` — solo necesitan una story standalone
en Storybook para pasar a ✅; trabajo trivial, no compite con los gaps de arriba. `WorkflowCanvasFrame`
sigue fuera del top 5, mayor esfuerzo. **Vertical de salud** sigue siendo la oportunidad de pionero de
mayor plazo — ningún competidor visible tiene vertical clínica construida y la señal UX/regulatoria se
sigue acumulando.)

## Riesgos

- **El top-5 de este documento no está llegando al loop de construcción (riesgo de proceso, el más
  importante esta semana).** 4 loops de construcción distintos corrieron desde la iteración 15 y
  ninguno construyó `AgentHandoffMarker`/`CheckpointBadge` pese a ser prioridad #1 en cada reporte.
  El loop trabaja de sus propios specs/audits (impeccable, ladder §07, distribución) y no consume
  este backlog. Recomendación: acoplar explícitamente el top-5 del vanguard al arranque del loop de
  construcción, o convertir el par pendiente en un spec en `docs/` que el loop sí lea.
- **Nombres de paquete stale en docs de repo (bajo, pero consumidor-visible):** `README.md` y
  `apps/showcase/package.json` todavía dicen `@duly/tokens` / `@duly/ui` / `@duly/showcase`, cuando
  el paquete publicado es `@enregla-ui/duly-*`. Un dev que copie el snippet de instalación del README
  instalará un paquete inexistente. Fuera de mi alcance arreglarlo (solo toco `.md` de vanguardia);
  vale que el loop de construcción sincronice README/CONTRIBUTING con el scope real.
- **`AGENTIC_EXPERIMENTS_LOG.md` sigue desactualizado** — se detiene en la iteración 15
  (2026-07-04). Toda la actividad posterior (ladder, workstreams, agent gallery, ola 07-15,
  distribución/npm, showcase) solo vive en commits/specs, no en el log narrativo. Riesgo repetido
  sin resolver desde hace 3 reportes.
- **Deuda de Storybook en primitivas nuevas:** `Combobox`/`FlowStepper`/`FormField` se shippearon
  sin story standalone (solo test + showcase). Coherente con la nota de `ErrorState`, pero si se
  vuelve costumbre erosiona el criterio "✅ = existe Y está en Storybook" del propio catálogo.

## Notas de estado (sin acción)

- **EU AI Act**: monitoreo futuro se reduce a registrar la referencia EUR-Lex exacta cuando aparezca;
  ya no hay decisión regulatoria pendiente que vigilar semana a semana.
- **SOC2/ISO 42001/prEN 18286/WCAG 2.2**: sin novedad esta semana (estado del reporte #3 vigente).
