import type { TodoRef, TodosPort } from "@acme/backend-routines";
import type { TodosApi } from "@acme/backend-todos";

const toRef = ({ id, title, completed }: TodoRef): TodoRef => ({ id, title, completed });

/** Implements the routines port with the in-process todos API. Same transaction, no network. */
export const createInProcessTodosPort = (todos: TodosApi): TodosPort => ({
  createMany: async (ownerId, titles) => (await todos.createMany(ownerId, titles)).map(toRef),
  find: async (ownerId, ids) => (await todos.findByIds(ownerId, ids)).map(toRef),
});
