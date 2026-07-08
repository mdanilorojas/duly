# Theming

Duly uses a set of 31 semantic CSS custom properties to express every color decision. All components reference these tokens — never raw hex values — so swapping a theme is a single `data-theme` attribute change.

---

## The 31 semantic tokens

Tokens are grouped by role:

### Backgrounds

| Token | Role |
|---|---|
| `--bg-base` | Page/canvas background |
| `--bg-elevated` | Elevated surface (popover, dropdown) |

### Surfaces

| Token | Role |
|---|---|
| `--surface-2` | Primary card / panel surface |
| `--surface-3` | Secondary card (nested, inset) |
| `--surface-header` | Component header bands |
| `--surface-sunken` | Input fields, code blocks (sunken) |

### Text

| Token | Role |
|---|---|
| `--ink` | Primary text |
| `--dim` | Secondary / meta text |
| `--faint` | Tertiary / placeholder text |
| `--faint-deco` | Decorative rules and separators |

### Borders

| Token | Role |
|---|---|
| `--border-subtle` | Quiet container edges |
| `--border-default` | Standard control borders |
| `--border-strong` | High-contrast / focus-adjacent borders |
| `--border-divider` | Intra-component dividers (accent hue) |
| `--ring` | Focus ring color |

### Accent (brand primary)

| Token | Role |
|---|---|
| `--accent` | Interactive accent / primary action |
| `--on-accent` | Text/icon on accent backgrounds |
| `--accent-surface` | Tinted accent fill (subtle highlight) |
| `--accent-border` | Accent-tinted border |

### Accent secondary

| Token | Role |
|---|---|
| `--accent-secondary` | Secondary accent (complementary hue) |
| `--on-accent-secondary` | Text/icon on secondary accent |

### Status (LOCKED)

| Token | Role |
|---|---|
| `--ok` | Success / healthy |
| `--on-ok` | Text on ok background |
| `--review` | Information / in-review |
| `--on-review` | Text on review background |
| `--warn` | Warning / caution |
| `--on-warn` | Text on warn background |
| `--block` | Error / blocked |
| `--on-block` | Text on block background |
| `--info` | Neutral informational |

### Misc

| Token | Role |
|---|---|
| `--glow-seed` | Source color for glow/halo effects |

---

## How `:root` and `[data-theme]` work

Every call to `pnpm turbo run tokens` regenerates the CSS files in `packages/tokens/dist/`:

- `theme-cockpit.css` applies its variables under `:root, [data-theme="cockpit"]` (cockpit is the default theme, so it is always active unless overridden by another `[data-theme]` lower in the tree). It emits `color-scheme: dark`.
- `theme-light.css` applies its variables only under `[data-theme="light"]` and emits `color-scheme: light` — the light mode of the default brand. Status hues (`ok`, `warn`, …) are LOCKED to the same hue as the dark themes; only their L/C drop so they clear AA contrast on light surfaces.
- `theme-test.css` applies its variables only under `[data-theme="test"]`.

To activate a theme, set `data-theme` on any container:

```html
<body>
  <!-- cockpit active here via :root -->
  <section data-theme="test">
    <!-- test active here — overrides cockpit for this subtree -->
  </section>
</body>
```

---

## Adding a new theme

1. **Edit `packages/tokens/src/themes.ts`** — add a new entry to the `themes` object. The key becomes the `data-theme` value. Every one of the 31 `SEMANTIC_KEYS` must be present; missing keys cause the build to throw.

   Each value is `"<hex>|<oklch>"`. The hex is the fallback for older browsers; the oklch is used by modern browsers.

   ```ts
   // packages/tokens/src/themes.ts
   export const themes = {
     cockpit: { /* … */ },
     test: { /* … */ },
     midnight: {
       "bg-base": "#050508|oklch(0.12 0.015 285)",
       // … all 31 keys
     },
   };
   ```

2. **Run the token generator:**

   ```bash
   pnpm --filter @duly/tokens tokens
   ```

   This emits `dist/theme-midnight.css`, updates `dist/theme.css`, `dist/index.css`, `dist/tokens.js`, `dist/tokens.d.ts`, and `dist/tokens.lock.json`.

3. **Check the contrast gate.** The build test suite runs WCAG contrast checks for every theme. Run:

   ```bash
   pnpm --filter @duly/tokens test
   ```

   All pairs listed in `CONTRAST_PAIRS` (in `src/contracts.ts`) must pass their minimum ratios. Fix any failures before committing.

4. **Verify in Storybook.** Add `"midnight"` to the toolbar items in `apps/docs/.storybook/preview.tsx` and launch Storybook to visually review the new theme.

---

## Status colors are LOCKED

The six status tokens — `ok`, `review`, `warn`, `block`, `info`, and `ring` — share identical hue values across all themes. Client themes may adjust lightness and chroma (`L`/`C` in OKLCH) — e.g. the `light` theme darkens each status so it clears AA contrast on light surfaces — but rotating the hue is intentionally prohibited. The build test (`build.test.ts`) gates this by comparing the hue channel, not the full hex.

**Why?** These colors carry semantic meaning that must remain consistent across brand surfaces. Because every status state also renders an icon and a visually-hidden text label (see `TraceLog.Row`), the design system satisfies WCAG 1.4.1 (use of color) at the component level — color is never the sole information carrier.

The CVD (color vision deficiency) luminance-separation gate that was initially planned for status tokens has been **reassigned to the categorical data-visualization palette** (`--viz-cat-*`, planned for sub-project #3). Status colors do not need a luminance gate because the icon + label requirement already satisfies the accessibility requirement.

---

## Token versioning

The set of 31 keys in `SEMANTIC_KEYS` is the **public contract** of `@duly/tokens`. Changes follow semantic versioning:

- **Add a key** → minor release
- **Rename or remove a key** → major release

`dist/tokens.lock.json` records the current key set. Any diff to this file requires a matching changeset entry. See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the full release workflow.
