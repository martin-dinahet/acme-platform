import { Button } from "@acme/ui";
import { color, font, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { signOut } from "../api/session.js";

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

export const UserMenu = ({ email }: { email: string }) => (
  <div {...stylex.props(styles.menu)}>
    <span {...stylex.props(styles.email)}>{email}</span>
    <Button variant="ghost" size="sm" onClick={signOut}>
      Sign out
    </Button>
  </div>
);
