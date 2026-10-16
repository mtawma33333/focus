# Contract

What each layer must preserve. Implementation that satisfies the same contract may change freely.

# DB Schema

Tables are defined in `packages/db/src/schema/`; this section records the behavior the schema guarantees. Constraints named here are the ones a migration creates.

## Shared columns

`lists`, `tags`, and `todos` spread `base` from `src/schema/shared.ts`: `id` is an auto-incrementing integer primary key, and `createdAt` and `updatedAt` are milliseconds since the Unix epoch, not null, defaulting to now. Drizzle refreshes `updatedAt` on update.

## `todos`

| Column            | Type and contract                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `name`            | text, required                                                                                             |
| `description`     | text, optional                                                                                             |
| `status`          | text, required, default `Todo`; declared set: `Backlog`, `Todo`, `OnGoing`, `InReview`, `Done`, `Canceled` |
| `listId`          | integer, optional, references `lists.id`                                                                   |
| `dueAt`           | integer timestamp (ms), optional: the deadline                                                             |
| `scheduledAt`     | integer timestamp (ms), optional: the planned work window                                                  |
| `waitAt`          | integer timestamp (ms), optional: the todo stays hidden until this time                                    |
| `priority`        | numeric, optional, default `0`                                                                             |
| `estimateMinutes` | integer, optional                                                                                          |
| `recur`           | text holding JSON (an RRULE), optional                                                                     |
| `parent`          | integer, optional, references `todos.id`: the recurring todo that created this row                         |
| `doneAt`          | integer timestamp (ms), optional                                                                           |

`todo_tags` links todos to tags and `todo_depends` links todos to the todos they wait for. Both carry a composite primary key, both columns required, and no timestamps. Queries from a todo to its tags use the primary key prefix, while `todo_tags_tag_id_idx` indexes the tag-to-todos direction; `todo_depends` has no index on `dependsOnId`, so the `blocks` direction scans.

## `lists` and `tags`

| Column       | `lists`                                    | `tags`                                  |
| ------------ | ------------------------------------------ | --------------------------------------- |
| `name`       | text, required                             | text, required                          |
| `parentId`   | integer, optional, references `lists.id`   | integer, optional, references `tags.id` |
| `isArchived` | integer boolean, required, default `false` | absent                                  |

Each table nests through its own `parentId`, so both form a tree.

## Relations

`src/relations.ts` declares the graph Drizzle queries with:

- `lists`: `parent`, `children`, `todos`
- `tags`: `parent`, `children`, `todos` (through `todo_tags`)
- `todos`: `list`, `tags` (through `todo_tags`), `dependsOn` and `blocks` (both through `todo_depends`)
- `todo_tags`, `todo_depends`: `todo` and `tag` / `dependsOn` rows

## Invariants

### Guarantees by SQL

- `name_length` CHECK: `name` in `lists`, `tags`, and `todos` trims to 1–100 characters ().
- `description_length` CHECK: `todos.description` is NULL or trims to 1–1000 characters, so an empty or blank string fails.
- `priority_range` CHECK: `todos.priority` is NULL or between −10 and 10
- `estimateMinutes_range` CHECK: `todos.estimateMinutes` is NULL or greater than 0
- `doneAt_match_status` CHECK: `todos.doneAt` is set if and only if `status` is `Done`. Any other status, requires `doneAt` to be NULL.
- Foreign keys: enforced at runtime, so a row that names a missing parent is rejected and cascade rules run.
- Sibling uniqueness: `lists_parent_name_unique` and `tags_parent_name_unique` cover `(coalesce(parentId, 0), name)`, so names are unique among siblings and at the root.
- list deletion: delete a list will set null to the todo that reference the list.  
- Hierarchy deletion: `lists.parentId` and `tags.parentId` cascade, so deleting a row deletes its whole subtree.
- Join deletion: deleting a todo or a tag removes its `todo_tags` and `todo_depends` rows.

### Guarantees by application code

- **Status values**: `status` accepts any text. The six-value set exists only in the TypeScript union, so enforce it in the API.
- **Recurrence**: `recur` holds arbitrary JSON; RRULE shape, frequencies, and the `count`/`until` exclusion are unenforced.
- **Dependency acyclicity**: `todo_depends` accepts cycles and accepts a row depending on itself. Reject both before insert.
- **`isArchived` tree consistency**: archiving a list leaves its descendants and its todos untouched.
- **Context**: `domain.md` describes saved queries as a `Context` entity; no table holds them yet.

# API

Every module mounts under a route prefix and a single OpenAPI tag, and every route's type is part of `App`.

## Health

- `GET /api/health` → `200` with body `"ok"`. Runs `select 1` against the database, so it reports `ok` only when the connection is alive.

## Todos, Lists, Tags

Agreed contract, not implemented yet. ADR-0001 records why the shape is not row-scoped REST. Three modules — `src/todos/`, `src/lists/`, `src/tags/` — each one Elysia instance with its own OpenAPI tag, plus `src/errors.ts` for the error envelope.

No route addresses a single row by path parameter. One filter selects the rows for every read and every write.

| Route                     | Body                 | Response           |
| ------------------------- | -------------------- | ------------------ |
| `GET /api/todos`          | —                    | `{ todos, count }` |
| `POST /api/todos`         | write fields         | `201`, one todo    |
| `PATCH /api/todos`        | `{ filter, patch }`  | `{ count, todos }` |
| `DELETE /api/todos`       | `{ filter }`         | `{ count }`        |
| `PATCH /api/todos/status` | `{ filter, status }` | `{ count, todos }` |

`lists` and `tags` carry the same five routes. Their reads return `{ lists, count }` and `{ tags, count }`; their patches accept `name` and `parentId`, and the `lists` patch also accepts `isArchived`.

### Filter

One flat object. Every field present is AND-ed with the rest; there is no nesting.

| Field                                        | Matches                                    |
| -------------------------------------------- | ------------------------------------------ |
| `id`                                         | that row                                   |
| `ids`                                        | any of the listed rows                     |
| `status`, `listId`, `parentId`, `isArchived` | equality                                   |
| `tagIds`                                     | rows carrying **all** the listed tags      |
| `hasTags`                                    | whether the todo carries any tag           |
| `nameContains`                               | case-insensitive substring                 |
| `priorityMin` / `priorityMax`                | inclusive bounds on the numeric priority   |
| `estimateMin` / `estimateMax`                | inclusive bounds on `estimateMinutes`      |
| `dueBefore` / `dueAfter`                     | inclusive millisecond bounds on `dueAt`    |
| `scheduledBefore` / `scheduledAfter`         | inclusive bounds on `scheduledAt`          |
| `waitBefore` / `waitAfter`                   | inclusive bounds on `waitAt`               |

`todos` accepts every field above except `parentId` and `isArchived`; `lists` accepts `id`, `ids`, `parentId`, `isArchived`, `nameContains`; `tags` accepts `id`, `ids`, `parentId`, `nameContains`.

### Filter rules

- A read carries the filter as query parameters, a write as the `filter` key of the JSON body. One field table per entity generates both schemas, so the two sets of field names cannot drift.
- Array values are comma-separated in a query string: `?ids=1,2,3`.
- `{}` matches every row, including for `DELETE`. A body that omits the `filter` key is a `400`, so clearing a table takes a deliberate `{}`.
- A filter that matches nothing is not an error: a read returns an empty list with `count` `0`, and a write returns `count` `0`. Unknown ids are indistinguishable from ids that match nothing.
- Reads order by `createdAt` descending and do not paginate.
- `GET /api/lists` excludes `isArchived` lists unless `includeArchived=true`.
- `waitAt` in the future does not hide a todo; `domain.md` leaves that behavior to a later query layer.

### Writing

- `POST` bodies carry the write fields: `name` (required), `description`, `listId`, `dueAt`, `scheduledAt`, `waitAt`, `priority`, `estimateMinutes`, `tagIds`.
- `patch` carries the same fields, and every omitted field keeps its value while an explicit `null` clears it. `name` may never be `null`.
- `status` is not a write field. `PATCH /api/todos/status` takes it, and sets `doneAt` to the current time when the status becomes `Done` and to `NULL` otherwise, in the same statement — the `doneAt_match_status` CHECK requires the two to agree.
- `tagIds` replaces the whole tag set, and in a bulk patch it overwrites that of every matched row.
- A bulk write runs as one statement over every matched row. A violating row fails the whole statement, which surfaces as `400` or `409` rather than as a partial write.
- `createdAt`, `updatedAt`, `doneAt`, `recur`, and `parent` are never written by a client.

### Payloads

- Timestamps cross the wire as integer milliseconds since the Unix epoch, the same values the columns hold.
- Errors take one shape: `{ error: { code, message } }`. Codes are `VALIDATION` (`400`, a malformed body or parameter, an unpublished `status` value, or a reference to a missing row), `NAME_CONFLICT` (`409`, the sibling-unique index on `lists` and `tags`), and `INTERNAL` (`500`).
- The API has no `404`: no route is scoped to a single row, and a filter for a missing row matches nothing.

# External Behavior

- **OpenAPI**: served at `GET /openapi`; the document is generated from the app's types.
- **CORS**: enabled with permissive defaults.
- **Logging**: request logging via the pino-backed Elysia logger, at `LOG_LEVEL`.
- **Home page**: `/` renders the stack summary and an API status badge that reflects the `/api/health` result.

## Configuration

Read from the environment in `apps/api/src/env.ts`, with the defaults below. See `apps/api/.env.example`.

| Variable       | Default       | Purpose          |
| -------------- | ------------- | ---------------- |
| `NODE_ENV`     | `development` | Runtime mode     |
| `LOG_LEVEL`    | `info`        | Pino log level   |
| `DATABASE_URL` | `local.db`    | SQLite file path |
| `PORT`         | `3000`        | API listen port  |

## Testing contract

- **API unit tests** import `app` from `src/app.ts` and call it through `treaty(app)` in-process; no server or socket is started.
- **API tests that touch data** build the app with `createApp(db)` from `src/app.ts` and pass a database from `createTestDatabase()`, so they never reach the development database (ADR-0002).
- **Database tests** use `createTestDatabase()` from `@focus/db/testing`, which returns a migrated database and a `remove()` cleanup.
- **E2E tests** start a web dev server on port `3200` (`E2E_TEST_PORT`) via Playwright global setup and drive it in a browser.
