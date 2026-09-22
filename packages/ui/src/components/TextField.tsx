import { Field } from "@base-ui/react/field";
import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";
import { color, font, radius, space } from "../tokens.stylex.js";

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    fontFamily: font.body,
  },
  label: {
    fontSize: font.sizeSm,
    fontWeight: font.weightMedium,
    color: color.text,
  },
  control: {
    fontFamily: font.body,
    fontSize: font.sizeMd,
    color: color.text,
    backgroundColor: color.bg,
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: color.border,
    borderRadius: radius.md,
    paddingBlock: space.sm,
    paddingInline: space.md,
    outline: "none",
    transition: "border-color 120ms ease, box-shadow 120ms ease",
  },
  controlFocused: {
    borderColor: color.focusRing,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${color.focusRing} 25%, transparent)`,
  },
  controlInvalid: {
    borderColor: color.danger,
  },
  description: {
    fontSize: font.sizeSm,
    color: color.textMuted,
  },
  error: {
    fontSize: font.sizeSm,
    color: color.danger,
  },
});

export type TextFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  description?: string;
  /** Shown instead of `description`, e.g. a server-side validation error. Not tied to native constraint validation. */
  errorMessage?: string;
};

/** A labeled text input, built on Base UI's `Field` for accessible label/description/error association. */
export const TextField = ({ label, description, errorMessage, id, ...props }: TextFieldProps) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  return (
    <Field.Root className={stylex.props(styles.root).className} invalid={Boolean(errorMessage)}>
      <Field.Label htmlFor={controlId} className={stylex.props(styles.label).className}>
        {label}
      </Field.Label>
      <Field.Control
        id={controlId}
        {...props}
        className={(state) =>
          stylex.props(
            styles.control,
            state.focused && styles.controlFocused,
            state.valid === false && styles.controlInvalid,
          ).className
        }
      />
      {errorMessage ? (
        <Field.Error match={true} className={stylex.props(styles.error).className}>
          {errorMessage}
        </Field.Error>
      ) : (
        description && (
          <Field.Description className={stylex.props(styles.description).className}>
            {description}
          </Field.Description>
        )
      )}
    </Field.Root>
  );
};
