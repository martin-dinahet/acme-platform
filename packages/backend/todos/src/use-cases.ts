import type { TransactionRunner } from "@acme/backend-kernel";
import { createTodo } from "./application/create-todo.js";
import { createTodos } from "./application/create-todos.js";
import { findTodos } from "./application/find-todos.js";
import { getTodo } from "./application/get-todo.js";
import { listTodos } from "./application/list-todos.js";
import { purgeCompletedTodos } from "./application/purge-completed-todos.js";
import { removeTodo } from "./application/remove-todo.js";
import type { TodoRepository } from "./application/todo-repository.js";
import { updateTodo } from "./application/update-todo.js";

export const createTodosUseCases = (repo: TodoRepository, transaction: TransactionRunner) => ({
  list: listTodos(repo),
  get: getTodo(repo),
  create: createTodo(repo),
  update: updateTodo(repo),
  remove: removeTodo(repo),
  createMany: createTodos(repo, transaction),
  findByIds: findTodos(repo),
  purgeCompleted: purgeCompletedTodos(repo),
});

export type TodosUseCases = ReturnType<typeof createTodosUseCases>;
