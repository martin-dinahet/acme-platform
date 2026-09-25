import { type AuthConfig, createAuthModule } from "@acme/backend-auth";
import { runInTransaction } from "@acme/backend-db";
import { createRoutinesModule } from "@acme/backend-routines";
import { createTodosModule } from "@acme/backend-todos";
import { createInProcessTodosPort } from "./adapters/todos-port.in-process.js";

/** Makes the modules and wires the ports. The only place that knows all modules. */
export const createContainer = (config: { auth: AuthConfig }) => {
  const auth = createAuthModule(config.auth);
  const todos = createTodosModule({ transaction: runInTransaction });
  const routines = createRoutinesModule({
    todos: createInProcessTodosPort(todos.api),
    transaction: runInTransaction,
  });
  return { auth, todos, routines };
};

export type Container = ReturnType<typeof createContainer>;
