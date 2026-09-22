import { AppShell } from "./components/app-shell.js";
import { SessionGate } from "./features/session/components/session-gate.js";
import { UserMenu } from "./features/session/components/user-menu.js";
import { TodosPage } from "./features/todos/components/todos-page.js";

export const App = () => (
  <SessionGate>
    {(user) => (
      <AppShell title="Todos" actions={<UserMenu email={user.email} />}>
        <TodosPage />
      </AppShell>
    )}
  </SessionGate>
);
