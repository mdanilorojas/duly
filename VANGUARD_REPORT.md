# VANGUARD REPORT — Duly

> Se sobreescribe cada semana. Historial real vive en `git log -- VANGUARD_REPORT.md`.

**Fecha:** 2026-08-10 · **Generado por:** routine cloud "vanguard check" #7

## Resumen ejecutivo

**Tercera semana consecutiva sin loop de construcción:** `HEAD` sigue siendo `32f5d50` (el reporte
anterior, 3-ago) — cero commits desde entonces, y `AGENTIC_LOOP_STATE.json` lleva congelado en
`iteration 15 / 2026-07-04` más de 5 semanas. El diagnóstico deja de ser tendencia y pasa a **hecho: el
loop de construcción se detuvo** (hallazgo #1, accionable). En lo externo la semana fue tranquila y
honesta: sin patrón de UI nuevo, pero la Comisión **finalizó las Guidelines del Art. 50** (completan el
marco de guía junto al Code of Practice) con un requisito de diseño concreto — marcado **multi-capa**,
no un badge único — y apareció **AIUC-1**, primer estándar de *comportamiento* de agentes en producción.
Cobertura **sin cambio: 76%/78%** (catálogo byte-idéntico, ninguna fila nueva esta semana).

## Novedades de la semana (con fuente)

### Interno (lo más importante)

- **El loop de construcción no corrió por TERCERA semana seguida — ahora con evidencia dura de que se
  detuvo.** `git log 32f5d50..HEAD` está vacío (ni un commit desde el 3-ago); las semanas 07-20→27 y
  27→08-03 también estuvieron muertas. Lo nuevo esta semana es la confirmación por el propio archivo de
  estado del loop: `AGENTIC_LOOP_STATE.json` = `{iteration: 15, lastRunAt: "2026-07-04", status:
  "running"}` — dice "running" pero no avanza el contador desde el **4-jul** (>5 semanas). El último
  commit de construcción real fue `7014f42`/`d472144` (FlowStepper + fix de imports, ~20-jul); todo lo
  posterior son reportes de vanguardia. Verificado por inventario real de `packages/ui/src`: las **14
  filas ❌** siguen sin archivo de implementación (grep = 0 archivos para handoff / checkpoint /
  tool-integrity / anomaly / plan-preview / agent-memory / rbac-matrix / data-lineage / change-record /
  incident-view / vendor-risk / **ai-disclosure / synthetic-content** / workflow-canvas); las 3
  primitivas 🟡 (Combobox/FlowStepper/FormField) siguen con `.tsx` pero **sin story standalone**.
  → La acción #1 real ya no es re-priorizar componentes sino **reactivar/re-programar el routine de
  construcción de 5h** (ver Riesgos).

### Externo

- **EU AI Act Art. 50 — la Comisión FINALIZÓ las Guidelines de transparencia (hallazgo regulatorio #1
  de la semana).** El 20-jul la Comisión publicó las `Guidelines on transparency obligations for
  providers and deployers of AI systems` (página oficial actualizada 6-ago); **junto al Code of Practice
  + icon-set, completan el marco de guía del Art. 50**. Lo que el reporte anterior tenía como "icon-set +
  Code of Practice" ahora es un framework de guía cerrado. Detalle de diseño accionable del texto
  finalizado:
  - **El marcado machine-readable debe ser multi-capa.** El texto es explícito: *"no single technique
    satisfies the marking requirements"* → `AIDisclosureLabel` debe modelar la marca como **conjunto**
    (watermark + metadata/C2PA + detectabilidad), no un flag booleano ni un solo badge.
  - **Nuevas fechas a vigilar:** sistemas generativos ya en mercado antes del 2-ago → ventana al
    **2-dic-2026**; **interoperabilidad de detección de watermark exigible el 2-feb-2027**.
  - Sin cambio de estado: `AIDisclosureLabel` sigue ❌ (no hubo build). El refinamiento solo hace el
    diseño de la fila más completo.
  - Fuentes: [EC — Guidelines on transparency of AI-generated content](https://digital-strategy.ec.europa.eu/en/policies/guidelines-transparency-ai-generated-content) (6-ago),
    [Paul Weiss — EU Finalises Transparency Rules for AI-Generated Content](https://www.paulweiss.com/insights/client-memos/eu-finalises-transparency-rules-for-ai-generated-content),
    [artificialintelligenceact.eu/article/50](https://artificialintelligenceact.eu/article/50/).
- **AIUC-1 — estándar emergente de comportamiento de agentes (a vigilar, sin acción).** Primer estándar
  enfocado específicamente en **cómo se comportan los agentes en producción** (data protection, límites
  operativos, resistencia a ataques, prevención de error vía testing técnico independiente), desarrollado
  con Stanford/MIT/MITRE/CSA. No es regulación ni exige UI todavía, pero su eje "límites operativos +
  desviación" refuerza el gap `AgentAnomalyIndicator` (behavioral baselining) y el set de evidencia de
  `AuditLogTable`/`VendorRiskCard`. Vanta ("9 things your auditor will want to see about your AI agents")
  reconfirma el mismo set. Fuentes: [fin.ai](https://fin.ai/learn/evaluate-ai-agent-compliance-financial-services),
  [Vanta](https://www.vanta.com/resources/ai-agent-audit-preparation).
- **Salud — reconfirmación con enforcement real.** La guía FDA de ene-2026 "afloja" la supervisión del
  CDS que solo *sugiere* (deja la decisión al clínico) vs. el que *decide*; el patrón
  suggest→validate→execute + registro estructurado ("quién vio la recomendación, qué decidió, por qué")
  mapea 1:1 a `ApprovalGateCard` + `AuditLogTable`/`WhoDidWhatTimeline`. Novedad: ya hay enforcement
  (primera warning letter de IA de la FDA, abr-2026). Reconfirma la oportunidad de pionero de la vertical
  de salud, sin componente nuevo. Fuentes: [kevinmd](https://kevinmd.com/2026/01/fda-loosens-ai-oversight-what-clinicians-need-to-know-about-the-2026-guidance.html),
  [teledirectmd](https://teledirectmd.com/health-guides/fda-first-ai-warning-letter-2026/).
- **DTCG tokens — nota de interoperabilidad.** Reportes de DS enterprise 2026 (Supernova) marcan el
  **formato DTCG de tokens** como el estándar que reemplaza convenciones propietarias, + MCP para que
  agentes "entiendan" el DS. Este DS ya publica `@enregla-ui/duly-tokens`; adoptar el schema DTCG del
  export haría el rebrand white-label consumible por herramientas externas — se conecta con el 🟡 de
  "Theming white-label". Candidato de mejora de tokens para el loop. Fuente:
  [Supernova — 2026 Trends](https://www.supernova.io/blog/the-future-of-enterprise-design-systems-2026-trends-and-tools-for-success).
- **n8n / Vercel AI SDK / Anthropic / LangSmith — sin patrón de UI nuevo verificable.** n8n publicó
  releases 2.33.x/2.34.x (bug fixes; embed **sigue sin ser white-label**); Vercel AI SDK, patch de
  dependencias (`@ai-sdk/harness` 1.0.43, sin componente); Anthropic, self-hosted environments para
  Claude Code en beta (compliance/red interna — enterprise, no un patrón de UI de agentes) y Opus 5 ya
  reportado; LangSmith Fleet sin novedad posterior. Fuentes:
  [releasebot — n8n](https://releasebot.io/updates/n8n), [releasebot — Anthropic](https://releasebot.io/updates/anthropic).

## Score de cobertura

Catálogo **byte-idéntico** al reporte anterior — esta semana **no se agrega ninguna fila** (los hallazgos
son fuentes/refinamientos, no componentes) y no hubo build. Cobertura **sin cambio en 76%/78%**. Ninguna
regresión, ningún cierre.

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
**C (compliance) sigue en 57% — la peor área**, y es donde la regulación ya es exigible (Art. 50). El
score congelado 3 semanas seguidas es en sí el síntoma del hallazgo #1.

## Top 5 gaps priorizados (backlog para el loop de construcción de 5h)

> **Precondición sobre todo el backlog:** el loop no corre hace 3 semanas. Ordenar prioridades es
> secundario a **reactivar el routine de construcción**; mientras no corra, nada de abajo se construye.

1. **AgentHandoffMarker + CheckpointBadge** — prioridad #1 por **séptima semana consecutiva**. Marcadores
   puntuales sobre `RunTimeline`/`TraceTree`/`ExecutionTimeline` existentes; bajo esfuerzo, cierra las 2
   filas más viejas del documento. Sembrar como PRIMER ítem de la próxima sesión o promover a spec en
   `docs/`.
2. **AIDisclosureLabel / SyntheticContentMark** (área C) — **único gap con deadline ya vencido** (Art. 50
   exigible desde 2-ago). El marco de guía oficial ya está **completo** (Guidelines finalizadas + Code of
   Practice + icon-set), así que el diseño no arranca de cero. Modelar la marca como **multi-capa** (no un
   badge), 3 variantes (chatbot / contenido-IA / deepfake). Fecha extra: watermark-detection interop
   2-feb-2027.
3. **RBACMatrixViewer** — C es la peor área (57%); vocabulario actor/provider ya existe en
   `ModelProvenanceCard`/`ApprovalChainStepper`. "Por qué este usuario tiene acceso" sigue sin UI.
4. **ToolIntegrityIndicator (tool-definition drift)** — reforzado por el beta de mid-conversation tool
   changes de Anthropic y el MCP stateless (tools cacheados). Extender `GuardrailIndicator`.
5. **AgentAnomalyIndicator + VendorRiskCard + AgentPlanPreview/AgentMemoryPanel** — arrastradas (FINRA
   behavioral baselining, ahora también respaldado por **AIUC-1** / auditores SOC2 2026 / los 2 patrones
   universales de agente sin componente). `VendorRiskCard` roza además la obligación del Omnibus de
   *documentar salvaguardas*.

(Las 3 primitivas 🟡 — `Combobox`/`FlowStepper`/`FormField` — solo necesitan story standalone en Storybook
para pasar a ✅; trivial. `WorkflowCanvasFrame` sigue fuera del top-5. **Vertical de salud** sigue siendo
la oportunidad de pionero de mayor plazo, ahora con enforcement FDA real. **Mejora de tokens DTCG** es un
candidato nuevo de bajo esfuerzo que acercaría "Theming white-label" a ✅.)

## Riesgos

- **El loop de construcción se detuvo — 3 semanas + archivo de estado stale (riesgo de proceso, el más
  importante, ELEVADO de "tendencia" a "hecho").** `HEAD` = `32f5d50` no avanza desde el 3-ago; las 2
  semanas previas tampoco. Evidencia dura nueva: `AGENTIC_LOOP_STATE.json` sigue en `iteration 15 /
  lastRunAt 2026-07-04 / status: running` — reporta "running" pero no avanza el contador hace >5 semanas,
  lo que sugiere que el proceso murió sin actualizar su estado (no una pausa ordenada). Un vanguard que
  reporta cada semana sobre un catálogo congelado pierde su función. **Recomendación al usuario: revisar
  YA que el routine de construcción de 5h esté programado y efectivamente ejecutándose** (revisar la
  config de scheduling / logs del routine, no el repo — el repo ya confirma que no llega ningún commit).
- **`Art. 50` exigible AHORA (enforcement desde 2-ago) sin componente de disclosure/marcado.** Es
  incumplimiento potencial en vivo para cualquier cliente de las 5 verticales con chatbot o generación de
  media sintética. El marco de guía oficial ya está completo (falta solo construir la fila
  `AIDisclosureLabel`, gap #2); nuevo requisito de diseño: marcado multi-capa. Sanción hasta 15M€/3%.
- **Nombres de paquete stale en docs de repo (arrastrado, sin resolver):** `README.md` y
  `apps/showcase/package.json` aún dicen `@duly/*` cuando el paquete publicado es `@enregla-ui/duly-*`.
  Un dev que copie el snippet de instalación instala un paquete inexistente. Fuera de mi alcance (solo
  toco `.md` de vanguardia); el loop de construcción debe sincronizarlo.
- **`AGENTIC_EXPERIMENTS_LOG.md` sigue desactualizado** — se detiene en la iteración 15 (2026-07-04);
  toda la actividad posterior solo vive en commits/specs. Coincide exactamente con el punto donde
  `AGENTIC_LOOP_STATE.json` dejó de avanzar — refuerza que el loop se detuvo ahí. Riesgo repetido sin
  resolver desde hace 6 reportes.

## Notas de estado (sin acción)

- **EU AI Act**: marco de guía del Art. 50 **completo** (Guidelines finalizadas + Code of Practice +
  icon-set). Próximo hito de UI a vigilar: interoperabilidad de detección de watermark (2-feb-2027) y si
  la AI Office (Art. 75a) emite specs de placement/icono más concretas.
- **AIUC-1 / DTCG**: estándares emergentes a vigilar (comportamiento de agentes / formato de tokens);
  ninguno exige acción esta semana, ambos refuerzan gaps o mejoras ya listadas.
- **MCP Apps / SOC2 / ISO 42001 / prEN 18286 / WCAG 2.2 / FINRA / Temporal / n8n embed**: sin novedad
  esta semana.
