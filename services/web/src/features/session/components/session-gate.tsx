import type { ReactNode } from "react";
import { CenteredMessage } from "../../../components/centered-message.js";
import { useSession } from "../api/session.js";
import { SignedOut } from "./signed-out.js";

type SessionUser = { email: string };

type SessionGateProps = {
  children: (user: SessionUser) => ReactNode;
};

/** Renders `children` only for a signed-in user. Otherwise shows loading or redirects to login. */
export const SessionGate = ({ children }: SessionGateProps) => {
  const { data: session, isPending } = useSession();

  if (isPending) return <CenteredMessage>Loading…</CenteredMessage>;
  if (!session) return <SignedOut />;

  return children(session.user);
};
