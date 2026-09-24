import { AuthPage, SessionGate, UserMenu } from "@acme/frontend-auth";
import { TodosPage } from "@acme/frontend-todos";
import { AppShell } from "./components/app-shell.js";

const SIGN_IN_PATH = "/login";

const goHome = () => window.location.assign("/");

const Home = () => (
  <SessionGate signInUrl={SIGN_IN_PATH}>
    {(user) => (
      <AppShell title="Todos" actions={<UserMenu email={user.email} />}>
        <TodosPage />
      </AppShell>
    )}
  </SessionGate>
);

export const App = () =>
  window.location.pathname === SIGN_IN_PATH ? <AuthPage onSuccess={goHome} /> : <Home />;
