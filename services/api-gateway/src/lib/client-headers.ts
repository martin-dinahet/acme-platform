import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";

/** Request headers with `x-forwarded-for` set to the real peer address, never the client-supplied value. */
export const clientHeaders = (c: Context) => {
  const headers = new Headers(c.req.raw.headers);
  const ip = getConnInfo(c).remote.address;
  if (ip) headers.set("x-forwarded-for", ip);
  else headers.delete("x-forwarded-for");
  return headers;
};
