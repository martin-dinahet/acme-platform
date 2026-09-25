import { prisma } from "./client.js";

const MODULE_SCHEMAS = ["auth", "todos", "routines"];

/** Truncates all tables in all module schemas. Refuses a database whose name does not end with `_test`. */
export const resetDatabase = async () => {
  const [{ name }] = await prisma.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`;
  if (!name.endsWith("_test")) throw new Error(`resetDatabase: refusing to truncate database "${name}"`);

  const tables = await prisma.$queryRaw<{ name: string }[]>`
    SELECT format('%I.%I', schemaname, tablename) AS name
    FROM pg_tables WHERE schemaname = ANY(${MODULE_SCHEMAS})`;
  if (tables.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => t.name).join(", ")} CASCADE`);
  }
};

export { prisma };
