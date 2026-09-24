import type { TodosApp } from "@acme/backend-todos";
import { API_URL } from "@acme/env/web";
import type { InferResponseType } from "hono/client";
import { hc } from "hono/client";

/** Typed client for `@acme/backend-todos`. */
export const todosClient = hc<TodosApp>(`${API_URL}/api`, { init: { credentials: "include" } });

/** A todo as the backend returns it over the wire (Prisma `Date` fields become ISO strings). */
export type Todo = InferResponseType<typeof todosClient.todos.$get, 200>["todos"][number];
