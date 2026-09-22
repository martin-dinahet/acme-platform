# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM oven/bun:1.4.2-alpine AS base
WORKDIR /app

# ---------- Build ----------
FROM base AS build
ARG DATABASE_URL=dummy://build:placeholder@localhost:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
COPY bun.lock package.json turbo.json tsconfig.json ./
COPY packages ./packages
COPY services ./services
RUN bun install --frozen-lockfile
RUN bun run --cwd services/service-todos db:generate
RUN bun run turbo run build --filter=todos-service

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/services/service-todos
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages /app/packages
COPY --from=build /app/services/service-todos .
EXPOSE 3001
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/index.js"]
