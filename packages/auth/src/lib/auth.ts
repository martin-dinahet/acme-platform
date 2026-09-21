import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import { env } from "./env.js";
import { prisma } from "./prisma.js";

const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.TRUSTED_ORIGINS,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [jwt()],
});

/** Serves the Better Auth routes (`/api/auth/*`). */
export const authHandler = (request: Request): Promise<Response> => auth.handler(request);

/** Swaps a session (cookie headers) for a short-lived JWT. Returns null without a valid session. */
export const getJwt = async (headers: Headers): Promise<string | null> => {
  try {
    const { token } = await auth.api.getToken({ headers });
    return token;
  } catch (error) {
    if (error instanceof Error && "statusCode" in error && error.statusCode === 401) return null;
    throw error;
  }
};
