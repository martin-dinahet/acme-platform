import { Hono } from "hono";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { env } from "./lib/env.js";
import { forward } from "./lib/forward.js";
import { type GatewayVariables, requireSession } from "./lib/session.js";

const PUBLIC = ["/api/auth/*"];

const toAuth = forward(env.AUTH_SERVICE_URL);
const toTodos = forward(env.TODOS_SERVICE_URL);
const toRoutines = forward(env.ROUTINES_SERVICE_URL);

/** The only public entry point. Routes by path prefix; the services' `/internal/*` routes are never reachable. */
export const app = new Hono<{ Variables: GatewayVariables }>() //
  .basePath("/api")
  .use("*", cors({ origin: env.WEB_ORIGINS, credentials: true }))
  .use("*", except(PUBLIC, csrf({ origin: env.WEB_ORIGINS }), requireSession))
  .on(["GET", "POST"], "/auth/*", toAuth)
  .all("/todos", toTodos)
  .all("/todos/*", toTodos)
  .all("/routines", toRoutines)
  .all("/routines/*", toRoutines);
