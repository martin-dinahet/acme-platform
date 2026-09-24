import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Mono } from "../components/mono.js";
import type { VarValues } from "../lib/css-vars.js";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: space.md,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.bg,
  },
  // Tiles and rows are buttons: a click copies the token path.
  reset: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    font: "inherit",
    color: "inherit",
    textAlign: "left",
    backgroundColor: "transparent",
    cursor: "copy",
    outline: "none",
  },
  tile: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: { default: color.border, ":hover": color.textMuted },
    borderRadius: radius.lg,
    backgroundColor: color.bg,
    transition: "border-color 120ms ease",
    ":focus-visible": {
      boxShadow: `0 0 0 2px ${color.bg}, 0 0 0 4px ${color.focusRing}`,
    },
  },
  tileStage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "112px",
    backgroundColor: color.bgSubtle,
  },
  row: {
    display: "grid",
    gridTemplateColumns: { default: "220px minmax(0, 1fr)", "@media (max-width: 640px)": "minmax(0, 1fr)" },
    alignItems: "center",
    gap: space.lg,
    paddingBlock: space.md,
    paddingInline: space.lg,
    backgroundColor: { default: "transparent", ":hover": color.bgSubtle },
    borderBottomStyle: "solid",
    borderBottomWidth: size.borderWidth,
    borderBottomColor: color.border,
    ":last-child": {
      borderBottomWidth: 0,
    },
    ":focus-visible": {
      boxShadow: `inset 0 0 0 2px ${color.focusRing}`,
    },
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontFamily: font.body,
  },
  tileMeta: {
    paddingBlock: space.sm,
    paddingInline: space.md,
  },
  values: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: space.sm,
  },
  copied: {
    color: color.accent,
    fontSize: "12px",
    fontWeight: font.weightMedium,
  },
});

export const TokenGrid = ({ children }: { children: ReactNode }) => (
  <div {...stylex.props(styles.grid)}>{children}</div>
);

export const TokenList = ({ children }: { children: ReactNode }) => (
  <div {...stylex.props(styles.list)}>{children}</div>
);

type TokenMetaProps = {
  path: string;
  values: VarValues;
  copied: boolean;
};

const TokenMeta = ({ path, values, copied }: TokenMetaProps) => {
  const hasDark = values.dark !== undefined && values.dark !== values.light;
  return (
    <>
      <Mono>{path}</Mono>
      {copied ? (
        <span {...stylex.props(styles.copied)}>Copied</span>
      ) : (
        <span {...stylex.props(styles.values)}>
          {hasDark ? (
            <>
              <Mono muted>☀ {values.light ?? "?"}</Mono>
              <Mono muted>☾ {values.dark}</Mono>
            </>
          ) : (
            <Mono muted>{values.light ?? "…"}</Mono>
          )}
        </span>
      )}
    </>
  );
};

type TokenViewProps = TokenMetaProps & {
  preview: ReactNode;
  onCopy: () => void;
};

/** A token as a tile: preview on top, path and value(s) below. */
export const TokenTile = ({ preview, onCopy, ...meta }: TokenViewProps) => (
  <button
    type="button"
    onClick={onCopy}
    aria-label={`Copy ${meta.path}`}
    {...stylex.props(styles.reset, styles.tile)}
  >
    <span {...stylex.props(styles.tileStage)}>{preview}</span>
    <span {...stylex.props(styles.meta, styles.tileMeta)}>
      <TokenMeta {...meta} />
    </span>
  </button>
);

/** A token as a row: path and value(s) left, a wide preview right. */
export const TokenRow = ({ preview, onCopy, ...meta }: TokenViewProps) => (
  <button
    type="button"
    onClick={onCopy}
    aria-label={`Copy ${meta.path}`}
    {...stylex.props(styles.reset, styles.row)}
  >
    <span {...stylex.props(styles.meta)}>
      <TokenMeta {...meta} />
    </span>
    <span>{preview}</span>
  </button>
);
