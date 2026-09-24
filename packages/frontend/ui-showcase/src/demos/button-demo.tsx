import { Button, type ButtonProps, Checkbox, TextField } from "@acme/ui";
import { useState } from "react";
import { Control, Playground } from "../components/playground.js";
import { PropsTable } from "../components/props-table.js";
import { Subsection } from "../components/section.js";
import { Segmented } from "../components/segmented.js";
import { StateTable } from "../components/state-table.js";
import { formatJsx } from "../lib/jsx.js";

type Variant = NonNullable<ButtonProps["variant"]>;
type Size = NonNullable<ButtonProps["size"]>;

// Records (not arrays) so a new variant or size fails typecheck until it is listed here.
const VARIANTS: Record<Variant, true> = { primary: true, secondary: true, danger: true, ghost: true };
const SIZES: Record<Size, true> = { md: true, sm: true };
const VARIANT_LIST = Object.keys(VARIANTS) as Variant[];
const SIZE_LIST = Object.keys(SIZES) as Size[];

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const COLUMNS = [...SIZE_LIST.flatMap((size) => [size, `${size} · disabled`]), "with icon"];

const States = () => (
  <Subsection
    title="States"
    hint="Every variant × size × disabled. Hover and keyboard focus (Tab) are live on each specimen."
  >
    <StateTable
      corner="variant"
      columns={COLUMNS}
      rows={VARIANT_LIST.map((variant) => ({
        label: variant,
        cells: [
          ...SIZE_LIST.flatMap((size) => [
            <Button key={size} variant={variant} size={size}>
              Button
            </Button>,
            <Button key={`${size}-disabled`} variant={variant} size={size} disabled>
              Button
            </Button>,
          ]),
          <Button key="icon" variant={variant}>
            <PlusIcon />
            New item
          </Button>,
        ],
      }))}
    />
  </Subsection>
);

const ButtonPlayground = () => {
  const [variant, setVariant] = useState<Variant>("primary");
  const [size, setSize] = useState<Size>("md");
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState("Save changes");

  return (
    <Subsection title="Playground">
      <Playground
        preview={
          <Button variant={variant} size={size} disabled={disabled}>
            {label}
          </Button>
        }
        controls={
          <>
            <Control label="variant">
              <Segmented label="variant" options={VARIANT_LIST} value={variant} onChange={setVariant} />
            </Control>
            <Control label="size">
              <Segmented label="size" options={SIZE_LIST} value={size} onChange={setSize} />
            </Control>
            <TextField label="Label" value={label} onChange={(event) => setLabel(event.target.value)} />
            <Checkbox label="disabled" checked={disabled} onCheckedChange={setDisabled} />
          </>
        }
        code={formatJsx(
          "Button",
          {
            variant: variant === "primary" ? undefined : variant,
            size: size === "md" ? undefined : size,
            disabled,
          },
          label,
        )}
      />
    </Subsection>
  );
};

export const ButtonDemo = () => (
  <>
    <States />
    <ButtonPlayground />
    <Subsection title="Props" hint="Also accepts every native <button> prop.">
      <PropsTable
        rows={[
          {
            name: "variant",
            type: VARIANT_LIST.map((v) => `"${v}"`).join(" | "),
            default: '"primary"',
            description: "Visual emphasis. Use one primary per view; danger for destructive actions.",
          },
          {
            name: "size",
            type: SIZE_LIST.map((s) => `"${s}"`).join(" | "),
            default: '"md"',
            description: "sm for dense rows and toolbars.",
          },
          {
            name: "type",
            type: '"button" | "submit" | "reset"',
            default: '"button"',
            description: 'Defaults to "button" (not the native "submit") to avoid accidental form submits.',
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Dims the button and blocks clicks.",
          },
          {
            name: "className, style",
            type: "string, CSSProperties",
            description: "Merged after the design-system styles.",
          },
        ]}
      />
    </Subsection>
  </>
);
