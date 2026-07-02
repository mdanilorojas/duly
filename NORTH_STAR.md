# NORTH STAR — Studio DS: sistema operativo visual para agentes de IA en la empresa

> Documento vivo. Define qué significa "increíble para corporaciones" en este design system:
> interfaces de orquestación de agentes, automatización de procesos con n8n, y auditoría/compliance.
> El loop semanal de vanguardia re-verifica este documento contra el estado del arte y contra el
> inventario real de componentes, y mantiene la tabla de gaps al día.
> Última revisión: 2026-07-01 · Próxima: semanal (routine cloud "vanguard check").

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
| NodeStatusBadge | success/error/running/waiting/skipped/retrying (anillo dashed animado) | ❌ |
| RetryControls | Retry-desde-inicio vs desde-nodo-fallido, contador de intentos | ❌ |
| CredentialCard/Picker | Credencial: tipo, owner, last-used, compartida-con, health | ❌ |
| SubworkflowChip | Referencia expandible/deep-link a ejecución hija | ❌ |
| ErrorWorkflowBanner | "Este fallo se enrutó al error handler X" con cross-link | ❌ |
| WorkflowCanvasFrame | Contenedor temado para embeber el editor n8n (zoom, fit, read-only) | ❌ |

### B. Agent ops / consola de IA

| Componente | Propósito | Estado |
|---|---|---|
| TraceTree / SpanRow | Spans anidados (LLM/tool/agente/retrieval) con duración, tokens y costo por span | 🟡 (TraceLog existe; falta árbol anidado + costo) |
| ApprovalGateCard | Evidence pack: qué/por qué/blast-radius/rollback + approve/reject/escalate + timeout | ❌ |
| RunTimeline | Timeline estilo Temporal con estados vivos (dashed/solid/color) | ❌ |
| TokenCostMeter | Costo por run y agregado (modelo vs tools vs retrieval), umbrales de presupuesto | ❌ |
| GuardrailIndicator | Pill passed/warned/blocked, expandible a la política que disparó | ❌ |
| EvalScoreBadge + Sparkline | Score vs umbral, flechas de regresión | ❌ |
| AgentHandoffMarker | Punto visual de transferencia agente↔agente o agente→humano | ❌ |
| StreamingMessage / ThinkingIndicator | Stream de tokens con chips de tool-call inline | ❌ |
| HumanInterruptQueue | Inbox de runs pausados esperando revisión, ordenado por riesgo/edad | ❌ |
| CheckpointBadge | "Estado persistido aquí; reanudable" | ❌ |
| AgentCore/Card/Gallery (identidad) | Orbs WebGL con identidad por agente | ✅ (V001) |
| AgentMetric / AgentStatusMatrix | Tiles de métrica y matriz de estatus con tonos semánticos | ✅ (V002) |

### C. Auditoría / compliance (EU AI Act Art. 12-13, SOC2 CC7/CC8, ISO 42001)

| Componente | Propósito | Estado |
|---|---|---|
| AuditLogTable | Stream inmutable: actor (humano/agente/sistema), acción, recurso, hash badge | ❌ |
| WhoDidWhatTimeline | Feed cronológico filtrable con saved-query chips | ❌ |
| EvidenceExportDialog | Export firmado (PDF/CSV/JSON) de un rango filtrado con manifiesto de hashes | ❌ |
| ApprovalChainStepper | Quién aprobó qué, cuándo, en qué orden, con ramas de rechazo | ❌ |
| ModelProvenanceCard | Modelo, versión, prompt version, config hash por run | ❌ |
| RBACMatrixViewer | Grid roles×permisos + "por qué este usuario tiene acceso" | ❌ |
| DataLineageGraph | Origen→transformación→salida a nivel de campo | ❌ |
| ChangeRecordCard | Cambio CC8.1: autor, reviewer, diff, rollback link | ❌ |
| IncidentView | Timeline de incidente: run disparador, recursos afectados, remediación | ❌ |
| RetentionBadge / ImmutabilityIndicator | Señal de confianza "WORM, retenido 6+ meses" | ❌ |

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

## Prioridad de construcción (guía para el loop de 5h)

1. **RunTimeline + NodeStatusBadge** — la gramática de estados es la base de todo lo demás.
2. **AuditLogTable + WhoDidWhatTimeline** — credibilidad de auditoría (EU AI Act ya exigible).
3. **ApprovalGateCard + HumanInterruptQueue** — human-in-the-loop con evidencia.
4. **TraceTree con costo por span + TokenCostMeter** — observabilidad con dinero visible.
5. **ExecutionHistoryTable + RunInspector** — el wrapper enterprise sobre n8n.
6. **DataTable denso + Density modes + CommandPalette** — table stakes ops.
7. Resto del catálogo, variante por industria (inmobiliaria, petróleo, software, finanzas, salud).

## Fuentes de vanguardia (el loop semanal las re-visita)

n8n docs (executions, error handling, embed/white-label) · Temporal Web UI · LangSmith
(observability/evals) · OpenAI platform (guardrails, approvals, AgentKit) · Anthropic Console ·
Vercel AI SDK UI · Microsoft AG-UI / Agent Framework · IBM Carbon (data-viz, dashboards) ·
Adobe Spectrum (density) · EU AI Act (Art. 12-13 logging) · SOC2 CC7/CC8 · ISO 42001 · WCAG 2.2.
