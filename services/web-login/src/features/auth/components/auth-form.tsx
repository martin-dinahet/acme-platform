import { Button, Callout, TextField } from "@acme/ui";
import { space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { SubmitEvent } from "react";
import type { Credentials } from "../api/authenticate.js";
import { type AuthMode, authModes } from "../config/auth-modes.js";

const styles = stylex.create({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
  },
});

const readCredentials = (form: HTMLFormElement): Credentials => {
  const data = new FormData(form);
  return {
    email: String(data.get("email") ?? ""),
    password: String(data.get("password") ?? ""),
    name: String(data.get("name") ?? ""),
  };
};

type AuthFormProps = {
  mode: AuthMode;
  error: string | null;
  pending: boolean;
  onSubmit: (credentials: Credentials) => void;
};

export const AuthForm = ({ mode, error, pending, onSubmit }: AuthFormProps) => {
  const copy = authModes[mode];

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(readCredentials(event.currentTarget));
  };

  return (
    <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
      {mode === "sign-up" && <TextField label="Name" name="name" autoComplete="name" required />}
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete={copy.passwordAutoComplete}
        required
        minLength={8}
      />

      {error && <Callout tone="danger">{error}</Callout>}

      <Button type="submit" disabled={pending}>
        {pending ? "Please wait…" : copy.submit}
      </Button>
    </form>
  );
};
