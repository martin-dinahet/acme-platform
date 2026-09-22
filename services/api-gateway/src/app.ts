import { authHandler } from "@acme/auth";
import { Hono } from "hono";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { clientHeaders } from "./lib/client-headers.js";
import { env } from "./lib/env.js";
import { forward } from "./lib/forward.js";
import { requireAuth } from "./lib/session.js";

const PUBLIC = ["/api/auth/*"];

export const app = new Hono<{ Variables: { jwt: string } }>() //
  .basePath("/api")
  .use("*", cors({ origin: env.WEB_ORIGINS, credentials: true }))
  .use("*", except(PUBLIC, csrf({ origin: env.WEB_ORIGINS }), requireAuth))
  .on(["GET", "POST"], "/auth/*", (c) => authHandler(new Request(c.req.raw, { headers: clientHeaders(c) })))
  .all("/todos/*", (c) =>
    forward(c, env.TODOS_URL, c.req.path.replace(/^\/api/, ""), {
      authorization: `Bearer ${c.get("jwt")}`,
    }),
  );
