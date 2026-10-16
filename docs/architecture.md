# Architecture

The repository is a layered monorepo: web UI, API, and database. Each workspace package owns one layer and exposes a narrow entrypoint, so the implementation reads through package boundaries rather than through large explanatory docs.

## Module map

### `apps/web` — React frontend (`@focus/web`)

In scope: routes, route-level data fetching, app-specific components, theme, and the API client.
Out of scope: business rules, persistence, and anything the API must own.

- `src/routes/`: file-based routes (TanStack Router). `src/routeTree.gen.ts` is generated.
- `src/components/`: components specific to this app. Shared primitives live in `packages/ui`.
- `src/lib/api.ts`: Eden Treaty client, typed by the API's exported `App` type.
- `src/lib/query-client.ts`: TanStack Query client with global error toasts.
- `src/router.tsx`: router construction; `src/main.tsx`: mount.

### `apps/api` — Elysia backend (`@focus/api`)

In scope: HTTP routing, request validation, and translation between HTTP and the database.
Out of scope: UI concerns and SQL schema definitions (owned by `packages/db`).

- `src/index.ts`: starts the server, handles shutdown, exports the `App` type.
- `src/api.ts`: feature routes register here.
- `src/app.ts`: builds the Elysia app; plugins (logger, CORS, OpenAPI)
- `src/context.ts`: the database connection.
- `src/env.ts`: environment variables with defaults.
- `src/<module>/`: one directory per feature; `health/` is the reference module.
- `tests/`: unit tests that call the app in-process.

### `packages/db` — database (`@focus/db`)

In scope: the SQLite connection factory, table definitions, relations, and migrations.
Out of scope: query logic and any HTTP concern.

- `src/index.ts`: `createDb(path)`, sets WAL, exports the `Database` type.
- `src/schema/`: one file per table with its constraints.
- `src/relations.ts`: `defineRelations`; update when a table is added or removed.
- `src/migrate.ts`: applies migrations; do not edit by hand.
- `src/migrations/`: generated SQL and snapshots
- `src/testing.ts`: `createTestDatabase()`, a migrated throwaway database.

### `packages/ui` — shadcn components and global CSS (`@focus/ui`)

In scope: shadcn/ui primitives (on Base UI) and the Tailwind theme.
Out of scope: app-specific composition; keep feature components in `apps/web`.

- `src/components/`: generated shadcn primitives. Treated as vendored; excluded from lint and fmt.
- `src/styles/globals.css`: Tailwind v4 theme and design tokens.
- `src/lib/utils.ts`: `cn` helper.

### `packages/config` — shared tsconfig (`@focus/config`)

- `typescript/base.json`, `node.json`, `react.json`: the tsconfig bases every package extends.

## Invariants

1. **The web app depends on the API for types only.** `@focus/api` is a devDependency of `apps/web`; the browser bundle never imports API code. The type flows from `export type App` in `apps/api/src/index.ts` into `treaty<App>`.
2. **Each API feature registers itself in `src/app.ts`.** A module exports an Elysia instance with a `prefix` and an OpenAPI `tags` entry; `app.ts` composes modules, it does not hold route logic.
3. **All SQLite access goes through `packages/db`.** Only `apps/api` calls `createDb`; no other package talks to the database.
4. **Schema changes are generated, never written.** Edit `src/schema/`, then run `vp run db:generate` and `vp run db:migrate`. Treat `src/migrations/` as read-only.
5. **Intra-package imports use `#src/*`.** Cross-package imports use the `@focus/*` package name, sorted into their own import group.
6. **Shared primitives live in `packages/ui`.** Add or update them there so every app sees the change.

## Data flow

```
browser (apps/web)
  └─ Eden Treaty client (src/lib/api.ts), typed by App
       └─ HTTP → Elysia app (apps/api)
            └─ route handler → Drizzle → packages/db → SQLite
```

- **Request path**: a route's TanStack Query against the Treaty client sends HTTP to the API; the module handler queries through Drizzle and returns data.
- **Type path**: the API is the single source of the request/response contract; the web client re-derives its types from `App` at build time.
- **Connection path**: the API builds one `db` in `src/context.ts` and shares it across handlers.

## Toolchain

Vite+ (`vp`) drives dev, build, test, lint, format, and type check. The repository-root `vite.config.ts` owns the shared fmt/lint/test configuration; per-app `vite.config.ts` files add frontend plugins only. Codegen outputs (`routeTree.gen.ts`, `packages/db/src/migrations/**`) and vendored shadcn components are excluded from lint and format.
