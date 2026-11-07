# S8 handoff: migration preparation, export/restore proof, skill review, evaluation freeze

Role: Migration / independent qualification. Wave 1, 2026-10-11. Aura was touched only through READ sessions (export,
capability probe). No commits, no pushes, no production writes, no DDL or role changes on Aura. A subagent's "done" is
not integration evidence: every command below is meant to be rerun by the lead.

## 1. Files created (all new; no existing file edited)

| Path | Purpose |
| --- | --- |
| `scripts/migration/lib/common.mjs` | env loading (private, never printed), lossless `bks-graph-export.v1` value codec, canonical JSON, digests, disposable-target guard |
| `scripts/migration/export-graph.mjs` | full streamed READ export (nodes, relationships, SHOW INDEXES/CONSTRAINTS, server identity, tokens, manifest) |
| `scripts/migration/restore-graph.mjs` | restore into an empty disposable target (`BKS_RESTORE_*` only), edition-gap reporting |
| `scripts/migration/verify-restore.mjs` | source manifest vs target: counts, property schemas, deep equality via id map, reconstructed digests, index/constraint names ONLINE |
| `scripts/migration/validate-plan.mjs` | JSON Schema validation of plan outputs plus record-level reconciliation |
| `scripts/migration/rehearse-principals.mjs` | bks_reader / bks_writer / bks_migrator separation proof on disposable Enterprise |
| `scripts/migration/skill-digests.mjs` | per-skill digests, `skill-routing.json` check, vendored byte-identity snapshot/compare |
| `scripts/migration/fixtures/seed-type-fidelity.mjs` | SYNTHETIC all-types fixture for codec proof (disposable targets only) |
| `scripts/migration/schemas/bks-migration-manifest.v1.schema.json`, `bks-migration-accounting.v1.schema.json` | manifest and accounting contracts |
| `packages/kg-ops/src/migration/{transforms,statements,plan-migration,apply-migration}.mjs` | planner (no writes), Cypher 5 batch templates, rollback-only dry run, fail-closed apply with fence/marker/release-marker ordering |
| `schema/program/final/migration/legacy-map.yaml` | legacy v0 -> v2 map (for S1 to copy as `migration/legacy-map.yaml`) |
| `.agents/skills/skill-routing.json` | `bks-skill-routing.v1` draft (11 routes, 9 overrides, 29 dependency digests) |
| `.agents/skills/biotech-graph-ops/SKILL.md` | operator skill |
| `.agents/skills/biotech-graph-analyze/SKILL.md`, `scripts/capability-probe.mjs` | gated analytics skill and read-only probe |
| `evals/v2/{build-tasks,derive-gold,score}.mjs`, `protocol.md`, `od35-review-set.md`, `FREEZE.json`, `od35/{build-frame.mjs,frame.json,review-set.json}`, `{schema-discovery,native-read,write-recovery}/{tasks,gold-spec,gold}.json` | frozen evaluation |
| `docs/plans/schema-v2-service-release/{SKILL-REVIEW,OPTIONAL-CAPABILITIES,MIGRATION-ACCOUNTING}.md`, `reports/S8-migration-prep.md` | documents |
| `runs/release-v2/custody/backups/**` (gitignored) | export, restore/verify reports, id maps, plan, dry-run reports, synthetic fixture export |

Not produced: `schema/program/final/migration/v1-map-notes.md`. None of the seven unmapped v1 relationship types
(ABOUT_CONDITION, ASSESSES_CLAIM_EVIDENCE, CLAIM_EVIDENCE_BASED_ON, DEPENDS_ON, HOSTS_CHANNEL, PART_OF_PLAN,
USES_COMPONENT) exists in the live data or even as a relationship-type token (25 tokens, all in use). 20 v1-era labels
exist only as tokens (0 nodes, created by legacy index definitions); the restore recreates them as tokens.

## 2. Export identity (Gate F backup)

| Item | Value |
| --- | --- |
| Path | `runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j/` (custody; never in Git) |
| exportDigest | `sha256:7f76eefcf7b50977d78efc7d761e00a4622f7e45d4afa97d11c8d0a84a385ba1` (over the per-file digests) |
| manifest.json sha256 | `f923c54f560a3736440b51858ba1ccf6bffcb80a12a5a84e31621a59a7d9fe2f` |
| Files | nodes.jsonl `b8534c56...` (210 lines), relationships.jsonl `b7b46a47...` (288), schema.json `1b5b9915...`, server.json `3ce546fe...`, tokens.json `4d1ea295...` |
| Server | Neo4j/5.27-aura enterprise, Cypher 5 and 25, database `neo4j` (db id recorded), host `8032ec07.databases.neo4j.io`; no credentials recorded |
| Counts | 210 nodes, 288 relationships, 19 labels, 19 label sets (single-label nodes), 25 types / 29 triples, 128 property keys in use of 468 tokens, 112 indexes (31 FULLTEXT, 15 VECTOR, 56 RANGE, 8 constraint-backing RANGE, 2 LOOKUP), 24 constraints (16 existence, 8 uniqueness), 0 nodes with `uid`; matches S0 |
| Read-only proof | READ sessions; every result summary checked: `updatesReported: false` |
| Time | 2026-10-11T22:44:03.858Z to 22:44:06.543Z |
| Consistency | one explicit READ transaction (read committed, not a snapshot); no canonical writer active (S0) |
| Schema digest | `sha256:196b70f4...` (indexes/constraints without volatile fields) |

`runs/release-v2/custody/s0/aura-inventory.json` named in the brief does not exist on disk; S8 used its own export as
the machine inventory (it carries labels, label sets, triples, node/relationship property schemas with types, indexes,
constraints and procedure inventory).

## 3. Restore and verify results

Codec proof first (SYNTHETIC fixture, labeled `BksSyntheticTypeFidelity`, disposable only): integers beyond 2^53 and
Long min/max, NaN/±Infinity/-0.0, Date/Time/LocalTime/LocalDateTime/DateTime with offset, zone id (DST gap) and
nanoseconds, Durations, cartesian/WGS-84 2D/3D points and point arrays, `byte[]` (driver `Int8Array`), typed and empty
arrays, unicode, unlabeled nodes, self loops, property-less relationships, and node key / existence / property type /
relationship key / relationship uniqueness constraints plus range, text, point, fulltext and vector indexes.
Export `20261011T224154Z-synthetic-type-fidelity-ent526` (`sha256:bf1fb11d...`): Enterprise restore 17/17 checks
(0 gaps), Community restore 17/17 checks with 7 expected edition gaps (5 constraints + 2 backing indexes). One codec
defect was found and fixed during the proof (the JS driver serializes `Uint8Array` as a float list; `byte[]` must be
`Int8Array`).

Aura export:

| Edition | Restore command (from repo root) | Restore time | Result | Verify | Verify time |
| --- | --- | --- | --- | --- | --- |
| Community 5.26.31 (`bash scripts/neo4j-test.sh up`, bolt 7690) | `BKS_RESTORE_URI=neo4j://localhost:7690 BKS_RESTORE_PASSWORD=bks-test-password node scripts/migration/restore-graph.mjs --export runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j --label community-5.26.31` | 22:44:18.778Z-22:44:40.464Z | 210/210 nodes, 288/288 rels; 8 constraints created, 16 existence constraints unsupported (Community); 102 indexes created, 2 lookup equivalent, 8 constraint-owned; tokens 39/25/468 | `... verify-restore.mjs --export <exp> --restore <exp>/restores/20261011T224418Z-community-5.26.31` -> ok, 17/17, 16 expected gaps | 22:45:11.252Z-22:45:11.982Z |
| Enterprise 5.26.31 eval (bolt 7691) | same with `BKS_RESTORE_URI=neo4j://localhost:7691 ... --label enterprise-eval-5.26.31` | 22:44:41.171Z-22:45:06.049Z | 210/210, 288/288; 24/24 constraints, 102 indexes created, 2 lookup equivalent, 8 owned; all ONLINE | -> ok, 17/17, **0 gaps** | 22:45:12.405Z-22:45:12.960Z |

Verify checks: export file digests; unmapped target nodes/rels = 0; node and relationship totals; counts per label,
label set, type and triple; node and relationship property-key sets with value types; deep equality of all 210 nodes and
288 relationships through the id map; reconstructed nodes.jsonl / relationships.jsonl digests equal the source digests;
index/constraint names present; all ONLINE. Every elementId changed across restore (id maps in custody), which is the
evidence for OV-ELEMENT-ID.

**Enterprise image availability**: `docker pull neo4j:5.26-enterprise` succeeded (2026-10-11T22:34Z, digest
`sha256:02d30e0a80f0aaed71cfdfaa85c8ea01cf44aacd55510d4a2b4a53f9f1a2e1ad`, 969 MB); the container runs with
`NEO4J_ACCEPT_LICENSE_AGREEMENT=eval` as `bks-neo4j-ent-eval` on 7691/7491 with APOC core; RBAC works (section 6).
Both local containers are left running for the lead's reruns (disposable; `bash scripts/neo4j-test.sh down` and
`docker rm -f -v bks-neo4j-ent-eval` remove them; the Enterprise container also holds the synthetic `bkssynthsrc` /
`bkssynthdst` databases).

## 4. Legacy map coverage and decisions

Coverage is enforced by the planner (fails closed on any uncovered label, triple, property of a migrated element,
builder field, or v1-shaped type): **19/19 labels, 29/29 triples (25/25 types), every live property** of migrated
elements listed; properties of retained/held elements follow their element. Negative test: a map missing one label is
refused.

Key decisions (full reasons in the map):
- Relabel 17 domain labels to `LegacyV0_<Label>` + `:LegacyV0 {legacyLabels, legacyExportDigest}` (7 collide with v2
  labels); tag-only for `Document` (KS document lane, live `document_*` constraints) and the deployment evidence node.
  `MIGRATED_FROM` from each v2 node to its legacy node; legacy rows matched by durable legacy key, never elementId.
- Provenance per S0 section 5: legacy-import Agent, migration Activity informed by 3 legacy research-run Activities
  (source-stated run ids, no invented times), `Source{sourceKind: DATASET}` + one SourceSnapshot (contentHash =
  exportDigest, retrievedAt = export start) + one DATASET SourceLocator per cited legacy record (quoteHash of the
  canonical record line); 180 Assertions `EXTRACTED`, `basisKind UNSTATED`, `HAS_EVIDENCE {CONTEXT, DECLARED}`;
  legacy `confidence` -> `extractionConfidence` only; legacy validFrom kept with basis UNKNOWN; legacy recordedFrom kept
  as qualifier `legacy:recordedFrom` (v2 recordedFrom is the commit time).
- Deviation from the brief's default for `*Snapshot`, with justification: all 21 snapshot nodes are byte-identical
  state caches of their parents (248/248 non-temporal fields equal) with no label panel content, so minting LabelVersion
  / Organization history would fabricate label content and dates; they are retained legacy (temporal metadata kept).
- Biomarker -> Metric (methylation-derived vendor outputs; the curated Biomarker is held curation work); Study ->
  Publication (both rows are DOI publications); TechnologyPlatform -> AlgorithmVersion with `versionBasis UNKNOWN`
  except the assay platform (held); LDT regulatory status and ANNOUNCED events held instead of guessed.
- Identity: `hu:<token>:<slug(name)>-<shortHash('bks-legacy-v0|label|key')>`, deterministic; identity tuples and tier
  (exact/provisional/unresolved) recorded in the uid map; equal tuples are never merged (0 found).
- `searchEmbedding` stays legacy only (OD-44); `BellLabsSchemaDeploymentEvidence` retained (operational).

## 5. Accounting preview (plan `mig-eee5e7a518c3`, manifest `sha256:4956d530...`)

Nodes 210 = 176 migrated + 26 unchanged-retained + 8 held; relationships 288 = 178 migrated + 27 retained + 83 held;
excluded 0 (properties only). Creates 176 domain nodes, 180 Assertions, 180 locators, 2 DOI Identifiers, 4 Activities,
1 Agent, 1 Source, 1 Snapshot, 7 asserted domain relationship types (151 edges), 176 MIGRATED_FROM; relabels 207 and
tags 3. Details: `MIGRATION-ACCOUNTING.md`.

Dry run (`apply-migration.mjs --mode dry-run-rollback`, one transaction, fence lock + checkpoint markers + release
marker last, then rollback): Enterprise eval 2026-10-11T23:02:03Z-23:02:24Z **dry-run-passed**, 65/65 batches, 47/47
invariants, rollback residue 0, legacy unchanged; Community 23:02:34Z-23:03:22Z **dry-run-passed**, same totals.
Apply mode on Enterprise eval: **refused (exit 3)** with unmet prerequisites `release.digestBound`,
`release.ddlJson`, `fence.present`, `operator.authorization` (expected). Apply/dry-run against the Aura host: refused
before connecting. Plan determinism: re-plan byte-identical (all 5 output files). `validate-plan.mjs`: 13/13. Tampered
manifest: schema check fails and apply refuses (`manifest digest mismatch`).

## 6. Skill review summary

29 vendored skills byte-identical before/after (153 files, `diff` empty). Decisions: 14 keep-for-role, 15 not-loaded.
Tested matrix: 5.26.31 Community and Enterprise eval (local), 5.27-aura Enterprise (target, READ only); Cypher 5
baseline (`CYPHER 5` accepted on both local servers; `CYPHER 25` never); APOC core 5.26.31 local / 2026.09.0 Aura; GDS
installed on Aura (454 procedures, "versionless" AGA), absent locally, not admitted. Nine overrides (Cypher version,
release-bound schema instead of "`<db-name>-schema.json` anywhere", generic MERGE/DELETE, elementId, GDS write-back, READ
routing, confirm-writes, vector SEARCH, operator-only). Routing table with 11 routes; `--check` passes with one pending
entry skill (`biotech-graphql-maintain`, S6). Principal rehearsal on Enterprise eval: 10/10 allowed/denied checks
(reader denied writes even on a WRITE-routed session; writer denied index/constraint/user DDL; migrator allowed
constraint DDL and writes, denied role grants). Full review: `SKILL-REVIEW.md`.

## 7. Evaluation freeze (no LLM run)

| Suite | Tasks | Categories |
| --- | ---: | --- |
| schema-discovery | 68 | exact 24, paraphrase 20, negative 14, cross-domain 10; all 14 modules (K 6, D1 4, D2 4, D3 5, D4 6, D5 5, D6 7, D7 5, D8 4, D9 5, D10 4, D11 4, D12 4, D13 5) |
| native-read | 33 | trace 14, history 4, resolve 7, negative/status 3, migration-rehearsal 5 |
| write-recovery | 33 (31 critical) | admission 6, recovery 4, provenance 3, temporal 3, boundary 3, read-safety 3, migration 3, concurrency 2, capability 2, supported-proposal, partial, verification, analytics-safety; gates B 25, E 9, F 3 |

Gold is derived (never typed) by `derive-gold.mjs` from the registers, SDL, predicate vocabulary, fixtures and
INTERFACES.md; migration-bound gold resolves from the run's manifest at score time. Paraphrase prompts are mechanically
checked not to name their gold. `build-tasks --check`, `derive-gold --check`, `od35/build-frame --check` pass;
`score.mjs --self-test` passes (SYNTHETIC arms: perfect arm passes every gate; degraded arm fails with CIs and 5
critical failures). Protocol: three paired families (filesystem / structured CLI / hybrid; typed / typed+native;
first-party / vendor-enriched, plus the isolated raw-Cypher baseline), seeded order, blinding (no `evals/` in the agent
workspace), bootstrap 95% CIs, binding gates.

OD-35: frame of 54 fixture claims (24 fixtures), seeded draw of 30; screening finds only 4 retelling and 4
ambiguous-authority candidates: **shortfall 6 in each stratum**. Not padded; more sourced discourse captures are needed
before annotation.

## 8. Unrun checks

- Migration apply on a shadow graph with S1 DDL and the S3 fence; DDL ONLINE checks against `ddl.json`; supported
  question replay after migration; invariants against final release rules (all wait for S1/S3).
- Any LLM evaluation run; OD-35 annotation.
- Restore on a 5.27 / Aura-version-matched target (no such local image; 5.26.31 used for both editions).
- Analytics/vector qualification (capabilities disabled by design).
- Repository `pnpm build` currently fails in `apps/executor/src/mcp.ts` (imports `getReceipt`/`planIntent` that the
  in-progress kg-ops renamed) and `pnpm test` has 2 failures (`apps/graphql-api/src/projection.test.ts`,
  `packages/kg-ops/src/write.test.ts`): these are other roles' concurrent wave-1 edits; S8 files are `.mjs` outside the
  tsc project and are not imported by any test.

## 9. Limitations

- The export is read-committed, not a point-in-time snapshot; S9 must freeze writers before the final export.
- The migration code is `.mjs` (not built by tsc, not in `dist/`); it reuses `scripts/migration/lib/common.mjs`.
- Dry run uses one transaction for all batches; real apply is one transaction per batch (code path implemented, run only
  up to its refusal).
- Restore relies on deprecated `db.createLabel/createRelationshipType/createProperty` for token-only names (worked on
  5.26.31).
- The ops skill and analyze skill are new; their evaluations are frozen tasks, not runs.

## 10. Blockers and interface deltas (need another role or an operator)

1. **S1 (release)**: host `legacy-map.yaml`; list `MIGRATED_FROM`, `LegacyV0`, `LegacyV0_*` and the `legacyLabels` /
   `legacyExportDigest` keys as operational in rules/projections; register the qualifier family `legacy:`
   (`legacy:recordedFrom`, `legacy:extractedAt`, `legacy:runId`); bind `schemaReleaseDigest` and `ddl.json` (apply
   refuses until then).
2. **S1 + lead/operator (production DDL)**: the live Knowledge Services Enterprise constraints on `:Chunk`
   (`chunkId`, `chunkKey`, `index`, `text` NOT NULL; `chunkId`/`chunkKey` unique) conflict with the v2 D9 `Chunk` shape.
   No impact on this migration (no Chunk nodes); it blocks any future v2 Chunk writer. Reconciliation is a production
   DDL decision.
3. **S3**: the migration participates in `KsWriteFence` and claims `KsIntentMarker {effectKey: migration:<runId>:<batchId>}`
   with `planRef = migrationRunId`; confirm this marker usage (or provide a migration marker label) in operational DDL.
4. **Lead (S9)**: create `bks_reader` / `bks_writer` / `bks_migrator` on Aura (statements rehearsed in
   `rehearse-principals.mjs`); set `BKS_MIGRATION_APPLY_AUTHORIZED` for the authorized run; final export after the
   writer freeze.
5. **Owners of first-party skills** (S2/S4/lead): add the section 3 overrides to `biotech-schema-explore`,
   `biotech-kg-query`, `biotech-kg-ingest` before their vendor references. S6: land `biotech-graphql-maintain`.
6. **OD-35**: capture additional retelling / ambiguous-authority claims (6 more each) before annotation.
7. Eval freeze binds INTERFACES.md v0 and `schema/program/final/**`; when S1 publishes the release bundle or the lead
   revises INTERFACES, re-run `derive-gold.mjs` deliberately and record the new FREEZE.json.

## 11. Gate F evidence rows

| # | Identity | Environment | Command | Timestamp (UTC) | Result | Evidence path |
| --- | --- | --- | --- | --- | --- | --- |
| F-1 | export `20261011T224403Z-aura-neo4j`, `sha256:7f76eefc...` | Aura 5.27-aura enterprise, READ | `node scripts/migration/export-graph.mjs` | 2026-10-11T22:44:03.858Z-22:44:06.543Z | 210 nodes / 288 rels / 112 idx / 24 cons; updatesReported false | `runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j/manifest.json` |
| F-2 | same | local | `node scripts/migration/verify-restore.mjs --export <exp> --export-only` | about 22:44:18Z (before F-3) | ok 3/3 | stdout (rerunnable) |
| F-3 | restore `20261011T224418Z-community-5.26.31` | Community 5.26.31, bolt 7690 | `restore-graph.mjs` (section 3) | 22:44:18.778Z-22:44:40.464Z | 210/210, 288/288; 16 existence constraints unsupported | `<exp>/restores/20261011T224418Z-community-5.26.31/restore-report.json` |
| F-4 | same | same | `verify-restore.mjs --restore ...community...` | 22:45:11.252Z | ok 17/17, 16 expected gaps | `.../verify-report.json` |
| F-5 | restore `20261011T224441Z-enterprise-eval-5.26.31` | Enterprise 5.26.31 eval, bolt 7691 | `restore-graph.mjs` | 22:44:41.171Z-22:45:06.049Z | 210/210, 288/288, 24/24 constraints, all ONLINE | `.../restore-report.json` |
| F-6 | same | same | `verify-restore.mjs --restore ...enterprise...` | 22:45:12.405Z | ok 17/17, 0 gaps | `.../verify-report.json` |
| F-7 | synthetic codec export `sha256:bf1fb11d...` | Enterprise -> Enterprise db / Community | seed + export + restore + verify | 22:41:54Z-22:43Z | 17/17 both; 7 expected Community gaps | `runs/release-v2/custody/backups/20261011T224154Z-synthetic-type-fidelity-ent526/` |
| F-8 | plan `mig-eee5e7a518c3`, `sha256:4956d530...`, map `sha256:a78218f9...` | local | `node packages/kg-ops/src/migration/plan-migration.mjs --export <exp>`; `node scripts/migration/validate-plan.mjs --plan <plan>` | before 23:02:03Z (F-9) | 498/498 accounted; 13/13 schema+reconcile | `<exp>/plans/mig-eee5e7a518c3/` |
| F-9 | dry run on Enterprise restore | Enterprise 5.26.31 eval | `apply-migration.mjs --mode dry-run-rollback` | 23:02:03Z-23:02:24Z | passed, 65 batches, 47/47 invariants, rollback clean | `<plan>/runs/20261011T230224Z-dry-run-rollback-localhost-neo4j.json` |
| F-10 | dry run on Community restore | Community 5.26.31 | same, bolt 7690 | 23:02:34Z-23:03:22Z | passed, 47/47 | `<plan>/runs/20261011T230322Z-dry-run-rollback-localhost-neo4j.json` |
| F-11 | apply gate | Enterprise eval | `apply-migration.mjs --mode apply` | 23:03:23Z | refused (exit 3): 4 prerequisites unmet | `<plan>/runs/20261011T230325Z-apply-localhost-neo4j.json` |
| F-12 | principals | Enterprise eval, scratch db | `node scripts/migration/rehearse-principals.mjs` | 2026-10-11T23:10Z | 10/10 | stdout (rerunnable) |
| F-13 | vendored skills | local | `skill-digests.mjs --check`; sha256 lists before/after | 2026-10-11 | 29/29 digests; 153 files byte-identical | `.agents/skills/skill-routing.json` |

Gate F remains open: the shadow-graph migration with S1 DDL, the release marker against a bound release, question replay
and the final delta are still required.

## Wave 3 rehearsal (2026-10-12, release biotech-schema-v2.0.1)

Scope: lead assignment of 2026-10-12 (core migration rehearsal). All writes went to disposable local shadows restored from the custody export; Aura was not contacted in wave 3. Nothing legacy was deleted; no commits.

### W3.1 Files created or changed (all within S8 ownership)

| Path | Change |
| --- | --- |
| `packages/kg-ops/src/migration/plan-migration.mjs` | release binding through `loadRelease()` (digests, ddlDigest, release-hosted map); run id now includes the release digest; S3 `activityUidFor` and `sourceUidFor`/`canonicalizeUri` identities; `id` + `privacyClass` on created nodes; 12 new graph-wide invariants (59 total); refuses to overwrite another run's plan |
| `packages/kg-ops/src/migration/transforms.mjs` | planner 0.2.0 |
| `packages/kg-ops/src/migration/statements.mjs` | S3 fence protocol (`locked`, `lockSeq`, `graphRevision` once per committed batch), `markerKey`-keyed markers (JSON attempts, persisted `applied` only), `KsReleaseMarker` MERGE on releaseId with releaseId/schemaReleaseDigest/ddlDigest/installedAt/migrationRunId |
| `packages/kg-ops/src/migration/apply-migration.mjs` | rewritten: one transaction per batch, S3 `markerKeyOf`, release recheck at apply, required-DDL/fence prerequisites, Enterprise DDL phase after the batches, invariants, release marker last, `--crash-in-batch` fault |
| `scripts/migration/lib/release-ddl.mjs`, `scripts/migration/apply-release-ddl.mjs` | phased release DDL install/verify from `ddl.json`, live legacy-violation check (`blocked-by-legacy-data`) |
| `scripts/migration/rollback-migration.mjs` | reverse mapping (guards, archive, DDL drop, run-only DETACH DELETE, relabel reversal) |
| `scripts/migration/migration-state.mjs`, `scripts/migration/replay-catalog.mjs` | progress snapshot; supported-template replay |
| `scripts/migration/skill-digests.mjs`, `.agents/skills/skill-routing.json` | releaseId / schemaReleaseDigest / workspaceFingerprint are `{bind}` pointers resolved at check time |
| `.agents/skills/biotech-graph-ops/SKILL.md` | procedure steps 9-12 (DDL, apply, rollback, replay) |
| `evals/v2/derive-gold.mjs`, `FREEZE.json`, `*/gold.json` | gold bound to the pinned v2.0.1 bundle |
| `evals/v2/generate-schema-tasks.mjs`, `evals/v2/schema-discovery-certify/**`, `evals/v2/score.mjs` | seeded generator; blinded certification set; scorer handles it |
| `docs/plans/schema-v2-service-release/MIGRATION-ACCOUNTING.md` | final identities, rehearsal results, production rollback procedure |

### W3.2 Plan bound to v2.0.1

Run `mig-a3df353c3d73`, manifest `sha256:e9fb67ca4f7013d307cda1f3af9dca8d5cd14fd0a2f53f68049d339abf069f1c`, `schemaReleaseDigest sha256:c0dd7837...` and `ddlDigest sha256:3a42a440...` read from `loadRelease()` (pinned). The map is the release copy (byte-identical, `sha256:a78218f9...`). Accounting is unchanged and still reconciles to the export: nodes 210 = 176 migrated + 26 retained + 8 held; relationships 288 = 178 + 27 + 83; `validate-plan.mjs` 13/13. Note: the first v2.0.1 re-plan reused the wave-1 run id and overwrote the wave-1 plan files in custody (its dry-run reports remain); the run id now includes the release digest. The invariant set was extended after the first apply attempt, which required a re-plan with byte-identical batches and the same run id; markers key on batch digests, so applied batches stayed valid.

### W3.3 Results

| Check | Community 5.26 | Enterprise 5.26 eval |
| --- | --- | --- |
| restore + verify | 17/17 (16 edition gaps) | 17/17 (0 gaps) |
| required DDL (357) | created and ONLINE | created and ONLINE |
| deliberate kill inside b025, then restart | resumed at b025: 25 skipped, 40 executed; one attempt per marker; graphRevision 65 = 65 batches | same |
| enterprise DDL after batches | n/a | 211/212 created; `rel_MEASURES_assertion_exists` blocked by 45 preserved legacy MEASURES edges; 568/569 + 1 accepted, all ONLINE |
| invariants | 59/59 | 59/59 |
| KsReleaseMarker | written last | written last |
| deletions in apply | 0 nodes, 0 relationships | 0 nodes, 0 relationships |
| rollback then re-apply | rollback removed only this run (545 nodes, 1,590 relationships, 65 markers, 1 release marker, 357 rules, 2 fences); verify 17/17 with digests equal to the export; re-apply 59/59 | not run (one shadow, as asked) |
| catalog replay (no assertions) | 118/118 executable without error, 2 vector templates skipped (optional index), 8 return rows | same |

Templates returning rows on migrated data: K/CQ-AX-04, D6/CQ-PF-01#2, D7/Q-D7-02#1, D7/Q-D7-08#1, D7/Q-D7-25#1, QP/P-01b, QP/P-02c, QP/P-04d. S4's report did not exist at run time, so no answers were asserted; redo with S4's runner when it lands.

### W3.4 Evaluation updates

- `derive-gold.mjs` now reads `schema/pinned/release/{registers,vocabularies,sdl}` through `loadRelease()`. Re-derived on 2026-10-12: every source digest changed (registers, predicates, SDL, INTERFACES.md), and all three gold files are **byte-identical** to the v2.0.0 derivation (schema-discovery `sha256:d4c91bf4...`, native-read `sha256:f0360538...`, write-recovery `sha256:c01731d1...`): no field the gold selects changed. FREEZE.json now records the release identity; `build-tasks --check`, `derive-gold --check`, `od35 --check` and `score --self-test` pass.
- Blinded certification set: `evals/v2/schema-discovery-certify/` (68 tasks: 24 exact, 20 paraphrase, 14 negative, 10 cross-domain; all 14 modules, 4-6 each), generated by `generate-schema-tasks.mjs` from the release registers, SDL docstrings and v1 map with a fresh random seed that is not recorded in Git. Gold derived (`sha256:e2296cba...`). Not shared with the workspace role and not described in its report; the lead runs it after their ranking round.
- `skill-routing.json`: identities are bound pointers; at check time `workspaceFingerprint` was `sha256:f2fbe6c7...` (it had already moved from `sha256:1e38ee06...` during this wave). Vendored skills remain byte-identical (153 files); 29/29 digests.

### W3.5 Findings and blockers

1. **`rel_MEASURES_assertion_exists` vs preserved legacy MEASURES edges** (S1 + lead decision): either mark it `blocked-by-legacy-data` in `ddl.json` with executor enforcement of assertionUid on v2 MEASURES writes, or accept retyping the 45 legacy edges (a delete). Until decided, the Enterprise DDL on production is 211/212.
2. **DDL ordering for production**: required DDL before the migration; Enterprise DDL after it, because `uid_exists_` on seven reused labels fails while legacy rows still carry them. `kg ensure-operations` applies both at once and would fail on the legacy graph; production must use the phased installer (or S3 adds phases).
3. **Optional vector templates** (D9/Q-D9-20#vector, QP/P-04a) are `supported` in the catalog but depend on the optional `chunk_embedding` index, which is disabled (OD-44); S1/S4 should mark them capability-gated.
4. **Docker**: the engine hung at about 02:05-02:52Z and the lead restarted it; the Enterprise attempt during the hang was environmental and was rerun on a fresh container. One Neo4j container at a time was used afterwards; both S8 containers are stopped.

### W3.6 Gate F evidence rows (wave 3)

| # | Identity | Environment | Command | UTC | Result | Evidence path (custody unless noted) |
| --- | --- | --- | --- | --- | --- | --- |
| F3-1 | export `sha256:7f76eefc...` | Community 5.26.31 `bks-neo4j-s8` 7702 | `restore-graph.mjs` + `verify-restore.mjs` | 02:00:27-02:01:17 | 210/288; 17/17 | `<exp>/restores/20261012T020027Z-s8-community-5.26/` |
| F3-2 | release v2.0.1 DDL | same | `apply-release-ddl.mjs --phase required` / `--phase verify` | 02:53:40-02:54:00 | 357 present, ONLINE, fences 1/1 | `<exp>/wave3/ddl-required-community.json`, `ddl-verify-required-community.json` |
| F3-3 | run `mig-a3df353c3d73` | same | `apply-migration.mjs --mode apply --crash-in-batch b025-assertions` | 03:03:00-03:03:20 | killed in b025 (exit 137); 25 applied | `<exp>/wave3/community-state-after-crash.json` |
| F3-4 | same | same | `apply-migration.mjs --mode apply` (restart, then check rerun) | 03:03:52-03:05:07 | resumed at b025; 59/59; release marker | `<plan>/runs/20261012T030412Z-...-38416.json`, `20261012T030507Z-...-42820.json` |
| F3-5 | same | same | `rollback-migration.mjs --drop-release-ddl --remove-fences` + `verify-restore.mjs` | 03:05:25-03:05:43 | rolled back; 17/17, digests equal export | `<plan>/rollbacks/20261012T030527Z/`, `<exp>/wave3/community-verify-after-rollback.json` |
| F3-6 | same | same | required DDL + `apply-migration.mjs --mode apply` | 03:05:54-03:06:25 | 65 executed; 59/59; release marker | `<plan>/runs/20261012T030625Z-...-42396.json` |
| F3-7 | query catalog `sha256:84232dbf...` | same | `replay-catalog.mjs` | 03:08:08 | 118 ok, 2 capability-skipped, 8 with rows | `<exp>/wave3/catalog-replay-community.json` |
| F3-8 | export | Enterprise 5.26.31 eval `bks-neo4j-s8-ee` 7703 (fresh) | restore + verify + required DDL + verify | 03:10:30-03:11:24 | 17/17 0 gaps; 357 ONLINE | `<exp>/restores/20261012T031030Z-s8-ee-wave3/`, `<exp>/wave3/ddl-*-enterprise-wave3.json` |
| F3-9 | run `mig-a3df353c3d73` | same | apply with crash in b025, then restart | 03:11:30-03:12:28 | resumed at b025; Enterprise DDL 211 + 1 blocked; 568/569 ONLINE; 59/59; release marker | `<exp>/wave3/enterprise-state-after-crash.json`, `<plan>/runs/20261012T031228Z-...-32688.json`, `<exp>/wave3/enterprise-state-after-apply.json` |
| F3-10 | query catalog | same | `replay-catalog.mjs` | 03:12:38 | 118 ok, 2 skipped, 8 with rows | `<exp>/wave3/catalog-replay-enterprise.json` |

`<exp>` = `runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j`; `<plan>` = `<exp>/plans/mig-a3df353c3d73`.

Gate F status after wave 3: backup/restore, shadow migration with release DDL, invariants, release marker, restart and reverse-mapping rehearsals are evidenced. Still open: question replay with answer assertions (S4), the `rel_MEASURES_assertion_exists` decision, and the final delta export at cutover.

## Wave 3 follow-up: evaluation protocol, path reachability, Gate G review plan (2026-10-12)

### F.1 Lead decisions recorded

1. `rel_MEASURES_assertion_exists`: `blocked-by-legacy-data` in v2.0.2; the executor enforces assertionUid on new MEASURES writes.
2. v2.0.2 `ddl.json` carries `phase: pre-migration | post-migration`; `kg ensure-operations --phase pre|post|all` is the production installer; `scripts/migration/apply-release-ddl.mjs` stays the migration tool.
3. The two vector templates become `unsupported` / capability-gated.

Pending (on the lead's signal that v2.0.2 is pinned): one re-plan against v2.0.2, confirmation that the manifest binds the new digests, and phased DDL + apply on one fresh Community shadow as the final rehearsal of record (Enterprise only if Docker stays calm).

### F.2 Evaluation protocol and reachability

- `evals/v2/protocol.md`: the three paired search arms are filesystem-only, structured CLI (`search --mode structured`: lexical top-10 plus bounded deterministic `path` expansion, at most 10 candidates) and hybrid, as IMPLEMENTATION section 3 lists. Recall@10 is computed over each arm's 10-candidate discovery result; for cross-domain tasks the gold is the card set of the gold path's relationship hops.
- `evals/v2/check-path-reachability.mjs` (new; prints task ids and counts only): every cross-domain gold hop in both the frozen and the blinded sets is a legal register relationship. For the blinded set, every gold card set is reachable through legal paths of 3 hops or fewer from the named types; per-task details are in custody only (`runs/release-v2/custody/backups/20261011T224403Z-aura-neo4j/wave3/path-reachability-*.json`). Task-design notes (no gold changed): frozen SD-X-01 needs 5 hops; SD-X-08 is a fan-out rather than a chain; SD-X-03 traverses two hops against relationship direction (true endpoints Assertion to Source, 3 hops). Endpoint pairs generally have several other legal short paths, which matters for exact-path scoring but not for card-based Recall@10.
- The certification set stays private: its tasks, gold and seed are not described in this report or in `protocol.md`.

### F.3 Gate G independent review plan (to run once S4 lands and v2.0.2 is pinned)

Method:
- Re-run from the repository and from custody; never accept a role's summary. Every row gets identity, environment, command, timestamp, result and evidence, plus a verdict: confirmed, not reproduced, or not run.
- Identity of the candidate: the tree is uncommitted, so it is pinned by content: release `contentTreeDigest`, `schemaReleaseDigest`, `ddlDigest`, `queryCatalogDigest`, workspace fingerprint, `executableGraphqlDigest`, `operationRegistryDigest`, executor version, image digests, and a sha256 manifest of the source tree under review.
- One Neo4j container at a time, created fresh with `scripts/neo4j-test.sh`. Aura stays read-only unless the lead authorizes an S9 step. No LLM runs by me: I re-score the lead's raw run artifacts.
- Output: `docs/plans/schema-v2-service-release/INDEPENDENT-REVIEW.md` (owned path), with one verdict per VALIDATION row and a risk register.

#### Evidence to re-check (VALIDATION rows and custody)

| Gate | Re-check | How |
| --- | --- | --- |
| A | pin and release byte verification, tamper and missing-override failures, required/enterprise DDL ONLINE by phase, catalog EXPLAIN | `loadRelease()` verify; tamper a copy of the bundle (expect `RELEASE_TAMPERED`); `apply-release-ddl.mjs --phase required/verify` on a fresh shadow; `replay-catalog.mjs` (EXPLAIN on all supported templates) |
| B | integration suite, contract and canonical-JSON parity, FU-03 fixture matrix counts | `BKS_INTEGRATION=1 ... vitest run --project kg-ops` on a fresh Community container, then Enterprise if calm; Python parity tests; recount the matrix from the fixture-round outputs |
| C | on-disk workspace integrity and doctor; semantic generation pointer matches the final workspace; blinded certification (structured arm) | `pnpm workspace:verify`, `bks-schema doctor`; read `custody/semantic/current.json` and the usage ledger (2/2 generations, 187/600 searches, no secrets); re-score `custody/certify/*.json` independently with `evals/v2/score.mjs` against `schema-discovery-certify/gold.json` |
| D | S6 unit and adversarial tests; client regenerated from the executable schema; registry digests; the not_run load/RSS/readiness rows | rerun the S6 projects; regenerate the client and diff the persisted ids; record the performance rows as not_run unless the idle-host run lands |
| E | Gate E orchestrator under Docker (the lead's rerun is not_run); envelope golden parity | `node apps/executor/scripts/s7-gate-e.mjs` against a fresh container; TS/Python/KS/MC golden vectors |
| F | export integrity and the final rehearsal of record | `verify-restore.mjs --export-only`; restore, phased DDL, apply on v2.0.2, invariants, release marker; `validate-plan.mjs`; cross-check `custody/s0/aura-inventory.json` (now present) against the export manifest: labels, triples, property schemas, indexes, constraints |
| all | custody hygiene | sha256 of every custody artifact cited in VALIDATION; `runs/` ignored by Git; credential-value scan over custody, the working-tree diff and built images (method from wave 1: compare against `.env` values in memory, never printed) |

#### Adversarial checks against the integrated stack

Run on a fresh shadow migrated from the export with v2.0.2 DDL, the executor and the GraphQL API wired to it.

1. **Read authority (Gate B).** As `bks_reader` through `read.cypher`, try:
   - a hidden write clause, `FOREACH`/`CALL {}` writes, `IN TRANSACTIONS`, `LOAD CSV`
   - `apoc.*` write or export procedures, `dbms.*` and `db.create*`
   - comment, unicode and parameter-injection variants

   Expect `PARSE_REJECTED` / `PROCEDURE_FORBIDDEN` and zero counters. Then bypass the parser and confirm the database principal still denies the write.
2. **Visibility.**
   - Cross-scope filters and counts: expect `VISIBILITY_DENIED`.
   - INTERNAL nodes (the migrated Source, Snapshot, Locator, Agent and Activities) must not appear in consumer GraphQL or consumer-scope typed reads.
   - `LegacyV0*` labels, `MIGRATED_FROM` and `Ks*` must be absent from typed reads, catalog results, GraphQL introspection and data (operational-names rule).
   - Resolving a legacy name must return only v2 nodes.
3. **Bounds and consistency.**
   - High fanout, deep paths, oversized output and timeouts must be reported `truncated` / `LIMIT_EXCEEDED`, never partial-as-complete.
   - A `stable_revision` read during a concurrent fenced write returns `stale` or retries with a reset buffer.
4. **Writes and admission.**
   - Forged plan, digest mismatch, duplicate effect, changed payload under the same effectKey.
   - Expired or revoked witness; release mismatch.
   - Lost response then receipt lookup; a partial policy whose subset is not closed.
   - An identity race and the failure-marker race.
   - New check from decision 1: a v2 MEASURES write without assertionUid must be refused by the executor, because the database constraint is deliberately absent.
5. **Release marker and readiness.** Tamper with `KsReleaseMarker.schemaReleaseDigest`, delete the marker, or add a second one: `/readyz` must not report ready and writes must fail with `BKS_RELEASE_MISMATCH`. Restore afterwards.
6. **Migration semantics.**
   - Typed reads over migrated data must not present held items as v2 facts (LDT statuses, ANNOUNCED events, Metric to curated Biomarker, listing prices).
   - After one executor write, the 59 migration invariants must still hold and the fence must advance past the migration's revision.
   - `rollback-migration.mjs` must then refuse (the forward-repair rule).
7. **Consumer API.** Safelist bypass (unknown, aliased or batched operations), no mutation root, forged or expired BFF actor tokens, and a client/registry digest mismatch must all be rejected.
8. **Boundary (Gate E).** A tampered envelope payload must fail its digest check; receipt-first reconciliation after a dropped response; cancellation after commit reports the effect.
9. **Skills and optional capabilities.**
   - `skill-digests.mjs --check`, with bindings resolved at check time.
   - Vendored byte identity.
   - `describe` advertises `analytics` / `retrieve` as unavailable, the capability probe agrees, and the two vector templates are `unsupported` in v2.0.2.
10. **Open items carried into the review:** the OD-35 frame shortfall (6 per stratum); S6 performance rows not_run; Supabase custody (OD-14) blocked; the final delta export at cutover.

Prerequisites I need from others: S4's report and template runner (answer assertions for the supported questions); the v2.0.2 pin; the lead's run artifacts for the structured-arm certification; a quiet Docker window.

### F.4 Structured certification diagnosis (2026-10-12)

Abstract diagnosis written to `reports/certify-structured-diagnosis.md`; per-task detail stays in custody (`runs/release-v2/custody/certify/diagnosis-structured-20261012T032848Z.json`). New tool: `evals/v2/diagnose-structured.mjs` (calls the workspace structured search with explicit base limits; classifies misses into modes A/P/B/C/D/E/F; stdout aggregates only). Headline: the run of record was effectively base limit 10 (eval did not forward the flag before 03:28Z); at the current default (5) cross-domain recall is 0.80, with all misses mode B (direction-mixed equal-length paths outrank the gold path under `pathLimit 2`). Recommended changes: direction-consistent path ranking, relationship-first appending, expansion only on path intent, and base = 10 - pathLimit x L. A fresh certification draw is recommended after the change.

### F.5 Second blinded draw, P-8, S4 runner (2026-10-12)

- **Development set:** `evals/v2/schema-discovery-certify/` is now the development set (analysed in `certify-structured-diagnosis.md`).
- **Second blinded draw:** `evals/v2/schema-discovery-certify-2/` has 68 tasks in the same 24/20/14/10 mix over 14 modules, drawn with a fresh random seed (held only in its private gold-spec).
  - The generator `--exclude` option keeps development-set selectors out. 3 were reused, solely to keep the 4-task floor for the smallest module (exact/paraphrase only, never cross-domain).
  - Gold is derived and FREEZE.json is updated.
  - Reachability, aggregate only: the 10 cross-domain gold paths are all legal, all 2 hops, all reachable within 3 hops of their named types, 2.0 gold cards each.
  - Kept private; the lead runs it after the workspace change lands.
- **S4 P-8 applied to `skill-routing.json`:** the examples of read.familiar and read.advanced now point to `.agents/skills/biotech-kg-query/examples/examples.json`, and read.familiar requires `read.templates`. `skill-digests.mjs --check` passes.
- **New S4 replay script:** `scripts/migration/replay-catalog-s4.mjs` runs `runCatalogAssertions` (S4 runner and read service, unchanged) against a migrated shadow.
  - Smoke run on the v2.0.1 migrated Community shadow (03:41-03:45Z): 120 supported templates, 20 fixture-positive (columns match), 98 contract-only, 0 failed, 2 unsupported.
  - Evidence: `<exp>/wave3/catalog-replay-s4-community-v201-smoke.json`.
  - This is not the rehearsal of record. That waits for the v2.0.2 pin: fresh Community shadow, restore, pre-phase DDL, migration, post-phase DDL, release marker, invariants, then this replay.

## Final rehearsal of record (2026-10-12, release biotech-schema-v2.0.2)

Plan `mig-0b2e97d4b8e0` (manifest `sha256:c3036eb0...`) binds `schemaReleaseDigest sha256:5fffb593...` and `ddlDigest sha256:943f8c29...` from `loadRelease()`; accounting unchanged and reconciled (validate 13/13). The tooling gained ddl.json phase support (`apply-release-ddl.mjs --phase pre|post|verify`; apply verifies the pre phase, installs the post phase after the batches, and skips release-blocked statements). Details and the production procedure in phase order are in `MIGRATION-ACCOUNTING.md`.

### Gate F evidence rows (F4)

| # | Identity | Environment | Command | UTC | Result | Evidence (custody) |
| --- | --- | --- | --- | --- | --- | --- |
| F4-1 | plan `mig-0b2e97d4b8e0`, manifest file sha256 `8cc863ef...` | local | `plan-migration.mjs --export <exp>`; `validate-plan.mjs` | 03:51Z | binds v2.0.2 digests; 210/288 accounted; 13/13 | `<exp>/plans/mig-0b2e97d4b8e0/` |
| F4-2 | export `sha256:7f76eefc...` | Community 5.26.31 `bks-neo4j-s8` 7702 (fresh) | `restore-graph.mjs` + `verify-restore.mjs` | 03:53:04-03:53:57 | 210/288; 17/17 | `<exp>/restores/20261012T035304Z-final-community-v202/` |
| F4-3 | ddl `sha256:943f8c29...` pre phase | same | `apply-release-ddl.mjs --phase pre`, `--phase verify --phases pre` | 03:54:02-03:54:18 | 357/357 ONLINE; fences 1/1 | `<exp>/final/ddl-pre-community.json` (`320a2cb7...`), `ddl-verify-pre-community.json` (`c151d601...`) |
| F4-4 | run `mig-0b2e97d4b8e0` | same | `apply-migration.mjs --mode apply` | 03:54:25-03:55:33 | 65/65 batches; post phase empty on Community; 59/59 invariants; release marker {releaseId v2.0.2, schemaReleaseDigest, ddlDigest, installedAt, migrationRunId}; 0 deletions | `<exp>/plans/mig-0b2e97d4b8e0/runs/20261012T035533Z-apply-localhost-community-41880.json` (`f90aa57b...`), `<exp>/final/community-state-after-apply.json` |
| F4-5 | query catalog `sha256:6a274903...` | same | `replay-catalog-s4.mjs` (S4 `runCatalogAssertions`) | 03:55:41-03:59:46 | 123 templates: 20 fixture-positive (columns match), 103 contract-only, 0 failed | `<exp>/final/catalog-replay-s4-community.json` (`8f2ee117...`) |
| F4-6 | export | Enterprise 5.26.31 eval `bks-neo4j-s8-ee` 7703 (fresh) | restore + verify; `--phase pre`; verify | 04:01:35-04:02:39 | 17/17, 0 gaps; 499/499 ONLINE | `<exp>/restores/20261012T040136Z-final-enterprise-v202/`, `<exp>/final/ddl-pre-enterprise.json` (`faeec403...`), `ddl-verify-pre-enterprise.json` (`db2537e3...`) |
| F4-7 | run `mig-0b2e97d4b8e0` | same | `apply-migration.mjs --mode apply` | 04:02:39-04:03:18 | 65/65; post-migration 69/69 created; `rel_MEASURES_assertion_exists` skipped (release-blocked, not installed); 568/568 ONLINE; 59/59; release marker last | `<exp>/plans/mig-0b2e97d4b8e0/runs/20261012T040318Z-apply-localhost-enterprise-27168.json` (`9f78e36a...`), `<exp>/final/enterprise-state-after-apply.json` |
| F4-8 | query catalog | same | `replay-catalog-s4.mjs` | 04:03:25-04:07:37 | 20 fixture-positive, 103 contract-only, 0 failed | `<exp>/final/catalog-replay-s4-enterprise.json` (`f9870692...`) |

Both containers stopped afterwards. Gate F: every rehearsal item is now evidenced; only the final delta export at cutover (S9) remains.

## Gate G independent review: first pass (2026-10-12, 04:08-04:43Z)

Recorded incrementally in `../INDEPENDENT-REVIEW.md`, with evidence in `runs/release-v2/custody/review/`. The candidate is pinned by content: source manifest `sha256:fc8e99ad...` (3,492 files); release v2.0.2 `sha256:5fffb593...`; workspace `sha256:a33cc35a...`. Containers ran one at a time; Aura was not touched.

- **Confirmed:**
  - Gate A: release verify (x4), pin, generate, tamper probes, YAML parity, packet check, build, phased DDL, and S1 EXPLAIN 136/21/0.
  - Gate B on v2.0.2: writer 22/1 Community and 23/23 Enterprise; admission 6/6; read Enterprise 9/9; fixture-graph catalog assertions 0 failed.
  - Gate C: workspace, doctor, and certify-2 structured 0.9706 / lexical 0.8824.
  - Gate E: 10/10 under Docker on v2.0.2.
  - Custody: 26/26 cited artifacts; export integrity; credential scan 0 hits.
- **Self-checked only (S8 authored them):** Gate F, with plan 13/13, accounting and F4 digests. An independent rerun by another role is recommended.
- **Open findings:**
  - Stale v2.0.1 catalog literals: `pnpm test` fails 3; the read Community suite is 16/17.
  - The read suite overwrites `reports/S4-question-status.*` (52/393/9 now vs the cited 54/391/9).
  - Fixture-positive templates: 39 vs 46 on v2.0.1.
  - `explain-catalog.mjs` writes into the release it reads (a reviewer-caused 30 s incident, repaired).
  - The semantic pointer is stale (v2.0.1).
  - A third provider generation has no recorded authorization.
  - Wording: "86" vs 85 files.
  - The routing `observedAtBinding` snapshot is stale (to be refreshed after the skill evaluations).
- **Still to run:** Gate D, the skill evaluations, the F.3 adversarial checks, the FU-03 rerun, and the principal rehearsal rerun.

### Gate G second pass (2026-10-12, 04:45-05:25Z)

- The lead's corrections are applied in `../INDEPENDENT-REVIEW.md`:
  - Semantic pointer: confirmed on recheck (doctor `semantic` pass, generation `...6e991373`).
  - Third generation: lead-authorized (VALIDATION Gate C row).
  - `pnpm test`: re-confirmed, 363 passed / 63 skipped.
- **Adversarial checks** ran on a fresh migrated Enterprise shadow (one container; harness `scripts/migration/adversarial/gate-g-adversarial.mjs`). Read authority, visibility, bounds, writes and admission, MEASURES, rollback refusal, the consumer API safelist and auth, and the optional capabilities are all confirmed.
- **Two new findings:**
  - The consumer GraphQL API cannot run under the release reader role: `dbms.components`, `SHOW INDEXES` and `SHOW CONSTRAINTS` are denied, and some `KsReleaseMarker` properties are not readable. Owners: S4, S6 and the lead.
  - The writer accepts a foreign second `KsReleaseMarker`. Owner: S3.
- **Principal script rerun:** confirmed, and extended to all four principals.
- **Eval A (reads) scored:** raw 0.091, 0.212 after the declared structural adapter step. This is not a skill measure: the native-read gold (v1 fixtures) has drifted from the eval environment (fixtures-v2 through the writer, with holds), and the NR-M tasks need the migration graph. B is still running; the paired verdict waits on a lead decision about the gold.
