# VANGUARD REPORT — Duly

> Se sobreescribe cada semana. Historial real vive en `git log -- VANGUARD_REPORT.md`.

**Fecha:** 2026-07-13 · **Generado por:** routine cloud "vanguard check" #3

## Resumen ejecutivo

El repo está sano: 189/189 tests pasan (40 archivos), CI en verde en `main` (verificado hoy vía
GitHub Actions), rebrand Studio DS→Duly completado. Esta semana **no fue de catálogo**: un audit
"impeccable" (2026-07-12) encontró 4 P0 (copy bilingüe, approvals irreversibles, sin CI, nada en
npm) y el loop de construcción los cerró casi todos el mismo día — CI ya está verde, pero el
Release workflow **sigue fallando** (no hay paquete publicado en npm). Como el trabajo de la
semana fue calidad/i18n/rebrand y no catálogo, `AgentHandoffMarker`/`CheckpointBadge` arrastran
ya **2 semanas** sin construirse. La novedad externa más concreta: Vercel AI SDK shippeó detección
de "tool-definition drift" (rug pull de MCP) — gap nuevo sin componente en este catálogo.

## Novedades de la semana (con fuente)

**Inventario interno (lo más grande de esta semana):** entre 2026-07-06 y 2026-07-12 el repo pasó
por 5 workstreams de calidad + un rebrand + una segunda feature de galería, todo disparado por un
audit "impeccable" (`.impeccable/critique/2026-07-12T16-25-10Z__packages-ui.md`, Nielsen 23/40,
Audit Health 15/20, 4 P0/5 P1):
- **Rebrand** Studio DS → Duly, `@studio/*` → `@duly/*` (commit `b3364f4`).
- **CI + Release workflows** nuevos (`e9a3d30`) — cierra el P0 "sin CI" del audit. Verificado hoy:
  `.github/workflows/ci.yml` corre `tokens build lint test` en cada push a `main` y **está en
  verde** en el commit actual (`eac16e1`, run `29218218470`, conclusion `success`). El workflow de
  `Release` (changesets + `pnpm publish`) **falla** en sus 2 corridas hasta ahora — el paquete
  sigue sin publicarse en npm; ver "Riesgos".
- **Workstream 1 (i18n):** `CopyProvider`/`useCopy`/`useFormatCurrency` — contrato de copy
  inyectable con diccionarios `en`/`es`, reemplaza el copy bilingüe mezclado que el audit marcó P0.
- **Workstream 2 (RTL):** sweep de propiedades lógicas CSS en 16 componentes — con 4 TODOs
  documentados y sin resolver (indentación de `TraceTree`, centrado de `Dialog`, estilos inline de
  `ProcessValueTile`, virtualizador de `DataTable`).
- **Workstream 3 (a11y P0):** `Button` gana prop `loading`; `ApprovalGateCard` gana estado en
  vuelo (deshabilita las 3 acciones mientras una corre) + confirmación real para
  `riskTone="block"` en vez de ejecutar directo — cierra el P0 "approvals irreversibles sin
  fricción"; nuevo primitivo `ErrorState` (cva sobre `Alert`), wireado en `DataTable`/
  `ExecutionHistoryTable`.
- **Workstream 4 (perf):** `TraceTree` virtualizado, `AgentCore` pausa fuera de viewport.
- **Workstream 5 (mobile a11y):** touch targets 24px + piso tipográfico.
- **Agent Gallery por industria:** 24 agentes nuevos en 4 sectores (Legal & Compliance, Petroleum
  & Energy, Software & Networks, Industrial & Logistics), portados de una segunda referencia HTML
  del usuario, con un único contexto WebGL compartido entre instancias de `AgentCore` por
  performance (`feb0b05`…`4a681e4`). Nota: 2 de esos 4 sectores (Legal, Industrial & Logistics) no
  corresponden a las 5 industrias objetivo de este DS — es reorganización de identidad visual del
  laboratorio, no una vertical de negocio nueva (no confundir con las áreas E/F, que sí son
  verticales completas).

Todo esto es deuda técnica y calidad real (y necesaria), pero **cero filas del catálogo de gaps
de la semana pasada se cerraron**.

**Vercel AI SDK (novedad externa más concreta):** `ai@7.0.19` (9-jul-2026) agrega
`fingerprintTools`/`detectToolDrift` para detectar tools MCP que mutan su definición después de
ser aprobadas ("rug pull"). Combinado con literatura de seguridad MCP de 2026 que trata esto como
vector de ataque activo, es una categoría de UI que este catálogo no cubre — nueva fila
`ToolIntegrityIndicator` en área B. Fuentes: [Vercel AI SDK changelog](https://vercel.com/changelog),
[policylayer.com/attacks/mcp-rug-pull](https://policylayer.com/attacks/mcp-rug-pull).

**EU AI Act:** sin cambio de contenido; deadline mecánico más preciso — el Digital Omnibus debe
publicarse en el Diario Oficial **a más tardar el 30-jul-2026** para entrar en vigor el 2-ago-2026.
A esta fecha (2026-07-13) sigue sin confirmarse la publicación en EUR-Lex. Fuentes:
[Bird & Bird](https://www.twobirds.com/en/insights/2026/ai-act-,-a-,-provisionally-agreed-ai-digital-omnibus-consolidated-version),
[axis-intelligence.com](https://axis-intelligence.com/eu-ai-act-news/).

**n8n / Temporal / OpenAI / Anthropic / IBM Carbon / Adobe Spectrum:** todos revisados, sin
cambios sustantivos de patrón esta semana. Anthropic solo publicó features administrativas
(tabs de uso en consola admin de Claude Code, expiración de API keys, "Reflect") sin relevancia
de UI de agentes.

**Salud (reconfirmación):** el patrón "activity panel separation" (mostrar una recomendación a la
vez + panel de evidencia + override de un clic) sigue siendo el estándar de facto en UI clínica de
IA — mismo hallazgo de la semana pasada ("Explainability on Demand"), ahora con una fuente
adicional que agrega urgencia: proyección de que los reclamos legales "death by AI" superarán
2000 para fin de 2026 por guardrails insuficientes. Sigue sin vertical propia en el catálogo — la
oportunidad de pionero más clara, sin cambio de análisis. Fuente:
[fuselabcreative.com/ui-design-for-ai-agents](https://fuselabcreative.com/ui-design-for-ai-agents/).

## Score de cobertura

Catálogo ampliado a **64 ítems** (antes 63; +1 fila `ToolIntegrityIndicator` en área B, +1 fila
subió de ❌ a 🟡 en área D):

| Área | ✅ | 🟡 | ❌ | Total | Cobertura (✅) | Cobertura ponderada (✅=1, 🟡=0.5) |
|---|---|---|---|---|---|---|
| A. n8n / proceso empresarial | 7 | 0 | 1 | 8 | 88% | 88% |
| B. Agent ops / consola de IA | 18 | 0 | 4 | 22 | 82% | 82% |
| C. Auditoría / compliance | 6 | 0 | 5 | 11 | 55% | 55% |
| D. Table stakes enterprise | 2 | 4 | 4 | 10 | 20% | 40% |
| E. Comercial / RevOps | 6 | 0 | 0 | 6 | 100% | 100% |
| F. Industrial / OT | 7 | 0 | 0 | 7 | 100% | 100% |
| **Total** | **46** | **4** | **14** | **64** | **72%** | **75%** |

Prácticamente plano vs la semana pasada (73%/75% → 72%/75%) — coherente con que el trabajo de la
semana fue calidad, no catálogo: sube 1 fila de D (i18n/RTL, ❌→🟡, ver detalle en `NORTH_STAR.md`)
pero se agrega 1 gap nuevo en B (`ToolIntegrityIndicator`), que se cancelan casi exactamente.

## Top 5 gaps priorizados (backlog para el loop de construcción de 5h)

1. **AgentHandoffMarker + CheckpointBadge** — prioridad #1 por **tercera semana consecutiva**
   (iteración 15 → ladder §07 → semana de calidad, ninguno las tocó). Marcadores puntuales sobre
   `RunTimeline`/`TraceTree`/`ExecutionTimeline` ya existentes; bajo esfuerzo. Si la próxima semana
   tampoco se cierran, vale la pena investigar si hay un bloqueo estructural en vez de solo
   prioridad.
2. **ToolIntegrityIndicator (tool-definition drift)** — nuevo esta semana; Vercel AI SDK ya lo
   resuelve a nivel de SDK, sin UI equivalente en este catálogo. Extender `GuardrailIndicator` en
   vez de construir desde cero.
3. **RBACMatrixViewer** — área C en 55%; vocabulario de actor/provider ya existe en
   `ModelProvenanceCard`/`ApprovalChainStepper`.
4. **CommandPalette + Density modes sitewide + DateRangePicker** — área D sigue la más rezagada
   del catálogo (20%/40%); dependencias ya decididas (`cmdk`, `react-aria-components`).
5. **AgentAnomalyIndicator + VendorRiskCard** — ambas arrastradas de la semana pasada (FINRA /
   SOC2 2026 respectivamente), sin cambio de análisis.

(`WorkflowCanvasFrame` sigue fuera del top 5, mayor esfuerzo del catálogo restante. Vertical de
salud sigue siendo la oportunidad de pionero de mayor plazo — ningún competidor visible tiene una
vertical clínica construida todavía y la señal regulatoria/UX sigue acumulándose semana a semana.)

## Riesgos

- **Release/npm publish sigue roto:** el workflow `Release` (`.github/workflows/release.yml`) se
  ejecutó 2 veces esta semana y **falló las 2** (`conclusion: failure`, runs `29205461478` y
  `29218218448`) — el `NPM_TOKEN` requerido probablemente no está configurado como secret del
  repo. Resultado: `@duly/*` sigue en v0.0.0, sin publicar, consumible solo por clon del monorepo.
  El audit "impeccable" ya lo marcó P0-dist ("Nada publicado en npm... Bloqueador #1 de control
  plane") — la infraestructura de CI/release ya existe, pero el bloqueador de fondo (secret de
  npm) sigue sin resolverse. Fuera de mi alcance arreglarlo (solo toco `.md`), pero vale la pena
  que el loop de construcción o el usuario lo revisen — es la brecha más concreta entre "parece
  publicado" (hay workflow) y "está publicado" (no hay paquete).
- **`AgentHandoffMarker`/`CheckpointBadge` llevan 3 semanas sin cerrar** pese a ser prioridad #1
  en cada reporte desde la iteración 15 — dos loops de construcción distintos (ladder §07, semana
  de calidad) corrieron con agendas propias y ninguno las tocó. Si sigue así una semana más, el
  problema deja de ser "orden de prioridad" y pasa a ser señal de que el backlog de este documento
  no está llegando al loop de construcción de forma efectiva.
- **`AGENTIC_EXPERIMENTS_LOG.md` sigue desactualizado** — se detiene en la iteración 15
  (2026-07-04T19:15:00Z); toda la actividad posterior (ladder, workstreams 1-5, agent gallery por
  industria) solo vive en mensajes de commit y specs, no en el log narrativo. Mismo riesgo
  señalado la semana pasada, sin resolver.
- **Regulatorio, ventana agotándose:** el Digital Omnibus debe publicarse en el Diario Oficial a
  más tardar el 30-jul-2026 — quedan ~2 semanas y media a la fecha de este reporte sin
  confirmación en EUR-Lex. Sin señal de retraso todavía, pero la próxima revisión (2026-07-20)
  debería traer una respuesta definitiva.
- **Cobertura por área sigue muy desigual:** D (table stakes, 20%/40%) sigue siendo la más
  rezagada, por debajo de C (compliance, 55%) — la mejora de i18n/RTL a 🟡 ayuda pero
  `CommandPalette`/`DateRangePicker`/Data-viz tokens siguen en ❌ puro.
