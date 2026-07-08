# @duly/tokens

Design tokens for the Studio design system — OKLCH multi-theme CSS variables (with hex fallbacks for older browsers) and a typed JavaScript token map.

## Install

```bash
pnpm add @duly/tokens
```

## CSS exports

Several CSS entry points cover different use cases:

### `@duly/tokens/css` — full standalone bundle

```css
@import "@duly/tokens/css";
```

Includes the full Tailwind v4 engine (`@import "tailwindcss"`) plus all theme variable layers. Use this only in apps or tools that **do not** already import Tailwind themselves (e.g. in the design system's own Storybook build). Do not combine with your own `@import "tailwindcss"` or you will get duplicate preflight and utility classes.

### `@duly/tokens/theme.css` — engine-free mapping layer

```css
@import "@duly/tokens/theme.css";
```

Emits only `@theme inline { … }` — maps `--color-<token>` Tailwind color utilities and `duration-*`/`ease-*` motion utilities to CSS custom property names without pulling in the Tailwind engine or preflight. This file does **not** define the actual token values (`--surface-2`, `--ink`, `--duration-base`, etc.); it only wires utility names to variable names.

**Always pair with a value layer** when using Tailwind v4. A complete Tailwind consumer CSS entry looks like:

```css
@import "tailwindcss";
@import "@duly/tokens/theme.css";          /* mapping layer: --color-<token>, duration-*, ease-* utilities */
@import "@duly/tokens/motion.css";         /* value layer: duration + easing tokens (theme-agnostic) */
@import "@duly/tokens/theme-cockpit.css";  /* value layer: cockpit theme at :root (default) */
@import "@duly/tokens/theme-test.css";     /* optional: test theme under [data-theme="test"] */
@source "../node_modules/@duly/ui/dist/**/*.js";  /* scan compiled output for utility classes */
```

Without the value layer, color and motion utilities resolve to undefined CSS variables (colorless components, no transitions).

### `@duly/tokens/theme-cockpit.css` / `@duly/tokens/theme-test.css` — per-theme variable sets

```css
@import "@duly/tokens/theme-cockpit.css";
@import "@duly/tokens/theme-test.css";
```

Each file emits the raw `:root` / `[data-theme="<name>"]` CSS custom property blocks with hex + oklch fallback pairs. Use these when you need fine-grained control over which themes are loaded, or for server-side pre-rendering a specific theme.

### `@duly/tokens/motion.css` — duration + easing tokens

```css
@import "@duly/tokens/motion.css";
```

Theme-agnostic (applies at `:root`, no `data-theme` needed). Ships four durations (`--duration-fast` 150ms, `--duration-base` 200ms, `--duration-slow` 300ms, `--duration-slower` 500ms) and two easing curves (`--ease-standard`, `--ease-emphasized`), wired into Tailwind so components can use `duration-base`, `ease-standard`, etc. as utility classes.

Honors `prefers-reduced-motion: reduce` by collapsing every duration to `1ms` — components still change state, just without perceptible animation. Consumers get this for free; no per-component opt-in required.

## Theme switching

Apply a theme by setting `data-theme` on a container element:

```html
<!-- cockpit is :root default — data-theme is needed only to switch themes -->
<div data-theme="test">
  <!-- all CSS custom properties reflect the "test" theme here -->
</div>
```

## JavaScript token map

```ts
import { tokens } from "@duly/tokens";

// tokens.<theme>["<token>"] → hex string
const surface = tokens.cockpit["surface-2"];   // "#131418"
const accent  = tokens.test["accent"];         // "#b07cff"
```

The `tokens` object contains only the hex fallback values (not the oklch strings) and is fully typed:

```ts
// Inferred types (from dist/tokens.d.ts):
type ThemeableToken = "bg-base" | "bg-elevated" | "surface-2" | /* … 31 keys total */;
declare const tokens: Record<"cockpit" | "test", Record<ThemeableToken, string>>;
```

The JS token map is useful for runtime theming in canvas/WebGL contexts, chart libraries, or any place where you need token values as plain strings rather than CSS variables.
