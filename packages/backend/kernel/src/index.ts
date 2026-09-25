// Shared types for all backend modules. Rule R7: no Prisma, no Hono handlers, no module imports.
import { Result } from "@punpun-dev/ts-result";

export { Failure, Result, Success } from "@punpun-dev/ts-result";

/** Hono env of module routes. `requireUser` sets `userId`. */
export type AppEnv = { Variables: { userId: string } };

/** Runs `fn` in one database transaction. The container injects the real one; unit tests inject `(fn) => fn()`. */
export type TransactionRunner = <T>(fn: () => Promise<T>) => Promise<T>;

/** Errors that use cases return. Routes map them to HTTP status codes with `statusOf`. */
export type AppError = { kind: "not_found" } | { kind: "invalid"; message: string };

export const ok = <T>(value: T) => Result.success(value);
export const err = <E>(error: E) => Result.failure(error);
export const notFound = () => err({ kind: "not_found" as const });

const STATUS = { not_found: 404, invalid: 400 } as const satisfies Record<AppError["kind"], number>;

/** HTTP status for an `AppError`. */
export const statusOf = <K extends AppError["kind"]>(error: { kind: K }) => STATUS[error.kind];
