/// <reference types="vite/client" />

// Browser-side env, read by Vite at build time. Kept apart from `createEnv` (Node only).
// Built by the consuming Vite app, not by `tsc` (see tsconfig `exclude`).

/** Backend origin as the browser sees it. */
export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
