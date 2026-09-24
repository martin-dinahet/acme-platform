import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithoutRef } from "react";
import { color, font, radius, size, space } from "../tokens.stylex.js";

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    fontFamily: font.body,
    fontWeight: font.weightMedium,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    outline: "none",
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    opacity: { default: 1, ":disabled": 0.5 },
    transition: "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
    ":focus-visible": {
      boxShadow: `0 0 0 2px ${color.bg}, 0 0 0 4px ${color.focusRing}`,
    },
  },
  sizeSm: {
    paddingBlock: space.xs,
    paddingInline: space.md,
    fontSize: font.sizeSm,
  },
  sizeMd: {
    paddingBlock: space.sm,
    paddingInline: space.lg,
    fontSize: font.sizeMd,
  },
  primary: {
    backgroundColor: color.accent,
    borderColor: color.accent,
    color: color.accentText,
  },
  secondary: {
    backgroundColor: { default: color.bg, ":hover": color.bgSubtle },
    borderColor: color.border,
    color: color.text,
  },
  danger: {
    backgroundColor: color.danger,
    borderColor: color.danger,
    color: color.dangerText,
  },
  ghost: {
    backgroundColor: { default: "transparent", ":hover": color.bgSubtle },
    borderColor: "transparent",
    color: color.text,
  },
});

const VARIANT_STYLES = {
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
  ghost: styles.ghost,
};
const SIZE_STYLES = { sm: styles.sizeSm, md: styles.sizeMd };

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof VARIANT_STYLES;
  size?: keyof typeof SIZE_STYLES;
};

/** A styled, native `<button>`. No headless primitive needed — the native element is already accessible. */
export const Button = ({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  style,
  ...props
}: ButtonProps) => {
  const styleProps = stylex.props(styles.base, SIZE_STYLES[size], VARIANT_STYLES[variant]);
  return (
    <button
      type={type}
      {...props}
      className={className ? `${styleProps.className} ${className}` : styleProps.className}
      style={{ ...styleProps.style, ...style }}
    />
  );
};
