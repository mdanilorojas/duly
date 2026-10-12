# Duly

Duly is a multi-brand agent-ops design system: themeable OKLCH tokens, accessible React components, and a Storybook-powered docs app, all in one monorepo. It ships two packages — `@enregla-ui/duly-tokens` (CSS variables + typed JS token map) and `@enregla-ui/duly-ui` (precompiled, RSC-ready React components) — designed for cockpit-style agent dashboards that support multiple brand themes with a single stylesheet swap.

## 90-second demo

The demo has two parts: a scripted agent session against a stdio MCP server, and a surface the host renders from a fixed catalog. `compose_surface` checks that document and returns a layout plus a SHA-256 hash of what the reviewer would see. It does not execute the action. Sample numbers are fictional. Approve, reject, and escalate update local page state only.

`pnpm install` on a cold cache is usually longer than 90 seconds. The commands below assume dependencies are already installed.

**Agent session** (stdio MCP; prints a short transcript and exits):

```bash
pnpm demo
```

That builds token CSS, starts `@duly/mcp` (duly-mcp) over stdio, and calls `list_components`, `get_component_schema`, `get_theme_tokens`, and `compose_surface`. The script accepts [`packages/ui/src/agentic/duly-surface.example.json`](packages/ui/src/agentic/duly-surface.example.json), prints a `sha256:` reviewer hash, and strips a component that is not in the catalog. A successful run ends with `demo ok`.

**Cockpit UI** (Storybook). One command builds tokens, builds `@enregla-ui/duly-ui` (the preview imports that package), and starts Storybook:

```bash
pnpm demo:ui
```

Open <http://localhost:6006/?path=/story/agentic-demo-agent-ops-cockpit--cockpit> (sidebar: **Agentic → Demo → Agent Ops Cockpit**). The Storybook locale toolbar defaults to Spanish for the rest of the catalog. These demo stories force English copy.

The catalog host is **Agentic → Demo → Duly Surface**:

- Valid: <http://localhost:6006/?path=/story/agentic-demo-duly-surface--valid>
- Bad props: <http://localhost:6006/?path=/story/agentic-demo-duly-surface--bad-props>
- Unknown component: <http://localhost:6006/?path=/story/agentic-demo-duly-surface--unknown-component>

`DulySurface` renders the example surface with `ApprovalGateCard`, `GuardrailIndicator`, `TokenCostMeter`, `RichToolCallCard`, and `AuditLogTable`. A bad prop or an unknown component stays on screen as an alert. The HTML in an unknown component is not injected.

The earlier generative host is still there: **Agentic → Demo → Generative UI** at <http://localhost:6006/?path=/story/agentic-demo-generative-ui--from-document>. **Light theme** is the same document with `theme` set to `light`.

Keyboard check: Tab to a row in the approval queue, press Enter to expand it, Tab to **Approve**, press Enter. A critical-risk row asks you to confirm Approve a second time. Status is text plus an icon, not color alone.

**Showcase** is a second app: composed vertical pages, plus the same cockpit at `#demo`. It is slower because Vite loads the built UI package. Build that package once, then start the app:

```bash
pnpm --filter @enregla-ui/duly-ui build
pnpm showcase
```

Open <http://localhost:5173/#demo>. Use Storybook for the short path. Use the showcase when you want the other vertical screens in one app.

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

Tools, all read-only. The four below are the path an agent uses to emit UI:

| Tool | What it returns |
|---|---|
| `list_components` | The emit catalog: `Column`, `ApprovalGate`, `AuditLog`, `RichToolCall`, `TokenCost`, `Guardrail`. Pass `area` or `query` to search the wider hand-maintained inventory instead. |
| `get_component_schema` | A2UI-shaped JSON Schema for one component, or the whole catalog when `name` is omitted. Generated from the Zod schemas in `@duly/catalog`. |
| `get_theme_tokens` | Semantic tokens for one theme (`cockpit`, `violet`, `light`, `ganapliego`) or every theme. Each entry has `cssVar`, `hex`, and `oklch`. |
| `compose_surface` | The checked layout and a `sha256:` hash of that layout. Unknown components are stripped. `executes` is false. |

The catalog shape follows the public pattern shared by A2UI, AG-UI, and MCP Apps: the agent may emit only components from a fixed catalog, and the host renders them. This repository does not claim compatibility with OpenAI DIL. DIL is not a public spec implemented here.

`list_tokens`, `get_generate_ui_instructions`, `get_generative_ui_schema`, and `validate_generative_ui` remain for the earlier cockpit document.

The same document is available as the MCP resource `duly://design-system.json` and as the committed file [`packages/mcp/design-system.json`](packages/mcp/design-system.json). CSS entry points are `@enregla-ui/duly-tokens/css` and the per-theme stylesheets such as `@enregla-ui/duly-tokens/theme-cockpit.css`. Component props are the TypeScript sources under `packages/ui/src`, not the inventory.

### What a regulated team can evaluate

Duly does not claim SOC 2, ISO 27001, or a bank attestation. Nothing in this repository is an audit report, and this project does not contact institutions or assert that any of them use it.

An agent that emits UI gets four artifacts:

- **Themes.** `@enregla-ui/duly-tokens` ships `cockpit`, `violet`, `light`, and `ganapliego`. A surface names one of them. The host sets `data-theme` to that name, so that theme's contrast pairs apply. Status hues (`ok`, `review`, `warn`, `block`, `info`, `ring`) stay locked across themes.
- **A catalog the host renders.** `get_component_schema` returns `duly://catalog/v1`. The agent returns a surface that uses only those components. `DulySurface` renders the checked layout. `Column` is a layout node in the host. An unknown component or a bad prop stays on screen as one alert.
- **A hash of the screen.** `compose_surface` is pure. The same surface always returns the same `surfaceHash` (`sha256:` plus 64 hex characters) of the canonical checked layout. That is the record of what the reviewer saw. Duly does not store it, sign it, or retain it. The audit-log rows inside the example also carry their own record hashes. Those are sample data.
- **A person still confirms the risky action.** Approval rows are buttons. A block-risk approval asks for a second confirmation in the component. The schema rejects a field that would skip that step. Sample decisions stay in the page and do not change the reviewer hash.

The check is structural. It does not prove a control operated in production, and it is not a penetration test.

### A later packaging step

This repository does not ship an SBOM, a signed catalog, or a telemetry endpoint. A later step for a team that wants a locked renderer would pin `duly://catalog/v1`, ship `DulySurface` with the app, and keep the `surfaceHash` next to the model log. The renderer would stay in the app. There is no CDN script and no phone-home in this package. That packaging is not built here.

After a catalog change, regenerate `packages/catalog/catalog.json` with `pnpm --filter @duly/catalog export`. After a token or inventory change, regenerate `packages/mcp/design-system.json` with `pnpm --filter @duly/mcp export`. Each package test fails if its committed JSON drifts. The example surface uses the same payment, guardrails, and cost figures as `AgentOpsCockpit`.

### Limitations

- The MCP server does not render React, call a model, or connect to a live agent runtime. It returns tokens, a component list, composition instructions, and a structural document check.
- `validate_generative_ui` does not store, sign, or certify its result. It is not a SOC 2 report, an ISO certificate, or a bank attestation.
- The emit catalog is five components plus a `Column` layout node. The wider inventory is hand-maintained and is not a schema. Prop types for everything else live in `packages/ui/src`.
- Hex values are the CSS fallback. Supporting browsers use the OKLCH custom property from the theme stylesheet. The export's `oklch` field is parsed from that CSS. A generative document is rejected if it contains a raw color.
- `AgentOpsCockpit` and the generative cockpit document are sample data. Queue decisions stay in the browser. Metric numbers in the generated document are a snapshot. They do not recompute when a person approves a row.
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
| `pnpm demo:ui` | Build tokens and `@enregla-ui/duly-ui`, then start Storybook |
| `pnpm storybook` | Start Storybook only. Needs the token CSS and UI build already |
| `pnpm showcase` | Start the showcase Vite app. Needs the UI build already |
| `pnpm turbo run tokens build lint test` | Full pipeline: generate tokens → build packages → lint → test |
| `pnpm changeset` | Open the changeset wizard to version packages |

## Repository map

The root holds the public entry (this file), the workspace config, and `vercel.json` (Storybook static build for `apps/docs`). Lab notes are under `docs/lab/` so they are not the first thing a visitor opens.

| Path | Role |
|---|---|
| `apps/docs` | `@duly/docs`. Storybook: one component or story at a time, including the cockpit. This is the short UI demo (`pnpm demo:ui`). |
| `apps/showcase` | `@duly/showcase`. Vite app of composed screens (agentic, compliance, commercial, industrial) and the same cockpit at `#demo`. |
| `packages/tokens` | `@enregla-ui/duly-tokens`. OKLCH themes as CSS variables and a typed JS map. |
| `packages/ui` | `@enregla-ui/duly-ui`. React components, including `AgentOpsCockpit`, `DulySurface`, and `GenerativeUiView`. |
| `packages/catalog` | `@duly/catalog` (duly-catalog). Private. Zod schemas, generated JSON Schema in `catalog.json`, and `checkSurface`. |
| `packages/mcp` | `@duly/mcp` (duly-mcp). Private stdio server. The emit path is `list_components`, `get_component_schema`, `get_theme_tokens`, and `compose_surface`. |
| `packages/eslint-config`, `packages/tsconfig` | Shared lint and TypeScript config. |
| `examples/minimal-vite` | `@duly/example-minimal`. Smallest app that imports the packages. |
| `docs/guides` | Consumer guides for tokens and components. |
| `docs/lab` | Experiment log, loop state, north-star notes, vanguard notes, reference HTML. Not used by `pnpm demo`. |
| `docs/superpowers` | Dated design specs and plans. Historical. |
| `scripts/a11y-audit.mjs` | Optional axe pass over a built Storybook. Not part of `pnpm test`. |

`apps/docs` and `apps/showcase` both render Duly. Storybook is the component catalog and the 90-second cockpit. The showcase is a multi-page gallery of the same components. Root `vercel.json` builds Storybook with `--filter=@duly/docs...` because the Storybook app is named `@duly/docs`. The published libraries are `@enregla-ui/duly-tokens` and `@enregla-ui/duly-ui`. `apps/showcase/vercel.json` builds the Vite app. This repo does not add a new host or a demo domain.

| Name you may see in old notes | What to install or run |
|---|---|
| `@duly/tokens` | `@enregla-ui/duly-tokens` |
| `@duly/ui` | `@enregla-ui/duly-ui` |
| `@duly/docs` | Storybook app. Not published. |
| `@duly/catalog` | Private duly-catalog package. |
| `@duly/mcp` | Private duly-mcp server. |

### What moved

These files left the repository root so the public README is the entry point:

| From | To |
|---|---|
| `AGENTIC_EXPERIMENTS_LOG.md` | `docs/lab/AGENTIC_EXPERIMENTS_LOG.md` |
| `AGENTIC_LOOP_STATE.json` | `docs/lab/AGENTIC_LOOP_STATE.json` |
| `NORTH_STAR.md` | `docs/lab/NORTH_STAR.md` |
| `VANGUARD_REPORT.md` | `docs/lab/VANGUARD_REPORT.md` |
| `galer_a_de_agentes_ia.html` | `docs/lab/references/galer_a_de_agentes_ia.html` |
| `predios-quito-arquitectura.html` | `docs/lab/references/predios-quito-arquitectura.html` |

The HTML files are read-only inspiration. They are not apps. `AGENTIC_LOOP_STATE.json` still says `"status": "running"` from 2026-07-04. No script reads it.

## Guides

- [Consuming in your app](docs/guides/consuming-in-your-app.md) — plain-React and Tailwind v4 walkthroughs
- [Theming](docs/guides/theming.md) — semantic token reference and how to add a new theme
- [Docs index](docs/README.md) — guides, lab archive, and historical specs
- [packages/ui](packages/ui/README.md) — `@enregla-ui/duly-ui` component API
- [packages/tokens](packages/tokens/README.md) — `@enregla-ui/duly-tokens` CSS and JS API
- [apps/docs](apps/docs/README.md) — running the Storybook locally
- [CONTRIBUTING.md](CONTRIBUTING.md) — dev setup, release flow, token versioning policy

## Troubleshooting

**`tailwindcss` not found when building tokens in CI or a fresh clone**

The root `.npmrc` includes `public-hoist-pattern[]=tailwindcss` to hoist `tailwindcss` from `apps/docs/node_modules` to the workspace root so that `@tailwindcss/postcss` can resolve it when it processes `packages/tokens/dist/index.css` at Storybook build time. If you see a resolution error for `tailwindcss`, make sure you ran `pnpm install` from the workspace root (not from an individual package directory) so the hoist takes effect.
