# Duly

Duly is a multi-brand agent-ops design system: themeable OKLCH tokens, accessible React components, and a Storybook-powered docs app, all in one monorepo. It ships two packages — `@enregla-ui/duly-tokens` (CSS variables + typed JS token map) and `@enregla-ui/duly-ui` (precompiled, RSC-ready React components) — designed for cockpit-style agent dashboards that support multiple brand themes with a single stylesheet swap.

## 90-second demo

The demo has two parts: a scripted agent session against a stdio MCP server, and an agent-ops cockpit built from `@enregla-ui/duly-ui`. The cockpit is the reference render of the instructions that server returns. Sample numbers are fictional. Approve, reject, and escalate update local page state only.

`pnpm install` on a cold cache is usually longer than 90 seconds. The commands below assume dependencies are already installed.

**Agent session** (stdio MCP; prints a short transcript and exits):

```bash
pnpm demo
```

That builds token CSS, starts `@duly/mcp` over stdio, and calls `list_tokens`, `list_components`, `get_generate_ui_instructions`, plus the `duly://design-system.json` resource. A successful run ends with `demo ok`.

**Cockpit UI.** Stories compile from `packages/ui/src`, but Storybook's preview imports the built `@enregla-ui/duly-ui` package, so build it once after tokens exist (`pnpm demo` already builds tokens):

```bash
pnpm --filter @enregla-ui/duly-ui build
pnpm --filter @duly/docs storybook
```

Open <http://localhost:6006/?path=/story/agentic-demo-agent-ops-cockpit--cockpit> (sidebar: **Agentic → Demo → Agent Ops Cockpit**).

Keyboard check: Tab to a row in the approval queue, press Enter to expand it, Tab to **Approve**, press Enter. A critical-risk row asks you to confirm Approve a second time. Status is text plus an icon, not color alone.

**Showcase route** (needs a UI package build, so it is the slower path):

```bash
pnpm exec turbo run build --filter=@duly/showcase...
pnpm --filter @duly/showcase dev
```

Open <http://localhost:5173/#demo>.

### How an agent consumes the design system

Run the MCP server from the repo root:

```bash
pnpm --filter @enregla-ui/duly-tokens tokens
pnpm --filter @duly/mcp start
```

Point an MCP client at that stdio process. Example config (set `cwd` to your clone):

```json
{
  "mcpServers": {
    "duly": {
      "command": "pnpm",
      "args": ["--filter", "@duly/mcp", "start"]
    }
  }
}
```

Tools, all read-only:

| Tool | What it returns |
|---|---|
| `list_tokens` | Semantic tokens for one theme (`cockpit`, `violet`, `light`, `ganapliego`) or every theme. Each entry has `cssVar`, `hex`, and `oklch`. |
| `list_components` | Curated component inventory. Optional `query` and `area` (`agentic` or `primitive`). |
| `get_generate_ui_instructions` | How to mount `AgentOpsCockpit`, the composition order, accessibility rules, and limitations. |

The same document is available as the MCP resource `duly://design-system.json` and as the committed file [`packages/mcp/design-system.json`](packages/mcp/design-system.json). CSS entry points are `@enregla-ui/duly-tokens/css` and the per-theme stylesheets such as `@enregla-ui/duly-tokens/theme-cockpit.css`. Component props are the TypeScript sources under `packages/ui/src`, not the inventory.

After a token change, regenerate the JSON with `pnpm --filter @duly/mcp export`. The `@duly/mcp` test fails if that file drifts.

### Limitations

- The MCP server does not render React, call a model, or connect to a live agent runtime. It returns tokens, a component list, and composition instructions.
- The inventory is hand-maintained. It is not every export in `@enregla-ui/duly-ui`, and it does not include prop types.
- Hex values are the CSS fallback. Supporting browsers use the OKLCH custom property from the theme stylesheet. The export's `oklch` field is parsed from that CSS.
- `AgentOpsCockpit` is sample data. Queue decisions stay in the browser.
- There is no hosted demo URL. You run Storybook or the showcase locally.
- Storybook's first compile depends on the machine. The MCP transcript itself is the part that finishes in a few seconds after install.
- Workspace package names are `@enregla-ui/duly-tokens` and `@enregla-ui/duly-ui`. The MCP package `@duly/mcp` is private to this repo.

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
| `pnpm demo` | Build tokens and run the scripted MCP demo |
| `pnpm turbo run tokens build lint test` | Full pipeline: generate tokens → build packages → lint → test |
| `pnpm --filter @duly/docs storybook` | Launch Storybook at <http://localhost:6006> |
| `pnpm changeset` | Open the changeset wizard to version packages |

## Monorepo layout

```
.
├── packages/
│   ├── mcp/            # @duly/mcp — stdio MCP server (tokens, inventory, UI instructions)
│   ├── tokens/         # @enregla-ui/duly-tokens — OKLCH multi-theme CSS vars + typed JS map
│   ├── ui/             # @enregla-ui/duly-ui — React components (TraceLog, AgentOpsCockpit, …)
│   ├── eslint-config/  # Shared ESLint flat config
│   └── tsconfig/       # Shared TypeScript base configs
├── apps/
│   ├── docs/           # @duly/docs — Storybook documentation app
│   └── showcase/       # @duly/showcase — Vite gallery, including #demo
├── docs/
│   └── guides/         # Prose guides for consumers and contributors
└── turbo.json          # Turborepo pipeline
```

## Guides

- [Consuming in your app](docs/guides/consuming-in-your-app.md) — plain-React and Tailwind v4 walkthroughs
- [Theming](docs/guides/theming.md) — semantic token reference and how to add a new theme
- [packages/ui](packages/ui/README.md) — `@duly/ui` component API
- [packages/tokens](packages/tokens/README.md) — `@duly/tokens` CSS and JS API
- [apps/docs](apps/docs/README.md) — running the Storybook locally
- [CONTRIBUTING.md](CONTRIBUTING.md) — dev setup, release flow, token versioning policy

## Troubleshooting

**`tailwindcss` not found when building tokens in CI or a fresh clone**

The root `.npmrc` includes `public-hoist-pattern[]=tailwindcss` to hoist `tailwindcss` from `apps/docs/node_modules` to the workspace root so that `@tailwindcss/postcss` can resolve it when it processes `@duly/tokens/dist/index.css` at Storybook build time. If you see a resolution error for `tailwindcss`, make sure you ran `pnpm install` from the workspace root (not from an individual package directory) so the hoist takes effect.
