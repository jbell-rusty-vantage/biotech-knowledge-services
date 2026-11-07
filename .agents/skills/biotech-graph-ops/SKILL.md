---
name: biotech-graph-ops
description: >-
  Operator capability for the BellLabs biotech Neo4j graph: verified read-only export/backup, restore rehearsal into
  disposable Community or Enterprise containers, restore verification, legacy-to-v2 migration planning, rollback-only
  dry runs, gated migration apply, DDL install checks and reader/writer/migrator role separation. Uses separate operator
  credentials. Not for research ingestion, ordinary reads or ontology edits (use biotech-kg-ingest, biotech-kg-query,
  biotech-schema-explore). Never loaded into knowledge agents.
allowed-tools:
  - Bash(node scripts/migration/*)
  - Bash(node packages/kg-ops/src/migration/*)
  - Bash(bash scripts/neo4j-test.sh *)
  - Bash(docker *)
---

# biotech-graph-ops: export, restore, migrate, with evidence

Operator lane for Gate F (migration and restore rehearsal). Every step writes an artifact under protected custody
`runs/release-v2/custody/backups/<exportId>/` (gitignored; never commit it). Run from the repository root.

## Read these overrides before loading any vendored Neo4j skill

Routing and digests: `.agents/skills/skill-routing.json` (route `operations.graph`). The vendored skills are generic;
this release overrides them:

- **OV-CYPHER-VERSION**: Cypher 5 only (`CYPHER 5` prefix allowed), never `CYPHER 25`; nothing newer than 5.26 syntax.
- **OV-OPERATOR-ONLY**: provisioning, users/roles, `neo4j-admin`, bulk import are operator actions with operator
  credentials. No Aura API client credentials exist here: console snapshots are an operator option outside this tooling.
- **OV-GENERIC-WRITES**: no ad hoc MERGE/DELETE on the graph. Data changes go through the migration manifest; legacy
  data is never deleted.
- **OV-ELEMENT-ID**: `elementId()` changes across restores (observed). Restore maps ids explicitly; the migrator matches
  legacy rows by their durable legacy key (`id`, `documentId`, `evidence_id`).

Then load on demand: `neo4j-cli-tools-skill` (cypher-shell, docker, neo4j-admin), `neo4j-security-skill` (RBAC),
`neo4j-import-skill` (bulk mechanics), `neo4j-driver-javascript-skill` (driver 6 behaviour of these scripts).

## Credentials and roles

| Principal | Holds | Used by |
| --- | --- | --- |
| production read (`.env` `NEO4J_*`) | today the instance admin user; the export opens READ sessions only | `export-graph.mjs` |
| `BKS_RESTORE_*` | local disposable admin (`neo4j/bks-test-password`) | restore, verify, dry run, principal rehearsal |
| `bks_reader` / `bks_writer` / `bks_migrator` | read / write no DDL / write + index + constraint + name management | service reader, executor, migrator (S9 creates them on Aura) |

Write tools refuse the production host and any `*.databases.neo4j.io` host. There is no fallback from `BKS_RESTORE_*`
to `NEO4J_*`. Never print `.env` or a password.

## Procedure

1. **Export (READ only)**: `node scripts/migration/export-graph.mjs`. Streams every node (labels, elementId, all
   properties), relationship (type, endpoints, properties), `SHOW INDEXES`/`SHOW CONSTRAINTS` rows, server identity and
   token lists in one READ transaction; asserts no result summary reported updates. Output: `nodes.jsonl`,
   `relationships.jsonl`, `schema.json`, `server.json`, `tokens.json`, `manifest.json` (counts per label, label set,
   type and triple; property schemas; per-file sha256; `exportDigest`). Values are typed losslessly (`bks-graph-export.v1`:
   integers beyond 2^53, temporal with offset/zone/nanoseconds, durations, points, `byte[]`, NaN/Infinity/-0, arrays).
2. **Check the export alone**: `node scripts/migration/verify-restore.mjs --export <dir> --export-only`.
3. **Disposable targets**: `bash scripts/neo4j-test.sh up` (5.26 Community, bolt 7690). Enterprise evaluation:
   `docker run -d --name bks-neo4j-ent-eval -p 7691:7687 -p 7491:7474 -e NEO4J_AUTH=neo4j/bks-test-password -e NEO4J_ACCEPT_LICENSE_AGREEMENT=eval -e NEO4J_PLUGINS='["apoc"]' -e NEO4J_dbms_security_procedures_unrestricted='apoc.*' neo4j:5.26-enterprise`.
4. **Restore**: `BKS_RESTORE_URI=neo4j://localhost:7691 BKS_RESTORE_PASSWORD=... node scripts/migration/restore-graph.mjs --export <dir> --label enterprise-eval`.
   Refuses a non-empty target. Recreates tokens, nodes by label set, relationships by type via the elementId map,
   constraints, then indexes; reports `unsupported` DDL by edition (Community lacks existence/key/type constraints).
5. **Verify**: `... node scripts/migration/verify-restore.mjs --export <dir> --restore <dir>/restores/<run>`. Checks
   counts per label/label set/type/triple, property-key sets and types, deep equality of every element through the id
   map, reconstructed file digests equal to the source digests, and index/constraint names present and ONLINE (minus
   reported edition gaps). Exit 1 on any failure.
6. **Plan (no writes)**: `node packages/kg-ops/src/migration/plan-migration.mjs --export <dir>`. Reads
   `schema/program/final/migration/legacy-map.yaml`; refuses on any uncovered label, triple or property; emits
   `migration-manifest.json` (bks-migration-manifest.v1), `uid-map.jsonl`, `batches.jsonl`, `accounting.json` and
   `accounting-records.jsonl` under `<dir>/plans/<migrationRunId>/`. Same inputs, same bytes.
7. **Validate the plan**: `node scripts/migration/validate-plan.mjs --plan <planDir>` (JSON Schemas in
   `scripts/migration/schemas/`, record-level reconciliation to the export counts).
8. **Dry run (rollback only)**: `... node packages/kg-ops/src/migration/apply-migration.mjs --plan <planDir> --export <dir> --mode dry-run-rollback`.
   Runs every batch in batch order inside one transaction with the fence lock, checkpoint markers and the release marker
   last, evaluates every manifest invariant, rolls back, and proves the target is unchanged.
9. **Release DDL (before the batches)**: `node scripts/migration/apply-release-ddl.mjs --phase required` installs
   `ddl/required.cypher` from `loadRelease()` plus the fence bootstrap; `--phase verify` checks every name ONLINE.
   Enterprise DDL is NOT installed before migration: legacy rows still carry seven labels its `uid_exists_*`
   constraints cover.
10. **Apply (gated)**: `BKS_MIGRATION_APPLY_AUTHORIZED=1 ... apply-migration.mjs --mode apply` fails closed (exit 3)
   unless the plan's release digest and ddlDigest equal the pinned release, required DDL is ONLINE, both fences exist
   and no other run's `KsReleaseMarker` exists ('1' is accepted on disposable shadows only). Each batch is one
   transaction: fence lock (`locked`, `lockSeq`+1), marker lookup by `markerKey` (S3 `markerKeyOf`; same digest applied:
   skip; different digest: `BKS_EFFECT_CONFLICT`), uid precondition, statements, `graphRevision`+1, marker `applied`,
   commit. On Enterprise the release `enterprise.cypher` follows the batches; a constraint that preserved legacy data
   violates is reported `blocked-by-legacy-data` (today `rel_MEASURES_assertion_exists`). Invariants, then the
   `KsReleaseMarker` last. Restart after a kill: rerun the same command (`migration-state.mjs` shows progress);
   `--crash-in-batch <id>` is the rehearsal fault.
11. **Rollback before v2 writes**: `rollback-migration.mjs --plan <dir> --export <dir> --drop-release-ddl [--remove-fences]`
   removes only this run's v2 nodes, markers and release marker, drops release rules the export lacked and reverses
   relabels; then verify-restore must pass 17/17. After v2 writes: forward repair only.
12. **Supported-question replay (no assertions)**: `replay-catalog.mjs --plan <dir>` (EXPLAIN + execute every supported
   template; optional-index templates are reported as disabled capability).
13. **Principals (Enterprise)**: `BKS_RESTORE_URI=neo4j://localhost:7691 ... node scripts/migration/rehearse-principals.mjs`
    creates the three roles on a scratch database, proves allowed/denied operations per principal, then drops them.

## Results to hand off

Export path and `exportDigest`; restore report and verify report per edition (with timestamps); plan
`migrationRunId`, `manifestDigest` and accounting totals; dry-run report; principal proof. Summaries go to
`docs/plans/schema-v2-service-release/MIGRATION-ACCOUNTING.md` without record values.

## Limits

- The export is read-committed, not a snapshot: freeze canonical writers before the final export (S9 step 1).
- Restore needs an empty target and recreates token-only labels/keys through deprecated `db.create*` procedures.
- Community cannot hold existence/key/type constraints; Enterprise parity checks run on the evaluation image.
- Apply waits for S1 DDL and the S3 fence; `MIGRATED_FROM` and `LegacyV0*` must be listed as operational in S1 rules.

## Failures and recovery

| Symptom | Meaning | Action |
| --- | --- | --- |
| export integrity failure | a custody file changed | discard that export; re-export |
| `target is not empty` | restore target reused | `bash scripts/neo4j-test.sh down && ... up`, or a fresh Enterprise database |
| coverage gaps from the planner | live data has a label/triple/property the map lacks | extend `legacy-map.yaml` (S8) and re-plan; never skip |
| `target legacy graph differs from the export` | writes happened after the export | re-export, re-plan, re-rehearse |
| `BKS_STALE_PRECONDITION` | a uid of the batch exists | reconcile through the marker/receipt; never re-mint |
| apply refused | prerequisites unmet | supply the missing S1/S3/operator item; do not bypass |

## Evaluations

`evals/v2/write-recovery/tasks.json` tasks WR-29 and WR-30 (export/restore and migration accounting) and the Gate F
rows in `docs/plans/schema-v2-service-release/reports/S8-migration-prep.md`.
