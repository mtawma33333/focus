import { sql } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import {
  check,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { base } from "#src/schema/shared.ts";

export const lists = sqliteTable(
  "lists",
  {
    ...base,
    name: text().notNull(),
    parentId: integer({ mode: "number" }).references(
      (): AnySQLiteColumn => lists.id,
      { onDelete: "cascade" }
    ),
    isArchived: integer({ mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    check("name_length", sql`length(trim(${table.name})) between 1 and 100`),
    uniqueIndex("lists_parent_name_unique").on(
      sql`coalesce(${table.parentId}, 0)`,
      table.name
    ),
  ]
);

export type List = typeof lists.$inferSelect;
