import { Card } from "@acme/ui";
import { color, font, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { type AuthMode, authModes } from "../config/auth-modes.js";
import { useAuthenticate } from "../hooks/use-authenticate.js";
import { AuthForm } from "./auth-form.js";
import { ModeTabs } from "./mode-tabs.js";

const styles = stylex.create({
  page: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.bgSubtle,
    fontFamily: font.body,
    padding: space.lg,
  },
  card: {
    width: "100%",
    maxWidth: "360px",
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
  },
  title: {
    fontSize: font.sizeLg,
    fontWeight: font.weightBold,
    color: color.text,
    margin: 0,
  },
});

type AuthPageProps = {
  onSuccess: () => void;
};

/** Email/password sign-in and sign-up. Calls `onSuccess` after the user is authenticated. */
export const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const { error, pending, submit, clearError } = useAuthenticate(onSuccess);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    clearError();
  };

  return (
    <main {...stylex.props(styles.page)}>
      <Card {...stylex.props(styles.card)}>
        <h1 {...stylex.props(styles.title)}>{authModes[mode].title}</h1>
        <ModeTabs mode={mode} onChange={switchMode} />
        <AuthForm
          mode={mode}
          error={error}
          pending={pending}
          onSubmit={(credentials) => submit(mode, credentials)}
        />
      </Card>
    </main>
  );
};
