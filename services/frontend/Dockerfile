# syntax=docker/dockerfile:1
# Build context: repository root.

# ---------- Build ----------
FROM oven/bun:1.4.2-alpine AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
COPY bun.lock package.json bunfig.toml ./
COPY packages ./packages
COPY services ./services
RUN bun install --frozen-lockfile --filter @acme/frontend
RUN bun run --cwd services/frontend build

# ---------- Runtime ----------
FROM oven/bun:1.4.2-alpine AS runtime
WORKDIR /app
COPY --from=build /app/services/frontend/dist ./dist
COPY services/frontend/serve.ts ./serve.ts
ENV PORT=80
EXPOSE 80
CMD ["bun", "serve.ts"]
