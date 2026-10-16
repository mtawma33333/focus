# AGENTS.md

Guidance for agents working in this monorepo.

## Project scope

This repo builds a **full-stack Web App**

Modules:

- `apps/web` — React frontend (`@focus/web`)
- `apps/api` — Elysia backend (`@focus/api`)
- `packages/db` — database (`@focus/db`)
- `packages/ui` — shadcn components and global CSS (`@focus/ui`)
- `packages/config` — shared tsconfig (`@focus/config`)
- `docs/`: contract, architecture

## Tech stack

- Language: TypeScript
- Frontend: React 19, TanStack Router, TanStack Query
- Backend: ElysiaJS
- DB: SQLite, Drizzle ORM v1
- UI: shadcn, base-ui, lucide icons, Tailwind CSS 4
- Toolchain: Vite+

## Coding expectations

- prefer explicit, readable code over clever code
- use descriptive names
- use early returns to keep control flow simple
- avoid dead code and generic boilerplate comments

## Toolchain

Vite+ (`vp`) is the only entry point, run bare from the repo root:

- `vp install` — install or refresh workspace dependencies
- `vp check` — format, lint, and type check
- `vp test` — run the test projects
- `vp run <script>` — run a `package.json` script
- `vp add` / `vp remove` / `vp update` — change dependencies

## Preferred workflow

1. always read the relevant docs first
2. inspect the existing implementation if need
3. make the smallest coherent change
4. if change db schema, run `vp run db:migrate`
5. run `vp run ready`
6. update docs
