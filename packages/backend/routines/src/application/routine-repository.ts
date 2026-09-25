import type { Routine, RoutineInput, RoutineRun } from "../domain/routine.js";

/** Port for routine storage. All methods are scoped by owner. */
export interface RoutineRepository {
  list(ownerId: string): Promise<Routine[]>;
  findById(ownerId: string, id: string): Promise<Routine | null>;
  create(ownerId: string, input: RoutineInput): Promise<Routine>;
  /** Replaces name and steps. Returns `null` when the routine does not exist for this owner. Several writes: call in a transaction. */
  update(ownerId: string, id: string, input: RoutineInput): Promise<Routine | null>;
  /** Also deletes steps and runs. The todos of the runs stay: they belong to the todos module. */
  remove(ownerId: string, id: string): Promise<boolean>;
  createRun(ownerId: string, routineId: string, todoIds: string[]): Promise<RoutineRun>;
  /** Newest first. */
  listRuns(ownerId: string, routineId: string): Promise<RoutineRun[]>;
}
