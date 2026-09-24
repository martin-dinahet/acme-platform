import { fileURLToPath } from "node:url";
import stylex from "@stylexjs/unplugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Monorepo root. StyleX needs this to resolve `@acme/ui`'s tokens across the workspace boundary.
const rootDir = fileURLToPath(new URL("../../..", import.meta.url));

export default defineConfig({
  plugins: [
    // StyleX must run before the React plugin to keep Fast Refresh working.
    stylex.vite({ useCSSLayers: true, unstable_moduleResolution: { type: "commonJS", rootDir } }),
    react(),
  ],
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
});
