import { color, font, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

const styles = stylex.create({
  page: {
    minHeight: "100dvh",
    backgroundColor: color.bgSubtle,
    fontFamily: font.body,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: space.lg,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
    backgroundColor: color.bg,
  },
  title: {
    fontSize: font.sizeLg,
    fontWeight: font.weightBold,
    color: color.text,
    margin: 0,
  },
  main: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: space.xl,
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
  },
});

type AppShellProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

/** Page frame: header with title and actions, then centered content. */
export const AppShell = ({ title, actions, children }: AppShellProps) => (
  <div {...stylex.props(styles.page)}>
    <header {...stylex.props(styles.header)}>
      <h1 {...stylex.props(styles.title)}>{title}</h1>
      {actions}
    </header>
    <main {...stylex.props(styles.main)}>{children}</main>
  </div>
);
