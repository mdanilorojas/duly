# VANGUARD REPORT — Duly

> Se sobreescribe cada semana. Historial real vive en `git log -- VANGUARD_REPORT.md`.

**Fecha:** 2026-07-27 · **Generado por:** routine cloud "vanguard check" #5

## Resumen ejecutivo

Semana sin construcción: **`HEAD` sigue siendo el commit de vanguardia del reporte anterior**
(`e862c61`, 2026-07-20) — el loop de construcción no corrió ningún commit esta semana, así que el
catálogo A–F es byte-idéntico y ninguna columna de Estado cambia por trabajo interno. Lo externo sí
se movió: (1) el **EU AI Act Digital Omnibus se PUBLICÓ** como `Regulation (EU) 2026/1744` (OJ
24-jul, en vigor hoy 27-jul) — cierra el único pendiente de monitoreo con la ref EUR-Lex exacta, y
el texto trae 2 prohibiciones nuevas y confirma Art. 50 transparencia el **2-ago-2026** (5 días);
(2) **LangGraph/LangChain 1.0 GA** + LangSmith "Fleet"; (3) Anthropic abrió beta de **memoria de
agente** — respaldo de API para un gap nuevo (`AgentMemoryPanel`). Cobertura baja levemente a
**77%/79%** por sumar 1 gap, no por regresión. `AgentHandoffMarker`/`CheckpointBadge` cruzan **5
semanas** como prioridad #1.

## Novedades de la semana (con fuente)

### Interno (lo más importante)

- **El loop de construcción no corrió esta semana.** `git log e862c61..HEAD` está vacío: no hay ni un
  commit desde el reporte anterior. Las 4 semanas previas el loop trabajaba con agenda propia (ladder,
  calidad, distribución/npm) sin tocar el backlog del vanguard; **esta semana no trabajó en absoluto**.
  El diagnóstico de proceso cambia de "el top-5 no llega al loop" a "el loop no está corriendo" (ver
  Riesgos). Catálogo A–F idéntico al 2026-07-20; verificado por inventario real de `packages/ui/src`
  (las 13 filas ❌ siguen sin archivo de implementación; grep confirma 0 archivos para
  HandoffMarker/CheckpointBadge/ToolIntegrity/AgentAnomaly/AgentPlanPreview/RBACMatrix/DataLineage/
  ChangeRecord/IncidentView/VendorRisk).

### Externo

- **EU AI Act Digital Omnibus — PUBLICADO (hilo cerrado).** Ya no está solo firmado: se publicó en el
  Diario Oficial como **`Regulation (EU) 2026/1744` el 24-jul-2026**, en vigor al 3er día = **27-jul
  (hoy)**. Esta es la referencia EUR-Lex exacta que el reporte anterior dejó como único pendiente.
  Sustancia nueva vs la semana pasada:
  - **2 prohibiciones nuevas (Art. 5(1))**: generadores de imágenes íntimas no consentidas y de CSAM,
    con "salvaguardas técnicas documentadas" (refusal training, prompt guardrails, content filtering,
    abuse detection); sanción hasta **35M€/7%**. Vocabulario idéntico a `GuardrailIndicator` — lo que
    falta no es mostrar el guardrail activo (ya existe) sino *documentar* la salvaguarda como artefacto.
  - **Art. 75a nuevo**: poderes consolidados de supervisión/enforcement de la AI Office.
  - **Corrección de fecha**: la transparencia del **Art. 50 se mantiene 2-ago-2026** (NO diferida; el
    reporte #4 la había situado en 2-dic). Es ahora la fecha exigible más próxima — a 5 días. El marking
    pipeline de generadores preexistentes tiene transición al 2-dic-2026. `ModelProvenanceChip` cubre
    procedencia por output, pero el marcado de contenido sintético generado es más amplio y sin
    componente propio.
  - Diferimientos confirmados: standalone alto-riesgo → 2-dic-2027, embebido → 2-ago-2028, autoridades
    públicas preexistentes → 2-ago-2030.
  - Fuentes: [NicFab](https://www.nicfab.eu/en/posts/digital-omnibus-ai-official-journal/),
    [lawandtechnology.eu](https://lawandtechnology.eu/en/digital-omnibus-on-ai-official-journal-regulation-2026-1744/),
    [Modulos](https://www.modulos.ai/blog/eu-ai-act-omnibus-now-law),
    [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/eu-ai-act-unpacked-34-the-final-digital-omnibus-on-ai-key-amendments-to-the-a-102nber).
- **LangGraph 1.0 / LangChain 1.0 GA (22-jul-2026).** LangSmith renombró "Agent Builder" a **LangSmith
  Fleet** (deploy/operación de flota de agentes) y añadió **vista de costo unificada cross-workflow** +
  AWS Marketplace. Fuente antes marcada "sin novedad" que sí se movió — pero reconfirma lo ya construido
  sin patrón nuevo: Fleet ↔ `AgentTopologyGraph`/`SwarmControlBar`, costo unificado ↔ `TokenCostMeter`/
  `BudgetCapGovernor`. Fuente: [langchain.com](https://www.langchain.com/blog/langchain-langgraph-1dot0).
- **Anthropic — beta de memoria de agente (`agent-memory-2026-07-22`)** y **mid-conversation tool
  changes** GA/beta (`mid-conversation-tool-changes-2026-07-01`). La primera es backend real de memoria
  persistente → motiva el gap nuevo `AgentMemoryPanel`. La segunda (tools que mutan entre turnos)
  refuerza la relevancia de `ToolIntegrityIndicator`. Fuente:
  [platform.claude.com/release-notes](https://platform.claude.com/docs/en/release-notes/overview).
- **Nuevo gap: memory surfacing.** De los 5 patrones universales de UX de agentes enterprise (planning
  visibility · tool-use disclosure · **memory surfacing** · workflow tracking · recovery routing), este
  DS cubre 3 con componentes existentes, tiene `AgentPlanPreview` pendiente para planning visibility, y
  **no tiene nada para memory surfacing** (ver/editar qué recuerda el agente entre sesiones). Con el
  beta de Anthropic ya hay API que exponer → nueva fila `AgentMemoryPanel` (área B). Fuentes:
  [fuselabcreative.com](https://fuselabcreative.com/ui-design-for-ai-agents/),
  [mem0.ai](https://mem0.ai/blog/state-of-ai-agent-memory-2026).
- **Salud — FDA CDS guidance 2026** formaliza "suggest→validate→execute" y exige, para Non-Device CDS,
  una sola recomendación + que el clínico revise independientemente la base (lógica/datos verificables).
  Es exactamente `ApprovalGateCard` + panel de evidencia + `HumanInterruptQueue` mapeado a obligación
  regulatoria; reconfirma la vertical de salud como oportunidad de pionero. Fuente:
  [Orrick](https://www.orrick.com/en/insights/2026/01/fda-eases-oversight-for-ai-enabled-clinical-decision-support-software-and-wearables).
- **Vercel AI SDK / OpenAI / IBM Carbon / Adobe Spectrum / Temporal / Microsoft AG-UI** — sin patrón
  nuevo de UI verificable esta semana (Vercel: patch `ai@7.0.30`; Temporal: Custom Roles sigue en
  pre-release).

## Score de cobertura

Catálogo idéntico al reporte anterior salvo **+1 gap nuevo** (`AgentMemoryPanel`, ❌ en área B). Sin
cierres de catálogo (no hubo build). La cobertura baja de 78%/80% a **77%/79%** exclusivamente por
sumar el denominador — **ninguna regresión**.

| Área | ✅ | 🟡 | ❌ | Total | Cobertura (✅) | Ponderada (✅=1, 🟡=0.5) |
|---|---|---|---|---|---|---|
| A. n8n / proceso empresarial | 7 | 0 | 1 | 8 | 88% | 88% |
| B. Agent ops / consola de IA | 19 | 0 | 6 | 25 | 76% | 76% |
| C. Auditoría / compliance | 8 | 0 | 5 | 13 | 62% | 62% |
| D. Table stakes enterprise | 7 | 3 | 1 | 11 | 64% | 77% |
| E. Comercial / RevOps | 6 | 0 | 0 | 6 | 100% | 100% |
| F. Industrial / OT | 7 | 0 | 0 | 7 | 100% | 100% |
| **Total (A–F)** | **54** | **3** | **13** | **70** | **77%** | **79%** |

(Las **primitivas** — Stepper/Dropzone/KanbanBoard/Toast/Combobox/FormField/FlowStepper — se
documentan pero **no se puntúan** en la tabla A–F, igual que en reportes previos. De sumarse, 4 ✅ y
3 🟡.) **C (compliance) sigue siendo la de menor cobertura ✅ (62%)**; B baja a 76% por el gap nuevo.

## Top 5 gaps priorizados (backlog para el loop de construcción de 5h)

1. **AgentHandoffMarker + CheckpointBadge** — prioridad #1 por **quinta semana consecutiva**.
   Marcadores puntuales sobre `RunTimeline`/`TraceTree`/`ExecutionTimeline` existentes; bajo esfuerzo,
   cierra las 2 filas más viejas del documento. **Antes de re-priorizar nada: confirmar que el routine
   de construcción sigue programado** (esta semana no corrió). Luego sembrarlas como PRIMER ítem o
   promoverlas a un spec en `docs/`.
2. **RBACMatrixViewer** — C es la peor área (62%); vocabulario actor/provider ya existe en
   `ModelProvenanceCard`/`ApprovalChainStepper`. "Por qué este usuario tiene acceso" sigue sin UI.
3. **ToolIntegrityIndicator (tool-definition drift)** — reforzado esta semana por el beta de Anthropic
   de mid-conversation tool changes (tools que mutan en vivo). Extender `GuardrailIndicator`.
4. **AgentAnomalyIndicator + VendorRiskCard** — arrastradas (FINRA behavioral baselining / auditores
   SOC2 2026); `VendorRiskCard` además ahora roza la obligación del Omnibus de *documentar salvaguardas*.
5. **AgentPlanPreview + AgentMemoryPanel** — los 2 patrones universales de agente sin componente
   (planning visibility + memory surfacing). `AgentMemoryPanel` es nuevo esta semana pero ya con backend
   Anthropic; ambos bajo-medio esfuerzo reusando la gramática de pasos/tiles existente.

(Las 3 primitivas 🟡 — `Combobox`/`FlowStepper`/`FormField` — solo necesitan story standalone en
Storybook para pasar a ✅; trivial, no compite con lo de arriba. `WorkflowCanvasFrame` sigue fuera del
top-5. **Vertical de salud** sigue siendo la oportunidad de pionero de mayor plazo, ahora con refuerzo
regulatorio FDA CDS 2026 mapeando 1:1 a componentes ya construidos.)

## Riesgos

- **El loop de construcción no corrió esta semana (riesgo de proceso, el más importante — ESCALADO).**
  `HEAD` no avanzó desde el 2026-07-20. En los 4 reportes previos el riesgo era de *acoplamiento* (el
  loop trabajaba pero no leía este backlog); ahora es de *disponibilidad* (el loop no produjo nada).
  Recomendación concreta al usuario: **verificar que el routine de construcción de 5h sigue activo y
  programado** — si se detuvo, el design system deja de avanzar aunque este audit siga corriendo cada
  semana. Un vanguard que reporta sobre un catálogo congelado pierde su función.
- **`Art. 50 transparencia` exigible en 5 días (2-ago-2026) y sin componente de marcado de contenido
  sintético.** `ModelProvenanceChip` cubre procedencia por output pero no el watermark/etiqueta de
  contenido generado (audio/imagen/video/texto) que el Omnibus publicado exige. Aplica a clientes que
  generen media con IA en las 5 verticales. No es un gap del catálogo actual (no estaba listado); vale
  evaluarlo como fila nueva si algún cliente objetivo genera contenido sintético.
- **Nombres de paquete stale en docs de repo (arrastrado, sin resolver):** `README.md` y
  `apps/showcase/package.json` aún dicen `@duly/*` cuando el paquete publicado es `@enregla-ui/duly-*`.
  Un dev que copie el snippet de instalación instala un paquete inexistente. Fuera de mi alcance (solo
  toco `.md` de vanguardia); el loop de construcción debe sincronizarlo.
- **`AGENTIC_EXPERIMENTS_LOG.md` sigue desactualizado** — se detiene en la iteración 15 (2026-07-04);
  toda la actividad posterior solo vive en commits/specs. Riesgo repetido sin resolver desde hace 4
  reportes.

## Notas de estado (sin acción)

- **EU AI Act**: hilo cerrado por completo — publicado como `Regulation (EU) 2026/1744`, ref EUR-Lex
  registrada. Ya no hay decisión regulatoria pendiente que vigilar; monitoreo futuro solo por si la AI
  Office (Art. 75a) emite guías de implementación con requisitos de UI.
- **SOC2 / ISO 42001 / prEN 18286 / WCAG 2.2**: sin novedad esta semana (estado del reporte #3/#4
  vigente).
