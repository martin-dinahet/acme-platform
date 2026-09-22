/** Copy and input hints for each auth mode. Add a mode here to support it in the UI. */
export const authModes = {
  "sign-in": {
    title: "Sign in",
    tab: "Sign in",
    submit: "Sign in",
    passwordAutoComplete: "current-password",
  },
  "sign-up": {
    title: "Create an account",
    tab: "Sign up",
    submit: "Create account",
    passwordAutoComplete: "new-password",
  },
} as const;

export type AuthMode = keyof typeof authModes;

export const authModeKeys = Object.keys(authModes) as AuthMode[];
