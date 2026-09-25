import { notFound, ok } from "@acme/backend-kernel";
import type { TodosPort } from "../ports/todos-port.js";
import type { RoutineRepository } from "./routine-repository.js";

type Deps = { routines: RoutineRepository; todos: TodosPort };

/** Runs of a routine with their progress. One call to todos for all runs. */
export const listRuns =
  ({ routines, todos }: Deps) =>
  async (ownerId: string, routineId: string) => {
    const routine = await routines.findById(ownerId, routineId);
    if (!routine) return notFound();

    const runs = await routines.listRuns(ownerId, routine.id);
    const found = await todos.find(
      ownerId,
      runs.flatMap((run) => run.todoIds),
    );
    const byId = new Map(found.map((todo) => [todo.id, todo]));

    return ok(
      runs.map((run) => {
        // A user can delete a todo in the todos module. Show only the todos that still exist.
        const runTodos = run.todoIds.flatMap((id) => byId.get(id) ?? []);
        return {
          ...run,
          todos: runTodos,
          completed: runTodos.filter((todo) => todo.completed).length,
          total: run.todoIds.length,
        };
      }),
    );
  };
