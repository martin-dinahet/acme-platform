import { Button, Card, TextField } from "@acme/ui";
import { space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { FormEvent } from "react";
import { useState } from "react";

const styles = stylex.create({
  form: {
    display: "flex",
    gap: space.sm,
    alignItems: "flex-end",
  },
  field: {
    flex: 1,
  },
});

type TodoFormProps = {
  /** Resolves `true` on success, so the form can clear its input. */
  onAdd: (title: string) => Promise<boolean>;
};

export const TodoForm = ({ onAdd }: TodoFormProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (await onAdd(trimmed)) setTitle("");
  };

  return (
    <Card>
      <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
        <div {...stylex.props(styles.field)}>
          <TextField
            label="New todo"
            placeholder="Write the release notes"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <Button type="submit">Add</Button>
      </form>
    </Card>
  );
};
