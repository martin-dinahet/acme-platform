import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    TRUSTED_ORIGINS: z
      .string()
      .default("")
      .transform((value) => value.split(",").filter(Boolean)),
  }),
);
