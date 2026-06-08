# AGENTS.md

## Quick commands

- Install: `pnpm install` (pnpm only — pnpm-lock.yaml)
- Dev: `pnpm dev` (<http://localhost:5173>)
- LAN dev: `pnpm dev:host`
- Lint: `pnpm lint` (flat ESLint config)
- Typecheck + build: `pnpm build` (runs `tsc -b && vite build`)
- Test: `pnpm test` (vitest — **no test files exist yet**)
- Deploy: `pnpm deploy` (builds, pushes `dist/` to `gh-pages` branch)

## Architecture

- **Offline-first PWA**, React 19 + TypeScript, no backend - all data in IndexedDB via Dexie.js.
- **No router**. Page state is plain React state (`rootPage`/`utilityPage` in `src/app/App.tsx`).
- **All deps are `latest`** in package.json. Beware of breaking changes on install.
- Path alias `@` -> `./src` (tsconfig.app.json + vite.config.ts).

## Data

- IndexedDB: database name `simple-weight-tracker`, schema version 2.
- Tables: `weightEntries` (indexed by `id`, `date`, `createdAt`, `updatedAt`), `weightPlans` (indexed by `id`, `updatedAt`).
- **One entry per date** — upsert on `date` field.
- `WeightPlan` is a **singleton** with `id = "default"`.
- Note field max length: **1000 characters** (validated in Dexie hooks).
- App preferences stored in `localStorage` under key `swt.pref.app`.

## Import/Export

- JSON backup schema version **3**.
- **Import is destructive**: clears all existing data before bulk-inserting. A confirmation dialog warns the user.
- Validation on import: checks app name, schema version, entries array, plan validity.

## Domain

- kg-only (lb unit removed).
- BMR: Mifflin-St Jeor equation. Activity multipliers: 1.2–1.55 (conservative).
- Milestones: auto-generated at 5kg intervals + BMI thresholds (35, 30, 25).

## PWA

- Base path `/simple-weight-tracker/` (for GitHub Pages).
- Service worker via `vite-plugin-pwa`, `registerType: "autoUpdate"`.
- PWA icons in `public/icons/`.

## Styling

- Plain CSS, no framework. All styles are global files in `src/styles/`.
- CSS variables defined in `src/styles/base.css`.

## Repo notes

- `notes/` directory is fully gitignored (design docs, TODOs are not tracked).
- No CI — deployment is manual.
- Git remotes: `origin/main`, `origin/feature/dashboard`, `origin/gh-pages`.
