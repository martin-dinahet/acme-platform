import { Checkbox, TextField } from "@acme/ui";
import { useState } from "react";
import { Playground } from "../components/playground.js";
import { PropsTable } from "../components/props-table.js";
import { Subsection } from "../components/section.js";
import { Specimen, SpecimenGrid } from "../components/specimen.js";
import { formatJsx } from "../lib/jsx.js";

const States = () => (
  <Subsection title="States" hint="Hover and focus (Tab) are live. Click to toggle.">
    <SpecimenGrid>
      <Specimen title="Unchecked">
        <Checkbox label="Remember me" />
      </Specimen>
      <Specimen title="Checked" code="defaultChecked">
        <Checkbox label="Remember me" defaultChecked />
      </Specimen>
      <Specimen title="Disabled" code="disabled">
        <Checkbox label="Remember me" disabled />
      </Specimen>
      <Specimen title="Disabled, checked" code="disabled defaultChecked">
        <Checkbox label="Remember me" disabled defaultChecked />
      </Specimen>
      <Specimen title="Read-only" code="readOnly defaultChecked">
        <Checkbox label="Remember me" readOnly defaultChecked />
      </Specimen>
      <Specimen title="Long label" note="Label wraps next to the box." fill>
        <Checkbox label="Send me product updates, event invitations and the monthly newsletter" />
      </Specimen>
    </SpecimenGrid>
  </Subsection>
);

const CheckboxPlayground = () => {
  const [label, setLabel] = useState("Accept terms");
  const [checked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);

  return (
    <Subsection title="Playground" hint="The preview is controlled: it and the checked control stay in sync.">
      <Playground
        preview={
          <Checkbox label={label} checked={checked} onCheckedChange={setChecked} disabled={disabled} />
        }
        controls={
          <>
            <TextField label="Label" value={label} onChange={(event) => setLabel(event.target.value)} />
            <Checkbox label="checked" checked={checked} onCheckedChange={setChecked} />
            <Checkbox label="disabled" checked={disabled} onCheckedChange={setDisabled} />
          </>
        }
        code={formatJsx("Checkbox", {
          label,
          checked: { expr: "checked" },
          onCheckedChange: { expr: "setChecked" },
          disabled,
        })}
      />
    </Subsection>
  );
};

export const CheckboxDemo = () => (
  <>
    <States />
    <CheckboxPlayground />
    <Subsection title="Props" hint="Also accepts Base UI Checkbox.Root props, except className and style.">
      <PropsTable
        rows={[
          {
            name: "label",
            type: "string",
            description: "Visible label. Clicking it toggles the box. Required.",
          },
          { name: "checked", type: "boolean", description: "Controlled state." },
          {
            name: "defaultChecked",
            type: "boolean",
            default: "false",
            description: "Uncontrolled initial state.",
          },
          {
            name: "onCheckedChange",
            type: "(checked: boolean, details) => void",
            description: "Called on toggle.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Dims the box and blocks input.",
          },
          {
            name: "readOnly",
            type: "boolean",
            default: "false",
            description: "Focusable but not toggleable.",
          },
          { name: "id", type: "string", default: "useId()", description: "Box id. Generated when absent." },
        ]}
      />
    </Subsection>
  </>
);
