import { type AppEnv, statusOf } from "@acme/backend-kernel";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { RoutinesUseCases } from "../use-cases.js";

const RoutineSchema = z.object({
  name: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
});

const NOT_FOUND = { message: "Routine not found" };

/** Public routes. A routine of a different user gives 404, the same as a missing routine. */
export const createRoutinesRoutes = (uc: RoutinesUseCases) =>
  new Hono<AppEnv>()
    .get("/routines", async (c) => {
      const result = await uc.list(c.var.userId);
      return c.json({ routines: result.unwrapOrThrow() }, 200);
    })
    .post("/routines", zValidator("json", RoutineSchema), async (c) => {
      const result = await uc.create(c.var.userId, c.req.valid("json"));
      return c.json({ routine: result.unwrapOrThrow() }, 201);
    })
    .get("/routines/:id", async (c) => {
      const result = await uc.get(c.var.userId, c.req.param("id"));
      if (result.isFailure()) return c.json(NOT_FOUND, statusOf(result.error));
      return c.json({ routine: result.unwrapOrThrow() }, 200);
    })
    .put("/routines/:id", zValidator("json", RoutineSchema), async (c) => {
      const result = await uc.update(c.var.userId, c.req.param("id"), c.req.valid("json"));
      if (result.isFailure()) return c.json(NOT_FOUND, statusOf(result.error));
      return c.json({ routine: result.unwrapOrThrow() }, 200);
    })
    .delete("/routines/:id", async (c) => {
      const result = await uc.remove(c.var.userId, c.req.param("id"));
      if (result.isFailure()) return c.json(NOT_FOUND, statusOf(result.error));
      return c.json(result.unwrapOrThrow(), 200);
    })
    .post("/routines/:id/runs", async (c) => {
      const result = await uc.run(c.var.userId, c.req.param("id"));
      if (result.isFailure()) return c.json(NOT_FOUND, statusOf(result.error));
      return c.json({ run: result.unwrapOrThrow() }, 201);
    })
    .get("/routines/:id/runs", async (c) => {
      const result = await uc.listRuns(c.var.userId, c.req.param("id"));
      if (result.isFailure()) return c.json(NOT_FOUND, statusOf(result.error));
      return c.json({ runs: result.unwrapOrThrow() }, 200);
    });
