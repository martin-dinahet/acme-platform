import { type ReactNode, useEffect } from "react";
import { authClient } from "../api/client.js";
import { CenteredMessage } from "./centered-message.js";

type SessionUser = { email: string };

type SessionGateProps = {
  /** Where signed-out users go. */
  signInUrl: string;
  children: (user: SessionUser) => ReactNode;
};

const Redirect = ({ to }: { to: string }) => {
  useEffect(() => window.location.assign(to), [to]);
  return <CenteredMessage>Redirecting to sign in…</CenteredMessage>;
};

/** Renders `children` only for a signed-in user. Otherwise shows loading or redirects to `signInUrl`. */
export const SessionGate = ({ signInUrl, children }: SessionGateProps) => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <CenteredMessage>Loading…</CenteredMessage>;
  if (!session) return <Redirect to={signInUrl} />;

  return children(session.user);
};
