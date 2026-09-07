# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------- Build ----------
FROM base AS build
ARG DATABASE_URL=dummy://build:placeholder@localhost:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.json ./
COPY packages ./packages
COPY services/todos ./services/todos
RUN pnpm install --frozen-lockfile
RUN pnpm --filter todos-service run db:generate
RUN pnpm turbo run build --filter=todos-service
RUN pnpm --filter todos-service deploy /out

# ---------- Runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /out .
EXPOSE 3001
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/index.js"]
