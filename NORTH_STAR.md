# NORTH STAR — Studio DS: sistema operativo visual para agentes de IA en la empresa

> Documento vivo. Define qué significa "increíble para corporaciones" en este design system:
> interfaces de orquestación de agentes, automatización de procesos con n8n, y auditoría/compliance.
> El loop semanal de vanguardia re-verifica este documento contra el estado del arte y contra el
> inventario real de componentes, y mantiene la tabla de gaps al día.
> Última revisión: 2026-07-02 · Próxima: semanal (routine cloud "vanguard check").

## Visión

Una corporación que implementa agentes de IA (con n8n u orquestación propia) debe poder construir
con Studio DS una consola que su CISO, su auditor y su operador de proceso encuentren **creíble,
operable y demostrable** — no un demo bonito. El benchmark: Temporal UI + LangSmith + n8n embed +
IBM Carbon, con la identidad visual propia (dark premium, neural cores, OKLCH).

## Principios de credibilidad enterprise (la vara)

1. **Todo estado está diseñado**: running / retrying / pending / cancelled / partially-failed con
   gramática visual distinta (referencia: Temporal — dashed animado = pending, dashed rojo = retry).
2. **Costo y tokens son UI de primera clase**, atribuidos por paso — no un reporte enterrado.
3. **Un botón Approve nunca va desnudo**: lleva evidencia (qué, por qué, blast radius, rollback).
4. **La inmutabilidad se ve**: hash badges, etiquetas de retención, exports firmados.
5. **Dualidad de actor en todo evento**: humano vs agente vs sistema, distinguible de un vistazo.
6. **Replay read-only** de cualquier run pasado es interacción core, no afterthought.
7. **Densidad + keyboard-first**: modo compacto y command palette — ops vive en tablas.
8. **Procedencia sobre magia**: chips de modelo/prompt/versión en cada output de IA.
9. **Vivo pero calmo**: streaming en tiempo real sin layout shift ni robo de atención.
10. **Saved queries como feature de compliance**: el auditor se autoservicia ("todas las acciones
    de IA de este usuario el mes pasado").

## Catálogo objetivo por área

Estado: ✅ existe · 🟡 parcial · ❌ falta. (El loop semanal actualiza esta columna.)

### A. n8n / proceso empresarial

| Componente | Propósito | Estado |
|---|---|---|
| ExecutionHistoryTable | Lista virtualizada: status dot, workflow, modo trigger, duración, retry | ❌ |
| RunInspector | Replay read-only por nodo con input/output y marcador "falló aquí" | ❌ |
| NodeStatusBadge | success/error/running/waiting/skipped/retrying (anillo dashed animado) | ✅ (V001) |
| RetryControls | Retry-desde-inicio vs desde-nodo-fallido, contador de intentos | ❌ |
| CredentialCard/Picker | Credencial: tipo, owner, last-used, compartida-con, health | ❌ |
| SubworkflowChip | Referencia expandible/deep-link a ejecución hija | ❌ |
| ErrorWorkflowBanner | "Este fallo se enrutó al error handler X" con cross-link | ❌ |
| WorkflowCanvasFrame | Contenedor temado para embeber el editor n8n (zoom, fit, read-only) | ❌ |

> **Nota 2026-07-02**: n8n confirma que su plan OEM **no ofrece white-label completo** — el
> branding de n8n permanece visible en el editor incluso pagando por RBAC/SSO/audit-logging
> (fuente: n8n.io/oem/). `WorkflowCanvasFrame` no debe asumirse como "iframe rebrandeable del
> editor n8n" — hay que diseñarlo como reconstrucción propia de la vista de ejecución, no como
> wrapper de marca ajena.

### B. Agent ops / consola de IA

| Componente | Propósito | Estado |
|---|---|---|
| TraceTree / SpanRow | Spans anidados (LLM/tool/agente/retrieval) con duración, tokens y costo por span | ✅ (V001, Storybook `Agentic/Trace Tree` — árbol colapsable con waterfall de tiempo y rollup de costo/tokens por rama) |
| ApprovalGateCard | Evidence pack: qué/por qué/blast-radius/rollback + approve/reject/escalate + timeout | ✅ (V001, Storybook `Agentic/Approval Gate` — 4 estados de resolución: approved/rejected/escalated/expired, mobile-first) |
| HumanInterruptQueue | Inbox de runs pausados esperando revisión, ordenado por riesgo/edad; debe funcionar también en mobile (ver nota) | ✅ (V001, Storybook `Agentic/Human Interrupt Queue` — ordena por tono de riesgo y luego edad, filas expandibles a `ApprovalGateCard`) |
| AgentConsentCard (Know-Your-Agent) | Perfil de agente + alcance + consentimiento explícito antes de una acción sensible | ❌ (nuevo — ver fuente abajo) |
| RunTimeline | Timeline estilo Temporal con estados vivos (dashed/solid/color) | ✅ (V001, Storybook `Agentic/Run Timeline` — construido sobre la gramática de 6 estados de `NodeStatusBadge`) |
| TokenCostMeter | Costo por run y agregado (modelo vs tools vs retrieval), umbrales de presupuesto | ✅ (V001, Storybook `Agentic/Token Cost Meter` — desglose por categoría + barra de presupuesto con umbral ok/warn/block) |
| GuardrailIndicator | Pill passed/warned/blocked, expandible a la política que disparó | ❌ |
| EvalScoreBadge + Sparkline | Score vs umbral, flechas de regresión | ❌ |
| AgentHandoffMarker | Punto visual de transferencia agente↔agente o agente→humano | ❌ |
| StreamingMessage / ThinkingIndicator | Stream de tokens con chips de tool-call inline | ❌ |
| Rich Tool-UI (tool-based generative UI) | UI enriquecida por tipo de tool dentro de un tool-call, no solo texto/JSON | 🟡 (`ToolCallCard` existe con input/output clave-valor; falta UI por tipo de tool — ver fuente abajo) |
| CheckpointBadge | "Estado persistido aquí; reanudable" | ❌ |
| AgentCore/Card/Gallery (identidad) | Orbs WebGL con identidad por agente | ✅ (V001, Storybook `Agentic/Agent Gallery`) |
| AgentMetric / AgentStatusMatrix | Tiles de métrica y matriz de estatus con tonos semánticos | ✅ (Storybook `Agentic/Property Intelligence`) |
| ExecutionTimeline / RunStep / ToolCallCard | Timeline vertical de un run multi-agente, paso a paso, con detalle expandible | ✅ (V001, Storybook `Agentic/Execution Timeline`) |

> **Novedades 2026-07-02 relevantes para esta área:**
> - OpenAI formalizó una guía única "Guardrails and human review" (input/output/tool guardrails +
>   patrón `interruptions`/`RunState` para pausar-y-aprobar) — referencia directa para
>   `ApprovalGateCard` + `GuardrailIndicator`. Fuente: developers.openai.com/api/docs/guides/agents/guardrails-approvals.
> - OpenAI descontinúa **Agent Builder** (el canvas visual de AgentKit) y Evals hosteados —
>   sunset 30-nov-2026, migrar a Agents SDK/ChatGPT Workspace Agents. AgentKit deja de ser
>   benchmark de referencia para "canvas visual"; el patrón vivo a seguir es ChatKit (widgets:
>   Card con status, confirm/cancel, listas, forms) + Agents SDK. Fuente: OpenAI community
>   deprecation notice, 04-jun-2026.
> - Microsoft Agent Framework (GA 1.0, abr-2026) adoptó el protocolo **AG-UI** con 7 features
>   (incl. Human-in-the-Loop, Tool-based Generative UI, Shared State) y recomienda CopilotKit
>   como capa de UI — mismo vocabulario que este catálogo (aprobaciones + tool-UI enriquecida).
>   Fuente: learn.microsoft.com/agent-framework/integrations/ag-ui.
> - Codex Remote (OpenAI, GA jul-2026) permite **aprobar acciones de un agente desde el móvil**
>   — refuerza que `HumanInterruptQueue`/`ApprovalGateCard` no pueden asumir solo desktop.
> - Patrón fintech "Know Your Agent (KYA)": perfil visible del agente + consentimiento explícito
>   por transacción + límites configurables antes de ejecutar. Fuente: "Fintech Design Trends
>   2026", Outcrowd/Medium, 27-mar-2026 — motiva la nueva fila `AgentConsentCard`.
> - Patrón software: "cola de aprobación con contexto enriquecido" (confidence score +
>   razonamiento + ruteo por umbral de confianza) y señalización binaria alto/bajo de confianza
>   (superó a porcentajes en pruebas de UX) — insumo de diseño para `HumanInterruptQueue` y
>   `EvalScoreBadge`. Fuente: Fuselab Creative, "Agent UX: UI Design for AI Agents in 2026",
>   28-ago-2025.
> - Vercel AI SDK 7 (25-jun-2026) formaliza **MCP Apps**: tools "solo de app" que renderizan UI
>   en iframe sandboxed vía JSON-RPC, separadas de las tools visibles al modelo — mismo patrón
>   que "Rich Tool-UI" arriba. `streamText` ahora también trackea time-to-first-output y timing
>   por tool, con approvals integrados al streaming (automático + HITL).
> - Claude Managed Agents añadió eventos `event_start`/`event_delta` para previsualizar el texto
>   de un agente mientras se genera — referencia directa para `StreamingMessage`. Fuente:
>   platform.claude.com/docs/release-notes, 01-jul-2026.

### C. Auditoría / compliance (EU AI Act Art. 12-13, SOC2 CC7/CC8, ISO 42001)

| Componente | Propósito | Estado |
|---|---|---|
| AuditLogTable | Stream inmutable: actor (humano/agente/sistema), acción, recurso, hash badge | ✅ (V001, Storybook `Agentic/Audit Log Table` — tabla semántica densa, actor con icono+anillo dual, hash badge de inmutabilidad) |
| WhoDidWhatTimeline | Feed cronológico filtrable con saved-query chips | ✅ (V001, Storybook `Agentic/Who Did What Timeline` — grupos cronológicos + chips de consulta guardada con conteo, autoservicio del auditor) |
| EvidenceExportDialog | Export firmado (PDF/CSV/JSON) de un rango filtrado con manifiesto de hashes | ❌ |
| ApprovalChainStepper | Quién aprobó qué, cuándo, en qué orden, con ramas de rechazo | ❌ |
| ModelProvenanceCard | Modelo, versión, prompt version, config hash por run | ❌ |
| RBACMatrixViewer | Grid roles×permisos + "por qué este usuario tiene acceso" | ❌ |
| DataLineageGraph | Origen→transformación→salida a nivel de campo | ❌ |
| ChangeRecordCard | Cambio CC8.1: autor, reviewer, diff, rollback link | ❌ |
| IncidentView | Timeline de incidente: run disparador, recursos afectados, remediación | ❌ |
| RetentionBadge / ImmutabilityIndicator | Señal de confianza "WORM, retenido 6+ meses" | ❌ |

> **Señal regulatoria crítica (2026-07-02) — EU AI Act:** el "Digital Omnibus on AI" fue aprobado
> por el Parlamento Europeo (16-jun-2026) y recibió luz verde final del Consejo (29-jun-2026),
> pero **aún no está publicado en el Diario Oficial de la UE**. De confirmarse, retrasaría el
> deadline de sistemas de alto riesgo standalone (Anexo III) del **2-ago-2026 al 2-dic-2027**, y
> el de sistemas embebidos (Anexo I) del 2-ago-2027 al 2-ago-2028. **Hasta la publicación oficial,
> el 2-ago-2026 sigue siendo la fecha legalmente vigente** — no bajar la prioridad de auditoría
> todavía, pero monitorear eur-lex.europa.eu las próximas semanas. Fuentes: DLA Piper, Gibson
> Dunn, Sidley (despachos que citan el proceso legislativo; texto aún no en EUR-Lex a esta fecha).
> Detalle útil de diseño: la retención mínima de logs (6 meses) vive en el **Art. 19**, no en el
> Art. 12 (que solo exige la capacidad técnica de logging) — separar `RetentionBadge` (Art. 19) de
> `AuditLogTable`/`ModelProvenanceCard` (Art. 12/13) en cualquier implementación futura.
>
> **SOC2/AICPA:** sin actualización formal de Trust Services Criteria para IA a 2026-07-02; el
> ASB de AICPA solo "está considerando" guías sobre IA generativa/agéntica (roadmap 26-feb-2026,
> sin entregable ni fecha). El sector mapea controles de IA a CC6/CC7/CC8 existentes de forma
> interpretativa — no hay estándar nuevo que implemente. (Se descartó un rumor no verificado de
> "SOC for AI" de junio 2026 — fuente única no confiable, no usar.)
>
> **ISO/IEC 42001:** sin revisión en 2026 (sigue la edición 2023). Corrección importante: **NO es
> el estándar armonizado que da presunción de conformidad con el EU AI Act** — ese es
> **prEN 18286** (CEN-CENELEC JTC 21), en consulta pública desde 30-oct-2025, con cierre esperado
> a fines de 2026; su Anexo D mapea a los controles del Anexo A de ISO 42001. Agregar prEN 18286
> a "Fuentes de vanguardia" (abajo) como el estándar real a seguir para compliance UI.

### D. Table stakes enterprise 2026

| Capacidad | Propósito | Estado |
|---|---|---|
| WCAG 2.2 AA | focus-not-obscured, targets 24px, alternativas a drag | ✅ (axe wcag2a/aa/21aa/22aa: 0 violaciones en todas las stories; hit-areas 24px en Checkbox/Radio/Switch; auditor: `scripts/a11y-audit.mjs` (requiere playwright)) |
| Density modes | comfortable/compact (Spectrum-style) para tablas ops | ❌ |
| Theming white-label | ThemeProvider + tokens OKLCH re-brandeable | 🟡 (3 temas; falta guía white-label) |
| Data-viz tokens | Paleta categórica 3:1 sobre dark (Carbon-style), sequential + alert | ❌ |
| CommandPalette | Keyboard-first ops | ❌ |
| DataTable denso | Virtualizado, roving tabindex, saved views/FilterBar | ❌ |
| EmptyState/ErrorState/Skeleton triad | Estados vacío/error diseñados | 🟡 (Skeleton sí) |
| DateRangePicker + timezone | Rango con zona horaria visible | ❌ |
| i18n/RTL | Propiedades CSS lógicas, dirección tokenizada | ❌ |
| RBAC granular (Custom Roles) | Complementa `RBACMatrixViewer`: definición de roles con permisos finos por recurso | ❌ (Temporal Cloud lanzó "Custom Roles" en pre-release, 25-jun-2026 — referencia de patrón) |

> **WCAG:** 2.2 (oct-2023) sigue siendo la Recommendation vigente (ahora también ISO/IEC
> 40500:2025) — no existe "WCAG 2.3". WCAG 3.0 solo tiene Working Draft (03-mar-2026, modelo
> Bronze/Silver/Gold, Bronze≈2.2 AA) y el propio W3C dice que faltan "varios años" para
> Recommendation final — sin urgencia de rediseño todavía. Dato a vigilar a largo plazo: un issue
> abierto en w3c/wcag3 propone tratar a los agentes de IA autónomos como "usuarios" de WCAG 3
> (CAPTCHAs, barreras solo-JS) — no normativo aún, pero alineado con el rol de este design system.

## Prioridad de construcción (guía para el loop de 5h)

Reordenado 2026-07-02 (loop de construcción, iteración 7). `TraceTree`/`TokenCostMeter` — la
prioridad #1 anterior — ya están construidos (V001, ver Storybook `Agentic/Trace Tree` y
`Agentic/Token Cost Meter`), cerrando el principio #2 de credibilidad enterprise ("costo y tokens
son UI de primera clase") que no tenía ningún componente propio. Antes de eso el loop ya había
cerrado `AuditLogTable`/`WhoDidWhatTimeline` (commit `08256e9`), `ApprovalGateCard`/
`HumanInterruptQueue` (commit `5dd5964`), `NodeStatusBadge`/`RunTimeline` (commit `3b39be4`) y
`WCAG 2.2 AA` (commit `539e9db`). Con observabilidad de costo resuelta, `Rich Tool-UI` toma el
primer lugar — convergencia de 3 vendors (Vercel MCP Apps, Microsoft AG-UI, OpenAI ChatKit) sobre
una base que ya existe (`ToolCallCard`).

1. **Rich Tool-UI sobre ToolCallCard** (nueva prioridad #1) — MCP Apps/AG-UI Tool-based Generative
   UI es convergencia de 3 vendors (Vercel, Microsoft, OpenAI ChatKit); `ToolCallCard` ya tiene la
   base de key/value, falta soporte de contenido enriquecido por tipo de tool.
2. **ExecutionHistoryTable + RunInspector** — el wrapper enterprise sobre n8n (recordar: n8n no
   permite branding propio ni en su plan OEM — construir independiente, no como iframe de marca).
   Área A sigue en 13% de cobertura salvo `NodeStatusBadge`.
3. **AgentConsentCard (Know-Your-Agent)** — perfil de agente + alcance + consentimiento explícito
   antes de una acción sensible; ahora tiene una base natural en `ApprovalGateCard` para
   reutilizar (evidence pack + evidencia visual de tono/riesgo).
4. **EvidenceExportDialog + ApprovalChainStepper** — siguientes filas de área C ahora que
   `AuditLogTable`/`WhoDidWhatTimeline` sientan el vocabulario visual (actor dual, hash badge,
   tono) que estos dos componentes pueden reutilizar directamente.
5. **GuardrailIndicator + EvalScoreBadge** — `TraceTree` ya expone tono por span (ok/warn/block);
   estos dos ítems reutilizan ese mismo vocabulario para exponer policy checks y regresión de eval
   junto al costo, cerrando más filas del área B.
6. **DataTable denso + Density modes + CommandPalette** — table stakes ops.
7. Resto del catálogo, variante por industria (inmobiliaria, petróleo, software, finanzas, salud).
   Nota de investigación: inmobiliaria y petróleo/energía siguen sin patrones de UI de agentes-IA
   verificables en fuentes públicas 2026 — Studio DS puede ser pionero ahí en vez de seguir a
   alguien (ver `VANGUARD_REPORT.md`).

## Fuentes de vanguardia (el loop semanal las re-visita)

n8n docs (executions, error handling; el embed NO es white-label — confirmado 2026-07-02) ·
Temporal Web UI (Custom Roles, a11y de event history) · LangSmith/LangGraph (observability,
evals, Harbor) · OpenAI Agents SDK + ChatKit + guía "Guardrails and human review" (AgentKit/Agent
Builder se retira 30-nov-2026, ya no es fuente de canvas visual) · Anthropic Console / Claude
(Managed Agents streaming, Claude Code agents view) · Vercel AI SDK UI (v7, MCP Apps) ·
Microsoft AG-UI / Agent Framework (GA 1.0, CopilotKit como capa de UI) · IBM Carbon (data-viz,
dashboards, density) · Adobe Spectrum / React Spectrum S2 (density, tablas) · EU AI Act (Art.
12/13 logging, Art. 19 retención — vigilar publicación del Digital Omnibus en EUR-Lex) ·
SOC2 CC7/CC8 (sin TSC de IA formal aún) · ISO/IEC 42001 + **prEN 18286** (el estándar armonizado
real para presunción de conformidad EU AI Act) · WCAG 2.2 AA (vigente; WCAG 3.0 aún a años de
Recommendation).
