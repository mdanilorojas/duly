# Rebrand Studio DS → Duly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the product from "Studio DS" (`@studio/*` npm scope) to "Duly" (`@duly/*`), rename the GitHub repo and Vercel project to match, deploy to `duly.auraby.design`, then rename the local folder.

**Architecture:** Pure rename — no code logic changes. Order is: external renames (repo, Vercel project) → single content-rewrite commit across code/config/living-docs → build/lint/test gate → push/deploy → local folder rename last (it breaks the session's cwd).

**Tech Stack:** pnpm workspaces + Turborepo monorepo, gh CLI, Vercel CLI/API, git.

## Global Constraints

- npm scope: `@studio/*` → `@duly/*` (verbatim, no partial renames)
- Product name string: `Studio DS` → `Duly` (verbatim)
- Repo: `mdanilorojas/studio-ds` → `mdanilorojas/duly`
- Vercel project: `studio-ds` → `duly` (same projectId `prj_HfdJkdYgc4jzEpTDsCeDzGDXs7c9`, same org `team_Bs3FOlMbegWXzktk6b6tjWlI` — rename only, never recreate)
- Domain target: `duly.auraby.design`
- **Historical documents are NOT rewritten.** Dated files that record what was true at the time they were written keep their original "Studio DS" / `@studio` text: `AGENTIC_EXPERIMENTS_LOG.md`, `VANGUARD_REPORT.md`, `.changeset/initial-foundation.md`, and every file under `docs/superpowers/plans/` and `docs/superpowers/specs/` dated before 2026-07-08. This deviates from the spec's blanket "22 files" / "36 files" counts — those counts included historical docs; this plan renames only current/living documentation and functional code/config (verified list in Task 3).
- Verification gate (`pnpm turbo run tokens build lint test`) must be green before any push.

---

### Task 1: Rename GitHub repo and update local remote

**Files:** none (external state + git config only)

**Interfaces:**
- Consumes: existing repo `mdanilorojas/studio-ds`, existing local remote `origin` pointing at it
- Produces: repo `mdanilorojas/duly`, local `origin` pointing at the new URL — Task 5 (`/adeploy`) pushes to this remote

- [ ] **Step 1: Rename the GitHub repo**

Run: `gh repo rename duly --repo mdanilorojas/studio-ds`
Expected output: `✓ Renamed repository mdanilorojas/studio-ds to mdanilorojas/duly`

- [ ] **Step 2: Point local origin at the new URL (don't rely on GitHub's redirect)**

Run: `git remote set-url origin https://github.com/mdanilorojas/duly.git`
Verify: `git remote -v` shows `origin  https://github.com/mdanilorojas/duly.git (fetch)` and `(push)`

- [ ] **Step 3: Confirm the rename**

Run: `gh repo view mdanilorojas/duly --json name,url`
Expected: `{"name":"duly","url":"https://github.com/mdanilorojas/duly"}`

---

### Task 2: Rename the Vercel project

**Files:** `.vercel/project.json` (Modify)

**Interfaces:**
- Consumes: existing Vercel project `studio-ds`, `projectId: prj_HfdJkdYgc4jzEpTDsCeDzGDXs7c9`, `orgId: team_Bs3FOlMbegWXzktk6b6tjWlI` (read from current `.vercel/project.json`)
- Produces: Vercel project named `duly` with the same projectId/orgId — Task 5 (`/adeploy`) links and deploys to this project

- [ ] **Step 1: Rename via Vercel CLI**

Run: `vercel project rename studio-ds duly --scope mariodanilorojas-5638s-projects`
Expected output includes: `Success! Project name changed to duly`

- [ ] **Step 2: Update local project link file**

Read current content of `.vercel/project.json`:
```json
{"projectId":"prj_HfdJkdYgc4jzEpTDsCeDzGDXs7c9","orgId":"team_Bs3FOlMbegWXzktk6b6tjWlI","projectName":"studio-ds"}
```
Change `"projectName":"studio-ds"` to `"projectName":"duly"`. `projectId` and `orgId` stay identical — do not touch them.

- [ ] **Step 3: Confirm the rename**

Run: `vercel project ls --scope mariodanilorojas-5638s-projects | grep duly`
Expected: a row showing project `duly`

---

### Task 3: Rebrand commit — code, config, and living docs

**Files (rename `@studio` → `@duly` and/or `Studio DS` → `Duly`):**
- Modify: `package.json` (root) — `"name": "studio-ds"` → `"name": "duly"`
- Modify: `vercel.json` — `--filter=@studio/docs...` → `--filter=@duly/docs...`
- Modify: `packages/tokens/package.json` — `"name": "@studio/tokens"` → `"name": "@duly/tokens"`; deps `"@studio/tsconfig"` → `"@duly/tsconfig"`, `"@studio/eslint-config"` → `"@duly/eslint-config"`
- Modify: `packages/ui/package.json` — `"name": "@studio/ui"` → `"name": "@duly/ui"`; deps `@studio/eslint-config`, `@studio/tokens`, `@studio/tsconfig` → `@duly/*`
- Modify: `packages/eslint-config/package.json` — `"name": "@studio/eslint-config"` → `"name": "@duly/eslint-config"`
- Modify: `packages/tsconfig/package.json` — `"name": "@studio/tsconfig"` → `"name": "@duly/tsconfig"`
- Modify: `packages/tokens/build.ts`, `packages/tokens/eslint.config.js`, `packages/tokens/tsconfig.json` — internal `@studio/*` refs → `@duly/*`
- Modify: `packages/ui/eslint.config.js`, `packages/ui/tsconfig.json`, `packages/ui/src/reset.css`, `packages/ui/src/styles.css` — internal `@studio/*` refs → `@duly/*`
- Modify: `packages/tokens/README.md`, `packages/ui/README.md`, `packages/ui/src/trace-log/README.md` — `@studio` refs → `@duly`
- Modify: `apps/docs/package.json` — `"name": "@studio/docs"` → `"name": "@duly/docs"`; deps `@studio/ui`, `@studio/tokens` → `@duly/*`
- Modify: `apps/docs/README.md` — `@studio` and `Studio DS` refs → `@duly` / `Duly`
- Modify: `apps/docs/.storybook/app.css` — `@studio` import refs → `@duly`
- Modify: `examples/minimal-vite/package.json` — `"name": "@studio/example-minimal"` → `"name": "@duly/example-minimal"`; deps `@studio/ui`, `@studio/tokens` → `@duly/*`
- Modify: `examples/minimal-vite/src/App.tsx`, `examples/minimal-vite/src/main.tsx`, `examples/minimal-vite/index.html` — `@studio` and `Studio DS` refs → `@duly` / `Duly`
- Modify: `README.md`, `NORTH_STAR.md`, `CONTRIBUTING.md` — `@studio` and `Studio DS` refs → `@duly` / `Duly`
- Modify: `docs/guides/consuming-in-your-app.md`, `docs/guides/theming.md` — `@studio` refs → `@duly`
- Modify: `.design-sync/NOTES.md`, `.design-sync/config.json`, `.design-sync/conventions.md` — `@studio` refs → `@duly`
- Regenerate: `pnpm-lock.yaml` (via `pnpm install`, not hand-edited)

**Interfaces:**
- Consumes: nothing from Task 1/2 (pure text content)
- Produces: a workspace where every package resolves under `@duly/*` — Task 4's build/lint/test gate is what proves this

- [ ] **Step 1: Verify current match count matches this task's file list**

Run:
```bash
git grep -l "@studio" -- ':!pnpm-lock.yaml' ':!AGENTIC_EXPERIMENTS_LOG.md' ':!VANGUARD_REPORT.md' ':!.changeset/initial-foundation.md' ':!docs/superpowers/plans/*' ':!docs/superpowers/specs/*'
```
Expected: exactly the 21 files listed above under "Modify" (excluding `pnpm-lock.yaml`, which is regenerated, not grepped by hand).

- [ ] **Step 2: Apply the scope rename across those files**

Run (PowerShell, from repo root):
```powershell
$files = git grep -l "@studio" -- ':!pnpm-lock.yaml' ':!AGENTIC_EXPERIMENTS_LOG.md' ':!VANGUARD_REPORT.md' ':!.changeset/initial-foundation.md' ':!docs/superpowers/plans/*' ':!docs/superpowers/specs/*'
foreach ($f in $files) {
  (Get-Content $f -Raw) -replace '@studio/', '@duly/' | Set-Content $f -NoNewline
}
```

- [ ] **Step 3: Apply the product-name rename across the same non-historical file set**

Run:
```powershell
$files = git grep -l "Studio DS" -- ':!AGENTIC_EXPERIMENTS_LOG.md' ':!VANGUARD_REPORT.md' ':!.changeset/initial-foundation.md' ':!docs/superpowers/plans/*' ':!docs/superpowers/specs/*'
foreach ($f in $files) {
  (Get-Content $f -Raw) -replace 'Studio DS', 'Duly' | Set-Content $f -NoNewline
}
```

- [ ] **Step 4: Fix the root package name (not covered by the `@studio/` substring rule)**

Edit `package.json`: change `"name": "studio-ds"` to `"name": "duly"`.

- [ ] **Step 5: Regenerate the lockfile**

Run: `pnpm install`
Expected: exits 0, `pnpm-lock.yaml` diff shows `@studio/*` entries replaced by `@duly/*`.

- [ ] **Step 6: Verify no live `@studio` or `Studio DS` references remain outside the historical exclusion list**

Run:
```bash
git grep "@studio" -- ':!AGENTIC_EXPERIMENTS_LOG.md' ':!VANGUARD_REPORT.md' ':!.changeset/initial-foundation.md' ':!docs/superpowers/plans/*' ':!docs/superpowers/specs/*'
git grep "Studio DS" -- ':!AGENTIC_EXPERIMENTS_LOG.md' ':!VANGUARD_REPORT.md' ':!.changeset/initial-foundation.md' ':!docs/superpowers/plans/*' ':!docs/superpowers/specs/*'
```
Expected: both commands print nothing and exit 1 (no matches).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "rebrand: Studio DS -> Duly, @studio/* -> @duly/* scope"
```

---

### Task 4: Verification gate

**Files:** none (CI-equivalent local check)

**Interfaces:**
- Consumes: the renamed workspace from Task 3
- Produces: a green build/lint/test result — Task 5 only pushes if this passes

- [ ] **Step 1: Run the full pipeline**

Run: `pnpm turbo run tokens build lint test`
Expected: exit code 0, no `@studio` resolution errors, all packages build/lint/test green.

- [ ] **Step 2: If it fails, stop and fix before proceeding**

Do not push or deploy on a red gate. Common failure mode: a workspace `dependency` field in some `package.json` still says `@studio/x` — re-run the Step 6 grep from Task 3 to find it.

---

### Task 5: Deploy to duly.auraby.design

**Files:** none (deploy orchestration — this is the `/adeploy` skill, already documented at `C:\Users\Danilo\.claude\skills\adeploy\SKILL.md`)

**Interfaces:**
- Consumes: renamed+verified repo/workspace from Tasks 1–4, renamed Vercel project from Task 2
- Produces: live deployment at `https://duly.auraby.design`

- [ ] **Step 1: Confirm a contextual favicon exists**

Run: `ls apps/docs/.storybook/public/favicon.svg`
Expected: file exists (already present — verified during planning). If missing, create one before proceeding per the adeploy skill's mandatory favicon rule.

- [ ] **Step 2: Run the three adeploy steps**

```bash
VDEPLOY_DOMAIN=auraby.design bash /c/dev/tools/deploy-enregla-project.sh "/c/dev/Enterprise Design System" duly "Duly — design system Storybook"
cd "/c/dev/Enterprise Design System"
vercel link --yes --project duly --scope mariodanilorojas-5638s-projects
vercel domains add duly.auraby.design --scope mariodanilorojas-5638s-projects || echo "  (dominio ya asignado)"
```

- [ ] **Step 3: Verify the deployment is live**

Run: `curl -sI https://duly.auraby.design | head -1`
Expected: `HTTP/2 200` (may take a few minutes to propagate on first deploy)

---

### Task 6: Rename the local folder (last — breaks this session's cwd)

**Files:** none (filesystem move)

**Interfaces:**
- Consumes: nothing — this is purely cosmetic once Tasks 1–5 are done and verified
- Produces: `C:\dev\duly` as the new project path

- [ ] **Step 1: Tell the user before moving**

State explicitly: cwd is about to become invalid; they'll need to reopen the session/terminal at the new path.

- [ ] **Step 2: Rename the folder**

Run (PowerShell, from a parent directory, not from inside the folder being renamed):
```powershell
Rename-Item -Path "C:\dev\Enterprise Design System" -NewName "duly"
```

- [ ] **Step 3: Verify**

Run: `Test-Path "C:\dev\duly\package.json"`
Expected: `True`
