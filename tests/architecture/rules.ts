// Boundary rules R1–R7 as pure functions: (path, source) -> violations. Paths are relative to the repository root.

export type Violation = { rule: string; file: string; line: number; message: string };

export const MODULES = ["auth", "todos", "routines"] as const;
export type ModuleName = (typeof MODULES)[number];

const lineOf = (source: string, index: number) => source.slice(0, index).split("\n").length;

export type Import = { specifier: string; line: number; typeOnly: boolean; names: string[] };

/** Static imports and re-exports (also multi-line), side-effect imports and dynamic `import()`. */
export const parseImports = (source: string): Import[] => {
  const found: Import[] = [];
  const fromRe = /\b(import|export)\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
  for (const m of source.matchAll(fromRe)) {
    const clause = m[3];
    if (/[;]/.test(clause)) continue; // Matched across two statements: not one import.
    const names = [...clause.matchAll(/(?:type\s+)?(\w+)(?:\s+as\s+\w+)?/g)].map((n) => n[1]);
    found.push({ specifier: m[4], line: lineOf(source, m.index), typeOnly: Boolean(m[2]), names });
  }
  for (const m of source.matchAll(/\bimport\s+["']([^"']+)["']/g)) {
    found.push({ specifier: m[1], line: lineOf(source, m.index), typeOnly: false, names: [] });
  }
  for (const m of source.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) {
    found.push({ specifier: m[1], line: lineOf(source, m.index), typeOnly: false, names: [] });
  }
  return found;
};

/** `packages/backend/<module>/...` -> module name, else null. */
export const moduleOf = (file: string): ModuleName | null => {
  const m = file.match(/^packages\/backend\/([^/]+)\//);
  return m && (MODULES as readonly string[]).includes(m[1]) ? (m[1] as ModuleName) : null;
};

const isTest = (file: string) => /\.test\.tsx?$/.test(file);

/** R1: a backend module imports only `@acme/backend-db` and `@acme/backend-kernel` of the backend packages. */
export const r1 = (file: string, source: string): Violation[] => {
  const own = moduleOf(file);
  if (!own) return [];
  return parseImports(source).flatMap(({ specifier, line }) => {
    const pkg = specifier.match(/^@acme\/(backend-[\w-]+|service-[\w-]+)/)?.[1];
    const crossPackage = pkg && !["backend-db", "backend-kernel", `backend-${own}`].includes(pkg);
    const crossRelative = specifier.startsWith(".") && MODULES.some((m) => m !== own && specifier.includes(`/${m}/`));
    return crossPackage || crossRelative
      ? [{ rule: "R1", file, line, message: `module "${own}" imports "${specifier}"` }]
      : [];
  });
};

/** R2: only `services/*` import module factories (`create*Module`) from a backend package. */
export const r2 = (file: string, source: string): Violation[] => {
  if (file.startsWith("services/")) return [];
  return parseImports(source).flatMap(({ specifier, line, names }) =>
    specifier.startsWith("@acme/backend-")
      ? names
          .filter((name) => /^create\w+Module$/.test(name))
          .map((name) => ({ rule: "R2", file, line, message: `imports factory "${name}" outside services/*` }))
      : [],
  );
};

/** R3: frontend packages import backend and service packages only with `import type`. */
export const r3 = (file: string, source: string): Violation[] => {
  if (!file.startsWith("packages/frontend/") && !file.startsWith("services/frontend/")) return [];
  return parseImports(source).flatMap(({ specifier, line, typeOnly }) =>
    /^@acme\/(backend|service)-/.test(specifier) && !typeOnly
      ? [{ rule: "R3", file, line, message: `runtime import of "${specifier}" (use "import type")` }]
      : [],
  );
};

/** `model Todo` in a `.prisma` file -> ["todo"] (Prisma client property names). */
export const modelsOf = (prisma: string) =>
  [...prisma.matchAll(/^model\s+(\w+)\s*\{/gm)].map((m) => m[1].charAt(0).toLowerCase() + m[1].slice(1));

/**
 * R4: a module uses only the Prisma models of its own `<module>.prisma`.
 * Services use no model in non-test code: they go through module APIs.
 */
export const r4 = (file: string, source: string, modelsByModule: Record<ModuleName, string[]>): Violation[] => {
  const own = moduleOf(file);
  const service = file.startsWith("services/") && !isTest(file);
  if (!own && !service) return [];
  const allowed = new Set(own ? modelsByModule[own] : []);
  const all = new Set(Object.values(modelsByModule).flat());
  const access = /\b(?:db\(\)|tx|prisma)\s*\.\s*([A-Za-z_]\w*)/g;
  return [...source.matchAll(access)].flatMap((m) =>
    all.has(m[1]) && !allowed.has(m[1])
      ? [{ rule: "R4", file, line: lineOf(source, m.index), message: `uses Prisma model "${m[1]}" of an other module` }]
      : [],
  );
};

/** R5: no relation between models of two module schemas. Checks each `<module>.prisma` against the other files. */
export const r5 = (file: string, source: string, modelsByModule: Record<ModuleName, string[]>): Violation[] => {
  const own = MODULES.find((m) => file.endsWith(`/${m}.prisma`));
  if (!own) return [];
  const foreign = new Set(
    MODULES.filter((m) => m !== own)
      .flatMap((m) => modelsByModule[m])
      .map((name) => name.charAt(0).toUpperCase() + name.slice(1)),
  );
  const field = /^\s+\w+\s+(\w+)(\[\])?\??/gm;
  return [...source.matchAll(field)].flatMap((m) =>
    foreign.has(m[1])
      ? [{ rule: "R5", file, line: lineOf(source, m.index), message: `field of type "${m[1]}" crosses module schemas` }]
      : [],
  );
};

/** R6: no `/internal` routes. */
export const r6 = (file: string, source: string): Violation[] =>
  [...source.matchAll(/["'`]\/internal\b/g)].map((m) => ({
    rule: "R6",
    file,
    line: lineOf(source, m.index),
    message: "`/internal` route: modules talk in-process through ports",
  }));

/** R7: kernel has no runtime dependency on Prisma, Hono, the db package or a module. */
export const r7 = (file: string, source: string): Violation[] => {
  if (!file.startsWith("packages/backend/kernel/")) return [];
  return parseImports(source).flatMap(({ specifier, line, typeOnly }) =>
    !typeOnly && /^(@prisma\/|prisma$|hono|@hono\/|@acme\/backend-|@acme\/service-)/.test(specifier)
      ? [{ rule: "R7", file, line, message: `kernel imports "${specifier}" at runtime` }]
      : [],
  );
};

export const format = (v: Violation) => `${v.rule} ${v.file}:${v.line} ${v.message}`;
