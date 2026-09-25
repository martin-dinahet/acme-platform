import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Folder: Prisma reads all `*.prisma` files in it. One file for each module.
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma generate` does not connect, so the build can run without DATABASE_URL.
    // `migrate` commands fail on this placeholder if DATABASE_URL is missing.
    url: process.env.DATABASE_URL ?? "postgresql://unset@localhost:1/unset",
  },
});
