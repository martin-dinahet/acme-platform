import { resolve } from "node:path";
import dotenv from "dotenv";
import type { ZodSchema } from "zod";

/**
 * Validates `process.env` against a Zod schema and returns the parsed result.
 *
 * Loads a `.env` file from the project root (if present), then validates
 * every `process.env` value against the provided schema. Throws at startup
 * if any variable is missing or fails validation.
 *
 * @example
 * ```ts
 * import { createEnv } from "@acme/env";
 * import { z } from "zod";
 *
 * export const env = createEnv(
 *   z.object({
 *     PORT: z.coerce.number().default(3000),
 *     DATABASE_URL: z.string().url(),
 *   })
 * );
 * ```
 */
export function createEnv<T extends ZodSchema>(schema: T): T["_output"] {
  dotenv.config({ path: resolve(process.cwd(), ".env") });

  const result = schema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const missing = Object.entries(formatted)
      .filter(([key]) => key !== "_errors")
      .filter(([, value]) => {
        if (value && typeof value === "object" && "_errors" in value) {
          return (value as { _errors: string[] })._errors.length > 0;
        }
        return false;
      })
      .map(([key]) => key);

    throw new Error(
      `Invalid environment variables:\n${result.error.issues
        .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}${missing.length > 0 ? `\n\nMissing: ${missing.join(", ")}` : ""}`,
    );
  }

  return result.data;
}
