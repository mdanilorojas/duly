# VANGUARD REPORT — Duly

> Se sobreescribe cada semana. Historial real vive en `git log -- VANGUARD_REPORT.md`.

**Fecha:** 2026-08-17 · **Generado por:** routine cloud "vanguard check" #8

## Resumen ejecutivo

**Cuarta semana consecutiva sin loop de construcción:** `HEAD` = `5720d22` (el reporte del 10-ago) — cero
commits desde entonces, y `AGENTIC_LOOP_STATE.json` lleva congelado en `iteration 15 / 2026-07-04` más de
6 semanas. En lo externo, semana tranquila pero con **un hallazgo real de patrón**: **IBM Carbon** — DS
benchmark de este documento — shippeó el componente **"AI label"** en *Carbon for AI*, la primera vez que
un design system enterprise de referencia trae de fábrica exactamente la señal de disclosure de
presencia-IA que la fila `AIDisclosureLabel` (gap #2) especifica. Refuerzos: el Art. 50 se aclara como
**cadena de responsabilidad por actor/momento** (no "un badge en todo") y **AIUC-1** publicó su alcance
concreto (51 req / 130 controles). Cobertura **sin cambio: 76%/78%** (catálogo byte-idéntico).

## Novedades de la semana (con fuente)

### Interno (lo más importante)

- **El loop de construcción no corrió por CUARTA semana seguida.** `git log 5720d22..HEAD` está vacío (ni
  un commit desde el 10-ago); las semanas 07-20→27, 27→08-03 y 08-03→10 también estuvieron muertas.
  `AGENTIC_LOOP_STATE.json` = `{iteration: 15, lastRunAt: "2026-07-04", status: "running"}` — dice
  "running" pero no avanza el contador desde el **4-jul** (>6 semanas), señal de proceso muerto sin cerrar
  su estado. Último commit de construcción real: `7014f42`/`d472144` (FlowStepper + fix de imports,
  ~20-jul); todo lo posterior son reportes de vanguardia. Verificado por inventario real de
  `packages/ui/src/agentic/`: las **14 filas ❌** siguen sin archivo de implementación (0 archivos para
  handoff / checkpoint / tool-integrity / anomaly / plan-preview / agent-memory / rbac-matrix /
  data-lineage / change-record / incident-view / vendor-risk / **ai-disclosure / synthetic-content** /
  workflow-canvas); las 3 primitivas 🟡 (Combobox/FlowStepper/FormField) siguen con `.tsx` pero **sin story
  standalone**.
  → La acción #1 real sigue siendo **reactivar/re-programar el routine de construcción de 5h** (ver Riesgos).

### Externo

- **IBM Carbon shippeó el componente "AI label" (hallazgo de patrón #1 de la semana).** *Carbon for AI*
  define el **AI label** como "the primary indicator to communicate that AI is present… to reinforce AI
  transparency, accountability, and explainability at any interface level". Es la **primera vez que un DS
  enterprise benchmark de este documento trae de fábrica la señal de disclosure de presencia-IA** que la
  fila `AIDisclosureLabel` especula desde una obligación regulatoria — ahora hay respaldo de patrón de un
  *peer*, no solo del regulador. No cambia el estado (`AIDisclosureLabel` sigue ❌: Carbon lo tiene, este
  DS no) pero **valida el gap #2 y da referencia de diseño de peer**. Bonus: **Carbon MCP** (explorar
  componentes/tokens/iconos vía MCP) se conecta con la nota DTCG (agentes que "entienden" el DS). Fuente:
  [Carbon for AI](https://carbondesignsystem.com/guidelines/carbon-for-ai/),
  [Carbon MCP](https://carbondesignsystem.com/developing/carbon-mcp/overview/).
- **EU AI Act Art. 50 — se aclara como cadena de responsabilidad diferenciada (refinamiento de diseño).**
  La cobertura legal de la semana precisa que las reglas ya en vigor **no son "un badge en todo"** sino una
  cadena por actor y momento: el *provider* debe el marcado **machine-readable** de los outputs generativos;
  el *deployer*/usuario profesional debe la **disclosure legible-por-humano** en casos estrechos (deepfakes,
  texto de interés público no revisado editorialmente). Insumo directo: las 3 variantes de
  `AIDisclosureLabel` (chatbot / contenido-IA / deepfake) deben modelar **quién marca y en qué momento**
  (design→publication→first-exposure), no solo el tipo de contenido. Sin cambio de estado. Fuentes:
  [Silicon Canals](https://siliconcanals.com/t-europes-ai-watermarking-rules-are-now-live-but-visible-labels-hidden-machine-readable-marks-and-editorial-review-apply-to-different-companies-content-and-moments-under-article-50/),
  [Herbert Smith Freehills Kramer](https://www.hsfkramer.com/notes/ip/2026-03/transparency-obligations-for-ai-generated-content-under-the-eu-ai-act-from-principle-to-practice).
- **AIUC-1 — alcance concreto publicado (a vigilar, sin acción).** El "SOC 2 para agentes de IA" tiene
  **51 requisitos / 130 controles**, certificado válido 12 meses con **testing técnico trimestral**
  (cadencia de cambio mayor que SOC2/ISO 42001); el update de ene-2026 añadió **40+ requisitos
  voice-specific** — los agentes de voz emergen como superficie regulada propia. Refuerza el gap
  `AgentAnomalyIndicator` (límites operativos + desviación) y el set de evidencia de `VendorRiskCard`.
  Fuentes: [Schellman](https://www.schellman.com/blog/ai-governance/what-is-aiuc-1),
  [Zeltser](https://zeltser.com/aiuc-1-cert).
- **Servicios financieros — deadline de alto riesgo ya vivo.** Los requisitos de alto riesgo del EU AI Act
  para **credit scoring y fraud-detection agents** entraron en vigor el **2-ago-2026** (transparencia,
  trazabilidad, supervisión humana); la Colorado AI Act (30-jun-2026) suma disclosure + impact-assessment.
  Refuerza que la vertical financiera se apoya en `AuditLogTable`/`WhoDidWhatTimeline`/`ApprovalGateCard`
  (ya ✅) y necesita `AgentAnomalyIndicator`/`VendorRiskCard` (❌). Fuente:
  [fin.ai](https://fin.ai/learn/evaluate-ai-agent-compliance-financial-services).
- **Microsoft Agent Framework 1.14.0 — workflow checkpoint resume.** El release añade **checkpoint resume**
  de workflow (reconfirma la relevancia de `CheckpointBadge`, prioridad #1) + fixes de approval/streaming;
  sigue AG-UI-compatible con CopilotKit como capa de UI. Sin patrón de UI nuevo. Fuente:
  [releasebot — Microsoft](https://releasebot.io/updates/microsoft).
- **n8n / Vercel AI SDK / Anthropic / LangSmith — sin patrón de UI nuevo verificable.** n8n publicó update
  con AI Assistant + Agent Builder y más soporte MCP/API (embed **sigue sin ser white-label**); Vercel AI
  SDK sumó adaptadores **ACP** (`@ai-sdk/harness-acp`, capa de harness/backend, no UI) + más modelos en el
  Gateway; Anthropic reconfirma MCP 2026-07-28 (400M descargas SDK/mes, 4×) sin patrón nuevo; LangSmith
  Fleet sin novedad posterior. Fuentes: [releasebot — n8n](https://releasebot.io/updates/n8n),
  [Vercel changelog](https://vercel.com/changelog), [releasebot — Anthropic](https://releasebot.io/updates/anthropic).

## Score de cobertura

Catálogo **byte-idéntico** al reporte anterior — esta semana **no se agrega ninguna fila** (el hallazgo más
fuerte, el "AI label" de Carbon, mapea a la fila `AIDisclosureLabel` ya existente; el resto son
fuentes/refinamientos) y no hubo build. Cobertura **sin cambio en 76%/78%**. Ninguna regresión, ningún cierre.

| Área | ✅ | 🟡 | ❌ | Total | Cobertura (✅) | Ponderada (✅=1, 🟡=0.5) |
|---|---|---|---|---|---|---|
| A. n8n / proceso empresarial | 7 | 0 | 1 | 8 | 88% | 88% |
| B. Agent ops / consola de IA | 19 | 0 | 6 | 25 | 76% | 76% |
| C. Auditoría / compliance | 8 | 0 | 6 | 14 | 57% | 57% |
| D. Table stakes enterprise | 7 | 3 | 1 | 11 | 64% | 77% |
| E. Comercial / RevOps | 6 | 0 | 0 | 6 | 100% | 100% |
| F. Industrial / OT | 7 | 0 | 0 | 7 | 100% | 100% |
| **Total (A–F)** | **54** | **3** | **14** | **71** | **76%** | **78%** |

(Las **primitivas** — Stepper/Dropzone/KanbanBoard/Toast/Combobox/FormField/FlowStepper — se documentan
pero **no se puntúan** en A–F, igual que en reportes previos. De sumarse, 4 ✅ y 3 🟡.)
**C (compliance) sigue en 57% — la peor área**, y es donde la regulación ya es exigible (Art. 50 general +
alto riesgo financiero desde el 2-ago). El score congelado 4 semanas seguidas es en sí el síntoma del
hallazgo #1.

## Top 5 gaps priorizados (backlog para el loop de construcción de 5h)

> **Precondición sobre todo el backlog:** el loop no corre hace 4 semanas. Ordenar prioridades es
> secundario a **reactivar el routine de construcción**; mientras no corra, nada de abajo se construye.

1. **AgentHandoffMarker + CheckpointBadge** — prioridad #1 por **octava semana consecutiva**. Marcadores
   puntuales sobre `RunTimeline`/`TraceTree`/`ExecutionTimeline` existentes; bajo esfuerzo, cierra las 2
   filas más viejas del documento. `CheckpointBadge` reforzado esta semana por el checkpoint-resume de
   Microsoft Agent Framework 1.14.0. Sembrar como PRIMER ítem de la próxima sesión o promover a spec en `docs/`.
2. **AIDisclosureLabel / SyntheticContentMark** (área C) — **único gap con deadline ya vencido** (Art. 50
   exigible desde 2-ago). Esta semana ganó **referencia de diseño de un peer** (el "AI label" de IBM Carbon)
   además del marco de guía oficial ya completo. Modelar la marca como **multi-capa** (no un badge), 3
   variantes por **actor/momento** (provider machine-readable vs deployer human-facing en deepfakes/texto no
   revisado). Fecha extra: watermark-detection interop 2-feb-2027.
3. **RBACMatrixViewer** — C es la peor área (57%); vocabulario actor/provider ya existe en
   `ModelProvenanceCard`/`ApprovalChainStepper`. "Por qué este usuario tiene acceso" sigue sin UI.
4. **ToolIntegrityIndicator (tool-definition drift)** — reforzado por el beta de mid-conversation tool
   changes de Anthropic y el MCP stateless (tools cacheados). Extender `GuardrailIndicator`.
5. **AgentAnomalyIndicator + VendorRiskCard + AgentPlanPreview/AgentMemoryPanel** — arrastradas (FINRA
   behavioral baselining + **AIUC-1** límites operativos/desviación + deadline de alto riesgo financiero ya
   vivo + los 2 patrones universales de agente sin componente). `VendorRiskCard` roza además la obligación
   del Omnibus de *documentar salvaguardas*.

(Las 3 primitivas 🟡 — `Combobox`/`FlowStepper`/`FormField` — solo necesitan story standalone en Storybook
para pasar a ✅; trivial. `WorkflowCanvasFrame` sigue fuera del top-5. **Vertical de salud** sigue siendo la
oportunidad de pionero de mayor plazo, con enforcement FDA real. **Mejora de tokens DTCG** — reforzada por
Carbon MCP esta semana — acercaría "Theming white-label" a ✅.)

## Riesgos

- **El loop de construcción se detuvo — 4 semanas + archivo de estado stale (riesgo de proceso, el más
  importante).** `HEAD` = `5720d22` no avanza desde el 10-ago; las 3 semanas previas tampoco.
  `AGENTIC_LOOP_STATE.json` sigue en `iteration 15 / lastRunAt 2026-07-04 / status: running` — reporta
  "running" pero no avanza el contador hace >6 semanas, lo que sugiere que el proceso murió sin actualizar
  su estado (no una pausa ordenada). Un vanguard que reporta cada semana sobre un catálogo congelado pierde
  su función. **Recomendación al usuario: revisar YA que el routine de construcción de 5h esté programado y
  efectivamente ejecutándose** (revisar la config de scheduling / logs del routine, no el repo — el repo ya
  confirma que no llega ningún commit).
- **`Art. 50` exigible AHORA (enforcement desde 2-ago) sin componente de disclosure/marcado.** Es
  incumplimiento potencial en vivo para cualquier cliente de las 5 verticales con chatbot o generación de
  media sintética; los agentes financieros de alto riesgo (credit scoring / fraud detection) también entraron
  al régimen exigible el 2-ago. El marco de guía oficial está completo **y ahora hay referencia de patrón de
  un peer (Carbon "AI label")** — falta solo construir la fila `AIDisclosureLabel` (gap #2). Sanción hasta
  15M€/3%.
- **Nombres de paquete stale en docs de repo (arrastrado, sin resolver):** `README.md` y
  `apps/showcase/package.json` aún dicen `@duly/*` cuando el paquete publicado es `@enregla-ui/duly-*`. Un
  dev que copie el snippet de instalación instala un paquete inexistente. Fuera de mi alcance (solo toco
  `.md` de vanguardia); el loop de construcción debe sincronizarlo.
- **`AGENTIC_EXPERIMENTS_LOG.md` sigue desactualizado** — se detiene en la iteración 15 (2026-07-04); toda
  la actividad posterior solo vive en commits/specs. Coincide exactamente con el punto donde
  `AGENTIC_LOOP_STATE.json` dejó de avanzar — refuerza que el loop se detuvo ahí. Riesgo repetido sin
  resolver desde hace 7 reportes.

## Notas de estado (sin acción)

- **EU AI Act**: marco de guía del Art. 50 **completo** (Guidelines finalizadas + Code of Practice +
  icon-set) + esta semana **referencia de patrón de peer** (Carbon "AI label"). Próximo hito de UI a
  vigilar: interoperabilidad de detección de watermark (2-feb-2027) y specs de placement/icono más
  concretas de la AI Office (Art. 75a).
- **AIUC-1 / DTCG**: estándares emergentes a vigilar (comportamiento de agentes 51 req/130 controles con
  requisitos voice-specific / formato de tokens + Carbon MCP); ninguno exige acción esta semana.
- **MCP Apps / SOC2 / ISO 42001 / prEN 18286 / WCAG 2.2 / FINRA / Temporal / n8n embed / LangSmith Fleet /
  ACP**: sin novedad sustantiva de patrón de UI esta semana.
