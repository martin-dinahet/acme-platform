import { ok } from "@acme/backend-kernel";
import type { RoutineInput } from "../domain/routine.js";
import type { RoutineRepository } from "./routine-repository.js";

export const createRoutine = (repo: RoutineRepository) => async (ownerId: string, input: RoutineInput) =>
  ok(await repo.create(ownerId, input));
