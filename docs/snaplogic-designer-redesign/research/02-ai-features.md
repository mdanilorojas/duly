# Features de IA de SnapLogic + estado del arte de "AI explain" en canvases de nodos

> Investigación de respaldo del prototipo `duly-flow.html`. Parte 1: qué tiene SnapLogic.
> Parte 2: cómo lo resuelven los competidores, para diseñar por encima.

---

# Parte 1 — SnapLogic

## 1. SnapGPT

**Qué es.** Copiloto nativo de SnapLogic — "the world's first generative integration solution" en su propio marco — que traduce lenguaje natural a pipelines configurados, usando LLMs más RAG "to improve results based on existing assets such as pipelines, Snaps, and expressions".

**Superficie de UI (confirmada de la guía para principiantes).** SnapGPT es un **panel de chat**, no un modal:
- Se lanza con "the SnapGPT button in the upper-right corner of the SnapLogic web interface".
- Al hacer clic abre "a new box … on the right-hand side of the SnapLogic web interface" (panel lateral persistente, no overlay).
- Se puede forzar abierto por defecto vía **User Settings > Opt-in Features > "Open SnapGPT by Default."**
- Cada respuesta lleva **íconos de pulgar arriba / abajo**.
- También se lanza contextualmente desde los settings de un Snap abierto ("Launch SnapGPT from Snap settings" / **Snap Copilot**), donde da sugerencias de configuración y puede aplicar settings directamente.

**Modos (Think / Plan) — reales, documentados y con restricción de UX.**
- **Think mode**: razonamiento más profundo para análisis, Q&A, descripciones, generación de expresiones/SQL.
- **Plan mode**: un "conversational planning loop" para generar/refinar pipelines — aclara requisitos, alinea intención de negocio, saca a la luz problemas *antes* de generar.
- **Lock-in de modo**: "Think and Plan modes lock after you send the first message in a session; to switch modes you must start a new chat." Sin cambio de modo a mitad de conversación.

**Capacidades confirmadas (frases exactas de la navegación de docs + página de producto):**
- "Generate pipeline", "Analyze pipeline", "Generate queries" (SQL), "Generate expressions" (para Mapper Snaps), "Generate a pipeline from an image", "Refine pipelines", "Configure Snaps with Snap copilot", "Get insights on the Snaps preview data", "Check Snaplex health", "Analyze a failed pipeline execution", "Plan Snaplex capacity".
- Insight sobre preview data: SnapGPT "can analyze the preview data from Snaps of a successfully validated pipeline and surface insights into key fields, business and validation rules, and Personally Identifiable Information (PII)". También marca **componentes deshabilitados o duplicados**.
- Prompts de muestra de la guía (dan el grano exacto de NL→pipeline):
  - "Create a Pipeline using Salesforce Read to fetch my Opportunities, Filter out any opportunities outside of the last fiscal quarter, then write them to Snowflake"
  - "Create a single-snap pipeline with a JSON Generator that has 10 example Salesforce Lead records."
  - "Fetch exchange rate data from the European Central Bank and save it to a JSON file."
  - "What snap can I use to remove records from my pipeline based on a given condition?" (Q&A puro, sin generación)

**Los cuatro pilares de ciclo de vida (framing actual, relanzamiento de julio 2026 como "agentic assistant for the full integration lifecycle"):**

| Pilar | Tagline | Contenido |
|---|---|---|
| **PLAN** | "Get it right the first time" | Aclarar requisitos, explorar enfoques, validar diseño antes de generar |
| **BUILD** | "Democratize integration across your team" | Generar/refinar pipelines, escribir SQL, refinar expresiones de mapeo; generación multi-pipeline, refactor inteligente, librerías de expresiones reutilizables, generación NL de SnapLogic MCP Servers, validación de ejecución *durante* la generación |
| **UNDERSTAND** | "Onboard new users faster, eliminate expertise gap" | Analizar pipelines existentes, explicar lógica de integración, auto-generar documentación, apoyándose en el historial de proyectos de la propia org ("Project Context") |
| **OPERATE** | "Move from pipeline failure to resolution faster" | **Monitor Insights** — diagnóstico/troubleshooting con IA de salud de pipeline y Snaplex (GA agosto 2026); **SnapGPT Activity Log** — visibilidad de admin sobre la actividad asistida por IA |

**Gobernanza/límites:** corre sobre modelos fundacionales "through AWS Bedrock" (multi-modelo). "Customer prompts not used for model training." Los admins pueden habilitar/deshabilitar SnapGPT a nivel org y controlar qué preview data puede ver.

**Quotes de clientes:**
> "Our team of developers has used SnapGPT to create and test integration workflows in under an hour, compared to days." — Nancy Mustachio, Barnard College
> "I am impressed with SnapGPT's ability to translate natural language text to quickly build out accurate, end-to-end pipeline templates." — Del Hines, Acxiom

---

## 2. AgentCreator / Agent Studio / AgentSnaps

**Posicionamiento.** AgentCreator es el nombre de producto para construir agentes — "build LLM-powered agents, assistants, and applications" combinando orquestación de pipelines con "real-time generative decision-making". **No es un canvas separado** — los agentes se construyen como pipelines normales usando Snap Packs especializados.

### 2a. El patrón Agent Driver / Agent Worker — terminología real confirmada

- **Agent Driver pipeline** = orquestador. Recibe el mensaje de chat entrante, define el system prompt, formatea la petición del usuario + historial en un array de mensajes, configura qué tools están disponibles, y maneja el loop vía el **PipeLoop Snap**.
- **Agent Worker pipeline** = ejecutor de una sola iteración. Maneja una llamada al LLM: invocar con instrucciones + tools → decidir (responder directo vs. llamar tool) → ejecutar tool vía su propio sub-pipeline → formatear resultados → agregar a la conversación.
- **Terminación del loop**: el PipeLoop del Driver revisa si el último output del LLM fue parcial/petición de tool o respuesta final (stop reason `"stop"` / `"end_turn"`).

### 2b. Las cuatro clases de Snap para tool-calling (release nov 2024)

1. **Function Generator Snap** — "Generates a tool definition". Variantes: **Multi Pipeline Function Generator**, **OpenAPI Function Generator**.
2. **Tool Calling Snap** — específico por proveedor (OpenAI, Azure OpenAI, Anthropic, AWS Bedrock).
3. **Function Result Generator Snap** — "Formats the results generated by user-run functions into a unified structure".
4. **Message Appender Snap** — agrega resultados de tools al array de mensajes (mantiene estado de conversación entre iteraciones).

### 2c. Agent Snap (release nov 2025) — la consolidación en un solo Snap

- "Agents are autonomous LLM-based processes that can interact with external systems to carry out a high-level goal".
- **Específico por proveedor**: Agent Snaps separados por LLM ("Amazon Bedrock Converse API Agent", "OpenAI Chat Completions Agent", "Azure OpenAI Chat Completions Agent", "Google Gemini API Agent").
- **Superficie de config**: params estándar de LLM, **iteration limit**, **thread count** (ejecución paralela de tools), botón **"Visualize Agent Flow"**, toggle **"Reuse tool pipeline"**, checkbox opcional **"Monitor tool call"**.
- Cada tool necesita un **pipeline path**; si falta, el Snap lanza **warning y no procede**. Los outputs de tools se recolectan enteros, *excepto* campos llamados `"messages"` o `"contents"` — se tratan como historial de conversación de sub-agente y se filtran del resultado del padre.
- **Salvaguardas integradas** (3 tipos de warning): límite de iteración excedido antes de completar tool calls; falta pipeline path; nombres de tool duplicados (se renombran automáticamente).
- La nota de prensa de nov 2025 lo llama "Snaplex-native execution engine" con soporte de "human-in-the-loop oversight". Junto con: **MCP Client GA** (OAuth 2.0 "coming") y un **Agent Governance Framework**.

### 2d. Agent Visualizer — la capa de observabilidad

- **Interfaz de vista dual**: un **Diagram** interactivo + una vista **Log** paso a paso, "enabling users to trace and analyze agent behavior precisely".
- Se lanza desde el botón "Visualize Agent Flow" del Agent Snap (post-ejecución) o standalone desde Monitor.
- Muestra qué tools se llamaron y en qué secuencia — la respuesta de SnapLogic a "por qué el agente hizo X", pero acotada a pipelines *agénticos*, no a ETL normal (ahí lo que aplica es "analyze pipeline" de SnapGPT).

### 2e. Prompt Composer

- Herramienta no-code de autoría de prompts dentro de AgentCreator, con su propio **"SnapGPT for Prompts"** (IA ayudando a escribir el prompt que configura tu agente).
- Tiene página de referencia "Prompt Composer Layout", flujo "Get Started" y docs de troubleshooting dedicados — implica puntos de fricción conocidos.

### 2f. SnapCode + SnapLogic MCP Server (julio 2026)

Distinto de AgentCreator (que construye agentes *dentro* de SnapLogic) — esto expone SnapLogic *a* agentes de código externos:
- **SnapCode**: generar código de pipeline SnapLogic listo para producción desde lenguaje natural *dentro de Claude Code* (incluida la extensión de VS Code), manejable con SDLC estándar (git, code review), con acceso a 1.000+ conectores.
- **SnapLogic MCP Server**: capa de integración headless que expone operaciones de la plataforma (deploy, execute, validate, manage) vía MCP a cualquier cliente agente.
- Quote (CTO Jeremiah Stone): "Enterprise builders should not have to choose between the speed of AI coding agents and the governance enterprises require."
- GA 7 de julio de 2026.

---

## 3. AutoSuggest / Iris AI

**Linaje**: Iris (primavera 2017) → rebautizado/evolucionado a **AutoSuggest**.

**UX original de Iris (2017), aún representativa arquitectónicamente:**
- Arrastras el primer Snap al canvas → Iris "instantly kicks in and highlights the next suitable Snap" directamente sobre el canvas, *además* de mostrar una lista rankeada de Snaps recomendados en un **panel derecho**.
- Las sugerencias continúan en cada paso "until you select a snap with closed output".
- Opt-in vía ícono de Settings (no encendido por defecto originalmente).

**Qué es real vs. marketing — el hallazgo crítico**: el propio FAQ de AutoSuggest de SnapLogic dice explícitamente que **"currently does not use Generative AI or Large Language Models."** Es ML clásico — string matching, fuzzy string matching y pattern matching sobre el historial de mapeos por org, entrenado sobre "petabytes of integration metadata" / "seven years of ML investment".

Esto es una **separación deliberada de producto**: AutoSuggest = recomendador ML tradicional (next-Snap, sugerencias de mapeo de campos en Mapper), SnapGPT = IA generativa. Significa que SnapLogic corre **dos subsistemas de IA en paralelo** con perfiles de confianza/explicabilidad distintos, no uno.

---

## 4. Otros asistentes (explicación, docs, linaje, error, costo/perf)

- **Generación de documentación**: SnapGPT auto-genera documentación de pipelines, "aiding understanding, maintenance, and reuse" (desde el GA de agosto 2023).
- **Explicación de pipeline**: "analyzes existing pipelines and explains integration logic" (pilar UNDERSTAND), apoyado en el historial de proyectos de la org.
- **Insight de datos / PII**: puede inspeccionar el preview de un pipeline *validado con éxito* y exponer "key fields, business and validation rules, and PII" — la explicación está condicionada a haber corrido el pipeline al menos una vez, no es análisis estático.
- **Lint estructural**: marca componentes deshabilitados o duplicados.
- **Diagnóstico de fallos**: "Analyze a failed pipeline execution" (lado Designer) y **Monitor Insights** (pilar Operate, GA agosto 2026) — extiende el diagnóstico hacia *producción*, más planeación de capacidad de Snaplex.
- **Data lineage**: feature de suscripción aparte (no marca SnapGPT) — rastrea el flujo de datos end-to-end vía pipelines ejecutados, expuesto por API que devuelve resultados en el estándar **OpenLineage**. No hay evidencia de que esté narrado por LLM; son datos estructurados de linaje.
- **Observabilidad de admin**: **SnapGPT Activity Log** da visibilidad de qué acciones asistidas por IA se tomaron en la org.

---

## 5. Línea de tiempo (2017–2026)

| Fecha | Hito |
|---|---|
| Primavera/mayo 2017 | **Iris** — primer asistente ML de sugerencia de Snap/pipeline |
| ~2020 | Iris evoluciona bajo el framing de "self-learning assistant" |
| Oct 3, 2023 | **SnapGPT preview** anunciado, posicionado sobre Amazon Bedrock |
| Ago 2, 2023* | **SnapGPT GA** — gratis para clientes nuevos y existentes; GA: prototipado de pipelines, auto-documentación, generación de datos de muestra, asistencia contextual; preview en SnapLabs: NL→SQL, NL data-mapping. *(la fecha de GA precede al anuncio de preview de octubre — probablemente rollout por fases; secuencia exacta `[unverified]`)* |
| Nov 2024 | **AgentCreator**; **Tool Calling Snaps** + patrón Agent Driver/Worker documentado |
| Nov 4, 2025 | **Agent Snap** GA, **MCP Client GA**, **Agent Governance Framework**, SnapGPT gana soporte de "Extended Thinking" |
| Jul 7, 2026 | **SnapCode** + **SnapLogic MCP Server** GA |
| Jul 2026 | **Relanzamiento de SnapGPT** como asistente agéntico de ciclo de vida completo — Plan Mode, generación multi-pipeline, refactor inteligente, librerías de expresiones, NL→MCP Server, Project Context, Activity Log GA |
| Ago 2026 | **SnapGPT Monitor Insights** GA (diagnóstico con IA del lado producción) |

**Estado del arte al agosto 2026**: SnapLogic corre un **stack de IA de tres capas** — (1) AutoSuggest, recomendador ML no-LLM para next-Snap/mapeo de campos; (2) SnapGPT, copiloto chat con LLM que ahora cubre Plan→Build→Understand→Operate incluido el monitoreo de producción; (3) AgentCreator/Agent Snap/MCP, para construir y exponer agentes autónomos *como* pipelines, con un Agent Visualizer dedicado. El borde más nuevo (SnapCode/MCP Server) extiende esto hacia afuera, a agentes de código externos, en vez de mantenerlo dentro de Designer.

---

# Parte 2 — Estado del arte: explicación de IA sobre/junto al nodo

## n8n
- **AI Assistant** ("Ask n8n AI"): panel de chat que corre standalone o se expande a **vista lado a lado con el canvas**. Dada una descripción en lenguaje plano, planea, propone un plan estructurado, hace preguntas de aclaración, **construye el workflow directamente en tu proyecto**, lo ejecuta y **corrige los errores que encuentra** — loop cerrado build-test-fix, no solo explicación.
- **Debug helper tool**: acotado a resolver problemas de ejecución de nodo — muestra la causa probable cuando un nodo falla.
- Reportes de comunidad (2025–2026) muestran fricción activa: renderizado roto del nodo AI Agent tras upgrades, dropdowns de modelo/proveedor vacíos. `[patrón recurrente, no verificado como estado actual]`

## Zapier (Copilot + Canvas)
- **Copilot**: asistente conversacional transversal. Describes un workflow → propone un esquema de trigger + acciones → **auto-build** llena cada paso con la app, el evento de acción, la cuenta ya conectada y los mapeos de campo automáticamente conforme apruebas.
- **Canvas**: capa de **mapa de proceso/diagrama** separada, encima de los Zaps. Puedes chatear con Copilot *desde dentro de Canvas* para modificar el diagrama; Copilot propone un preview antes de comprometerlo.
- Zapier separa explícitamente "construir la automatización" (Copilot sobre Zaps) de "visualizar/planear el sistema" (Canvas) — dos superficies distintas tocadas por IA, no una.

## Make.com
- Los AI Agents son **nodos de primera clase directamente en el Scenario Builder visual** (no un añadido).
- **Mecanismo de transparencia**: "visual execution plus a reasoning panel" — logs paso a paso, tool calls, y (en rollout) razonamiento, mostrados en vivo mientras el agente trabaja. Es el análogo más cercano al Agent Visualizer de SnapLogic (diagrama + log dual).

## Workato
- **Recipe Copilot**: guía la construcción de recetas en todos los niveles de habilidad, autocompleta pasos.
- **Capacidad explícita de "explain this step"**: "aid in understanding recipe steps, clarifying the purpose of each step within an existing recipe", con profundidad de explicación **concisa o detallada** a elección del usuario — precedente directo de patrón de interacción (toggle de verbosidad sobre explicaciones).
- Sketch-to-recipe: dibujas un flujo y Copilot "converts your sketch into an actual recipe".
- **Workbot** (Slack/Teams): permite ver datos y disparar automatizaciones conversacionalmente, fuera del canvas.
- **Copilot in formula mode** — asistencia inline específica para el editor de expresiones/fórmulas.

## Boomi (Boomi GPT / AgentStudio)
- Se accede vía **ícono de Agentstudio en el Home → Agent Garden → pantalla de Chat** — superficie de chat dedicada, no panel inline en el canvas.
- Orquesta tres sub-agentes: **Boomi DesignGen** (diseña procesos desde "300M+ patterns and best practices" — claim de escala, `[unverified]`), **Boomi Answers**, **Boomi Scribe**.
- Flujo: prompt → esquema de integración/proceso/API/modelo de datos maestro → aceptar o modificar.
- Chat-first en vez de embebido en el canvas — decisión arquitectónica distinta a n8n/Make/Workato.

## MuleSoft / Einstein Copilot
- Einstein Copilot es un asistente **a nivel plataforma Salesforce**, no nativo de MuleSoft; el rol de MuleSoft es exponer APIs como **Copilot Actions**.
- No se confirmó una feature nativa de "explain this flow" / "why did this fail" en Anypoint Studio desde docs oficiales — herramientas de terceros (p.ej. Curie) llenan el hueco. Tratar la explicación nativa on-canvas de MuleSoft como **débil/no confirmada**. `[unverified — puede no existir]`

## Retool AI
- **"Ask AI" en el editor de queries**: asistente acotado, disparado por ícono o escribiendo `/`. Acción explícita de **"Explain"**: "Add comments to explain what each part of a query does" — o sea, comentarios inline generados por IA como superficie de explicación, dentro del editor SQL/JS/GraphQL, no en un panel lateral.
- **Generación a nivel app**: describes una app en inglés → UI + queries CRUD + transforms; refinas seleccionando un componente o `@mention`-eando una query para acotar la siguiente edición de la IA.

## LangGraph Studio
- **State Inspector**: muestra el dict de estado (p.ej. `messages`, `tools_used`) en cada frontera de nodo — valores antes/después por paso.
- **Graph Mode**: diagrama animado en vivo con rutas de ejecución, estados intermedios, debugging paso a paso completo.
- **Errores renderizados directamente en el nodo donde ocurrieron** (stack trace inline en el nodo que falló, no en un panel de log aparte) — patrón fuerte y específico.
- **Interrupt + time-travel**: editar el estado del agente antes/después de que un nodo ejecute, y **repetir cualquier corrida desde cualquier punto**.
- **Diffs de estado en cada frontera de nodo** — UI de diff explícita, no solo inspección de snapshot.

## Flowise / Dify
- **Dify**: debugging **step-run** a nivel de nodo — seleccionas el nodo y le das "Run" en aislamiento; el botón **"Last run"** abre un panel con inputs, outputs, timing y mensajes de error de ese nodo. Un **Variable Inspector** muestra outputs cacheados de corridas previas y permite **editar variables cacheadas** para probar nodos downstream contra datos hipotéticos sin re-correr todo — patrón "what-if" distintivo. Hueco conocido: los nodos Answer/End no soportan prueba aislada.
- **Flowise**: los **traces** capturan inputs/outputs en cada paso como línea de tiempo; un botón "Message" abre la vista de debug de la conversación; la feature de **Evaluations** corre casos de prueba predefinidos y puntúa pass/fail contra outputs esperados — extiende "explicar" hacia "verificar".

## Prefect / Dagster
- **Dagster+AI / "Compass"** (asistente nativo de Slack): corre sobre el grafo de assets/linaje existente — "assets, runs, lineage, freshness, failures, and automation history" — para diagnosticar, explicar comportamiento y actuar. El **modelo de software-defined assets** (pipelines como assets con dependencias tipadas) es *por qué* esto funciona: la IA tiene contexto estructurado y consultable en vez de tener que parsear logs. También expone el **"blast radius"** de un fallo — impacto downstream, no solo causa raíz.
- **Prefect**: historia de linaje/IA nativa comparativamente más débil — orquestación más liviana sin el grafo de assets de Dagster.
- Dagster también publica una librería `dagster-io/skills` para Claude Code / Codex — el mismo patrón hacia herramientas de desarrollo que SnapLogic adoptó con SnapCode.

---

# 10 patrones de IA-sobre-nodo que vale la pena robar

1. **Error en la fuente, inline (LangGraph Studio)** — Disparador: el nodo lanza excepción. Superficie: stack trace renderizado **dentro de la caja del nodo que falló**, no en un log aparte. Contenido: excepción + qué estado upstream la causó. Descarte: se limpia solo en la siguiente corrida exitosa de ese nodo.

2. **Diff de estado en la frontera del nodo (LangGraph Studio)** — Disparador: modo step-through/replay. Superficie: vista de diff anclada a la arista entre dos nodos. Contenido: qué cambió en el objeto de estado al cruzar esa arista (claves agregadas/eliminadas/modificadas). Descarte: avanza automáticamente al moverte adelante/atrás.

3. **Edición what-if sobre output cacheado (Dify)** — Disparador: clic en el panel "Last run" de un nodo. Superficie: Variable Inspector inline. Contenido: valores de input/output cacheados, editables en sitio. Descarte: cierra al re-correr; los nodos downstream re-ejecutan contra el valor editado sin re-correr todo el flujo.

4. **Toggle de verbosidad sobre la explicación del paso (Workato)** — Disparador: acción "explain this step" en un paso de la receta. Superficie: bloque de texto expandible debajo/al lado del paso. Contenido: el usuario elige profundidad **concisa vs. detallada** antes de generar. Descarte: colapsa de vuelta a un resumen de una línea.

5. **Panel de razonamiento sincronizado con la ejecución en vivo (Make.com)** — Disparador: corre un nodo de AI Agent. Superficie: panel lateral persistente junto al canvas. Contenido: logs paso a paso + tool calls + (en rollout) cadena de razonamiento, actualizándose en tiempo real. Descarte: el panel persiste entre corridas; lo cierra el usuario.

6. **Traza dual diagrama+log del agente (SnapLogic Agent Visualizer / panel de razonamiento de Make)** — Disparador: botón "Visualize Agent Flow" tras una corrida. Superficie: modal/tab con dos vistas sincronizadas — **diagrama** interactivo (qué tools se llamaron, en qué orden) y **log** detallado. Contenido: secuencia de tool calls, params, resultados. Descarte: se cierra como modal normal; re-abrible por corrida pasada.

7. **"Ask AI" acotado dentro del editor de expresión/query (Retool, Snap Copilot de SnapLogic, formula mode de Workato)** — Disparador: clic en un ícono o `/` dentro de un campo/editor específico (no el canvas entero). Superficie: popover anclado a ese editor. Contenido: acciones de IA acotadas solo a esa query/expresión — explicar, arreglar, generar — con **"explicar" emitiendo comentarios inline** en vez de una descripción aparte. Descarte: cierra al perder foco o al completar la acción.

8. **Exposición del blast radius del fallo (Dagster)** — Disparador: falla un asset/run. Superficie: banner o panel inline en el nodo fallido. Contenido: no solo "por qué falló" sino "qué se rompe downstream" — un grafo de impacto hacia adelante. Descarte: se limpia cuando el asset se re-materializa con éxito.

9. **Edición acotada por selección vía @mention (Retool)** — Disparador: el usuario selecciona un componente del canvas o escribe `@nombre-de-query` en el chat. Superficie: el mismo panel de chat, pero la siguiente acción queda **acotada solo a ese elemento**. Contenido: la IA edita/regenera únicamente el nodo/query seleccionado. Descarte: el alcance se resetea tras aplicar la edición.

10. **Conversación de planeación con modo bloqueado (SnapGPT Plan Mode)** — Disparador: el usuario abre un chat nuevo y elige "Plan" antes del primer mensaje. Superficie: el mismo panel lateral, pero bloqueado en un loop de aclarar-primero. Descarte: el modo queda fijo para esa sesión; cambiarlo exige un chat nuevo — una fricción deliberada que evita que "explicar/planear" y "generar" se mezclen a mitad de conversación.

---

## Nota sobre calidad de la evidencia

- Fuentes primarias más fuertes: docs oficiales de SnapLogic, páginas de producto y notas de prensa — confianza alta.
- WebFetch contra `docs.snaplogic.com` devolvió con frecuencia **navegación/TOC en vez del cuerpo de la página**; varios hallazgos se reconstruyeron de snippets de búsqueda y referencias cruzadas, no de lecturas completas. Marcado `[unverified]` donde un dato específico no se pudo corroborar en dos fuentes.
- La inconsistencia GA agosto 2023 vs. "preview" octubre 2023 se deja explícita en vez de resolverla en silencio.
- No se pudo confirmar que MuleSoft tenga "explain flow" / "why did this fail" nativo en Anypoint Studio — marcado como hueco, no asumido presente.
