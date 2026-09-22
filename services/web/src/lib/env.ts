import { z } from "zod";

export const env = z
  .object({
    VITE_API_URL: z.string().url().default("http://localhost:3000"),
    // Public URL of the standalone login app. Signed-out users are sent here.
    VITE_LOGIN_URL: z.string().url().default("http://localhost:5174"),
  })
  .parse(import.meta.env);
