import type { TodoRepository } from "../application/todo-repository.js";
import type { Todo } from "../domain/todo.js";

/** Test double for `TodoRepository`. Same owner rules as the Prisma adapter. */
export const createInMemoryTodoRepository = (seed: Todo[] = []) => {
  const rows = new Map(seed.map((todo) => [todo.id, { ...todo }]));
  let next = rows.size;
  const owned = (ownerId: string, id: string) => {
    const todo = rows.get(id);
    return todo && todo.ownerId === ownerId ? todo : null;
  };

  const repo: TodoRepository = {
    list: async (ownerId) => [...rows.values()].filter((todo) => todo.ownerId === ownerId),
    findById: async (ownerId, id) => owned(ownerId, id),
    findByIds: async (ownerId, ids) => ids.flatMap((id) => owned(ownerId, id) ?? []),
    create: async (ownerId, { title, completed = false }) => {
      const now = new Date();
      const todo = { id: `t${++next}`, ownerId, title, completed, createdAt: now, updatedAt: now };
      rows.set(todo.id, todo);
      return todo;
    },
    update: async (ownerId, id, patch) => {
      const todo = owned(ownerId, id);
      if (!todo) return null;
      Object.assign(todo, patch, { updatedAt: new Date() });
      return todo;
    },
    remove: async (ownerId, id) => (owned(ownerId, id) ? rows.delete(id) : false),
    deleteCompletedBefore: async (date) => {
      const old = [...rows.values()].filter((todo) => todo.completed && todo.updatedAt < date);
      for (const todo of old) rows.delete(todo.id);
      return old.length;
    },
  };
  return { repo, rows };
};
