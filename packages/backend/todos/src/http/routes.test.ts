import type { AppEnv } from "@acme/backend-kernel";
import { expect, test } from "bun:test";
import { Hono } from "hono";
import { createInMemoryTodoRepository } from "../testing/in-memory-todo-repository.js";
import { createTodosUseCases } from "../use-cases.js";
import { createTodosRoutes } from "./routes.js";

const { repo } = createInMemoryTodoRepository();
const routes = createTodosRoutes(createTodosUseCases(repo, (fn) => fn()));

/** Stands in for `requireUser`: the user comes from the `x-test-user` header. */
const app = new Hono<AppEnv>()
  .use(async (c, next) => {
    c.set("userId", c.req.header("x-test-user") ?? "alice");
    await next();
  })
  .route("/", routes);

const json = (body: unknown, user = "alice") => ({
  headers: { "content-type": "application/json", "x-test-user": user },
  body: JSON.stringify(body),
});

test("create, then read, update and delete a todo", async () => {
  const created = await app.request("/todos", { method: "POST", ...json({ title: "Buy milk" }) });
  expect(created.status).toBe(201);
  const { todo } = (await created.json()) as { todo: { id: string } };

  expect((await app.request(`/todos/${todo.id}`)).status).toBe(200);
  expect((await app.request(`/todos/${todo.id}`, { method: "PUT", ...json({ completed: true }) })).status).toBe(200);
  expect((await app.request(`/todos/${todo.id}`, { method: "DELETE" })).status).toBe(200);
  expect((await app.request(`/todos/${todo.id}`)).status).toBe(404);
});

test("a missing todo gives 404, not 500", async () => {
  expect((await app.request("/todos/missing")).status).toBe(404);
  expect((await app.request("/todos/missing", { method: "PUT", ...json({ completed: true }) })).status).toBe(404);
  expect((await app.request("/todos/missing", { method: "DELETE" })).status).toBe(404);
});

test("a todo of a different user gives 404", async () => {
  const created = await app.request("/todos", { method: "POST", ...json({ title: "secret" }, "bob") });
  const { todo } = (await created.json()) as { todo: { id: string } };
  const res = await app.request(`/todos/${todo.id}`, { headers: { "x-test-user": "alice" } });
  expect(res.status).toBe(404);
});

test("an invalid body gives 400", async () => {
  expect((await app.request("/todos", { method: "POST", ...json({ title: "" }) })).status).toBe(400);
});
