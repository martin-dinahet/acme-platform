import { resetDatabase } from "@acme/backend-db/testing";
import { describeTodosPortContract } from "@acme/backend-routines/testing";
import { afterAll } from "bun:test";
import { createApp } from "../app.js";
import { createContainer } from "../container.js";
import { createHttpTodosPort } from "./todos-port.http.js";

// Test 7 against the HTTP adapter and a running api (real HTTP server on a random port).

const WEB = "http://localhost:5173";
const app = createApp(
  createContainer({
    auth: { baseURL: "http://localhost:3000", secret: "test-secret-0123456789-0123456789-abc", trustedOrigins: [WEB] },
  }),
  { webOrigins: [WEB], hostname: "contract" },
);
const server = Bun.serve({ port: 0, fetch: app.fetch });
afterAll(() => server.stop(true));

const base = `http://localhost:${server.port}/api`;

/** Signs up a user over HTTP. Returns the user ID and the session cookie. */
const signUp = async (email: string) => {
  const res = await fetch(`${base}/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: WEB },
    body: JSON.stringify({ email, password: "password123", name: email }),
  });
  if (!res.ok) throw new Error(`sign-up failed: ${res.status}`);
  const { user } = (await res.json()) as { user: { id: string } };
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return { id: user.id, cookie };
};

describeTodosPortContract("HTTP adapter (running api)", async () => {
  await resetDatabase();
  const alice = await signUp("alice@example.com");
  const bob = await signUp("bob@example.com");
  const cookies = new Map([
    [alice.id, alice.cookie],
    [bob.id, bob.cookie],
  ]);
  return {
    port: createHttpTodosPort({
      baseUrl: base,
      headersFor: (ownerId) => ({ cookie: cookies.get(ownerId) ?? "", origin: WEB }),
    }),
    owners: [alice.id, bob.id],
  };
});
