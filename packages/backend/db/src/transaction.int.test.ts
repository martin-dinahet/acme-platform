import { beforeEach, expect, test } from "bun:test";
import { prisma, resetDatabase } from "./testing.js";
import { db, runInTransaction } from "./transaction.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const addTodo = (title: string) => db().todo.create({ data: { ownerId: "u1", title } });

beforeEach(resetDatabase);

test("db() outside a transaction is the root client", () => {
  expect(db()).toBe(prisma);
});

test("a write through db() after several awaits rolls back when fn throws", async () => {
  const run = runInTransaction(async () => {
    await addTodo("a");
    await sleep(20);
    await Promise.resolve();
    await new Promise((resolve) => setImmediate(resolve));
    await addTodo("b");
    await sleep(5);
    expect(db()).not.toBe(prisma);
    throw new Error("boom");
  });

  await expect(run).rejects.toThrow("boom");
  expect(await prisma.todo.count()).toBe(0);
});

test("a nested call joins the outer transaction", async () => {
  const run = runInTransaction(async () => {
    const outer = db();
    await runInTransaction(async () => {
      expect(db()).toBe(outer);
      await addTodo("inner");
    });
    throw new Error("outer fails");
  });

  await expect(run).rejects.toThrow("outer fails");
  expect(await prisma.todo.count()).toBe(0);
});

test("two concurrent transactions keep separate contexts", async () => {
  const ok = runInTransaction(async () => {
    await sleep(10);
    await addTodo("kept");
  });
  const failed = runInTransaction(async () => {
    await addTodo("dropped");
    await sleep(20);
    throw new Error("boom");
  });

  await Promise.allSettled([ok, failed]);
  const titles = (await prisma.todo.findMany()).map((todo) => todo.title);
  expect(titles).toEqual(["kept"]);
});

test("a committed transaction keeps its writes", async () => {
  await runInTransaction(async () => {
    await sleep(5);
    await addTodo("a");
  });
  expect(await prisma.todo.count()).toBe(1);
});
