# Rebrand: Studio DS → Duly

## Context

Product folder was named "Enterprise Design System" but the actual product already
lived as "Studio DS" (`@studio/*` packages, deployed Storybook, GitHub repo `studio-ds`,
Vercel project `studio-ds`). User found "Studio DS" itself too generic/forgettable for
an enterprise AI-agent-ops design system (audit/compliance positioning, benchmarked
against Temporal UI / LangSmith / n8n / IBM Carbon — see `NORTH_STAR.md`).

Naming brainstorm (5 rounds, npm + web collision-checked) landed on **Duly** — from
"duly noted / duly authorized / duly executed," the ritual adverb of contracts and
audit trails. Matches the product's core promise: every agent action, debidamente
registered, approved, and on record. Short, pronounceable in English and Spanish,
no collisions in npm scope or web search (aside from Duly Health & Care, unrelated
healthcare system in Chicago — different industry, accepted risk).

## Scope

**In scope:**
- Rename npm scope `@studio/*` → `@duly/*` across all packages
- Rename all "Studio DS" product-name strings → "Duly"
- Rename GitHub repo `studio-ds` → `duly`
- Rename Vercel project `studio-ds` → `duly`
- Deploy to `duly.auraby.design` via `/adeploy`
- Rename local folder `Enterprise Design System` → `duly` (last step)

**Out of scope:**
- Removing/redirecting old enregla.ec domains on this project (none currently attached — verify)
- Publishing packages to public npm registry
- Any visual/token redesign
- Retroactively renaming past commit history/messages

## Approach

1. **External renames first** (repo, Vercel project) — order matters so later git/vercel
   commands in this session target the right names without relying on redirects.
2. **Single rebrand commit** — mechanical find/replace across 36 files with `@studio` refs
   and 22 files with "Studio DS" text, regenerate lockfile, verify build/lint/test green.
3. **Deploy** via `/adeploy` (creates favicon if missing, pushes, attaches Aura domain).
4. **Folder rename last** — breaks current session's cwd, done as the final step with
   an explicit heads-up to the user to reopen the session in the new path.

## Verification

- `pnpm turbo run tokens build lint test` passes after the rename commit, before push.
- `grep -r "@studio" --include="*.json" --include="*.ts" --include="*.tsx"` (tracked files) returns nothing.
- `grep -r "Studio DS"` (tracked files) returns nothing.
- `curl -sI https://duly.auraby.design` returns `HTTP/2 200`.
- `gh repo view mdanilorojas/duly` succeeds.
