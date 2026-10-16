import { Elysia } from "elysia";

import { healthRoutes } from "./health";

export const api = new Elysia({
  prefix: "/api",
}).use(healthRoutes);
