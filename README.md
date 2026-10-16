# focus

| Layer     | Choice                                                    |
| --------- | --------------------------------------------------------- |
| Frontend  | React 19, TanStack Router, TanStack Query, Tailwind CSS 4 |
| Backend   | ElysiaJS                                                  |
| Database  | SQLite via `node:sqlite`, Drizzle ORM v1 in `packages/db` |
| UI        | shadcn/ui on Base UI, in `packages/ui`                    |
| Toolchain | Vite+ (`vp`): dev, build, test, lint, format, type check  |

## Getting started

```sh
vp run ready
vp run dev
```

Frontend: http://localhost:5173
API docs: http://localhost:3000/openapi

The first `vp run test:e2e` needs a browser: `cd apps/web && bunx playwright install chromium`.

## Database

Edit table in `packages/db/src/schema/`, then:

```sh
vp run db:generate
vp run db:migrate
```
