# BellLabs Biotech Knowledge Services

Biotech-owned services around the BellLabs Neo4j knowledge graph. Repository: public [`jbell-rusty-vantage/biotech-knowledge-services`](https://github.com/jbell-rusty-vantage/biotech-knowledge-services), `main` only; history starts at a clean-slate root commit ([repository history](docs/REPOSITORY-HISTORY.md)). **Fly deploy is on hold (owner, 2026-11-07)** pending the schema change discussion and seed research; see [ENVIRONMENT.md](docs/ENVIRONMENT.md). Start with [service navigation](docs/NAVIGATION.md) for contracts, product APIs, skill discovery and the distinction from shared platform Knowledge Services. Local source and pin verified 2026-10-15; deployment state was not queried. Two core capabilities:

1. **Schema workspace** (`packages/schema-workspace`): the pinned `@neo4j/graphql` SDL (pinned release `biotech-schema-v2.2.0`: 69 node types, 106 relationship types) parsed into an IR and materialized as a progressive-disclosure tree an agent can search and drill into, plus scoped slices.
2. **Knowledge-graph operations** (`packages/kg-ops`): bounded read intents, identity resolution, and a deterministic ingestion executor (intent → plan → apply → receipt) with the kernel rules of the catalog enforced, next to guarded ad hoc Cypher tools used as the baseline for comparison.

Around them: versioned contracts (`packages/contracts`, with JSON Schema exports for other languages), a bounded consumer GraphQL API (`apps/graphql-api`), reference product/user-session BFF (`apps/product-bff`), generated typed client (`packages/graphql-client`), an HTTP + MCP executor surface (`apps/executor`), agent skills (`.agents/skills`), a Python client for Mission Control adapters (`python/biotech-knowledge-client`), and the baseline-comparison eval harness (`evals/baseline-comparison`).

## Layout

| Path | What |
|---|---|
| `schema/pinned/` | Byte-verified v2 release bundle identified by `PIN.json`; SDL, DDL, query catalog, registers, workspace inputs and compatibility decisions. |
| `schema/program/` | Historical schema program (plan, generated maps, packets, interviews and decisions); current v2 release record is `docs/plans/schema-v2-service-release/`. Start at `schema/program/PLAN.md`; the agent-team run is `schema/program/fast-track/` (`KICKOFF.md` has the prompts). |
| `schema/sidecars/` | Pointer-only guide to upstream authored release workspace inputs and their pinned copy. |
| `workspace/` | Generated v2 cards, `START_HERE.md`, `INDEX.md`, `manifest.json` and `search/index.jsonl`. Rebuild with `pnpm workspace:build`; verify drift with `pnpm workspace:verify`. |
| `packages/contracts` | Zod contracts: read intent/snapshot, ingestion intent/plan/receipt, Cypher request/result, workspace manifest. `pnpm contracts:json-schema` exports JSON Schema. |
| `packages/schema-workspace` | Parser, sidecar validation, renderer, search, slices; CLI `bks-schema`. |
| `packages/kg-ops` | Neo4j client, read executor, resolver, planner, apply executor with intent markers and receipts, Cypher guard; CLI `bks`. |
| `apps/graphql-api` | Apollo Server 5 + `@neo4j/graphql` 7 over the pinned SDL; Dockerfile, docker-compose, Fly config. |
| `apps/product-bff`, `packages/graphql-client` | Reference user-session BFF and typed persisted-operation client; inspect the release handoff before inferring deployment. |
| `apps/executor` | Hono HTTP routes and an MCP (stdio) server exposing schema and kg tools. |
| `.agents/skills` | `biotech-schema-explore`, `biotech-kg-query`, `biotech-kg-ingest`, `biotech-cypher-baseline`, `fly-ops` (deploy/operate the GraphQL API on Fly.io). |
| `python/biotech-knowledge-client` | Typed (pydantic) client + CLI for the executor HTTP API, validating against the exported JSON Schemas. |
| `evals/baseline-comparison` | Task set and scorer for "intent executor vs ad hoc Cypher" runs. |
| `docs/architecture` | Decision records. `docs/deployment` has the executor and GraphQL API runbooks; `docs/ENVIRONMENT.md` the environment names and the deploy hold. |

## Quick start

Schema commands below are local discovery. The `packages/kg-ops/dist/cli.js` examples retain the v1 CLI workflow; for current v2 executor ingestion use the dedicated skill and release interfaces linked below. Apply commands require the intended target and explicit task authorization.

```bash
pnpm install && pnpm build          # builds every package (tsc project references)
pnpm workspace:build                 # materializes ./workspace from the verified pinned release and its workspace inputs
node packages/schema-workspace/dist/cli.js search "supplement label per serving"
node packages/schema-workspace/dist/cli.js get task:ingest-product-label
pnpm schema:map                      # node-edge-node map of the pinned SDL -> schema/program/schema-map.md

cp .env.example .env                 # BKS_BIOTECH_GRAPH_URI / _USERNAME / _PASSWORD (docs/ENVIRONMENT.md)
node packages/kg-ops/dist/cli.js ping
node packages/kg-ops/dist/cli.js kg read examples/read-intent.example.json
node packages/kg-ops/dist/cli.js kg plan examples/ingestion-intent.example.json --out runs/plan.json
node packages/kg-ops/dist/cli.js kg apply examples/ingestion-intent.example.json --plan runs/plan.json --out runs/receipt.json
node packages/kg-ops/dist/cli.js kg verify runs/receipt.json
```

Disposable Neo4j for tests and local work: `bash scripts/neo4j-test.sh up` (bolt 7690, APOC core), then
`BKS_INTEGRATION=1 NEO4J_TEST_URI=neo4j://localhost:7690 pnpm test`. The integration suite applies the pinned
constraints, runs plan/apply/duplicate/conflict, identity resolution, partial handling, stale preconditions,
episode closing and the Cypher guard caps.

GraphQL API: `pnpm --filter @bks/graphql-api dev` (schema build takes ~30 s), or `docker compose -f apps/graphql-api/docker-compose.yml up --build`. See `docs/deployment/graphql-api.md`.

Executor: `pnpm --filter @bks/executor dev` (HTTP on 4020) or register `apps/executor/dist/mcp.js` as an MCP server.

## Root installer, remote reinstall and wipe

`scripts/install-biotech.mjs` (Sprint V SV-17) installs, in order and idempotently, the pinned KS
`knowledge_verification` component (application `biotech`, binding `biotech-graph`), the Mission Control common
release (1.9.0, Sprint OC target lock `sprint-oc/release/locks-190`, explicit release root `--mc-release-root`; an
installed 1.8.0 upgrades in place by applying 0066 and 0067 only), the graph release
(`biotech-schema-v2.2.0`: KsReleaseMarker + writer DDL on an empty graph) and the executor configuration by variable
name, then writes a receipt. The KS component pin is the single `KS_COMPONENT_PIN` line (2.5.0: `0008_effect_dispatch_journal`; an installed 2.4.0 upgrades in place by
applying 0008 only, with the same `--component-installation-id`); `--ks-root` selects the KS checkout (default
`../../platform/knowledge-services`) and `--ks-component-root` an explicit component tree (the pin still applies).
After the component, `component-grants` (OVE-168) lets the executor's component login `set local role` each bounded
`knowledge_verification_{reader,writer,reviewer,outbox_worker}` role: `grant <role> to <login> with inherit false, set
true`, issued only where `pg_has_role(login, role, 'SET')` is false (a repeat reports `current`). The login is the
component DSN's session user, or `--component-login <name>` for a dedicated one. On PostgreSQL 16+ a non-superuser
CREATEROLE admin (Supabase `postgres`) holds the roles it created WITH ADMIN only, so it self-grants a separate
SET-only row. A direct membership WITH INHERIT, or WITH ADMIN on a login other than the session user, refuses
`GRANTS_DRIFT`; platform/API logins and an explicit superuser login are refused. Role memberships are cluster-level and
outside the wipe (a reinstall after a wipe reports `current`). Then `seal-key` (OVE-169 W1 D25) pins the PUBLIC half of
the KS executor's run-seal key in `knowledge_verification.seal_signing_key` through the KS CLI `knowledge-db seal-key`
(derived from the private PEM, never printed; `current` on repeat, `SEAL_KEY_CONFLICT` for another key under the id,
`--retire-seal-key-ids` moves earlier ids to `retiring`). It reads `--seal-key-id`/`--seal-key-file`/`--seal-issuer`, else
`KS_KNOWLEDGE_SEAL_KEY_ID`/`KS_KNOWLEDGE_SEAL_KEY_FILE`/`KS_KNOWLEDGE_SEAL_ISSUER`/`KS_KNOWLEDGE_SEAL_RETIRE_KEY_IDS` (the
runtime generator's `install.env`). `--remote-reinstall` refuses `SEAL_KEY_REQUIRED` without a key unless
`--no-seal-key` is passed; a local run without one warns on stderr and skips; until a key is registered `report.seal` refuses
`CAPABILITY_UNAVAILABLE` / `seal_key_unregistered`. Without a flag it accepts only a loopback `disposable_*` database and a local Neo4j
(`DISPOSABLE_DATABASE_REQUIRED`, `DISPOSABLE_NEO4J_REQUIRED`); its usage is in the script header.

Sprint OC WI-24 adds the owner-declared disposable remotes (Mission Control `deployments/biotech/target.toml` and the
Biotech Aura graph, OC-D184/OC-D196). Both commands pass the gates in
[`scripts/install-target.mjs`](scripts/install-target.mjs), in order:

1. `--confirm-target` equals the file's `<project_ref>:<installation_id>`.
2. The credential in the variable named by `database_url_env` addresses exactly its host/port/user/database; a
   non-loopback host needs `sslmode=require|verify-ca|verify-full`.
3. Identity: installation rows must all carry that ref, id and application. `--identity-evidence <file>` is checked
   in full whenever supplied, and is the only proof for a pre-1.6.0 Mission Control (`mission_control` present, no
   row; the remote stops at 0034). With no `mission_control` at all, the exact route (`db.<ref>.supabase.co` or
   `postgres.<ref>`) or the evidence.
4. Graph: `BKS_BIOTECH_GRAPH_URI` in the environment equals `--neo4j-uri` (wipe), `--confirm-graph` equals its host, a remote
   graph uses `neo4j+s://` or `bolt+s://`, and the graph is empty or carries only `biotech-schema-v*`
   KsReleaseMarkers (content without any marker needs `--allow-unmarked-graph`).

```bash
# from this repository root, with database_url_env, BKS_BIOTECH_GRAPH_URI and the graph password variable exported
T=../../platform/mission-control/deployments/biotech/target.toml
node scripts/install-biotech.mjs wipe --dry-run --target $T --confirm-target <ref>:<installation_id> --identity-evidence <file> \
  --neo4j-uri "$BKS_BIOTECH_GRAPH_URI" --neo4j-password-env BKS_BIOTECH_GRAPH_PASSWORD --confirm-graph <host>
node scripts/install-biotech.mjs wipe --target $T ... (same flags as the dry-run) \
  --from-dry-run .scratch/sprint-oc/evidence/wipe/dry-run-<ref>-<stamp>.json
node scripts/install-biotech.mjs --remote-reinstall --target $T --confirm-target <ref>:<installation_id> \
  --neo4j-uri "$BKS_BIOTECH_GRAPH_URI" --neo4j-password-env BKS_BIOTECH_GRAPH_PASSWORD --confirm-graph <host> --component-installation-id <uuid>
```

Flags must be identical on the dry-run and the real run: `--allow-sessions`, `--allow-unmarked-graph`,
`--skip-graph`, `--schemas a,b`.

Identity evidence is JSON written by the operator from the Supabase management API, under 24 h old. Its `project_ref`,
`name` and `installation_id` must equal the target's `project_ref`, `project_label` and `installation_id`, the route
must carry the ref, and `system_identifier` must equal `select system_identifier::text from pg_control_system()` read
over the DSN (`TARGET_SYSTEM_IDENTIFIER_MISMATCH` otherwise):
`{"source": "management-api", "project_ref": "...", "name": "...", "region": "...", "installation_id": "...", "system_identifier": "...", "observed_at": "<ISO-8601>"}`.

- **Wipe** drops, one transaction per schema and Mission Control last, only `knowledge_service`,
  `knowledge_verification` (both absent on the remote; fine), `capability_search` (MC's removed legacy
  capability-search schema), `mission_control_runtime`, `mission_control_search` and `mission_control`; then, only
  after those succeed, every graph node (content and KsReleaseMarker, batches of 1000; constraints and indexes stay).
  `--schemas a,b` selects a subset (`WIPE_SCHEMA_NOT_ALLOWED` otherwise); `--skip-graph` leaves the graph. It never
  drops a database or touches `public`, `auth`, `storage` or Supabase-managed schemas. Absent schemas and an empty
  graph are no-ops.
- **All or nothing.** A real wipe requires `--from-dry-run`: a `dry-run-clear` receipt of the same target, installation
  id, graph host, schemas and flags (order-insensitive), under 2 h old (`WIPE_DRY_RUN_REQUIRED`, `_BLOCKED`, `_STALE`, `_MISMATCH`). Before committing
  anything it re-runs the whole plan as a dry-run; any blocker refuses with `WIPE_PLAN_BLOCKED`, and an inventory
  digest (per-schema objects, cascade dependents, graph host, node/relationship/label counts and markers) different from the
  receipt's refuses with `WIPE_DRY_RUN_MISMATCH`. Nothing is changed in either case.
- **Blockers**: a schema not owned by the target's session user (`WIPE_SCHEMA_OWNER_UNEXPECTED`); a non-platform
  session on the database unless `--allow-sessions` (`WIPE_SESSIONS_ACTIVE`; platform = `authenticator`,
  `dashboard_user`, `supabase_admin`, `supabase_auth_admin`, `supabase_storage_admin`, `supabase_realtime_admin`,
  `pgbouncer`, `supabase_replication_admin`, `supabase_read_only_user`, and `postgres` sessions of Supabase Studio,
  pg_meta or PostgREST); any cascade that would remove anything outside the allow-list, of any kind
  (`WIPE_CASCADE_OUTSIDE_ALLOW_LIST`: tables, columns, column defaults, indexes, rules, extended statistics, views,
  functions, policies, triggers, constraints, sequences,
  types, domain constraints, extensions, casts, operators and operator classes/families, event triggers, publications,
  default ACLs); an unmarked or foreign graph (`GRAPH_UNMARKED`, `GRAPH_IDENTITY_MISMATCH`).
- **`--dry-run`** runs every gate and every PostgreSQL step with a 5 s lock timeout and rolls each back; the receipt
  lists, per schema, object counts, relation names, estimated rows, cascade dependents and blockers, every other client
  session (`usename`, `application_name`, state, `backend_start`; never query text; background workers such as
  autovacuum are not sessions), the graph's node, relationship and
  per-label counts and markers, and the inventory digest. Status `dry-run-clear` or `dry-run-blocked`.
- Receipts: `.scratch/sprint-oc/evidence/wipe/{dry-run,wipe}-<ref>-<UTC>.json` plus a `.txt` summary and a
  `.journal.jsonl`, always written (also for a refusal or failure, with `failedStep`); no credential.
  `--evidence-dir` must be git-ignored (`EVIDENCE_DIR_NOT_IGNORED`).
- **Remote reinstall** replaces the disposable gates with gates 1–4 (environment pinning is checked by the
  executor-config step), never creates a database, and installs Mission Control with the target file and its
  `installation_id`. Fresh = wipe + install; repeat = install again and observe `changed: false`; interrupted = kill
  it, rerun (the dead run's lock is taken over).
- Refusal codes (exit 2): `CONFIRM_TARGET_REQUIRED`, `CONFIRM_TARGET_MISMATCH`, `CONFIRM_GRAPH_REQUIRED`,
  `CONFIRM_GRAPH_MISMATCH`, `GRAPH_TARGET_MISMATCH`, `NEO4J_URI_INVALID`, `NEO4J_URI_REQUIRED`, `NEO4J_TLS_REQUIRED`,
  `GRAPH_IDENTITY_MISMATCH`, `GRAPH_UNMARKED`, `TARGET_REQUIRED`, `TARGET_INVALID`, `TARGET_DSN_MISSING`,
  `TARGET_DSN_MISMATCH`, `TARGET_DSN_TLS_REQUIRED`, `TARGET_INSPECT_FAILED`, `TARGET_IDENTITY_MISMATCH`,
  `TARGET_IDENTITY_UNPROVEN`, `IDENTITY_EVIDENCE_INVALID`, `WIPE_SCHEMA_NOT_ALLOWED`, `WIPE_SCHEMA_OWNER_UNEXPECTED`,
  `WIPE_SESSIONS_ACTIVE`, `WIPE_CASCADE_OUTSIDE_ALLOW_LIST`, `WIPE_LOCK_TIMEOUT`, `WIPE_GRAPH_CONFLICT`,
  `EVIDENCE_DIR_NOT_IGNORED`, `REMOTE_REINSTALL_FLAG_REQUIRED`, `REMOTE_REINSTALL_CONFLICT`,
  `MC_INSTALLATION_ID_MISMATCH`, `EXECUTOR_TARGET_MISMATCH`, `TARGET_SYSTEM_IDENTIFIER_MISMATCH`,
  `TARGET_SYSTEM_IDENTIFIER_UNREADABLE`, `WIPE_PLAN_BLOCKED`, `WIPE_DRY_RUN_REQUIRED`, `WIPE_DRY_RUN_BLOCKED`,
  `WIPE_DRY_RUN_STALE`, `WIPE_DRY_RUN_MISMATCH`.
- Tests: `pnpm test:installer` (unit gates). With `INSTALL_WIPE_PG_ADMIN_DSN` (loopback admin DSN) it runs the real
  installer in `--remote-reinstall` mode on a throwaway `disposable_bwipe_*` database (dry-run, refusals, a late
  owner change after a clean dry-run that commits nothing, wipe, re-wipe, and a simulated legacy Mission Control at
  0034 with evidence bound by `system_identifier`); with `NEO4J_TEST_URI`/`NEO4J_TEST_PASSWORD`
  (`scripts/neo4j-test.sh up`) it adds the graph: interrupted, repeat (`changed: false`), a graph changed after the
  dry-run, graph wipe after PostgreSQL, unmarked-graph refusal, re-wipe and fresh reinstall.

## Legacy v1 ingestion walkthrough

The examples below describe the retained v1 path. For current v2 ingestion, use `.agents/skills/biotech-kg-ingest/SKILL.md`, `packages/contracts/src/*-v2.ts`, and the [release interfaces](docs/plans/schema-v2-service-release/INTERFACES.md); v2 apply uses admitted references and witnesses. Do not mix v1 payloads with v2 endpoints.

### How the v1 path works

1. **Orient** with the workspace (`bks-schema search` → `dom:` → `task:` → cards). Never read the SDL whole.
2. **Read first** (`bks kg read`): resolve mentions by identifier/name, read cards and traces, keep the snapshot.
3. **Author an intent** (`biotech-knowledge-intent.v1`): sources with snapshots and locators, subjects resolved or new (with `onMatch` policy), proposals (`node.upsert`, `identifier.attach`, `edge.assert`, `edge.structural`, `state.attach`, `assertion.literal`, `edge.close`, `mention.stage`).
4. **Plan** (`bks kg plan`): the executor validates against the pinned schema and the live graph and compiles ordered Cypher; dispositions explain create vs update, holds and rejections.
5. **Apply** (`bks kg apply`): one transaction under an intent marker; identical bytes are idempotent, changed bytes conflict, failures roll back and leave a receipt.
6. **Verify** (`bks kg verify`): re-read the affected nodes.

Kernel rules the executor enforces: every asserted edge is authorized by one Assertion citing a SourceLocator; derived projections are read-only; valid time is declared, recorded time is service-assigned; nothing is deleted; uids follow `hu:<token>:<opaque>`; no private-personal data.

## Current pin and historical observations

`schema/pinned/PIN.json` and `workspace/manifest.json` bind release `biotech-schema-v2.2.0` (pinned 2026-10-25 from `schema/source/biotech-schema-v2.2.0/`; this repository is the schema author, owner decision SV-D10). Graph: the Sprint OC W0 disposable remote reinstall (OVE-168) recorded the installer `graph-release` step `applied` (release DDL + `KsReleaseMarker`) for v2.2.0 on Biotech Aura `8032ec07` on 2026-10-28 (fresh-install run 05:11:51Z), then `current` on the repeat and upgrade runs ([W0 release bundle](../../platform/mission-control/docs/specs/provider-consolidation-2026-10/sprint-oc/release/RELEASE-BUNDLE.md), "Biotech graph schema" pin row and the install-receipt table; receipts in this repository's ignored `.scratch/sprint-oc/evidence/install-state/`). That is installer evidence on a disposable target, not qualification, and it has not been re-verified live since; read the graph's `KsReleaseMarker` before relying on it. Services: the Fly GraphQL API and executor were last released at `biotech-schema-v2.0.2` (2026-10-12) and have no v2.2.0 redeploy record. v2.1.0 was never installed. Read the dated v2 release record ([STATUS](docs/plans/schema-v2-service-release/STATUS.md), [VALIDATION](docs/plans/schema-v2-service-release/VALIDATION.md), [RELEASE-MANIFEST](docs/plans/schema-v2-service-release/RELEASE-MANIFEST.md)) for implementation evidence. The historical upstream schema home `../biotech-meta` is absent and is not an edit destination. The following v1 observations are preserved as history, not current release or deployment status.

### V1 observations (2026-10-07 to 2026-10-10)

- Built and tested on 2026-10-07 against Neo4j 5.26 Community (embedded via Docker); the GraphQL API is deployed on Fly with Neo4j on Aura. The 2026-10-10 health observation reports the original pinned SDL; this does not establish migration of the proposed graph schema.
- The pinned schema is the final proposal (run-2026-10-04-fable51-01), deployed to prove the pipeline, not accepted as final: its executable form is 55 MB / 38,034 input types. The program to replace it is `schema/program/PLAN.md`; accepted changes are proposed upstream in `biotech-meta`, re-pinned, the workspace rebuilt and the suite re-run.
- `mongoResearchRunId` is a legacy property name; the executor writes the Mission Control run id into it and records lineage on the `Activity` node. See `docs/architecture/0004-mission-control-boundary-and-run-identity.md`.
- Baseline comparison runs (intent executor vs ad hoc Cypher) use `evals/baseline-comparison`; no run has been recorded yet.
