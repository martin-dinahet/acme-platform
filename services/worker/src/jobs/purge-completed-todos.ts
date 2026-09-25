import type { TodosApi } from "@acme/backend-todos";

/** Deletes completed todos that did not change for `olderThanDays` days. Uses the todos API only (R4). */
export const purgeCompletedTodosJob = (todos: TodosApi, { olderThanDays }: { olderThanDays: number }) => ({
  name: "purge-completed-todos",
  /** Advisory lock key. Unique for each job. */
  lockKey: 1001,
  run: () => todos.purgeCompleted({ olderThanDays }),
});

export type Job = ReturnType<typeof purgeCompletedTodosJob>;
