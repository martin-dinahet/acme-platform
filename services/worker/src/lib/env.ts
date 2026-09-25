import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    JOB_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
    PURGE_AFTER_DAYS: z.coerce.number().nonnegative().default(30),
    // Minimum time that a replica keeps a job lock. See `withLock`.
    LOCK_HOLD_MS: z.coerce.number().nonnegative().default(2_000),
  }),
);
