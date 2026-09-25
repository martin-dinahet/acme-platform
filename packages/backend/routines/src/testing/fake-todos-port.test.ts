import { describeTodosPortContract } from "../ports/todos-port.contract.js";
import { createFakeTodosPort } from "./fake-todos-port.js";

// The fake must behave like the real adapters, or unit tests prove nothing.
describeTodosPortContract("in-memory fake", async () => ({
  port: createFakeTodosPort().port,
  owners: ["alice", "bob"],
}));
