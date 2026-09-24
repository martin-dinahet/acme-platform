import { env } from "./env.js";
import type { TodoRef, TodosPort } from "./todos-port.js";

const toRef = ({ id, title, completed }: TodoRef): TodoRef => ({ id, title, completed });

/** POSTs JSON to the todos service's internal API. Throws on any non-2xx status. */
const call = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(new URL(`/internal${path}`, env.TODOS_SERVICE_URL), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`todos service: POST ${path} failed with ${res.status}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
};

/** Adapter: implements the port with HTTP calls to the todos service. */
export const todosAdapter: TodosPort = {
  create: async (title) => toRef((await call<{ todo: TodoRef }>("/todos", { title })).todo),
  find: async (ids) =>
    ids.length === 0 ? [] : (await call<{ todos: TodoRef[] }>("/todos/find", { ids })).todos.map(toRef),
  delete: async (ids) => {
    if (ids.length > 0) await call("/todos/delete", { ids });
  },
};
