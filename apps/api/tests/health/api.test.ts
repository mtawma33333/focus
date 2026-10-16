import { treaty } from "@elysia/eden";
import { describe, expect, it } from "vite-plus/test";

import { app } from "#src/app.ts";

const Api = treaty(app).api;

describe("Health Service | Unit", () => {
  it("should return ok if db is up", async () => {
    const { data } = await Api.health.get();
    expect(data).toBe("ok");
  });
});
