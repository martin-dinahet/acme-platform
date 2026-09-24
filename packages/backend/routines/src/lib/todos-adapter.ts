import { createTodo, deleteTodos, findTodos } from "@acme/backend-todos";
import type { TodoRef, TodosPort } from "./todos-port.js";

const toRef = ({ id, title, completed }: TodoRef): TodoRef => ({ id, title, completed });

/** Adapter: implements the port with direct calls to the todos module. */
export const todosAdapter: TodosPort = {
  create: async (title) => toRef(await createTodo(title)),
  find: async (ids) => (await findTodos(ids)).map(toRef),
  delete: async (ids) => {
    await deleteTodos(ids);
  },
};
