import { Button, Callout, Card, TextField } from "@acme/ui";
import { color, font, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { type SubmitEvent, useState, useTransition } from "react";
import { authClient } from "../api/client.js";

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
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
  },
  title: {
    fontSize: font.sizeLg,
    fontWeight: font.weightBold,
    color: color.text,
    margin: 0,
  },
});

/** Email/password sign-in and sign-up. Calls `onSuccess` after the user is authenticated. */
export const AuthPage = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const name = String(data.get("name"));

    setError(null);
    startTransition(async () => {
      const { error } = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });
      if (error) setError(error.message ?? "Something went wrong. Try again.");
      else onSuccess();
    });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <main {...stylex.props(styles.page)}>
      <Card {...stylex.props(styles.card)}>
        <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
          <h1 {...stylex.props(styles.title)}>{isSignUp ? "Create an account" : "Sign in"}</h1>
          {isSignUp && <TextField label="Name" name="name" autoComplete="name" required />}
          <TextField label="Email" name="email" type="email" autoComplete="email" required />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            minLength={8}
          />
          {error && <Callout tone="danger">{error}</Callout>}
          <Button type="submit" disabled={pending}>
            {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleMode}>
            {isSignUp ? "Have an account? Sign in" : "No account? Sign up"}
          </Button>
        </form>
      </Card>
    </main>
  );
};
