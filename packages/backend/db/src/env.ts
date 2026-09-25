import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    // One database for all modules. Each module has its own Postgres schema.
    DATABASE_URL: z.string(),
  }),
);
