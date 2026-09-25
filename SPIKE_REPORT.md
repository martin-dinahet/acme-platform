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

### Phase 2: `kernel` + `auth`

- `@punpun-dev/ts-result@0.1.4` installs and is used. Its API is class-based: `Result.success/failure`, `isSuccess()`, `mapValue`, `flatMapValue`, `match`, `Result.handle`. Not `ok/err/map/flatMap/handle` as the task says. `kernel` adds `ok`, `err`, `notFound` aliases and `statusOf(error)`.
- Better Auth in schema `auth`: works. `@better-auth/prisma-adapter@1.7.5` calls `db[model].create(...)` on Prisma model delegates, so the Postgres schema is transparent to it. Test `packages/backend/auth/src/auth.int.test.ts`: sign-up writes `auth."user"`, no `public.user` table, `requireUser` works in-process.
- Better Auth uses the root `prisma` client, not `db()`. Sign-up does not join an outer `runInTransaction`. No use case needs this now.
- Module config comes from the factory (`createAuthModule({ baseURL, secret, trustedOrigins })`). Only `db` reads env (`DATABASE_URL`).
- Old `services/auth` deleted in this phase (it imported the old `authHandler`). Each old service is deleted in the phase that replaces its module, so typecheck stays green.
- Backend packages now export `src/*.ts` directly (no `tsc` build, no `dist`). Bun runs TS. Reason: less build config.

### Phase 3: `todos` module

- Layers: `domain/todo.ts`, `application/*` (1 use case per file + `todo-repository.ts` port), `infrastructure/todo-repository.ts` (`db()`, model `todo` only), `http/routes.ts`, `api.ts`, `use-cases.ts`, `index.ts`.
- Owner scope: repository uses `findFirst/updateMany/deleteMany` with `{ id, ownerId }`. No throw on a missing row. Other user's todo = 404 (same as missing). Missing todo: 404 (baseline: 500).
- `createMany` runs in the injected `TransactionRunner`. Called from routines, it joins the outer transaction.
- `ts-result` friction: `Result` is a class, not a discriminated union. `if (r.isSuccess()) … else …` does not narrow the `else` branch. `match()` infers its return type from the `success` branch only, so a Hono route with 200 + 404 in `match` does not typecheck. Pattern used: `if (r.isFailure()) return c.json(…, statusOf(r.error)); const v = r.unwrapOrThrow();`.
- `DELETE /api/todos/:id` now returns `{ id }` (baseline: `{ todo }`). Frontend ignores the body.
- Frontend: `hc<TodosRoutes>` with `import type` from `@acme/backend-todos`. Typecheck passes, RPC types infer.
- Tests: `use-cases.test.ts` (6), `http/routes.test.ts` (4), `infrastructure/todo-repository.int.test.ts` (3).
- Old `services/todos` and `/internal` routes deleted.

### Phase 4: `routines` module

- `TodosPort` (owned by routines): `createMany(ownerId, titles)`, `find(ownerId, ids)`. `delete` removed.
- `runRoutine`: one `transaction(...)`, no manual rollback. The todos `createMany` use case also calls `transaction(...)`, and it joins the outer one (nested join, test 3).
- `RoutineRun.todoIds String[]` replaced by `routines.routine_run_todo(runId, todoId, position)`, FK to run only, `todoId` without FK (R5). Domain `RoutineRun.todoIds` stays (repository maps rows to IDs). API shape unchanged.
- Routines is scoped by `ownerId` too (routine + run). Baseline was not.
- Test 2 and test 7 (in-process) live in `services/api/src/`, not in `packages/backend/routines`. Reason: they need both modules wired. A routines test cannot import todos (R1) or touch `todo` (R4). The contract suite itself stays in routines (`ports/todos-port.contract.ts`, exported by `@acme/backend-routines/testing`): the port owner owns the contract.
- Test 2 result: failure on 3rd todo -> `{ todos: 0, runs: 0, runTodos: 0 }`. Control with `transaction = (fn) => fn()`: same failure -> `{ todos: 2, runs: 0, runTodos: 0 }` (2 orphans). Control without failure: `{ 3, 1, 3 }`.
- Contract (7 cases) passes against the in-memory fake (unit) and the in-process adapter (int, real DB).
- A run failure now gives 500 (Hono default). Baseline gave 502 after compensation.
- Old `services/routines`, HTTP adapter, `TODOS_SERVICE_URL` deleted.

### Phase 5: deployables

- `services/api`: `container.ts` (only file that knows all modules), `app.ts` (CORS, CSRF, `/api/auth/*`, `requireUser`, module routes, `x-served-by`, `/health`, JSON `onError`), `index.ts` (`export default { port, fetch }`). CORS/CSRF behavior same as gateway (`WEB_ORIGINS`). Better Auth `trustedOrigins` = `WEB_ORIGINS` (one variable less).
- `services/worker`: `container.ts` wires only `todos` (the only module that jobs use), not the full api wiring. Loop ticks on multiples of `JOB_INTERVAL_MS` (aligned between replicas). SIGTERM/SIGINT: finish current tick, `$disconnect`, exit 0 (checked in dev: `stopping` then `worker stopped`).
- `withLock`: `pg_try_advisory_xact_lock(key::bigint)` in `runInTransaction`; the job writes in the same transaction. Added `holdMs` (worker: `LOCK_HOLD_MS`, default 2000). Reason: a fast job releases the xact lock after a few ms; a replica that tries later in the same tick gets the lock and runs again. Test 5 has a case for this.
- `services/migrate`: Dockerfile only, `bun --bun prisma migrate deploy`. api and worker do not migrate.
- `services/frontend`: nginx replaced by `serve.ts` (`Bun.serve`, SPA fallback, path check). Runtime image `oven/bun:1.4.2-alpine`.
- `services/edge/Caddyfile`: `dynamic a api 3000 { refresh 5s }`, `lb_policy round_robin`, `lb_try_duration 5s`.
- Local dev: one root `.env`. `services/*` dev scripts use `bun --env-file=../../.env --watch`; `prisma.config.ts` loads root `.env`. Checked: api + worker via `turbo run dev`, full product flow with curl/fetch.
- Docker build issue: `prisma generate` reads the `db` tsconfig, which extends `@acme/typescript-config`. With `bun install --production` that dev dependency is missing -> generate fails. Fix: `@acme/typescript-config` is a runtime dependency of `db`.
- Test 4 (`services/api/src/app.int.test.ts`): 2 real Better Auth sessions through `app.request()`. Bob: list = empty; read/update/delete todo = 404; read/update/delete/run/list-runs routine = 404. No session = 401.
- Test 5 (`services/worker/src/lib/with-lock.int.test.ts`): 5 pass.

### Phase 6: architecture tests + scale check

Architecture tests (`tests/architecture/`, run by `bun test`):
- `rules.ts`: R1–R7 as pure functions `(path, source) -> violations`. Imports parsed by regex (multi-line, `import type`, re-export, dynamic `import()`). R4: `model X` from each `<module>.prisma` -> camelCase -> checks `db().x`, `tx.x`, `prisma.x`. R4 also: `services/*` non-test code uses no Prisma model (worker must use the todos API). R5: a field in `<module>.prisma` whose type is a model of another module file.
- `architecture.test.ts`: 7 repo checks (R1–R7) + 8 fixture tests (each rule fails on a bad string, passes on a good one) + 1 sanity test (> 50 files scanned). 16 pass.
- Planted-violation check (file added, then removed): output `R1 packages/backend/routines/src/zz-bad.ts:2 module "routines" imports "@acme/backend-todos"`, `R2 …:2 imports factory "createTodosModule" outside services/*`, `R4 …:4 uses Prisma model "todo" of an other module`.
- Root files (`tests`, `scripts`, `services/frontend/serve.ts`) added to `bun run typecheck` (`tsconfig.root.json`) and `bun run lint`.

Issues found only in Docker (not in local dev):
1. `@acme/env` exported `dist/env.js` (tsc build). Images have no `dist` -> `Cannot find module '@acme/env'`, api/worker restart loop. Local dev worked only because Turbo had built `dist` before. Fix: `@acme/env` exports `src/env.ts` (same as the backend packages).
2. One `docker compose up --build` failed at `bun install --frozen-lockfile` in the worker image. The same build passed on retry without change. Probably a registry fetch error during 4 parallel installs. Not investigated further.

Scale run (compose project `acme-spike`, `POSTGRES_PORT=5434`, `FRONTEND_PORT=5183`, `JOB_INTERVAL_MS=10000`):

```
$ docker compose -p acme-spike down -v
$ docker compose -p acme-spike up -d --build --scale api=3 --scale worker=2
acme-spike-api-1/2/3        Up
acme-spike-edge-1           Up   0.0.0.0:3000->3000
acme-spike-frontend-1       Up   0.0.0.0:5183->80
acme-spike-migrate-1        Exited (0)          # "All migrations have been successfully applied."
acme-spike-postgres-1       Up (healthy)
acme-spike-worker-1/2       Up
```

Load balancing and session on all replicas (one cookie, full flow through edge):
```
POST /api/auth/sign-up/email -> 200 [ffa0cee7ffe9]
POST /api/todos -> 201 [909cb23435ed]
PUT /api/todos/… -> 200 [b0fe956edfd3]
POST /api/routines/…/runs -> 201 [ffa0cee7ffe9]
GET /api/routines/…/runs -> 200 [b0fe956edfd3]   progress 1/3
GET /api/todos/<deleted> -> 404 [909cb23435ed]
GET /api/auth/get-session -> 200 [b0fe956edfd3]
distinct x-served-by: ffa0cee7ffe9, 909cb23435ed, b0fe956edfd3
$ curl -D - localhost:3000/health  (x6) -> 909c, b0fe, ffa0, 909c, b0fe, ffa0   (round robin)
```

Worker lock (per-tick summary of `docker compose logs --timestamps worker`; one old completed todo inserted by SQL before):
```
22:36:50 ran=7fddbadd1fee(count 0) skipped=1
22:37:10 ran=1befb6bdb04e(count 1) skipped=1     # the old todo, purged once
22:37:20 ran=7fddbadd1fee(count 0) skipped=1
…
22:40:20 ran=7fddbadd1fee(count 0) skipped=2     # 3 workers from here
22:40:40 ran=1befb6bdb04e(count 0) skipped=2
ticks=24 ticks-without-exactly-one-winner=0
```
Raw lines: `{"job":"purge-completed-todos","ran":true,"count":1,"host":"1befb6bdb04e"}` / `{"job":"purge-completed-todos","ran":false,"count":0,"host":"7fddbadd1fee"}`.

Separate scaling (no restart of other containers):
```
$ docker compose -p acme-spike up -d --no-recreate --scale api=2 --scale worker=3
api-1, api-2 Up 3 minutes; worker-1, worker-2 Up 3 minutes; worker-3 Up <1 s   (api-3 removed)
after 7 s, edge: x-served-by b0fe, 909c, b0fe, 909c   (Caddy dynamic A refresh 5 s)
```

Browser (Chrome, http://localhost:5183 -> edge :3000 -> 3 api): sign-up, empty list for new user (data of other test user not visible), add 2 todos, toggle 1, delete 1, reload (state kept), sign out, sign in (state kept). The frontend has no routines UI (none in base commit `576d85b` either). Routines CRUD, run and run progress checked through the edge with the API only (see flow above).

### Phase 7: split rehearsal

- `services/api/src/adapters/todos-port.http.ts` (40 lines): `TodosPort` over the public todos API with `hc<TodosRoutes>` (type import only). Not wired in the container. No `/internal` route (R6).
  - `createMany` = N × `POST /todos`. `find` = `GET /todos` + filter (no batch endpoint).
  - Needs `headersFor(ownerId)`: the adapter must act as the user. Test forwards the session cookie. A real split needs a service credential + a trusted user ID, or the user's token.
- Contract test 7 against a running api (`Bun.serve` on a random port, real HTTP, `acme_test`): 7 pass. Same 7 cases pass for in-process adapter and fake. No change to routines application code.
- `services/api/src/split-rehearsal.int.test.ts`: test 2 scenario over HTTP. Routines still wraps the run in `runInTransaction`, but todos are made by other HTTP requests with their own transactions. Result: HTTP 500, **2 orphan todos**, 0 runs. The atomic claim holds only in-process.
- Architecture test false positive found: R6 matched `/internal` in a comment of the adapter. Fix: R4 and R6 strip comments first. Fixture added (comment passes, code in string fails).
