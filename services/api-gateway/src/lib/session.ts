import { getJwt } from "@acme/auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { clientHeaders } from "./client-headers.js";

/**
 * Swaps the browser session cookie for a short-lived JWT.
 * Auth package validates the session and signs the token.
 */
export const requireAuth = createMiddleware<{ Variables: { jwt: string } }>(async (c, next) => {
  const jwt = await getJwt(clientHeaders(c));
  if (!jwt) throw new HTTPException(401, { message: "Unauthorized" });

  c.set("jwt", jwt);
  await next();
});
