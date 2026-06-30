# Batch 2 Report — TraceLog a11y + robustness hardening

**Branch:** `feat/ds-foundation`  
**Date:** 2026-06-30

---

## Changes applied

### 1. Streaming via context (fix silent no-op + correct live-region semantics)

**Files:** `trace-log.context.ts`, `trace-log.tsx`

- Added `StreamingContext` (boolean, default `false`) and `useStreaming` to `trace-log.context.ts`, mirroring `DensityContext`.
- Removed `RootWithStreaming` and merged into `Root`: `Root` now accepts `streaming?: boolean` and provides it via `StreamingContext.Provider`. The `streaming` prop is destructured before `...rest` so it never bleeds to the DOM.
- `Body` reads `StreamingContext` (not props) and sets its own `aria-live`:
  - `streaming=true` → `aria-live="polite"` (announces new rows)
  - `streaming=false` (default) → `aria-live="off"` (suppresses the implicit `polite` of `role="log"` for static/finished logs)
- This fixes the silent no-op: Body works regardless of nesting depth.

**TDD evidence:**
- `"streaming aplica aria-live=polite aunque Body no sea hijo directo de Root"` — renders `<Root streaming><div><Body/></div></Root>`, asserts `role="log"` has `aria-live="polite"`. Fails before implementation (cloneElement only reached direct children), passes after.
- `"sin streaming Body tiene aria-live=off para silenciar el role=log implícito"` — renders `<Root><Body/></Root>`, asserts `aria-live="off"`. Fails before (no aria-live was set), passes after.

---

### 2. ScrollArea: `maxHeight` must cap, not fix

**File:** `trace-log.tsx`

- `ScrollArea.Root` no longer has a `style={{ height }}` — it is unstyled (shrinks to content).
- `ScrollArea.Viewport` receives `style={{ maxHeight }}` and `className="w-full"` (drops `size-full` / `h-full`).
- A short log shrinks to content; scroll triggers only when content exceeds `maxHeight`.
- When `maxHeight` is set, `forwardRef` routes `ref` to `ScrollArea.Viewport` (the scrollable element) for consumer auto-scroll.

**TDD evidence:** Existing axe test exercises `maxHeight={300}`; passes before and after (structure-preserving change). Manual inspection: `ScrollArea.Root` has no `height` style, `Viewport` has `maxHeight`.

---

### 3. forwardRef on Body and Row

**File:** `trace-log.tsx`

- `Body`: `React.forwardRef<HTMLDivElement, BodyProps>`. When no `maxHeight`, ref → `role="log"` div. When `maxHeight`, ref → `ScrollArea.Viewport`.
- `Row`: `React.forwardRef<HTMLDivElement, RowProps>`. Ref → the outer `data-tone` div.
- Both retain their `displayName`.

---

### 4. Focus ring: native outline fallback

**File:** `trace-log.tsx`

Replaced `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` on both `Detail` trigger and `Truncated` button with:

```
focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
```

- Ring is kept for Tailwind-aware consumers.  
- The native `outline` (using `--ring` token via `outline-ring`) acts as a guaranteed fallback so focus is never invisible (WCAG 2.4.7).  
- No raw hex or rgba used.  
- Classes confirmed in `dist/styles.css` (build grep matched).

---

### 5. Row: defensive tone normalization

**File:** `trace-log.tsx`

```tsx
const t: Tone = (tone in toneIcon) ? tone : "info";
```

`t` is used for icon lookup, `rowVariants`, `toneText`, `toneLabel`. An unknown tone from a JS consumer (e.g. `"danger"`) degrades to `"info"` instead of crashing with `Element type is invalid`.

**TDD evidence:** `"tone inválido (JS consumer sin TS) degrada a 'info' sin crashear"` — renders `<Row tone={"danger" as any}>`, asserts `data-tone="info"` and `border-info` class. Fails before (crash / undefined Icon), passes after.

---

### 6. Detail: optional aria-label

**File:** `trace-log.tsx`

- `Detail` now accepts `label?: string`. Trigger has `aria-label={label ?? "detalle"}`.
- Default behavior unchanged (`aria-label="detalle"`).
- Multiple `Detail` components in one log can each carry a unique `label` so AT users can distinguish them.

**TDD evidence:** `"Detail acepta label para aria-label personalizado"` — renders two Detail components with distinct labels, asserts each `getByRole("button", { name })` resolves correctly.

---

### 7. Test hygiene: collapse + Space key

**File:** `trace-log.test.tsx`

Extended `"expande/colapsa el detalle con teclado"`:

1. Focus trigger → `{Enter}` → content visible (expand). ✓ (existing)
2. `{Enter}` again → content null (collapse). ✓ (new)
3. `" "` (Space) → content visible (re-expand). ✓ (new)

---

## Final test count

| Suite | Tests |
|---|---|
| `src/lib/cn.test.ts` | 1 |
| `src/trace-log/trace-log.test.tsx` | 17 |
| **Total** | **18** |

Previously: 14 total (13 trace-log + 1 cn). Added 4 new tests.

## Lint result

`pnpm --filter @studio/ui lint` — **clean** (0 warnings, 0 errors). No raw hex/rgba introduced.

## Build result

`pnpm --filter @studio/ui build` — tsup OK, DTS OK, Tailwind CSS OK.  
`dist/styles.css` contains `outline-ring`, `outline-2`, `outline-offset` utilities (grep confirmed).

## Commit SHA

See git log on `feat/ds-foundation`.
