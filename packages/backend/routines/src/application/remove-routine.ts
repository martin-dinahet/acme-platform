import { notFound, ok } from "@acme/backend-kernel";
import type { RoutineRepository } from "./routine-repository.js";

export const removeRoutine = (repo: RoutineRepository) => async (ownerId: string, id: string) =>
  (await repo.remove(ownerId, id)) ? ok({ id }) : notFound();
