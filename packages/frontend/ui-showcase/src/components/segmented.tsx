import { color, font, radius, shadow, size, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  group: {
    display: "inline-flex",
    flexWrap: "wrap",
    gap: "2px",
    padding: "2px",
    borderStyle: "solid",
    borderWidth: size.borderWidth,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.bgSubtle,
  },
  option: {
    paddingBlock: space.xs,
    paddingInline: space.md,
    borderWidth: 0,
    borderRadius: radius.sm,
    fontFamily: font.body,
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    color: { default: color.textMuted, ":hover": color.text },
    backgroundColor: "transparent",
    cursor: "pointer",
    outline: "none",
    ":focus-visible": {
      boxShadow: `0 0 0 2px ${color.focusRing}`,
    },
  },
  selected: {
    color: color.text,
    backgroundColor: color.bg,
    boxShadow: shadow.sm,
  },
});

type SegmentedProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

/** A showcase-only picker for enum props. Not part of the design system. */
export const Segmented = <T extends string>({ label, options, value, onChange }: SegmentedProps<T>) => (
  // biome-ignore lint/a11y/useSemanticElements: a fieldset cannot lay out as an inline pill group.
  <div role="group" aria-label={label} {...stylex.props(styles.group)}>
    {options.map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={option === value}
        onClick={() => onChange(option)}
        {...stylex.props(styles.option, option === value && styles.selected)}
      >
        {option}
      </button>
    ))}
  </div>
);
