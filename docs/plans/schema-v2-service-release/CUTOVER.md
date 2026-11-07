# Cutover plan (S9) — draft skeleton, lead-owned

Status: **executed 2026-10-12** (Gate G passed 17:35Z; steps 1-6 and the consumer proof done; step 7 soak partial, step 8 attestation written; see `VALIDATION.md` S9 section). The sections below are the plan as executed plus the lead decisions.

## Targets and bindings (actual, from S0)

| Component | Current binding | Target binding | Owner of switch |
| --- | --- | --- | --- |
| Graph | Aura `neo4j` on instance `8032ec07` (5.27-aura Enterprise), legacy biotech-kg data, single database | same instance and database, migrated in place after rehearsal; legacy nodes relabeled `LegacyV0_*`, never deleted; export in custody is the rollback | lead |
| GraphQL API | Fly app `bks-biotech-graphql-api` (iad, 4 GB, v1 pin `8313a6f8...`, vector on; current release v3, image `deployment-01M4E5VAVC97ZSGMPS9V44W2PB`) | same app, image from `apps/graphql-api/Dockerfile` (local build `bks-graphql-api:s6-v2.0.2`), `fly.toml` final: vector/startup DDL/mutations false, readiness `/readyz`, secrets `NEO4J_URI`, `NEO4J_READER_USERNAME`, `NEO4J_READER_PASSWORD`, `GRAPHQL_API_KEY`, `GRAPHQL_ACTOR_PUBLIC_KEY`; staging app `bks-biotech-graphql-api-staging` first (`--ha=false`), then `deploy --strategy canary --wait-timeout 10m` | lead via `bash scripts/fly.sh` (secrets piped from a file, never on the command line) |
| Executor (HTTP/MCP) | none deployed | new Fly app `bks-biotech-executor` (iad) from `apps/executor/Dockerfile` (pending from the executor role), `BKS_TARGET=production` required, writer principal `bks_writer_svc`, read bindings `bks_reader_public_svc`/`bks_reader_internal_svc`, witness issuer keys, volume `/data` for plan custody until the Supabase bucket exists | lead |
| Reference BFF | none deployed | app `bks-biotech-bff` from `apps/product-bff/{Dockerfile,fly.toml}` (image built and probed); deployed only if a consumer exists at cutover and the product owner supplies the Supabase JWKS issuer; otherwise packaged, tested, documented, not deployed (recorded limitation) | lead |

Rollback reference: GraphQL redeploys the previous image (Fly release v3) with the v1 `fly.toml` from BKS commit `431c8a7`; this does not undo the graph migration (export in custody is the data rollback before v2 writes; forward repair after).
| Semantic index | none (0 OpenAI vector stores) | one generation per release, pointer in custody `runs/release-v2/custody/semantic/current.json` | lead (S5 proof) |
| Workspace / skills | v1 workspace fingerprint `72282103...` | v2 workspace fingerprint from S2; skill bundle version from `skill-routing.json` | lead |

## Principals to create on Aura before S9 (lead only)

Using the console admin principal from `.env` (has `user_management` and `assign_role`):

| Role | Grants | User |
| --- | --- | --- |
| `bks_reader` | `ACCESS ON DATABASE neo4j`, `MATCH {*} ON GRAPH neo4j`, `EXECUTE PROCEDURE db.*, apoc.meta.*, apoc.text.*` (read-only allowlist) ; deny write | `bks_reader_svc` |
| `bks_writer` | reader grants plus `WRITE ON GRAPH neo4j`, `CREATE NEW LABEL/TYPE/PROPERTY NAME`; deny `CONSTRAINT`, `INDEX`, `DATABASE MANAGEMENT`, `USER MANAGEMENT` | `bks_writer_svc` |
| `bks_migrator` | writer grants plus `CONSTRAINT MANAGEMENT`, `INDEX MANAGEMENT` on `neo4j` | `bks_migrator_svc` |

Passwords generated locally, stored only in `.env` (ignored) and Fly secrets. Proof: `SHOW USER PRIVILEGES` per user and a denied write under `bks_reader`.

**Aura Professional finding (lead, 2026-10-12 16:17Z, supersedes both the table above and the custom-role tooling for this target).** The console admin (`console_admin_pro_8032ec07`) has `USER MANAGEMENT`, `ASSIGN ROLE`, `REMOVE ROLE`, `SHOW ROLE` but **no `ROLE MANAGEMENT`**: `CREATE ROLE` is refused (`Neo.ClientError.Security.Forbidden`), and `SHOW ... PRIVILEGES` of other roles/users is refused too. Custom roles (`bks_reader_public`, `bks_reader_internal`, `bks_writer`, `bks_migrator` from `readerRoleStatements`) therefore cannot exist on this instance; they remain the rehearsed design for Enterprise/self-hosted targets. Probes with temporary users (dropped afterwards; `custody/s9/aura-role-probes*.json`) showed that Neo4j's plain built-in roles (`reader`, `publisher`, `architect`) cannot call `dbms.components`, `db.*` or any APOC function on Aura, which the GraphQL library (`dbms.components`, `apoc.date.convertFormat`), the read service (`dbms.components`, `db.index.fulltext.queryNodes`) and the writer fence (`dbms.components`, `db.awaitIndexes`) need. Aura's own GraphQL Data API roles carry those grants. Decision and applied binding (`aura-principals.mjs --apply --builtin`, 16:29Z, passwords only in `custody/s9/principals.json`):

| User | Aura roles | Proven (probe battery, every probe inside a rolled-back transaction) |
| --- | --- | --- |
| `bks_reader_public_svc`, `bks_reader_internal_svc` | `graphql_app_read_only_8032ec07` | MATCH, SHOW INDEX/CONSTRAINT, `dbms.components`, `db.*`, APOC functions OK; **write refused, CREATE INDEX refused**, `dbms.listConfig` and `SHOW USERS` refused |
| `bks_writer_svc` | `graphql_app_read_write_8032ec07` | as above plus WRITE; **CREATE INDEX refused** (no DDL) |
| `bks_migrator_svc` | `architect` + `graphql_app_read_only_8032ec07` | WRITE, CREATE INDEX, procedures OK |

Consequences recorded in the compatibility matrix: database-level procedure deny lists (the `apoc.*` / `dbms.*` narrowing of the custom reader roles) are **not available** on Aura Professional; `apoc.load.*` is executable by the Aura roles (fails only because file access is disabled), so egress protection rests on the application layer (parser policy allowlist `db.index.fulltext.queryNodes` only; GraphQL safelist). Read bindings run with `readAuthority: session-routing` and `visibility: application` in production, so **ad hoc Cypher reads stay unsupported** (already the manifest's stance) and public visibility is enforced by the application (typed reads, GraphQL `@authorization` projection). The read-only property of the GraphQL and read principals is proven by the refused write.

Actual tooling for Enterprise/self-hosted targets (custom roles; kept for the rehearsal record): `node scripts/ops/aura-principals.mjs --dry-run | --check | --apply --out runs/release-v2/custody/s9/principals.json`. It creates `bks_reader_public`, `bks_reader_internal` (statements generated from `packages/kg-ops/src/read/rbac.ts` `readerRoleStatements`, which allow only `apoc.date.convertFormat` and a five-procedure allowlist), `bks_writer`, `bks_migrator`, and users `<role>_svc`; it proves the public reader cannot write. Pre-steps on the day: `pnpm build`; `node packages/kg-ops/scripts/rbac-completeness.mjs runs/release-v2/custody/s9/aura-functions-procedures.json` must report 0 gaps (re-capture the inventory first with `runs/release-v2/custody/s9/aura-functions.mjs`); any pre-existing role of the same name must be dropped before applying. Rehearsed by the qualification role on Enterprise eval (4 roles, 4 users, write refusal proven).

## Sequence (from KICKOFF S9; each step gets an evidence row)

1. Freeze writers (none deployed today besides the migrator itself; confirm `KsIntentMarker` count is 0 and no in-flight effects). Final export to custody; verify restore; compute delta since rehearsal export (expected empty).
2. Apply final delta to the local shadow; re-run migration accounting, invariants, required index ONLINE checks, release marker verification.
3. Build images from the exact release source snapshot; deploy executor to its new Fly app and GraphQL to a canary machine; verify `/readyz`, identities, real reads, operation bounds, receipt lookup.
4. Run production migration on Aura with `bks_migrator_svc` in the rehearsed phase order (release v2.0.2 `ddl.json` phases): pre-migration DDL (`required.pre` 357 + `enterprise.pre` 142) → migration manifests (`plan-migration.mjs` bound to `sha256:5fffb593...`, `apply-migration.mjs --mode apply`, one transaction per batch, markers with `markerKey`) → post-migration DDL (`enterprise.post` 69; `rel_MEASURES_assertion_exists` deliberately skipped as blocked-by-legacy-data) → `KsReleaseMarker {releaseId, schemaReleaseDigest, ddlDigest, installedAt, migrationRunId}` → accounting + invariants (59 checks) → S4 assertion replay. Maintenance window = GraphQL readiness reports release mismatch until the marker is written (reads fail closed with a typed mismatch; no mixed-release writes possible because no v2 writer is live before this point).
5. Switch GraphQL to the v2 image (Fly release), publish workspace/skill/capability pointers and the semantic-generation pointer.
6. Verify v2 reads (safelisted operations, typed native reads, Cypher read artifact). Enable v2 writer (executor app secrets set). Run the predeclared ingestion/readback proof with clearly labeled synthetic-fixture facts in a dedicated, labeled test scope, then the duplicate/receipt recovery proof.
7. Soak: 30 minutes of representative load and metrics; stop/rollback on invariant, authority, release-mismatch, accounting or performance failure.
8. Publish sanitized attestation (`RELEASE-MANIFEST.md`), update operator docs.

## Compatibility decisions (lead)

- **Live `:Chunk` constraints.** The shared Knowledge Services ingestion owns Enterprise constraints on `:Chunk` (`chunkId`, `chunkKey`, `index`, `text` NOT NULL; `chunkId`/`chunkKey` unique) and on `Document`, `DocumentTextVersion`, `Segmentation`. They conflict with the v2 D9 `Chunk` shape. Decision: they are not dropped or modified by this release (they belong to another authority); v2 `Chunk` writes are **unsupported** in this release and the compatibility matrix says so. The migration creates no Chunk nodes. Reconciliation is a separate DDL decision with the Knowledge Services owner.
- **Legacy labels.** `LegacyV0`, `LegacyV0_<Label>`, `MIGRATED_FROM`, `legacyLabels`, `legacyExportDigest` and the qualifier family `legacy:*` are operational, release-registered names (v2.0.1), excluded from the consumer projection and from ordinary agent write capability.
- **Migration marker keys.** The migrator participates in `KsWriteFence` and claims `KsIntentMarker {effectKey: migration:<runId>:<batchId>, planRef: <migrationRunId>}`; the native executor confirms the marker shape in operational DDL.

## Rollback

- Before v2 writes: redeploy the previous GraphQL image (Fly release v3) and, if the migration was applied, relabel `LegacyV0_*` back (reverse mapping script) or restore from the custody export into the instance (full restore procedure documented by S8). Switch workspace/skill/index pointers together.
- After v2 writes: freeze, reconcile markers, prefer forward repair. The old image is not a data rollback.

## Lead decisions recorded during S9 (2026-10-12)

- **No separate staging apps.** The consumer API's readiness fails closed until the v2 `KsReleaseMarker` exists on the production graph, so a staging app against the same graph proves nothing before the migration and costs a 4 GB machine. The executor's first deploy is a new app (nothing to disrupt); the GraphQL switch uses `deploy --strategy canary` on the existing app, which keeps the current machine serving until the new one passes `/readyz`. Rollback remains the previous Fly release.
- **Admission authority is not hosted on Fly in this release.** The production executor only verifies witnesses (`BKS_WITNESS_ISSUER_KEYS`, issuer `bks-admission-prod`, kid `bks-admission-prod-2026-10`). The signing key and the grant registry (`bks-grant-registry.v1`, grants for `lead-ops` and `mission-control-biotech`) stay in custody and are used by the admission service run by the lead (and later by Mission Control, which owns grants). Reason: no Mission Control deployment exists for Biotech, and keeping the signing key off the public executor is the smaller trust surface. `BKS_ADMISSION_*` stays unset on Fly.
- **Executor principals.** `BKS_EXECUTOR_TOKENS` carries three `tokenSha256` entries (`lead-ops` writer, `mission-control-biotech` writer, `reader-ops` reader with `read.internal`), installation `belllabs-prod`, application `biotech`, tenant `bks`. Plaintext tokens only in `custody/s9/secrets/executor-client-tokens.json`.
- **Read bindings in production.** `public` and `internal` bindings on `bks_reader_public_svc` / `bks_reader_internal_svc`, `readAuthority: session-routing`, `visibility: application` (Aura Professional, see above); ad hoc Cypher unsupported.
- **Secret material** generated 2026-10-12T16:33Z into `runs/release-v2/custody/s9/secrets/` (`MANIFEST.json` lists files and digests; values never leave custody): GraphQL reader credentials + API key (sha256 `99a30a1f...`) + actor public key; BFF API key + actor private key; executor writer credentials, tokens, issuer keys, read bindings; migrator credentials; admission signing key + grants; verifier signing key (held, no verifier deployed).
- **Final export** `20261012T163349Z-aura-neo4j-final` (exportDigest `sha256:e625fcdd...`, 210 nodes / 288 relationships, 19 labels / 25 types, 112 indexes / 24 constraints, export-only verify 3/3). Data files identical in counts to the rehearsal export; the token inventory gained property-key/label tokens left by the (rolled-back) principal probes, which Neo4j does not roll back. Re-plan on this export recorded in VALIDATION.
