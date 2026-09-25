import { expect, test } from "bun:test";
import { createFakeTodosPort } from "../testing/fake-todos-port.js";
import { createInMemoryRoutineRepository } from "../testing/in-memory-routine-repository.js";
import { listRuns } from "./list-runs.js";
import { runRoutine } from "./run-routine.js";

test("progress counts completed todos and keeps the total when a todo is deleted", async () => {
  const routines = createInMemoryRoutineRepository();
  const todos = createFakeTodosPort();
  const deps = { routines: routines.repo, todos: todos.port, transaction: <T>(fn: () => Promise<T>) => fn() };
  const routine = await routines.repo.create("alice", { name: "r", steps: ["a", "b", "c"] });
  const run = (await runRoutine(deps)("alice", routine.id)).unwrapOrThrow();

  const [first, second] = run.todoIds;
  const done = todos.todos.get(first);
  if (done) done.completed = true;
  todos.todos.delete(second);

  const [progress] = (await listRuns(deps)("alice", routine.id)).unwrapOrThrow();
  expect(progress).toMatchObject({ completed: 1, total: 3 });
  expect(progress.todos).toHaveLength(2);
});

test("runs of an unknown routine give not_found", async () => {
  const routines = createInMemoryRoutineRepository();
  const result = await listRuns({ routines: routines.repo, todos: createFakeTodosPort().port })("alice", "x");
  expect(result.isFailure()).toBe(true);
});
