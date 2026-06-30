# Design System de estudio — Fundación + Vertical Slice (Trace/Log)

- **Fecha:** 2026-06-29
- **Autor:** Danilo
- **Estado:** Aprobado (diseño) → pendiente de plan de implementación
- **Tipo:** Foundation + primer vertical slice

---

## 1. Contexto y objetivo

Existe una base proto-DS (`/oxteams`, ver `predios-quito-arquitectura.html`): tokens scopeados a `.ox`,
paleta dark "cockpit" (teal/indigo + status ok/review/warn/block), tipografías Manrope + JetBrains Mono,
y patrones funcionales (metric cards, log rows, step lists, status grids, flow SVG, callouts).

Existe además una referencia estética (`galer_a_de_agentes_ia.html`): 10 "neural cores" en WebGL
(FBM/SDF/Voronoi), glow, glassmorphism. Es la capa de *creatividad/alma* a preservar.

Ambos archivos son HTML/CSS vanilla. El objetivo es construir un **Design System de estudio** real en
**React + Radix + shadcn + Tailwind v4**, que:

1. Formalice la base `.ox` en una arquitectura de tokens en capas.
2. Reconstruya los patrones como componentes Radix-based, compuestos y gobernados.
3. Preserve la estética WebGL como capa creativa opt-in.
4. Sirva por igual a **productos internos de agentes IA** y a **entregables de cliente** (misma calidad).

**No es shadcn genérico.** Es un DS de **agent-ops / IA**: agent cards con avatar WebGL, trace/log
timelines, status systems, flujos de orquestación, dashboards de métricas. Ahí vive la ventaja distintiva.

### Anti-objetivos (YAGNI)
- No diseñar las ~50 componentes por adelantado. Se valida la tubería con 1 vertical slice y luego se
  produce en masa.
- No soporte multi-framework (solo React).
- No theming runtime configurable por el usuario final (los temas son artefactos de build, no UI).

---

## 2. Modelo de distribución

**Studio DS, multi-marca.** Un dueño (Danilo), una arquitectura de componentes, **temas
intercambiables** (marca propia "cockpit" + tema por cliente/producto). Reusado en herramientas internas
de agentes IA y en proyectos de cliente.

- Gobernanza = ligera (convenciones del autor, no comité), pero **theming es first-class**.
- Tokens scopeados (instinto `.ox`) → white-label sin tocar componentes.
- Enfoque elegido: **B — monorepo empaquetado desde día 1** (versionado + multi-tema built-in).

---

## 3. Arquitectura monorepo

```
design-system/
├─ packages/
│  ├─ tokens/         # fuente de tokens → Style Dictionary → CSS vars/tema + TS types + preset Tailwind
│  ├─ ui/             # React + Radix, variantes cva → @studio/ui (publicado)
│  ├─ webgl/          # avatares shader (NeuralCore), lazy → @studio/webgl
│  ├─ tsconfig/       # config TS compartida
│  └─ eslint-config/  # lint compartido (incl. regla "no hex crudo en componentes")
├─ apps/
│  └─ docs/           # Storybook (dev + addon a11y); showcase custom más adelante
├─ pnpm-workspace.yaml
└─ turbo.json
```

**Tooling**
- **pnpm** workspaces — manejo de dependencias del monorepo.
- **Turborepo** — pipeline build/lint/test cacheado.
- **tsup** — build de paquetes (ESM + types).
- **Changesets** — versionado semver + changelog + publish por paquete.
- **Vitest + Testing Library + axe** — test de comportamiento + a11y.
- **Style Dictionary** — build de tokens (fuente única → múltiples salidas).
- **culori** — cálculo de contraste WCAG/APCA + simulación CVD en los gates de CI de tokens.

> **Scope npm:** `@studio` es placeholder. Decisión abierta (ver §12).

---

## 4. Arquitectura de tokens (3 capas, endurecida)

Fuente única en `packages/tokens` (JSON con `$extensions`) → Style Dictionary genera todas las salidas.
La capa primitive se **autora en OKLCH** (uniformidad perceptual + lightness predecible) con **fallback
hex declarado antes** de la línea `oklch()`. La marca de un cliente = rotar 1 hue manteniendo L/C de las
rampas → **contraste estable entre marcas por construcción**.

### Capa 1 — primitive (crudo, constante entre temas)
Rampas de color en OKLCH con **rampas de rol** (L/C fijos por uso, hue variable):
`emphasis` L0.80/C0.15 (texto-icono on-dark) · `solid` L0.70/C0.17 (fills/botón) · `deep` L0.55/C0.14
(borde/glow base) · `tint` L0.25/C0.045 (chip bg). Neutros anclados a **un solo hue (285)** con
ΔL≈0.04 uniforme. Spacing, radii, fuentes (Geist/Manrope/JetBrains Mono), motion, z, glow-seeds.

### Capa 2 — semantic (significado, intercambiable por tema)
Organizada en grupos. Cada acento y cada status es una **cuádrupla** `solid / on / surface(tint) / border`
(los 3 derivados con `color-mix`), no un hex suelto.

**Superficies** (renombradas a no-posicionales; elevación desacoplada del color):
`--bg-base --bg-elevated --surface-2 --surface-3 --surface-header --surface-sunken`.

**Texto:** `--ink --dim --faint` (+ `--faint-deco` solo decoración/disabled).

**Bordes:** `--border-subtle` (hairline deco) · `--border-default` · `--border-strong` (funcional/input,
≥3:1) · `--border-divider` · `--ring` (=accent).

**Acento (par con contrato de uso):**
`--accent` (interactivo primario, streaming/sistema vivo, focus ring) +
`--accent-secondary` (generativo/IA, links, selección). Cada uno con `--on-*`, `--*-surface`, `--*-border`,
`--*-hover`, `--*-active`.

**Status (cuádruplas, paridad de luminancia, `info` token propio):**
`ok · review · warn · block · info`. Hue **lockeado por el sistema** (un cliente solo ajusta L, no rota el hue).

**Estados de interacción:** `--ring --ring-offset --surface-hover --disabled-fg --disabled-bg --disabled-border`.

**Elevación — DOS ejes ortogonales y componibles:**
`--elevation-0..4` (sombra negra, oclusión, por nivel z) ⊥ `--glow-rest/active/focus` (color, emisión, por
actividad). Sombra de componente = `var(--elevation-2), var(--glow-active)`. El glow lee de un **seed más
claro que el accent** (`--glow-seed-accent` L≈0.88) o el halo sale turbio.

**Radii/spacing/motion/z semánticos:** `--radius-{sm,md,lg,xl,pill}` · `--duration-{fast,standard}` ·
`--ease-standard` · `--z-{sticky,overlay,popover,toast}` · densidad `--row-y` vía `[data-density]`.

**Paleta categórica de data-viz:** `--viz-1..8` derivada de los 10 neural cores, L-igualada (~0.76) y
croma capeado, **excluyendo las 4 bandas de hue de status** → una serie de chart nunca se lee como un estado.
Más `--agent-{id}` + `--agent-{id}-glow` (fuente única para el tinte del shader y sus charts).

### Capa 3 — component (scoped, solo cuando hace falta hook de override)
Ej. `--log-row-border`. Solo cuando semantic no cubre un punto de override.

### Theming (críticos resueltos)
- **`@theme inline` OBLIGATORIO.** Con `@theme` normal, Tailwind v4 resuelve el hex en build e inyecta el
  literal → pisar `--accent` en `[data-theme]` **no hace nada** (rompe el criterio de done #8 en silencio).
  `@theme inline` emite `var(--token)`:
  ```css
  @theme inline { --color-bg-base: var(--bg-base); --color-accent: var(--accent); /* … */ }
  [data-theme="cockpit"]    { --bg-base:#07070a; --accent:#23d2d7; color-scheme:dark; }
  [data-theme="cliente-x"]  { --bg-base:#0b0d12; --accent:#5b8cff; color-scheme:dark; }
  ```
- **Contrato themeable.** Tokens marcados `$extensions.studio.themeable` en la fuente; de ahí se generan
  los bloques `[data-theme]`, el tipo TS `ThemeableToken` y el mapa `@theme inline`. **Allowlist**
  (overridable: superficies, texto, acentos, on-*) vs **locked** (hue de status, focus ring — solo L).
- **Temas exhaustivos.** Cada bloque `[data-theme]` declara el set semantic **completo**, nunca diffs
  (evita bugs de especificidad/anidamiento). CI valida completitud.
- **SSR.** `data-theme` fijado server-side desde cookie + script bloqueante en `<head>`; `color-scheme`
  por tema (sin flash; scrollbar/controles nativos correctos).

### Pipeline de build
Style Dictionary →
1. `theme-*.css` (CSS vars por tema: hex fallback + `oklch()`, con override P3 vía `@media (color-gamut:p3)`
   en glow/accent),
2. `tokens.ts` (objeto tipado + `ThemeableToken`),
3. **preset Tailwind v4** (`@theme inline`),
4. `tokens.lock.json` (nombres públicos, para diff de versionado en CI).

**Gates de CI sobre los tokens** (vitest + culori):
- contraste por tema: cada par `fg × surface ≥ 4.5`, `status-as-text ≥ 4.5`, `border-funcional/focus ≥ 3.0`,
- separación de luminancia entre pares de status `≥ 1.5` en simulación deuteranopía,
- completitud de temas + override solo dentro del allowlist,
- diff de `tokens.lock.json`: remove/rename sin bump major → falla.

### Paleta cockpit concreta (semantic, valores corregidos por el panel)
| token | valor | nota |
|---|---|---|
| `--bg-base` | `#07070a` | H285, ramp ΔL≈0.04 |
| `--bg-elevated` | `#0c0d11` | (ex `bg2`) |
| `--surface-2` | `#131418` | (ex `surface`) |
| `--surface-3` | `#191a1f` | (ex `raised`) |
| `--ink` | `#f0f0f2` | 17:1 |
| `--dim` | `#b4b4be` | APCA-safe (ex `#a0a0aa`) |
| `--faint` | `#7b8799` | **AA** (ex `#5a6478` reprobaba) |
| `--border-strong` | `#666670` | funcional, ≥3:1 |
| `--border-divider` | `#23303a` | (ex `track`) |
| `--accent` / `--on-accent` | `#23d2d7` / `#042427` | `oklch(.78 .13 198)` · 8.76:1 |
| `--accent-secondary` | `#8f9bff` | indigo L↑ (par balanceado) |
| `--ok` / `--on-ok` | `#39E0A0` / `#04231a` | |
| `--review` / `--on-review` | `#6cb8ff` / `#04122b` | **re-tinta fuera del cian** |
| `--warn` / `--on-warn` | `#E8961A` / `#2a1600` | ámbar más profundo (CVD) |
| `--block` / `--on-block` | `#ff6b78` / `#2b0407` | L subida (outlier rojo) |
| `--info` | `#6b7384` | neutral, propio (ya no roba `--track`) |
| `--glow-seed-accent` | `#5fe3e6` | `oklch(.88 .12 192)`, alimenta `--glow-*` |

---

## 5. Modelo de componente (convención que TODOS siguen)

- **Headless + Radix**: envolver el primitive de Radix correspondiente; si no existe, construir un
  compound headless propio. Exponer partes compuestas (`X.Root`, `X.Item`, …), `forwardRef`, soporte
  `asChild`, y atributos `data-state` / `data-*` para estilar por estado.
- **Variantes**: `cva` (class-variance-authority) para `variant` / `size` / `tone`. `tone` mapea a los
  status semantic.
- **Estilo**: utilidades Tailwind atadas a tokens semantic. **Nunca hex crudo** (lo bloquea el lint).
- **Gobernanza co-localizada** por carpeta de componente — esto materializa "átomos con gobernanza + copy":

```
ui/src/trace-log/
├─ trace-log.tsx          # implementación
├─ trace-log.variants.ts  # cva
├─ trace-log.stories.tsx  # Storybook: estados + uso (spec viviente)
├─ trace-log.test.tsx     # vitest + axe
├─ copy.ts                # strings / claves i18n — cero texto hardcodeado
└─ README.md              # API · contrato a11y · do/don't
```

---

## 6. Vertical slice — Trace/Log timeline

Primer componente construido de punta a punta para validar token → primitive Radix → componente
compuesto → estado → copy/gobernanza.

### Anatomía (de `.ox-log`)
card → header (título + hint) → rows. Cada row = borde-izquierdo de severidad + línea meta
(agente · paso/timestamp mono) + texto con `code` inline + detalle expandible opcional.

### API compuesta
```tsx
<TraceLog.Root density="comfortable">
  <TraceLog.Header title="Pipeline de una consulta" hint="tu lista → mapa" />
  <TraceLog.Body>
    <TraceLog.Row tone="info" agent="PARSER" step="paso 1">
      Lee las líneas <TraceLog.Code>predio, estatus</TraceLog.Code> del textarea…
      <TraceLog.Detail>{/* contenido expandible (Radix Collapsible) */}</TraceLog.Detail>
    </TraceLog.Row>
    <TraceLog.Row tone="ok" agent="ARCGIS" timestamp="12:04:01">Quito responde GeoJSON.</TraceLog.Row>
  </TraceLog.Body>
</TraceLog.Root>
```

### Detalles técnicos
- **`tone`**: `info | ok | review | warn | block` → color del borde vía status tokens.
- **Primitives Radix**: `Collapsible` (rows expandibles), `ScrollArea` (logs largos).
- **Tokens consumidos**: `--surface`, `--border-soft`, status colors, fuente mono, spacing de densidad.
- **Densidad**: `comfortable | compact` (prop en `Root`, propaga vía contexto) → mapea a token `--row-y`
  vía `[data-density]`, **no a px sueltos**.
- **Estados**: default · hover · expanded · empty · **streaming** (append en vivo) · truncated.

### Contrato de accesibilidad
- `role="log"` + `aria-live="polite"` cuando hay streaming.
- Rows expandibles operables por teclado (Radix Collapsible ya lo da).
- Severidad **no solo por color**: icono + label de texto (WCAG 1.4.1).
- Contraste de texto sobre `--surface` ≥ AA.

---

## 7. Gobernanza + copy

Cada componente exportado trae un **contrato**:
- API tipada (TS).
- Contrato a11y (roles, teclado, contraste).
- Copy externalizado (`copy.ts` / claves i18n) — cero texto hardcodeado.
- Reglas de uso (README do/don't).
- Hooks de token documentados.

**Enforcement automático**
- Lint: regla "no hex crudo" en `packages/ui` (incl. `rgba()` de glow/tint → deben ser tokens).
- Gate de test: `axe` debe pasar.
- **Gate de tokens (CI):** contraste por tema (fg×surface ≥4.5, border/focus ≥3.0), separación CVD ≥1.5,
  temas exhaustivos, override solo dentro del allowlist themeable.
- Storybook = spec viviente (cada estado tiene su story), bajo ≥2 temas.
- **Versionado de tokens (Changesets):** `major` = remove/rename/cambio de formato (hex→oklch parseado)
  o cambio del contrato de override; `minor` = añadir token o cambio de valor visual (exige snapshot de
  regresión visual); `patch` = fix no-visual. CI hace diff de `tokens.lock.json`: si desaparece un token
  sin bump `major`, falla.

---

## 8. Integración WebGL (creatividad, opt-in)

- Vive en `packages/webgl`, entry separado, **lazy-load** (`React.lazy` / import dinámico) → el core
  `ui` queda ligero (cero GLSL en ruta crítica).
- `<NeuralCore agent="aura" activity={…} />` — los shaders de la galería refactorizados:
  - registry de shaders (los 10 + extensible),
  - **un solo** `requestAnimationFrame` compartido para todas las instancias,
  - `prefers-reduced-motion` → frame estático (sin animación).
- Lo consume el futuro `AgentCard` (slice #2), **no** Trace/Log. La capa creativa queda aislada y opcional.

---

## 9. User flow

### Dev (consumidor del DS)
`pnpm add @studio/ui @studio/tokens` → importar `theme-cockpit.css` y poner `data-theme` en un ancestro
→ `import { TraceLog } from '@studio/ui'` → componer → ship. Cambiar de marca = cambiar `data-theme`.

### End-user (del componente Trace/Log)
Ver log → (opcional) expandir una row para ver detalle → si hay proceso vivo, las rows se appendan en
streaming con `aria-live`. Estados de error: empty (sin eventos), truncated (log recortado con CTA "ver
todo").

> Ambos flujos están renderizados como diagrama en el companion HTML.

---

## 10. Verificación / criterios de "done" del slice

El slice Trace/Log se considera completo cuando:
1. Renderiza los 5 `tone` con su color de borde correcto + **icono distintivo** por severidad (no solo color, WCAG 1.4.1).
2. Las rows expanden/colapsan por mouse y teclado (Radix Collapsible).
3. Soporta streaming (append en vivo) con `aria-live="polite"`.
4. Maneja estados empty y truncated.
5. Pasa `axe` sin violaciones.
6. Tiene story por estado en Storybook.
7. Consume solo tokens semantic (lint sin hex crudo).
8. Funciona idéntico bajo `data-theme="cockpit"` y un segundo tema de prueba — **vía `@theme inline`**
   (verificado: cambiar `data-theme` re-pinta sin rebuild).
9. Pasa el **gate de contraste de CI** en ambos temas (fg×surface ≥4.5, border ≥3.0).

---

## 11. Descomposición / roadmap

Sub-proyectos (cada uno spec → plan → implementación propios):

1. **[ESTE] Fundación + Trace/Log** — monorepo, tokens, modelo de componente, primer slice.
2. **Status system** — tokens de status, `Badge`, `StatusDot`, `Legend` editable.
3. **WebGL core + AgentCard** — `packages/webgl`, `NeuralCore`, `AgentCard`.
4. **Capa de datos** — `MetricCard`, `DataTable`, `Stat`.
5. **Orquestación** — `FlowDiagram`, `OrchestrationView`.
6. **Templates / UIs conjuntas** — cockpit shell, layouts compuestos.

---

## 12. Decisiones abiertas

- **Scope npm** (`@studio` placeholder) — definir el real.
- **Storybook vs showcase custom** — Storybook para dev ahora; ¿showcase custom (estilo doc oxteams)
  como app aparte luego?
- **Hue final de `review`** — propuesto azul `#6cb8ff` (256). Alt: violeta `#b98cff` (263). Confirmar.
- **Git** — el directorio aún no es repo. Inicializar antes de implementar (para Changesets + CI).

### Confirmado por el panel multi-lente (2026-06-29)
- **OKLCH** para autorar primitive (con fallback hex) — confirmado.
- **Style Dictionary** como build de tokens — confirmado.
- **P3 wide-gamut** en glow/accent/status vía `@media (color-gamut:p3)` — confirmado.
- **`@theme inline`** (no `@theme`) — confirmado como requisito crítico.
