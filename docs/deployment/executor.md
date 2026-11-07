# Deploying the native knowledge executor

> **Deploy on hold (owner, 2026-11-07)** pending the Biotech schema change discussion and the seed research. The running
> app (`bks-biotech-executor`, deployed 2026-10-12 at `biotech-schema-v2.0.2`) still holds the old secret names
> (`NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, and `BKS_VERIFICATION_*DSN` where set); this repository's images read
> only `BKS_BIOTECH_GRAPH_*` / `BKS_BIOTECH_DB_*`. The per-app secret set/unset list and the resume steps, in order, are
> in [ENVIRONMENT.md](../ENVIRONMENT.md) (top notice and "Before the next Fly deploy"). Do not run the Fly commands below
> until the hold is lifted.

`apps/executor` serves the trusted write path (`POST /kg/plan` → `/kg/admit` → `/kg/apply`, receipts, readback), the native
read service (`/kg/read`, `/kg/read/cypher`), the schema workspace routes (`/schema/*`), the capability descriptor
(`/capability`) and, as a separate stdio process, the MCP surface. It runs against the pinned release
(`schema/pinned/PIN.json` + `schema/pinned/release/**`, byte-verified on every load) and the generated `workspace/`.

Release state: the repository pins `biotech-schema-v2.2.0` (2026-10-25). The Sprint OC W0 disposable reinstall installed
the v2.2.0 DDL and `KsReleaseMarker` on Aura `8032ec07` on 2026-10-28
([W0 release bundle](../../../../platform/mission-control/docs/specs/provider-consolidation-2026-10/sprint-oc/release/RELEASE-BUNDLE.md);
not re-verified live), so the deployed v2.0.2 executor no longer matches that graph's release marker. The next deploy is
a new build of the release chosen in the schema discussion; the Fly configuration below is the reviewed target.

## Image

```bash
docker build -f apps/executor/Dockerfile -t bks-executor:<release> .   # from the repository root (build context)
```

The image carries the pinned release, the workspace, the capability descriptor template, the lane mount and the five
first-party skills the descriptor digests (`.agents/skills/biotech-*`; vendored Neo4j skills are not copied). It copies
no `.env` and loads none (`BKS_NO_ENV_FILE=1`): configuration comes from platform secrets. It runs as `node`, listens on
`EXECUTOR_PORT` (4020) and exposes `/healthz` as the container health check.

## Configuration

Names only; values never appear in files that are committed. `.env.example` lists every variable with its meaning.

| group | variables | notes |
| --- | --- | --- |
| graph | `BKS_BIOTECH_GRAPH_URI`, `BKS_BIOTECH_GRAPH_USERNAME`, `BKS_BIOTECH_GRAPH_PASSWORD`, `BKS_BIOTECH_GRAPH_DATABASE` (see [ENVIRONMENT.md](../ENVIRONMENT.md)) | writer principal (`bks_writer_svc` on Aura). Connections to `*.databases.neo4j.io` are refused unless `BKS_TARGET=production` (process exits 78) |
| principals | `BKS_EXECUTOR_TOKENS` | JSON array of `{tokenSha256, role, principalId, installationId, applicationId, tenantId, grants}`; required unless `BKS_LOCAL_DEV=1`, which is never set in production |
| admission | `BKS_WITNESS_ISSUER`, `BKS_WITNESS_ISSUER_KEYS`, `BKS_VERIFIER_ISSUER_KEYS`; `BKS_WITNESS_SIGNING_KEY` + `BKS_ADMISSION_*` only when this process also hosts the admission service | apply requests need a `bks-apply-witness.v1` from a pinned issuer (≤ 60 s lease) |
| reads | `BKS_READ_BINDINGS` (+ the env names it references), `BKS_READ_AUTHORITY`, `BKS_READ_VISIBILITY` | `BKS_READ_BINDINGS` is JSON `[{ref, scope, uriEnv, userEnv, passwordEnv, database, readAuthority, visibility}]` naming env vars; this release uses `BKS_READER_PUBLIC_URI/USERNAME/PASSWORD` and `BKS_READER_INTERNAL_URI/USERNAME/PASSWORD` for `bks_reader_public_svc` / `bks_reader_internal_svc`. Ad hoc Cypher is advertised only under `database-role` authority after a refused-write proof |
| custody | `BKS_RELEASE_RUNS_DIR` | plans, receipts, snapshots, verifications and the admission ledger; a persistent volume (`/data/runs`); Supabase custody (bucket `knowledge-artifacts`, absent today) is S7 patch P4 and not implemented in this release. `BKS_RUNS_DIR` is CLI output only, not custody |
| driver | `BKS_NEO4J_ACQUISITION_TIMEOUT_MS` (10000), `BKS_NEO4J_CONNECT_TIMEOUT_MS` (5000) | tighten only |
| never in production | `BKS_LOCAL_DEV`, `BKS_ENABLE_BASELINE_TOOLS`, `BKS_WRITE_RELEASE_SOURCE=candidate` | local-dev principal, dev witness authority, release-marker bypass, raw Cypher tools |

## Endpoints that matter to operators

| endpoint | meaning |
| --- | --- |
| `GET /healthz` | liveness; always 200 while the process serves, body says whether the database is `reachable`, `unreachable` or `unconfigured` |
| `GET /readyz` | traffic gate: database answers, writer fence present, the newest `:KsReleaseMarker` carries the served `releaseId`, `schemaReleaseDigest` and `ddlDigest` (same rules as the GraphQL API), writer indexes ONLINE; 503 otherwise |
| `GET /describe` | release identities (`releaseId`, `schemaReleaseDigest`, `schemaDigest`, `queryCatalogDigest`, `workspaceFingerprint`, `executorVersion`) and advertised capabilities for the calling principal |
| `GET /capability` | the catalog capability descriptor (digest recorded in the release manifest) |
| `GET /kg/receipt?effectKey=…` | recovery after a lost apply response: the recorded receipt for the original effect key; never re-plan with a new clock |

Release rule: writes require the newest marker (greatest `installedAt`) to be the served release; a newer foreign marker
or a tie refuses every write with `BKS_RELEASE_MISMATCH`. The marker is written by the migration, not by the executor.

## Fly.io (graph stays on Aura)

`apps/executor/fly.toml`: app `bks-biotech-executor`, region `iad`, 1 GB shared CPU, one machine always running,
`BKS_TARGET=production`, `BKS_NO_ENV_FILE=1`, `BKS_RELEASE_RUNS_DIR=/data/runs`, checks on `/healthz` (liveness) and
`/readyz` (traffic). Every Fly command goes through `bash scripts/fly.sh` from the repository root; secret values come
from a protected file or stdin, never the command line.

```bash
# first deployment only (both exist since 2026-10-12):
bash scripts/fly.sh apps create bks-biotech-executor --org personal
bash scripts/fly.sh volumes create bks_executor_data --region iad --size 1 -a bks-biotech-executor
bash scripts/fly.sh secrets import -a bks-biotech-executor --stage < runs/release-v2/custody/s9/secrets/executor-production.env
# names in that file: BKS_BIOTECH_GRAPH_URI, BKS_BIOTECH_GRAPH_USERNAME, BKS_BIOTECH_GRAPH_PASSWORD, BKS_EXECUTOR_TOKENS, BKS_WITNESS_ISSUER, BKS_WITNESS_ISSUER_KEYS,
# BKS_VERIFIER_ISSUER_KEYS, BKS_READ_BINDINGS, BKS_READER_PUBLIC_{URI,USERNAME,PASSWORD}, BKS_READER_INTERNAL_{URI,USERNAME,PASSWORD}.
# No admission variables: the admission authority is not hosted on Fly (CUTOVER.md, lead decisions).
bash scripts/fly.sh deploy . --config apps/executor/fly.toml --dockerfile apps/executor/Dockerfile --remote-only --wait-timeout 10m
bash scripts/fly.sh status -a bks-biotech-executor
curl -s https://bks-biotech-executor.fly.dev/healthz
curl -s https://bks-biotech-executor.fly.dev/readyz        # 503 until the v2 release marker is installed on the graph
curl -s -H 'authorization: Bearer <token>' https://bks-biotech-executor.fly.dev/describe
```

Ordering on the 2026-10-12 cutover day (`docs/plans/schema-v2-service-release/CUTOVER.md`; a template for the next one): reader-role deny-list completeness check
against the APOC version installed on Aura (`node packages/kg-ops/scripts/rbac-completeness.mjs <fresh inventory>` must
report 0 gaps) → principals created on Aura (`scripts/ops/aura-principals.mjs`) → final export → production migration
with `bks_migrator_svc` (pre DDL, manifests, post DDL, release marker) → executor deploy → reads verified → the
predeclared ingestion/readback proof in a labeled synthetic scope → duplicate/receipt recovery proof → soak.

## Verification after deploy

1. `/readyz` 200 and `/describe` identities equal the deployed release (`schema/pinned/PIN.json`; the 2026-10-12 deploy was `biotech-schema-v2.0.2`, `sha256:5fffb593…`).
2. A typed read and a template read as each reader binding; `/kg/read/cypher` with a write clause refused.
3. Predeclared ingestion proof: one synthetic intent in the labeled test scope → plan → admit → apply → receipt → readback.
4. The same apply request again returns `duplicate` with the same receipt; `GET /kg/receipt?effectKey=…` returns it.
5. Custody: the plan, receipt and snapshot files exist under `/data/runs` on the volume (`fly ssh console` is not needed:
   receipts are also returned by the API).
6. Consumer side: GraphQL `/readyz` 200 as the reader principal and one safelisted `EntityCard` query returning data for a
   migrated public entity.
7. Release-marker tamper rehearsal (tampered, deleted and newer foreign marker each refuse writes with
   `BKS_RELEASE_MISMATCH`) is run on a disposable shadow only, never on the production graph.

## Rollback and recovery

- The executor holds no data of its own except custody files on the volume. Rolling back the service is redeploying the
  previous image (`bash scripts/fly.sh releases -a bks-biotech-executor`, then `deploy --image <previous>`); stopping the
  machine freezes writers (`bash scripts/fly.sh machine stop <id> -a bks-biotech-executor`).
- Graph data is not rolled back by a service rollback. Before any v2 write landed, the custody export is the data
  rollback; after v2 writes, freeze, reconcile `KsIntentMarker`s against receipts and prefer forward repair
  (`CUTOVER.md`, Rollback).
- A lost apply response is recovered with the original effect key, never with a new intent id or a re-plan.

## Local

```bash
pnpm build
BKS_NEO4J_TEST_CONTAINER=bks-neo4j-dev bash scripts/neo4j-test.sh up              # capped disposable Community container
export BKS_NO_ENV_FILE=1 BKS_BIOTECH_GRAPH_URI=bolt://127.0.0.1:7687 BKS_BIOTECH_GRAPH_USERNAME=neo4j BKS_BIOTECH_GRAPH_PASSWORD=bks-test-password BKS_BIOTECH_GRAPH_DATABASE=neo4j
node packages/kg-ops/dist/cli.js kg ensure-operations --phase all                  # release DDL (phased; blocked statements reported)
BKS_LOCAL_DEV=1 BKS_LOCAL_DEV_ROLE=writer EXECUTOR_PORT=4020 node apps/executor/dist/index.js
```

Without `BKS_NO_ENV_FILE=1` the CLI and executor load `./.env` (or `BKS_ENV_FILE`); if that file names the Aura host they
stop with exit 78 because `BKS_TARGET` is unset. The loaded path is printed, never its contents.

## Deployed state (S9 cutover, 2026-10-12)

The deployed image reads the older `NEO4J_*` / `BKS_VERIFICATION_*DSN` secret names; the code now reads `BKS_BIOTECH_GRAPH_*` / `BKS_BIOTECH_DB_*` (see "Before the next Fly deploy" in [ENVIRONMENT.md](../ENVIRONMENT.md)).

- App `bks-biotech-executor` (iad), Fly release v1 (17:26Z), image
  `registry.fly.io/bks-biotech-executor:v2-0-2-rc1@sha256:b4b27f8a573f82fef628d23753aa0c3d76fa875d132a00d56e1534add9bf23fc`,
  machine `8140eeb9de0348`, 1 GB, volume `bks_executor_data` (`vol_v8e01ldkl375jn5v`) mounted at `/data`
  (`BKS_RELEASE_RUNS_DIR=/data/runs`). `/readyz` ready: database, writer fence, release marker (`biotech-schema-v2.0.2`,
  migration `mig-575f91e942e3`), writer DDL.
- Principals: writer `bks_writer_svc` (Aura role `graphql_app_read_write_<id>`), read bindings `public`/`internal` on
  `bks_reader_public_svc` / `bks_reader_internal_svc` (`graphql_app_read_only_<id>`), `session-routing` /
  `application` visibility; ad hoc Cypher reads are `unsupported` (READ_AUTHORITY_UNAVAILABLE) by decision.
- Tokens (`BKS_EXECUTOR_TOKENS`, sha256 only on Fly): `lead-ops` (writer), `mission-control-biotech` (writer),
  `reader-ops` (reader, `read.internal`); scope installation `belllabs-prod`, application `biotech`, tenant `bks`.
- Admission: the executor verifies witnesses from issuer `bks-admission-prod` (kid `bks-admission-prod-2026-10`). It does
  not host the admission service; witnesses are issued by the lead-operated authority
  (`runs/release-v2/custody/s9/issue-witness.mjs`, grant registry in custody) until Mission Control hosts grants.
- Cutover proof (17:31Z): synthetic intent `lead-cutover-proof-2026-10-12` planned, admitted, applied (receipt
  `rc-a4950851…`), read back 11/11, duplicate apply returned the same receipt, recovery by effect key succeeded, changed
  payload refused.
- Rollback: redeploy the previous Fly release's image (`bash scripts/fly.sh releases -a bks-biotech-executor`); stopping the
  machine freezes all canonical writers. Graph data: see CUTOVER.md (forward repair after v2 writes).
