import { type AppEnv, statusOf } from "@acme/backend-kernel";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { TodosUseCases } from "../use-cases.js";

const CreateTodoSchema = z.object({
  title: z.string().min(1),
  completed: z.boolean().optional().default(false),
});

const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

const NOT_FOUND = { message: "Todo not found" };

/** Public routes. A todo of a different user gives 404, the same as a missing todo. */
export const createTodosRoutes = (uc: TodosUseCases) =>
  new Hono<AppEnv>()
    .get("/todos", async (c) => {
      const result = await uc.list(c.var.userId);
      return c.json({ todos: result.unwrapOrThrow() }, 200);
    })
    .post("/todos", zValidator("json", CreateTodoSchema), async (c) => {
      const result = await uc.create(c.var.userId, c.req.valid("json"));
      return c.json({ todo: result.unwrapOrThrow() }, 201);
    })
    .get("/todos/:id", async (c) => {
      const result = await uc.get(c.var.userId, c.req.param("id"));
      if (result.isFailure()) return c.json(NOT_FOUND, statusOf(result.error));
      const todo = result.unwrapOrThrow();
      return c.json({ todo }, 200);
    })
    .put("/todos/:id", zValidator("json", UpdateTodoSchema), async (c) => {
      const result = await uc.update(c.var.userId, c.req.param("id"), c.req.valid("json"));
      if (result.isFailure()) return c.json(NOT_FOUND, statusOf(result.error));
      const todo = result.unwrapOrThrow();
      return c.json({ todo }, 200);
    })
    .delete("/todos/:id", async (c) => {
      const result = await uc.remove(c.var.userId, c.req.param("id"));
      if (result.isFailure()) return c.json(NOT_FOUND, statusOf(result.error));
      const removed = result.unwrapOrThrow();
      return c.json(removed, 200);
    });
