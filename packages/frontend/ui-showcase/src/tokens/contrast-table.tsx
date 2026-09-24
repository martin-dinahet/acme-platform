import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Mono } from "../components/mono.js";
import { Subsection } from "../components/section.js";
import { type ContrastGrade, contrastRatio, gradeOf } from "../lib/contrast.js";
import { useTheme } from "../lib/theme.js";
import { tokensOf, valuesOf } from "../lib/tokens.js";

// StyleX's var-group type also carries symbol keys. Keep the string ones, so typos still fail typecheck.
type ColorKey = Extract<keyof typeof color, string>;

/** Foreground/background pairs the components actually use. */
const PAIRS: readonly { fg: ColorKey; bg: ColorKey; use: string }[] = [
  { fg: "text", bg: "bg", use: "Body text" },
  { fg: "text", bg: "bgSubtle", use: "Text on subtle surfaces" },
  { fg: "textMuted", bg: "bg", use: "Descriptions, captions" },
  { fg: "textMuted", bg: "bgSubtle", use: "Info callout" },
  { fg: "accentText", bg: "accent", use: "Primary button, checked checkbox" },
  { fg: "dangerText", bg: "danger", use: "Danger button" },
  { fg: "danger", bg: "bg", use: "Field error text" },
  { fg: "accent", bg: "bg", use: "Accent text" },
  { fg: "focusRing", bg: "bg", use: "Focus ring (non-text, needs 3:1)" },
];

const styles = stylex.create({
  wrap: {
    overflowX: "auto",
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.bg,
  },
  table: {
    width: "100%",
    minWidth: "620px",
    borderCollapse: "collapse",
    fontFamily: font.body,
    fontSize: font.sizeSm,
    color: color.text,
  },
  th: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    textAlign: "left",
    fontSize: "12px",
    fontWeight: font.weightMedium,
    color: color.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    backgroundColor: color.bgSubtle,
  },
  td: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    verticalAlign: "middle",
    borderTopStyle: "solid",
    borderTopWidth: size.borderWidth,
    borderTopColor: color.border,
  },
  pair: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  use: {
    color: color.textMuted,
    fontSize: "12px",
  },
  result: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "28px",
    borderRadius: radius.sm,
    fontWeight: font.weightBold,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color.border} 60%, transparent)`,
  },
  ratio: {
    minWidth: "44px",
    fontVariantNumeric: "tabular-nums",
  },
  grade: {
    paddingBlock: "1px",
    paddingInline: space.sm,
    borderRadius: radius.full,
    fontSize: "11px",
    fontWeight: font.weightBold,
    whiteSpace: "nowrap",
  },
  pass: {
    color: color.accent,
    backgroundColor: `color-mix(in srgb, ${color.accent} 14%, transparent)`,
  },
  large: {
    color: color.textMuted,
    backgroundColor: color.bgSubtle,
  },
  fail: {
    color: color.danger,
    backgroundColor: `color-mix(in srgb, ${color.danger} 14%, transparent)`,
  },
});

const GRADE_STYLES: Record<ContrastGrade, stylex.StyleXStyles> = {
  AAA: styles.pass,
  AA: styles.pass,
  "AA large": styles.large,
  Fail: styles.fail,
};

const Result = ({ fg, bg }: { fg?: string; bg?: string }) => {
  const ratio = fg && bg ? contrastRatio(fg, bg) : null;
  if (!fg || !bg || ratio === null) return <Mono muted>n/a</Mono>;
  const grade = gradeOf(ratio);
  return (
    <span {...stylex.props(styles.result)}>
      <span {...stylex.props(styles.chip)} style={{ color: fg, backgroundColor: bg }} aria-hidden="true">
        Aa
      </span>
      <span {...stylex.props(styles.ratio)}>{ratio.toFixed(2)}</span>
      <span {...stylex.props(styles.grade, GRADE_STYLES[grade])}>{grade}</span>
    </span>
  );
};

/** WCAG contrast of each real color pairing, in both schemes. */
export const ContrastSection = () => (
  <Subsection title="Contrast" hint="WCAG 2 ratio of each color pair the components use.">
    <ContrastTable />
  </Subsection>
);

const ContrastTable = () => {
  const { vars } = useTheme();
  const tokens = new Map(tokensOf(color).map((token) => [token.key, valuesOf(vars, token)]));

  return (
    <div {...stylex.props(styles.wrap)}>
      <table {...stylex.props(styles.table)}>
        <thead>
          <tr>
            <th {...stylex.props(styles.th)}>Pair</th>
            <th {...stylex.props(styles.th)}>Light</th>
            <th {...stylex.props(styles.th)}>Dark</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map(({ fg, bg, use }) => {
            const fgValues = tokens.get(fg) ?? {};
            const bgValues = tokens.get(bg) ?? {};
            return (
              <tr key={`${fg}/${bg}`}>
                <td {...stylex.props(styles.td)}>
                  <span {...stylex.props(styles.pair)}>
                    <Mono>
                      {fg} on {bg}
                    </Mono>
                    <span {...stylex.props(styles.use)}>{use}</span>
                  </span>
                </td>
                <td {...stylex.props(styles.td)}>
                  <Result fg={fgValues.light} bg={bgValues.light} />
                </td>
                <td {...stylex.props(styles.td)}>
                  <Result fg={fgValues.dark ?? fgValues.light} bg={bgValues.dark ?? bgValues.light} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
