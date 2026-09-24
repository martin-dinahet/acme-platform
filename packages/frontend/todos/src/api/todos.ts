import { type Todo, todosClient } from "./client.js";

export type { Todo };

const todos = todosClient.todos;

/** Throws with `fallback` when the request failed, otherwise resolves the parsed body. */
const unwrap = async <T>(res: Response, fallback: string): Promise<T> => {
  if (!res.ok) throw new Error(fallback);
  return res.json() as Promise<T>;
};

export const listTodos = async () => {
  const body = await unwrap<{ todos: Todo[] }>(await todos.$get(), "Couldn't load todos.");
  return body.todos;
};

export const createTodo = async (title: string) => {
  const body = await unwrap<{ todo: Todo }>(
    await todos.$post({ json: { title } }),
    "Couldn't create the todo.",
  );
  return body.todo;
};

export const setTodoCompleted = async (id: string, completed: boolean) => {
  const body = await unwrap<{ todo: Todo }>(
    await todos[":id"].$put({ param: { id }, json: { completed } }),
    "Couldn't update the todo.",
  );
  return body.todo;
};

export const deleteTodo = async (id: string) => {
  await unwrap(await todos[":id"].$delete({ param: { id } }), "Couldn't delete the todo.");
};
