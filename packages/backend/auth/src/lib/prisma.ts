import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client.js";
import { env } from "./env.js";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: env.AUTH_DATABASE_URL,
  }),
});
