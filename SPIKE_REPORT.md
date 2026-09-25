# Spike report: modular monolith

Branch: `spike/modular-monolith`. Base: `576d85b` (microservices).

Note: maintainer working copy on `refactor/microservices` had uncommitted work. Spike starts from last commit `576d85b` in a separate worktree. Uncommitted work (owner migrations, `packages/lib/identity`, Bun frontend server) is not in baseline and not in spike.

## 0. Baseline (microservices, `576d85b`)

Machine: macOS (Darwin 25.6), Docker 29.8.0, Compose v5.1.2, Bun 1.4.2.
Run: separate compose project `acme-baseline` with override file (no `container_name`, other host ports). Reason: maintainer container `acme-postgres` uses port 5432.

| Metric | Value | How |
|---|---|---|
| Containers | 6 (postgres, gateway, auth, todos, routines, frontend) | `docker compose ps` |
| Memory, sum, 1 min idle | 112.5 MiB (auth 31.1, postgres 25.7, routines 17.8, todos 17.1, gateway 14.4, frontend 6.5) | `docker stats --no-stream` after 65 s |
| Cold build | 927.7 s (5 images) | `docker compose build --no-cache` |
| Image size | 4 × 1.12 GB (backend, `node:22-alpine` + full `node_modules`) + 94.6 MB (frontend, nginx) | `docker images` |
| `bun run typecheck` | 3.2 s wall (Turbo: 2.2 s, 17 tasks, `--force`) | TypeScript 7.0.2 |
| `.env` variables | 21 entries, 13 distinct names, in 9 `.env.example` files | `grep '^[A-Z_]*='` |
| `environment:` entries in compose | 19 (+ 1 build arg) | `compose.yaml` |
| Workspace packages | 14 | `package.json` files |

Smoke check: sign-up through gateway returns 200. `POST /api/routines` returns 201.

### Wiring and cross-service code

| File | Lines | Role |
|---|---|---|
| `services/gateway/src/app.ts` | 24 | routing, CORS, CSRF |
| `services/gateway/src/index.ts` | 7 | entry point |
| `services/gateway/src/lib/env.ts` | 17 | service URLs |
| `services/gateway/src/lib/forward.ts` | 24 | proxy, `x-user-id` |
| `services/gateway/src/lib/session.ts` | 19 | session check over HTTP |
| `packages/backend/routines/src/lib/todos-adapter.ts` | 25 | HTTP adapter |
| `packages/backend/routines/src/lib/todos-port.ts` | 9 | port (kept) |
| `services/{auth,todos,routines}/src/{app,index,lib/env}.ts` | 61 | thin service entry points |
| **Subtotal (files above)** | **186** | |
| `packages/backend/todos/src/todos.ts:17,53-66` | 15 | `/internal` routes |
| `packages/backend/routines/src/routines.ts:63-70` | 8 | manual rollback |
| **Total TS wiring** | **209** | |
| 5 Dockerfiles + `compose.yaml` + `scripts/init-databases.sh` | 233 | deploy config |

Known defects in baseline: todos not scoped to user; missing todo returns 500; `RoutineRun.todoIds String[]` without FK; routines not scoped to user.

## Phase log

### Phase 1: `db` package

- Multi-file schema: `packages/backend/db/prisma/schema/{_datasource,auth,todos,routines}.prisma`. `prisma.config.ts` has `schema: "prisma/schema"` (folder). Source: installed `@prisma/config@7.10.0` types, `schema?: string` = "path to the schema file, or path to a folder that shall be recursively searched for *.prisma files".
- `multiSchema`: no preview flag in Prisma 7.10.0. `datasource.schemas = [...]` + `@@schema(...)`. `prisma migrate dev` output: `schemas "auth, routines, todos"`. The `init` migration has `CREATE SCHEMA IF NOT EXISTS` for each module. `_prisma_migrations` is in `public`.
- All FKs in `init` stay in one schema (R5): `auth.session/account -> auth.user`, `routines.routine_step/routine_run -> routines.routine`, `routines.routine_run_todo -> routines.routine_run`.
- `bun --bun prisma migrate deploy` works (Bun runtime, not Node).
- Interactive transactions: `$transaction(fn, { maxWait, timeout, isolationLevel })` in installed `@prisma/client@7.10.0` types. Default `maxWait` 2000 ms, `timeout` 5000 ms.
- Test 3 (`packages/backend/db/src/transaction.int.test.ts`): 5 pass. Write through `db()` after `setTimeout`, `setImmediate`, `Promise.resolve` rolls back. Nested call joins outer transaction. Two parallel transactions keep separate contexts.
- Current Prisma web docs describe Prisma 8, not 7. Prisma 7 facts come from the installed package types and from tests.
- One Prisma client = one model namespace. Model names must be unique across modules (e.g. two modules cannot both have `Item`). Use a module prefix if this occurs.
- `resetDatabase()` refuses a database whose name does not end with `_test`. Reason: `bun test` from a wrong shell must not truncate dev data.
