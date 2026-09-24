# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM oven/bun:1.4.2-alpine AS base
WORKDIR /app

# ---------- Build ----------
FROM base AS build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
# frontend-todos imports types from backend-todos, so its Prisma client must exist. Prisma config needs this at generate time.
ENV TODOS_DATABASE_URL=dummy://build:placeholder@localhost:5432/dummy
COPY bun.lock package.json turbo.json tsconfig.json ./
COPY packages ./packages
COPY services ./services
RUN bun install --frozen-lockfile
RUN bun run --cwd packages/backend/todos db:generate
RUN bun run turbo run build --filter=@acme/frontend

# ---------- Runtime ----------
FROM nginx:alpine AS runtime
COPY services/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/services/frontend/dist /usr/share/nginx/html
EXPOSE 80
