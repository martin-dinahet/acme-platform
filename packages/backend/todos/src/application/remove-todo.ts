import { notFound, ok } from "@acme/backend-kernel";
import type { TodoRepository } from "./todo-repository.js";

export const removeTodo = (repo: TodoRepository) => async (ownerId: string, id: string) =>
  (await repo.remove(ownerId, id)) ? ok({ id }) : notFound();
