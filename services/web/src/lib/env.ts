import { z } from "zod";

export const env = z
  .object({
    VITE_API_URL: z.string().url().default("http://localhost:3000"),
  })
  .parse(import.meta.env);
