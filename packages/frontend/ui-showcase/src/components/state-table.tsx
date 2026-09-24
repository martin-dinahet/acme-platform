import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
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
    borderCollapse: "collapse",
    fontFamily: font.body,
  },
  colHead: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    fontSize: "12px",
    fontWeight: font.weightMedium,
    color: color.textMuted,
    textAlign: "center",
    whiteSpace: "nowrap",
    backgroundColor: color.bgSubtle,
    borderBottomStyle: "solid",
    borderBottomWidth: size.borderWidth,
    borderBottomColor: color.border,
  },
  corner: {
    textAlign: "left",
  },
  rowHead: {
    paddingInline: space.md,
    textAlign: "left",
    fontWeight: "inherit",
    whiteSpace: "nowrap",
  },
  cell: {
    padding: space.lg,
    textAlign: "center",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  row: {
    borderBottomStyle: "solid",
    borderBottomWidth: size.borderWidth,
    borderBottomColor: color.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
});

export type StateRow = { label: string; cells: readonly ReactNode[] };

type StateTableProps = {
  /** Header for the row-label column. */
  corner: string;
  columns: readonly string[];
  rows: readonly StateRow[];
};

/** A matrix of states: one row per variant, one column per state or size. */
export const StateTable = ({ corner, columns, rows }: StateTableProps) => (
  <div {...stylex.props(styles.wrap)}>
    <table {...stylex.props(styles.table)}>
      <thead>
        <tr>
          <th scope="col" {...stylex.props(styles.colHead, styles.corner)}>
            {corner}
          </th>
          {columns.map((column) => (
            <th key={column} scope="col" {...stylex.props(styles.colHead)}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.label} {...stylex.props(styles.row, index === rows.length - 1 && styles.lastRow)}>
            <th scope="row" {...stylex.props(styles.rowHead)}>
              <Mono>{row.label}</Mono>
            </th>
            {row.cells.map((cell, cellIndex) => (
              <td key={columns[cellIndex]} {...stylex.props(styles.cell)}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
