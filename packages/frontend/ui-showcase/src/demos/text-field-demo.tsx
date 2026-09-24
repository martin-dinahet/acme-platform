import { Checkbox, TextField } from "@acme/ui";
import { useState } from "react";
import { Control, Playground } from "../components/playground.js";
import { PropsTable } from "../components/props-table.js";
import { Subsection } from "../components/section.js";
import { Segmented } from "../components/segmented.js";
import { Specimen, SpecimenGrid } from "../components/specimen.js";
import { formatJsx } from "../lib/jsx.js";

const States = () => (
  <Subsection title="States" hint="Focus is live: click or Tab into any field.">
    <SpecimenGrid min="260px">
      <Specimen title="Default" code='label="Email"' fill>
        <TextField label="Email" />
      </Specimen>
      <Specimen title="Placeholder" code="placeholder" fill>
        <TextField label="Email" placeholder="you@example.com" />
      </Specimen>
      <Specimen title="Filled" code="defaultValue" fill>
        <TextField label="Email" defaultValue="ada@acme.dev" />
      </Specimen>
      <Specimen title="With description" code="description" fill>
        <TextField label="Username" description="Letters and numbers only." />
      </Specimen>
      <Specimen title="Invalid" code="errorMessage" note="Replaces the description." fill>
        <TextField
          label="Email"
          defaultValue="ada@"
          description="Hidden while an error shows."
          errorMessage="Enter a valid email address."
        />
      </Specimen>
      <Specimen title="Disabled" code="disabled" fill>
        <TextField label="Email" defaultValue="ada@acme.dev" disabled />
      </Specimen>
      <Specimen title="Read-only" code="readOnly" fill>
        <TextField label="Account ID" defaultValue="acc_29fk31" readOnly />
      </Specimen>
      <Specimen title="Password" code='type="password"' fill>
        <TextField label="Password" type="password" defaultValue="hunter22" />
      </Specimen>
      <Specimen title="Required" code="required" note="Native constraint only, no visual marker." fill>
        <TextField label="Full name" required />
      </Specimen>
    </SpecimenGrid>
  </Subsection>
);

const TYPES = ["text", "email", "password", "number", "search"] as const;

const TextFieldPlayground = () => {
  const [label, setLabel] = useState("Email");
  const [placeholder, setPlaceholder] = useState("you@example.com");
  const [description, setDescription] = useState("We never share it.");
  const [errorMessage, setErrorMessage] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("email");
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  return (
    <Subsection title="Playground">
      <Playground
        fill
        preview={
          <TextField
            label={label}
            type={type}
            placeholder={placeholder || undefined}
            description={description || undefined}
            errorMessage={errorMessage || undefined}
            disabled={disabled}
            readOnly={readOnly}
          />
        }
        controls={
          <>
            <TextField label="Label" value={label} onChange={(event) => setLabel(event.target.value)} />
            <TextField
              label="Placeholder"
              value={placeholder}
              onChange={(event) => setPlaceholder(event.target.value)}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <TextField
              label="Error message"
              placeholder="Empty = valid"
              value={errorMessage}
              onChange={(event) => setErrorMessage(event.target.value)}
            />
            <Control label="type">
              <Segmented label="type" options={TYPES} value={type} onChange={setType} />
            </Control>
            <Checkbox label="disabled" checked={disabled} onCheckedChange={setDisabled} />
            <Checkbox label="readOnly" checked={readOnly} onCheckedChange={setReadOnly} />
          </>
        }
        code={formatJsx("TextField", {
          label,
          type: type === "text" ? undefined : type,
          placeholder: placeholder || undefined,
          description: description || undefined,
          errorMessage: errorMessage || undefined,
          disabled,
          readOnly,
        })}
      />
    </Subsection>
  );
};

export const TextFieldDemo = () => (
  <>
    <States />
    <TextFieldPlayground />
    <Subsection title="Props" hint="Also accepts every native <input> prop.">
      <PropsTable
        rows={[
          { name: "label", type: "string", description: "Visible label, linked to the input. Required." },
          { name: "description", type: "string", description: "Help text under the input." },
          {
            name: "errorMessage",
            type: "string",
            description: "Marks the field invalid and shows the message instead of the description.",
          },
          { name: "id", type: "string", default: "useId()", description: "Input id. Generated when absent." },
        ]}
      />
    </Subsection>
  </>
);
