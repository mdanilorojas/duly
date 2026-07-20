# NORTH STAR — Duly: sistema operativo visual para agentes de IA en la empresa

> Documento vivo. Define qué significa "increíble para corporaciones" en este design system:
> interfaces de orquestación de agentes, automatización de procesos con n8n, y auditoría/compliance.
> El loop semanal de vanguardia re-verifica este documento contra el estado del arte y contra el
> inventario real de componentes, y mantiene la tabla de gaps al día.
> Última revisión: 2026-07-20 · Próxima: semanal (routine cloud "vanguard check").

## Visión

Una corporación que implementa agentes de IA (con n8n u orquestación propia) debe poder construir
con Duly una consola que su CISO, su auditor y su operador de proceso encuentren **creíble,
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
| AgentHandoffMarker | Punto visual de transferencia agente↔agente o agente→humano | ❌ (arrastra 2 semanas sin cerrar: marcada prioridad #1 desde la iteración 15 del loop de construcción; el ladder §07 y la semana de calidad/i18n/rebrand recién cerrada tomaron otro orden de trabajo. Ver "Prioridad de construcción") |
| StreamingMessage / ThinkingIndicator | Stream de tokens con chips de tool-call inline | ✅ (V001, Storybook `Agentic/Streaming Message` — conforma ~16 tipos de evento del protocolo AG-UI (`event_start`/`event_delta`/tool-call inline), construido desde cero contra el estándar en vez de un formato propio) |
| Rich Tool-UI (tool-based generative UI) | UI enriquecida por tipo de tool dentro de un tool-call, no solo texto/JSON | ✅ (V002, Storybook `Agentic/Tool Call Card/V002 Rich Tool-UI` — `RichToolCallCard` con 6 tipos de bloque: table/diff/citations/confirm/metrics/code; gana modo aditivo `variant="mcp-app"` que delega en `MCPAppsWidgetFrame` en vez de un renderer propio) |
| MCPAppsWidgetFrame | Host temado del sandbox iframe/postMessage estándar MCP Apps (ratificado 2026-01-26) para renderizar el recurso de UI de un tool MCP | ✅ (Storybook `Agentic/MCP Apps Widget Frame` — envuelve el `AppRenderer` real de `@mcp-ui/client`, no un mock; carga diferida vía `React.lazy`) |
| AgentTopologyGraph | Grafo vivo de la flota de agentes (React Flow): nodos con `NodeStatus`/costo/tokens, edges animados en hops activos | ✅ (Storybook `Agentic/Agent Topology Graph` — nodo custom reusa `NodeStatusBadge`; fallback `role="list"` navegable por teclado para el canvas) |
| SwarmControlBar | Pausar/reanudar/cancelar el enjambre o una cohorte filtrada (broadcast), cancel con confirm inline | ✅ (Storybook `Agentic/Swarm Control Bar` — reusa el patrón de confirmación de `ApprovalGateCard`) |
| BudgetCapGovernor | Cap de gasto por agente/workflow con burn-down vs cap y auto-halt visual al 100% (FinOps) | ✅ (Storybook `Agentic/Budget Cap Governor` — reusa la gramática de umbral ok/warn/block de `TokenCostMeter`) |
| A2AAgentCardViewer | Viewer del discovery doc de un agente vía protocolo A2A (Agent Card JSON: skills, auth, endpoints) | ✅ (Storybook `Agentic/A2A Agent Card Viewer`; `AgentCard` interno renombrado a `AgentTile` en el mismo commit para liberar el nombre) |
| CheckpointBadge | "Estado persistido aquí; reanudable" | ❌ |
| ToolIntegrityIndicator (tool-definition drift) | Señal cuando la definición de una tool cambió desde que un agente/humano la aprobó por última vez ("rug pull" de MCP) | ❌ — nueva fila 2026-07-13: Vercel AI SDK 7.0.19 (9-jul-2026) shippeó `fingerprintTools`/`detectToolDrift` a nivel de SDK para detectar tools MCP que mutan su definición después de ser confiadas; la literatura de seguridad MCP de 2026 (tool poisoning / rug-pull) recomienda hacer visible en UI cuándo una tool cambió tras su aprobación — sin componente hoy. Candidato natural: extensión de `GuardrailIndicator` o pill nueva junto a `RichToolCallCard`/`CredentialCard`. Fuente: Vercel AI SDK changelog (`ai@7.0.19`), policylayer.com/attacks/mcp-rug-pull. |
| AgentAnomalyIndicator (Behavioral Deviation Flag) | Flag cuando un agente se desvía de su baseline de comportamiento (volumen, scope de datos, tablas/joins inusuales) | ❌ — nueva fila 2026-07-06: FINRA clasifica a los agentes de IA como categoría de riesgo de supervisión propia y recomienda "behavioral baselining" (desviación automática vs patrón aprendido) como control explícito para servicios financieros; sin componente hoy — ver "Prioridad de construcción". Fuente: fin.ai/learn/evaluate-ai-agent-compliance-financial-services, jul-2026. |
| AgentPlanPreview (planning visibility) | Secuencia de acciones que el agente PIENSA ejecutar, mostrada ANTES de correr, con editar/saltar por paso | ❌ — nueva fila 2026-07-20: fuentes de UX de agentes 2026 tratan "planning visibility" (ver la secuencia de acciones intencionada antes de que empiece la ejecución) como uno de 5 patrones que aplican a todo agente enterprise, distinto de aprobar una acción puntual (`ApprovalGateCard`) o consentir alcance (`AgentConsentCard`): es el plan completo de N pasos por adelantado. `RunTimeline`/`ExecutionTimeline` muestran pasos durante/después, no un preview pre-ejecución editable. Candidato de bajo-medio esfuerzo reusando la gramática de pasos existente. Fuente: fuselabcreative.com/ui-design-for-ai-agents ("five patterns… planning visibility"), jul-2026. |
| AgentCore/Card/Gallery (identidad) | Orbs WebGL con identidad por agente | ✅ (V001, Storybook `Agentic/Agent Gallery`; presentación interna renombrada `AgentCard` → `AgentTile`. Reorganizada 2026-07-12 en 4 galerías sectoriales de 24 agentes — Legal & Compliance, Petroleum & Energy, Software & Networks, Industrial & Logistics — portadas de una segunda referencia HTML del usuario, con un solo contexto WebGL compartido entre instancias por performance. Nota: "Legal & Compliance" e "Industrial & Logistics" no son 2 de las 5 industrias objetivo de este DS (inmobiliaria/petróleo/software/servicios-financieros/salud) — es reorganización de identidad visual del laboratorio agentic, no una vertical de negocio nueva tipo áreas E/F; no confundir con prioridad de "vertical de salud" que sigue pendiente) |
| AgentMetric / AgentStatusMatrix | Tiles de métrica y matriz de estatus con tonos semánticos | ✅ (V002, Storybook `Agentic/Agent Status Matrix/V002 Compact Heatmap` — modo `density="compact"` heatmap, flag `critical`, handler `onSelectItem`) |
| ExecutionTimeline / RunStep / ToolCallCard | Timeline vertical de un run multi-agente, paso a paso, con detalle expandible | ✅ (V001, Storybook `Agentic/Execution Timeline`) |
| ConnectorStatus | Estado de salud de fuentes de ingesta (SourceConnector) | ✅ (V001, Storybook `Agentic/Connector Status/V001 Ingestion Sources`) |

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
| BandGauge | Veredicto de banda discreta (readiness ISO 1–6, madurez, cualquier score de N escalones) | ✅ (V001, Storybook `Compliance/Band Gauge/V001 Discrete Bands`) |
| DeltaList | Diff antes→después entre corridas (diffRuns, qué área subió) | ✅ (V001, Storybook `Compliance/Delta List/V001 Run Diff`) |

> **Señal regulatoria (RESUELTA 2026-07-20) — EU AI Act Digital Omnibus:** cerró la incertidumbre
> que este documento arrastraba desde el 2026-07-06. Cronología ahora completa: Parlamento adoptó
> **16-jun-2026**, Consejo aprobación final **29-jun-2026**, **acto final FIRMADO 8-jul-2026** — el
> Digital Omnibus entra en vigor al **tercer día tras su publicación en el Diario Oficial** (ya
> firmado, publicación inminente; la "ventana agotándose" de la semana pasada dejó de ser un riesgo).
> Efecto neto: la fecha de aplicación de alto-riesgo **2-ago-2026 queda oficialmente diferida**. Fechas
> objetivo confirmadas: Anexo III (alto riesgo standalone) **→ 2-dic-2027**; sistemas embebidos en
> productos ya regulados **→ 2-ago-2028**; watermarking/transparencia de contenido IA **2-dic-2026**
> (trabajo que ya cubre `ModelProvenanceChip`, principio #8) — este último NO se difirió y es ahora la
> fecha exigible más cercana. Fuentes: Freshfields ("EU AI Act unpacked #34: The final Digital Omnibus
> on AI", jul-2026), Gibson Dunn ("EU AI Act Omnibus Agreement", jul-2026), DLA Piper (jul-2026),
> Consilium (comunicado oficial, 29-jun-2026). Monitoreo futuro se reduce a confirmar la referencia
> EUR-Lex exacta cuando aparezca — ya no hay decisión pendiente.
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

### Primitivas nuevas (actualizado 2026-07-20)

| Componente | Propósito | Estado |
|---|---|---|
| Stepper | Stagebar horizontal de proceso | ✅ (Storybook `Primitives/Stepper`) |
| Dropzone | Zona de carga presentacional | ✅ (Storybook `Primitives/Dropzone`) |
| KanbanBoard | Tablero controlado con dnd-kit | ✅ (Storybook `Kanban/Kanban Board/V001 Remediation Backlog`) |
| Toast / Toaster | Notificación efímera (retroalimentación de acción) | ✅ (2026-07-17, `583efaa`, Storybook `Primitivas/Retroalimentación/Toast` — cubre variantes ok/error, imperativo `toast({title,description,variant})`) |
| Combobox | Select con búsqueda/autocompletado accesible | 🟡 (2026-07-17, `e471ef9`, exportado y con test `combobox.test.tsx`; demostrado en `apps/showcase` (página Primitivas) pero **sin story standalone en Storybook** — mismo criterio que `ErrorState`) |
| FormField (useZodForm/FormField) | Contrato de formulario validado con Zod | 🟡 (2026-07-17, `e471ef9`, `packages/ui/src/form/` con test `form-field.test.tsx`; en `apps/showcase` pero sin story standalone en Storybook) |
| FlowStepper | Wizard multi-paso (asistente de proceso guiado) | 🟡 (2026-07-19, `7014f42`, exportado desde `components/ui/flow-stepper.js`; en `apps/showcase` pero sin story standalone en Storybook) |

### D. Table stakes enterprise 2026

| Capacidad | Propósito | Estado |
|---|---|---|
| WCAG 2.2 AA | focus-not-obscured, targets 24px, alternativas a drag | ✅ (axe wcag2a/aa/21aa/22aa: 0 violaciones en todas las stories; hit-areas 24px en Checkbox/Radio/Switch; auditor: `scripts/a11y-audit.mjs` (requiere playwright)) |
| AppShell (chrome multi-caso-de-uso) | Sidebar colapsable + topbar + workspace switcher + drawer mobile: un solo chrome config-driven para todas las verticales del DS | ✅ (V001, 2026-07-15, Storybook `App Shell/V001 Multi-Workspace Shell` — `AppShell` (skip-link WCAG 2.4.1, landmarks nav/main, `data-density` en el root), `AppSidebar`/`SidebarSection`/`SidebarItem` (rail de iconos con tooltips, badges con tono, `aria-current="page"`, drawer mobile sobre `Sheet`), `AppTopbar` (breadcrumbs, `TopbarSearchButton` ⌘K, `TopbarIconButton` con contador, `DensityToggle`), `WorkspaceSwitcher` (pivote entre soluciones: agent ops / auditoría / certificación ISO / cotizaciones industriales / churn radar — 5 stories sobre la misma API), `EnvironmentBadge` (production = tono `warn`: en una consola que aprueba acciones de agentes reales, "estás en producción" es información de seguridad) |
| Density modes | comfortable/compact (Spectrum-style) para tablas ops | ✅ (2026-07-15: el `AppShell` fija la densidad a nivel de sitio vía el `DensityContext` compartido con `TraceLog` (+ `DensityToggle` en el topbar y `data-density` en el root), y `DataTable` ahora hereda esa densidad como default cuando no recibe prop explícita — la prop le sigue ganando al contexto, sin cambio de comportamiento fuera de un shell) |
| Theming white-label | ThemeProvider + tokens OKLCH re-brandeable | 🟡 (2026-07-17: **4 temas** — cockpit/violet/light + `ganapliego` (tema de producto light-based, clon de `light` en v1 hasta que exista identidad de marca, `59b2701`); sigue faltando la **guía white-label** documentada, por eso no ✅. Los tokens ya se publican en npm como `@enregla-ui/duly-tokens`, lo que hace el rebrand consumible fuera del monorepo por primera vez) |
| Data-viz tokens | Paleta categórica 3:1 sobre dark (Carbon-style), sequential + alert | ✅ (V001, 2026-07-15, Storybook `Data-viz Tokens/V001 Categorical + Sequential` — `--viz-cat-1..8` y `--viz-seq-1..7` por tema en `@duly/tokens` (hex fallback + oklch, mapeados a utilidades Tailwind y al export JS `viz`); la categórica son los mismos 8 hues re-escalonados por superficie, **validados computacionalmente** contra las surface-2 reales de cada tema (dark: banda L, chroma ≥0.1, CVD adjacent ΔE ≥8 deutan/protan, visión normal ΔE ≥15, contraste 8/8 ≥3:1; light: 4 slots bajo 3:1 por diseño → relief rule, labels directos o vista tabla); el rojo cat-8 se re-escalonó (#cc4b4f) porque el de referencia quedaba a ΔE 5.2 de `block` — un slot no debe impersonar una alerta; sequential = hue del accent del tema con L monotónica (teal en cockpit/light, violeta en violet); "alert" = los status LOCKED existentes, gateado que ningún slot los impersone; gates permanentes en `packages/tokens/src/build.test.ts` (cierra la nota "CVD-separation gate reasignado a --viz-cat-*"); helpers `vizCat`/`vizSeq`/`vizCategorical` en `@duly/ui` con las reglas de uso: orden fijo por entidad, cap de 4 en formas all-pairs, serie 9 se pliega a Other) |
| CommandPalette | Keyboard-first ops | ✅ (V001, 2026-07-15, Storybook `App Shell/V001 Multi-Workspace Shell` — construido sobre `cmdk` (la dependencia ya decidida en el spec del ladder) dentro del `Dialog` temado; API items-driven (grupos, keywords/alias, hints de atajo, disabled) para que cada workspace registre sus propios comandos, + hook `useCommandPalette` con atajo global ⌘K/Ctrl+K y `TopbarSearchButton` como punto de entrada visible) |
| DataTable denso | Virtualizado, roving tabindex, saved views/FilterBar | ✅ (rung 1 del ladder: `@tanstack/react-table` + `@tanstack/react-virtual`, roving tabindex ↑/↓/Home/End/PageUp/PageDown, `FilterBar` + `SavedViews`/`useSavedViews` (persistencia en `localStorage`, feature de compliance del principio #10); `AuditLogTable`/`ExecutionHistoryTable` ya remontadas encima sin cambiar su API) |
| EmptyState/ErrorState/Skeleton triad | Estados vacío/error diseñados | 🟡 (mejora 2026-07-13: `components/ui/error-state.tsx` — primitivo `ErrorState` reutilizable (cva sobre `Alert`) ya existe y está wireado en el slot `emptyState` de `DataTable` y en `emptyLabel` de `ExecutionHistoryTable` — cierra el hueco que señalaba el audit "impeccable" del 2026-07-12. Sigue en 🟡 y no ✅ porque no tiene story propia standalone en Storybook — solo se ve indirectamente a través de `DataTable`) |
| DateRangePicker + timezone | Rango con zona horaria visible | ✅ (V001, 2026-07-15, Storybook `DateRangePicker/V001 Range + Timezone` — sobre `react-aria-components` (la dependencia ya decidida: segmentos spinbutton editables por teclado, calendario dual navegable); la zona horaria SIEMPRE visible como chip junto al rango (offset Intl `shortOffset` con IANA en el title, o `timeZoneLabel` editorial tipo "Planta MTY" — en una consola de auditoría "¿las 09:00 de quién?" es pregunta de compliance); presets rápidos 7/30 días + mes/trimestre a la fecha calculados en la `timeZone` dada (insumo de saved queries, principio #10), desactivables con `presets={false}`; controlado-o-no; estados invalid/disabled) |
| i18n/RTL | Propiedades CSS lógicas, dirección tokenizada | 🟡 (mejora 2026-07-13, cierra 2 P0/P1 del audit "impeccable" 2026-07-12T16:25Z: contrato de copy inyectable `CopyProvider`/`useCopy`/`useFormatCurrency` con diccionarios en/es (Workstream 1, reemplaza el copy bilingüe ES/EN mezclado que el audit marcó como P0), sweep de propiedades lógicas CSS (ps-/pe-/ms-/me-/start-/end-/border-s/e-/rounded-s/e-) en 16 componentes (Workstream 2), toggle de locale en la toolbar de Storybook. Sigue en 🟡, no ✅: el propio commit documenta 4 TODOs de RTL sin resolver (`trace-tree.tsx` indentación por `paddingLeft` inline, `dialog.tsx` centrado con `translate-x` físico, `process-value-tile.tsx` estilos inline left/right, posicionamiento absoluto del virtualizador en `data-table.tsx`) y la cobertura de `useCopy`/`useFormatCurrency` llega a 26 archivos de producción — no auditado como 100% del árbol) |
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

Reordenado 2026-07-20 (vanguard check #4). La semana 2026-07-13 → 2026-07-20 **tampoco tocó el
backlog de gaps de catálogo** — el loop de construcción invirtió en infraestructura de distribución
y primitivas: (a) **resolvió el bloqueador #1 de semanas** — `@enregla-ui/duly-ui@0.2.0` y
`@enregla-ui/duly-tokens@0.1.0` ahora **están publicados en npm** (el scope `@duly` no estaba
disponible, se renombró a `@enregla-ui/duly-*`, `920f0e2`; Release workflow **en verde** en el último
run del 2026-07-20); (b) shippeó 4 primitivas nuevas — Toast, Combobox, FormField/useZodForm,
FlowStepper — y un 4º tema (`ganapliego`); (c) construyó `apps/showcase` (Duly Showcase, páginas
por vertical desplegadas en Vercel), la primera superficie de demostración compuesta fuera de
Storybook. Trabajo real de "producto consumible" y **demostrable**, pero **cero filas de gap del
catálogo A/B/C se cerraron**: `AgentHandoffMarker`/`CheckpointBadge` arrastran ya **3 semanas** como
prioridad #1 sin construirse — cruzó el umbral que el reporte anterior fijó como "deja de ser orden
de prioridad y pasa a ser señal de que el backlog de este documento no llega al loop de construcción".

1. **AgentHandoffMarker + CheckpointBadge** (prioridad #1 por **cuarta semana consecutiva** —
   arrastrada desde la iteración 15; ladder §07, semana de calidad y semana de distribución/npm,
   ninguna las tocó) — marcadores puntuales sobre timelines/trees ya existentes (`RunTimeline`,
   `TraceTree`, `ExecutionTimeline`); bajo esfuerzo, cierra las 2 filas más viejas sin resolver del
   documento. **La hipótesis de "bloqueo estructural" del reporte anterior se confirma como patrón**:
   3 loops de construcción distintos corrieron con agenda propia y ninguno leyó este top-5. Acción
   sugerida al usuario/loop: sembrar estas 2 como el PRIMER ítem de la próxima sesión de construcción
   antes de cualquier otra cosa, o mover el par a un spec explícito en `docs/`.
2. **ToolIntegrityIndicator (tool-definition drift)** — nueva prioridad esta semana: Vercel AI SDK
   ya lo resuelve a nivel de SDK (`fingerprintTools`/`detectToolDrift`, `ai@7.0.19`, 9-jul-2026) y
   la literatura de seguridad MCP de 2026 lo trata como vector de ataque activo ("rug pull"); este
   DS no tiene ninguna señal visual para "esta tool cambió desde que fue aprobada". Esfuerzo bajo
   si se extiende `GuardrailIndicator` en vez de construir un primitivo nuevo. Ver fila nueva en
   área B.
3. **RBACMatrixViewer** — área C sigue en 55%; `ModelProvenanceCard` y `ApprovalChainStepper` ya
   dan el vocabulario de actor/provider necesario para "por qué este usuario tiene acceso".
   Temporal Cloud sigue con "Custom Roles" en pre-release, sin cambio esta semana.
4. **CommandPalette + Density modes sitewide + DateRangePicker** — 2026-07-15: secuencia
   completa cerrada en la misma sesión que construyó el `AppShell` (ver filas del área D).
   El siguiente table stake pendiente del área D es "Data-viz tokens" (paleta categórica 3:1).
5. **AgentAnomalyIndicator (Behavioral Deviation Flag)** — arrastrada de la semana pasada (fuente
   FINRA, servicios financieros); reusa vocabulario `Tone`/`NodeStatus` existente.
6. **VendorRiskCard** — arrastrada de la semana pasada (fuente auditores SOC2 2026); complementa a
   `ModelProvenanceCard` a nivel de proveedor en vez de nivel de run.

(`WorkflowCanvasFrame` sigue fuera del top 5 — mayor esfuerzo del catálogo restante; nota nueva:
n8n agregó **OAuth 2.0 Token Exchange (RFC 8693)** para embed en iframe sin login separado — facilita
la parte de *auth* del embed, pero el branding sigue sin ser white-label, así que el análisis "hay que
reconstruir la vista de ejecución, no envolver marca ajena" no cambia. Vertical de salud sigue siendo
la oportunidad de pionero de mayor plazo — ver `VANGUARD_REPORT.md`. Candidato emergente nuevo esta
semana: **`AgentPlanPreview`** (planning visibility, ver fila en área B) — bajo-medio esfuerzo. Resto:
`DataLineageGraph`, `ChangeRecordCard`, `IncidentView` (área C), stories standalone para `ErrorState`/
`Combobox`/`FlowStepper`/`FormField` (primitivas ya construidas pero en 🟡 por falta de Storybook),
variante de inmobiliaria por rol tipo Rex CRM más allá de `PropertyIntelligenceConsole`.)

## Fuentes de vanguardia (el loop semanal las re-visita)

n8n docs (executions, error handling; el embed NO es white-label — reconfirmado, sin cambios de
branding. **Novedad 2026-07-20**: soporte de **OAuth 2.0 Token Exchange (RFC 8693)** para embed en
iframe sin pantalla de login separada — mejora la auth del embed, no el branding) · Temporal Web UI
(Custom Roles sigue en pre-release desde 25-jun-2026, sin novedad esta semana) · LangSmith/LangGraph
(sin novedad verificada esta semana) · OpenAI Agents SDK + ChatKit (ambos GA; esta semana solo
transporte websocket para modelos Responses + sandbox nativo, sin patrón nuevo de UI) · Anthropic
Console / Claude (esta semana: subagent text streaming en Claude Code, progress heartbeats, tool
`EndConversation` — todo de tooling de dev, sin patrón nuevo de UI de agentes) · **Vercel AI SDK:
`ai@7.0.30` (16-jul-2026)** — parche de seguridad de URLs de provider (`trustedOrigin`/
`credentialedOrigin`, validación de redirects) + soporte grok-4.5; sin componente nuevo, pero refuerza
la línea "integridad/seguridad de la superficie de tools" que motivó `ToolIntegrityIndicator`
(`fingerprintTools`/`detectToolDrift` siguen siendo la referencia, `ai@7.0.19`) · Microsoft AG-UI /
Agent Framework (GA 1.0, sin novedad verificable esta semana) · IBM Carbon (sin release notes de
patrón nuevo) · Adobe Spectrum / React Spectrum (sin release relevante) · **EU AI Act Digital Omnibus
(RESUELTO): acto final FIRMADO 8-jul-2026**, entra en vigor al 3er día tras publicación en el Diario
Oficial; alto-riesgo standalone diferido a 2-dic-2027, embebido a 2-ago-2028; watermarking sigue en
2-dic-2026 (fecha exigible más próxima). Ya no hay decisión pendiente que vigilar (fuentes:
Freshfields, Gibson Dunn, DLA Piper, jul-2026) · SOC2 CC7/CC8 (sin TSC de IA formal, sin novedad) ·
ISO/IEC 42001 + prEN 18286 (sin novedad) · WCAG 2.2 AA (vigente, sin novedad) · FINRA (behavioral
baselining, sin novedad) · **Seguridad MCP / tool poisoning-rug pull** (motiva `ToolIntegrityIndicator`,
sin novedad) · **UX de agentes enterprise — "planning visibility"** (nueva fuente 2026-07-20,
fuselabcreative.com — ver la secuencia de acciones intencionada antes de ejecutar es 1 de 5 patrones
universales de agentes enterprise; motiva la fila nueva `AgentPlanPreview` en área B) · **Salud —
patrón "activity panel separation"** (fuselabcreative.com — mostrar una recomendación a la vez +
panel de evidencia + override de un clic sigue siendo el patrón dominante en UI clínica de IA;
reconfirma la oportunidad de pionero de la vertical de salud, Gartner proyecta 40% de apps enterprise
con agentes task-specific para fin-2026).
