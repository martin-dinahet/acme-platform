import { useEffect, useState } from "react";
import { createTodo, deleteTodo, listTodos, setTodoCompleted, type Todo } from "../api/todos.js";

const messageOf = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

/** Todo list state with optimistic toggle and delete. Rolls back and sets `error` on failure. */
export const useTodos = () => {
  const [items, setItems] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTodos()
      .then(setItems)
      .catch((err: unknown) => setError(messageOf(err, "Couldn't load todos.")))
      .finally(() => setLoading(false));
  }, []);

  /** Resolves `true` when the todo was created. */
  const add = async (title: string) => {
    try {
      const todo = await createTodo(title);
      setItems((prev) => [...prev, todo]);
      setError(null);
      return true;
    } catch (err) {
      setError(messageOf(err, "Couldn't create the todo."));
      return false;
    }
  };

  const toggle = async (todo: Todo) => {
    setItems((prev) =>
      prev.map((item) => (item.id === todo.id ? { ...item, completed: !item.completed } : item)),
    );
    try {
      await setTodoCompleted(todo.id, !todo.completed);
    } catch (err) {
      setItems((prev) => prev.map((item) => (item.id === todo.id ? todo : item)));
      setError(messageOf(err, "Couldn't update the todo."));
    }
  };

  const remove = async (id: string) => {
    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteTodo(id);
    } catch (err) {
      setItems(previous);
      setError(messageOf(err, "Couldn't delete the todo."));
    }
  };

  return { items, error, loading, add, toggle, remove };
};
