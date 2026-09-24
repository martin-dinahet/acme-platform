import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    ROUTINES_DATABASE_URL: z.string(),
    // Internal base URL of the todos service, e.g. http://todos:3002.
    TODOS_SERVICE_URL: z.string().url(),
  }),
);
