import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysia/cors";
import { openapi, fromTypes } from "@elysia/openapi";
import { Elysia } from "elysia";

import { env } from "#src/env.ts";

import packageJson from "../package.json";
import { api } from "./api";

export const app = new Elysia()
  .use(
    logger({
      level: env.LOG_LEVEL,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    })
  )
  .use(cors())
  .use(
    openapi({
      documentation: {
        info: {
          title: "Elysia API",
          version: packageJson.version,
          description: "A Elysia OpenAPI documentation",
        },
      },
      references: fromTypes(),
    })
  )
  .use(api);
