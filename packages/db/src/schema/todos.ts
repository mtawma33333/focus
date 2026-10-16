import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  numeric,
  check,
} from "drizzle-orm/sqlite-core";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

import { lists } from "#src/schema/lists.ts";
import { base } from "#src/schema/shared.ts";
import { tags } from "#src/schema/tags.ts";

export const todos = sqliteTable(
  "todos",
  {
    ...base,
    name: text().notNull(),
    description: text(),
    status: text({
      enum: ["Backlog", "Todo", "OnGoing", "InReview", "Done", "Canceled"],
    })
      .notNull()
      .default("Todo"),
    listId: integer({ mode: "number" }).references(() => lists.id, { onDelete: "set null" }),
    dueAt: integer({ mode: "timestamp_ms" }),
    scheduledAt: integer({ mode: "timestamp_ms" }),
    waitAt: integer({ mode: "timestamp_ms" }),
    priority: numeric({ mode: "number" }).default(0),
    estimateMinutes: integer({ mode: "number" }),
    recur: text({ mode: "json" }),
    parent: integer({ mode: "number" }).references(
      (): AnySQLiteColumn => todos.id,
      { onDelete: "set null" }
    ),
    doneAt: integer({ mode: "timestamp_ms" }),
  },
  (table) => [
    check("name_length", sql`length(trim(${table.name})) between 1 and 100`),
    check(
      "description_length",
      sql`length(trim(${table.description})) between 1 and 1000`
    ),
    check("priority_range", sql`${table.priority} between -10 and 10`),
    check("estimateMinutes_range", sql`${table.estimateMinutes} > 0`),
    check(
      "doneAt_match_status",
      sql`(${table.doneAt} is NOT NULL) = (${table.status} = 'Done')`
    ),
  ]
);

export const todoTags = sqliteTable(
  "todo_tags",
  {
    todoId: integer({ mode: "number" })
      .notNull()
      .references(() => todos.id, { onDelete: "cascade" }),
    tagId: integer({ mode: "number" })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.todoId, table.tagId] }),
    index("todo_tags_tag_id_idx").on(table.tagId),
  ]
);

export const todoDepends = sqliteTable(
  "todo_depends",
  {
    todoId: integer({ mode: "number" })
      .notNull()
      .references(() => todos.id, { onDelete: "cascade" }),
    dependsOnId: integer({ mode: "number" })
      .notNull()
      .references(() => todos.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.todoId, table.dependsOnId] })]
);

export type Todo = typeof todos.$inferSelect;
export type TodoTag = typeof todoTags.$inferSelect;
export type TodoDepend = typeof todoDepends.$inferSelect;
