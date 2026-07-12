# Consuming Duly in your app

Two complete walkthroughs — one for plain React/Vite apps and one for apps already running Tailwind v4.

---

## A. Plain React / Vite app (no Tailwind)

This path requires **zero Tailwind configuration**. The precompiled `dist/styles.css` ships every utility class and theme variable the components need.

### 1. Install

```bash
pnpm add @duly/ui @duly/tokens
```

### 2. Import the stylesheet

In your app entry point (e.g. `src/main.tsx`):

```ts
import "@duly/ui/styles.css";
```

This single import provides:
- All Tailwind utility classes used by Duly components
- The `cockpit` theme variables at `:root` (default, dark)
- The `light` theme variables under `[data-theme="light"]` (light mode of the default brand)
- The `test` theme variables under `[data-theme="test"]`

No PostCSS, no `tailwind.config`, no build plugin needed.

### 3. Set the theme root

```tsx
// src/App.tsx
export function App() {
  return (
    // cockpit is already the :root default.
    // Only add data-theme when switching to another theme.
    <div data-theme="cockpit">
      <AgentPanel />
    </div>
  );
}
```

To switch the theme at runtime (e.g. from a user preference):

```tsx
const [theme, setTheme] = React.useState<"cockpit" | "light" | "test">("cockpit");

return <div data-theme={theme}>{/* … */}</div>;
```

### 4. Render a component

```tsx
// src/AgentPanel.tsx
import { TraceLog } from "@duly/ui";

export function AgentPanel() {
  return (
    <TraceLog.Root density="comfortable" streaming={false}>
      <TraceLog.Header title="Execution log" hint="run-007" />
      <TraceLog.Body>
        <TraceLog.Row tone="ok" agent="orchestrator" step="1 / 3">
          Task decomposition complete.
        </TraceLog.Row>
        <TraceLog.Row tone="review" agent="retriever" step="2 / 3">
          Fetching 12 documents from vector store.
        </TraceLog.Row>
        <TraceLog.Row tone="warn" agent="synthesizer" step="3 / 3">
          Context window at 94 % — truncating oldest messages.
          <TraceLog.Detail>
            token_count=127_843 / limit=128_000
          </TraceLog.Detail>
        </TraceLog.Row>
      </TraceLog.Body>
    </TraceLog.Root>
  );
}
```

### 5. Fonts (optional)

Duly components reference `Geist` (sans-serif), `Manrope` (display), and `JetBrains Mono` (monospace). They fall back gracefully to system fonts if these are not loaded. To load them from Google Fonts, add to your `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@400;700&family=Manrope:wght@700;800&family=JetBrains+Mono:wght@400&display=swap"
  rel="stylesheet"
/>
```

---

## B. App with Tailwind v4

If your app already runs Tailwind v4, skip `dist/styles.css` (which bundles its own Tailwind engine) and use the engine-free token layer instead.

### 1. Install

```bash
pnpm add @duly/ui @duly/tokens
```

### 2. Configure your CSS entry

```css
/* src/app.css (or wherever you import tailwindcss) */
@import "tailwindcss";

/* Mapping layer: wires --color-<token> Tailwind utilities to CSS custom properties */
@import "@duly/tokens/theme.css";

/* Value layers: define the actual --surface-2, --ink, etc. custom property values */
@import "@duly/tokens/theme-cockpit.css";  /* cockpit theme at :root (default, dark) */
@import "@duly/tokens/theme-light.css";    /* optional: light theme under [data-theme="light"] */
@import "@duly/tokens/theme-violet.css";   /* optional: violet theme under [data-theme="violet"] */

/* Scan the compiled UI package so Tailwind generates component utility classes */
@source "../node_modules/@duly/ui/dist/**/*.js";
```

> **`theme.css` alone is not enough** — it only maps utility names to CSS variables; it does not define the variable values. You must also import a value layer (`theme-cockpit.css` and/or `theme-violet.css`), otherwise color utilities resolve to undefined variables and components render colorless.

> **Do not** also import `@duly/ui/styles.css` — that would pull in a second copy of the Tailwind engine.

### 3. Set the theme root

Same as the plain-React path:

```tsx
<div data-theme="cockpit">
  {/* your app */}
</div>
```

### 4. Use tokens as Tailwind utilities

With `@duly/tokens/theme.css` loaded, every semantic token is available as a Tailwind color utility:

```tsx
// bg-surface-2 → background-color: var(--surface-2)
// text-ink     → color: var(--ink)
// border-border-subtle → border-color: var(--border-subtle)
<div className="bg-surface-2 text-ink border border-border-subtle rounded-xl p-4">
  Custom component using design tokens
</div>
```

### 5. Fonts

Same Google Fonts `<link>` as in the plain-React path above.

---

## Common notes

- `data-theme` scopes theme variables to a subtree — you can render multiple themes on the same page by nesting different `data-theme` containers.
- The optional `@duly/ui/reset.css` provides a lightweight CSS normalization. Import it before `styles.css` if you want it.
- See [theming.md](./theming.md) for the full semantic token reference and how to add a custom theme.
