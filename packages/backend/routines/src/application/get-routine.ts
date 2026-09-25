import { notFound, ok } from "@acme/backend-kernel";
import type { RoutineRepository } from "./routine-repository.js";

export const getRoutine = (repo: RoutineRepository) => async (ownerId: string, id: string) => {
  const routine = await repo.findById(ownerId, id);
  return routine ? ok(routine) : notFound();
};
