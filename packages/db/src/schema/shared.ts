import { sql } from "drizzle-orm";
import { integer } from "drizzle-orm/sqlite-core";

export const base = {
  id: integer().primaryKey({ autoIncrement: true }),
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsec') * 1000 as integer))`)
    .$onUpdateFn(() => sql`(cast(unixepoch('subsec') * 1000 as integer))`),
};
