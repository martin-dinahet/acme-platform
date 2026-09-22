import { AuthPage } from "./features/auth/components/auth-page.js";
import { env } from "./lib/env.js";

const redirectToApp = () => window.location.assign(env.VITE_APP_URL);

/** The standalone login app: authenticate, then go back to the main app. */
export const App = () => <AuthPage onSuccess={redirectToApp} />;
