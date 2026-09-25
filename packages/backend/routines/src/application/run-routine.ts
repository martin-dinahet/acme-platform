import { notFound, ok, type TransactionRunner } from "@acme/backend-kernel";
import type { TodosPort } from "../ports/todos-port.js";
import type { RoutineRepository } from "./routine-repository.js";

type Deps = { routines: RoutineRepository; todos: TodosPort; transaction: TransactionRunner };

/** Makes one todo for each step and one run, in one transaction. If a step fails, nothing is kept. */
export const runRoutine =
  ({ routines, todos, transaction }: Deps) =>
  (ownerId: string, routineId: string) =>
    transaction(async () => {
      const routine = await routines.findById(ownerId, routineId);
      if (!routine) return notFound();
      const created = await todos.createMany(
        ownerId,
        routine.steps.map((step) => step.title),
      );
      const run = await routines.createRun(
        ownerId,
        routine.id,
        created.map((todo) => todo.id),
      );
      return ok({ ...run, todos: created });
    });
