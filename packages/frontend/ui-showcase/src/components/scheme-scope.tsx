import { color, font } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { type ThemeMode, useSchemeStyle } from "../lib/theme.js";

const styles = stylex.create({
  scope: {
    backgroundColor: color.bgSubtle,
    color: color.text,
    fontFamily: font.body,
  },
});

type SchemeScopeProps = {
  mode: ThemeMode;
  children: ReactNode;
};

/** Renders its children in a forced color scheme, whatever the OS preference. */
export const SchemeScope = ({ mode, children }: SchemeScopeProps) => {
  const schemeStyle = useSchemeStyle(mode);
  const styleProps = stylex.props(styles.scope);
  return (
    <div className={styleProps.className} style={{ ...styleProps.style, ...schemeStyle }}>
      {children}
    </div>
  );
};
