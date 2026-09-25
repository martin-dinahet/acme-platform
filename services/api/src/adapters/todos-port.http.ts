import type { TodoRef, TodosPort } from "@acme/backend-routines";
import type { TodosRoutes } from "@acme/backend-todos";
import { hc } from "hono/client";

// Split rehearsal (spike phase 7): the routines port over HTTP, for a future separate routines service.
// Not wired in the container. It uses only the public todos API (no `/internal` routes, R6).

type Options = {
  /** Base URL of the service that serves the todos routes, e.g. http://api:3000/api. */
  baseUrl: string;
  /** Auth headers that act as this user (a forwarded session cookie today; a service token in a real split). */
  headersFor: (ownerId: string) => Record<string, string>;
};

const toRef = ({ id, title, completed }: TodoRef): TodoRef => ({ id, title, completed });

export const createHttpTodosPort = ({ baseUrl, headersFor }: Options): TodosPort => {
  const client = (ownerId: string) => hc<TodosRoutes>(baseUrl, { headers: headersFor(ownerId) });

  return {
    // N requests, not one transaction. A failure after k requests leaves k todos: the caller must compensate.
    createMany: async (ownerId, titles) => {
      const created: TodoRef[] = [];
      for (const title of titles) {
        const res = await client(ownerId).todos.$post({ json: { title, completed: false } });
        if (res.status !== 201) throw new Error(`todos: POST /todos failed with ${res.status}`);
        created.push(toRef((await res.json()).todo));
      }
      return created;
    },
    // No batch endpoint in the public API: read all todos of the owner and filter.
    find: async (ownerId, ids) => {
      if (ids.length === 0) return [];
      const res = await client(ownerId).todos.$get();
      if (res.status !== 200) throw new Error(`todos: GET /todos failed with ${res.status}`);
      const wanted = new Set(ids);
      return (await res.json()).todos.filter((todo) => wanted.has(todo.id)).map(toRef);
    },
  };
};
