# Contributing to Studio DS

## Dev setup

**Requirements:** Node ≥ 20, pnpm 10.33.2.

```bash
git clone <repo-url>
cd "Enterprise Design System"
pnpm install
```

## Development pipeline

Run the full pipeline at any time:

```bash
pnpm turbo run tokens build lint test
```

What each step does:

| Step | Command | Description |
|---|---|---|
| `tokens` | `pnpm turbo run tokens` | Regenerate CSS and JS from `packages/tokens/src/themes.ts` |
| `build` | `pnpm turbo run build` | Build `@studio/ui` with tsup + compile Storybook |
| `lint` | `pnpm turbo run lint` | ESLint with zero warnings allowed |
| `test` | `pnpm turbo run test` | Vitest — 33 token tests + 18 UI tests |

Individual package tasks:

```bash
# Token generator only
pnpm --filter @studio/tokens tokens

# UI build only
pnpm --filter @studio/ui build

# Token tests (contrast gate, LOCKED parity, semantic coverage)
pnpm --filter @studio/tokens test

# UI tests (component rendering + axe accessibility)
pnpm --filter @studio/ui test

# Storybook
pnpm --filter @studio/docs storybook
```

## Release flow

Studio DS uses [Changesets](https://github.com/changesets/changesets) for versioning.

**1. Open a changeset** while your branch is open:

```bash
pnpm changeset
```

Select the affected packages, choose the bump type (`patch` / `minor` / `major`), and write a short description. Commit the generated `.changeset/*.md` file alongside your code changes.

**2. Version packages** (usually done by CI or a maintainer before publish):

```bash
pnpm version
```

This consumes all pending changeset files, bumps `package.json` versions, and updates `CHANGELOG.md` files.

**3. Publish:**

```bash
pnpm publish -r --filter "@studio/*" --access public
```

Both packages are scoped public (`"publishConfig": { "access": "public" }`).

## Token versioning policy

The array `SEMANTIC_KEYS` in `packages/tokens/src/contracts.ts` is the **public contract** of `@studio/tokens`. The `dist/tokens.lock.json` file records the current sorted key list and is committed alongside every token change.

| Change type | Required bump | Changeset required |
|---|---|---|
| Add a new token key | `minor` | Yes |
| Rename or remove a key | `major` | Yes |
| Change a token's value (color update) | `patch` | Yes |
| Add a new theme (new `data-theme` value) | `minor` | Yes |

Any pull request whose diff includes `dist/tokens.lock.json` **must** include a matching changeset entry. CI will fail if `tokens.lock.json` changed but no changeset was found.

### LOCKED tokens

The six status tokens (`ok`, `review`, `warn`, `block`, `info`) and the focus ring (`ring`) have **locked hues**. A client theme may only adjust the lightness (`L` in OKLCH). Rotating the hue of a LOCKED token is a breaking change that requires a `major` bump and a thorough accessibility review.
