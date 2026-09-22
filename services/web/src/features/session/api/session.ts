import { api } from "../../../lib/api.js";
import { env } from "../../../lib/env.js";

export const useSession = api.auth.useSession;

export const redirectToLogin = () => window.location.assign(env.VITE_LOGIN_URL);

export const signOut = async () => {
  await api.auth.signOut();
  redirectToLogin();
};
