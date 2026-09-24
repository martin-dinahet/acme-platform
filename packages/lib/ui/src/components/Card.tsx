import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithoutRef } from "react";
import { color, radius, shadow, size, space } from "../tokens.stylex.js";

const styles = stylex.create({
  base: {
    backgroundColor: color.bg,
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.lg,
    boxShadow: shadow.sm,
    padding: space.xl,
  },
});

export type CardProps = ComponentPropsWithoutRef<"div">;

/** A plain surface for grouping content — the base container the rest of the system sits on. */
export const Card = ({ className, style, ...props }: CardProps) => {
  const styleProps = stylex.props(styles.base);
  return (
    <div
      {...props}
      className={className ? `${styleProps.className} ${className}` : styleProps.className}
      style={{ ...styleProps.style, ...style }}
    />
  );
};
