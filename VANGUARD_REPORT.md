# VANGUARD REPORT — Duly

> Se sobreescribe cada semana. Historial real vive en `git log -- VANGUARD_REPORT.md`.

**Fecha:** 2026-08-03 · **Generado por:** routine cloud "vanguard check" #6

## Resumen ejecutivo

Segunda semana consecutiva **sin loop de construcción**: `HEAD` sigue siendo `b06335f` (el commit del
reporte anterior, 27-jul) — cero commits desde entonces. Lo externo sí se movió y con una consecuencia
dura: el **Art. 50 del EU AI Act entró en vigor con enforcement el 2-ago (anteayer)** y apareció el
**icon-set oficial de la Comisión** para etiquetar contenido-IA → se promueve la vieja nota-de-riesgo de
contenido sintético a **fila de catálogo** (`AIDisclosureLabel`, ❌). También salió el spec **MCP
2026-07-28** (MCP Apps ya es extensión versionada formal — reconfirma `MCPAppsWidgetFrame`, sin patrón
nuevo). Cobertura baja a **76%/78%** por sumar 1 gap con deadline vencido.
`AgentHandoffMarker`/`CheckpointBadge` cruzan **6 semanas** como prioridad #1.

## Novedades de la semana (con fuente)

### Interno (lo más importante)

- **El loop de construcción no corrió por segunda semana seguida.** `git log b06335f..HEAD` está vacío:
  ni un commit desde el 27-jul. El 2026-07-20→27 ya había sido una semana muerta; ahora son **dos
  consecutivas**. El diagnóstico deja de ser "una semana perdida" y pasa a "**el loop parece haberse
  detenido**" (ver Riesgos — este es el hallazgo más accionable del reporte). Verificado por inventario
  real de `packages/ui/src`: las 13 filas ❌ siguen sin archivo de implementación (grep confirma 0
  archivos para Handoff/Checkpoint/ToolIntegrity/AgentAnomaly/AgentPlanPreview/AgentMemory/RBACMatrix/
  DataLineage/ChangeRecord/IncidentView/VendorRisk; el único match de "WorkflowCanvas" es una mención en
  `subworkflow-chip.tsx`, no una implementación); las 3 primitivas 🟡 (Combobox/FlowStepper/FormField)
  siguen sin story standalone.

### Externo

- **EU AI Act Art. 50 — YA EN VIGOR, enforcement desde el 2-ago-2026 (hallazgo regulatorio #1).** La
  fecha que el reporte anterior situaba "a 5 días" se cumplió: la transparencia del Art. 50 es exigible y
  su **enforcement empezó de inmediato el 2-ago** (sanción hasta **15M€/3%**; la carga de probar el
  disclosure a tiempo recae en el proveedor/deployer). Lo nuevo y accionable para un design system:
  - **Apareció referencia de diseño oficial.** La Comisión publicó un **icon-set voluntario** con 3
    diseños (totalmente-generado / parcialmente-modificado / IA-involucrada, con variantes de color) + un
    **Code of Practice on Transparency of AI-generated Content** cuyos estándares de colocación los
    firmantes ya adoptaron y "probablemente se vuelvan el benchmark regulatorio".
  - **Las obligaciones son 3, todas de UI:** (a) disclosure "estás hablando con IA" al primer contacto en
    chatbots; (b) marcado de contenido generado/manipulado (imagen/audio/video/texto) legible-por-humano
    **y** machine-readable; (c) label de deepfake sobre media que se parece a personas reales.
  - **Acción tomada este reporte:** se promueve la nota-de-riesgo de las 3 semanas anteriores a **fila de
    catálogo** `AIDisclosureLabel / SyntheticContentMark` (área C, ❌) y entra al top-2 de prioridad — es
    el único gap con **deadline ya vencido**. `ModelProvenanceChip` NO lo cubre (es procedencia técnica,
    no una marca legible de "esto es IA").
  - Fuentes: [CSA — Article 50 Transparency](https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-article-50-transparency-20260729/) (29-jul),
    [EU Code of Practice on AI-generated Content](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content),
    [artificialintelligenceact.eu/article/50](https://artificialintelligenceact.eu/article/50/).
- **MCP 2026-07-28 spec (release candidate, 28-jul).** Core stateless; **MCP Apps elevado a extensión
  versionada formal del protocolo** (deja de ser solo un patrón ratificado — reconfirma
  `MCPAppsWidgetFrame`, ya lo implementa, sin cambio de estado); extensión **Tasks** (server responde
  `tools/call` con task handle + `tasks/get|update|cancel` — lifecycle de tarea larga que roza
  `CheckpointBadge`); auth hardening OAuth/OIDC (validación `iss` RFC 9207). Anthropic lo shippeó a Claude
  con Enterprise-Managed Auth y **dashboards de Observability por connector** (adopción/errores/latencia
  — roza `ConnectorStatus`, sin patrón nuevo). Fuentes:
  [blog.modelcontextprotocol.io/2026-07-28](https://blog.modelcontextprotocol.io/posts/2026-07-28/),
  [claude.com/blog/bringing-mcp-2026-07-28-to-claude](https://claude.com/blog/bringing-mcp-2026-07-28-to-claude).
- **Claude Opus 5 (24-jul).** Thinking-on-by-default al precio de Opus 4.8, contexto 1M. Noticia de
  modelo, no de patrón UI. Fuente: [releasebot.io/updates/anthropic](https://releasebot.io/updates/anthropic).
- **n8n / Temporal / Vercel AI SDK / OpenAI / Microsoft AG-UI / IBM Carbon / Adobe Spectrum** — sin
  patrón nuevo de UI verificable esta semana (n8n: el OAuth Token Exchange sigue siendo lo último
  relevante, embed aún NO white-label; Temporal Custom Roles aún en pre-release; Vercel: sin release
  posterior a `ai@7.0.30`).

## Score de cobertura

Catálogo idéntico al reporte anterior salvo **+1 gap nuevo** (`AIDisclosureLabel`, ❌ en área C). Sin
cierres de catálogo (no hubo build por segunda semana). La cobertura baja de 77%/79% a **76%/78%**
exclusivamente por sumar el denominador — **ninguna regresión**.

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
pero **no se puntúan** en la tabla A–F, igual que en reportes previos. De sumarse, 4 ✅ y 3 🟡.)
**C (compliance) cae a 57% y sigue siendo la peor área** — es donde más pesa la falta de construcción,
justo cuando la regulación de C se volvió exigible.

## Top 5 gaps priorizados (backlog para el loop de construcción de 5h)

1. **AgentHandoffMarker + CheckpointBadge** — prioridad #1 por **sexta semana consecutiva**. Marcadores
   puntuales sobre `RunTimeline`/`TraceTree`/`ExecutionTimeline` existentes; bajo esfuerzo, cierra las 2
   filas más viejas del documento. **Antes de re-priorizar nada: confirmar que el routine de construcción
   sigue programado** (dos semanas sin un solo commit). Luego sembrarlas como PRIMER ítem o promoverlas a
   un spec en `docs/`.
2. **AIDisclosureLabel / SyntheticContentMark** (NUEVO, área C) — **el único gap con deadline ya vencido**
   (Art. 50 exigible desde el 2-ago). Hay referencia de diseño oficial (icon-set de la Comisión + Code of
   Practice), así que no arranca de cero. Esfuerzo bajo: pill/badge reusando `ModelProvenanceChip`/
   `GuardrailChip` + el icon-set, con las 3 variantes (chatbot / contenido-IA / deepfake). Cualquier
   cliente objetivo con chatbot o generación de media ya está técnicamente fuera de cumplimiento.
3. **RBACMatrixViewer** — C es la peor área (57%); vocabulario actor/provider ya existe en
   `ModelProvenanceCard`/`ApprovalChainStepper`. "Por qué este usuario tiene acceso" sigue sin UI.
4. **ToolIntegrityIndicator (tool-definition drift)** — reforzado por el beta de Anthropic de
   mid-conversation tool changes (tools que mutan en vivo) y por el MCP stateless (tools cacheados con
   `ttlMs`). Extender `GuardrailIndicator`.
5. **AgentAnomalyIndicator + VendorRiskCard + AgentPlanPreview/AgentMemoryPanel** — arrastradas (FINRA
   behavioral baselining / auditores SOC2 2026 / los 2 patrones universales de agente sin componente).
   `VendorRiskCard` además roza la obligación del Omnibus de *documentar salvaguardas*.

(Las 3 primitivas 🟡 — `Combobox`/`FlowStepper`/`FormField` — solo necesitan story standalone en Storybook
para pasar a ✅; trivial, no compite con lo de arriba. `WorkflowCanvasFrame` sigue fuera del top-5.
**Vertical de salud** sigue siendo la oportunidad de pionero de mayor plazo, con refuerzo regulatorio FDA
CDS 2026 mapeando 1:1 a componentes ya construidos.)

## Riesgos

- **El loop de construcción lleva 2 semanas sin correr (riesgo de proceso, el más importante — CONFIRMADO
  como tendencia).** `HEAD` = `b06335f` no avanzó desde el 27-jul; la semana previa tampoco. Un vanguard
  que reporta cada semana sobre un catálogo congelado pierde su función, y esta semana el costo es
  concreto: un gap **regulatorio-exigible-hoy** (`AIDisclosureLabel`) entra al backlog sin nadie que lo
  construya. **Recomendación al usuario: verificar YA que el routine de construcción de 5h sigue activo y
  programado** — dos semanas seguidas en cero apunta a que se detuvo, no a una pausa.
- **`Art. 50` exigible AHORA (enforcement desde 2-ago) sin componente de disclosure/marcado.** Ya no es
  proyección — es incumplimiento potencial en vivo para cualquier cliente de las 5 verticales con chatbot
  o generación de media sintética. Mitigación disponible: la fila `AIDisclosureLabel` ya está en el
  catálogo con referencia de diseño oficial; falta solo construirla (ver gap #2). Sanción hasta 15M€/3%.
- **Nombres de paquete stale en docs de repo (arrastrado, sin resolver):** `README.md` y
  `apps/showcase/package.json` aún dicen `@duly/*` cuando el paquete publicado es `@enregla-ui/duly-*`.
  Un dev que copie el snippet de instalación instala un paquete inexistente. Fuera de mi alcance (solo
  toco `.md` de vanguardia); el loop de construcción debe sincronizarlo.
- **`AGENTIC_EXPERIMENTS_LOG.md` sigue desactualizado** — se detiene en la iteración 15 (2026-07-04);
  toda la actividad posterior solo vive en commits/specs. Riesgo repetido sin resolver desde hace 5
  reportes.

## Notas de estado (sin acción)

- **EU AI Act**: el hilo del Omnibus (publicación) está cerrado; el nuevo hilo abierto es **la
  implementación del Art. 50** — a vigilar si la AI Office (Art. 75a) o el Code of Practice emiten
  especificaciones de placement/icono con requisitos de UI más concretos.
- **MCP Apps**: ahora extensión formal del spec — el estándar que `MCPAppsWidgetFrame` ya implementa se
  consolidó; sin trabajo pendiente.
- **SOC2 / ISO 42001 / prEN 18286 / WCAG 2.2 / FINRA**: sin novedad esta semana.
