# syntax=docker/dockerfile:1
# One-shot: applies the migrations of `packages/backend/db`, then exits 0. Build context: repository root.
FROM oven/bun:1.4.2-alpine
WORKDIR /app
COPY bun.lock package.json bunfig.toml ./
COPY packages ./packages
COPY services ./services
RUN bun install --frozen-lockfile --production --filter @acme/backend-db
WORKDIR /app/packages/backend/db
USER bun
CMD ["bun", "--bun", "prisma", "migrate", "deploy"]
