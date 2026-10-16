import { createDb } from "@focus/db";

import { env } from "#src/env.ts";

export const db = createDb(env.DATABASE_URL);
