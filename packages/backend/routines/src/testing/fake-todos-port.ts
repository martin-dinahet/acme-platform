import type { TodoRef, TodosPort } from "../ports/todos-port.js";

/** In-memory `TodosPort` for unit tests. It passes the port contract. */
export const createFakeTodosPort = () => {
  const todos = new Map<string, TodoRef & { ownerId: string }>();
  let next = 0;
  const port: TodosPort = {
    createMany: async (ownerId, titles) =>
      titles.map((title) => {
        const todo = { id: `todo-${++next}`, title, completed: false };
        todos.set(todo.id, { ...todo, ownerId });
        return todo;
      }),
    find: async (ownerId, ids) =>
      ids.flatMap((id) => {
        const todo = todos.get(id);
        return todo && todo.ownerId === ownerId ? [{ id: todo.id, title: todo.title, completed: todo.completed }] : [];
      }),
  };
  return { port, todos };
};
