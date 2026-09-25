import { runInTransaction } from "@acme/backend-db";
import { prisma, resetDatabase } from "@acme/backend-db/testing";
import type { AppEnv, TransactionRunner } from "@acme/backend-kernel";
import { createRoutinesModule, type TodosPort } from "@acme/backend-routines";
import { createTodosModule } from "@acme/backend-todos";
import { beforeEach, expect, test } from "bun:test";
import { Hono } from "hono";
import { createInProcessTodosPort } from "./adapters/todos-port.in-process.js";

// Test 2: the main claim of the spike. A run is atomic across two modules.

/** Real adapter, but it creates the todos one by one and throws on call number `failOn`. */
const failingPort = (real: TodosPort, failOn: number): TodosPort => {
  let calls = 0;
  return {
    ...real,
    createMany: async (ownerId, titles) => {
      const created = [];
      for (const title of titles) {
        if (++calls === failOn) throw new Error("todos: simulated failure");
        created.push(...(await real.createMany(ownerId, [title])));
      }
      return created;
    },
  };
};

const setup = (transaction: TransactionRunner, failOn: number) => {
  const todos = createTodosModule({ transaction });
  const realPort = createInProcessTodosPort(todos.api);
  const routines = createRoutinesModule({ todos: failingPort(realPort, failOn), transaction });
  return new Hono<AppEnv>()
    .use(async (c, next) => {
      c.set("userId", "alice");
      await next();
    })
    .route("/", routines.routes);
};

const runRoutineWith3Steps = async (app: Hono<AppEnv>) => {
  const created = await app.request("/routines", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Morning", steps: ["wake", "wash", "eat"] }),
  });
  const { routine } = (await created.json()) as { routine: { id: string } };
  return app.request(`/routines/${routine.id}/runs`, { method: "POST" });
};

const counts = async () => ({
  todos: await prisma.todo.count(),
  runs: await prisma.routineRun.count(),
  runTodos: await prisma.routineRunTodo.count(),
});

beforeEach(resetDatabase);

test("a run that fails on the 3rd todo keeps no todo and no run", async () => {
  const res = await runRoutineWith3Steps(setup(runInTransaction, 3));

  expect(res.status).toBe(500);
  expect(await counts()).toEqual({ todos: 0, runs: 0, runTodos: 0 });
});

test("control: without the transaction, the same failure leaves 2 orphan todos", async () => {
  const res = await runRoutineWith3Steps(setup((fn) => fn(), 3));

  expect(res.status).toBe(500);
  expect(await counts()).toEqual({ todos: 2, runs: 0, runTodos: 0 });
});

test("control: a run that does not fail keeps 3 todos, 1 run, 3 links", async () => {
  const res = await runRoutineWith3Steps(setup(runInTransaction, Number.POSITIVE_INFINITY));

  expect(res.status).toBe(201);
  expect(await counts()).toEqual({ todos: 3, runs: 1, runTodos: 3 });
});
