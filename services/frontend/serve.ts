// Static server for the built SPA. Unknown paths get `index.html` (client-side routing).
import { join, normalize } from "node:path";

const root = join(import.meta.dir, "dist");
const index = Bun.file(join(root, "index.html"));

Bun.serve({
  port: Number(process.env.PORT ?? 80),
  async fetch(request) {
    const path = normalize(join(root, decodeURIComponent(new URL(request.url).pathname)));
    if (!path.startsWith(root)) return new Response("Not found", { status: 404 });
    const file = Bun.file(path);
    return new Response((await file.exists()) ? file : index);
  },
});
