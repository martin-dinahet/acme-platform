import { ok } from "@acme/backend-kernel";
import type { RoutineRepository } from "./routine-repository.js";

export const listRoutines = (repo: RoutineRepository) => async (ownerId: string) => ok(await repo.list(ownerId));
