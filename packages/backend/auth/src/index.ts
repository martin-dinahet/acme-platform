import { type AuthConfig, createAuth } from "./auth.js";
import { createRequireUser } from "./require-user.js";

export type { AuthConfig } from "./auth.js";

/** Public factory. Only a composition root (`services/*`) calls it (R2). */
export const createAuthModule = (config: AuthConfig) => {
  const auth = createAuth(config);
  return {
    /** Serves `/api/auth/*`. */
    handler: (request: Request) => auth.handler(request),
    requireUser: createRequireUser(auth),
  };
};

export type AuthModule = ReturnType<typeof createAuthModule>;
