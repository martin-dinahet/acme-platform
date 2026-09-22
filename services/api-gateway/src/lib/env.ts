import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    PORT: z.coerce.number().default(3000),
    TODOS_URL: z.string().url(),
    // Comma-separated browser origins (SPAs) allowed to call the gateway (CORS + CSRF check).
    WEB_ORIGINS: z
      .string()
      .transform((value) => value.split(",").filter(Boolean))
      .pipe(z.array(z.string().url()).min(1)),
  }),
);
