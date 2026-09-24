import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { CodeBlock } from "../components/mono.js";
import { Section } from "../components/section.js";
import { COMPONENT_DEMOS } from "../demos/registry.js";
import { tokensOf } from "../lib/tokens.js";
import { TOKEN_GROUPS } from "../tokens/registry.js";

const styles = stylex.create({
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: space.md,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    padding: space.lg,
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.bg,
    fontFamily: font.body,
  },
  statValue: {
    fontSize: "32px",
    fontWeight: font.weightBold,
    color: color.text,
    fontVariantNumeric: "tabular-nums",
  },
  statLabel: {
    fontSize: font.sizeSm,
    color: color.textMuted,
  },
});

const IMPORT_EXAMPLE = `import { Button, TextField } from "@acme/ui";
// Tokens must come from the .stylex entry, or StyleX cannot compile them.
import { color, space } from "@acme/ui/tokens.stylex";

const styles = stylex.create({
  toolbar: { gap: space.sm, backgroundColor: color.bgSubtle },
});`;

export const Overview = () => {
  const groups = Object.values(TOKEN_GROUPS);
  const tokenCount = groups.reduce((sum, def) => sum + tokensOf(def.group).length, 0);
  const stats = [
    { value: Object.keys(COMPONENT_DEMOS).length, label: "Components" },
    { value: tokenCount, label: "Tokens" },
    { value: groups.length, label: "Token groups" },
    { value: 2, label: "Color schemes" },
  ];

  return (
    <Section
      id="overview"
      eyebrow="@acme/ui"
      title="Acme design system"
      description="Every token, component and state of @acme/ui, rendered live from the package source. Use the theme switch at the top to force light or dark."
    >
      <div {...stylex.props(styles.stats)}>
        {stats.map((stat) => (
          <div key={stat.label} {...stylex.props(styles.stat)}>
            <span {...stylex.props(styles.statValue)}>{stat.value}</span>
            <span {...stylex.props(styles.statLabel)}>{stat.label}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={IMPORT_EXAMPLE} />
    </Section>
  );
};
