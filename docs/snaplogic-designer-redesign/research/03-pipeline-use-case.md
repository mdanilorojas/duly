# Pipelines reales de SnapLogic, catálogo de Snaps y modelo de documento

> Investigación de respaldo del prototipo `duly-flow.html`, para que el caso de uso
> implementado no sea inventado. `docs.snaplogic.com` es un portal SPA que el conversor
> de WebFetch resolvió mal en varias páginas (devolvía nav/TOC); el mirror en Confluence
> (`docs-snaplogic.atlassian.net`) y los hilos de comunidad respondieron mejor.
> Las secuencias end-to-end están **sintetizadas a partir de nombres y comportamientos de
> Snaps verificados individualmente** — marcado donde corresponde.

---

## 1. Tres pipelines end-to-end

### Pipeline A — Salesforce → Snowflake, carga incremental
`[sintetizado de componentes verificados; no se pudo recuperar una página canónica con el pipeline completo]`

| # | Snap | Configuración (verificada donde se cita) |
|---|------|----|
| 1 | **Salesforce Read** | Query SOQL, p.ej. `SELECT Id, Name, Email, LastModifiedDate FROM Contact WHERE LastModifiedDate > '$last_run_ts'`. Snap confirmado en el Salesforce Snap Pack; configuración a nivel de campo no recuperada `[unverified]` |
| 2 | **Mapper** | Mapea nombres origen→destino, agrega `_load_ts`, castea tipos. Rol verificado: "Mapper Snap is a Transform-type Snap that transforms data and passes it to the downstream Snap" |
| 3 | **Snowflake - Bulk Load** | Carga a la tabla destino vía comando `COPY` de Snowflake, con staging automático interno/externo. Verificado: "Bulk Load Snaps take advantage of Snowflake's COPY command by automatically staging data"; también documentado como cargando "from input sources or files stored on external object stores like Amazon S3, Google Storage, and Azure Storage Blob" |
| 4 | (ruta alterna/upsert) **Multi Execute** | Verificado que existe: "Multi Execute Snap provides finer transaction control" para escenarios de upsert en Snowflake — se usa en vez de Bulk Load cuando hay MERGE/upsert por fila `[config exacta unverified]` |
| 5 | Error views → error pipeline | Ver §3 |

**Mecánica de carga incremental (verificada, de docs de AutoSync — el mismo patrón que SnapLogic documenta para Salesforce→Snowflake):** requiere una **primary key** + un campo de **last-modified** en la tabla origen; SnapLogic hace "an initial full load followed by incremental loads (upserts)" con esa marca de tiempo como clave. Nota: está documentado bajo **AutoSync** (el producto de sync guiado por asistente), no bajo pipelines crudos de Designer; el patrón es el mismo pero no se confirmó que ambos usen secuencias idénticas de Snaps. `[unverified]`

También confirmado que existe pero sin ubicar en un paso específico: **SCD Type 2 Snap** — "extends Snowflake's change data capture capability".

Entrada real del Patterns Catalog que confirma que esta clase de pipeline existe como patrón publicado: **"Move data from AWS S3 into Snowflake Data Warehouse"** (categoría Data Warehousing).

---

### Pipeline B — Ingesta de API REST → transformar → upsert a BD con manejo de errores
`[sintetizado de componentes verificados]`

| # | Snap | Notas |
|---|------|----|
| 1 | **REST Get** (o **HTTP Client**) | El REST Snap Pack "imports and exports critical data and statistics to and from any HTTP web source" — verificado. Alternativa del API Suite: **HTTP Client**, **GraphQL Client**, **gRPC Client** |
| 2 | **JSON Parser** | Convierte respuesta binaria/string → documento. Verificado como Snap real |
| 3 | **Mapper** | Reformatea/renombra campos al esquema destino |
| 4 | **Router** | "Routes documents to output views matching a boolean expression. If no expressions are specified, documents will be evenly distributed across all output views." Verificado. Las salidas nombradas se declaran en el tab Views |
| 5 | **Snap de Upsert/Merge** (p.ej. NetSuite REST Upsert, Salesforce Upsert, o Insert/Update genérico de RDBMS) | Ejemplos reales verificados en docs: **NetSuite REST Upsert** — "configure a Mapper Snap to pass input data... on validation, the Snap displays the desired output to be passed to the NetSuite REST Upsert Snap"; **Salesforce Upsert** — pipeline de ejemplo que "upserts the department record in CSV format and associates it with an employee record" |
| 6 | Error view (cualquier snap) → **error pipeline** | Patrón reutilizable estándar; el Patterns Catalog publica explícitamente **"Error handling and retry pipeline"** como patrón con nombre |

---

### Pipeline C — Archivo (S3/SFTP) → parsear CSV → validar → rutear → cargar + error pipeline
`[sintetizado; el más cercano a una estructura genérica con fuente directa]`

Estructura genérica verificada de un snippet que describe exactamente esta forma: **"File Reader → CSV Parser → Filter → Mapper → Expression → destino"** — el CSV Parser "takes file input and outputs a document in JSON format". Expandido con la mecánica verificada de Router/error pipeline:

| # | Snap | Notas |
|---|------|----|
| 1 | **S3 File Reader** (o **File Reader** para SFTP/local) | Ambos confirmados como Snaps reales del **Binary Snap Pack** |
| 2 | **CSV Parser** | Binario → documento; verificado |
| 3 | **Mapper** | Castea tipos, calcula derivados, etiqueta número de fila |
| 4 | **Router** | Divide en views `valid` / `invalid` con expresión booleana, p.ej. `$qty != null && $unit_price > 0` |
| 5a | valid → **Snowflake - Bulk Load** o Insert genérico | Ruta de carga |
| 5b | invalid → **Mapper** (formatear motivo de rechazo) → **CSV Formatter** / **File Writer** o **Email Sender** | Ruta de rechazo/cuarentena |
| 6 | Error views → **error pipeline** | Captura fallos clase `SnapDataException` — ver forma en §3 |

---

## 2. Mapa del catálogo de Snaps (para la paleta izquierda del mockup)

**Verificado directamente de páginas de docs recuperadas** salvo donde se indique.

### Binary Snap Pack (completamente verificado)
AES Encrypt, AES Decrypt, Blowfish Encrypt, Blowfish Decrypt, Compress, Decompress, Directory Browser, File Delete, File Poller, File Operation, File Reader, File Writer, Multi File Reader, Multipart Writer, Multipart Reader, PGP Decrypt, PGP Encrypt, PGP Sign, SAS Generator, S3 File Reader, S3 File Writer, Twofish Encrypt, Twofish Decrypt, ZipFile Read, ZipFile Write

### Amazon S3 Snap Pack (verificado)
S3 Archive, S3 Browser, S3 Copy, S3 Delete, S3 Download, S3 Poller, S3 Presigned, S3 Restore, S3 Select, S3 Upload

### API Suite (verificado)
GraphQL Client, HTTP Client, gRPC Client

### Flow Snap Pack (verificado en varias fuentes)
Router, Union, Gate, Copy, Filter, Aggregate, Sort, Join, Pipeline Execute, HTTP Router, Binary Router, ELT Router
- **Router**: "routes documents to output views matching a boolean expression"
- **Gate**: "waits for all the inputs before producing a document at the output view... creates dependencies between upstream and downstream Snaps"
- **Union**: "aggregates multiple inputs into a single output document... system memory limitations, should not be used for massive data propagation" *(esta descripción se devolvió para Union pero se lee como el comportamiento de Gate — el resumen del buscador puede haber cruzado ambos; tratar con cautela)*
- **Copy**: "copies a document stream to the Snap's output views... same information to multiple endpoints"
- **Filter**: "filters a document stream based on expression functions"

### Transform Snap Pack (verificado)
Mapper, JSON Generator, JSON Parser, JSON Formatter, CSV Parser, CSV Formatter, XML Parser, Aggregate, Join
- **Mapper**: "transforms data and passes it to the downstream Snap"
- **JSON Generator**: "generate a JSON document for the next Snap in the pipeline... often used at the beginning of a pipeline"
- **Aggregate**: "updated to handle aggregating Strings, Date, Time, and DateTime"

### Script Snap Pack (verificado solo nombre/propósito)
"Executes custom JavaScript or Python code within pipelines to perform advanced logic and data transformations." Nombres individuales de Snaps `[unverified]`

### Snap Packs de conectores/apps (verificados como existentes, listas parciales)
- **Salesforce**: Salesforce Read, Salesforce Upsert (+ CRUD estándar implícito)
- **Snowflake**: Snowflake - Bulk Load, Multi Execute, SCD Type 2 (+ CRUD estándar)
- **NetSuite**: NetSuite REST Upsert (+ familia NetSuite REST)
- **Workday**: Workday Read
- **REST**: REST Get, REST Post/Put

---

## 3. El modelo de documento de SnapLogic

**Dos tipos de dato fluyen entre Snaps** (verificado):
- **Document data** — forma de **círculo** en el canvas; "uses the JSON format as a container of the data", soporta los tipos JSON estándar: string, boolean, number, array, object, null.
- **Binary data** — forma de **rombo**; envuelve payloads binarios (archivos, streams) antes de que un Parser/Reader los convierta en Document data.

**Payload JSON de ejemplo mostrado en material oficial** (registro de empleado):
```json
[
  {
    "Name": "Albert Maro",
    "Location": "Field",
    "Department": "Sales",
    "Email": "albert.maro@example.com"
  }
]
```

**Categorías funcionales de Snap** (taxonomía verificada): Read (File Reader, CSV Generator) → Parse (XML Parser, JSON Parser) → Transform (Mapper, Aggregate, Join) → Flow (Router, Gate, Union) → Format (CSV Formatter, JSON Formatter) → Write (File Writer, REST Post).

### Expression language (sintaxis `$`)
Verificado de "Expression Language Overview" (la página lleva aviso de "no longer maintained"; la versión actual vive en docs.snaplogic.com pero no fue recuperable en esta sesión):
- Usa **sintaxis JavaScript** para referenciar/manipular campos del documento dinámicamente.
- Operadores de comparación soportados: `>`, `>=`, `<`, `<=`, `==`, `!=` — **`===`/`!==` NO soportados**.
- Lógicos: `&&`, `||`, `!`. Concatenación de strings: `+` (el atajo `+=` **no** está soportado).
- Librerías de funciones referenciadas: JSONPath, String, Array, Object, Math, Number, Date, Base64, Digest, funciones de Pipeline/Snap, utilidades de encoding (HTML, ICONV, GZip). Helpers estilo `sl.ensureArray` están implicados por la categoría "Pipeline and Snap functions" pero no confirmados individualmente `[unverified]`.
- **Advertencia documentada importante**: "the expression language syntax and JSONPath syntax are not compatible" — no deben mezclarse aunque rutas triviales como `$.name` funcionen en ambos.

### Sintaxis JSONPath (verificada)
| Sintaxis | Significado |
|---|---|
| `$` | raíz del documento |
| `$.parent.child` | acceso a campo anidado |
| `$.parent['child with spaces']` | notación de corchetes para caracteres especiales |
| `$.children[1]` | segundo elemento del array |
| `$.children[-1]` | último elemento |
| `$.children[*].age` | wildcard sobre array/objeto |
| `$..child` | descenso recursivo — busca en todo el documento |
| `$.children[1:]` | slice — todos menos el primero |
| `$.children[::2]` | slice — uno de cada dos |

Basado en la spec original de JSONPath de goessner.net, según la cita del propio doc.

### Forma del documento de error view
Campos reales confirmados (varias fuentes independientes convergen): **`error`, `reason`, `resolution`, `stacktrace`, `status_code`, `run_id`, `child_errors`**, más el documento **`original`** que falló (mecanismo confirmado: "the error condition is treated like data and can be passed on to a pipeline segment").

Ejemplos reales que aparecieron en resultados de búsqueda:
- `"error": "Pipeline did not complete successfully"`, stacktrace referenciando `com.snaplogic.snap.api.SnapDataException`, `"resolution": "Fix the child pipeline errors and try again"`
- `"Failure: Json Splitter expects a list, Reason: Found an object of type class java.util.LinkedHashMap, Resolution: The path $.data needs to refer to a list in the incoming document"`
- Las docs de desarrollo de Snaps confirman el patrón programáticamente: `throw new ExecutionException(message).withReason(reason).withResolution(resolution)`

**Mecanismo** (verificado): el tab **Views** de cada Snap tiene un setting "When errors occur"; los documentos que fallan se desvían a un **error pipeline** dedicado mientras el pipeline principal sigue procesando los válidos sin interrupción.

Ejemplo de documento de error construido (los nombres de campo están verificados individualmente arriba; la forma compuesta completa es síntesis — `[no verificado como un blob JSON literal de las docs]`):
```json
{
  "error": "Failed to write document",
  "reason": "Numeric value expected for field 'unit_price', found string 'N/A'",
  "resolution": "Fix the source data or add a type-cast/validation step upstream",
  "stacktrace": "com.snaplogic.snap.api.SnapDataException: Invalid numeric literal ...",
  "status_code": 400,
  "run_id": "8f2c1e40-8b3a-4a2e-9d31-7a6b9e1c2f10",
  "original": {
    "order_id": "ORD-10482",
    "customer_email": "j.rivera@example.com",
    "product_sku": "SKU-2291",
    "qty": "3",
    "unit_price": "N/A",
    "order_date": "2026-08-15"
  }
}
```

---

## 4. Datos de muestra realistas

Elegido el Pipeline C porque da el transform de 3 hops más distinto visualmente para un panel de preview: strings crudos parseados → tipados/enriquecidos → con forma de destino.

`[datos de muestra construidos, no tomados verbatim de un doc de SnapLogic]`

**Hop 1 — después del CSV Parser** (crudo, todo es string):
```json
[
  {"order_id": "ORD-10478", "customer_email": "a.chen@example.com", "product_sku": "SKU-1042", "qty": "2", "unit_price": "49.99", "order_date": "2026-08-10", "status": "NEW"},
  {"order_id": "ORD-10479", "customer_email": "m.diaz@example.com", "product_sku": "SKU-2291", "qty": "1", "unit_price": "129.00", "order_date": "2026-08-11", "status": "NEW"},
  {"order_id": "ORD-10480", "customer_email": "j.oyelaran@example.com", "product_sku": "SKU-0087", "qty": "5", "unit_price": "9.50", "order_date": "2026-08-12", "status": "NEW"},
  {"order_id": "ORD-10481", "customer_email": "s.klein@example.com", "product_sku": "SKU-1042", "qty": "3", "unit_price": "49.99", "order_date": "2026-08-13", "status": "NEW"},
  {"order_id": "ORD-10482", "customer_email": "j.rivera@example.com", "product_sku": "SKU-2291", "qty": "3", "unit_price": "N/A", "order_date": "2026-08-15", "status": "NEW"}
]
```

**Hop 2 — después del Mapper** (tipado, enriquecido, pre-Router):
```json
[
  {"order_id": "ORD-10478", "qty": 2, "unit_price": 49.99, "line_total": 99.98, "_row_num": 1, "_source_file": "orders_20260815.csv", "_ingested_at": "2026-08-15T06:02:11Z"},
  {"order_id": "ORD-10479", "qty": 1, "unit_price": 129.00, "line_total": 129.00, "_row_num": 2, "_source_file": "orders_20260815.csv", "_ingested_at": "2026-08-15T06:02:11Z"},
  {"order_id": "ORD-10480", "qty": 5, "unit_price": 9.50, "line_total": 47.50, "_row_num": 3, "_source_file": "orders_20260815.csv", "_ingested_at": "2026-08-15T06:02:11Z"},
  {"order_id": "ORD-10481", "qty": 3, "unit_price": 49.99, "line_total": 149.97, "_row_num": 4, "_source_file": "orders_20260815.csv", "_ingested_at": "2026-08-15T06:02:11Z"}
]
```
*(El registro 5, `ORD-10482`, falla el casteo de `unit_price` y el Router lo desvía a la ruta de error — ver el documento de error en §3.)*

**Hop 3 — en el destino** (payload de Snowflake Bulk Load, mapeado a columnas de `STG_ORDERS`):
```json
[
  {"ORDER_ID": "ORD-10478", "PRODUCT_SKU": "SKU-1042", "QTY": 2, "UNIT_PRICE": 49.99, "LINE_TOTAL": 99.98, "ORDER_DATE": "2026-08-10", "LOAD_BATCH_ID": "BATCH-20260815-01", "LOAD_TS": "2026-08-15T06:02:14Z"},
  {"ORDER_ID": "ORD-10479", "PRODUCT_SKU": "SKU-2291", "QTY": 1, "UNIT_PRICE": 129.00, "LINE_TOTAL": 129.00, "ORDER_DATE": "2026-08-11", "LOAD_BATCH_ID": "BATCH-20260815-01", "LOAD_TS": "2026-08-15T06:02:14Z"},
  {"ORDER_ID": "ORD-10480", "PRODUCT_SKU": "SKU-0087", "QTY": 5, "UNIT_PRICE": 9.50, "LINE_TOTAL": 47.50, "ORDER_DATE": "2026-08-12", "LOAD_BATCH_ID": "BATCH-20260815-01", "LOAD_TS": "2026-08-15T06:02:14Z"},
  {"ORDER_ID": "ORD-10481", "PRODUCT_SKU": "SKU-1042", "QTY": 3, "UNIT_PRICE": 49.99, "LINE_TOTAL": 149.97, "ORDER_DATE": "2026-08-13", "LOAD_BATCH_ID": "BATCH-20260815-01", "LOAD_TS": "2026-08-15T06:02:14Z"}
]
```

> **Nota de aplicación**: el prototipo usa Salesforce → Snowflake, no este pipeline C. Los datos de
> arriba se transpusieron a documentos de `Opportunity` (`Id` de 18 caracteres, `Name`, `StageName`,
> `Amount`, `CloseDate`, `LastModifiedDate`) conservando el truco del documento envenenado: registros
> con `Amount` vacío que `parseFloat` convierte en `NaN` y la tabla destino rechaza.

---

## 5. Estadísticas / telemetría de ejecución (verificado)

Métricas por Snap, actualizadas en vivo durante la ejecución, mostradas en el panel de estadísticas:
- **Documents** — "The number of structured or binary documents that passed through the view" (por input/output view)
- **Bytes** — "Only populated for Snaps with binary views" — volumen de datos por la view
- **Duration** — "The total elapsed time for the Snap, from start to finish" = **Input time + Execution time + Output time** (este desglose está nombrado explícitamente)
- **Rate** — "approximate calculation of how many documents pass through the view per second"; para views binarias se muestra tasa de bytes
- El framing general confirma que también se reportan **CPU y memoria por Snap** ("SnapLogic provides per-Snap CPU, memory, duration, and document throughput information for a pipeline execution") — los strings exactos de etiqueta para CPU/memoria `[unverified]`, solo el hecho de que existen está confirmado.

No se pudo confirmar una etiqueta de contador agregado de "errors" a nivel de pipeline (distinto del ruteo de error por documento) — `[unverified]`.

---

## Huecos / qué tratar como placeholder

- La UI de configuración a nivel de campo (etiquetas de dropdown, nombres de checkbox) de Salesforce Read, Snowflake Bulk Load y Router no fue recuperada — solo su comportamiento documentado.
- No se recuperó una página canónica de "pipeline completo" para ninguno de los 3 casos; las secuencias son síntesis a partir de nombres y comportamientos verificados por separado, contrastadas contra una secuencia genérica verificada ("File Reader → CSV Parser → Filter → Mapper → Expression → destino") y contra la lista del Patterns Catalog publicado.
- Las etiquetas exactas de CPU/memoria y un contador agregado de errores a nivel pipeline no fueron confirmados.
