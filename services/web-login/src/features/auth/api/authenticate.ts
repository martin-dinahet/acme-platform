import { api } from "../../../lib/api.js";
import type { AuthMode } from "../config/auth-modes.js";

export type Credentials = { email: string; password: string; name: string };

const FALLBACK_ERROR = "Something went wrong. Try again.";

const requests = {
  "sign-in": ({ email, password }: Credentials) => api.auth.signIn.email({ email, password }),
  "sign-up": ({ email, password, name }: Credentials) => api.auth.signUp.email({ email, password, name }),
} satisfies Record<AuthMode, unknown>;

/** Resolves an error message on failure, `null` on success. */
export const authenticate = async (mode: AuthMode, credentials: Credentials): Promise<string | null> => {
  const { error } = await requests[mode](credentials);
  return error ? (error.message ?? FALLBACK_ERROR) : null;
};
