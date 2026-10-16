import { sql } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { db } from "#src/context.ts";

const ROUTE_PREFIX = "/health";

export const healthRoutes = new Elysia({
  tags: ["Health"],
  prefix: ROUTE_PREFIX,
}).get(
  "/",
  () => {
    db.run(sql`select 1`);
    return "ok";
  },
  {
    response: t.String(),
  }
);
