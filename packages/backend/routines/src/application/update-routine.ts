import { notFound, ok, type TransactionRunner } from "@acme/backend-kernel";
import type { RoutineInput } from "../domain/routine.js";
import type { RoutineRepository } from "./routine-repository.js";

/** Replaces name and steps in one transaction. */
export const updateRoutine =
  (repo: RoutineRepository, transaction: TransactionRunner) =>
  (ownerId: string, id: string, input: RoutineInput) =>
    transaction(async () => {
      const routine = await repo.update(ownerId, id, input);
      return routine ? ok(routine) : notFound();
    });
