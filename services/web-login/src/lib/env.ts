import { z } from "zod";

export const env = z
  .object({
    VITE_API_URL: z.string().url().default("http://localhost:3000"),
    // Public URL of the main app. Sent here after a successful sign-in or sign-up.
    VITE_APP_URL: z.string().url().default("http://localhost:5173"),
  })
  .parse(import.meta.env);
