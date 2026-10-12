# @duly/docs — Storybook

Interactive component documentation for Duly, powered by Storybook 8.

Storybook is the component catalog. The public agent-ops cockpit is the story **Agentic → Demo → Agent Ops Cockpit**. `apps/showcase` is a separate Vite app of composed vertical screens; it is not this Storybook.

## Running locally

From the workspace root, `pnpm demo:ui` builds tokens and `@enregla-ui/duly-ui`, then starts Storybook. The preview imports the built UI package, so a cold `pnpm storybook` fails until that build exists.

```bash
pnpm demo:ui
```

Opens at <http://localhost:6006>. Cockpit: <http://localhost:6006/?path=/story/agentic-demo-agent-ops-cockpit--cockpit>.

## Theme toolbar

The Storybook toolbar exposes a **"Tema"** dropdown:

| Value | Description |
|---|---|
| `cockpit` | Default dark theme — teal accent, neutral surfaces |
| `light` | Light surfaces, same brand hue |
| `violet` | Dark surfaces with a violet accent |

Each story is wrapped in a `<div data-theme={selection}>` decorator (see `.storybook/preview.tsx`) so you can switch themes live without reloading.

## How styling works

Storybook's CSS entry (`.storybook/app.css`) does two things:

```css
@import "@enregla-ui/duly-tokens/css";
@source "../../../packages/ui/src/**/*.{ts,tsx}";
```

1. `@import "@enregla-ui/duly-tokens/css"` pulls in the full Tailwind engine plus all theme variable layers. This is the only place in the monorepo where the full bundle is imported directly.
2. `@source` tells Tailwind to scan the UI package source tree so every utility class used by components is generated.

The root `.npmrc` contains `public-hoist-pattern[]=tailwindcss`, which hoists `tailwindcss` from `apps/docs/node_modules` to the workspace root. This is required so that `@tailwindcss/postcss` can resolve `tailwindcss` when processing token CSS files at build time. Without this hoist the Storybook build fails with a module-not-found error for `tailwindcss`.

## Building the static site

```bash
pnpm --filter @duly/docs build
```

Output is written to `apps/docs/storybook-static/`.
