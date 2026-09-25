import { ok } from "@acme/backend-kernel";
import type { TodoRepository } from "./todo-repository.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deletes completed todos of all owners that did not change for `olderThanDays` days. */
export const purgeCompletedTodos =
  (repo: TodoRepository) =>
  async ({ olderThanDays, now = new Date() }: { olderThanDays: number; now?: Date }) =>
    ok({ count: await repo.deleteCompletedBefore(new Date(now.getTime() - olderThanDays * DAY_MS)) });
