import { createAuthClient } from "better-auth/react";
import { hc } from "hono/client";
import type { AppType as TodosApp } from "todos-service/app";

/**
 * Typed client for the API gateway. One entry per backend service.
 * Browser only talks to the gateway, so `baseUrl` is the gateway origin.
 */
export const createApiClient = (baseUrl: string) => ({
  auth: createAuthClient({ baseURL: baseUrl, fetchOptions: { credentials: "include" } }),
  todos: hc<TodosApp>(`${baseUrl}/api`, { init: { credentials: "include" } }),
});

export type ApiClient = ReturnType<typeof createApiClient>;
