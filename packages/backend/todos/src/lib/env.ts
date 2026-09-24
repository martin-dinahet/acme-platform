import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    TODOS_DATABASE_URL: z.string(),
  }),
);
