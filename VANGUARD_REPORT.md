# VANGUARD REPORT — Studio DS

> Se sobreescribe cada semana. Historial real vive en `git log -- VANGUARD_REPORT.md`.

**Fecha:** 2026-07-02 · **Generado por:** routine cloud "vanguard check" #1 (primera corrida)

## Resumen ejecutivo

El repo está sano (tests 26/26, build `@studio/ui` y Storybook OK). Mientras se investigaba esta
auditoría, el loop de construcción cerró en paralelo dos gaps: `NodeStatusBadge`/`RunTimeline`
(commit `3b39be4`, gramática de 6 estados con anillos dashed-animados) y `WCAG 2.2 AA` (commit
`539e9db`, hit-areas 24px + auditoría axe 0 violaciones en 76 stories) — el inventario de este
reporte ya los refleja como ✅. Aun así, 0 componentes de n8n reales (`NodeStatusBadge` es el
único ✅ del área) y 0 de auditoría/compliance — las dos áreas que más sostienen la credibilidad
enterprise siguen casi en blanco. La novedad más importante de fuera del repo es regulatoria: el
Digital Omnibus de la UE (aprobado por Parlamento y Consejo, aún sin publicar) podría retrasar el
deadline del EU AI Act de agosto 2026 a diciembre 2027. Segunda novedad relevante: 5 fuentes
independientes (OpenAI, Microsoft, Codex Remote, fintech, software) convergieron esta semana en el
mismo patrón — approval/HITL con evidencia — lo que sube `ApprovalGateCard`/`HumanInterruptQueue`
a prioridad #1 del backlog.

## Novedades de la semana (con fuente)

**n8n** — release semanal 2.29.x con "AI Agent v3" como nodo por defecto (n8n docs/GitHub
releases, 30-jun-2026). Confirmado: el plan OEM **no** ofrece white-label completo — el branding
n8n permanece visible (n8n.io/oem/).

**Temporal UI** — "Custom Roles" (RBAC granular) en pre-release para Temporal Cloud
(temporal.io/changelog, 25-jun-2026); ui-server v2.51.1 con mejoras de accesibilidad de teclado en
el árbol de familia de workflows y legibilidad del event-history timeline.

**LangSmith/LangGraph** — integración "Harbor x LangChain" para evals de agentes de larga duración
(langchain.com/blog, 30-jun-2026); control de retención de traces por acción, progreso en vivo de
experimentos, dashboard chart builder + alertas Slack nativas (LangSmith changelog, semanas del
15 y 20 de junio).

**OpenAI** — deprecación de **Agent Builder** (canvas visual de AgentKit) y Evals hosteados, sunset
30-nov-2026 (OpenAI community, 04-jun-2026) — cambia a qué fuente seguir (Agents SDK + ChatKit).
Guía formal única "Guardrails and human review" (input/output/tool guardrails + patrón
`interruptions`/`RunState`). Codex Remote GA: aprobación de acciones de agente desde el móvil
(openai.com/products/release-notes, jul-2026).

**Anthropic/Claude** — Claude Managed Agents con eventos `event_start`/`event_delta` para streaming
incremental (platform.claude.com, 01-jul-2026); Claude Sonnet 5 como modelo agéntico default con
contexto 1M (30-jun-2026); Claude Code v2.1.198 con hooks `agent_needs_input`/`agent_completed` y
background agents que auto-commitean/pushean/abren PR.

**Vercel AI SDK** — AI SDK 7 (25-jun-2026): **MCP Apps** (tools de app en iframe sandboxed vía
JSON-RPC, separadas de las tools visibles al modelo), streaming con métricas de performance
(time-to-first-output, timing por tool), tool approvals integrados al streaming, Terminal UI
experimental, voz en tiempo real agnóstica de proveedor.

**Microsoft** — Agent Framework alcanzó GA 1.0 (abr-2026), adoptó el protocolo **AG-UI** (7
features: incl. Human-in-the-Loop, Tool-based Generative UI, Shared State) recomendando CopilotKit
como capa de UI (learn.microsoft.com, verificado 2026-04-09). Build 2026 (jun-2026): "Agent
Harness", "Hosted Agents", "CodeAct" (-52% latencia).

**IBM Carbon** — v11.109-111.0 (jun/jul-2026): tamaños `xs` en combobox/multiselect/dropdown,
"contextual layout tokens", tabs verticales condensados. Sin novedades en modos de densidad ni en
`@carbon/charts` funcionalmente esta semana.

**Adobe Spectrum** — React Spectrum S2 v1.5.0 y React Aria Components v1.19.0 (18-jun-2026):
`keyboardNavigationBehavior` para ListView/TreeView/GridList, `Popover.getTargetRect`. Release
anterior (v1.4.0, 28-may) sumó drag-and-drop en tablas y `TableFooter`, relevante para
`DataTable denso`.

**Regulación (la novedad más importante de la semana):**
- **EU AI Act**: Digital Omnibus aprobado por Parlamento (16-jun) y Consejo (29-jun-2026), aún sin
  publicar en EUR-Lex. Retrasaría Anexo III de ago-2026 a dic-2027. Hasta publicación oficial,
  **ago-2026 sigue vigente legalmente**. Precisión de diseño: retención de logs (6 meses) es
  Art. 19, no Art. 12.
- **SOC2/AICPA**: sin TSC formal de IA; ASB solo "considerando" guías (roadmap 26-feb-2026, sin
  entregable). Se descartó un rumor no verificado de "SOC for AI" — fuente única no confiable.
- **ISO/IEC 42001**: sin revisión 2026; **no** es el estándar armonizado del EU AI Act — ese rol lo
  cumple **prEN 18286** (CEN-CENELEC, consulta pública hasta fines de 2026).
- **WCAG**: 2.2 sigue vigente (ahora también ISO/IEC 40500:2025); no existe "2.3"; WCAG 3.0 solo
  tiene Working Draft (03-mar-2026), a años de ser Recommendation.

**Patrones por sector** — Software: cola de aprobación con confidence score + ruteo por umbral,
señalización binaria de confianza. Fintech: "Know Your Agent" (perfil + consentimiento explícito
por transacción). Salud: panel de explicabilidad clínica con "regla de los 3 segundos" y
correlación de auditoría con hashes. Petróleo/energía: dashboard dual-audiencia (sala de control
vs HSE) con bandas de riesgo semáforo (patrón de riesgo en tiempo real, no específicamente
IA-agente). **Inmobiliaria y petróleo/energía siguen sin patrones de UI de agentes-IA verificables
en fuentes públicas** — honestamente, ninguna fuente de las buscadas tenía mockups o
especificaciones concretas, solo descripciones funcionales genéricas.

## Score de cobertura

Contra el catálogo de 43 ítems de `NORTH_STAR.md` (inventario real verificado con build+test+
Storybook, incluyendo los 2 cierres de gap del loop de construcción durante esta misma auditoría):

| Área | ✅ | 🟡 | ❌ | Total | Cobertura (✅) | Cobertura ponderada (✅=1, 🟡=0.5) |
|---|---|---|---|---|---|---|
| A. n8n / proceso empresarial | 1 | 0 | 7 | 8 | 13% | 13% |
| B. Agent ops / consola de IA | 4 | 2 | 9 | 15 | 27% | 33% |
| C. Auditoría / compliance | 0 | 0 | 10 | 10 | 0% | 0% |
| D. Table stakes enterprise | 1 | 2 | 7 | 10 | 10% | 20% |
| **Total** | **6** | **4** | **33** | **43** | **14%** | **19%** |

Los 6 ✅ (`AgentCore/Card/Gallery`, `AgentMetric/AgentStatusMatrix`, `ExecutionTimeline`,
`NodeStatusBadge`, `RunTimeline`, `WCAG 2.2 AA`) son todos de los últimos 2 días — 4 del laboratorio
agentic, 2 cerrados hoy mismo durante esta auditoría. El área C (auditoría/compliance) sigue en
0% absoluto — es el único de los 4 pilares sin ningún avance, ni parcial, y sostiene 3 de los 10
principios de credibilidad enterprise (#3, #4, #10).

## Top 5 gaps priorizados (backlog para el loop de construcción de 5h)

1. **ApprovalGateCard + HumanInterruptQueue** — sube a prioridad #1: 5 fuentes independientes
   (OpenAI guardrails/approvals, Microsoft AG-UI HITL, Codex Remote mobile approvals, patrón
   fintech KYA, patrón software de cola de aprobación) convergen esta semana en el mismo patrón.
   Área con 0 avance hoy. Diseñar mobile-first, no solo desktop ops console.
2. **AuditLogTable + WhoDidWhatTimeline** — 0% de cobertura en toda el área C. El deadline EU AI
   Act formal sigue siendo ago-2026 (aunque en disputa vía Digital Omnibus); SOC2 CC7/CC8 lo exige
   sin fecha límite de todos modos. Separar diseño de `AuditLogTable` (Art. 12/13) de
   `RetentionBadge` (Art. 19) — son obligaciones legalmente distintas.
3. **TraceTree con costo por span + TokenCostMeter** — `TraceLog`/`ExecutionTimeline` no anidan
   spans ni suman costo; observabilidad con dinero visible sigue sin dueño.
4. **Rich Tool-UI sobre ToolCallCard** — convergencia de 3 vendors esta semana (MCP Apps de
   Vercel, AG-UI Tool-based Generative UI de Microsoft, widgets de ChatKit de OpenAI). Ya existe
   base (`ToolCallCard` con key/value); es una extensión, no un componente desde cero — alto ROI.
5. **ExecutionHistoryTable + RunInspector (wrapper n8n)** — área A en 13% de cobertura, con
   `NodeStatusBadge` como único ✅. Nota de diseño obligatoria: no asumir white-label del editor
   n8n (confirmado que no existe ni en plan OEM) — construir independiente.

## Riesgos

- **Regulatorio, baja urgencia inmediata pero vigilar:** el Digital Omnibus de la UE podría
  retrasar el deadline EU AI Act de ago-2026 a dic-2027 una vez se publique en EUR-Lex. Si el
  loop de construcción está priorizando `AuditLogTable` por "deadline inminente", esa narrativa ya
  no es tan sólida — sigue siendo correcto construirlo (SOC2 no tiene fecha límite y exige lo
  mismo), pero el mensaje de urgencia debe ajustarse. Acción: releer este documento la próxima
  semana para confirmar si el Omnibus ya se publicó.
- **Área de auditoría/compliance (C) en 0% absoluto:** de los 4 pilares del catálogo, es el único
  sin ningún avance ni parcial — y es el que más directamente sostiene "creíble para el auditor"
  (principios #3, #4, #10). El área n8n al menos tiene `NodeStatusBadge` hoy; compliance no tiene
  nada. Si el loop de construcción sigue el orden de prioridad de este documento, entra recién en
  el puesto #2 — vale la pena confirmarlo la próxima semana en vez de que quede relegado otra vez.
- **`scripts/a11y-audit.mjs` tiene una ruta absoluta de Windows hardcodeada**
  (`C:/dev/Enterprise Design System`) — no es portable a este contenedor Linux ni a CI. El
  resultado "76 stories, 0 violaciones" citado en el commit `539e9db` no se pudo re-verificar de
  forma independiente en este entorno; se acepta como válido porque el commit describe metodología
  y alcance específicos (SC 2.5.8, criterios verificados por inspección), pero si se quiere que el
  loop de construcción re-corra este audit automáticamente cada semana, el script necesita rutas
  relativas al repo. No lo toqué por estar fuera de mi alcance (solo `.md`) — queda para el loop
  de construcción.
- **Cobertura ponderada real es 19%, no 14%:** si se reporta solo el % de ✅ puro se subestima el
  avance (4 ítems están en 🟡, con base reutilizable). Usar la columna ponderada para ver progreso
  real semana a semana.
- **Concurrencia con el loop de construcción:** esta auditoría corrió en paralelo al loop de 5h y
  hubo que resolver un conflicto de merge en `NORTH_STAR.md` (2 commits del loop llegaron durante
  la investigación). Se resolvió a favor del estado real más nuevo del repo. Si las corridas
  semanales de vanguardia y el loop de construcción se solapan seguido, vale la pena coordinarlas
  para evitar conflictos repetidos.
- **Build/test:** sin riesgos — `pnpm --filter @studio/ui test` (26/26 passed), `turbo build`
  para `@studio/ui` y `@studio/docs` (Storybook static) ambos verdes al momento de esta auditoría,
  ya con los commits `3b39be4` y `539e9db` incorporados.
