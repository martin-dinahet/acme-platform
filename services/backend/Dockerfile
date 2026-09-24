# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM oven/bun:1.4.2-alpine AS base
WORKDIR /app

# ---------- Build ----------
FROM base AS build
# Prisma config needs these to exist at generate time. Real values come at runtime.
ENV AUTH_DATABASE_URL=dummy://build:placeholder@localhost:5432/dummy
ENV TODOS_DATABASE_URL=dummy://build:placeholder@localhost:5432/dummy
COPY bun.lock package.json turbo.json tsconfig.json ./
COPY packages ./packages
COPY services ./services
RUN bun install --frozen-lockfile
RUN bun run --cwd packages/backend/auth db:generate
RUN bun run --cwd packages/backend/todos db:generate
RUN bun run turbo run build --filter=@acme/backend

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/services/backend
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages /app/packages
COPY --from=build /app/services/backend .
EXPOSE 3000
CMD ["sh", "-c", "cd /app/packages/backend/auth && node_modules/.bin/prisma migrate deploy && cd /app/packages/backend/todos && node_modules/.bin/prisma migrate deploy && cd /app/services/backend && node dist/index.js"]
