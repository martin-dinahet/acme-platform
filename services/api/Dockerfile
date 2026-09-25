# syntax=docker/dockerfile:1
# Build context: repository root.
FROM oven/bun:1.4.2-alpine
WORKDIR /app
COPY bun.lock package.json bunfig.toml ./
COPY packages ./packages
COPY services ./services
RUN bun install --frozen-lockfile --production --filter @acme/service-api
RUN bun run --cwd packages/backend/db db:generate
ENV NODE_ENV=production
WORKDIR /app/services/api
EXPOSE 3000
USER bun
# No migration here: the `migrate` service runs it once before api starts.
CMD ["bun", "src/index.ts"]
