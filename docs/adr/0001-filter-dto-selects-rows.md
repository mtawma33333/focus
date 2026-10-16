# A filter DTO selects rows; no route carries an `:id`

Rows are selected by a flat `filter` object on every read and every write (`GET /api/todos?status=Todo`, `PATCH /api/todos { filter, patch }`, `DELETE /api/todos { filter }`), so no route addresses a single row by path parameter. `domain.md` already models the operations that way — `query(filter, group, sort)`, `update(filter, data)`, `delete(filter)` — and one selection mechanism keeps a single-row edit and a bulk action (`clear every overdue todo`) on the same code path, which the web client reaches by building a filter per rendered control.

## Considered options

- **Row-scoped REST (`GET|PATCH|DELETE /todos/:id`) beside bulk routes.** More familiar and more cacheable, rejected because it maintains two ways to select rows whose field semantics must stay identical, and `domain.md` defines only the filter form.

## Consequences

- `{}` matches every row, including for `DELETE`, which follows `domain.md`; a body that omits the `filter` key is a `400` so that case takes a deliberate `{}`. A front-end typo or a script can still clear a table with one request.
- A filter for a row that does not exist matches nothing, so the API has no `404` and the error codes are `VALIDATION`, `NAME_CONFLICT`, and `INTERNAL`.
- `tagIds` AND-s like every other field, and in a bulk patch it overwrites the whole tag set of each matched row.
- A read carries the filter as query parameters and a write as a body key, so one field table per entity generates both schemas to keep the field names from drifting.