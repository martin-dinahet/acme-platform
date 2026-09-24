import { Button, Callout, Card, Checkbox, TextField } from "@acme/ui";
import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { type FormEvent, useState } from "react";
import { SchemeScope } from "../components/scheme-scope.js";
import { Section } from "../components/section.js";

const styles = stylex.create({
  pair: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    overflow: "hidden",
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.lg,
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space.lg,
    height: "100%",
    padding: space.xl,
  },
  panelLabel: {
    alignSelf: "flex-start",
    fontFamily: font.body,
    fontSize: "12px",
    fontWeight: font.weightMedium,
    color: color.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  card: {
    width: "100%",
    maxWidth: size.formMaxWidth,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
  },
  heading: {
    margin: 0,
    fontFamily: font.body,
    fontSize: font.sizeLg,
    fontWeight: font.weightBold,
    color: color.text,
  },
  actions: {
    display: "flex",
    gap: space.sm,
  },
  grow: {
    flexGrow: 1,
  },
});

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** A real sign-in form: every component, wired together, with working validation. */
const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  const emailError = submitted && !EMAIL.test(email) ? "Enter a valid email address." : undefined;
  const passwordError = submitted && password.length < 8 ? "Use 8 characters or more." : undefined;
  const hasErrors = Boolean(emailError || passwordError);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setDone(EMAIL.test(email) && password.length >= 8);
  };

  const reset = () => {
    setEmail("");
    setPassword("");
    setSubmitted(false);
    setDone(false);
  };

  return (
    <Card {...stylex.props(styles.card)}>
      <form noValidate onSubmit={onSubmit} {...stylex.props(styles.form)}>
        <h3 {...stylex.props(styles.heading)}>Sign in</h3>
        {hasErrors && <Callout tone="danger">Fix the fields below, then try again.</Callout>}
        {done && <Callout tone="info">Signed in as {email}. (Nothing was sent.)</Callout>}
        <TextField
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          errorMessage={emailError}
        />
        <TextField
          label="Password"
          type="password"
          description="8 characters or more."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errorMessage={passwordError}
        />
        <Checkbox label="Keep me signed in" defaultChecked />
        <div {...stylex.props(styles.actions)}>
          <Button type="submit" {...stylex.props(styles.grow)}>
            Sign in
          </Button>
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
};

export const SandboxSection = () => (
  <Section
    id="sandbox"
    eyebrow="Sandbox"
    title="Composition"
    description="All components in one working form, in both color schemes at once. Submit it empty to see the error states."
  >
    <div {...stylex.props(styles.pair)}>
      {(["light", "dark"] as const).map((mode) => (
        <SchemeScope key={mode} mode={mode}>
          <div {...stylex.props(styles.panel)}>
            <span {...stylex.props(styles.panelLabel)}>{mode}</span>
            <SignInForm />
          </div>
        </SchemeScope>
      ))}
    </div>
  </Section>
);
