import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    PORT: z.coerce.number().default(3000),
    // Comma-separated browser origins allowed to call the API (CORS + CSRF check).
    WEB_ORIGINS: z
      .string()
      .transform((value) => value.split(",").filter(Boolean))
      .pipe(z.array(z.string().url()).min(1)),
    // Internal base URLs of the downstream services.
    AUTH_SERVICE_URL: z.string().url(),
    TODOS_SERVICE_URL: z.string().url(),
    ROUTINES_SERVICE_URL: z.string().url(),
  }),
);
