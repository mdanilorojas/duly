# NORTH STAR — Studio DS: sistema operativo visual para agentes de IA en la empresa

> Documento vivo. Define qué significa "increíble para corporaciones" en este design system:
> interfaces de orquestación de agentes, automatización de procesos con n8n, y auditoría/compliance.
> El loop semanal de vanguardia re-verifica este documento contra el estado del arte y contra el
> inventario real de componentes, y mantiene la tabla de gaps al día.
> Última revisión: 2026-07-06 · Próxima: semanal (routine cloud "vanguard check").

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
| ExecutionHistoryTable | Lista virtualizada: status dot, workflow, modo trigger, duración, retry | ✅ (V001, Storybook `Agentic/Execution History/V001 n8n-style Runs` — remontada sobre el `DataTable` denso (rung 6.1) sin cambiar su API pública; ahora virtualiza filas de verdad con `@tanstack/react-virtual`) |
| RunInspector | Replay read-only por nodo con input/output y marcador "falló aquí" | ✅ (V001, mismo Storybook — panes Input/Output por nodo, banner "Failed here" auto-expandido en el nodo que falló) |
| NodeStatusBadge | success/error/running/waiting/skipped/retrying (anillo dashed animado) | ✅ (V001) |
| RetryControls | Retry-desde-inicio vs desde-nodo-fallido, contador de intentos | ✅ (V001, Storybook `Agentic/Retry Controls/V001 Start vs Failed Node` — anclado directamente al marcador "Failed here" de `RunInspector` vía `node.retry`, historial que distingue reintentos automáticos de manuales) |
| CredentialCard/Picker | Credencial: tipo, owner, last-used, compartida-con, health | ✅ (V001, Storybook `Agentic/Credential Card/V001 Type Owner Health` — salud no binaria valid/expiring/expired/revoked, listbox accesible con filtro por nombre/owner/tipo) |
| SubworkflowChip | Referencia expandible/deep-link a ejecución hija | ✅ (V001, Storybook `Agentic/Subworkflow Chip/V001 Child Execution Reference` — pill con `NodeStatusBadge` + botón deep-link + caret que expande un resumen inline sin navegar; wireado en `RunInspector` vía `node.subworkflow` sobre un nodo "Execute Workflow", con demo integrada en `ExecutionHistoryConsole` saltando de `exec_8f21a0` a `exec_9931aa`) |
| ErrorWorkflowBanner | "Este fallo se enrutó al error handler X" con cross-link | ✅ (V001, Storybook `Agentic/Error Workflow Banner/V001 Routed to Handler` — banner tono `warn` (no `block`: el fallo ya fue capturado y ruteado) con `NodeStatusBadge` del handler + cross-link; wireado como `RunInspector.errorHandler`, con demo integrada saltando de `exec_a10f55` a `exec_5e01f0`) |
| WorkflowCanvasFrame | Contenedor temado para embeber el editor n8n (zoom, fit, read-only) | ❌ |

> **Nota 2026-07-02**: n8n confirma que su plan OEM **no ofrece white-label completo** — el
> branding de n8n permanece visible en el editor incluso pagando por RBAC/SSO/audit-logging
> (fuente: n8n.io/oem/). `WorkflowCanvasFrame` no debe asumirse como "iframe rebrandeable del
> editor n8n" — hay que diseñarlo como reconstrucción propia de la vista de ejecución, no como
> wrapper de marca ajena.

### B. Agent ops / consola de IA

| Componente | Propósito | Estado |
|---|---|---|
| TraceTree / SpanRow | Spans anidados (LLM/tool/agente/retrieval) con duración, tokens y costo por span | ✅ (V001, Storybook `Agentic/Trace Tree` — árbol colapsable con waterfall de tiempo y rollup de costo/tokens por rama; extendido en iteración 13 con `guardrails`/`evalScore` opcionales por span; gana adaptador `otel-trace-adapter.ts` que mapea spans a atributos `gen_ai.*` de OTel GenAI + soporta `traceId` cross-agent) |
| ApprovalGateCard | Evidence pack: qué/por qué/blast-radius/rollback + approve/reject/escalate + timeout | ✅ (V001, Storybook `Agentic/Approval Gate` — 4 estados de resolución: approved/rejected/escalated/expired, mobile-first) |
| HumanInterruptQueue | Inbox de runs pausados esperando revisión, ordenado por riesgo/edad; debe funcionar también en mobile (ver nota) | ✅ (V001, Storybook `Agentic/Human Interrupt Queue` — ordena por tono de riesgo y luego edad, filas expandibles a `ApprovalGateCard`) |
| AgentConsentCard (Know-Your-Agent) | Perfil de agente + alcance + consentimiento explícito antes de una acción sensible | ✅ (V001, Storybook `Agentic/Agent Consent/V001 Know Your Agent` — perfil con `AgentCore`, alcance con checkbox por permiso, límites configurables, 4 estados de resolución pending/consented/declined/revoked) |
| RunTimeline | Timeline estilo Temporal con estados vivos (dashed/solid/color) | ✅ (V001, Storybook `Agentic/Run Timeline` — construido sobre la gramática de 6 estados de `NodeStatusBadge`) |
| TokenCostMeter | Costo por run y agregado (modelo vs tools vs retrieval), umbrales de presupuesto | ✅ (V001, Storybook `Agentic/Token Cost Meter` — desglose por categoría + barra de presupuesto con umbral ok/warn/block) |
| GuardrailIndicator | Pill passed/warned/blocked, expandible a la política que disparó | ✅ (V001, Storybook `Agentic/Guardrail Indicator/V001 Policy Checks` — pill resumen con tono = peor de la lista, expande a políticas input/output/tool con rationale; `GuardrailChip` para uso inline denso) |
| EvalScoreBadge + Sparkline | Score vs umbral, flechas de regresión | ✅ (V001, Storybook `Agentic/Eval Score Badge/V001 Score vs Threshold` — score vs umbral con tono ok/warn/block, flecha de regresión vs run anterior y sparkline de tendencia con línea de umbral) |
| AgentHandoffMarker | Punto visual de transferencia agente↔agente o agente→humano | ❌ (sigue sin construir pese a haber sido marcada prioridad #1 en la iteración 15 del loop de construcción — el ladder de 19 unidades del §07 la reemplazó por otro orden de trabajo; ver "Prioridad de construcción") |
| StreamingMessage / ThinkingIndicator | Stream de tokens con chips de tool-call inline | ✅ (V001, Storybook `Agentic/Streaming Message` — conforma ~16 tipos de evento del protocolo AG-UI (`event_start`/`event_delta`/tool-call inline), construido desde cero contra el estándar en vez de un formato propio) |
| Rich Tool-UI (tool-based generative UI) | UI enriquecida por tipo de tool dentro de un tool-call, no solo texto/JSON | ✅ (V002, Storybook `Agentic/Tool Call Card/V002 Rich Tool-UI` — `RichToolCallCard` con 6 tipos de bloque: table/diff/citations/confirm/metrics/code; gana modo aditivo `variant="mcp-app"` que delega en `MCPAppsWidgetFrame` en vez de un renderer propio) |
| MCPAppsWidgetFrame | Host temado del sandbox iframe/postMessage estándar MCP Apps (ratificado 2026-01-26) para renderizar el recurso de UI de un tool MCP | ✅ (Storybook `Agentic/MCP Apps Widget Frame` — envuelve el `AppRenderer` real de `@mcp-ui/client`, no un mock; carga diferida vía `React.lazy`) |
| AgentTopologyGraph | Grafo vivo de la flota de agentes (React Flow): nodos con `NodeStatus`/costo/tokens, edges animados en hops activos | ✅ (Storybook `Agentic/Agent Topology Graph` — nodo custom reusa `NodeStatusBadge`; fallback `role="list"` navegable por teclado para el canvas) |
| SwarmControlBar | Pausar/reanudar/cancelar el enjambre o una cohorte filtrada (broadcast), cancel con confirm inline | ✅ (Storybook `Agentic/Swarm Control Bar` — reusa el patrón de confirmación de `ApprovalGateCard`) |
| BudgetCapGovernor | Cap de gasto por agente/workflow con burn-down vs cap y auto-halt visual al 100% (FinOps) | ✅ (Storybook `Agentic/Budget Cap Governor` — reusa la gramática de umbral ok/warn/block de `TokenCostMeter`) |
| A2AAgentCardViewer | Viewer del discovery doc de un agente vía protocolo A2A (Agent Card JSON: skills, auth, endpoints) | ✅ (Storybook `Agentic/A2A Agent Card Viewer`; `AgentCard` interno renombrado a `AgentTile` en el mismo commit para liberar el nombre) |
| CheckpointBadge | "Estado persistido aquí; reanudable" | ❌ |
| AgentAnomalyIndicator (Behavioral Deviation Flag) | Flag cuando un agente se desvía de su baseline de comportamiento (volumen, scope de datos, tablas/joins inusuales) | ❌ — nueva fila 2026-07-06: FINRA clasifica a los agentes de IA como categoría de riesgo de supervisión propia y recomienda "behavioral baselining" (desviación automática vs patrón aprendido) como control explícito para servicios financieros; sin componente hoy — ver "Prioridad de construcción". Fuente: fin.ai/learn/evaluate-ai-agent-compliance-financial-services, jul-2026. |
| AgentCore/Card/Gallery (identidad) | Orbs WebGL con identidad por agente | ✅ (V001, Storybook `Agentic/Agent Gallery`; presentación interna renombrada `AgentCard` → `AgentTile`) |
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
| AuditLogTable | Stream inmutable: actor (humano/agente/sistema), acción, recurso, hash badge | ✅ (V001, Storybook `Agentic/Audit Log Table` — actor con icono+anillo dual, hash badge de inmutabilidad; remontada sobre el `DataTable` denso (rung 6.1) sin cambiar su API pública, ahora virtualiza) |
| WhoDidWhatTimeline | Feed cronológico filtrable con saved-query chips | ✅ (V001, Storybook `Agentic/Who Did What Timeline` — grupos cronológicos + chips de consulta guardada con conteo, autoservicio del auditor) |
| EvidenceExportDialog | Export firmado (PDF/CSV/JSON) de un rango filtrado con manifiesto de hashes | ✅ (V001, Storybook `Agentic/Evidence Export/V001 Signed Manifest` — diálogo con selector de formato, preview del manifiesto de hashes vía `HashBadge`, y confirmación con hash del manifiesto firmado) |
| ApprovalChainStepper | Quién aprobó qué, cuándo, en qué orden, con ramas de rechazo | ✅ (V001, Storybook `Agentic/Approval Chain/V001 Multi-Level Sign-Off` — stepper vertical con actor dual + hash badge por paso, rama punteada para rechazos re-enrutados) |
| ModelProvenanceCard | Modelo, versión, prompt version, config hash por run | ✅ (V001, Storybook `Agentic/Model Provenance/V001 Model, Prompt, Config Hash` — chips de modelo y prompt version con la misma jerarquía visual que un guardrail, `HashBadge` de config reutilizado de `EvidenceExportDialog`/`AuditLogTable`, chip de drift explícito cuando el config hash cambia entre runs del mismo prompt; `ModelProvenanceChip` inline para el principio #8, "chip en cada output de IA") |
| RBACMatrixViewer | Grid roles×permisos + "por qué este usuario tiene acceso" | ❌ |
| DataLineageGraph | Origen→transformación→salida a nivel de campo | ❌ |
| ChangeRecordCard | Cambio CC8.1: autor, reviewer, diff, rollback link | ❌ |
| IncidentView | Timeline de incidente: run disparador, recursos afectados, remediación | ❌ |
| RetentionBadge / ImmutabilityIndicator | Señal de confianza "WORM, retenido 6+ meses" | ✅ (V001, Storybook `Agentic/Retention Badge/V001 WORM & Immutability` — `RetentionBadge` pill compacto (protected/eligible-for-deletion/hold) + `ImmutabilityIndicator` expandible con base legal, progreso de ventana mínima y hash del registro; separado explícitamente de `AuditLogTable`/`ModelProvenanceCard` (Art. 12/13) como obligación distinta (Art. 19)) |
| VendorRiskCard (LLM vendor risk assessment) | Evaluación de riesgo por proveedor de LLM de terceros: modelo, contrato de datos, certificaciones, última revisión | ❌ — nueva fila 2026-07-06: auditores SOC2 2026 piden explícitamente "vendor risk assessment por cada LLM de terceros invocado" como evidencia AI-specific mapeada a CC6/CC7; sin componente hoy, aunque `ModelProvenanceCard` ya cubre el "qué modelo" a nivel de run. Fuente: soc2auditors.org/insights/soc-2-for-ai-companies, jul-2026. |

> **Señal regulatoria (actualizado 2026-07-06) — EU AI Act:** el "Digital Omnibus on AI" completó
> todo el proceso legislativo: Parlamento (16-jun-2026) y **luz verde final del Consejo
> (29-jun-2026)** — el comunicado oficial del Consejo dice textualmente que el acto "se publicará
> en breve" en el Diario Oficial y entra en vigor al tercer día de esa publicación. **A esta fecha
> (2026-07-06) sigue sin confirmarse la publicación en EUR-Lex** — el contenido no cambió respecto
> al 2026-07-02, pero la confianza en las nuevas fechas subió de "podría retrasar" a "confirmado
> políticamente, solo falta el trámite de publicación": Anexo III (alto riesgo standalone)
> **2-ago-2026 → 2-dic-2027**; Anexo I (embebido) **2-ago-2027 → 2-ago-2028**. Novedad no vista la
> semana pasada: el paquete también **recorta el período de gracia de watermarking/transparencia
> de contenido generado por IA de 6 a 3 meses** — nuevo deadline **2-dic-2026** — y agrega una
> prohibición nueva sobre imágenes íntimas no consentidas/CSAM generadas por IA (no aplica
> directamente al catálogo de este DS, pero confirma que el paquete sigue siendo sustantivo, no solo
> un retraso de fechas). El watermarking/transparencia de contenido de IA es exactamente el trabajo
> que ya hace `ModelProvenanceChip` (principio #8) — mantenerlo como respuesta directa a este
> artículo en cualquier copy futuro. Fuentes: Consilium (comunicado oficial, 29-jun-2026), Gibson
> Dunn, ComplianceHub.Wiki (jul-2026). Seguir monitoreando eur-lex.europa.eu.
> Detalle útil de diseño: la retención mínima de logs (6 meses) vive en el **Art. 19**, no en el
> Art. 12 (que solo exige la capacidad técnica de logging) — separar `RetentionBadge` (Art. 19) de
> `AuditLogTable`/`ModelProvenanceCard` (Art. 12/13) en cualquier implementación futura.
>
> **SOC2/AICPA:** sin actualización formal de Trust Services Criteria para IA (confirma el estado
> del 2026-07-02); el framework sigue siendo TSP Section 100 (2017, puntos de foco revisados 2022).
> Novedad útil de esta semana: reportes de auditores 2026 describen qué evidencia AI-specific piden
> en la práctica, mapeada de forma interpretativa a CC6/CC7/CC8 — linaje de modelo (dataset+código+
> aprobación de un modelo desplegado), logs de prompt/inferencia con redacción de PII previa al
> logging, salida de monitoreo de drift, y **vendor risk assessment por cada LLM de terceros** — el
> último ítem no tiene componente hoy (ver nueva fila `VendorRiskCard` arriba). (Se sigue
> descartando el rumor no verificado de "SOC for AI" de junio 2026 — fuente única no confiable.)
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
| Density modes | comfortable/compact (Spectrum-style) para tablas ops | 🟡 (el `DataTable` denso soporta `density: "comfortable"\|"compact"` internamente; falta el modo a nivel de sitio/tema fuera de esa tabla) |
| Theming white-label | ThemeProvider + tokens OKLCH re-brandeable | 🟡 (3 temas; falta guía white-label) |
| Data-viz tokens | Paleta categórica 3:1 sobre dark (Carbon-style), sequential + alert | ❌ |
| CommandPalette | Keyboard-first ops | ❌ (dependencia ya decidida en el spec de ladder — `cmdk`, la misma que usa shadcn — pero aún no construido) |
| DataTable denso | Virtualizado, roving tabindex, saved views/FilterBar | ✅ (rung 1 del ladder: `@tanstack/react-table` + `@tanstack/react-virtual`, roving tabindex ↑/↓/Home/End/PageUp/PageDown, `FilterBar` + `SavedViews`/`useSavedViews` (persistencia en `localStorage`, feature de compliance del principio #10); `AuditLogTable`/`ExecutionHistoryTable` ya remontadas encima sin cambiar su API) |
| EmptyState/ErrorState/Skeleton triad | Estados vacío/error diseñados | 🟡 (Skeleton ya existía; `DataTable` ahora trae un slot `emptyState` con default — sigue faltando un `ErrorState` standalone reutilizable fuera de tabla) |
| DateRangePicker + timezone | Rango con zona horaria visible | ❌ (dependencia ya decidida — `react-aria-components`, a11y de fechas — pero aún no construido) |
| i18n/RTL | Propiedades CSS lógicas, dirección tokenizada | ❌ |
| RBAC granular (Custom Roles) | Complementa `RBACMatrixViewer`: definición de roles con permisos finos por recurso | ❌ (Temporal Cloud sigue con "Custom Roles" en pre-release desde 25-jun-2026, sin novedad esta semana — referencia de patrón) |

> **WCAG:** 2.2 (oct-2023) sigue siendo la Recommendation vigente (ahora también ISO/IEC
> 40500:2025) — no existe "WCAG 2.3". WCAG 3.0 sigue en Working Draft (última versión 03-mar-2026,
> ~174 requisitos reorganizados por outcome, modelo de score Bronze/Silver/Gold — Bronze≈2.2 AA);
> el propio W3C mantiene el calendario de drafts cada 6 meses (próximo ~sep-2026), Candidate
> Recommendation estimado Q4-2027 y Recommendation final no antes de 2028 — sin novedad esta semana,
> sin urgencia de rediseño todavía. Dato a vigilar a largo plazo: un issue abierto en w3c/wcag3
> propone tratar a los agentes de IA autónomos como "usuarios" de WCAG 3 (CAPTCHAs, barreras
> solo-JS) — no normativo aún, pero alineado con el rol de este design system.

### E. Comercial / RevOps (área nueva, añadida 2026-07-06 — cubre software y servicios financieros)

> El ladder §07 (rung 4) construyó una vertical comercial completa que el catálogo original no
> tenía como área propia. Se documenta aquí en vez de solo en "prioridad de construcción" porque
> ya está 100% construida — el loop semanal debe verificarla igual que A/B/C/D de ahora en más.

| Componente | Propósito | Estado |
|---|---|---|
| ForecastRollupTable | Roll-up jerárquico rep→manager→exec (commit/best-case/pipeline) con delta submitted-vs-current | ✅ (Storybook `Commercial/Forecast Rollup Table` — sobre `DataTable` con `getSubRows`, delta con flecha de tono) |
| RatioGauge | Medidor de ratio compartido (quota attainment, pipeline coverage) | ✅ (Storybook `Commercial/Ratio Gauge` — primitiva reusada por `AssetHealthGauge` en área F) |
| PipelineWaterfallChart / MRRMovementWaterfall | Waterfall de cambio período-a-período (pipeline y MRR) | ✅ (Storybook `Commercial/Pipeline Waterfall Chart`, `Commercial/MRR Movement Waterfall` — ambos sobre `ChartFrame`, wrapper recharts temado común) |
| MutualActionPlanBoard | Plan de hitos comprador/vendedor con owners, due, dependencias, estado | ✅ (Storybook `Commercial/Mutual Action Plan Board`) |
| RelationshipMap | Org-chart de stakeholders (champion/economic-buyer/blocker) con influencia | ✅ (Storybook `Commercial/Relationship Map` — React Flow, reusa infra de `AgentTopologyGraph`) |
| PricingApprovalMatrix | Ruteo de aprobación por umbral de descuento/margen con audit trail | ✅ (Storybook `Commercial/Pricing Approval Matrix` — reusa `ApprovalChainStepper` para la cadena) |

### F. Industrial / OT — disciplina ISA-101 (área nueva, añadida 2026-07-06 — cubre petróleo & energía)

> Misma nota que área E: el ladder §07 (rung 5) construyó la primera vertical de petróleo/energía
> del catálogo — la industria que semanas anteriores de este reporte señalaban sin ningún patrón
> de UI de agentes-IA verificable en fuentes públicas. Regla obligatoria del área (ISA-101): base
> grayscale, color saturado SOLO en estado anormal/accionable, severidad nunca solo por color.

| Componente | Propósito | Estado |
|---|---|---|
| AlarmChip / PriorityBadge | Prioridad×estado (Critical/High/Med/Low × Active/Ack/RTN), colorblind-safe (ISA-18.2) | ✅ (Storybook `Industrial/Alarm Chip` — primitiva base reusada por Banner y Table) |
| AlarmBanner | Strip persistente con la alarma no-reconocida de mayor prioridad + conteo + ack | ✅ (Storybook `Industrial/Alarm Banner` — silencioso/grayscale cuando no hay alarmas) |
| AlarmSummaryTable | Lista de alarmas activas ordenable por prioridad/tiempo, ack/shelve por fila | ✅ (Storybook `Industrial/Alarm Summary Table` — sobre `DataTable`, virtualiza en flood) |
| ProcessValueTile | Valor de proceso + barra analógica + desviación de setpoint (tile HMI) | ✅ (Storybook `Industrial/Process Value Tile` — color solo fuera de límite) |
| AssetHealthGauge | Índice de salud 0–100 con bandas healthy/watch/critical + tendencia | ✅ (Storybook `Industrial/Asset Health Gauge` — sobre `RatioGauge`) |
| OEEWaterfall | Waterfall planned→availability→performance→quality→OEE (ISO 22400) | ✅ (Storybook `Industrial/OEE Waterfall` — sobre `ChartFrame`) |
| AutonomyModeSwitch | Selector de nivel de autonomía Manual→Advisory→Supervised→Full-Auto (válvula maestra de agencia) | ✅ (Storybook `Industrial/Autonomy Mode Switch` — subir a Full-Auto pide confirmación, patrón `ApprovalGateCard`) |

## Prioridad de construcción (guía para el loop de 5h)

Reordenado 2026-07-06 (vanguard check). El ladder §07 de 19 unidades (`docs/superpowers/specs/
2026-07-03-build-ladder-batch-design.md`) se ejecutó **completo** entre el 2026-07-03 y el
2026-07-04 (commits `c7bba09`…`e87de67`, "ladder unit 1/19" a "unit 28"): rung 1 (`DataTable`
denso + `FilterBar` + `SavedViews`), rung 2 (`AgentTopologyGraph`, `SwarmControlBar`,
`BudgetCapGovernor`), rung 3 (`EvidenceExportDialog`, `ApprovalChainStepper`,
`ModelProvenanceCard`), rung 4 (área E comercial completa, 7 componentes), rung 5 (área F
industrial completa, 7 componentes) y rung 6 (`AuditLogTable`/`ExecutionHistoryTable` remontadas
sobre `DataTable`, fix de portabilidad de `a11y-audit.mjs`, `AgentCard→AgentTile` + 
`A2AAgentCardViewer`, `RichToolCallCard` modo MCP Apps, `StreamingMessage` nuevo sobre AG-UI,
`TraceTree` con adaptador OTel GenAI). Esto cierra prácticamente todo lo que este documento
señalaba como prioridad en la revisión anterior (2026-07-02/04) — **excepto**
`AgentHandoffMarker`/`CheckpointBadge`, que quedaron marcadas prioridad #1 en la iteración 15 de
`AGENTIC_EXPERIMENTS_LOG.md` pero el ladder tomó otro orden de trabajo y no las construyó; siguen
❌ hoy. Con las áreas E y F nuevas, el catálogo pasó de 43 a ~59 filas — la cobertura porcentual
baja aunque el volumen construido subió, ver `VANGUARD_REPORT.md`.

1. **AgentHandoffMarker + CheckpointBadge** (se mantiene como prioridad #1, arrastrada de la
   iteración 15 sin cerrar) — marcadores puntuales sobre timelines/trees ya existentes
   (`RunTimeline`, `TraceTree`, `ExecutionTimeline`) en vez de componentes nuevos desde cero; bajo
   esfuerzo, cierra las 2 últimas filas fáciles de área B.
2. **RBACMatrixViewer** — área C: `ModelProvenanceCard` ya distingue provider/modelo con chips
   propios y `ApprovalChainStepper` ya tiene el vocabulario de actor humano/agente/sistema; base
   directa para "por qué este usuario tiene acceso" (grid roles×permisos). Temporal Cloud sigue
   con "Custom Roles" en pre-release como referencia de patrón (sin cambio esta semana).
3. **CommandPalette + Density modes sitewide + DateRangePicker** — con `DataTable` (rung 1) ya
   cerrado, esta es la secuencia natural de table stakes restante; las dependencias ya están
   decididas en el spec del ladder (`cmdk`, `react-aria-components`) — falta solo construir.
4. **AgentAnomalyIndicator (Behavioral Deviation Flag)** — nueva prioridad esta semana: FINRA
   formalizó a los agentes de IA como categoría de riesgo de supervisión propia y nombra
   explícitamente "behavioral baselining" (desviación automática de un patrón aprendido) como
   control esperado en servicios financieros — reusa el vocabulario de `Tone`/`NodeStatus` ya
   existente, no requiere framework nuevo. Ver fila nueva en área B.
5. **VendorRiskCard** — nueva prioridad esta semana: evidencia AI-specific que auditores SOC2 2026
   piden explícitamente ("vendor risk assessment por cada LLM de terceros"), sin componente hoy;
   complementa a `ModelProvenanceCard` (que cubre el modelo por *run*, no el riesgo del *proveedor*
   como entidad). Ver fila nueva en área C.
6. **WorkflowCanvasFrame** — última fila de área A; requiere diseño propio de la vista de
   ejecución (n8n no ofrece white-label ni en su plan OEM) — mayor esfuerzo que el resto del
   catálogo restante, por eso sigue baja en la lista pese a cerrar el área por completo.
7. **Vertical de salud** — a diferencia de comercial (área E) e industrial (área F), que ya tienen
   verticales completas construidas esta semana, salud sigue sin ninguna propia. `AgentConsentCard`
   y `ModelProvenanceCard/UnchangedConfig` (iteración 14) ya dejaron mock data de resumen clínico
   reutilizable como semilla — sigue siendo la oportunidad de pionero más clara del catálogo (ver
   hallazgo de "Explainability on Demand"/evidence panel de esta semana en `VANGUARD_REPORT.md`).
8. Resto del catálogo: `DataLineageGraph`, `ChangeRecordCard`, `IncidentView` (área C), i18n/RTL,
   Data-viz tokens, `ErrorState` standalone (área D), variante de inmobiliaria más allá de
   `PropertyIntelligenceConsole` (patrón nuevo esta semana: Rex CRM 2026 separa el asistente en
   roles — AI Admin/Prospecting/Nurture/Manage — en vez de un agente monolítico; semilla de diseño
   para una futura evolución de `AgentGallery`/`AgentTopologyGraph` con roster etiquetado por rol).

## Fuentes de vanguardia (el loop semanal las re-visita)

n8n docs (executions, error handling; el embed NO es white-label — reconfirmado 2026-07-06, sin
cambios) · Temporal Web UI (Custom Roles sigue en pre-release, sin novedad esta semana) ·
LangSmith/LangGraph (OTel nativo end-to-end, evaluadores no-code en UI, cada agente expone su
propio endpoint MCP; LangGraph Platform renombrado LangSmith Deployment/Studio) · OpenAI Agents
SDK + ChatKit (ambos ya GA) + guía "Guardrails and human review" (AgentKit/Agent Builder se retira
30-nov-2026, ya no es fuente de canvas visual; sin novedad de changelog esta semana) · Anthropic
Console / Claude (Managed Agents streaming, Claude Sonnet 5 ya en producción; sin patrón nuevo de
UI esta semana) · Vercel AI SDK UI (v7 ya GA; solo parches de bugfix esta semana, sin patrón
nuevo) · Microsoft AG-UI / Agent Framework (GA 1.0, CopilotKit como capa de UI; sin novedad
verificable esta semana) · IBM Carbon (v11.111.0, 1-jul-2026 — solo íconos/pictogramas + fixes de
a11y, sin patrón de densidad/data-viz nuevo) · Adobe Spectrum / React Spectrum S2 (release más
reciente 18-jun-2026, nada en julio aún) · EU AI Act (Art. 12/13 logging, Art. 19 retención,
Digital Omnibus con luz verde política completa desde 29-jun-2026 pero aún sin fecha de
publicación confirmada en EUR-Lex — vigilar) · SOC2 CC7/CC8 (sin TSC de IA formal; evidencia
AI-specific de facto: linaje de modelo, logs con PII redactada, drift, vendor risk assessment) ·
ISO/IEC 42001 + **prEN 18286** (el estándar armonizado real para presunción de conformidad EU AI
Act) · WCAG 2.2 AA (vigente; WCAG 3.0 Working Draft de mar-2026 sigue siendo el más reciente,
próximo esperado ~sep-2026) · FINRA (nueva fuente 2026-07-06 — clasifica agentes de IA como
categoría de riesgo de supervisión propia en servicios financieros, "behavioral baselining").
