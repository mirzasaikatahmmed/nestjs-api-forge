# memory.md

## Project concept
`nestjs-api-forge` — npm library for NestJS: standardized API response envelope, exception filters, pipes, health module.

## Tech stack and architecture
TypeScript (CommonJS, ES2020), NestJS peer deps (9–11). Source in `src/` (decorators, dto, exceptions, filters, health, interceptors, interfaces, pipes, utils). `app/` is a demo app, excluded from the build. Output `dist/` is the only published folder.

## Current state
- v1.0.8 prepared on branch `ci/provenance-tag-release` (not committed yet): tag-triggered release workflow with provenance, `exports`/`engines`/`publishConfig`, `lint:check`/`typecheck`/`clean` scripts.
- No tests yet (Jest suggested as next step).

## Key decisions
- Publish only on `v*` tag push; workflow checks tag == package.json version. Reason: avoid accidental publishes on every `main` push.
- `--provenance` needs `id-token: write` and runs in GitHub Actions only; local publish should not use it.

## Conventions and gotchas
- `package.json` and `package-lock.json` use CRLF line endings; keep them (otherwise diffs explode).
- `npm run lint` auto-fixes; use `lint:check` in CI.
- Repo secret `NPM_TOKEN` required for publishing.

## Setup and run
`npm ci`, `npm run build`, `npm run lint:check`, `npm run typecheck`. Release steps: see CONTRIBUTING.md.

## Last updated
2026-10-03 — release workflow and package.json improvements, version bump to 1.0.8.
