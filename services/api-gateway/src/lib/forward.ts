import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { proxy } from "hono/proxy";

export const forward = (c: Context, base: string, path: string, headers: Record<string, string> = {}) => {
  const { search } = new URL(c.req.url);
  return proxy(`${base}${path}${search}`, {
    raw: c.req.raw,
    headers: {
      ...c.req.header(),
      host: undefined,
      "x-forwarded-for": getConnInfo(c).remote.address,
      ...headers,
    },
  });
};
