import { describe, expect, test } from "bun:test";
import type { Todo } from "./domain/todo.js";
import { createInMemoryTodoRepository } from "./testing/in-memory-todo-repository.js";
import { createTodosUseCases } from "./use-cases.js";

const passThrough = <T>(fn: () => Promise<T>) => fn();
const day = (n: number) => new Date(Date.UTC(2026, 0, n));
const todo = (id: string, ownerId: string, extra: Partial<Todo> = {}): Todo => ({
  id,
  ownerId,
  title: id,
  completed: false,
  createdAt: day(1),
  updatedAt: day(1),
  ...extra,
});

const setup = (seed: Todo[] = []) => {
  const { repo, rows } = createInMemoryTodoRepository(seed);
  return { uc: createTodosUseCases(repo, passThrough), rows };
};

describe("owner scope", () => {
  const { uc } = setup([todo("a1", "alice"), todo("b1", "bob")]);

  test("list returns only the todos of the owner", async () => {
    expect((await uc.list("alice")).unwrapOrThrow().map((t) => t.id)).toEqual(["a1"]);
  });

  test("get, update, remove of a todo of a different owner give not_found", async () => {
    for (const result of [
      await uc.get("alice", "b1"),
      await uc.update("alice", "b1", { completed: true }),
      await uc.remove("alice", "b1"),
    ]) {
      expect(result.isFailure()).toBe(true);
      expect(result.match({ success: () => "", failure: (e) => e.kind })).toBe("not_found");
    }
  });

  test("findByIds drops ids of a different owner and unknown ids", async () => {
    const found = (await uc.findByIds("alice", ["a1", "b1", "zz"])).unwrapOrThrow();
    expect(found.map((t) => t.id)).toEqual(["a1"]);
  });
});

test("get of a missing todo gives not_found", async () => {
  const { uc } = setup();
  expect((await uc.get("alice", "missing")).isFailure()).toBe(true);
});

test("createMany makes one todo for each title, in order", async () => {
  const { uc } = setup();
  const created = (await uc.createMany("alice", ["x", "y", "z"])).unwrapOrThrow();
  expect(created.map((t) => t.title)).toEqual(["x", "y", "z"]);
  expect(created.every((t) => t.ownerId === "alice")).toBe(true);
});

test("purgeCompleted deletes only completed todos older than the limit", async () => {
  const { uc, rows } = setup([
    todo("old-done", "alice", { completed: true, updatedAt: day(1) }),
    todo("old-open", "alice", { completed: false, updatedAt: day(1) }),
    todo("new-done", "bob", { completed: true, updatedAt: day(25) }),
  ]);
  const result = await uc.purgeCompleted({ olderThanDays: 10, now: day(30) });
  expect(result.unwrapOrThrow().count).toBe(1);
  expect([...rows.keys()].sort()).toEqual(["new-done", "old-open"]);
});
