# design-sync notes — @duly/ui

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

`--entry` needed because `@duly/ui` is a workspace package, not installed under `node_modules/@duly/ui`. Without it, the driver errors `[NO_DIST]`.

## [REFERENCE_STALE?] warning

Expected when only CSS changes (not DS source). The storybook reference is still correct — it uses `app.css` which has full Tailwind + preflight regardless of our CSS changes. Safe to ignore.

## Grade results

All 22 components: `match` across all stories. Zero failures. Zero regressions.

## GRID_OVERFLOW root cause (2026-07-01)

El `cardMode: "column"` de Accordion/Skeleton/RadioGroup/Textarea silenciaba un
bug real: stories con anchos fijos (`w-96`/`w-80`) que desbordan contenedores
angostos, y `border-b` sin color (= currentColor blanco en Tailwind v4 sin
preflight). Ambos corregidos: stories ahora `w-full max-w-*`, y `styles.css`
restaura el default `border-color: var(--border-subtle)` a nivel components
layer. Lección: un GRID_OVERFLOW nuevo se investiga, no se silencia con config.

## Re-sync risks (updated 2026-07-02)

Watch-list for the next sync:

- **grade.json keys are story DISPLAY names, not export names.** Compare grade keys are
  the human titles with spaces ("With Label", "All States", "Neural Cores", "Agent Status",
  "Live Workflow Run") — NOT export identifiers ("WithLabel", "AllStates"). The capture
  facts `.stories[].name` field returns the EXPORT name; do not use it for grade keys. Read
  the exact keys from the `[COMPARE] <Name>: N needs-grade — grade keys: …` log line. A wrong
  key silently leaves that story in pendingGrade (hit this 2026-07-02: 9 components re-keyed).
- **Card / "Agent Status" = close (not match).** Secondary/outline "Logs" button border
  renders in storybook (app.css preflight) but is absent in the shipped bundle preview.
  Pre-existing bundle-vs-preflight gap. Fix candidate: give the outline/secondary Button
  variant an explicit border-width + border-color in packages/ui so it doesn't depend on
  preflight. Re-check this story after any Button/border CSS change.
- **conventions.md token drift (fixed 2026-07-02).** Prior conventions.md named tokens that
  don't exist in the compiled CSS (--bg-muted, --fg-base, --fg-muted, --color-accent,
  --color-destructive, bare --border/--radius/--font-mono). Corrected to real vocabulary:
  --surface-2/--bg-elevated (surfaces), --ink/--dim/--faint (text), --border-subtle + --border-*
  (borders), --accent/--accent-secondary + tones --ok/--warn/--block/--review/--info, --radius-2xl.
  LESSON: validate every conventions token against ds-bundle/_ds_bundle.css each sync — a wrong
  name ships silently-unstyled designs.
- **New components 2026-07-02:** ExecutionTimeline, RunTimeline (agentic) — first graded, all
  stories match. AgentGallery uses WebGL cores; animation-frame diffs between panels are expected.
- **JetBrains Mono still unresolved.** var(--font-mono) is not a resolvable custom property and
  no woff2 ships; the font-mono utility class falls back to system monospace on both panels. Accepted.

## Re-sync 2026-07-02 (round 2) — 8 components added, claude.ai now 33

Parallel work pushed 7 new agentic components to main after the first sync; re-synced to close the gap.

- **titleMap needed for 2 components** whose story title's middle segment ≠ export name:
  - "Agentic/Approval Gate/V001 Evidence Pack" → export `ApprovalGateCard` → `cfg.titleMap {"V001EvidencePack": "ApprovalGateCard"}`
  - "Agentic/Property Intelligence/V001 Real Estate Console" → export `PropertyIntelligenceConsole` → `{"V001RealEstateConsole": "PropertyIntelligenceConsole"}`
  Without these they drop as [TITLE_UNMAPPED]. The converter derives the title-key from the LEAF segment when the middle doesn't match an export.
- **ToolCallCard** (RichToolCallCard export, mapped via title "Tool Call Card") → `cfg.overrides.ToolCallCard.cardMode:"column"` for [GRID_OVERFLOW] (wide result cards).
- **Grouping quirk:** ApprovalGateCard landed in group `approval-gate` and PropertyIntelligenceConsole in `property-intelligence` (singleton groups derived from their title's 2nd segment), not `agentic`. Functional; cosmetic only. To fold them into `agentic`, would need a group override.
- All 8 new components graded: every story match (29 stories). No mismatches.
