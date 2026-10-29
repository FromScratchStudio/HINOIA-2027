# Deployment to GitHub Pages (`HINOIA/Studio`)

## Architecture

- **Source of truth:** `FromScratchStudio/HINOIA-2027` (application code, data, dependencies, tests).
- **Publication target:** `HINOIA/Studio` on branch `main`.
- **Public URL:** `https://hinoia.github.io/Studio/`.
- **Build model:** Next.js static export (`output: "export"`), published from `out/` only.

Pipeline: source commit on `main` → GitHub Actions build/test/export → publish `out/` to `HINOIA/Studio`.

## Local verification commands

```bash
npm ci
npm run lint
npm run test
npm run build
test -f out/index.html
```

Optional local preview:

```bash
npx serve out
```

## Workflow

File: `.github/workflows/deploy-hinoia-pages.yml`

Triggers:
- `push` on `main`
- `workflow_dispatch` (manual run)

Main steps:
1. Checkout source repository.
2. Setup Node.js 20 and install dependencies with `npm ci`.
3. Run `npm run lint` and `npm run test`.
4. Build static site with `NEXT_PUBLIC_BASE_PATH=/Studio npm run build`.
5. Validate generated output (`out/index.html`, `out/404.html`, `out/_next`).
6. Publish **only** `out/` to `HINOIA/Studio:main`.

Concurrency protection is enabled to avoid concurrent deployments overwriting newer publications.

## Secret and minimum permissions

Required secret in `FromScratchStudio/HINOIA-2027`:
- `HINOIA_DEPLOY_TOKEN`

Create a **fine-grained PAT** (manual, organization admin/owner action may be required):
1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**.
2. Resource owner: `HINOIA`.
3. Repository access: **Only select repositories** → `Studio`.
4. Repository permissions (minimum for this workflow): **Contents: Read and write**.
5. Generate token and copy it once.

Store it in source repository secrets:
1. `FromScratchStudio/HINOIA-2027` → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret**.
3. Name: `HINOIA_DEPLOY_TOKEN`.
4. Paste token value and save.

Never print or commit the token value.

## Required destination repository setup (`HINOIA/Studio`)

Manual setup by owner/admin of `HINOIA`:
1. Ensure repository exists and is intended to host generated static files only.
2. Ensure organization policies allow GitHub Pages and PAT-based pushes.
3. In `Studio` → **Settings** → **Pages**:
   - **Build and deployment**: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/(root)`
4. Ensure repository visibility/policy allows public Pages hosting for `https://hinoia.github.io/Studio/`.

## Safety behavior for pre-existing content

The publication step is intentionally guarded:
- If the target repository contains tracked files **without** `.hinoia-pages-source`, deployment fails with a clear error.
- This prevents silently overwriting unknown/manual content.

Before first activation, inspect existing files in `HINOIA/Studio` and decide:
- keep and migrate them into source-controlled generation, or
- archive/remove them, then allow this workflow to manage publication output.

## Static export limits (Next.js)

This deployment mode does not support server-required features (for example: dynamic request-time SSR, API endpoints requiring runtime server logic, Server Actions, request-dependent Route Handlers, runtime cookies/headers/rewrites).

If such features are introduced later, switch to a server-capable deployment target instead of GitHub Pages static export.

## Diagnostics

If deployment fails:
1. Check Actions logs in `FromScratchStudio/HINOIA-2027`.
2. Validate secret presence and token scope (`HINOIA_DEPLOY_TOKEN`).
3. Confirm target repo write access and organization policy permissions.
4. Confirm static output exists (`out/index.html`) in the build job.
5. Check safety-stop message for unmanaged pre-existing files in target repo.

## First publication procedure

1. Merge workflow/config changes to `main` in `FromScratchStudio/HINOIA-2027`.
2. Create and store `HINOIA_DEPLOY_TOKEN`.
3. Verify destination repo content and Pages settings.
4. Run workflow manually (`workflow_dispatch`) for the first publication.
5. Verify `https://hinoia.github.io/Studio/` after workflow success.

## Rollback procedure

Use one of these methods:

1. **From source repository (recommended):** re-run deployment from a known-good commit on `main` (or temporarily revert to that commit and redeploy).
2. **From publication repository:** in `HINOIA/Studio`, revert the last deployment commit on `main`.

Because publication artifacts are fully generated from source, a clean rebuild from a known-good source commit is the canonical recovery path.
