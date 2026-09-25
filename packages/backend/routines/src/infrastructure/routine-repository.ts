import { db } from "@acme/backend-db";
import type { RoutineRepository } from "../application/routine-repository.js";
import type { Routine, RoutineRun } from "../domain/routine.js";

// Prisma adapter. Uses `db()`, so it joins the current transaction. Only routines models (R4).

const withSteps = { steps: { orderBy: { position: "asc" } } } as const;
const withTodos = { todos: { orderBy: { position: "asc" } } } as const;

type RoutineRow = Omit<Routine, "steps"> & { steps: { id: string; position: number; title: string }[] };
type RunRow = Omit<RoutineRun, "todoIds"> & { todos: { todoId: string }[] };

const toRoutine = ({ steps, ...routine }: RoutineRow): Routine => ({
  ...routine,
  steps: steps.map(({ id, position, title }) => ({ id, position, title })),
});

const toRun = ({ todos, ...run }: RunRow): RoutineRun => ({ ...run, todoIds: todos.map((todo) => todo.todoId) });

const toStepRows = (steps: string[]) => steps.map((title, position) => ({ title, position }));

export const createRoutineRepository = (): RoutineRepository => {
  const findById = async (ownerId: string, id: string) => {
    const row = await db().routine.findFirst({ where: { id, ownerId }, include: withSteps });
    return row ? toRoutine(row) : null;
  };

  return {
    list: async (ownerId) =>
      (await db().routine.findMany({ where: { ownerId }, include: withSteps, orderBy: { createdAt: "asc" } })).map(
        toRoutine,
      ),
    findById,
    create: async (ownerId, { name, steps }) =>
      toRoutine(
        await db().routine.create({
          data: { ownerId, name, steps: { create: toStepRows(steps) } },
          include: withSteps,
        }),
      ),
    update: async (ownerId, id, { name, steps }) => {
      const { count } = await db().routine.updateMany({ where: { id, ownerId }, data: { name } });
      if (count === 0) return null;
      await db().routineStep.deleteMany({ where: { routineId: id } });
      await db().routineStep.createMany({ data: toStepRows(steps).map((step) => ({ ...step, routineId: id })) });
      return findById(ownerId, id);
    },
    remove: async (ownerId, id) => (await db().routine.deleteMany({ where: { id, ownerId } })).count > 0,
    createRun: async (ownerId, routineId, todoIds) =>
      toRun(
        await db().routineRun.create({
          data: {
            ownerId,
            routineId,
            todos: { create: todoIds.map((todoId, position) => ({ todoId, position })) },
          },
          include: withTodos,
        }),
      ),
    listRuns: async (ownerId, routineId) =>
      (
        await db().routineRun.findMany({
          where: { ownerId, routineId },
          include: withTodos,
          orderBy: { createdAt: "desc" },
        })
      ).map(toRun),
  };
};
