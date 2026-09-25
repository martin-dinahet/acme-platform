import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import {
  format,
  MODULES,
  type ModuleName,
  modelsOf,
  parseImports,
  r1,
  r2,
  r3,
  r4,
  r5,
  r6,
  r7,
  type Violation,
} from "./rules.js";

const ROOT = resolve(import.meta.dir, "../..");
const SCHEMA_DIR = "packages/backend/db/prisma/schema";

const read = (file: string) => Bun.file(resolve(ROOT, file)).text();

const scan = async (pattern: string) => {
  const files: string[] = [];
  for await (const file of new Bun.Glob(pattern).scan({ cwd: ROOT })) {
    if (!/(^|\/)(node_modules|generated|dist)\//.test(file)) files.push(file);
  }
  return files.sort();
};

const modelsByModule = Object.fromEntries(
  await Promise.all(MODULES.map(async (m) => [m, modelsOf(await read(`${SCHEMA_DIR}/${m}.prisma`))])),
) as Record<ModuleName, string[]>;

const sources = await Promise.all(
  [...(await scan("packages/**/*.{ts,tsx}")), ...(await scan("services/**/*.{ts,tsx}"))].map(
    async (file) => [file, await read(file)] as const,
  ),
);
const schemas = await Promise.all(
  (await scan(`${SCHEMA_DIR}/*.prisma`)).map(async (file) => [file, await read(file)] as const),
);

const expectNone = (violations: Violation[]) => expect(violations.map(format)).toEqual([]);

describe("repository follows the boundary rules", () => {
  test("there are files to check", () => {
    expect(sources.length).toBeGreaterThan(50);
    expect(Object.values(modelsByModule).every((models) => models.length > 0)).toBe(true);
  });
  test("R1: a module imports only db and kernel", () => expectNone(sources.flatMap(([f, s]) => r1(f, s))));
  test("R2: only services import module factories", () => expectNone(sources.flatMap(([f, s]) => r2(f, s))));
  test("R3: frontend imports backend with import type only", () =>
    expectNone(sources.flatMap(([f, s]) => r3(f, s))));
  test("R4: a module uses only its own Prisma models", () =>
    expectNone(sources.flatMap(([f, s]) => r4(f, s, modelsByModule))));
  test("R5: no relation across module schemas", () =>
    expectNone(schemas.flatMap(([f, s]) => r5(f, s, modelsByModule))));
  test("R6: no /internal routes", () => expectNone(sources.flatMap(([f, s]) => r6(f, s))));
  test("R7: kernel has no runtime dependency on Prisma, Hono or a module", () =>
    expectNone(sources.flatMap(([f, s]) => r7(f, s))));
});

// Each rule must be able to fail. Bad fixture -> a violation with the right file and line. Good fixture -> none.
describe("each rule fails on a bad example", () => {
  const models = { auth: ["user", "session"], todos: ["todo"], routines: ["routine", "routineRun"] };

  test("parseImports reads multi-line, type-only, re-export and dynamic imports", () => {
    const imports = parseImports(
      'import {\n  a,\n  type B,\n} from "x";\nimport type { C } from "y";\nexport { d } from "z";\nawait import("w");',
    );
    expect(imports.map((i) => [i.specifier, i.line, i.typeOnly])).toEqual([
      ["x", 1, false],
      ["y", 5, true],
      ["z", 6, false],
      ["w", 7, false],
    ]);
  });

  test("R1", () => {
    const bad = r1("packages/backend/routines/src/a.ts", 'import x from "@acme/db";\nimport { t } from "@acme/backend-todos";');
    expect(bad).toMatchObject([{ rule: "R1", file: "packages/backend/routines/src/a.ts", line: 2 }]);
    expect(r1("packages/backend/routines/src/a.ts", 'import "../../todos/src/x.js";')).toHaveLength(1);
    expect(r1("packages/backend/todos/src/a.ts", 'import { db } from "@acme/backend-db";')).toEqual([]);
  });

  test("R2", () => {
    const bad = r2("packages/backend/routines/src/a.ts", 'import { createTodosModule } from "@acme/backend-todos";');
    expect(bad).toMatchObject([{ rule: "R2", line: 1 }]);
    expect(r2("services/api/src/container.ts", 'import { createTodosModule } from "@acme/backend-todos";')).toEqual([]);
  });

  test("R3", () => {
    const bad = r3("packages/frontend/todos/src/a.ts", 'import { createTodosModule } from "@acme/backend-todos";');
    expect(bad).toMatchObject([{ rule: "R3", line: 1 }]);
    expect(r3("packages/frontend/todos/src/a.ts", 'import type { TodosRoutes } from "@acme/backend-todos";')).toEqual([]);
  });

  test("R4", () => {
    const bad = r4("packages/backend/routines/src/a.ts", "const x = 1;\nawait db().todo.findMany();", models);
    expect(bad).toMatchObject([{ rule: "R4", line: 2 }]);
    expect(r4("services/worker/src/job.ts", "await prisma.todo.deleteMany();", models)).toHaveLength(1);
    expect(r4("packages/backend/routines/src/a.ts", "await db().routineRun.create(); await db().$queryRaw``;", models)).toEqual(
      [],
    );
  });

  test("R5", () => {
    const bad = "model RoutineRun {\n  id String @id\n  todo Todo @relation(fields: [todoId], references: [id])\n}";
    expect(r5(`${SCHEMA_DIR}/routines.prisma`, bad, models)).toMatchObject([{ rule: "R5", line: 3 }]);
    expect(r5(`${SCHEMA_DIR}/routines.prisma`, "model RoutineRun {\n  todoId String\n}", models)).toEqual([]);
  });

  test("R6", () => {
    expect(r6("packages/backend/todos/src/a.ts", 'app.route("/internal", internal);')).toMatchObject([{ rule: "R6" }]);
    expect(r6("packages/backend/todos/src/a.ts", 'app.route("/api", api);')).toEqual([]);
  });

  test("R7", () => {
    expect(r7("packages/backend/kernel/src/a.ts", 'import { PrismaClient } from "@prisma/client";')).toMatchObject([
      { rule: "R7" },
    ]);
    expect(r7("packages/backend/kernel/src/a.ts", 'import { Hono } from "hono";')).toHaveLength(1);
    expect(r7("packages/backend/kernel/src/a.ts", 'import type { Context } from "hono";')).toEqual([]);
  });
});
