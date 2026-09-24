import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { env } from "./env.js";

export type GatewayVariables = { userId?: string };

/** Asks the auth service for the session behind the request's cookie. Rejects with 401 if there is none. */
export const requireSession = createMiddleware<{ Variables: GatewayVariables }>(async (c, next) => {
  const res = await fetch(new URL("/api/auth/get-session", env.AUTH_SERVICE_URL), {
    headers: { cookie: c.req.header("cookie") ?? "" },
  });
  if (!res.ok) throw new HTTPException(502, { message: "Auth service unavailable" });

  const session = (await res.json()) as { user: { id: string } } | null;
  if (!session) throw new HTTPException(401, { message: "Unauthorized" });

  c.set("userId", session.user.id);
  await next();
});
