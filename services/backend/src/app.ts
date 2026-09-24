import { type AuthVariables, authHandler, requireAuth } from "@acme/backend-auth";
import { todosRoutes } from "@acme/backend-todos";
import { Hono } from "hono";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { clientHeaders } from "./lib/client-headers.js";
import { env } from "./lib/env.js";

const PUBLIC = ["/api/auth/*"];

export const app = new Hono<{ Variables: AuthVariables }>() //
  .basePath("/api")
  .use("*", cors({ origin: env.WEB_ORIGINS, credentials: true }))
  .use("*", except(PUBLIC, csrf({ origin: env.WEB_ORIGINS }), requireAuth))
  .on(["GET", "POST"], "/auth/*", (c) => authHandler(new Request(c.req.raw, { headers: clientHeaders(c) })))
  .route("/", todosRoutes);
