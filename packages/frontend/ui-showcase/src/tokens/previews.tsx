import { color, font, radius, size } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { VarValues } from "../lib/css-vars.js";
import type { Token } from "../lib/tokens.js";

// Each preview applies the token itself through an inline style (`token.ref` is a `var(--…)`),
// so what you see is the real compiled value.

const styles = stylex.create({
  swatch: {
    width: "100%",
    height: "100%",
  },
  bar: {
    display: "block",
    height: "12px",
    maxWidth: "100%",
    borderRadius: "3px",
    backgroundColor: color.accent,
  },
  outlineBar: {
    display: "block",
    height: "28px",
    maxWidth: "100%",
    borderStyle: "dashed",
    borderWidth: size.borderWidth,
    borderColor: color.accent,
    borderRadius: "3px",
    backgroundColor: `color-mix(in srgb, ${color.accent} 10%, transparent)`,
  },
  border: {
    display: "block",
    width: "96px",
    height: "40px",
    borderStyle: "solid",
    borderColor: color.text,
    borderRadius: radius.sm,
  },
  radius: {
    display: "block",
    width: "72px",
    height: "72px",
    borderStyle: "solid",
    borderWidth: "2px",
    borderColor: color.accent,
    backgroundColor: `color-mix(in srgb, ${color.accent} 12%, transparent)`,
  },
  shadow: {
    display: "block",
    width: "112px",
    height: "64px",
    borderRadius: radius.md,
    backgroundColor: color.bg,
  },
  sample: {
    display: "block",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    color: color.text,
    fontFamily: font.body,
    fontSize: font.sizeMd,
  },
  familySample: {
    fontSize: font.sizeLg,
  },
});

type PreviewProps = { token: Token; values: VarValues };

/** Light value on the upper-left half, dark value on the lower-right half. */
export const ColorPreview = ({ values }: PreviewProps) => {
  const light = values.light ?? "transparent";
  const dark = values.dark ?? light;
  return (
    <span
      {...stylex.props(styles.swatch)}
      style={{ background: `linear-gradient(135deg, ${light} 0 50%, ${dark} 50% 100%)` }}
    />
  );
};

export const SpacePreview = ({ token }: PreviewProps) => (
  <span {...stylex.props(styles.bar)} style={{ width: token.ref }} />
);

export const SizePreview = ({ token }: PreviewProps) =>
  /border/i.test(token.key) ? (
    <span {...stylex.props(styles.border)} style={{ borderWidth: token.ref }} />
  ) : (
    <span {...stylex.props(styles.outlineBar)} style={{ width: token.ref }} />
  );

export const RadiusPreview = ({ token }: PreviewProps) => (
  <span {...stylex.props(styles.radius)} style={{ borderRadius: token.ref }} />
);

export const ShadowPreview = ({ token }: PreviewProps) => (
  <span {...stylex.props(styles.shadow)} style={{ boxShadow: token.ref }} />
);

const PANGRAM = "The quick brown fox jumps over the lazy dog";

/** `font` mixes three kinds of token; the key prefix tells which CSS property to preview. */
export const FontPreview = ({ token }: PreviewProps) => {
  if (token.key.startsWith("size")) {
    return (
      <span {...stylex.props(styles.sample)} style={{ fontSize: token.ref }}>
        {PANGRAM}
      </span>
    );
  }
  if (token.key.startsWith("weight")) {
    return (
      <span {...stylex.props(styles.sample)} style={{ fontWeight: token.ref }}>
        {PANGRAM}
      </span>
    );
  }
  return (
    <span {...stylex.props(styles.sample, styles.familySample)} style={{ fontFamily: token.ref }}>
      Aa Bb Cc 0123 — {PANGRAM}
    </span>
  );
};
