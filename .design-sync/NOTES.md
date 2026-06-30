# design-sync notes — @studio/ui

## CSS: bundle-with-preflight.css

`packages/ui/dist/bundle-with-preflight.css` must be regenerated after every DS build:

```bash
cat packages/ui/dist/reset.css packages/ui/dist/styles.css > packages/ui/dist/bundle-with-preflight.css
```

**Why:** `styles.css` intentionally excludes Tailwind preflight (`@layer base`) so consuming apps keep their own resets. Without preflight, Radix `<button>` triggers (AccordionTrigger, etc.) render with native Chromium gray background in the preview — storybook has full Tailwind via `app.css` and looks correct, creating a mismatch. The concat file lives in `dist/` (within the package boundary) because `cssEntry` cannot resolve paths outside the package root.

## PreviewWrapper

`.design-sync/preview-wrapper.tsx` replicates the storybook decorator from `apps/docs/.storybook/preview.tsx`. The original decorator imports `./app.css` (PostCSS/Tailwind) which esbuild cannot resolve. The wrapper applies `data-theme="cockpit"` and a `--bg-base` background directly.

## Font: JetBrains Mono

`--font-mono` references JetBrains Mono but no woff2 files exist in the workspace. Both sides (storybook and preview) fall back to the same system monospace font, so previews compare clean. Accepted as-is.

## cardMode: column

Accordion, Skeleton, RadioGroup, Textarea render stories wider than the default grid cell. Set `"cardMode": "column"` in config overrides to avoid `[GRID_OVERFLOW]` warnings.

## resync.mjs — required flags

```bash
node .ds-sync/resync.mjs \
  --config .design-sync/config.json \
  --node-modules packages/ui/node_modules \
  --out ./ds-bundle \
  --storybook-static .design-sync/sb-reference \
  --entry packages/ui/dist/index.js
```

`--entry` needed because `@studio/ui` is a workspace package, not installed under `node_modules/@studio/ui`. Without it, the driver errors `[NO_DIST]`.

## [REFERENCE_STALE?] warning

Expected when only CSS changes (not DS source). The storybook reference is still correct — it uses `app.css` which has full Tailwind + preflight regardless of our CSS changes. Safe to ignore.

## Grade results

All 22 components: `match` across all stories. Zero failures. Zero regressions.
