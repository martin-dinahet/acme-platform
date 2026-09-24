import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { proxy } from "hono/proxy";
import type { GatewayVariables } from "./session.js";

/**
 * Proxies the request to `base` with the path unchanged.
 * Downstream services trust `x-forwarded-for` and `x-user-id`, so the client-supplied values are never passed on.
 */
export const forward = (base: string) => (c: Context<{ Variables: GatewayVariables }>) => {
  const { pathname, search } = new URL(c.req.url);
  const headers = new Headers(c.req.raw.headers);
  headers.delete("host");

  const ip = getConnInfo(c).remote.address;
  if (ip) headers.set("x-forwarded-for", ip);
  else headers.delete("x-forwarded-for");

  const userId = c.get("userId");
  if (userId) headers.set("x-user-id", userId);
  else headers.delete("x-user-id");

  return proxy(new URL(pathname + search, base), { raw: c.req.raw, headers });
};
