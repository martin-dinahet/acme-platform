import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "./env.js";
import { prisma } from "./prisma.js";

const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.TRUSTED_ORIGINS,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
});

/** Serves the Better Auth routes (`/api/auth/*`), including `get-session` used by the gateway. */
export const authHandler = (request: Request): Promise<Response> => auth.handler(request);
