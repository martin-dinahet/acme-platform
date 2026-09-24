import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { todosAdapter } from "./lib/todos-adapter.js";
import type { TodoRef, TodosPort } from "./lib/todos-port.js";

const RoutineSchema = z.object({
  name: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
});

const withSteps = { steps: { orderBy: { position: "asc" } } } as const;

const toStepRows = (steps: string[]) => steps.map((title, position) => ({ title, position }));

const findRoutine = async (id: string) => {
  const routine = await prisma.routine.findUnique({ where: { id }, include: withSteps });
  if (!routine) throw new HTTPException(404, { message: "Routine not found" });
  return routine;
};

/** Todos come from the port, so a test can pass a fake instead of the todos module. */
export const createRoutinesRoutes = (todos: TodosPort) =>
  new Hono()
    .get("/routines", async (c) => {
      const routines = await prisma.routine.findMany({ include: withSteps, orderBy: { createdAt: "asc" } });
      return c.json({ routines }, 200);
    })
    .post("/routines", zValidator("json", RoutineSchema), async (c) => {
      const { name, steps } = c.req.valid("json");
      const routine = await prisma.routine.create({
        data: { name, steps: { create: toStepRows(steps) } },
        include: withSteps,
      });
      return c.json({ routine }, 201);
    })
    .get("/routines/:id", async (c) => {
      return c.json({ routine: await findRoutine(c.req.param("id")) }, 200);
    })
    .put("/routines/:id", zValidator("json", RoutineSchema), async (c) => {
      const id = c.req.param("id");
      const { name, steps } = c.req.valid("json");
      await findRoutine(id);
      const routine = await prisma.routine.update({
        where: { id },
        data: { name, steps: { deleteMany: {}, create: toStepRows(steps) } },
        include: withSteps,
      });
      return c.json({ routine }, 200);
    })
    .delete("/routines/:id", async (c) => {
      const id = c.req.param("id");
      await findRoutine(id);
      // Runs are deleted too. Their todos stay: they belong to the todos module.
      await prisma.routine.delete({ where: { id } });
      return c.body(null, 204);
    })
    .post("/routines/:id/runs", async (c) => {
      const routine = await findRoutine(c.req.param("id"));

      // Two DBs, so no shared transaction. If a step fails, delete the todos already created.
      const created: TodoRef[] = [];
      try {
        for (const step of routine.steps) created.push(await todos.create(step.title));
      } catch {
        await todos.delete(created.map((todo) => todo.id));
        throw new HTTPException(502, { message: "Could not create todos" });
      }

      const run = await prisma.routineRun.create({
        data: { routineId: routine.id, todoIds: created.map((todo) => todo.id) },
      });
      return c.json({ run: { ...run, todos: created } }, 201);
    })
    .get("/routines/:id/runs", async (c) => {
      const routine = await findRoutine(c.req.param("id"));
      const runs = await prisma.routineRun.findMany({
        where: { routineId: routine.id },
        orderBy: { createdAt: "desc" },
      });

      // One call to todos for all runs, then join in memory.
      const found = await todos.find(runs.flatMap((run) => run.todoIds));
      const byId = new Map(found.map((todo) => [todo.id, todo]));

      return c.json(
        {
          runs: runs.map((run) => {
            // A todo can be deleted in the todos module. Show only the todos that still exist.
            const runTodos = run.todoIds.flatMap((id) => byId.get(id) ?? []);
            return {
              ...run,
              todos: runTodos,
              completed: runTodos.filter((todo) => todo.completed).length,
              total: run.todoIds.length,
            };
          }),
        },
        200,
      );
    });

export const routinesRoutes = createRoutinesRoutes(todosAdapter);

export type RoutinesApp = typeof routinesRoutes;
