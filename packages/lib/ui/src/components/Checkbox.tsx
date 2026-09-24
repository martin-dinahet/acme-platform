import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";
import { color, font, radius, size, space } from "../tokens.stylex.js";

const styles = stylex.create({
  row: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    fontFamily: font.body,
  },
  root: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18px",
    height: "18px",
    flexShrink: 0,
    borderRadius: radius.sm,
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    backgroundColor: color.bg,
    outline: "none",
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    opacity: { default: 1, ":disabled": 0.5 },
    ":focus-visible": {
      boxShadow: `0 0 0 2px ${color.bg}, 0 0 0 4px ${color.focusRing}`,
    },
  },
  rootChecked: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  indicator: {
    display: "flex",
    color: color.accentText,
  },
  label: {
    fontSize: font.sizeMd,
    color: color.text,
    cursor: "pointer",
  },
});

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M2 6.5L4.5 9L10 3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type CheckboxProps = Omit<
  ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  "className" | "style"
> & {
  label: string;
};

/** A labeled checkbox, built on Base UI's `Checkbox` for a fully accessible hidden-input pattern. */
export const Checkbox = ({ label, id, ...props }: CheckboxProps) => {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <span className={stylex.props(styles.row).className}>
      <BaseCheckbox.Root
        id={checkboxId}
        {...props}
        className={(state) => stylex.props(styles.root, state.checked && styles.rootChecked).className}
      >
        <BaseCheckbox.Indicator className={stylex.props(styles.indicator).className}>
          <CheckIcon />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <label htmlFor={checkboxId} className={stylex.props(styles.label).className}>
        {label}
      </label>
    </span>
  );
};
