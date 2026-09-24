import { Button } from "@acme/ui";
import { color, font, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { authClient } from "../api/client.js";

const styles = stylex.create({
  menu: {
    display: "flex",
    alignItems: "center",
    gap: space.md,
  },
  email: {
    fontSize: font.sizeSm,
    color: color.textMuted,
  },
});

/** Signed-in email and a sign-out button. `SessionGate` redirects once the session ends. */
export const UserMenu = ({ email }: { email: string }) => (
  <div {...stylex.props(styles.menu)}>
    <span {...stylex.props(styles.email)}>{email}</span>
    <Button variant="ghost" size="sm" onClick={() => authClient.signOut()}>
      Sign out
    </Button>
  </div>
);
