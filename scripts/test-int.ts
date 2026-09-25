// Integration tests: makes the test database if missing, migrates it, then runs `*.int.test.ts`.
// Test database URL: TEST_DATABASE_URL, or DATABASE_URL with the database name `acme_test`.
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";

const root = resolve(import.meta.dir, "..");
dotenv.config({ path: resolve(root, ".env") });

const base = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!base) throw new Error("test:int: set TEST_DATABASE_URL or DATABASE_URL");

const url = new URL(base);
if (!process.env.TEST_DATABASE_URL) url.pathname = "/acme_test";
const name = url.pathname.slice(1);
if (!name.endsWith("_test")) throw new Error(`test:int: database "${name}" must end with _test`);

const admin = new URL(url);
admin.pathname = "/postgres";
const client = new Client({ connectionString: admin.toString() });
await client.connect();
const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
if (exists.rowCount === 0) await client.query(`CREATE DATABASE "${name}"`);
await client.end();

const env = { ...process.env, DATABASE_URL: url.toString() };
const run = (cmd: string[], cwd = root) => {
  const { exitCode } = Bun.spawnSync(cmd, { cwd, env, stdio: ["inherit", "inherit", "inherit"] });
  if (exitCode !== 0) process.exit(exitCode ?? 1);
};

run(["bun", "--bun", "prisma", "migrate", "deploy"], resolve(root, "packages/backend/db"));
const filters = process.argv.slice(2);
run(["bun", "--config=bunfig.int.toml", "test", ...(filters.length > 0 ? filters : [".int.test."])]);
