import { Button, Checkbox } from "@acme/ui";
import { space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { Todo } from "../api/todos.js";

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
});

type TodoItemProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => (
  <li {...stylex.props(styles.row)}>
    <Checkbox label={todo.title} checked={todo.completed} onCheckedChange={() => onToggle(todo)} />
    <Button variant="ghost" size="sm" onClick={() => onDelete(todo.id)}>
      Delete
    </Button>
  </li>
);
