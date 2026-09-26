# Spike report: modular monolith

Branch: `spike/modular-monolith`. Base: `576d85b` (microservices).

Note: maintainer working copy on `refactor/microservices` had uncommitted work. Spike starts from last commit `576d85b` in a separate worktree. Uncommitted work (owner migrations, `packages/lib/identity`, Bun frontend server) is not in baseline and not in spike.

**Summary.** The modular monolith works on Prisma 7 + adapter-pg + Bun. One database, one Postgres schema for each module, one migration history. A routine run is atomic across two modules (test 2: 0 orphans; same failure without transaction: 2 orphans; over HTTP: 2 orphans). `api` and `worker` scale separately (3 api + 2/3 workers, 24 ticks, 0 double runs). Costs: more idle memory than baseline (137.7 vs 112.5 MiB at scale 1), no failure isolation between modules, one migration history for all modules.

## 1. Before/after

Same machine, same method as section 0. Spike: default scale (1 api, 1 worker). One run for each value.

| Metric | Microservices (`576d85b`) | Modular monolith (this branch) |
|---|---|---|
| Containers (running) | 6: postgres, gateway, auth, todos, routines, frontend | 5: postgres, api, worker, edge, frontend (+ `migrate` one-shot, exits 0) |
| Memory, sum, 1 min idle | 112.5 MiB | 137.7 MiB (worker 55.3, api 43.7, postgres 24.9, edge 10.2, frontend 3.6) |
| Cold `docker compose build --no-cache` | 927.7 s (5 images) | 170.7 s (4 images; edge uses `caddy:2-alpine`) |
| Image size | 4 × 1.12 GB + 94.6 MB | api 687 MB, worker 648 MB, migrate 644 MB, frontend 132 MB |
| `turbo run typecheck --force` | 3.2 s wall, 17 tasks | 2.6 s / 2.0 s wall (2 runs), 14 tasks incl. `prisma generate`; + 0.1 s root `tsconfig.root.json` |
| `.env.example` entries / distinct names | 21 / 13 (9 files) | 5 / 5 (2 files) |
| Env vars read by code | 13 | 9 (`DATABASE_URL`, `PORT`, `WEB_ORIGINS`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `JOB_INTERVAL_MS`, `PURGE_AFTER_DAYS`, `LOCK_HOLD_MS`, `VITE_API_URL`) |
| `environment:` entries in compose | 19 | 13 |
| Databases | 3 (`auth_service`, `todos_service`, `routines_service`) | 1 (`acme`, schemas `auth`, `todos`, `routines`) |
| Prisma clients / migration histories | 3 / 3 | 1 / 1 |
| Cross-module TS code (gateway/composition + port + adapter) | 186 (gateway 91, adapter 25, port 9, 3 service entry points 61) | 110 (api `app` 39 + `index` 14 + `container` 18 + `env` 16, in-process adapter 10, port 13) |
| `/internal` routes | 15 lines | 0 |
| Manual rollback | 8 lines | 0 |
| New, no baseline equivalent | – | `db` client + transaction 25; worker 109 (loop, lock, job, env, container) |
| Deploy config (Dockerfiles, compose, Caddyfile, init script, static server) | 233 lines | 181 lines |

Caveats:
- Cold build: one run each. The baseline also ran `tsc` builds and full installs for each image; the spike installs with `--filter --production`. Network speed can change between runs. One spike run was discarded: the Mac slept (69 573 s). The kept run used `caffeinate -i`.
- Memory is higher, not lower. One Bun process with Prisma, Better Auth, and all modules (api 43.7 MiB) costs more than one small Node service (14–31 MiB). The worker (55.3 MiB) loads the same Prisma client for one job. Each extra api replica adds about 44 MiB.
- Total diff vs baseline (without `bun.lock`, report): +2629 / −1094 lines. Of the added lines, 1158 are tests and test helpers.

## 2. Verified library facts

| Fact | Result | Source |
|---|---|---|
| Prisma `multiSchema` on Prisma 7.10 + adapter-pg + Bun | **Works.** No preview flag. `datasource.schemas` + `@@schema`. Migration has `CREATE SCHEMA` for each module. `_prisma_migrations` stays in `public`. | Installed `@prisma/config@7.10.0` types; `prisma migrate dev` output (`schemas "auth, routines, todos"`); `bun --bun prisma migrate deploy` in `migrate` image; all int tests. Current prisma.io docs describe Prisma 8, not 7, so not used as a source. |
| Multi-file schema | **Works.** `schema: "prisma/schema"` (folder, recursive). Generator + datasource in `_datasource.prisma`. | `@prisma/config@7.10.0` `index.d.ts`: "path to a folder that shall be recursively searched for *.prisma files". |
| Interactive transactions with adapter-pg | **Works, with a condition:** default `timeout` 5000 ms, `maxWait` 2000 ms. Rollback on throw, nested join through ALS. | `@prisma/client@7.10.0` runtime types (`$transaction(fn, { maxWait, timeout, isolationLevel })`, "maxWait ?= 2000, timeout ?= 5000"); test 2, test 3. |
| `AsyncLocalStorage` on Bun 1.4.2 | **Works.** Context kept across `setTimeout`, `setImmediate`, `Promise.resolve`; two parallel transactions stay separate. | Test 3: `packages/backend/db/src/transaction.int.test.ts` (5 pass). |
| Better Auth in schema `auth` | **Works.** Adapter calls Prisma model delegates (`db[model].create`), so the Postgres schema is transparent. Condition: it uses the root client, so its writes are not in an outer `runInTransaction`. | `@better-auth/prisma-adapter@1.7.5` `dist/index.mjs`; `packages/backend/auth/src/auth.int.test.ts` (row in `auth."user"`, no `public.user`); browser sign-up/sign-in. |
| Caddy dynamic upstreams | **Works, with a condition:** `dynamic a api 3000 { refresh 5s }`. No active health checks for dynamic upstreams; use `lb_try_duration`. Scale change seen after ≤ 5 s. | https://caddyserver.com/docs/caddyfile/directives/reverse_proxy (`dynamic a [<name> <port>]`, `refresh` default 1m); phase 6 logs. |
| `@punpun-dev/ts-result@0.1.4` | **Works, with friction.** Class API (`Result.success/failure`, `isFailure()`, `match`, `unwrapOrThrow`), not `ok/err/map/flatMap`. `else` branch does not narrow; `match` infers from the success branch only. | Installed `dist/index.d.ts`; typecheck errors in phase 3. |

## 3. Answers

**Did the atomic run (test 2) remove code? How many lines?**
Yes. Compensation code removed: 16 lines (rollback block 8, `TodosPort.delete` 1, adapter `delete` 3, `/internal/todos/delete` route 4). The run path across modules went from 49 lines (HTTP adapter 25 + `/internal` routes 15 + rollback 8 + port `delete` 1) to 10 lines (in-process adapter). `runRoutine` is 24 lines, one `transaction(...)`, no `try/catch`. Proof: test 2 gives `{ todos: 0, runs: 0 }` after a failure on the 3rd todo; the control without a transaction gives 2 orphans.

**Were the boundaries (R1–R7) easy to keep? Where did I want to break them? Which rule was the most useful?**
Mostly easy: factories + ports + one `db()` gave few temptations. Places where I wanted to break a rule:
- Test 2 and the in-process contract need both modules. A routines test cannot import todos (R1) or touch `todo` (R4). Solution: these tests live in `services/api` (the composition root). This is correct, but it is not "each module tests itself".
- `listRuns` wants one SQL join `routine_run_todo` ⋈ `todos.todo`. R4 forbids it; it is 2 queries (runs, then `todos.find`). Fine at this size.
- `resetDatabase()` in `db/testing` truncates all module schemas: test infra crosses all modules by design.
- Better Auth needs the root `prisma`, not `db()`.
- The spec says the worker has "same wiring" as api; I wired only `todos` (what jobs use).
Most useful rule: **R4**. With one Prisma client, the compiler lets any module call `db().todo`. Only the architecture test stops it. The real code had no R4 violation; the planted-violation check (phase 6) shows that the rule fails when it must.

**Did R5 (no cross-module FK) cause a real problem?**
No real problem in this spike. Effects:
- `routine_run_todo.todoId` has no FK. A deleted todo leaves a link row. `listRuns` already shows only existing todos and keeps `total` (unit test in `list-runs.test.ts`).
- `ownerId` has no FK to `auth.user`. There is no user deletion flow today; when one comes, todos and routines of the user stay. It needs an explicit "user deleted" hook for each module. This is the one gap to plan for.

**What does a new module cost? Files to touch:**
1. `packages/backend/<m>/` — `package.json`, `tsconfig.json`, `src/index.ts` (factory + route type), `domain/`, `application/` (1 file for each use case + repository port), `infrastructure/<m>-repository.ts`, `http/routes.ts`, `use-cases.ts`, optional `api.ts`, tests.
2. `packages/backend/db/prisma/schema/<m>.prisma` (`@@schema("<m>")`).
3. `packages/backend/db/prisma/schema/_datasource.prisma` — add to `schemas`.
4. New migration (`bun run --cwd packages/backend/db db:migrate --name add_<m>`).
5. `packages/backend/db/src/testing.ts` — `MODULE_SCHEMAS`.
6. `tests/architecture/rules.ts` — `MODULES`.
7. `services/api/src/container.ts` (create + wire ports), `services/api/src/app.ts` (`.route`), `services/api/package.json` (dependency).
8. If it has jobs: `services/worker/src/container.ts` + a job file.
9. If it has UI: a frontend package with `hc<XRoutes>`.
No new service, Dockerfile, compose entry, database, or env var. The module list is in 3 places (items 3, 5, 6); a later step can derive 5 and 6 from 3.

**Can `api` and `worker` scale separately? Evidence:** Yes. `up --scale api=3 --scale worker=2`: `x-served-by` round robin over 3 hosts, one session works on all 3, 24 worker ticks with exactly one winner each. Then `up -d --no-recreate --scale api=2 --scale worker=3`: api-3 removed, worker-3 added, other containers not restarted; edge sends to 2 hosts after ≤ 5 s; ticks show `skipped=2` (3 workers, 1 winner). Details: appendix, phase 6.

**What is lost compared with microservices?**
- Separate deploys: a change in any module rebuilds and redeploys `api` (all modules) and `worker`. No per-module release.
- Failure isolation: a crash, memory leak, or CPU-heavy request in one module stops or slows all modules in that api replica. One connection pool for each process is shared by all modules; a slow query in routines can use the connections of todos.
- Scaling unit is the deployable, not the module. To scale only routines, you scale the whole api.
- Separate runtime or stack for each service: all modules must use the same Bun, Prisma, Hono versions.
- Schema autonomy: one migration history. Two teams that change their schemas at the same time make migrations in one folder and must order them.
- Idle memory is higher at scale 1 (137.7 vs 112.5 MiB), and each api replica carries all modules.
- The in-process transaction can hide coupling: code that depends on atomicity across modules will break when a module is split (phase 7: 2 orphans).

**What are the risks that remain?**
- One database is a single point of failure. The baseline had the same risk: 3 databases on one Postgres server.
- Migration coordination: `migrate` runs while old api replicas still serve. Migrations must be backward compatible (expand/contract). One history for all modules.
- Long transactions: Prisma default `timeout` 5 s. `withLock` holds a transaction for `LOCK_HOLD_MS` (2 s) + the job. A purge that takes > 3 s fails. `runRoutine` makes N inserts in one transaction; many steps + a slow DB can reach 5 s. There is no timeout option in `runInTransaction` yet.
- Connections: each process has one pg pool (default max 10). 3 api + 2 workers = up to 50 connections; each interactive transaction holds one for its full time. Postgres default `max_connections` is 100.
- AsyncLocalStorage failure mode is silent: code that escapes the async context (for example a callback from a non-async-aware library) uses the root client with no error, and the write is not in the transaction. Test 3 covers `setTimeout`, `setImmediate`, promises only.
- Worker lock depends on aligned ticks and on clock skew < `LOCK_HOLD_MS` between hosts. OK on one Docker host; on several hosts, needs NTP. A durable `job_run(job, tick)` row would be stronger.
- Edge: no active health checks for dynamic upstreams; a dead replica stays in the list until the next DNS refresh (5 s); `lb_try_duration` retries.

**Frontend client choice (section 6.7).** I kept `hc<TodosRoutes>` for each module with `import type` (R3). `services/api` also exports `AppType`, but no frontend package uses it. Reason: `frontend-todos` then depends only on `backend-todos` types, not on the composition root and all modules. If a module moves to its own service (phase 7), its frontend client needs only a new base URL.

## 4. Split checklist: move `routines` to its own service

From phase 7 (`services/api/src/adapters/todos-port.http.ts`, contract test 7 passes over HTTP, `split-rehearsal.int.test.ts` shows 2 orphans):
1. Make `services/routines` (composition root): `createRoutinesModule({ todos: createHttpTodosPort(...), transaction: runInTransaction })`, `requireUser`, Dockerfile. No change to `packages/backend/routines/src/application/*`.
2. Give routines its own database or keep schema `routines` on the same server with a separate Prisma client (a `routines`-only schema folder + its own migration history, from `routines.prisma` + a baseline migration).
3. Auth for service calls: the adapter needs `headersFor(ownerId)`. Today it forwards the user cookie. Decide: forwarded user session/JWT, or a service token + trusted `x-user-id` (the old gateway pattern).
4. Todos API for services: add a batch create and a find-by-IDs endpoint on the public API (no `/internal`, R6), or accept N requests + list-and-filter (current adapter).
5. Bring back consistency: the run is no longer atomic. Choose one:
   - compensation (delete created todos on failure; needs `delete` on the port again, and it can fail too), or
   - an outbox in routines (write the run as "pending" + outbox row in one local transaction; a relay creates the todos idempotently with an idempotency key; mark "done"), or
   - accept orphans + a cleanup job.
   Test 2 must change from "no todo exists" to the chosen guarantee.
6. Run contract test 7 against the HTTP adapter in CI, with the real todos service.
7. Remove `routines` from `services/api/src/container.ts`, `app.ts`, and from `_datasource.prisma` `schemas` (with a data migration to the new DB if split).
8. Edge: route `/api/routines*` to the new service, the rest to api.
9. Update the architecture tests: `MODULES` in the api codebase; R4 for the new client.

## 5. Open problems and hacks

1. `withLock` `holdMs` (2 s): keeps the advisory lock after a fast job, so late replicas in the same tick skip. Works with aligned ticks; not a durable guarantee.
2. `@acme/typescript-config` is a runtime dependency of `db`: `prisma generate` reads the `db` tsconfig, and `--production` installs skip dev dependencies.
3. `prisma.config.ts` uses a placeholder URL when `DATABASE_URL` is missing, so `prisma generate` runs in Docker builds without a database.
4. Routes use `if (r.isFailure()) …; r.unwrapOrThrow()` because `ts-result` does not narrow `else` and `match` breaks Hono typed responses.
5. Test 2 and test 7 (in-process, HTTP) live in `services/api`, not in the routines module (R1/R4).
6. Worker container wires only `todos`, not "same wiring" as api.
7. No routines UI in the frontend (none in base commit). Routines, run, and progress were checked through the edge with the API, not in the browser. Browser check: sign-up, sign-in, sign-out, todos CRUD.
8. Docker images copy all `packages` and `services` and are not pruned (644–687 MB). Not optimized (out of scope).
9. `bun install --frozen-lockfile` failed in 2 of 4 parallel `--no-cache` builds (worker once, migrate once). Each image passed alone and on retry. Probably registry/network. Not fixed.
10. `services/frontend/serve.ts` is a minimal static server (no cache headers, no compression).
11. Architecture tests use regex, not the TypeScript API. Comment stripping is simple. Not detected: dynamic access (`db()[name]`), raw SQL to another schema (`SELECT … FROM todos.todo`), cross-module access through `$queryRaw`.
12. Model names share one namespace across modules (one Prisma client).
13. Better Auth writes do not join `runInTransaction`.
14. `createTodos` inserts in a loop (N queries) to keep the order, not `createManyAndReturn`.
15. HTTP adapter `find` reads all todos of the user and filters (no batch endpoint).
16. Old services were deleted in the phase that replaced their module (auth 2, todos 3, routines 4, gateway 5), not all in phase 5, so each phase stayed green.
17. Backend packages and `@acme/env` now export `src/*.ts` (no `dist`). Bun runs TS directly. `@acme/env` still exported `dist` until phase 6; that broke the Docker images only.
18. Compose host ports are variables (`POSTGRES_PORT`, `EDGE_PORT`, `FRONTEND_PORT`), and `WEB_ORIGINS`/`BETTER_AUTH_URL` follow them. Reason: the maintainer's containers use 5432 and 5173 on this machine. Defaults are unchanged.
19. The job lock key is a constant (`1001`) in the job file. There is no registry of keys.
20. `GET /health` is outside `/api` and not behind auth; it returns the hostname.

## Definition of done

- [x] `bun run typecheck`, `bun run lint`, `bun test` (38 pass), `bun run test:int` (40 pass) pass.
- [x] Architecture tests pass; each rule R1–R7 has a failing fixture.
- [x] `docker compose up --build --scale api=3 --scale worker=2` works from a clean volume (after the `@acme/env` fix; see open problem 9 for flaky installs).
- [~] Browser: sign-up, sign-in, todos work. Routines, run, and progress work through the API only (no routines UI exists).
- [x] User isolation: test 4 (404 on read/update/delete/run of the data of another user), browser (new user sees an empty list).
- [x] Test 2 passes.
- [x] Report with measurements.
- [x] Old services, gateway, `/internal` routes, per-module databases removed.

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

## Appendix: phase log

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
