import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    PORT: z.coerce.number().default(3000),
    // Comma-separated browser origins allowed to call the API (CORS, CSRF, Better Auth trusted origins).
    WEB_ORIGINS: z
      .string()
      .transform((value) => value.split(",").filter(Boolean))
      .pipe(z.array(z.string().url()).min(1)),
    BETTER_AUTH_SECRET: z.string().min(32),
    // Public URL that the browser uses for the API (the edge in Docker).
    BETTER_AUTH_URL: z.string().url(),
  }),
);
