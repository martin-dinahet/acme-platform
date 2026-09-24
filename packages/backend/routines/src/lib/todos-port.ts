/** A todo as the routines module sees it. Not the todos module's type. */
export type TodoRef = { id: string; title: string; completed: boolean };

/** Port: everything routines needs from todos. Routines owns this interface. */
export interface TodosPort {
  create(title: string): Promise<TodoRef>;
  find(ids: string[]): Promise<TodoRef[]>;
  delete(ids: string[]): Promise<void>;
}
