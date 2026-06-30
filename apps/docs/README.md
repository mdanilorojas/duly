# @studio/docs — Storybook

Interactive component documentation for Studio DS, powered by Storybook 8.

## Running locally

From the workspace root:

```bash
pnpm --filter @studio/docs storybook
```

Opens at <http://localhost:6006>.

## Theme toolbar

The Storybook toolbar exposes a **"Tema"** dropdown with two options:

| Value | Description |
|---|---|
| `cockpit` | Default dark theme — teal accent, neutral surfaces |
| `test` | Alternate dark theme — purple accent, cooler surfaces |

Each story is wrapped in a `<div data-theme={selection}>` decorator (see `.storybook/preview.tsx`) so you can switch themes live without reloading.

## How styling works

Storybook's CSS entry (`.storybook/app.css`) does two things:

```css
@import "@studio/tokens/css";
@source "../../../packages/ui/src/**/*.{ts,tsx}";
```

1. `@import "@studio/tokens/css"` pulls in the full Tailwind engine plus all theme variable layers. This is the only place in the monorepo where the full bundle is imported directly.
2. `@source` tells Tailwind to scan the UI package source tree so every utility class used by components is generated.

The root `.npmrc` contains `public-hoist-pattern[]=tailwindcss`, which hoists `tailwindcss` from `apps/docs/node_modules` to the workspace root. This is required so that `@tailwindcss/postcss` can resolve `tailwindcss` when processing token CSS files at build time. Without this hoist the Storybook build fails with a module-not-found error for `tailwindcss`.

## Building the static site

```bash
pnpm --filter @studio/docs build
```

Output is written to `apps/docs/storybook-static/`.
