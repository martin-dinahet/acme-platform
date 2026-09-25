/** A todo as the routines module sees it. Not the todos module's type. */
export type TodoRef = { id: string; title: string; completed: boolean };

/**
 * Port: all that routines needs from todos. Routines owns this interface.
 * The composition root gives an adapter (in-process today). Contract: `todos-port.contract.ts`.
 */
export interface TodosPort {
  /** Makes one todo for each title, in the same order. */
  createMany(ownerId: string, titles: string[]): Promise<TodoRef[]>;
  /** Returns the todos that exist and belong to the owner. Unknown IDs are dropped. */
  find(ownerId: string, ids: string[]): Promise<TodoRef[]>;
}
