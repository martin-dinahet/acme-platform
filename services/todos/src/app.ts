import { todosInternalRoutes, todosRoutes } from "@acme/backend-todos";
import { Hono } from "hono";

// `/api` is proxied by the gateway. `/internal` is for other services only; the gateway never routes to it.
export const app = new Hono() //
  .route("/api", todosRoutes)
  .route("/internal", todosInternalRoutes);
