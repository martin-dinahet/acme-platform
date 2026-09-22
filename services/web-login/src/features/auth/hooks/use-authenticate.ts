import { useState, useTransition } from "react";
import { authenticate, type Credentials } from "../api/authenticate.js";
import type { AuthMode } from "../config/auth-modes.js";

/** Runs an auth request, tracks its pending and error state, and calls `onSuccess` when it passes. */
export const useAuthenticate = (onSuccess: () => void) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (mode: AuthMode, credentials: Credentials) => {
    setError(null);
    startTransition(async () => {
      const message = await authenticate(mode, credentials);
      if (message) {
        setError(message);
        return;
      }
      onSuccess();
    });
  };

  const clearError = () => setError(null);

  return { error, pending, submit, clearError };
};
