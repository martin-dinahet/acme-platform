import { resetDatabase } from "@acme/backend-db/testing";
import { beforeEach, expect, test } from "bun:test";
import { withLock } from "./with-lock.js";

// Test 5: two replicas on the same tick. Only one runs the job.

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(resetDatabase);

test("two concurrent calls with the same key: only one runs fn", async () => {
  let runs = 0;
  const job = async () => {
    runs++;
    await sleep(100);
  };

  const results = await Promise.all([withLock(42, job), withLock(42, job)]);

  expect(runs).toBe(1);
  expect(results.sort()).toEqual([false, true]);
});

test("holdMs keeps the lock after a fast fn, so a slightly late replica does not run", async () => {
  let runs = 0;
  const job = async () => {
    runs++;
  };

  const first = withLock(43, job, { holdMs: 300 });
  await sleep(50);
  const late = await withLock(43, job);

  expect(await first).toBe(true);
  expect(late).toBe(false);
  expect(runs).toBe(1);
});

test("different keys do not block each other", async () => {
  let runs = 0;
  const job = async () => {
    runs++;
    await sleep(50);
  };
  expect(await Promise.all([withLock(1, job), withLock(2, job)])).toEqual([true, true]);
  expect(runs).toBe(2);
});

test("the lock is released when the transaction ends", async () => {
  expect(await withLock(44, async () => {})).toBe(true);
  expect(await withLock(44, async () => {})).toBe(true);
});

test("the lock is released when fn throws", async () => {
  await expect(
    withLock(45, async () => {
      throw new Error("boom");
    }),
  ).rejects.toThrow("boom");
  expect(await withLock(45, async () => {})).toBe(true);
});
