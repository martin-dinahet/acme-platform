import type { AppEnv } from "@acme/backend-kernel";
import { Hono } from "hono";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import type { Container } from "./container.js";

const PUBLIC = ["/api/auth/*"];

type AppOptions = { webOrigins: string[]; hostname: string };

/** HTTP app: CORS, CSRF, auth routes, `requireUser`, module routes. */
export const createApp = ({ auth, todos, routines }: Container, { webOrigins, hostname }: AppOptions) => {
  const api = new Hono<AppEnv>()
    .use("*", cors({ origin: webOrigins, credentials: true }))
    .use("*", except(PUBLIC, csrf({ origin: webOrigins }), auth.requireUser))
    .on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
    .route("/", todos.routes)
    .route("/", routines.routes);

  const app = new Hono()
    .use("*", async (c, next) => {
      await next();
      // Shows which replica served the request (load balancing check).
      c.header("x-served-by", hostname);
    })
    .get("/health", (c) => c.json({ status: "ok", host: hostname }, 200))
    .route("/api", api);

  app.onError((error, c) => {
    console.error(JSON.stringify({ msg: "unhandled error", path: c.req.path, error: String(error) }));
    return c.json({ message: "Internal server error" }, 500);
  });

  return app;
};

/** One type for the whole HTTP API. The frontend uses the per-module route types instead (see report). */
export type AppType = ReturnType<typeof createApp>;
