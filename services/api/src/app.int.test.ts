import { resetDatabase } from "@acme/backend-db/testing";
import { beforeEach, describe, expect, test } from "bun:test";
import { createApp } from "./app.js";
import { createContainer } from "./container.js";

// Test 4: user isolation through the real app, with two real Better Auth sessions.

const WEB = "http://localhost:5173";
const container = createContainer({
  auth: { baseURL: "http://localhost:3000", secret: "test-secret-0123456789-0123456789-abc", trustedOrigins: [WEB] },
});
const app = createApp(container, { webOrigins: [WEB], hostname: "test-host" });

const send = (cookie: string, method: string, path: string, body?: unknown) =>
  app.request(`/api${path}`, {
    method,
    headers: { origin: WEB, cookie, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

const signUp = async (email: string) => {
  const res = await send("", "POST", "/auth/sign-up/email", { email, password: "password123", name: email });
  expect(res.status).toBe(200);
  return res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
};

describe("user isolation", () => {
  let alice: string;
  let bob: string;
  let todoId: string;
  let routineId: string;

  beforeEach(async () => {
    await resetDatabase();
    alice = await signUp("alice@example.com");
    bob = await signUp("bob@example.com");
    todoId = ((await (await send(alice, "POST", "/todos", { title: "alice's" })).json()) as { todo: { id: string } })
      .todo.id;
    routineId = (
      (await (await send(alice, "POST", "/routines", { name: "r", steps: ["a", "b"] })).json()) as {
        routine: { id: string };
      }
    ).routine.id;
  });

  test("bob cannot list alice's todos or routines", async () => {
    expect(await (await send(bob, "GET", "/todos")).json()).toEqual({ todos: [] });
    expect(await (await send(bob, "GET", "/routines")).json()).toEqual({ routines: [] });
  });

  test("bob gets 404 when he reads, updates or deletes alice's todo", async () => {
    expect((await send(bob, "GET", `/todos/${todoId}`)).status).toBe(404);
    expect((await send(bob, "PUT", `/todos/${todoId}`, { completed: true })).status).toBe(404);
    expect((await send(bob, "DELETE", `/todos/${todoId}`)).status).toBe(404);
  });

  test("bob gets 404 when he reads, updates, deletes or runs alice's routine", async () => {
    expect((await send(bob, "GET", `/routines/${routineId}`)).status).toBe(404);
    expect((await send(bob, "PUT", `/routines/${routineId}`, { name: "x", steps: ["x"] })).status).toBe(404);
    expect((await send(bob, "DELETE", `/routines/${routineId}`)).status).toBe(404);
    expect((await send(bob, "POST", `/routines/${routineId}/runs`)).status).toBe(404);
    expect((await send(bob, "GET", `/routines/${routineId}/runs`)).status).toBe(404);
  });

  test("alice still has her data, unchanged", async () => {
    const todo = (await (await send(alice, "GET", `/todos/${todoId}`)).json()) as { todo: { completed: boolean } };
    expect(todo.todo.completed).toBe(false);
    expect((await send(alice, "POST", `/routines/${routineId}/runs`)).status).toBe(201);
    const runs = (await (await send(alice, "GET", `/routines/${routineId}/runs`)).json()) as {
      runs: { completed: number; total: number }[];
    };
    expect(runs.runs).toMatchObject([{ completed: 0, total: 2 }]);
  });

  test("a request without a session gets 401", async () => {
    expect((await send("", "GET", "/todos")).status).toBe(401);
    expect((await send("", "GET", "/routines")).status).toBe(401);
  });
});

test("health and x-served-by", async () => {
  const res = await app.request("/health");
  expect(res.status).toBe(200);
  expect(res.headers.get("x-served-by")).toBe("test-host");
});
