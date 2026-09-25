import { AsyncLocalStorage } from "node:async_hooks";
import { prisma } from "./client.js";
import type { Prisma } from "./generated/client.js";

export type Db = Prisma.TransactionClient;

const store = new AsyncLocalStorage<Db>();

/** Returns the client of the current transaction, or the root client. Repositories always call this. */
export const db = (): Db => store.getStore() ?? prisma;

/**
 * Runs `fn` in one transaction. A nested call joins the outer transaction.
 * Prisma default limits apply: `maxWait` 2 s, `timeout` 5 s.
 */
export const runInTransaction = <T>(fn: () => Promise<T>): Promise<T> =>
  store.getStore() ? fn() : prisma.$transaction((tx) => store.run(tx, fn));
