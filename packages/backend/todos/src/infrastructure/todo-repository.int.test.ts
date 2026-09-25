import { runInTransaction } from "@acme/backend-db";
import { prisma, resetDatabase } from "@acme/backend-db/testing";
import { beforeEach, expect, test } from "bun:test";
import { createTodoRepository } from "./todo-repository.js";

const repo = createTodoRepository();

beforeEach(resetDatabase);

test("every read and write is scoped by owner", async () => {
  const mine = await repo.create("alice", { title: "mine" });
  const theirs = await repo.create("bob", { title: "theirs" });

  expect((await repo.list("alice")).map((t) => t.id)).toEqual([mine.id]);
  expect(await repo.findById("alice", theirs.id)).toBeNull();
  expect((await repo.findByIds("alice", [mine.id, theirs.id])).map((t) => t.id)).toEqual([mine.id]);
  expect(await repo.update("alice", theirs.id, { title: "hacked" })).toBeNull();
  expect(await repo.remove("alice", theirs.id)).toBe(false);
  expect((await prisma.todo.findUniqueOrThrow({ where: { id: theirs.id } })).title).toBe("theirs");
});

test("deleteCompletedBefore deletes only completed todos older than the date", async () => {
  const old = new Date("2026-01-01T00:00:00Z");
  await prisma.todo.createMany({
    data: [
      { ownerId: "a", title: "old-done", completed: true, updatedAt: old },
      { ownerId: "b", title: "old-open", completed: false, updatedAt: old },
      { ownerId: "a", title: "new-done", completed: true },
    ],
  });
  expect(await repo.deleteCompletedBefore(new Date("2026-02-01T00:00:00Z"))).toBe(1);
  expect((await prisma.todo.findMany({ orderBy: { title: "asc" } })).map((t) => t.title)).toEqual([
    "new-done",
    "old-open",
  ]);
});

test("writes join the current transaction", async () => {
  await expect(
    runInTransaction(async () => {
      await repo.create("alice", { title: "a" });
      throw new Error("boom");
    }),
  ).rejects.toThrow("boom");
  expect(await prisma.todo.count()).toBe(0);
});
