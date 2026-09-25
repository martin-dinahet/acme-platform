import { notFound, ok } from "@acme/backend-kernel";
import type { TodoRepository } from "./todo-repository.js";

export const getTodo = (repo: TodoRepository) => async (ownerId: string, id: string) => {
  const todo = await repo.findById(ownerId, id);
  return todo ? ok(todo) : notFound();
};
