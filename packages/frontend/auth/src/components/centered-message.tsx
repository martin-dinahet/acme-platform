import { color, font } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

const styles = stylex.create({
  center: {
    display: "flex",
    minHeight: "100dvh",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: font.body,
    color: color.textMuted,
  },
});

/** Full-page status text, for loading and redirect states. */
export const CenteredMessage = ({ children }: { children: ReactNode }) => (
  <div {...stylex.props(styles.center)}>{children}</div>
);
