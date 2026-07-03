# Studio DS — Análisis de brechas de componentes

> Fecha: 2026-07-03 · **Solo diagnóstico — nada a ejecutar hasta aprobación.**
> Companion visual (para revisión humana): `2026-07-03-design-system-gap-analysis.html`.
> Objetivo del DS (6 ejes): agentes · orquestadores · automatización industrial · orquestación de agentes · compliance/auditoría · estrategia comercial para grandes empresas.

## Stack verificado (código, no adivinado)

- **shadcn/ui** (patrón copy-owned) + **Radix UI** + **Tailwind v4** + `class-variance-authority` + `clsx` + `tailwind-merge` + `lucide-react`.
- React 18/19, RSC-ready, tsup. Tokens `@studio/tokens` en OKLCH (temas `cockpit`/`test`/`light`).
- Lo que el usuario oyó como "chat 100 / erradics" = **shadcn + Radix**. Mezclar más libs (React Aria, Tremor, React Flow) es viable y recomendado para áreas nuevas.

## Cobertura global

| | Construido ✅ | Parcial 🟡 | Falta ❌ | Total |
|---|---|---|---|---|
| Catálogo objetivo (7 áreas) | ~17 agentic + 21 primitivas | 3 | ~88 | ~105 |
| Cobertura "súper completo" | **~13%** | | | |

## Lo que existe hoy (verificado en `packages/ui/src`)

- **21 primitivas shadcn**: Button, Badge, Card, Input, Textarea, Label, Select, Checkbox, RadioGroup, Switch, Alert, Avatar, Tooltip, Separator, Dialog, Sheet, DropdownMenu, Tabs, Accordion, Progress, Skeleton.
- **Agentic (~17)**: AgentCore/Card/Gallery, AgentMetric, AgentStatusMatrix, NodeStatusBadge, RunTimeline, ExecutionTimeline, ExecutionHistoryTable/Console, RunInspector, TraceTree, TokenCostMeter, TraceLog, ApprovalGateCard, HumanInterruptQueue, RichToolCallCard, AuditLogTable, WhoDidWhatTimeline, PropertyIntelligenceConsole.

## Brechas por área

Estado: ✅ existe · 🟡 parcial · ❌ falta.

### A. Proceso empresarial / n8n — 2✅ 1🟡 5❌ (8)
ExecutionHistoryTable 🟡 (sin virtualizar) · RunInspector ✅ · NodeStatusBadge ✅ · RetryControls ❌ · CredentialCard/Picker ❌ · SubworkflowChip ❌ · ErrorWorkflowBanner ❌ · WorkflowCanvasFrame ❌ (n8n OEM **no** es white-label → reconstrucción propia).

### B. Agent ops / consola de un agente — 9✅ 6❌ (15)
✅ TraceTree, ApprovalGateCard, HumanInterruptQueue, RunTimeline, TokenCostMeter, RichToolCallCard, AgentCore/Gallery, AgentMetric/Matrix, ExecutionTimeline.
❌ AgentConsentCard (KYA, prioridad) · GuardrailIndicator · EvalScoreBadge+Sparkline · AgentHandoffMarker · StreamingMessage/ThinkingIndicator · CheckpointBadge.

### C. Auditoría / compliance — 2✅ 8❌ (10)
✅ AuditLogTable · WhoDidWhatTimeline.
❌ EvidenceExportDialog (prioridad) · ApprovalChainStepper · ModelProvenanceCard · RBACMatrixViewer · DataLineageGraph · ChangeRecordCard · IncidentView · RetentionBadge/ImmutabilityIndicator.
Marco: EU AI Act Art. 12/13 (logging) vs Art. 19 (retención 6m) — **obligaciones distintas**; SOC2 CC7/CC8; ISO 42001 + **prEN 18286** (estándar armonizado real).

### D. Table stakes enterprise — 1✅ 2🟡 7❌ (10)
✅ WCAG 2.2 AA. 🟡 Theming white-label · EmptyState/ErrorState/Skeleton (solo Skeleton).
❌ **DataTable denso virtualizado (desbloqueante)** · Density modes · CommandPalette · Data-viz tokens · DateRangePicker+timezone · i18n/RTL · RBAC granular.

### E. Estrategia comercial para grandes empresas — 0✅ 20❌ (20) · **ÁREA NUEVA**
- *Pipeline/Forecast*: ForecastRollupTable, PipelineWaterfallChart, PipelineCoverageGauge, DealBoard.
- *Ejecución deal*: MutualActionPlanBoard/DealRoomTimeline, SequenceCadenceBuilder, DealRiskSignalPanel, OpportunityStagePath.
- *Pricing/CPQ*: QuoteLineConfigurator, PricingApprovalMatrix.
- *Cuenta*: AccountHealthScorecard, RelationshipMap/BuyingCommitteeOrgChart, WhitespaceMatrix.
- *Ejecutiva*: QBRScorecard, TerritoryQuotaPlanner/CapacityCoverageMap, QuotaAttainmentGauge, ROICalculatorCard/BusinessCaseBuilder.
- *Revenue/Billing*: MRRMovementWaterfall, NetRevenueRetentionCohortGrid, SubscriptionScheduleTable.
- Reutilización: RatioGauge (attainment+coverage); tokens RAG+trend-delta (QBR/Health/MRR).
- Fuentes: Clari, Gong, Salesforce SLDS, DealHub/PandaDoc, Dock/Aligned/GetAccept, Salesloft, Anaplan/Fullcast, ChartMogul/Stripe, ARPEDIO.

### F. Automatización industrial real — OT/SCADA — 0✅ 23❌ (23) · **ÁREA NUEVA**
Área A = automatización de proceso de negocio (n8n); esto es tecnología operacional (planta real).
- *HMI (ISA-101)*: ProcessValueTile, TrendChart, SetpointControl/Faceplate, EquipmentStatusSymbol, MimicCanvas/SchematicView.
- *Alarmas (ISA-18.2/EEMUA 191)*: AlarmBanner, AlarmSummaryTable, AlarmShelf, AlarmJournal, PriorityBadge/AlarmChip.
- *Activos*: AssetHealthGauge, ConditionTrendCard, RULIndicator.
- *Órdenes (CMMS/ISA-95)*: WorkOrderCard, WorkOrderKanban, AssetHierarchyTree.
- *Producción (ISO 22400)*: OEEWaterfall, AndonBoard, DowntimePareto.
- *Seguridad/batch*: PermitToWorkCard, ShiftHandoverLog, InterlockStatusPanel (IEC 61511), BatchPhaseSequencer (ISA-88).
- *IA autónoma*: AgentApprovalGate (= ApprovalGateCard reusado), AutonomyModeSwitch (Manual→Advisory→Supervised→Full-Auto).
- **Regla ISA-101**: grayscale de base, color solo en anormalidad → encaja con el tema dark-premium (accent gastado con moderación). Audit trail OT reutiliza ExecutionHistoryTable/RunInspector (EU AI Act Art. 14).

### G. Orquestación multi-agente — 0✅ 19❌ (19) · **ÁREA NUEVA**
El DS observa 1 agente; no tiene vista de flota.
- *Topología*: AgentTopologyGraph, SupervisorOrgMap, A2ATaskFlowView, A2AAgentCardViewer, SharedStateInspector/BlackboardView, AGUIEventStreamViewer, RoutingDecisionCard.
- *Control*: SwarmControlBar, ConcurrencyQueueBoard, BudgetCapGovernor, KillSwitchControl.
- *Registro*: AgentRegistryTable, CapabilityScopeCard/SkillCard, VersionRolloutPanel, ShadowAgentAlert.
- *Identidad/interop*: AgentIdentityCard/DelegationChainViewer, CrossAgentTraceWaterfall (OTel GenAI), MCPServerHealthPanel/ToolRegistryView, MCPAppsWidgetFrame, ElicitationPromptCard.
- Fuentes: MS Conductor, LangGraph Studio, Anthropic orchestrator-worker, Google A2A, AG-UI/CopilotKit, MCP Apps+elicitation, AWS/Google Agent Registry, NVIDIA verified skills, Temporal, Cordum FinOps, Strata identity, OTel GenAI.

## Correcciones a lo existente

**Bugs verificados:**
1. `scripts/a11y-audit.mjs:7` — ruta absoluta Windows hardcodeada (`C:/dev/Enterprise Design System`). No portable CI/Linux. → ruta relativa.
2. Ninguna tabla virtualizada (`audit-log-table.tsx:105` "no virtualizada todavía"; ExecutionHistoryTable igual). No escala. → DataTable virtualizado (área D).

**Drift de estándar 2026:**
3. `AgentCard` colisiona con A2A Agent Card (discovery doc). → renombrar `AgentTile` + añadir `A2AAgentCardViewer`.
4. `RichToolCallCard` → re-fundar sobre **MCP Apps** (ratif. 2026-01-26), no renderer propio.
5. `StreamingMessage` → conformar **AG-UI** (~16 eventos tipados).
6. `TraceTree` → adoptar **OTel GenAI** (`gen_ai.*`) e ir cross-agent.
7. `AgentHandoffMarker` sub-modelado vs ciclo A2A; `CheckpointBadge` — distinguir de durable execution (Temporal).
8. `TokenCostMeter` per-run → alimentar `BudgetCapGovernor` (cap cruzado).

## Recomendación de orden (no ejecutar aún)

1. **DataTable denso virtualizado** (D) — corrige 2 bugs, reutilizan A/C/E/F.
2. **Orquestación mínima** (G): AgentTopologyGraph + SwarmControlBar + BudgetCapGovernor (React Flow).
3. **Cerrar compliance** (C): EvidenceExportDialog + ApprovalChainStepper + ModelProvenanceCard.
4. **Núcleo comercial** (E): ForecastRollupTable, PipelineWaterfallChart, MutualActionPlanBoard, RelationshipMap, PricingApprovalMatrix, MRRMovementWaterfall.
5. **Núcleo industrial OT** (F): AlarmBanner, AlarmSummaryTable, ProcessValueTile, AssetHealthGauge, OEEWaterfall, AutonomyModeSwitch.
6. **Adopción de estándares** (correcciones): MCP Apps, AG-UI, OTel GenAI, rename AgentCard→AgentTile.
