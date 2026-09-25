import { runInTransaction } from "@acme/backend-db";
import { prisma, resetDatabase } from "@acme/backend-db/testing";
import type { AppEnv } from "@acme/backend-kernel";
import { createRoutinesModule, type TodosPort } from "@acme/backend-routines";
import { afterAll, beforeEach, expect, test } from "bun:test";
import { Hono } from "hono";
import { createHttpTodosPort } from "./adapters/todos-port.http.js";
import { createApp } from "./app.js";
import { createContainer } from "./container.js";

// Split rehearsal: test 2 again, but routines talks to todos over HTTP. The transaction boundary is lost.

const WEB = "http://localhost:5173";
const todosService = Bun.serve({
  port: 0,
  fetch: createApp(
    createContainer({
      auth: { baseURL: "http://localhost:3000", secret: "test-secret-0123456789-0123456789-abc", trustedOrigins: [WEB] },
    }),
    { webOrigins: [WEB], hostname: "todos-service" },
  ).fetch,
});
afterAll(() => todosService.stop(true));
const base = `http://localhost:${todosService.port}/api`;

const failAfter = (real: TodosPort, okCalls: number): TodosPort => {
  let calls = 0;
  return {
    ...real,
    createMany: async (ownerId, titles) => {
      const created = [];
      for (const title of titles) {
        if (++calls > okCalls) throw new Error("todos service: simulated failure");
        created.push(...(await real.createMany(ownerId, [title])));
      }
      return created;
    },
  };
};

beforeEach(resetDatabase);

test("over HTTP, a run that fails on the 3rd todo leaves 2 orphan todos (no shared transaction)", async () => {
  const signUp = await fetch(`${base}/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: WEB },
    body: JSON.stringify({ email: "alice@example.com", password: "password123", name: "alice" }),
  });
  const { user } = (await signUp.json()) as { user: { id: string } };
  const cookie = signUp.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");

  const port = createHttpTodosPort({ baseUrl: base, headersFor: () => ({ cookie, origin: WEB }) });
  const routines = createRoutinesModule({ todos: failAfter(port, 2), transaction: runInTransaction });
  const app = new Hono<AppEnv>()
    .use(async (c, next) => {
      c.set("userId", user.id);
      await next();
    })
    .route("/", routines.routes);

  const created = await app.request("/routines", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Morning", steps: ["wake", "wash", "eat"] }),
  });
  const { routine } = (await created.json()) as { routine: { id: string } };
  const res = await app.request(`/routines/${routine.id}/runs`, { method: "POST" });

  expect(res.status).toBe(500);
  expect(await prisma.todo.count()).toBe(2);
  expect(await prisma.routineRun.count()).toBe(0);
});
