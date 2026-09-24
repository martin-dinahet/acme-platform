import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { env } from "./env.js";
import { prisma } from "./prisma.js";

const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.TRUSTED_ORIGINS,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
});

export type AuthVariables = { user: typeof auth.$Infer.Session.user };

/** Serves the Better Auth routes (`/api/auth/*`). */
export const authHandler = (request: Request): Promise<Response> => auth.handler(request);

/** Rejects requests without a valid session cookie. Sets `user` on the context. */
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) throw new HTTPException(401, { message: "Unauthorized" });

  c.set("user", session.user);
  await next();
});
