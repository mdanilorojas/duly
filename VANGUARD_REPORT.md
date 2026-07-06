# VANGUARD REPORT — Studio DS

> Se sobreescribe cada semana. Historial real vive en `git log -- VANGUARD_REPORT.md`.

**Fecha:** 2026-07-06 · **Generado por:** routine cloud "vanguard check" #2

## Resumen ejecutivo

El repo está sano (155/155 tests, 33 archivos; build `@studio/ui` y Storybook OK). Desde la
auditoría anterior (2026-07-02), un loop de construcción distinto ejecutó **completo** un ladder
de 19 unidades (`docs/superpowers/specs/2026-07-03-build-ladder-batch-design.md`, commits
`c7bba09`…`e87de67`): cerró casi todo el backlog que este reporte señalaba como top-5 la semana
pasada, y de paso construyó **dos verticales de industria enteras** (comercial/RevOps e
industrial/petróleo-energía, áreas E y F, nuevas en el catálogo) que no existían ni como filas.
Cobertura ponderada del catálogo: **75% (antes 19%)** — el salto real de la semana no viene de
esta auditoría sino del ladder; mi trabajo hoy fue re-verificar el inventario contra el repo real,
ampliar el catálogo con las áreas nuevas, y encontrar que 2 gaps que el propio loop de construcción
se había prometido cerrar (`AgentHandoffMarker`/`CheckpointBadge`) siguen sin construir. Afuera del
repo, la novedad regulatoria más concreta es que el Digital Omnibus de la UE ya tiene luz verde
política completa de ambas cámaras — solo falta el trámite mecánico de publicación en EUR-Lex.

## Novedades de la semana (con fuente)

**Inventario interno (lo más grande de esta semana, aunque no es "de afuera"):** el ladder §07
construyó 28 unidades entre el 2026-07-03 y 2026-07-04: `DataTable` denso virtualizado + `FilterBar`
+ `SavedViews` (rung 1, tanstack-table/tanstack-virtual), `AgentTopologyGraph`/`SwarmControlBar`/
`BudgetCapGovernor` (rung 2, React Flow), `EvidenceExportDialog`/`ApprovalChainStepper`/
`ModelProvenanceCard` (rung 3, ya reflejados en el reporte anterior pero confirmados aquí),
7 componentes comerciales (rung 4, recharts) y 7 industriales con disciplina ISA-101 (rung 5),
más 6 correcciones de estándar (rung 6): `AuditLogTable`/`ExecutionHistoryTable` remontadas sobre
`DataTable` (ahora sí virtualizan), fix de portabilidad de `a11y-audit.mjs`, rename
`AgentCard→AgentTile` + `A2AAgentCardViewer` (protocolo A2A), `RichToolCallCard` con modo MCP Apps
real (`@mcp-ui/client`), `StreamingMessage` nuevo sobre el protocolo AG-UI, y `TraceTree` con
adaptador OTel GenAI. Todo con tests verdes (155/155) y build limpio verificado hoy.

**EU AI Act (la novedad regulatoria más concreta):** el Consejo de la UE confirmó por comunicado
oficial (29-jun-2026) la luz verde final al Digital Omnibus tras la aprobación del Parlamento
(16-jun-2026) — el texto "se publicará en breve" en el Diario Oficial y entra en vigor al tercer
día. A esta fecha (2026-07-06) **sigue sin confirmarse la publicación en EUR-Lex**, pero las nuevas
fechas pasan de "podrían retrasar" a "confirmadas políticamente, solo falta el trámite": Anexo III
(alto riesgo standalone) 2-ago-2026 → 2-dic-2027; Anexo I (embebido) 2-ago-2027 → 2-ago-2028.
Novedad no vista la semana pasada: el paquete también recorta el período de gracia de
watermarking/transparencia de contenido de IA de 6 a 3 meses (nuevo deadline 2-dic-2026) — trabajo
que `ModelProvenanceChip` ya cubre. Fuentes: [Consilium](https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/), [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/), [ComplianceHub.Wiki](https://compliancehub.wiki/eu-digital-omnibus-ai-act-deadline-deferral-annex-iii-2027/).

**SOC2/AICPA:** sin TSC de IA formal (confirma la semana pasada); framework sigue en TSP Section
100 (2017/2022). Novedad útil: fuentes de auditoría 2026 detallan qué evidencia AI-specific piden
en la práctica — linaje de modelo, logs de prompt/inferencia con PII redactada, salida de
monitoreo de drift, y **vendor risk assessment por cada LLM de terceros** (este último sin
componente en el catálogo — nueva fila `VendorRiskCard`). Fuente:
[soc2auditors.org](https://soc2auditors.org/insights/soc-2-for-ai-companies/).

**WCAG:** sin novedad — el Working Draft de mar-2026 sigue siendo el más reciente (próximo
esperado ~sep-2026, cada 6 meses); Candidate Recommendation estimado Q4-2027, Recommendation no
antes de 2028. Sin urgencia.

**n8n / Temporal / OpenAI / Anthropic / Vercel AI SDK / Microsoft AG-UI / IBM Carbon / Adobe
Spectrum:** todos revisados, todos sin cambios sustantivos desde el 2026-07-02. n8n reconfirma que
el OEM no es white-label completo. Temporal Custom Roles sigue en pre-release. OpenAI Agents SDK y
ChatKit ya están GA (sin novedad de patrón). Claude Sonnet 5 ya en producción (lanzado 30-jun,
sesión activa de esta misma auditoría corre sobre él); Claude Fable 5/Mythos 5 restaurados
1-jul-2026 (sin relevancia de UI). Vercel AI SDK solo tuvo parches de bugfix esta semana
(`ai@7.0.15`, providers). IBM Carbon publicó v11.111.0 (1-jul) — solo íconos/pictogramas + fixes de
a11y, sin patrón de densidad o data-viz nuevo. React Spectrum sin release en julio aún (último
18-jun).

**Patrones por sector (hallazgos nuevos esta semana):**
- **Servicios financieros:** FINRA formalizó a los agentes de IA como categoría de riesgo de
  supervisión propia, con 4 vectores (acción sin validación humana, scope/autoridad excedida,
  auditabilidad de cadenas de razonamiento multi-paso, uso indebido de datos sensibles) y recomienda
  explícitamente **"behavioral baselining"** — desviación automática de un patrón de comportamiento
  aprendido por agente — como control esperado. Sin componente hoy en el catálogo (nueva fila
  `AgentAnomalyIndicator`). Fuente: [fin.ai](https://fin.ai/learn/evaluate-ai-agent-compliance-financial-services).
- **Inmobiliaria:** primer patrón concreto de UI de agentes-IA verificable esta vez (semanas
  anteriores no encontraron ninguno) — Rex CRM separó en su anuncio 2026 el asistente monolítico en
  4 roles distintos (AI Admin / AI Prospecting / AI Nurture / AI Manage) en vez de un agente
  genérico único. Semilla de diseño para evolucionar `AgentGallery`/`AgentTopologyGraph` hacia un
  roster etiquetado por rol de negocio, no solo por estado técnico.
- **Salud:** reconfirma "Explainability on Demand" — un caso citado describe cómo mostrar una sola
  recomendación a la vez + panel de evidencia (en vez de una lista) fue la diferencia entre rechazo
  y adopción clínica. Sigue sin vertical propia en el catálogo (a diferencia de comercial/industrial
  ya construidas esta semana) — sigue siendo la oportunidad de pionero más clara.
- **Petróleo/energía y software:** sin hallazgos nuevos esta semana más allá de lo ya construido
  (áreas F e implícitamente E).

## Score de cobertura

Contra el catálogo ampliado de `NORTH_STAR.md` — **63 ítems** (antes 43; +14 de las áreas nuevas
E/F, +2 filas nuevas descubiertas esta semana en B/C, -0 eliminadas), verificado con
build+test+Storybook reales al momento de esta auditoría:

| Área | ✅ | 🟡 | ❌ | Total | Cobertura (✅) | Cobertura ponderada (✅=1, 🟡=0.5) |
|---|---|---|---|---|---|---|
| A. n8n / proceso empresarial | 7 | 0 | 1 | 8 | 88% | 88% |
| B. Agent ops / consola de IA | 18 | 0 | 3 | 21 | 86% | 86% |
| C. Auditoría / compliance | 6 | 0 | 5 | 11 | 55% | 55% |
| D. Table stakes enterprise | 2 | 3 | 5 | 10 | 20% | 35% |
| E. Comercial / RevOps (nueva) | 6 | 0 | 0 | 6 | 100% | 100% |
| F. Industrial / OT (nueva) | 7 | 0 | 0 | 7 | 100% | 100% |
| **Total** | **46** | **3** | **14** | **63** | **73%** | **75%** |

El salto de 14%/19% (semana pasada) a 73%/75% es real pero engañoso si se lee como "esta auditoría
construyó eso" — no lo hizo; un loop de construcción distinto ejecutó un ladder de 19 unidades
completo en paralelo. El trabajo de esta auditoría fue: (1) verificar cada fila contra el repo real
en vez de confiar en el `NORTH_STAR.md` previo, (2) agregar las áreas E/F que existían en el repo
pero no en el catálogo, y (3) encontrar 2 gaps prometidos (`AgentHandoffMarker`/`CheckpointBadge`)
que en realidad siguen sin construirse.

## Top 5 gaps priorizados (backlog para el loop de construcción de 5h)

1. **AgentHandoffMarker + CheckpointBadge** — arrastrado sin cerrar desde la iteración 15 del loop
   de construcción; el ladder §07 tomó otro orden de trabajo y nunca las tocó. Son marcadores
   puntuales sobre `RunTimeline`/`TraceTree`/`ExecutionTimeline` ya existentes — bajo esfuerzo, alto
   ROI de catálogo, y el gap más viejo sin resolver del documento.
2. **RBACMatrixViewer** — área C en 55%; `ModelProvenanceCard` y `ApprovalChainStepper` ya dan el
   vocabulario de actor/provider necesario para "por qué este usuario tiene acceso".
3. **CommandPalette + Density modes sitewide + DateRangePicker** — con `DataTable` (rung 1) cerrado,
   es la secuencia natural de table stakes restante; dependencias (`cmdk`, `react-aria-components`)
   ya decididas en el spec del ladder, solo falta construir. Área D sigue en el punto más bajo del
   catálogo (20%/35%).
4. **AgentAnomalyIndicator (Behavioral Deviation Flag)** — nuevo esta semana, fuente FINRA
   (servicios financieros); reusa vocabulario `Tone`/`NodeStatus` existente, sin framework nuevo.
5. **VendorRiskCard** — nuevo esta semana, fuente auditores SOC2 2026 (evidencia AI-specific);
   complementa a `ModelProvenanceCard` a nivel de proveedor en vez de nivel de run.

(`WorkflowCanvasFrame` sigue como única fila de área A sin cerrar, pero se mantiene deliberadamente
fuera del top 5 — es la de mayor esfuerzo del catálogo completo, sin cambio de análisis esta
semana. Vertical de salud sigue siendo la oportunidad de pionero de mayor plazo, ver arriba.)

## Riesgos

- **Divergencia entre lo prometido y lo construido:** la iteración 15 de `AGENTIC_EXPERIMENTS_LOG.md`
  fijó `AgentHandoffMarker + CheckpointBadge` como prioridad #1 explícita; el ladder §07 (aprobado
  un día antes, 2026-07-03) tomó un orden distinto y las dejó afuera de sus 19 unidades. Ninguno de
  los dos documentos se contradice — simplemente corrieron en paralelo con prioridades propias — pero
  vale la pena que la próxima iteración del loop de construcción cierre este par antes de seguir
  ampliando catálogo hacia gaps nuevos, para no acumular una segunda semana de arrastre.
- **`AGENTIC_EXPERIMENTS_LOG.md` quedó desactualizado:** el log de iteraciones numeradas se detiene
  en la iteración 15 (2026-07-04T19:15:00Z); las 13 unidades de commits posteriores (industrial
  17-23, ladder units 24-28) solo quedaron documentadas en mensajes de commit y en el spec del
  ladder, no en el log narrativo. No lo edité (fuera de mi alcance — solo toco `.md` de vanguardia),
  pero si el loop de construcción sigue usando ese archivo como bitácora de iteraciones, vale la
  pena decidir si el ladder también debe loguear ahí o si el spec + commits son la fuente de verdad
  a partir de ahora.
- **Regulatorio, urgencia sin cambio real:** el Digital Omnibus sigue sin publicarse formalmente en
  EUR-Lex a esta fecha — la brecha entre "luz verde política" y "vigente" persiste igual que la
  semana pasada, solo con más confianza en el contenido final. Seguir monitoreando antes de tratar
  ago-2026 como oficialmente derogado.
- **Cobertura por área sigue muy desigual:** D (table stakes, 20%/35%) es ahora la más rezagada del
  catálogo, por debajo incluso de C (compliance, 55%) — vale la pena que el loop de construcción no
  siga apilando verticales de industria nuevas (aunque tienten por alto ROI de "área nueva al 100%")
  sin antes cerrar D, que sostiene el principio #7 (densidad + keyboard-first) transversalmente.
- **Build/test:** sin riesgos — `pnpm install` limpio, `pnpm --filter @studio/ui test` (155/155
  passed, 33 archivos) y `turbo build --filter=@studio/ui...` (ESM 289.39 KB, DTS 95.54 KB) verdes
  al momento de esta auditoría, con todos los commits del ladder §07 ya incorporados en `main`.
