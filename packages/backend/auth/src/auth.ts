import { prisma } from "@acme/backend-db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export type AuthConfig = {
  /** Public URL that the browser uses for the API. */
  baseURL: string;
  secret: string;
  trustedOrigins: string[];
};

/**
 * Better Auth on the shared Prisma client. Its models are in `auth.prisma` (Postgres schema `auth`).
 * The adapter uses the root client, not `db()`: Better Auth opens its own transactions.
 */
export const createAuth = ({ baseURL, secret, trustedOrigins }: AuthConfig) =>
  betterAuth({
    baseURL,
    secret,
    trustedOrigins,
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
  });

export type Auth = ReturnType<typeof createAuth>;
