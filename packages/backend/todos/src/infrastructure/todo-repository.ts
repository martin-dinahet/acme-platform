import { db } from "@acme/backend-db";
import type { TodoRepository } from "../application/todo-repository.js";

/** Prisma adapter. Uses `db()`, so it joins the current transaction. Only `todo` model (R4). */
export const createTodoRepository = (): TodoRepository => ({
  list: (ownerId) => db().todo.findMany({ where: { ownerId }, orderBy: { createdAt: "asc" } }),
  findById: (ownerId, id) => db().todo.findFirst({ where: { id, ownerId } }),
  findByIds: (ownerId, ids) => db().todo.findMany({ where: { ownerId, id: { in: ids } } }),
  create: (ownerId, todo) => db().todo.create({ data: { ...todo, ownerId } }),
  update: async (ownerId, id, patch) => {
    const { count } = await db().todo.updateMany({ where: { id, ownerId }, data: patch });
    return count === 0 ? null : db().todo.findFirst({ where: { id, ownerId } });
  },
  remove: async (ownerId, id) => (await db().todo.deleteMany({ where: { id, ownerId } })).count > 0,
  deleteCompletedBefore: async (date) =>
    (await db().todo.deleteMany({ where: { completed: true, updatedAt: { lt: date } } })).count,
});
