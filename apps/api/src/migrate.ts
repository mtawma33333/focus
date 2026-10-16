import { createDb } from "@focus/db";
import { migrateDatabase } from "@focus/db/migrate";

import { env } from "#src/env.ts";

const db = createDb(env.DATABASE_URL);
migrateDatabase(db);
db.$client.close();
