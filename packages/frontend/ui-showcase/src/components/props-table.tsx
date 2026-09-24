import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Mono } from "./mono.js";

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
    minWidth: "560px",
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
    borderBottomStyle: "solid",
    borderBottomWidth: size.borderWidth,
    borderBottomColor: color.border,
  },
  td: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    verticalAlign: "top",
    lineHeight: 1.5,
    borderBottomStyle: "solid",
    borderBottomWidth: size.borderWidth,
    borderBottomColor: color.border,
  },
  nowrap: {
    whiteSpace: "nowrap",
  },
  last: {
    borderBottomWidth: 0,
  },
  description: {
    color: color.textMuted,
  },
});

export type PropDoc = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const PropsTable = ({ rows }: { rows: readonly PropDoc[] }) => (
  <div {...stylex.props(styles.wrap)}>
    <table {...stylex.props(styles.table)}>
      <thead>
        <tr>
          <th {...stylex.props(styles.th)}>Prop</th>
          <th {...stylex.props(styles.th)}>Type</th>
          <th {...stylex.props(styles.th)}>Default</th>
          <th {...stylex.props(styles.th)}>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const cell = stylex.props(styles.td, index === rows.length - 1 && styles.last);
          return (
            <tr key={row.name}>
              <td {...cell}>
                <Mono>{row.name}</Mono>
              </td>
              <td {...cell}>
                <Mono muted>{row.type}</Mono>
              </td>
              <td {...stylex.props(styles.td, styles.nowrap, index === rows.length - 1 && styles.last)}>
                {row.default ? <Mono>{row.default}</Mono> : <Mono muted>—</Mono>}
              </td>
              <td {...stylex.props(styles.td, styles.description, index === rows.length - 1 && styles.last)}>
                {row.description}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
