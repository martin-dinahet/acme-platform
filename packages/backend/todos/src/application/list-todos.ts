import { ok } from "@acme/backend-kernel";
import type { TodoRepository } from "./todo-repository.js";

export const listTodos = (repo: TodoRepository) => async (ownerId: string) => ok(await repo.list(ownerId));
