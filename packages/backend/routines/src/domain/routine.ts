export type RoutineStep = { id: string; position: number; title: string };

/** A reusable checklist. A run of it makes one todo for each step. */
export type Routine = {
  id: string;
  ownerId: string;
  name: string;
  steps: RoutineStep[];
  createdAt: Date;
  updatedAt: Date;
};

export type RoutineInput = { name: string; steps: string[] };

/** One run of a routine. `todoIds` are in step order. They point into the todos module (no FK). */
export type RoutineRun = {
  id: string;
  ownerId: string;
  routineId: string;
  todoIds: string[];
  createdAt: Date;
};
