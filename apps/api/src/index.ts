import { once } from "node:events";

import { app } from "#src/app.ts";
import { db } from "#src/context.ts";
import { env } from "#src/env.ts";

app.listen(env.PORT, ({ hostname, port }) => {
  console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
  console.log(
    `🚀 OpenAPI documentation available at http://${hostname}:${port}/openapi`
  );
});

await Promise.race([once(process, "SIGINT"), once(process, "SIGTERM")]);
await app.stop();
db.$client.close();

export type App = typeof app;
