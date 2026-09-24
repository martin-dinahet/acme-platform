import { Callout } from "@acme/ui";
import { useTodos } from "../hooks/use-todos.js";
import { TodoForm } from "./todo-form.js";
import { TodoList } from "./todo-list.js";

export const TodosPage = () => {
  const { items, error, loading, add, toggle, remove } = useTodos();

  return (
    <>
      <TodoForm onAdd={add} />
      {error && <Callout tone="danger">{error}</Callout>}
      <TodoList items={items} loading={loading} onToggle={toggle} onDelete={remove} />
    </>
  );
};
