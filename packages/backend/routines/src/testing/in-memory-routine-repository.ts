import type { RoutineRepository } from "../application/routine-repository.js";
import type { Routine, RoutineRun } from "../domain/routine.js";

/** Test double for `RoutineRepository`. Same owner rules as the Prisma adapter. */
export const createInMemoryRoutineRepository = () => {
  const routines = new Map<string, Routine>();
  const runs: RoutineRun[] = [];
  let next = 0;
  const id = (prefix: string) => `${prefix}-${++next}`;
  const owned = (ownerId: string, routineId: string) => {
    const routine = routines.get(routineId);
    return routine && routine.ownerId === ownerId ? routine : null;
  };
  const toSteps = (steps: string[]) => steps.map((title, position) => ({ id: id("step"), position, title }));

  const repo: RoutineRepository = {
    list: async (ownerId) => [...routines.values()].filter((routine) => routine.ownerId === ownerId),
    findById: async (ownerId, routineId) => owned(ownerId, routineId),
    create: async (ownerId, { name, steps }) => {
      const now = new Date();
      const routine = { id: id("routine"), ownerId, name, steps: toSteps(steps), createdAt: now, updatedAt: now };
      routines.set(routine.id, routine);
      return routine;
    },
    update: async (ownerId, routineId, { name, steps }) => {
      const routine = owned(ownerId, routineId);
      if (!routine) return null;
      Object.assign(routine, { name, steps: toSteps(steps), updatedAt: new Date() });
      return routine;
    },
    remove: async (ownerId, routineId) => (owned(ownerId, routineId) ? routines.delete(routineId) : false),
    createRun: async (ownerId, routineId, todoIds) => {
      const run = { id: id("run"), ownerId, routineId, todoIds, createdAt: new Date() };
      runs.push(run);
      return run;
    },
    listRuns: async (ownerId, routineId) =>
      runs.filter((run) => run.ownerId === ownerId && run.routineId === routineId).reverse(),
  };
  return { repo, routines, runs };
};
