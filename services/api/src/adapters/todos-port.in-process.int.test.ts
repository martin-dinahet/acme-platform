import { runInTransaction } from "@acme/backend-db";
import { resetDatabase } from "@acme/backend-db/testing";
import { describeTodosPortContract } from "@acme/backend-routines/testing";
import { createTodosModule } from "@acme/backend-todos";
import { createInProcessTodosPort } from "./todos-port.in-process.js";

// Test 7: the port contract against the in-process adapter and the real database.
describeTodosPortContract("in-process adapter", async () => {
  await resetDatabase();
  return {
    port: createInProcessTodosPort(createTodosModule({ transaction: runInTransaction }).api),
    owners: ["alice", "bob"],
  };
});
