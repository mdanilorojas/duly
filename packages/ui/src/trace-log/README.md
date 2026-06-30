# TraceLog

Timeline de eventos/log para vistas de agent-ops. Compound component sobre Radix.

## API

- `TraceLog.Root` — `density?: "comfortable" | "compact"`, `streaming?: boolean`.
- `TraceLog.Header` — `title: string`, `hint?: string`.
- `TraceLog.Body` — `maxHeight?: number` (activa scroll); acepta `ref` (apunta al elemento scrollable para auto-scroll).
- `TraceLog.Row` — `tone?: "info"|"ok"|"review"|"warn"|"block"`, `agent: string`, `step?`, `timestamp?`. Ref disponible apuntando al div raíz del row.
- `TraceLog.Code` · `TraceLog.Empty` · `TraceLog.Truncated`.
- `TraceLog.Detail` — `label?: string` (aria-label del trigger; default `"detalle"`). Cuando hay múltiples `Detail` en un mismo log, pasá un `label` distinto en cada uno para que los lectores de pantalla puedan distinguirlos.

## Contrato a11y

### Live region (streaming)

`Body` expone `role="log"`, que tiene `aria-live="polite"` implícito por especificación ARIA.

- `streaming={true}` → `aria-live="polite"` explícito. Nuevas filas son anunciadas a los lectores de pantalla al llegar.
- `streaming={false}` (default) → `aria-live="off"` explícito. Esto **suprime** el `polite` implícito del rol, silenciando re-anuncios innecesarios en logs estáticos o finalizados.

`streaming` se propaga vía **contexto** (`StreamingContext`), por lo que `Body` no necesita ser hijo directo de `Root`:

```tsx
// Funciona correctamente — aria-live="polite" llega por contexto
<TraceLog.Root streaming>
  <div>
    <TraceLog.Body />
  </div>
</TraceLog.Root>
```

### Tone / severidad

Cada `Row` lleva icono + label textual del tone (`.sr-only`) — la severidad nunca es solo color (WCAG 1.4.1).

### Focus ring

`Detail` trigger y `Truncated` usan `focus-visible:ring-2 focus-visible:ring-ring` más un outline nativo de fallback (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`). El focus siempre es visible aunque las utilidades ring no estén en el bundle del consumidor (WCAG 2.4.7).

### Detail label

```tsx
<TraceLog.Detail label="Ver trazas del parser">…</TraceLog.Detail>
<TraceLog.Detail label="Ver errores del validador">…</TraceLog.Detail>
```

Sin `label`, el trigger tiene `aria-label="detalle"`. Con `label`, el aria-label es el valor provisto, lo que permite a los lectores de pantalla anunciar el nombre preciso de cada sección colapsable.

## maxHeight / scroll

`maxHeight` establece un techo, no una altura fija. Un log corto se encoge al contenido; el scroll aparece solo cuando el contenido supera `maxHeight`. Útil para auto-scroll al final:

```tsx
const bodyRef = useRef<HTMLDivElement>(null);
// después de agregar filas:
bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });

<TraceLog.Body ref={bodyRef} maxHeight={300}>…</TraceLog.Body>
```

## Do / Don't

- ✅ Usar `tone` para severidad; ✅ `streaming` solo mientras hay proceso vivo.
- ❌ No poner texto de color hardcodeado; ❌ no usar `Detail` para contenido crítico siempre-visible.

## Styling

### Simple path (recommended) — zero Tailwind config required

`@studio/ui` ships a **precompiled, self-contained `dist/styles.css`** that includes all utility classes and theme variable mappings. Import it once in your app entry and you are done:

```ts
import "@studio/ui/styles.css";
```

No PostCSS, no Tailwind config, no `@source` directive needed.

### Tailwind v4 consumers

If your app already runs Tailwind v4, skip `dist/styles.css` and instead add the token layers + an `@source` directive to your CSS entry so Tailwind generates the utility classes used by TraceLog:

```css
/* your app's main CSS entry */
@import "tailwindcss";
@import "@studio/tokens/theme.css";          /* mapping layer: --color-<token> utilities */
@import "@studio/tokens/theme-cockpit.css";  /* value layer: cockpit theme at :root (default) */
@import "@studio/tokens/theme-test.css";     /* optional: test theme under [data-theme="test"] */
@source "../node_modules/@studio/ui/dist/**/*.js";
```

> Always import both the mapping layer (`theme.css`) **and** a value layer (`theme-cockpit.css` / `theme-test.css`). The mapping layer alone does not define the actual `--surface-2`, `--ink`, etc. values — without a value layer, components render colorless.
