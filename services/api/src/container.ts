import { runInTransaction } from "@acme/backend-db";
import { createRoutinesModule } from "@acme/backend-routines";
import { createTodosModule } from "@acme/backend-todos";
import { createInProcessTodosPort } from "./adapters/todos-port.in-process.js";

/** Makes the modules and wires the ports. The only place that knows all modules. */
export const createContainer = () => {
  const todos = createTodosModule({ transaction: runInTransaction });
  const routines = createRoutinesModule({
    todos: createInProcessTodosPort(todos.api),
    transaction: runInTransaction,
  });
  return { todos, routines };
};

export type Container = ReturnType<typeof createContainer>;
