import type { AppEnv } from "@acme/backend-kernel";
import { createMiddleware } from "hono/factory";
import type { Auth } from "./auth.js";

/** Reads the session in-process. Sets `userId`, or returns 401. */
export const createRequireUser = (auth: Auth) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ message: "Unauthorized" }, 401);
    c.set("userId", session.user.id);
    await next();
  });
