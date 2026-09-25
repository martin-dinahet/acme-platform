import { ok, type TransactionRunner } from "@acme/backend-kernel";
import type { Todo } from "../domain/todo.js";
import type { TodoRepository } from "./todo-repository.js";

/** Makes one todo for each title, in order. All or none. Joins the transaction of the caller if there is one. */
export const createTodos =
  (repo: TodoRepository, transaction: TransactionRunner) => (ownerId: string, titles: string[]) =>
    transaction(async () => {
      const created: Todo[] = [];
      for (const title of titles) created.push(await repo.create(ownerId, { title }));
      return ok(created);
    });
