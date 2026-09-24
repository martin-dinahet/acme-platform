import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    ROUTINES_DATABASE_URL: z.string(),
  }),
);
