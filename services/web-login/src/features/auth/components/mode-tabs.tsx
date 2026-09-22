import { Button } from "@acme/ui";
import { color, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { type AuthMode, authModeKeys, authModes } from "../config/auth-modes.js";

const styles = stylex.create({
  tabs: {
    display: "flex",
    gap: space.xs,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
    paddingBottom: space.md,
  },
});

type ModeTabsProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

export const ModeTabs = ({ mode, onChange }: ModeTabsProps) => (
  <div {...stylex.props(styles.tabs)}>
    {authModeKeys.map((key) => (
      <Button
        key={key}
        type="button"
        variant={mode === key ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onChange(key)}
      >
        {authModes[key].tab}
      </Button>
    ))}
  </div>
);
