import { Button, Card, Checkbox, TextField } from "@acme/ui";
import { color, font, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Playground } from "../components/playground.js";
import { PropsTable } from "../components/props-table.js";
import { Subsection } from "../components/section.js";
import { Specimen, SpecimenGrid } from "../components/specimen.js";

const styles = stylex.create({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
  },
  title: {
    margin: 0,
    fontFamily: font.body,
    fontSize: font.sizeLg,
    fontWeight: font.weightBold,
    color: color.text,
  },
  body: {
    margin: 0,
    fontFamily: font.body,
    fontSize: font.sizeMd,
    lineHeight: 1.5,
    color: color.textMuted,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: space.sm,
  },
});

const States = () => (
  <Subsection title="States" hint="Card has no variants: one surface, used as the base container.">
    <SpecimenGrid min="280px">
      <Specimen title="Empty" note="Padding, border, radius and shadow only." fill>
        <Card />
      </Specimen>
      <Specimen title="With content" fill>
        <Card>
          <div {...stylex.props(styles.stack)}>
            <h4 {...stylex.props(styles.title)}>Plan</h4>
            <p {...stylex.props(styles.body)}>Team · 5 seats · billed monthly.</p>
          </div>
        </Card>
      </Specimen>
      <Specimen title="With actions" fill>
        <Card>
          <div {...stylex.props(styles.stack)}>
            <h4 {...stylex.props(styles.title)}>Delete project?</h4>
            <p {...stylex.props(styles.body)}>This cannot be undone.</p>
            <div {...stylex.props(styles.actions)}>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
              <Button variant="danger" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </Specimen>
      <Specimen title="Nested" note="A card inside a card keeps its edge." fill>
        <Card>
          <Card>
            <p {...stylex.props(styles.body)}>Inner card</p>
          </Card>
        </Card>
      </Specimen>
    </SpecimenGrid>
  </Subsection>
);

const CardPlayground = () => {
  const [title, setTitle] = useState("Invite teammates");
  const [body, setBody] = useState("They get access to every project in this workspace.");
  const [withActions, setWithActions] = useState(true);

  return (
    <Subsection title="Playground">
      <Playground
        fill
        preview={
          <Card>
            <div {...stylex.props(styles.stack)}>
              {title && <h4 {...stylex.props(styles.title)}>{title}</h4>}
              {body && <p {...stylex.props(styles.body)}>{body}</p>}
              {withActions && (
                <div {...stylex.props(styles.actions)}>
                  <Button variant="primary" size="sm">
                    Send invite
                  </Button>
                </div>
              )}
            </div>
          </Card>
        }
        controls={
          <>
            <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <TextField label="Body" value={body} onChange={(event) => setBody(event.target.value)} />
            <Checkbox label="with actions" checked={withActions} onCheckedChange={setWithActions} />
          </>
        }
        code={[
          "<Card>",
          title && `  <h4>${title}</h4>`,
          body && `  <p>${body}</p>`,
          withActions && '  <Button size="sm">Send invite</Button>',
          "</Card>",
        ]
          .filter(Boolean)
          .join("\n")}
      />
    </Subsection>
  );
};

export const CardDemo = () => (
  <>
    <States />
    <CardPlayground />
    <Subsection title="Props">
      <PropsTable
        rows={[
          {
            name: "…div props",
            type: "ComponentPropsWithoutRef<'div'>",
            description: "Card has no own props. className and style merge after its styles.",
          },
        ]}
      />
    </Subsection>
  </>
);
