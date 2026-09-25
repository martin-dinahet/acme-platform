import { expect, test } from "bun:test";
import { createFakeTodosPort } from "../testing/fake-todos-port.js";
import { createInMemoryRoutineRepository } from "../testing/in-memory-routine-repository.js";
import { runRoutine } from "./run-routine.js";

const setup = () => {
  const routines = createInMemoryRoutineRepository();
  const todos = createFakeTodosPort();
  const run = runRoutine({ routines: routines.repo, todos: todos.port, transaction: (fn) => fn() });
  return { routines, todos, run };
};

test("a routine with 3 steps makes 3 todos and one run", async () => {
  const { routines, todos, run } = setup();
  const routine = await routines.repo.create("alice", { name: "Morning", steps: ["wake", "wash", "eat"] });

  const result = await run("alice", routine.id);

  const value = result.unwrapOrThrow();
  expect(value.todos.map((todo) => todo.title)).toEqual(["wake", "wash", "eat"]);
  expect(value.todoIds).toEqual(value.todos.map((todo) => todo.id));
  expect(todos.todos.size).toBe(3);
  expect(routines.runs).toHaveLength(1);
  expect(routines.runs[0]).toMatchObject({ ownerId: "alice", routineId: routine.id });
});

test("an unknown routine gives not_found and makes nothing", async () => {
  const { routines, todos, run } = setup();

  const result = await run("alice", "missing");

  expect(result.match({ success: () => "ok", failure: (error) => error.kind })).toBe("not_found");
  expect(todos.todos.size).toBe(0);
  expect(routines.runs).toHaveLength(0);
});

test("a routine of a different owner gives not_found", async () => {
  const { routines, run } = setup();
  const routine = await routines.repo.create("bob", { name: "Bob's", steps: ["x"] });

  expect((await run("alice", routine.id)).isFailure()).toBe(true);
});
