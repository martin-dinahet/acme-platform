import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithoutRef } from "react";
import { color, font, radius, space } from "../tokens.stylex.js";

const styles = stylex.create({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.sm,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: "1px",
    padding: space.md,
    fontFamily: font.body,
    fontSize: font.sizeSm,
    lineHeight: 1.4,
  },
  danger: {
    backgroundColor: `color-mix(in srgb, ${color.danger} 10%, ${color.bg})`,
    borderColor: `color-mix(in srgb, ${color.danger} 35%, transparent)`,
    color: color.danger,
  },
  info: {
    backgroundColor: color.bgSubtle,
    borderColor: color.border,
    color: color.textMuted,
  },
});

const TONE_STYLES = { danger: styles.danger, info: styles.info };

export type CalloutProps = ComponentPropsWithoutRef<"div"> & {
  tone?: keyof typeof TONE_STYLES;
};

/** An inline status/error message, e.g. a failed request or a form-level validation error. */
export const Callout = ({ tone = "info", role, className, style, ...props }: CalloutProps) => {
  const styleProps = stylex.props(styles.base, TONE_STYLES[tone]);
  return (
    <div
      role={role ?? (tone === "danger" ? "alert" : "status")}
      {...props}
      className={className ? `${styleProps.className} ${className}` : styleProps.className}
      style={{ ...styleProps.style, ...style }}
    />
  );
};
