# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM oven/bun:1.4.2-alpine AS base
WORKDIR /app

# ---------- Build ----------
FROM base AS build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_APP_URL=http://localhost:5173
ENV VITE_APP_URL=$VITE_APP_URL
ARG DATABASE_URL=dummy://build:placeholder@localhost:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
COPY bun.lock package.json turbo.json tsconfig.json ./
COPY packages ./packages
COPY services ./services
RUN bun install --frozen-lockfile
RUN bun run --cwd services/service-todos db:generate
RUN bun run turbo run build --filter=web-login-service

# ---------- Runtime ----------
FROM nginx:alpine AS runtime
COPY services/web-login/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/services/web-login/dist /usr/share/nginx/html
EXPOSE 80
