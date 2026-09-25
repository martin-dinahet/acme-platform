import { prisma, resetDatabase } from "@acme/backend-db/testing";
import type { AppEnv } from "@acme/backend-kernel";
import { beforeEach, expect, test } from "bun:test";
import { Hono } from "hono";
import { createAuthModule } from "./index.js";

const BASE = "http://localhost:3000";
const auth = createAuthModule({ baseURL: BASE, secret: "test-secret-0123456789-0123456789-abc", trustedOrigins: [] });
const app = new Hono<AppEnv>()
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .get("/me", auth.requireUser, (c) => c.json({ userId: c.var.userId }));

const signUp = async (email: string) => {
  const res = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ email, password: "password123", name: "Test" }),
  });
  expect(res.status).toBe(200);
  return res.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
};

beforeEach(resetDatabase);

test("sign-up writes the user into the `auth` Postgres schema", async () => {
  await signUp("a@example.com");
  const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`SELECT count(*) FROM auth."user"`;
  expect(count).toBe(1n);
  const inPublic = await prisma.$queryRaw<{ n: number }[]>`
    SELECT 1 AS n FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user'`;
  expect(inPublic).toHaveLength(0);
});

test("requireUser sets userId from the session cookie", async () => {
  const cookie = await signUp("a@example.com");
  const res = await app.request("/me", { headers: { cookie } });
  expect(res.status).toBe(200);
  const { userId } = (await res.json()) as { userId: string };
  expect(await prisma.user.findUnique({ where: { id: userId } })).not.toBeNull();
});

test("requireUser returns 401 without a session", async () => {
  expect((await app.request("/me")).status).toBe(401);
  expect((await app.request("/me", { headers: { cookie: "better-auth.session_token=bad" } })).status).toBe(401);
});
