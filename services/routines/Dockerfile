# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM oven/bun:1.4.2-alpine AS base
WORKDIR /app

# ---------- Build ----------
FROM base AS build
# Prisma config needs this to exist at generate time. Real value comes at runtime.
ENV ROUTINES_DATABASE_URL=dummy://build:placeholder@localhost:5432/dummy
COPY bun.lock package.json turbo.json tsconfig.json ./
COPY packages ./packages
COPY services ./services
RUN bun install --frozen-lockfile
RUN bun run --cwd packages/backend/routines db:generate
RUN bun run turbo run build --filter=@acme/service-routines

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/services/routines
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages /app/packages
COPY --from=build /app/services/routines .
EXPOSE 3003
# Each service migrates only its own database.
CMD ["sh", "-c", "cd /app/packages/backend/routines && node_modules/.bin/prisma migrate deploy && cd /app/services/routines && node dist/index.js"]
