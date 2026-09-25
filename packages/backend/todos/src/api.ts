import type { TodosUseCases } from "./use-cases.js";

/**
 * In-process public API for other modules (through their ports) and for the worker.
 * These use cases cannot fail with a domain error, so the API returns plain values.
 */
export const createTodosApi = (uc: TodosUseCases) => ({
  createMany: async (ownerId: string, titles: string[]) => (await uc.createMany(ownerId, titles)).unwrapOrThrow(),
  findByIds: async (ownerId: string, ids: string[]) => (await uc.findByIds(ownerId, ids)).unwrapOrThrow(),
  purgeCompleted: async (options: { olderThanDays: number; now?: Date }) =>
    (await uc.purgeCompleted(options)).unwrapOrThrow().count,
});
