# SnapLogic Designer — anatomía de la UI

> Investigación de respaldo del prototipo `duly-flow.html`. Recopilada de docs oficiales
> (docs.snaplogic.com, docs-snaplogic.atlassian.net/wiki/spaces/SD), community.snaplogic.com
> y agregadores de reviews (G2, TrustRadius, PeerSpot, Capterra, Gartner Peer Insights).
> Lo no verificable directamente va marcado `[unverified]`.

---

## 0. VOCABULARIO (glosario base)

| Término | Definición |
|---|---|
| **Snap** | Conector/componente que hace una función en un pipeline — leer, parsear, transformar o escribir. Bloque de construcción del Pipeline. [docs.snaplogic.com/snaps/snaps-about.html] |
| **Snap Pack** | Colección versionada de Snaps relacionados agrupados por sistema/dominio (Salesforce Snap Pack, REST Snap Pack, Core Snap Pack). Se instala/actualiza como unidad. |
| **Pipeline** | Flujo construido conectando Snaps; define la lógica de transformación. Abre en su propia pestaña en Designer. |
| **Pipeline Parameters** | Variables a nivel de pipeline, referenciadas con `_parameterName`, para reutilización entre entornos/tasks. |
| **Snaplex** | El runtime de ejecución (cluster JVM) donde corren los Pipelines. Dos sabores: |
| — **Cloudplex** | Snaplex gestionado por SnapLogic en su nube; habla directo con el control plane. |
| — **Groundplex** | Snaplex auto-gestionado por el cliente (on-prem o su VPC) para acceder a datos detrás del firewall. |
| **Ultra Pipeline / Ultra Task** | Pipeline desplegado para consumir documentos de forma continua con baja latencia; queda "siempre encendido" en vez de correr hasta terminar. |
| **Triggered Task** | Despliega un pipeline como endpoint HTTP(S) para que clientes externos lo invoquen como servicio. |
| **Scheduled Task** | Despliega un pipeline para correr automáticamente según un cron. |
| **Expression Language** | Mini-lenguaje con sintaxis JavaScript disponible en los campos de un Snap. Parámetros como `_parameterName`; `$.eval()` para sustituir parámetros sin togglear modo expresión. Campos con `$` (`$fieldName`, `$['Home address']`). |
| **Views** | Los puntos de conexión de un Snap: **Input**, **Output** y **Error**. Se configuran en el tab Views del diálogo de Settings. |
| **Account** | Objeto de credencial/conexión que un Snap usa para autenticarse contra un sistema externo. |
| **Org** | Tenant/organización de nivel superior (frontera de billing + admin). |
| **Project Space** | Contenedor organizacional dentro de un Org para agrupar Projects — usado para control de acceso. |
| **Project** | Carpeta dentro de un Project Space con Pipelines, Accounts, Files, Tasks. |
| **Asset** | Término genérico para cualquier cosa gestionable: Pipeline, Account, File, Task, Snap Pack, Table, Snaplex, Flow. |
| **SnapGPT** | Asistente de IA generativa embebido en Designer/Monitor. Genera pipelines, expresiones, mapeos y SQL desde lenguaje natural; analiza preview data y diagnostica fallos. |
| **Iris / AutoSuggest** | Nombre legacy del asistente ML anterior que sugería Snaps siguiente/anterior y expresiones según patrones de uso. Absorbido por SnapGPT. |
| **AgentCreator** | Toolkit para construir agentes de IA sobre la plataforma — producto adyacente, no Designer core. |

---

## 1. CHROME GLOBAL

- Áreas de producto confirmadas accesibles desde el tope de la interfaz IIP: **Designer**, **Manager**, **Dashboard**. Un rediseño de septiembre 2022 dio "a new look and feel across the Designer, Manager, and Dashboard".
- **Dashboard** es una interfaz de reportes con sub-tabs: **Health, Pipeline, Task, Snaplex, Insights, API**.
- Pain point de reviewer en G2/TrustRadius: *"the navigation when switching from Designer, Manager and Dashboard requires 3 tabs to be open on your browser, which is a little cumbersome"* — implica que son **pestañas/URLs separadas, no un shell SPA único**.
- Existe un punto de entrada **SnapGPT** global además del contextual. `[etiqueta/ícono exacto no confirmado]`
- Layout exacto de la barra superior (posición del logo, selector de project/space, menú de usuario, búsqueda global) **no confirmable con precisión de píxel** desde fetches de texto — las páginas de docs son SPA renderizadas por JS. `[unverified: layout exacto del header global]`
- Del rediseño 2022: *"canvas functions moved out from the toolbar to the canvas, and the toolbar section featuring buttons that are most frequently used, with rest of the buttons available by expanding the toolbar"* — confirma patrón de **toolbar colapsable/overflow**.

---

## 2. PANEL IZQUIERDO — Asset Palette

Nombre oficial: **Asset Palette**. *"The Asset Palette serves as the workbench in SnapLogic Designer and provides a dynamic display of the Snap, Pipeline, Pattern, and API Catalog."* Propósito declarado: libera espacio de canvas vs. el catálogo fijo viejo, y agrega búsqueda.

**Cuatro secciones/tabs**:
1. **Snaps** — Snap Catalog. Campo de búsqueda **"Search Snaps"**; resultados ordenables por **Name, Snap Pack, Snap Type** (Snap Types = **Read, Flow, Transform**, implicando que Write también existe).
2. **Pipelines** — Pipeline Catalog. **"Search Pipelines"**; alcance sobre los Project Spaces accesibles.
3. **Patterns** — Pattern Catalog (plantillas reutilizables), **"Search Patterns"**; según acceso, se pueden **abrir** o **importar**.
4. **APIs** — API Palette/Catalog, **"Search APIs"**.

Persistencia de estado: *"Menu settings, such as the scroll bar position, Search filter, and expand/collapse features, now persist when you switch between Pipelines and Pipeline Patterns."* — implica grupos colapsables tipo acordeón.

**Mecanismo para agregar al canvas**: **drag-and-drop** es el mecanismo documentado — *"You can drag a Snap from the Snap Catalog onto the Canvas to use it in a pipeline."* No se encontró evidencia de una alternativa click-to-add.

**Agrupación**: los Snaps se agrupan por **Snap Pack** (Salesforce, REST, Core, Amazon S3, Binary, Data Catalog, Email fueron nombrados como ejemplos), con Snaps individuales anidados bajo su pack.

**Asset Toolbar** (para el asset *seleccionado*), de izquierda a derecha: **Execute**, **Create** (submenú: Accounts / Files / Tasks / Pipelines / Snap Packs / Tables / Snaplexes / Flows), **Delete** (a Recycle Bin), **Move**, **Copy**, **Refresh**, **Version**. Solo se activan con uno o más assets seleccionados.

**Estilo de íconos**: los reviewers describen la metáfora de **pieza de rompecabezas** — *"SnapLogic's graphical user interface uses a jigsaw puzzle metaphor"* (PeerSpot), y los Snaps se comportan "like puzzle pieces" donde solo encajan tipos de conector compatibles. La geometría exacta del ícono **no está confirmada a nivel de píxel** `[unverified]`. Lo que SÍ está confirmado: cada Snap expone puntos de conexión tipados con forma de **círculo** (documento) o **rombo** (binario) — ver §3.

---

## 3. CANVAS

### Anatomía del nodo ("Snap")
- Cada Snap tiene **input view(s)** en el borde izquierdo y **output view(s)** en el derecho, dibujados como conectores sobre el cuerpo del nodo.
- **La forma del conector codifica el tipo de dato**: *"Views that are represented by a circle indicate that the Snap processes document data. Views that are represented by a diamond indicate that the Snap processes binary data."* Solo conectan formas iguales.
- **Estados de color de conector/link**:
  - View conectada = **azul** (*"the views ... turn blue, indicating that the Snaps are linked"*).
  - Snap **corriendo** = nodo **amarillo**.
  - Snap **exitoso** = nodo **verde**.
  - Color de fallo no capturado textualmente; rojo es la convención general de la plataforma `[parcialmente unverified]`.
- Tras validar/ejecutar con éxito, aparece un **ícono de preview** en el conector de salida; **clic (Windows) o doble clic (macOS)** abre el panel de preview de datos.
- **Error views**: tercer punto de conexión dedicado, cableable a un Snap downstream o a un **error pipeline** completo para procesar documentos fallidos sin detener el pipeline.

### Conexión / AutoLink
- Soltar un Snap **al lado o delante** de otro compatible los **autoconecta** (**AutoLink**) — nombre de feature confirmado en la lista de features de Designer.
- Conexión manual: arrastrar de un conector de salida al conector de entrada compatible.
- Geometría del link (recto vs. ortogonal) — `[unverified]`.

### Zoom / Pan / Fit / Minimapa
- Zoom in: **Shift+Ctrl+Plus** (Win) / **Shift+Cmd+Plus** (Mac). Zoom out: **Shift+Ctrl+Minus** / **Shift+Cmd+Minus**.
- Por la nota del rediseño 2022, **las funciones de canvas (zoom/pan/fit) viven directamente sobre el canvas**. Presencia de minimapa — `[unverified]`.

### Multi-select / Copy-Paste / Delete (tabla de teclado, verbatim de docs)

| Acción | Windows | Mac |
|---|---|---|
| Copy Snap/Snaps | Ctrl+C | Cmd+C |
| Paste Snap/Snaps | Ctrl+V | Cmd+V |
| Delete Snap/Snaps | Ctrl+Backspace | Cmd+Delete |
| Select all Snaps | Ctrl+A | Cmd+A |
| Select specific Snap | Ctrl+click | Cmd+click |
| Select multiple disconnected Snaps | Ctrl+click c/u, o Shift+click/drag (marquee) | Cmd+click c/u, o Shift+click/drag |
| Zoom in | Shift+Ctrl+Plus | Shift+Cmd+Plus |
| Zoom out | Shift+Ctrl+Minus | Shift+Cmd+Minus |
| Validate Pipeline | Shift+Click | Shift+Click |
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Shift+Z | Cmd+Shift+Z |
| Save Snap/Pipeline | Ctrl+S | Cmd+S |
| Open Universal Search | Ctrl+Shift+F | Cmd+Shift+F |

- Copy/paste multi-Snap: **clic derecho** sobre uno de los seleccionados para copiar; **pega en la posición actual del cursor**. Fue históricamente un **feature request** de la comunidad ("Feature request: Copy / paste multiple snaps at once") antes de existir.

### Anotaciones / Notas
- Feature: **"Notes"** (Pipeline Notes). *"Notes can be used to add comments to a Pipeline for future reference. Each note allows a maximum of 1000 characters."* Se pueden **mostrar/ocultar**, son **visibles para otros usuarios** y **persisten al copiar o mover** el Pipeline. Botón de toolbar: *"Add a note or delete an existing note. Notes are saved with the Pipeline."*
- No hay evidencia de un objeto sticky-note separado — Notes ES el equivalente.

### Pestañas de pipeline
- *"Each tab located at the top of SnapLogic Designer contains a Pipeline. Multiple tabs can be open at the same time."* Reordenables por drag. **El color del título señala el estado de guardado**: **título rojo = cambios sin guardar**, **negro = guardado**. Nuevo pipeline vía ícono **"Add a Pipeline"**.

### Inicio/fin del pipeline
- No hay un nodo "Start"/"End" documentado como tipo distinto — el inicio es el primer Snap sin input conectado (típicamente un Reader/Trigger); el fin son los Snaps sin salida downstream. `[unverified como marcador visual distinto]`

---

## 4. DIÁLOGO DE SETTINGS DEL SNAP

Al hacer clic en un Snap abre un modal/panel con (confirmado) exactamente cuatro tabs: **Settings**, **Account**, **Views**, **Info** — verbatim: *"a window with multiple tabs (Settings, Account, Views, Info)"*.

- **Settings**: configuración funcional del Snap (varía por tipo — filtros, mapeos, queries). Tipos de campo: texto, dropdown/picklist, y campos habilitados para expresión.
- **Views**: configura **cantidad y comportamiento de input, output y error views** — *"configure the number of input and output documents the Snap can support... configure the Snap behavior in case of any error during Snap execution."* Tiene un botón **"+"** para agregar una view y un ícono de guardar.
- **Account**: crear/seleccionar/almacenar el **Account** (credencial) que el Snap necesita.
- **Info**: notas libres sobre ese Snap individual (distinto de las Notes a nivel pipeline).
- **Toggle de expresión**: los campos que soportan el expression language llevan un botón **`=`** para alternar entre valor estático y expresión. `[sustancialmente verificado; glifo exacto unverified]`
- **Botón Suggest** para listas de esquema/campos: referenciado funcionalmente (AutoSuggest "recommending expressions based on the input schema") pero la etiqueta literal no fue capturada — `[unverified]`.
- **Validate & Execute**: es una **propiedad de ejecución a nivel de Snap**, no solo una acción de toolbar — *"**Validate & Execute** makes the snap run on both the validation and execution steps, **Execute** only makes the snap run on the execution step ... and **Disabled** prevents the snap from running."*

---

## 5. PREVIEW / PANEL DE DATOS

- **Disparador**: clic (Win) o doble clic (Mac) en el **ícono de preview del conector de salida** de un Snap que ejecutó con éxito tras Save o Validate.
- **Límites de muestreo por defecto**: *"the first 50 records from the input source, up to 15 MB in total size."* Excederlo en validación **produce un error**. Los admins ajustan esto en **Admin Manager → Designer settings**.
- **Toggle de formato**: **Table view** (default), **JSON view**, más display crudo y opción de mostrar los documentos con line feeds.
- **Navegación**: controles de flecha al pie permiten saltar entre los resultados de preview de distintos Snaps del mismo pipeline.
- **Herramientas extra**: **descargar preview data**, y **DataViz** para generar gráficos (**pie, line, bar, scatter**) desde campos seleccionados del preview.
- **Preview de documentos de error**: cuando un Snap falla, el panel puede mostrar los **error documents** producidos, junto al output del último Snap exitoso como contexto.
- **Flujo de Validate**: guarda cambios pendientes primero, después corre una ejecución muestreada por todo el pipeline, poblando preview data en cada Snap que corrió — el mecanismo de "corrida de prueba", distinto de un Execute completo.
- **Bug conocido documentado**: *"Repeatedly clicking the Stop Validation button during pipeline validation can cause the pipeline validation to hang and the Pipeline to complete execution."*
- **Deshabilitación a nivel Org**: si el preview está deshabilitado por el Org, *"Snap data previews do not contain sample data."*
- **Barra de estado inferior**: la vista de detalle de ejecución confirmada vive en Monitor (tabs: **Snap statistics, Children, Pipeline logs, Pipeline parameters, State transition, Ultra requests**), post-run — `[una barra de estado persistente al pie del canvas en tiempo de diseño es plausible pero no confirmada]`.

---

## 6. ACCIONES DE TOOLBAR (Designer Toolbar, nivel pipeline)

Lista confirmada, en orden documentado, con descripciones citadas:

1. **Execute Pipeline** — "Execute the Pipeline."
2. **Validate Pipeline** — "Validate the pipeline. Any unsaved changes will be saved before validation."
3. **Edit Pipeline Properties** — abre las propiedades (nombre, proyecto, params).
4. **Check Pipeline Statistics** — "Monitor pipeline progress as it executes", con métricas actualizadas periódicamente.
5. **Create Task** — genera una Triggered/Scheduled/Ultra Task ligada al pipeline actual.
6. **Save Pipeline** — "Save the Pipeline."
7. **Export Pipeline** — "Export the pipeline" (archivo portable, p.ej. `.slp`).
8. **Copy Pipeline** — "Copy the Pipeline from one project to another."
9. **Move Pipeline** — "Move the Pipeline from one project to another."
10. **Delete Pipeline** — a Recycle Bin.
11. **Pipeline Versions** — "Create versions of the Pipeline." Solo habilitado tras guardar al menos una vez. Incluye campo **Tag** (patrón por defecto: `<version_num> by <username> @ <date time>`) y **Notes** opcional. Revertir: hover sobre una versión y clic en **Revert** — solo funciona hacia snapshots versionados, y el historial **no** se lleva al copiar un pipeline.
12. **Compare Pipeline** — "Compare the current Pipeline with the target Pipeline."
13. **Notes** — "Add a note or delete an existing note. Notes are saved with the Pipeline."
14. **Print** — "Print the Pipeline."

Nota del rediseño 2022: solo los más usados se muestran por defecto; el resto detrás de un control de **expandir/overflow**.

---

## 7. ESTADOS Y FEEDBACK

- **View/link conectado**: **azul**.
- **Snap corriendo**: nodo **amarillo**.
- **Snap exitoso**: nodo **verde**, más ícono de preview en su conector de salida.
- **Snap fallido**: produce error documents visibles vía el panel de preview (error view); existe ruteo a error pipeline para capturar fallas sin tumbar la corrida. Color exacto del estado de fallo no citado literalmente — `[unverified]`.
- **Cambios sin guardar**: se señala **a nivel de pestaña**, no por nodo — título rojo/negro.
- **Feedback de validación**: la iconografía exacta valid/invalid/warning por Snap no se pudo extraer verbatim (la página de validación quedó truncada por el fetch). `[unverified — recomienda screenshot del producto real]`
- **Tooltips**: las 14 descripciones de toolbar de §6 son casi con certeza los strings literales de tooltip.

---

## 8. PAIN POINTS / CRÍTICAS REALES DE USUARIOS

Base positiva primero, para calibrar:
- *"the very simple and intuitive interface of the designer"*.
- *"Overall very happy with the platform, especially with their recent UI overhaul"* (rediseño sept 2022).
- *"SnapLogic's graphical user interface uses a jigsaw puzzle metaphor and makes the product accessible to business users as well as engineers... By using snaps instead of functions in code, you can see the building blocks of the integration visually, which helps a lot."* — PeerSpot.
- *"it's basically just drag and drop"* — PeerSpot.

Críticas (extractos indexados por buscador; el fetch directo a G2/TrustRadius/Gartner devolvió HTTP 403):

- *"SnapLogic UI is not always the most intuitive."*
- *"the UI needs some improvement and sometimes there is a lag in it"* (G2).
- Interfaz *"little bit complex for new user."*
- *"UIs seem a bit outdated although improvements have been made recently."*
- *"the UI can be slow at times"* incluso cuando la plataforma puede estar procesando en background (queja de performance percibida) — TrustRadius.
- *"there are a few quirks on the UI side, and the user interface can be improved"*.
- Fricción de navegación: *"the navigation when switching from Designer, Manager and Dashboard requires 3 tabs to be open on your browser, which is a little cumbersome"*.
- Documentación: *"documentation is sparse, with users spending a lot of time figuring out how to use Execute_Pipeline and other nuances"*; *"a more standardized expression language or better documentation for syntax quirks would reduce development friction."*
- Debugging: *"the debugging tools for complex transformations could be more granular."*
- Escala/performance: *"the browser-based Designer can experience performance lag when handling very large pipelines"* — señal directa para priorizar rendering virtualizado en una reconstrucción.
- Curva de aprendizaje (Capterra, mixto): *"the Snaplogic UI has a steep learning curve and its UI isn't the best"*; *"steep learning curve initially, especially for teams new to advanced integration"*; contrarrestado por *"within an hour or two I was building pipelines."*
- Techo de lógica compleja: *"the solution isn't ideal for complex processing or logic"*.

**Síntesis para el brief de rediseño**: los temas recurrentes son (1) **pulido visual percibido como anticuado** pese a completitud funcional, (2) **fricción de navegación entre Designer/Manager/Dashboard**, (3) **performance del canvas a escala**, (4) **curva de aprendizaje del expression language y del modelo de configuración de Snaps**, y (5) **documentación dispersa**. Una reconstrucción debe apuntar a: shell unificado, rendering virtualizado, ayuda contextual inline en el punto de configuración, y una rampa más suave para el expression language.

---

## HUECOS A VALIDAR VISUALMENTE

docs.snaplogic.com es una SPA renderizada por JS y los sitios de review bloquearon el fetch (403), así que estos puntos quedaron sin confirmar y requieren un pase con navegador contra un trial real:
- Layout exacto del header global (logo, selector de org/project-space, menú de avatar, búsqueda global).
- Glifos literales de los íconos de Snap Pack y la forma real del nodo (silueta de rompecabezas vs. badge redondeado).
- Iconografía exacta de valid/invalid/warning en los nodos durante la validación.
- Presencia/ausencia de minimapa.
- Posición exacta del toggle `=` y la etiqueta literal del botón "Suggest".
- Estilo de ruteo de las aristas (recto vs. ortogonal).
