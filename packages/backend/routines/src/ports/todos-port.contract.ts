import { beforeEach, describe, expect, test } from "bun:test";
import type { TodosPort } from "./todos-port.js";

export type TodosPortSubject = {
  port: TodosPort;
  /** Two different owners that the adapter can act for. */
  owners: [string, string];
};

/**
 * Contract of `TodosPort`. Run it against each adapter (fake, in-process, HTTP).
 * `setup` runs before each test and must give an empty store.
 */
export const describeTodosPortContract = (name: string, setup: () => Promise<TodosPortSubject>) =>
  describe(`TodosPort contract: ${name}`, () => {
    let port: TodosPort;
    let alice: string;
    let bob: string;

    beforeEach(async () => {
      const subject = await setup();
      port = subject.port;
      [alice, bob] = subject.owners;
    });

    test("createMany makes one open todo for each title, in order", async () => {
      const created = await port.createMany(alice, ["a", "b", "c"]);
      expect(created.map((todo) => todo.title)).toEqual(["a", "b", "c"]);
      expect(created.every((todo) => todo.completed === false)).toBe(true);
      expect(new Set(created.map((todo) => todo.id)).size).toBe(3);
    });

    test("createMany with no titles gives no todos", async () => {
      expect(await port.createMany(alice, [])).toEqual([]);
    });

    test("find returns the created todos", async () => {
      const created = await port.createMany(alice, ["a", "b"]);
      const found = await port.find(
        alice,
        created.map((todo) => todo.id),
      );
      expect(found.map((todo) => todo.id).sort()).toEqual(created.map((todo) => todo.id).sort());
      expect(found.map((todo) => todo.title).sort()).toEqual(["a", "b"]);
    });

    test("find drops unknown IDs", async () => {
      const [todo] = await port.createMany(alice, ["a"]);
      const found = await port.find(alice, [todo.id, "does-not-exist"]);
      expect(found.map((t) => t.id)).toEqual([todo.id]);
    });

    test("find does not return todos of a different owner", async () => {
      const [todo] = await port.createMany(alice, ["a"]);
      expect(await port.find(bob, [todo.id])).toEqual([]);
    });

    test("find with no IDs gives no todos", async () => {
      expect(await port.find(alice, [])).toEqual([]);
    });

    test("returned todos have only the TodoRef fields", async () => {
      const [todo] = await port.createMany(alice, ["a"]);
      expect(Object.keys(todo).sort()).toEqual(["completed", "id", "title"]);
    });
  });
