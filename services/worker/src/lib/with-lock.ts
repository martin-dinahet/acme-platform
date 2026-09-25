import { db, runInTransaction } from "@acme/backend-db";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `fn` only if this process gets the Postgres advisory lock `key`. Returns `true` if `fn` ran.
 * The lock is released at the end of the transaction. `fn` writes through `db()`, so they are in the same transaction.
 *
 * `holdMs`: minimum time to keep the lock. With aligned ticks, all replicas try in the first ms of a tick.
 * A fast `fn` can release the lock before a slower replica tries. Holding it closes that gap.
 * Keep `holdMs` + `fn` below the Prisma transaction timeout (5 s).
 */
export const withLock = (key: number, fn: () => Promise<void>, { holdMs = 0 } = {}) =>
  runInTransaction(async () => {
    const start = Date.now();
    const [{ ok }] = await db().$queryRaw<{ ok: boolean }[]>`SELECT pg_try_advisory_xact_lock(${key}::bigint) AS ok`;
    if (!ok) return false;
    await fn();
    await sleep(holdMs - (Date.now() - start));
    return true;
  });
