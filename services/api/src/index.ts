import { hostname } from "node:os";
import { createApp } from "./app.js";
import { createContainer } from "./container.js";
import { env } from "./lib/env.js";

// No migration here: the `migrate` one-shot does it, so N replicas do not race.
const container = createContainer({
  auth: { baseURL: env.BETTER_AUTH_URL, secret: env.BETTER_AUTH_SECRET, trustedOrigins: env.WEB_ORIGINS },
});
const app = createApp(container, { webOrigins: env.WEB_ORIGINS, hostname: hostname() });

console.log(JSON.stringify({ msg: "api listening", port: env.PORT, host: hostname() }));

export default { port: env.PORT, fetch: app.fetch };
