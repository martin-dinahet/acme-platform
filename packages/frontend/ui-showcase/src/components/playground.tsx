import { Button } from "@acme/ui";
import { color, font, radius, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { useCopy } from "../lib/use-copy.js";
import { CodeBlock } from "./mono.js";

const styles = stylex.create({
  root: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr) 280px", "@media (max-width: 900px)": "minmax(0, 1fr)" },
    overflow: "hidden",
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.bg,
  },
  stage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "220px",
    padding: space.xxl,
    backgroundImage: `radial-gradient(${color.border} 1px, transparent 1px)`,
    backgroundSize: "12px 12px",
  },
  stageInner: {
    width: "100%",
    maxWidth: size.formMaxWidth,
    display: "flex",
    justifyContent: "center",
  },
  stageFill: {
    display: "block",
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
    padding: space.lg,
    backgroundColor: color.bgSubtle,
    borderLeftStyle: { default: "solid", "@media (max-width: 900px)": "none" },
    borderLeftWidth: size.borderWidth,
    borderLeftColor: color.border,
    borderTopStyle: { default: "none", "@media (max-width: 900px)": "solid" },
    borderTopWidth: size.borderWidth,
    borderTopColor: color.border,
  },
  code: {
    gridColumn: "1 / -1",
    position: "relative",
    borderTopStyle: "solid",
    borderTopWidth: size.borderWidth,
    borderTopColor: color.border,
  },
  copy: {
    position: "absolute",
    top: space.sm,
    right: space.sm,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
  },
  // Matches the TextField label, so all controls in the panel read the same.
  fieldLabel: {
    fontFamily: font.body,
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    color: color.text,
  },
});

type PlaygroundProps = {
  preview: ReactNode;
  controls: ReactNode;
  code: string;
  /** Stretch the preview to the form width (fields, callouts, cards). */
  fill?: boolean;
};

/** Live sandbox: edit props on the right, see the component and its JSX update. */
export const Playground = ({ preview, controls, code, fill = false }: PlaygroundProps) => {
  const { copied, copy } = useCopy();

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.stage)}>
        <div {...stylex.props(styles.stageInner, fill && styles.stageFill)}>{preview}</div>
      </div>
      <div {...stylex.props(styles.controls)}>{controls}</div>
      <div {...stylex.props(styles.code)}>
        <CodeBlock code={code} flush />
        <span {...stylex.props(styles.copy)}>
          <Button variant="secondary" size="sm" onClick={() => copy(code)}>
            {copied === code ? "Copied" : "Copy"}
          </Button>
        </span>
      </div>
    </div>
  );
};

/** A labeled row in the playground's control panel. */
export const Control = ({ label, children }: { label: string; children: ReactNode }) => (
  <div {...stylex.props(styles.field)}>
    <span {...stylex.props(styles.fieldLabel)}>{label}</span>
    {children}
  </div>
);
