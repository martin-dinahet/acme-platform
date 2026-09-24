import { Callout, type CalloutProps, TextField } from "@acme/ui";
import { useState } from "react";
import { Control, Playground } from "../components/playground.js";
import { PropsTable } from "../components/props-table.js";
import { Subsection } from "../components/section.js";
import { Segmented } from "../components/segmented.js";
import { Specimen, SpecimenGrid } from "../components/specimen.js";
import { formatJsx } from "../lib/jsx.js";

type Tone = NonNullable<CalloutProps["tone"]>;

// A record so a new tone fails typecheck until it is documented here.
const TONES: Record<Tone, { role: string; sample: string }> = {
  info: { role: "status", sample: "Changes save automatically." },
  danger: { role: "alert", sample: "Could not reach the server. Try again." },
};
const TONE_LIST = Object.keys(TONES) as Tone[];

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 7v4M8 5v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const States = () => (
  <Subsection title="States" hint="Each tone sets its own ARIA role, so screen readers announce it right.">
    <SpecimenGrid min="280px">
      {TONE_LIST.map((tone) => (
        <Specimen key={tone} title={tone} code={`tone="${tone}" · role="${TONES[tone].role}"`} fill>
          <Callout tone={tone}>{TONES[tone].sample}</Callout>
        </Specimen>
      ))}
      {TONE_LIST.map((tone) => (
        <Specimen key={`${tone}-icon`} title={`${tone}, with icon`} note="Children lay out in a row." fill>
          <Callout tone={tone}>
            <InfoIcon />
            <span>{TONES[tone].sample}</span>
          </Callout>
        </Specimen>
      ))}
      <Specimen title="Long content" note="Wraps; the icon stays at the top." fill>
        <Callout tone="danger">
          <InfoIcon />
          <span>
            Your session expired while you were editing. Copy your changes, sign in again, then paste them
            back.
          </span>
        </Callout>
      </Specimen>
    </SpecimenGrid>
  </Subsection>
);

const CalloutPlayground = () => {
  const [tone, setTone] = useState<Tone>("danger");
  const [text, setText] = useState("Invalid email or password.");

  return (
    <Subsection title="Playground">
      <Playground
        fill
        preview={<Callout tone={tone}>{text}</Callout>}
        controls={
          <>
            <Control label="tone">
              <Segmented label="tone" options={TONE_LIST} value={tone} onChange={setTone} />
            </Control>
            <TextField label="Text" value={text} onChange={(event) => setText(event.target.value)} />
          </>
        }
        code={formatJsx("Callout", { tone: tone === "info" ? undefined : tone }, text)}
      />
    </Subsection>
  );
};

export const CalloutDemo = () => (
  <>
    <States />
    <CalloutPlayground />
    <Subsection title="Props" hint="Also accepts every native <div> prop.">
      <PropsTable
        rows={[
          {
            name: "tone",
            type: TONE_LIST.map((t) => `"${t}"`).join(" | "),
            default: '"info"',
            description: "danger for errors, info for neutral status.",
          },
          {
            name: "role",
            type: "AriaRole",
            default: '"alert" | "status"',
            description: "Derived from tone. Override only when the message is not live.",
          },
        ]}
      />
    </Subsection>
  </>
);
