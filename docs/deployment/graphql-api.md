# Deploying the GraphQL API

> **Deploy on hold (owner, 2026-11-07)** pending the Biotech schema change discussion and the seed research. The running
> app still holds the old secret names (`NEO4J_URI`, `NEO4J_READER_*`); this repository's images read only
> `BKS_BIOTECH_GRAPH_*`. The per-app secret set/unset list and the resume steps, in order, are in
> [ENVIRONMENT.md](../ENVIRONMENT.md) (top notice and "Before the next Fly deploy"). Do not run the Fly commands below
> until the hold is lifted.

`apps/graphql-api` is the bounded consumer API: Apollo Server 5 and `@neo4j/graphql` 7 over the pinned release
(`schema/pinned/PIN.json` + `schema/pinned/release/**`, byte-verified by `loadRelease()` through
`loadConsumerSourceSdl()` in `apps/graphql-api/src/release.ts`), against Neo4j 5.26 (Aura or self-hosted) with APOC
Core. It has no Mutation root, serves persisted operations only in the `product` profile, and never runs DDL. Writes
are typed ingestion intents through the [executor](executor.md).

## Configuration

Source of truth: `apps/graphql-api/src/config.ts`; every name is listed in [`.env.example`](../../.env.example) and the
graph credentials in [ENVIRONMENT.md](../ENVIRONMENT.md). Production (`NODE_ENV=production`) refuses the switches
marked "refused" and refuses the `BKS_SCHEMA_RELEASE_DIR` / `BKS_CONSUMER_CANDIDATE_SDL` / `BKS_SCHEMA_PATH` overrides.

| variable | meaning |
|---|---|
| `BKS_BIOTECH_GRAPH_URI`, `BKS_BIOTECH_GRAPH_READER_USERNAME`, `BKS_BIOTECH_GRAPH_READER_PASSWORD`, `BKS_BIOTECH_GRAPH_DATABASE` | connection as the read-only `bks_reader_public_svc`; without a reader login it falls back to `BKS_BIOTECH_GRAPH_USERNAME` / `_PASSWORD` with a warning; the database name is required in production |
| `PORT` | default 4010 |
| `GRAPHQL_PROFILE` | `product` (default; persisted ids from `operations/operations.json` only) or `engineering` (needs `GRAPHQL_ENGINEERING_KEY`, >= 32 characters; introspection on) |
| `GRAPHQL_API_KEY` | service credential presented by the product BFF in `x-api-key`; required (>= 32 characters) in production |
| `GRAPHQL_ACTOR_PUBLIC_KEY`, `GRAPHQL_ACTOR_ISSUER`, `GRAPHQL_ACTOR_AUDIENCE` | verification of the BFF's <= 120 s EdDSA actor context (defaults `bks-product-bff` / `bks-graphql-api`); the public key is required by the product profile |
| `GRAPHQL_ALLOW_MUTATIONS`, `GRAPHQL_ENABLE_VECTOR`, `GRAPHQL_ENSURE_OPERATIONS` | `true` refused in production (warned elsewhere): no Mutation root, no product vector search, no startup DDL |
| `GRAPHQL_READINESS_RELEASE_CHECK`, `GRAPHQL_READINESS_CACHE_MS`, `GRAPHQL_WARMUP` | `/readyz` release check `enforce` (default; `skip` non-production only), result cache, plan warm-up (default on) |
| `GRAPHQL_MAX_DEPTH`, `GRAPHQL_MAX_COST`, `GRAPHQL_MAX_OFFSET`, `GRAPHQL_MAX_TOKENS`, `GRAPHQL_TX_TIMEOUT_MS`, `GRAPHQL_DEADLINE_MS`, `GRAPHQL_BODY_LIMIT_BYTES`, `GRAPHQL_MAX_RESPONSE_BYTES` | admission bounds; values may only tighten the release policy; the transaction timeout must stay below the deadline |
| `NEO4J_MAX_POOL_SIZE`, `NEO4J_ACQUISITION_TIMEOUT_MS`, `NEO4J_CONNECTION_TIMEOUT_MS`, `NEO4J_MAX_RETRY_TIME_MS` | driver tuning (not credentials) |
| `WEB_ORIGIN` | CORS allow-list, comma separated |

`OPENAI_API_KEY` is not read by this app.

Endpoints: `GET /healthz` (liveness, no database), `GET /readyz` (connectivity, newest `:KsReleaseMarker` against the
compatibility matrix, required DDL ONLINE, plan warm-up), `GET /schema.graphql`, `GET /identity`, `POST /graphql`.

## Local

```bash
pnpm --filter @bks/graphql-api dev                      # against .env
docker compose -f apps/graphql-api/docker-compose.yml up --build   # disposable Neo4j + API (needs GRAPHQL_API_KEY, GRAPHQL_ACTOR_PUBLIC_KEY)
pnpm --filter @bks/graphql-api print-schema generated-api-schema.graphql   # the generated API, no database needed
```

The API never runs DDL: apply the pinned release DDL and write the `:KsReleaseMarker` through the installer or migration
job (or, for a disposable synthetic graph, `pnpm api:bench:seed`) before expecting `/readyz` to pass.

## Container

```bash
docker build -f apps/graphql-api/Dockerfile -t bks-graphql-api .      # from the repository root (build context)
docker run --rm -p 4010:4010 --env-file .env bks-graphql-api
```

## Fly.io (graph stays on Aura)

`apps/graphql-api/fly.toml` (app `bks-biotech-graphql-api`, region `iad`) carries the non-secret settings: production
profile, the three switches explicitly off, tightened bounds, `/readyz` as the traffic check, 4 GB with a 3 GB Node heap
pending a soak. Every Fly command goes through `bash scripts/fly.sh` from the repository root; secret values come from a
protected file or stdin, never the command line. Secrets (names only): `BKS_BIOTECH_GRAPH_URI`,
`BKS_BIOTECH_GRAPH_READER_USERNAME`, `BKS_BIOTECH_GRAPH_READER_PASSWORD`, `GRAPHQL_API_KEY`, `GRAPHQL_ACTOR_PUBLIC_KEY`.

```bash
bash scripts/fly.sh secrets import -a bks-biotech-graphql-api --stage < <protected secrets file>
bash scripts/fly.sh deploy . --config apps/graphql-api/fly.toml --dockerfile apps/graphql-api/Dockerfile --remote-only
bash scripts/fly.sh status -a bks-biotech-graphql-api
curl -s https://bks-biotech-graphql-api.fly.dev/readyz
```

## Product/client optimization plan

The [platform GraphQL/client specification](../../../../platform/knowledge-services/docs/specs/belllabs-knowledge-platform/GRAPHQL-CLIENT.md) owns the coordinated optimization and typed TypeScript web/Expo client plan. The newer v2 assembly is the next owner review candidate, not an accepted migration. [Clarification gates](../../../../platform/knowledge-services/docs/specs/belllabs-knowledge-platform/CLARIFICATIONS.md) cover adoption, native agent contracts and corpus/index decisions. Agents use Neo4j skills or the native executor/schema workspace; they do not use this GraphQL API. Schema changes follow this repository's authoring and pinned-release rules ([AGENTS.md](../../AGENTS.md)).

## Release design and measurements (S6 consumer API, 2026-10-12)

Dated record of the v2 consumer API as built for `biotech-schema-v2.0.2`; the repository now pins a later release, so re-measure before relying on the numbers. Numbers are local measurements, not production observations: Windows 11 laptop (AMD Ryzen 7 7730U, 8 cores / 16 threads, 15.3 GB RAM), Node 24.18.0, disposable Neo4j 5.26.31 Community in Docker Desktop/WSL2 on the same host (1 GB heap, 1 GB page cache, 3 GB limit), idle host, full-scale synthetic v2 fixture (360,800 nodes, 1,072,112 relationships, all `syntheticFixture: true`), release DDL from `bks kg ensure-operations --phase all`. Evidence: `apps/graphql-api/benchmarks/2026-10-12*.{json,md}`.

- Source: the pinned release `biotech-schema-v2.0.2` (`schema/pinned/PIN.json` + `schema/pinned/release/**`), byte-verified through `loadRelease()` (`@bks/schema-workspace`) by `loadConsumerSourceSdl()` (`apps/graphql-api/src/release.ts`). `NODE_ENV=production` refuses to start without it and refuses `BKS_SCHEMA_RELEASE_DIR`, `BKS_CONSUMER_CANDIDATE_SDL` and `BKS_SCHEMA_PATH`. No v1 file name remains.
- Executable: one builder, `buildExecutable()` (`src/projection.ts`), from `projection/manifest.json` (all five `excludeDeprecatedFields`, `@limit(25, 100)`, zero Mutation root, union and Subjectable roots disabled, operational/private fields omitted, `publisherUid` only with its stamps, inventory-derived scalar cuts, visibility `@authorization` rules). Measured: 622,819 printed bytes, 763 inputs, 517 object types, 68 node types, 106 relationship types; median in-process build 969 ms (3 fresh processes: 943 / 1,010 / 969 ms), peak measuring-process RSS 403 MB (includes tsx and the release loader), retained heap 120 MB. The earlier 55 MB / ~30 s / "~2 GB retained" figures do not apply to v2.
- Endpoints: `GET /healthz` (liveness, no database); `GET /readyz` (connectivity; latest `:KsReleaseMarker` against `projection/compatibility.json` and the read-compatible parent declared in the pinned `compatibility.json`; required pre- and post-migration DDL ONLINE with `blocked-by-legacy-data` statements expected absent; plan warm-up of every safelisted operation); `GET /schema.graphql` (printed executable with `x-bks-*` identity headers); `GET /identity`; `POST /graphql` (product profile: persisted ids from `operations/operations.json` only).
- Startup DDL is gone: `GRAPHQL_ENSURE_OPERATIONS=true`, `GRAPHQL_ALLOW_MUTATIONS=true`, `GRAPHQL_ENABLE_VECTOR=true` and `GRAPHQL_READINESS_RELEASE_CHECK=skip` are refused in production. Product vector/phrase requests get `BKS_UNSUPPORTED` without any provider call; `OPENAI_API_KEY` is no longer read.
- Access: the reference BFF (`apps/product-bff`, Supabase JWKS session, `Dockerfile` + `fly.toml` for app `bks-biotech-bff`) holds `GRAPHQL_API_KEY` and forwards a <= 120 s EdDSA actor context verified against `GRAPHQL_ACTOR_PUBLIC_KEY`; caller identity headers are rejected. Reader credentials: `BKS_BIOTECH_GRAPH_READER_USERNAME` / `BKS_BIOTECH_GRAPH_READER_PASSWORD` (fallback `BKS_BIOTECH_GRAPH_USERNAME` / `BKS_BIOTECH_GRAPH_PASSWORD` with a warning).
- Bounds: request 256 KiB, response 2 MiB, depth 8, root page 25/100, nested page 25, offsets and cursors <= 1000, filter depth 8, input lists 50, cost <= 5,000 and per cost class, database timeout 5 s, end-to-end deadline 8 s; environment values may only tighten them.
- Warm latency, 20 concurrent clients, 30 s per operation, `dist/main.js` with `NODE_ENV=production`, 0 errors: p95 EntityCard 235.9 ms, ProductCard 137.1 ms, ResolveIdentifier 166.6 ms (targets <= 300 ms); AssertionEvidenceTrace 507.2 ms, ProductLabelHistory 210.3 ms, PackageLabelHistoryPage 138.9 ms, ProductVariantsPage 140.6 ms, ClaimView 273.5 ms, ReportView 212.1 ms (targets <= 750 ms); mixed p50/p95/p99 173.0 / 230.2 / 267.8 ms at 113 requests/s. The 20-connection driver pool was fully used throughout, with no acquisition timeouts.
- Memory and start: process RSS 430 MB at ready, 931 MB peak under load, 901 MB steady after GC (heap used 125 MB); GC pauses 1.0-2.6 s cumulative per 30 s scenario, longest single pause 33 ms. `/healthz` after 5.3 s and `/readyz` after 9.7 s (warm-up included). Container image `bks-graphql-api:s6-v2.0.2` (524 MB) via `docker run`: `/healthz` 7.2 s, `/readyz` 7.8 s, 299 MB at ready, 537 MB peak under a 20-client mixed run, 528 MB after it (Community test user as reader; role enforcement is proven elsewhere).
- Cold plans: the interface-target operations generate 30-82 KB Cypher (56-69 UNION branches) and a cold first execution took seconds, so the server warms every safelisted operation before `/readyz` reports ready. Warm plans use index seeks only, with no label scans and no Cartesian products. Two shapes are excluded from the safelist with measurements: assertions-about-a-subject (full `:Assertion` scan with 56 `EXISTS` subqueries, 18 s) and the identifier assignment connection (about 100 ms of synchronous library work per request, p95 2.8 s at 20 clients); identifier resolution ships as the list form.
- Regression baseline for future runs on the same machine and dataset (+10% rule): `apps/graphql-api/benchmarks/2026-10-12.md`, section "Regression baseline".
- Deployment: `apps/graphql-api/fly.toml` holds the v2 environment (vector, startup DDL and mutations explicitly off, `/readyz` as the traffic check, reader secrets) and keeps 4 GB / 3 GB heap until the S9 30-minute soak. Not deployed.

## Deployed state (S9 cutover, 2026-10-12)

Secret names below are the ones the deployed image reads; the code now reads `BKS_BIOTECH_GRAPH_*` (see "Before the next Fly deploy" in [ENVIRONMENT.md](../ENVIRONMENT.md)).

- App `bks-biotech-graphql-api` (iad), Fly release **v4** (canary strategy, 17:30Z), image
  `registry.fly.io/bks-biotech-graphql-api:v2-0-2-rc1@sha256:0767bbc486bd2f4c0f9962efb4a3fc03a96ec8dc1a37239d220bb9f9114ceebf`,
  one machine `8dd714ce9d7228`, 4 GB. `/readyz` reports the installed graph release `biotech-schema-v2.0.2`
  (marker written by migration `mig-575f91e942e3` at 17:15:11Z) and 426 checked indexes/constraints ONLINE.
- Reads as `bks_reader_public_svc` (`NEO4J_READER_USERNAME` / `NEO4J_READER_PASSWORD`). On Aura Professional this user is
  bound to Aura's `graphql_app_read_only_<id>` role (custom roles are not available on that tier); the library's
  `dbms.components` and `apoc.date.convertFormat` calls need that role; write and DDL are refused for it.
- Secrets in use: `NEO4J_URI`, `NEO4J_READER_USERNAME`, `NEO4J_READER_PASSWORD`, `GRAPHQL_API_KEY` (rotated at cutover;
  held by the reference BFF only, which is not deployed because no consumer app exists), `GRAPHQL_ACTOR_PUBLIC_KEY`
  (JWKS, Ed25519 kid `bks-bff-actor-2026-10`). `NEO4J_USERNAME`, `NEO4J_PASSWORD` and `OPENAI_API_KEY` are legacy v1
  secrets kept only until the post-soak hygiene step (the v1 rollback image needs them); the v2 image does not read them.
- Rollback: `bash scripts/fly.sh releases -a bks-biotech-graphql-api` then redeploy release v3's image
  (`bks-biotech-graphql-api:deployment-01M4E5VAVC97ZSGMPS9V44W2PB`) with the v1 `fly.toml` from BKS commit `431c8a7`.
  This does not undo the graph migration (see `docs/plans/schema-v2-service-release/CUTOVER.md`, Rollback).
- Every Fly command through `bash scripts/fly.sh`; secret values only from the protected custody files via stdin.
