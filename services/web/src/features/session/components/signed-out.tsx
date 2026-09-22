import { useEffect } from "react";
import { CenteredMessage } from "../../../components/centered-message.js";
import { redirectToLogin } from "../api/session.js";

/** No session: bounce to the standalone login app. */
export const SignedOut = () => {
  useEffect(redirectToLogin, []);
  return <CenteredMessage>Redirecting to sign in…</CenteredMessage>;
};
