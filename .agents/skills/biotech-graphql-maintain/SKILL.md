---
name: biotech-graphql-maintain
description: >-
  Engineering lane for the bounded BellLabs Biotech consumer GraphQL API (apps/graphql-api), its generated
  TypeScript client (packages/graphql-client), the reference product BFF (apps/product-bff) and their Fly
  operations: projection manifest and executable build, operation safelist and registry digest, admission bounds,
  readiness and release-marker rules, query-plan inspection, benchmarks and the +10% regression rule, image builds,
  staged/canary deploys and rollback. Not for agent reads or graph writes (use biotech-kg-query, biotech-kg-ingest)
  and not for database DDL, roles or migration (use biotech-graph-ops). Never loaded into knowledge agents.
version: 1.0.0
allowed-tools:
  - Bash(pnpm *)
  - Bash(node scripts/migration/skill-digests.mjs *)
  - Bash(bash scripts/neo4j-test.sh *)
  - Bash(bash scripts/fly.sh *)
  - Bash(docker build *)
  - Bash(curl *)
---

# biotech-graphql-maintain: the consumer API, client and BFF

Route `engineering.graphql` in `.agents/skills/skill-routing.json`. Run everything from the repository root of
`biotech-knowledge-services`. Operator reference: `docs/deployment/graphql-api.md`, section "v2 release". Work-package
record, commands and Gate D evidence: `docs/plans/schema-v2-service-release/reports/S6-consumer-api.md`.

## Triggers and non-triggers

Use for: a new pinned schema release; a projection change (omitted fields, scalar cuts, limits, visibility); adding,
changing or excluding a safelisted operation; a bound or readiness change; client regeneration; BFF changes; a
performance regression or query-plan question; building or deploying the API/BFF images.

Not for: answering domain questions from the graph, ingestion, ontology edits, DDL/index creation, database principals
or the migration itself. DDL and indexes go to the release (S1) and the migrator (`biotech-graph-ops`); this lane only
lists index requests (`apps/graphql-api/projection/required-indexes.json`).

## Release rules before loading any vendored Neo4j skill

The vendored skills are generic; this release overrides them, and the release rule wins:

- `neo4j-graphql-skill`: `@neo4j/graphql` **7.6.3** exactly as installed (check `node_modules`, not current docs). No
  Mutation root (`@mutation(operations: [])` on every node), no `@vector`/phrase search (requests get
  `BKS_UNSUPPORTED`), no aggregates, persisted safelisted operations only in the product profile. APQ is not a
  safelist. `context.token` is never verification: the server verifies the BFF actor JWT and passes `context.jwt`.
- `neo4j-driver-javascript-skill`: neo4j-driver **6.2.0** (lossless `Integer`, byte arrays are `Int8Array`); one
  long-lived driver, explicit database. **OV-READ-ROUTING**: READ access mode is not enforcement; read-only authority is
  the database principal.
- `neo4j-query-tuning-skill`: **OV-CYPHER-VERSION**: Cypher 5 only (`CYPHER 5` prefix), never `CYPHER 25`. Inspect the
  Cypher the library generates; you cannot hand-tune it, only change the operation shape or request an index.

## Facts to rely on (read them, do not hard-code them)

- Identities come from `GET /identity` (or `apps/graphql-api/generated/identity.json`) and `schema/pinned/PIN.json`:
  `releaseId`, `schemaDigest`, `schemaReleaseDigest`, `productProjectionDigest`, `executableGraphqlDigest`,
  `operationRegistryDigest`. Never copy a digest into code, docs or tests by hand.
- The source SDL is loaded only through `loadConsumerSourceSdl()` (S1 `loadRelease()`); production refuses to start
  without the pinned release and refuses overrides. One builder, `buildExecutable()`, serves the server, generators,
  benchmarks and tests.
- `/readyz` is ready only when: the driver connects; the latest `:KsReleaseMarker` equals the pinned release or the
  read-compatible parent declared in the pin's `compatibility.json`; every required pre/post-migration DDL statement
  and every consumer index requirement is ONLINE (`blocked-by-legacy-data` statements are expected absent); the plan
  warm-up of every safelisted operation finished. A missing or foreign marker keeps the service out of traffic: that
  is correct, not a bug.
- Production GraphQL reads as the read-only principal `bks_reader_public_svc`. On Aura Professional it is bound to the
  Aura role `graphql_app_read_only_<instance id>` because custom roles cannot be created there and plain `reader`
  cannot call `dbms.components` or `apoc.date.convertFormat`, both required by the library
  (`docs/plans/schema-v2-service-release/CUTOVER.md`, "Aura Professional finding"). Credentials arrive as the secrets
  `BKS_BIOTECH_GRAPH_READER_USERNAME` / `BKS_BIOTECH_GRAPH_READER_PASSWORD` (the running app still has the old
  `NEO4J_READER_*` names until the next deploy; see `docs/ENVIRONMENT.md`).
- Rollback for production and canary is the previous Fly release (image plus its own `fly.toml`); it does not undo a
  graph migration.

## Procedure

1. **Change the input, never the output.** Edit `apps/graphql-api/projection/manifest.json`,
   `operations/catalog.json` or `operations/documents/*.graphql`. Never hand-edit `generated/**`,
   `operations/operations.json`, `packages/graphql-client/src/generated/**` or `src/compatibility.ts`.
2. **Regenerate**: `pnpm api:generate` (scalar cuts, printed executable, registry, identity), then
   `pnpm client:codegen` (fails if any client hash differs from the registry). A new release regenerates the same way.
3. **Check the safelist rules** the registry builder enforces: one query per document, bounded variables in the
   catalog, server-bound `actor.visibility` for any relationship predicate (the library does not apply
   `@authorization` inside relationship filters), explicit `limit` <= 25 on union-target lists, no union connections,
   static cost within the cost class. Interface-target connections over `Subjectable` are expensive (large Cypher,
   ~100 ms library work per request): prefer list fields or an existing native typed read.
4. **Verify**: `pnpm build && pnpm test`; `pnpm api:check`; `pnpm client:pack-check`. Integration needs a
   disposable Neo4j (`bash scripts/neo4j-test.sh up`) and
   `BKS_INTEGRATION=1 NEO4J_TEST_URI=... NEO4J_TEST_PASSWORD=... pnpm exec vitest run --project graphql-api --project graphql-client --project product-bff`.
5. **Measure when performance can change** (new operation, projection, library or release), on an idle host only:
   `pnpm api:bench:seed -- --scale 1 --skip-ddl` after `bks kg ensure-operations --phase pre` (and `--phase all`
   afterwards, then `--marker-only`), `pnpm api:bench:plans`, `pnpm api:bench:build`, `pnpm api:bench:load`
   (20 clients), then `tsx bench/report.ts <date>` in `apps/graphql-api`. Compare with the "Regression baseline" table
   of the latest `apps/graphql-api/benchmarks/<date>.md`: more than **+10%** p95 or RSS needs a recorded explanation
   and a new budget before release. Targets: warm p95 <= 300 ms entity card/identifier, <= 750 ms evidence/history.
6. **Build images**: `docker build -f apps/graphql-api/Dockerfile -t bks-graphql-api:<tag> .` and
   `docker build -f apps/product-bff/Dockerfile -t bks-bff:<tag> .` (the API image carries `schema/pinned/PIN.json` and
   `schema/pinned/release/`).
7. **Deploy (operator-approved only)**: always `bash scripts/fly.sh ...`: pre-flight (`status`, `releases`,
   `secrets list`), staging app, canary (`deploy ... --strategy canary`), rollback. The exact commands are in the S6
   report's "Commands for the lead" section; `fly.toml` files are the reviewed configuration. Gate the switch on the
   canary's `/readyz` and `/identity` digests.

## Never

- Never add a Mutation root, `@vector`, aggregates, free-form product queries or an unbounded union field.
- Never run DDL, create indexes or roles from this lane or at server startup (`GRAPHQL_ENSURE_OPERATIONS=true` is
  refused in production).
- Never ship service keys, the BFF signing key or Neo4j credentials in a client bundle, a URL or a command line; set
  Fly secrets by piping `NAME=value` lines from a protected file into `bash scripts/fly.sh secrets import`, by name only.
- Never point benchmarks or integration tests at Aura or any non-local database; synthetic data stays
  `syntheticFixture: true` in a disposable container.
- Never downsize Fly resources without the 30-minute soak and peak RSS below 70% of the proposed limit.
- Never call flyctl directly, print a token, or deploy without the lead's explicit go.
