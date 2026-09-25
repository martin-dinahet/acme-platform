import type { NewTodo, Todo, TodoPatch } from "../domain/todo.js";

/** Port for todo storage. All methods except `deleteCompletedBefore` are scoped by owner. */
export interface TodoRepository {
  list(ownerId: string): Promise<Todo[]>;
  findById(ownerId: string, id: string): Promise<Todo | null>;
  findByIds(ownerId: string, ids: string[]): Promise<Todo[]>;
  create(ownerId: string, todo: NewTodo): Promise<Todo>;
  /** Returns `null` when the todo does not exist for this owner. */
  update(ownerId: string, id: string, patch: TodoPatch): Promise<Todo | null>;
  /** Returns `false` when the todo does not exist for this owner. */
  remove(ownerId: string, id: string): Promise<boolean>;
  /** All owners. Returns the number of deleted todos. */
  deleteCompletedBefore(date: Date): Promise<number>;
}
