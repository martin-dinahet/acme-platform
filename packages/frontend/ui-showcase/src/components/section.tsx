import { color, font, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

const styles = stylex.create({
  section: {
    display: "flex",
    flexDirection: "column",
    gap: space.xl,
    paddingBlock: space.xxl,
    scrollMarginTop: "72px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
  },
  eyebrow: {
    margin: 0,
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    color: color.accent,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: font.weightBold,
    color: color.text,
    letterSpacing: "-0.01em",
  },
  description: {
    margin: 0,
    maxWidth: "64ch",
    fontSize: font.sizeMd,
    lineHeight: 1.6,
    color: color.textMuted,
  },
  subsection: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
  },
  subsectionTitle: {
    margin: 0,
    fontSize: font.sizeMd,
    fontWeight: font.weightBold,
    color: color.text,
  },
  subsectionHint: {
    margin: 0,
    fontSize: font.sizeSm,
    color: color.textMuted,
  },
});

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

/** One page of the showcase: a token group or a component. The `id` is its anchor in the sidebar. */
export const Section = ({ id, eyebrow, title, description, children }: SectionProps) => (
  <section id={id} aria-labelledby={`${id}-title`} {...stylex.props(styles.section)}>
    <header {...stylex.props(styles.header)}>
      <p {...stylex.props(styles.eyebrow)}>{eyebrow}</p>
      <h2 id={`${id}-title`} {...stylex.props(styles.title)}>
        {title}
      </h2>
      {description && <p {...stylex.props(styles.description)}>{description}</p>}
    </header>
    {children}
  </section>
);

type SubsectionProps = {
  title: string;
  hint?: ReactNode;
  children: ReactNode;
};

export const Subsection = ({ title, hint, children }: SubsectionProps) => (
  <div {...stylex.props(styles.subsection)}>
    <div>
      <h3 {...stylex.props(styles.subsectionTitle)}>{title}</h3>
      {hint && <p {...stylex.props(styles.subsectionHint)}>{hint}</p>}
    </div>
    {children}
  </div>
);
