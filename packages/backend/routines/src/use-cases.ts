import type { TransactionRunner } from "@acme/backend-kernel";
import { createRoutine } from "./application/create-routine.js";
import { getRoutine } from "./application/get-routine.js";
import { listRoutines } from "./application/list-routines.js";
import { listRuns } from "./application/list-runs.js";
import { removeRoutine } from "./application/remove-routine.js";
import type { RoutineRepository } from "./application/routine-repository.js";
import { runRoutine } from "./application/run-routine.js";
import { updateRoutine } from "./application/update-routine.js";
import type { TodosPort } from "./ports/todos-port.js";

export type RoutinesDeps = { routines: RoutineRepository; todos: TodosPort; transaction: TransactionRunner };

export const createRoutinesUseCases = (deps: RoutinesDeps) => ({
  list: listRoutines(deps.routines),
  get: getRoutine(deps.routines),
  create: createRoutine(deps.routines),
  update: updateRoutine(deps.routines, deps.transaction),
  remove: removeRoutine(deps.routines),
  run: runRoutine(deps),
  listRuns: listRuns(deps),
});

export type RoutinesUseCases = ReturnType<typeof createRoutinesUseCases>;
