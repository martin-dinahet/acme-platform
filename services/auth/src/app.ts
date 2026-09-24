import { authHandler } from "@acme/backend-auth";
import { Hono } from "hono";

// Internal only: the gateway is the sole caller. It sets `x-forwarded-for` to the real client address.
export const app = new Hono().on(["GET", "POST"], "/api/auth/*", (c) => authHandler(c.req.raw));
