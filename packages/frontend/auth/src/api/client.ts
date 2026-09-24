import { API_URL } from "@acme/env/web";
import { createAuthClient } from "better-auth/react";

/** better-auth client for `@acme/backend-auth`. */
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: "include" },
});
