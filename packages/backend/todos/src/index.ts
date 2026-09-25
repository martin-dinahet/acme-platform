import type { TransactionRunner } from "@acme/backend-kernel";
import { createTodosApi } from "./api.js";
import { createTodosRoutes } from "./http/routes.js";
import { createTodoRepository } from "./infrastructure/todo-repository.js";
import { createTodosUseCases } from "./use-cases.js";

export type { Todo } from "./domain/todo.js";

/** Public factory. Only a composition root (`services/*`) calls it (R2). */
export const createTodosModule = ({ transaction }: { transaction: TransactionRunner }) => {
  const useCases = createTodosUseCases(createTodoRepository(), transaction);
  return {
    /** Hono sub-app for the api. */
    routes: createTodosRoutes(useCases),
    /** In-process API for other modules and the worker. */
    api: createTodosApi(useCases),
  };
};

/** For `hc<TodosRoutes>` in the frontend. */
export type TodosRoutes = ReturnType<typeof createTodosRoutes>;
export type TodosApi = ReturnType<typeof createTodosApi>;
