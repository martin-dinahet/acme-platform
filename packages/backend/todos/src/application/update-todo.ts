import { notFound, ok } from "@acme/backend-kernel";
import type { TodoPatch } from "../domain/todo.js";
import type { TodoRepository } from "./todo-repository.js";

export const updateTodo = (repo: TodoRepository) => async (ownerId: string, id: string, patch: TodoPatch) => {
  const todo = await repo.update(ownerId, id, patch);
  return todo ? ok(todo) : notFound();
};
