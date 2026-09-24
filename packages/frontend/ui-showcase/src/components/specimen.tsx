import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { Mono } from "./mono.js";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: space.md,
  },
  specimen: {
    margin: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.bg,
  },
  stage: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "112px",
    padding: space.xl,
    // Dotted canvas: tells the stage apart from the component, in both schemes.
    backgroundImage: `radial-gradient(${color.border} 1px, transparent 1px)`,
    backgroundSize: "12px 12px",
  },
  stageFill: {
    alignItems: "stretch",
    justifyContent: "stretch",
  },
  caption: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    paddingBlock: space.sm,
    paddingInline: space.md,
    borderTopStyle: "solid",
    borderTopWidth: size.borderWidth,
    borderTopColor: color.border,
    fontFamily: font.body,
  },
  title: {
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    color: color.text,
  },
  note: {
    fontSize: "12px",
    color: color.textMuted,
  },
  fill: {
    width: "100%",
  },
});

type SpecimenProps = {
  title: string;
  /** Props that produce this state, printed under the title. */
  code?: string;
  note?: string;
  /** Stretch the child to the stage width (form fields, callouts). */
  fill?: boolean;
  children: ReactNode;
};

/** One labeled state of a component on a neutral canvas. */
export const Specimen = ({ title, code, note, fill = false, children }: SpecimenProps) => (
  <figure {...stylex.props(styles.specimen)}>
    <div {...stylex.props(styles.stage, fill && styles.stageFill)}>
      {fill ? <div {...stylex.props(styles.fill)}>{children}</div> : children}
    </div>
    <figcaption {...stylex.props(styles.caption)}>
      <span {...stylex.props(styles.title)}>{title}</span>
      {code && <Mono muted>{code}</Mono>}
      {note && <span {...stylex.props(styles.note)}>{note}</span>}
    </figcaption>
  </figure>
);

export const SpecimenGrid = ({ children, min }: { children: ReactNode; min?: string }) => (
  <div
    {...stylex.props(styles.grid)}
    style={min ? { gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))` } : undefined}
  >
    {children}
  </div>
);
