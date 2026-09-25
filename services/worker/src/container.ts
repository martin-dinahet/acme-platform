import { runInTransaction } from "@acme/backend-db";
import { createTodosModule } from "@acme/backend-todos";

/** Same wiring as the api, but only the modules that the jobs use. No HTTP, no auth. */
export const createContainer = () => {
  const todos = createTodosModule({ transaction: runInTransaction });
  return { todos };
};
