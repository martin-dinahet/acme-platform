import { ok } from "@acme/backend-kernel";
import type { TodoRepository } from "./todo-repository.js";

/** Returns only the todos that exist and belong to the owner. */
export const findTodos = (repo: TodoRepository) => async (ownerId: string, ids: string[]) =>
  ok(ids.length === 0 ? [] : await repo.findByIds(ownerId, ids));
