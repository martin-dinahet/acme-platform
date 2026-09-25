import type { TransactionRunner } from "@acme/backend-kernel";
import { createRoutinesRoutes } from "./http/routes.js";
import { createRoutineRepository } from "./infrastructure/routine-repository.js";
import type { TodosPort } from "./ports/todos-port.js";
import { createRoutinesUseCases } from "./use-cases.js";

export type { TodoRef, TodosPort } from "./ports/todos-port.js";

/** Public factory. Only a composition root (`services/*`) calls it (R2). */
export const createRoutinesModule = ({ todos, transaction }: { todos: TodosPort; transaction: TransactionRunner }) => {
  const useCases = createRoutinesUseCases({ routines: createRoutineRepository(), todos, transaction });
  return {
    /** Hono sub-app for the api. */
    routes: createRoutinesRoutes(useCases),
  };
};

/** For `hc<RoutinesRoutes>` in the frontend. */
export type RoutinesRoutes = ReturnType<typeof createRoutinesRoutes>;
