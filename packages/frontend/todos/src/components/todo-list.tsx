import { Card } from "@acme/ui";
import { color, font, space } from "@acme/ui/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { Todo } from "../api/todos.js";
import { TodoItem } from "./todo-item.js";

const styles = stylex.create({
  list: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  empty: {
    fontSize: font.sizeSm,
    color: color.textMuted,
    textAlign: "center",
    margin: 0,
    padding: space.xl,
  },
});

type TodoListProps = {
  items: Todo[];
  loading: boolean;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

const Message = ({ children }: { children: string }) => <p {...stylex.props(styles.empty)}>{children}</p>;

export const TodoList = ({ items, loading, onToggle, onDelete }: TodoListProps) => {
  const content = loading ? (
    <Message>Loading…</Message>
  ) : items.length === 0 ? (
    <Message>No todos yet. Add your first one above.</Message>
  ) : (
    <ul {...stylex.props(styles.list)}>
      {items.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );

  return <Card>{content}</Card>;
};
