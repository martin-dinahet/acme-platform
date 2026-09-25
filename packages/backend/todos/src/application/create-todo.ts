import { ok } from "@acme/backend-kernel";
import type { NewTodo } from "../domain/todo.js";
import type { TodoRepository } from "./todo-repository.js";

export const createTodo = (repo: TodoRepository) => async (ownerId: string, todo: NewTodo) =>
  ok(await repo.create(ownerId, todo));
