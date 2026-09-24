import { createEnv } from "@acme/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    PORT: z.coerce.number().default(3001),
  }),
);
