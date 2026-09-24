import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";

const CreateTodoSchema = z.object({
  title: z.string().min(1),
  completed: z.boolean().optional().default(false),
});

const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

// Public API for other backend modules. They import these; they never touch the todos DB.
export const createTodo = (title: string) => prisma.todo.create({ data: { title } });
export const findTodos = (ids: string[]) => prisma.todo.findMany({ where: { id: { in: ids } } });
export const deleteTodos = (ids: string[]) => prisma.todo.deleteMany({ where: { id: { in: ids } } });

export const todosRoutes = new Hono() //
  .get("/todos", async (c) => {
    const todos = await prisma.todo.findMany();
    if (!todos) throw new HTTPException(500, { message: "Internal server error" });
    return c.json({ todos }, 200);
  })
  .post("/todos", zValidator("json", CreateTodoSchema), async (c) => {
    const data = c.req.valid("json");
    const todo = await prisma.todo.create({ data });
    if (!todo) throw new HTTPException(500, { message: "Internal server error" });
    return c.json({ todo }, 201);
  })
  .get("/todos/:id", async (c) => {
    const id = c.req.param("id");
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new HTTPException(500, { message: "Internal server error" });
    return c.json({ todo }, 200);
  })
  .put("/todos/:id", zValidator("json", UpdateTodoSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const todo = await prisma.todo.update({ where: { id }, data });
    if (!todo) throw new HTTPException(500, { message: "Internal server error" });
    return c.json({ todo }, 200);
  })
  .delete("/todos/:id", async (c) => {
    const id = c.req.param("id");
    const todo = await prisma.todo.delete({ where: { id } });
    if (!todo) throw new HTTPException(500, { message: "Internal server error" });
    return c.json({ todo }, 200);
  });

export type TodosApp = typeof todosRoutes;
