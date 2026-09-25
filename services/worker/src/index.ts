import { hostname } from "node:os";
import { prisma } from "@acme/backend-db";
import { createContainer } from "./container.js";
import { purgeCompletedTodosJob } from "./jobs/purge-completed-todos.js";
import { env } from "./lib/env.js";
import { withLock } from "./lib/with-lock.js";

const host = hostname();
const log = (entry: Record<string, unknown>) => console.log(JSON.stringify({ ...entry, host }));

const { todos } = createContainer();
const jobs = [purgeCompletedTodosJob(todos.api, { olderThanDays: env.PURGE_AFTER_DAYS })];

// SIGTERM: finish the current tick, then exit.
let stopping = false;
let wake = () => {};
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    log({ msg: "stopping", signal });
    stopping = true;
    wake();
  });
}

/** Sleeps to the next multiple of the interval, so all replicas tick at the same time. Stops early on a signal. */
const untilNextTick = () =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, env.JOB_INTERVAL_MS - (Date.now() % env.JOB_INTERVAL_MS));
    wake = () => {
      clearTimeout(timer);
      resolve();
    };
  });

log({ msg: "worker started", intervalMs: env.JOB_INTERVAL_MS });
while (!stopping) {
  await untilNextTick();
  if (stopping) break;
  for (const job of jobs) {
    let count = 0;
    try {
      const ran = await withLock(
        job.lockKey,
        async () => {
          count = await job.run();
        },
        { holdMs: env.LOCK_HOLD_MS },
      );
      log({ job: job.name, ran, count });
    } catch (error) {
      log({ job: job.name, ran: false, error: String(error) });
    }
  }
}

await prisma.$disconnect();
log({ msg: "worker stopped" });
process.exit(0);
