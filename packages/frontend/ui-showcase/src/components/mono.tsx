import { color, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

// The design system has no monospace token, so the showcase owns this one stack.
const styles = stylex.create({
  inline: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: "12px",
    color: color.text,
    overflowWrap: "anywhere",
  },
  muted: {
    color: color.textMuted,
  },
  block: {
    display: "block",
    margin: 0,
    padding: space.lg,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: "13px",
    lineHeight: 1.6,
    color: color.text,
    backgroundColor: color.bgSubtle,
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.md,
    overflowX: "auto",
    whiteSpace: "pre",
  },
  // Right padding leaves room for a copy button laid over the block.
  flush: {
    borderWidth: 0,
    borderRadius: 0,
    paddingRight: "88px",
  },
});

type MonoProps = { children: ReactNode; muted?: boolean };

/** Inline code: token names, values, prop names. */
export const Mono = ({ children, muted = false }: MonoProps) => (
  <code {...stylex.props(styles.inline, muted && styles.muted)}>{children}</code>
);

type CodeBlockProps = {
  code: string;
  /** Drop the frame, for blocks embedded in another bordered surface. */
  flush?: boolean;
};

/** A read-only code sample. */
export const CodeBlock = ({ code, flush = false }: CodeBlockProps) => (
  <pre {...stylex.props(styles.block, flush && styles.flush)}>
    <code>{code}</code>
  </pre>
);
