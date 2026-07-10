# Duly

Duly is a multi-brand agent-ops design system: themeable OKLCH tokens, accessible React components, and a Storybook-powered docs app, all in one monorepo. It ships two packages — `@duly/tokens` (CSS variables + typed JS token map) and `@duly/ui` (precompiled, RSC-ready React components) — designed for cockpit-style agent dashboards that support multiple brand themes with a single stylesheet swap.

## Requirements

- **Node** ≥ 20
- **pnpm** 10.33.2 (enforced via `packageManager` field)

## Getting started

```bash
pnpm install
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm turbo run tokens build lint test` | Full pipeline: generate tokens → build packages → lint → test |
| `pnpm --filter @duly/docs storybook` | Launch Storybook at <http://localhost:6006> |
| `pnpm changeset` | Open the changeset wizard to version packages |

## Monorepo layout

```
.
├── packages/
│   ├── tokens/         # @duly/tokens — OKLCH multi-theme CSS vars + typed JS map
│   ├── ui/             # @duly/ui     — React components (TraceLog, …)
│   ├── eslint-config/  # Shared ESLint flat config
│   └── tsconfig/       # Shared TypeScript base configs
├── apps/
│   └── docs/           # @duly/docs — Storybook documentation app
├── docs/
│   └── guides/         # Prose guides for consumers and contributors
└── turbo.json          # Turborepo pipeline
```

## Guides

- [Consuming in your app](docs/guides/consuming-in-your-app.md) — plain-React and Tailwind v4 walkthroughs
- [Theming](docs/guides/theming.md) — semantic token reference and how to add a new theme
- [Trust model](docs/guides/trust-model.md) — the six agentic primitives (identity, scope, history, provenance, approval, reversibility) mapped to components
- [packages/ui](packages/ui/README.md) — `@duly/ui` component API
- [packages/tokens](packages/tokens/README.md) — `@duly/tokens` CSS and JS API
- [apps/docs](apps/docs/README.md) — running the Storybook locally
- [CONTRIBUTING.md](CONTRIBUTING.md) — dev setup, release flow, token versioning policy

## Troubleshooting

**`tailwindcss` not found when building tokens in CI or a fresh clone**

The root `.npmrc` includes `public-hoist-pattern[]=tailwindcss` to hoist `tailwindcss` from `apps/docs/node_modules` to the workspace root so that `@tailwindcss/postcss` can resolve it when it processes `@duly/tokens/dist/index.css` at Storybook build time. If you see a resolution error for `tailwindcss`, make sure you ran `pnpm install` from the workspace root (not from an individual package directory) so the hoist takes effect.
