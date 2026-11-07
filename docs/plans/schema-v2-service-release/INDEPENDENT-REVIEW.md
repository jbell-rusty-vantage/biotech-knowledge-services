# Independent review (Gate G), written incrementally

Reviewer: migration / qualification role (S8). Started 2026-10-12T04:08Z. Method: re-run from the repository and from
custody, never from a role's summary. Every row gives identity, environment, command, timestamp, result and evidence,
plus a verdict: **confirmed** (reproduced), **not reproduced** (different result; explained), **not run** (with a
reason), or **finding** (a new issue). Evidence lives in protected custody under
`runs/release-v2/custody/review/` unless noted. One Neo4j container at a time; Aura untouched; no LLM runs.

## Candidate identity under review

The tree is uncommitted, so the candidate is pinned by content
(`custody/review/candidate-identity.json`, `source-manifest.sha256`):

| Item | Value |
| --- | --- |
| BKS HEAD (dirty) | `431c8a7c287ee3d914843390a080dbfbe949acdc` + working tree |
| Source manifest | 3,492 files (tracked and untracked, excluding `runs/` and `.env`), `sha256:fc8e99adb17200b09859c19abc3f78d7e8299c95f84ac20a3f9de9928fffe830` at 04:16:01Z |
| Release | `biotech-schema-v2.0.2`, `schemaReleaseDigest sha256:5fffb593...`, `ddlDigest sha256:943f8c29...`, `queryCatalogDigest sha256:6a274903...`, `contentTreeDigest sha256:521f9238...` |
| Workspace | `sha256:a33cc35acfaec701549c2f84635d4cb0796d03ebc9f90d0633e4a8e14b11c941` |

Any later change to these identities invalidates the rows below that depend on them; rows note what they depend on.

## Gate A: accepted source and operational bundle

| Check | Command | UTC | Result | Verdict |
| --- | --- | --- | --- | --- |
| Release bytes verify (v2.0.0, v2.0.1, v2.0.2 upstream and the pinned mirror) | `node scripts/release/verify.mjs --release <dir>` x4 | 04:08Z | all exit 0, 0 errors; v2.0.2 lists **85** files | confirmed. Minor **finding**: VALIDATION says "86 files" for v2.0.2; `verify.mjs` reports 85 (PIN.json is outside the bundle). Wording only |
| Pin equals release | `node scripts/release/pin.mjs --check --release ../biotech-meta/.../biotech-schema-v2.0.2` | 04:08Z | ok; pinned == `sha256:5fffb593...` | confirmed |
| Deterministic generation | `node scripts/release/generate.mjs --release <v2.0.2> --check` | 04:08Z | ok, drift [] | confirmed |
| Tamper and missing override (independent probes, not the suite) | `loadRelease({dir})` on copies: one flipped byte in `ddl/required.cypher`; one planted unlisted file; nonexistent dir; `BKS_SCHEMA_RELEASE_DIR` nonexistent | 04:09Z | RELEASE_TAMPERED, RELEASE_TAMPERED, RELEASE_MISSING, RELEASE_MISSING (no fallback); intact copy loads `sha256:5fffb593...` | confirmed (`tamper-probes.json`) |
| YAML parity Node/PyYAML | `node scripts/release/yaml-parity.mjs <all 30 pinned YAML files> --json` | 04:09Z | 30/30 equal (VALIDATION recorded 26 for v2.0.0; v2.0.2 has 30) | confirmed |
| Packet check | `node scripts/packet-check.mjs --release schema/pinned/release` | 04:09Z | ok, 14/14 modules | confirmed |
| DDL phases ONLINE on version-matched graphs | S8 final rehearsal of record (fresh Community and Enterprise, `apply-release-ddl.mjs --phase pre`, apply, post) | 03:53-04:07Z | Community pre 357/357; Enterprise pre 499/499 + post 69/69; `rel_MEASURES_assertion_exists` not installed (release-blocked) | confirmed independently of S1's `apply-ddl.mjs` (different tool, same ddl.json) |
| Supported templates execute on migrated data | `replay-catalog-s4.mjs` (S4 runner) both editions | 03:55-04:07Z | 123 supported: 20 fixture-positive, 103 contract-only, **0 failed** | confirmed for v2.0.2 (S1 EXPLAIN rerun: see the next row) |
| Repository build | `pnpm build` | 04:09Z | passed | confirmed |
| Repository unit tests | `pnpm test` | 04:10-04:13Z | **3 failed** / 360 passed / 63 skipped: `kg-ops read.test.ts` x2 and `executor modules/read.test.ts` hard-code the v2.0.1 catalog (153 templates / 120 supported; v2.0.0 == pinned templates) while v2.0.2 has 157 / 123 | **finding (open)**: stale test expectations after the v2.0.2 pin; fix the expectations from the release (`catalog.counts`) rather than literals. Not a product defect, but the suite is not green on the candidate |
| Repository unit tests (recheck after the reads-role fix) | `pnpm test` | 04:46:25-04:50:49Z | 29 files passed / 5 skipped; 363 tests passed / 63 skipped | **confirmed**; the stale-count finding is closed (`pnpm-test-recheck.txt`) |
| Catalog EXPLAIN on v2.0.2 (S1 script) | fresh Community 5.26.31 `bks-neo4j-s8` 7702; `node scripts/release/explain-catalog.mjs --release schema/pinned/release --uri neo4j://localhost:7702 --ddl .../required.cypher` | 04:17:19-04:18:27Z | 157 templates: 136 EXPLAIN ok, 21 skipped (GDS), 0 failed; result set semantically identical to the pinned `explain.json` (timings and timestamps stripped) | confirmed |

**Incident (reviewer-caused, repaired): `explain-catalog.mjs` writes into the release directory it reads.** Run with `--release schema/pinned/release`, it overwrote `schema/pinned/release/query-catalog/explain.json` (`out` = that path), and the pinned mirror failed `verify.mjs` from 04:18:27Z. I restored the exact upstream bytes (`cp ../biotech-meta/docs/schema/releases/biotech-schema-v2.0.2/query-catalog/explain.json`). `verify.mjs` on the pinned mirror then exits 0, `pin.mjs --check` matches, and `loadRelease()` returns `sha256:5fffb593...`. My run's output is kept as `custody/review/explain-catalog-v2.0.2-output.json`. Exposure was about 30 seconds; any `loadRelease()` in that window would have failed closed with RELEASE_TAMPERED rather than serving altered bytes. **Finding for S1:** `explain-catalog.mjs` should refuse to write inside a pinned or frozen release directory and default `--out` to custody.

## Gate B: native read/write guarantees (candidate v2.0.2)

Fresh script-created containers, one at a time: Community 5.26.31 `bks-neo4j-s8` (7702), then Enterprise 5.26.31 eval `bks-neo4j-s8-ee` (7703). Each suite file ran alone on a freshly created database.

| Check | Command | UTC | Result | Verdict |
| --- | --- | --- | --- | --- |
| Writer suite, Community | `BKS_INTEGRATION=1 NEO4J_TEST_URI=bolt://127.0.0.1:7702 pnpm exec vitest run --project kg-ops src/kg-ops.integration.test.ts` | 04:20:58-04:22:59Z | 22 passed / 1 skipped (the Enterprise-only reader test) | confirmed (matches the S3 result of 22 / 1 on v2.0.2) (`gateb-kg-ops.integration.test.txt`) |
| Admission revocation races | same container, `admission.integration.test.ts` alone | 04:22:59-04:23:19Z | 6/6 | confirmed (`gateb-admission.integration.test.txt`) |
| (invalid run, kept for the record) | both integration files in one vitest invocation against one database | 04:19Z | 17 STALE_REVISION / WITNESS_REVOKED failures | **invalid, reviewer configuration**: the two files share the single canonical `KsWriteFence` and run in parallel workers, so each sees the revisions of the other. The fence refused the effects instead of interleaving them, which is the specified fail-closed behaviour, not a defect. Observation for S3: document that integration files need a database each, or run them serially (`gateb-writer-community-INVALID-parallel-files.txt`) |
| Writer suite, Enterprise | `NEO4J_TEST_URI` = `NEO4J_EE_TEST_URI` = `bolt://127.0.0.1:7703`, same file | 04:37:06-04:40:19Z | 23/23 (the Enterprise reader test included) | confirmed (matches the S3 result of 23/23) (`gateb-writer-enterprise.txt`) |
| Read suite, Community | `BKS_INTEGRATION=1 NEO4J_TEST_URI=bolt://127.0.0.1:7702 pnpm exec vitest run --project kg-ops src/read/read.integration.test.ts` | 04:24:00-04:29:00Z | **16/17**. Only the query-catalog test fails, at its first assertion: `expected 123 to be 120` (the supported-template count is hard-coded for v2.0.1). The other 16 pass: typed gold, temporal views, visibility, retry and stale handling, bounds, digests, and typed vs template agreement | **not reproduced on v2.0.2; finding (open, S4)**: the same stale literal as the `pnpm test` row in Gate A. VALIDATION's 17/17 was on v2.0.1. The assertion stops the test before its per-template loop, so the suite has not yet produced its own per-template result on v2.0.2 (`gateb-read-community.txt`) |
| Catalog assertions on the fixture graph (substitute for the aborted loop) | S4 `runCatalogAssertions` through `scripts/migration/replay-catalog-s4.mjs`, against the fixture graph the read suite had loaded | 04:29-04:31:05Z | 123 supported: **39 fixture-positive, 84 contract-only, 0 failed** | confirmed that nothing fails. **Open question for S4:** VALIDATION recorded 46 fixture-positive / 72 contract-only on v2.0.1 (120 supported). The fixture-positive count fell by 7 while 3 templates were added. The cause could be a v2.0.2 template change or a difference between my runner call and the in-suite one; S4 should say which (`catalog-assertions-fixture-graph-v2.0.2.json`, sha256 `3227ff79...`) |
| Read suite, Enterprise | `BKS_INTEGRATION=1 NEO4J_EE_TEST_URI=bolt://127.0.0.1:7703 pnpm exec vitest run --project kg-ops src/read/read-enterprise.integration.test.ts` | 04:35:10-04:36:26Z | 9/9 | confirmed (matches the S4 result of 9/9) (`gateb-read-enterprise.txt`) |

**Finding (open, S4): the Community read suite writes into `docs/`.** As a side effect, the run regenerated `docs/plans/schema-v2-service-release/reports/S4-question-status.{json,md}` at 04:29:00Z (stamp `rmv4qzge8`). The regenerated file says 52 supported / 393 held / 9 unsupported (templates: 47 fixture-positive / 76 contract-only). VALIDATION's FU-04 row cites 54 / 391 / 9. The files are untracked and their earlier bytes were not retained, so they cannot be restored. As a result, the FU-04 row cannot be checked against the bytes it cited. A test should write its evidence to custody, never over a cited report. S4 should regenerate FU-04 deliberately on v2.0.2 and reconcile 54 vs 52.

## Gate C: workspace, search and skills

| Check | Command | UTC | Result | Verdict |
| --- | --- | --- | --- | --- |
| On-disk workspace integrity | `pnpm workspace:verify` | 04:09Z | ok; 0 stale / missing / extra | confirmed |
| Doctor | `bks-schema doctor --json` | 04:09Z | ok; integrity 1,340 files hashed against the inventory; 2,322 records, every card digest recomputes; links ok | confirmed |
| Blinded certification, second draw, structured arm | `bks-schema eval --tasks evals/v2/schema-discovery-certify-2/tasks.json --mode structured --json`, recomputed against my gold | 04:14Z | Recall@10 **0.9706**, hit 0.9706 (exact, negative, paraphrase 1.00; cross-domain 0.80); identical to the lead's 0.971 | **confirmed** on workspace `a33cc35a...` |
| Same, lexical arm | `--mode lexical` | 04:15Z | 0.8824 (cross-domain 0.20) | confirmed |
| Certification integrity | `derive-gold.mjs --check` (gold unchanged since freeze); string-literal scan of `packages/schema-workspace/src` for certify-2 cross-domain names; no `evals/` or certify references in non-test source | 04:15Z | gold byte-identical; only 2 generic kernel names (`Assertion`, `DERIVED_FROM`) occur as literals; no task-aware code found | confirmed (heuristic scan, not proof) |
| Gold re-frozen on v2.0.2 | `derive-gold.mjs` | 04:15Z | FREEZE source digests updated (`INTERFACES.md` changed; registers, predicates and SDL unchanged); all 5 gold files byte-identical | recorded |
| Semantic pointer vs candidate | read `custody/semantic/current.json` at 04:14Z; rechecked with `node packages/schema-workspace/dist/cli.js doctor --json` at 04:46Z | 04:14Z / 04:46Z | At 04:14Z the pointer named v2.0.1 / `f2fbe6c7...`. It was published at 04:23:10Z to `g20261012T041326Z-6e991373` (release v2.0.2, workspace `sha256:a33cc35a...`). Recheck: doctor `semantic` pass, "ready and built from this workspace (1193 documents)" | **confirmed on recheck**. The first reading was taken during the publication window; the finding is withdrawn (`doctor-recheck.json`) |
| Provider usage vs authorization | read `custody/semantic/usage-ledger.json`; VALIDATION Gate C rows | 04:14Z / 04:46Z | 3 generations started. The third (`g20261012T041326Z-6e991373`) is recorded in VALIDATION Gate C as "shipping generation on the final v2.0.2 workspace (3rd, lead-authorized Option B)", and the final usage row records 3 generations, 3,571 uploads, 280/600 searches, 0 errors | **confirmed**. Lead-authorized (Option B: identity moved to file attributes), per that VALIDATION row; the finding is withdrawn |
| Skill evaluations (paired, blinded) | see "Skill evaluation scoring" below | 05:20Z | A scored alone (B in progress); gold/environment drift found | in progress |

## Gate E: service boundary and recovery

| Check | Command | UTC | Result | Verdict |
| --- | --- | --- | --- | --- |
| Gate E proofs E1-E9 under Docker on v2.0.2 | fresh `bks-neo4j-s8` Community 7702; `NEO4J_TEST_URI=bolt://127.0.0.1:7702 node apps/executor/scripts/s7-gate-e.mjs` | 04:32:35-04:33:46Z | 10/10 rows; Python proof 9/9; release `biotech-schema-v2.0.2` | confirmed on the candidate release (the VALIDATION runs were on v2.0.1) (`runs/release-v2/custody/s7/gate-e-gemv4rabux/evidence.json`; log `gate-e.txt`, sha256 `e032c775...`) |
| Envelope golden parity TS / Python / KS / MC | not rerun separately | | | The TS side is covered by the `pnpm test` row. The KS and MC suites were not rerun (they belong to other repositories) |
| Supabase custody (OD-14) | not rerun | | | stays **blocked externally**, as recorded |

## Gate F: migration and restore rehearsal (self-authored rows)

All Gate F evidence was produced by this role (S8), so this section is a mechanical self-check, not an independent review. **The lead (or another role) should rerun F4-1..F4-8 independently on fresh containers, following "Production procedure" in `MIGRATION-ACCOUNTING.md`.**

| Check | Command | UTC | Result | Verdict |
| --- | --- | --- | --- | --- |
| Final plan validates | `node scripts/migration/validate-plan.mjs --plan <exp>/plans/mig-0b2e97d4b8e0` | 04:42:31Z | 13/13, failed [] | self-checked |
| Plan binds the candidate | read `migration-manifest.json` | 04:42Z | run `mig-0b2e97d4b8e0`; `sha256:5fffb593...` and `sha256:943f8c29...` present; 65 batches; 59 invariants | self-checked |
| Accounting reconciles | `accounting.json` totals | 04:42Z | nodes 176 migrated + 26 unchanged-retained + 8 held + 0 excluded = 210; relationships 178 + 27 + 83 + 0 = 288 (the export counts) | self-checked |
| F4 evidence digests equal the report | sha256 of the manifest, the 8 files under `<exp>/final/` and the 2 apply run files | 04:42Z | manifest `8cc863ef`, apply runs `f90aa57b` (Community) / `9f78e36a` (Enterprise), DDL `320a2cb7` / `c151d601` / `faeec403` / `db2537e3`, replays `8f2ee117` / `f9870692`: all equal the F4 rows | self-checked |
| Apply run records | both apply run files | 04:42Z | status `applied`; 59 invariants, 0 failed; the release marker carries the v2.0.2 `ddlDigest`, with `installedAt` after the batches | self-checked |
| Export integrity | `verify-restore.mjs --export-only` | 04:14Z | ok (see the Custody row) | self-checked |
| Vendored skills byte-identical; routing bindings | `node scripts/migration/skill-digests.mjs --check` | 04:42Z | ok; 29 dependency digests, 11 routes, 0 problems. The `{bind}` pointers resolve at check time to v2.0.2 / `sha256:5fffb593...` / workspace `a33cc35a...`. The recorded `observedAtBinding` values are still v2.0.1 / `f2fbe6c7...` (`changedSinceBinding: true`) | self-checked. **Note:** the observed-at-binding snapshot is stale. I left it unchanged so the routing input of the running skill evaluations does not move under them; refresh it after they finish (`skill-digests-check.json`) |
| Principal separation rehearsal | not rerun (needs an Enterprise scratch database) | | | not run in this pass |
| Final delta export at cutover | not applicable before cutover | | | not run (production step 2) |

## Adversarial checks against the integrated stack (v2.0.2)

**Environment.** One fresh local Enterprise 5.26.31 eval container, `bks-neo4j-s8-ee` (7703), used from 04:50Z to 05:17Z. The custody export was restored and checked (17/17), then pre-migration DDL was installed (499/499). `apply-migration.mjs --mode apply` ran on `mig-0b2e97d4b8e0`: 59/59 invariants, run report `20261012T045442Z-apply-localhost-enterprise-42688.json`.

The lead's `scripts/ops/aura-principals.mjs --apply --allow-local` then ran at 04:54:48-04:55:10Z. It created `bks_reader_public` (19 statements), `bks_reader_internal` (17), `bks_writer` (9) and `bks_migrator` (9) with their `_svc` users, and `readerWriteRefused: true`. The passwords exist only in the custody file.

**Stack under test:**
- The real executor process, `apps/executor/dist/index.js`. It connects as `bks_writer_svc`. Its read bindings are `public` (`bks_reader_public_svc`) and `internal` (`bks_reader_internal_svc`), both `database-role` / `database-rbac`. Admission is enabled, with file grant authority and ledger.
- The consumer GraphQL server, `startServer`, in `NODE_ENV=production`, product profile, as `bks_reader_public_svc`.

**Harness and evidence.** The harness is `scripts/migration/adversarial/gate-g-adversarial.mjs` (owned path). Evidence is under `runs/release-v2/custody/review/adversarial/20261012T045041Z/`:

| Run | Evidence | sha256 | Rows |
| --- | --- | --- | --- |
| Full run | `evidence-advmv4sdx92.json` | `12cea739...` | 77 |
| Marker and consumer, GraphQL as the reader principal | `evidence-advmv4snu8m.json` | `c57abea7...` | 20 |
| Marker and consumer, GraphQL as admin (control) | `evidence-advmv4stmzd.json` | `7da38076...` | 23 |

The harness also captured the executor log, the invariants after the executor writes, the rollback attempt, and the database denials (`graphql-reader-denials.txt`).

| # | Area | Checks | Result | Verdict |
| --- | --- | --- | --- | --- |
| R0-R18 | Read authority through `/kg/read/cypher` (reader token, public binding) | `read.cypher` is advertised only over the two proven database-role bindings. Probes: plain CREATE; FOREACH; `CALL {}` write; `IN TRANSACTIONS`; LOAD CSV; `apoc.export`; `dbms.listConfig`; `db.createLabel`; a second statement after `;`; a write in a UNION branch; a write after a line comment; a write after a block comment plus U+2028; DETACH DELETE; `apoc.cypher.doIt`; whole-entity return; unlabelled scan; a fullwidth-letter keyword; parameter-injection text | every write or procedure probe refused with a typed reason (`CLAUSE_FORBIDDEN`, `PROCEDURE_FORBIDDEN`, `LABEL_FORBIDDEN`, `RELATIONSHIP_FORBIDDEN`, `FULL_ENTITY_RETURN`, `PARSE_REJECTED`); the injection value is bound as data (`empty`) | **confirmed** |
| R19-R27 | Parser bypassed: the database principals themselves | Public and internal readers: CREATE with new and existing labels, SET with new and existing properties, DETACH DELETE of a Product, `dbms.listConfig`, LOAD CSV. Writer: CREATE INDEX, CREATE USER. Migrator: GRANT ROLE admin, CREATE USER | all `Neo.ClientError.Security.Forbidden`. The readers are denied even on existing tokens ("Create node with labels 'Product' ... not allowed", "Set property ... 'name' ... not allowed", "Delete relationship ... not allowed") | **confirmed**: the database is the boundary. The lead's script proves the public reader only; this extends the proof to all four principals |
| R28 | Zero effects | admin recount after every probe | 0 probe nodes, edges or properties; node and relationship counts unchanged (823 / 1,878); fence unchanged (rev 65); no probe users or index; migrator roles unchanged | **confirmed** |
| V1-V7 | Visibility, operational and legacy names | Templates and ad hoc Cypher on both bindings referencing `LegacyV0`, `MIGRATED_FROM`, `KsWriteFence`, `KsIntentMarker`; counting the INTERNAL migrated `Source`. Then the same counts directly as each reader principal | the policy refuses every operational or legacy name on both bindings (`LABEL_FORBIDDEN` / `RELATIONSHIP_FORBIDDEN`). Bypassing the parser, both readers count 0 / 0 / 0 (admin sees 210 / 176 / 65); the public reader counts 0 Source (admin 1) | **confirmed** |
| V8-V10 | Typed reads | Typed card of the INTERNAL Source as a public reader; a reader without `read.internal` asks for the internal binding; resolving a name carried over from legacy data | `empty`; `forbidden` (`BINDING_FORBIDDEN`); the resolve returns exactly the v2 node `hu:algorithm-version:19-cell-...`, with no LegacyV0 node and no operational names in the result | **confirmed** |
| L1-L4 | Bounds | rowCap 20 on a fan-out; byteCap 2 KiB; `timeoutMs` 100 on a long scan; a typed `list` above the contract ceiling | `truncated` with `ROW_CAP`; `truncated` with `BYTE_CAP`; `failed` with `TIMEOUT` and no rows; 400 `BKS_PARSE_REJECTED`. Nothing partial is reported as complete | **confirmed**. Not run: `stable_revision` under a concurrent fenced write (covered by the S4 suite, which I reran 16/17; the one failure is the stale count, unrelated) |
| W0-W13 | Writes and admission on the migrated graph | Admitted apply. Then: duplicate; changed payload under the same effectKey; forged `expectedPlanDigest`; forged `intentDigest`; the witness of another plan; tampered signature; `statements` smuggled into the apply body; expired witness (1 s lease); revoked effect delivered to the fence; release-mismatched intent; lost response then receipt lookup and retry; a witness for another tenant's plan; reader, missing and unknown tokens | applied, graphRevision 65 → 66. Then, in order: `duplicate`, no second effect; `BKS_EFFECT_CONFLICT` (409); `BKS_PLAN_DIGEST_MISMATCH` twice; `BKS_WITNESS_INVALID` twice; `BKS_PLAN_FORGED`; `BKS_WITNESS_EXPIRED`; `BKS_WITNESS_REVOKED`, with re-issue refused; plan rejected `BKS_RELEASE_MISMATCH`; lookup found `applied`, retry `duplicate`, other tenant 404; `BKS_FORBIDDEN_SCOPE`; 403 / 401 / 401. No refused probe left a marker or advanced the fence | **confirmed** |
| W14 | MEASURES without the database constraint (lead decision 1) | `edge.structural` MEASURES with no Assertion; then an asserted MEASURES through the executor on Enterprise, where `rel_MEASURES_assertion_exists` is release-blocked | structural proposal `rejected` ("ASSERTION_REQUIRED: MEASURES is asserted; use edge.assert with evidence"); the asserted one is applied and the executor edge carries `assertionUid` (1 edge, 0 missing). The 45 preserved legacy MEASURES edges remain without it, as decided | **confirmed** |
| G-2: M1-M3 (executor write side) | Release marker tamper vs writes | tampered `schemaReleaseDigest`; marker deleted; a second, newer, foreign marker next to the correct one | tamper → `BKS_RELEASE_MISMATCH`; delete → `BKS_RELEASE_MISMATCH`; **foreign second marker → the apply succeeded** (`applied`) | M1, M2 **confirmed**. M3 **finding (open, S3)**: `lockFence` accepts the write when *any* installed marker carries the pinned digest (`releaseDigests.includes`). GraphQL readiness instead judges the *latest* marker, so the two surfaces disagree. Recommendation: refuse canonical writes unless exactly one `KsReleaseMarker` exists and it matches (or define an explicit multi-marker rule and make readiness and the writer share it) |
| M1-M3 (consumer readiness) | Same tampers vs `/readyz` (GraphQL as admin, see the next row) | tampered, deleted, foreign | 503 `BKS_RELEASE_MISMATCH` / 503 "no :KsReleaseMarker" / 503 `BKS_RELEASE_MISMATCH`; 200 again after each restore; marker restored byte-for-byte (M4) | **confirmed** (readiness logic) |
| G-1: G0 / M0 / C0 / C1 (reader principal) | Production GraphQL as `bks_reader_public_svc` | `/readyz` baseline; EntityCard of a migrated PUBLIC entity | **never ready**: `release.ok=false` ("no :KsReleaseMarker"); index check fails ("Executing procedure is not allowed"). **Every safelisted operation fails** with `INTERNAL_SERVER_ERROR`. The database query log shows the cause: `@neo4j/graphql` runs `CALL dbms.components()` on every request (976 denials), and readiness also runs `CALL dbms.components()`, `SHOW INDEXES` and `SHOW CONSTRAINTS`, all denied for `bks_reader_public`. The marker query orders by `installedAt` and reads `migrationRunId` / `ddlDigest`, which the role does not grant, and returns no rows | **finding (open, blocking for the reader-principal deployment; S4 role statements + S6 consumer API + lead principal script)**: the consumer API cannot run under the release reader role. Its integration tests use the admin `neo4j` user as the reader. Smallest fix: on the reader roles, narrow the `dbms.*` deny so `dbms.components` stays executable; grant `SHOW INDEX` / `SHOW CONSTRAINT` on the database; grant READ on `KsReleaseMarker {installedAt, migrationRunId, ddlDigest}`. Then rerun this harness with `--gql-principal reader`. (The executor's `public` read bindings are not affected: typed and template reads work under the same role) |
| C0-C16 (admin principal, control) | Consumer API | Positive EntityCard; INTERNAL Source with PUBLIC and claimed-INTERNAL actors; SDL names; unknown id; raw introspection; batch; mutation; id plus smuggled query; missing or wrong service key; missing, foreign-key, expired and wrong-audience actor tokens; page size 5000; tampered registry entry; registry for another executable | 1 entity; [] for PUBLIC, 1 for a signed INTERNAL claim (the BFF's signed claim is trusted, as designed); no LegacyV0 / MIGRATED_FROM / Ks* type or field names (one `KsIntentMarker` mention occurs inside a description) and no Mutation root; 404 `PERSISTED_QUERY_NOT_FOUND`; 400 `PERSISTED_QUERY_REQUIRED` (introspection and mutation); 400 `BAD_REQUEST`; 400 `PERSISTED_QUERY_MISMATCH`; 401 `BKS_UNAUTHORIZED` x6; 400 `VARIABLES_OUT_OF_BOUNDS`; startup refused twice | **confirmed**. With the reader principal, C2-C16 also pass (20-row run); only C0 / C1 fail, for the reason above |
| S1-S3 | Migration semantics after v2 writes | the 59 manifest invariants after the executor writes; the fence; `rollback-migration.mjs --drop-release-ddl` | 59/59 (`invariants-after-executor-writes.json`); fence rev 69, last writer an executor run; rollback **refused** ("forward repair required", exit 1), with node, relationship and constraint counts unchanged | **confirmed** (forward-repair rule enforced) |
| O1 | Optional capabilities | `/describe`; unsupported catalog templates | `retrieve` and `analytics` `available: false`; release v2.0.2; 33 unsupported templates, including the two vector templates `D9/Q-D9-20#vector` and `QP/P-04a` | **confirmed** |
| E | Boundary (tampered envelope, receipt-first reconciliation, cancellation after commit) | not rerun here | covered by the Gate E rerun above (10/10 on v2.0.2) | confirmed by reference |
| | Not run in this pass | identity race and failure-marker race (S3 suite rows, rerun 22/1 and 23/23 in Gate B); partial policy with a non-closed subset; held-item presentation per family (the LegacyV0 invisibility above covers the mechanism) | | not run |

**Finding status (05:32Z).** G-1: the reads role reports `readerRoleStatements` fixed (`dbms.components` / `dbms.info` / `dbms.showCurrentUser` / `dbms.routing.getRoutingTable` left executable, SHOW INDEX/CONSTRAINT granted, full `KsReleaseMarker` read; Enterprise suite 10/10, run `emv4taazd`). Rerun on a fresh Enterprise shadow with the roles re-created (`pnpm build` first, so `aura-principals.mjs` loads the fixed generator), then `gate-g-adversarial.mjs --gql-principal reader`: **pending**, because my container slot holds `bks-neo4j-migread` for the third pass. G-2: in the executor queue; retest when its report lands.

Harness notes: the first full run's `G0` failure (PORT=0 refused by the config) was a harness configuration error, fixed for the marker and consumer reruns. On reruns, the write half of M1-M3 was not evaluable: a fresh admission ledger issues generation-0 witnesses, and the graph's revocation fence was already at generation 1. The executor refused those writes (`BKS_WITNESS_REVOKED`), which is correct fail-closed behaviour. The write-side verdicts therefore come from the full run.

## Principal separation rerun (lead's script)

| Check | Command | UTC | Result | Verdict |
| --- | --- | --- | --- | --- |
| Create release principals on a fresh local Enterprise shadow | `NEO4J_URI=bolt://127.0.0.1:7703 NEO4J_USERNAME=neo4j NEO4J_PASSWORD=... node scripts/ops/aura-principals.mjs --apply --allow-local --out <custody>/principals-custody.json` | 04:54:48-04:55:10Z | 4 roles, 4 users (privilege rows 70 / 65 / 21 / 16); `readerWriteRefused: true`; exit 0 | **confirmed** (`principals.log`; secrets only in the custody file) |
| Extended separation (adversarial R19-R27) | as above | 05:03Z | readers cannot create, set or delete (new or existing tokens), call `dbms.*` or LOAD CSV; writer cannot create indexes or users; migrator cannot grant roles or create users | **confirmed** |
| Consumer API under the reader role | adversarial G0 / M0 / C0 | 05:04-05:15Z | not ready; every operation fails (`dbms.components` denied) | **finding (open)**, see above |

## Skill evaluation scoring (reads), first pass

**Status of the runs at 05:20Z:**
- `evalA-20261012T042421Z` (condition A, first-party skills): complete, native-read only (33/33). The write-recovery suite is deferred by the lead.
- `evalB-20261012T043113Z` (condition B, vendor-enriched): in progress. `B/` holds one empty task directory. `evalB-20261012T042455Z` is an abandoned start with empty `A/` and `B/`.
- Paired scoring is therefore not possible yet. This section scores A alone and diagnoses it, so that B can be scored under identical, pre-declared rules.

**Method.** `evals/v2/score.mjs` is unchanged and runs on a custody copy of the artifacts, with no LLM. Location: `runs/release-v2/custody/review/eval-scoring/evalA-20261012T042421Z/`:
- `run/A/native-read/<task>/`: copies of `answer.json` and `trace.json`, with sha256 of the 66 source files in `source-artifacts.sha256`.
- `bindings.json`, taken from the run's `describe.json`: v2.0.2, `sha256:5fffb593...`, workspace `a33cc35a...`.
- `--manifest`: the final rehearsal manifest `mig-0b2e97d4b8e0`.

| Score | Value (bootstrap 95% CI, seed 20261011) | Evidence |
| --- | --- | --- |
| Raw, as recorded | success **0.091** (0.000-0.212), 3/33 (NR-S-01..03); critical failures 0; end-to-end gate (>= 0.90) **fails** | `score.json` (`a58fc436...`), `score.md` |
| With one structural adapter step | **0.212** (0.091-0.364), 7/33: S-01..03, T-D4-1, T-D4-2, T-cross-domain-1, T-cross-domain-2. The step derives `trace.snapshotContentHashes` from `trace.evidence[].snapshotContentHash`: the run reported the hashes per evidence row, while the scorer reads a flat list, and `answerShape` does not name the field | `score-normalized.json` (`e0e5702c...`) |

**Diagnosis.** `classification.json` (`08e91095...`) compares each gold uid with the eval graph through read-only queries on `bks-neo4j-evalA`. **The A score does not measure the skills.** The environment is not the one the gold was derived from:

1. **NR-M-01..05 (5 tasks): no migration graph.** The run's database is the fixture graph only, and `MIGRATION_RUN_ID` was not bound. The agent answered `unsupported`, with the reason, rather than guessing. These tasks need the migration rehearsal graph, as `protocol.md` section 4 requires ("same data: fixture graph or migration rehearsal graph"). That rule was not applied per suite. **Finding (open, S8 / evals): the protocol must state that NR-M tasks run only on the migration rehearsal graph,** and the runner must not mix them into a fixture-graph arm.
2. **20 trace and resolve tasks: the gold fact is absent from the seeded graph.** For all 13 `empty` trace tasks, the gold assertion uid does not exist in the graph. For 6 of 7 resolve tasks, the gold node does not exist; the seventh (acrylamide) has no identifier. Spot checks confirm the agent's `empty` answers: the D+Q intervention and every `DECREASES_LEVEL_OF` assertion are absent, and acrylamide has no `HAS_IDENTIFIER`. The cause:
   - The native-read gold (`derive-gold.mjs`) resolves from the v1 run-record fixtures (`schema/program/final/fixtures/*/assertions.yaml`, explicit uids).
   - The environment was seeded from `fixtures-v2/ROUND.json` through the writer. There, 19 plans were held and 58 applied only their admitted subset. The writer also mints uids from `uidSegment` (for example `hu:org:fx-k-nlm`, where the v1 gold has `hu:organization:fx-k-nlm`).
   - **Finding (open, S8 / evals): native-read gold and the eval environment have drifted apart.** The gold must be derived from the environment the arms actually read. The options are: derive it mechanically from the seeded graph's plans and receipts (minted uids, admitted proposals); or seed a graph that contains every gold fact.
3. **NR-T-K-1:** correct object, assertion and snapshot. It fails only on the asserter-uid prefix drift described in 2.
4. **5 tasks found and answered correctly** (D4-1, D4-2, cross-domain-1, cross-domain-2, K-1 except the drift). NR-S-01..03 pass as recorded.

**Pre-declared rules for B (so A and B are scored identically):**
- the raw scorer;
- the same single structural adapter step (no semantic change; applied to both arms);
- the same bindings and manifest;
- the same classification queries.

**No paired verdict will be issued from these runs while the gold drift stands.** Re-deriving the gold changes scoring inputs after a run, so I have not done it. It needs lead authorization, and if authorized it must be done blind to both arms' answers (from seed artifacts and fixtures only) and frozen before B is scored.

Write-recovery runs: none yet (second pass, after the ingest-skill update).

### Seeded gold (DEV-1, lead-authorized) and the A score on it

- **Seed equivalence (pairing precondition).** At 05:24Z, `node evals/v2/derive-gold-seeded.mjs --compare <evalA> <evalB-20261012T043113Z>` reported **identical** graphs:
  - 63 receipts each (58 partial, 5 applied).
  - 2,208 created nodes, 1,505 created relationship keys and 1,478 per-proposal outcomes.
  - Equal set digests.

  Evidence: `custody/review/eval-scoring/seed-compare-A-B.json`. One seeded gold therefore serves both arms.
- **Derivation.** `node evals/v2/derive-gold-seeded.mjs --seed runs/release-v2/eval-runs/evalA-20261012T042421Z` read only plans, receipts and fixtures-v2 intents, never an answer. Output: `evals/v2/native-read/gold.seeded.json` (`sha256:94ff1a29...`), plus the per-task log `gold.seeded.derivation-log.json`.
  - **5 positive:** K-1, D4-1, D4-2, cross-domain-1, cross-domain-2. K-1 now expects the writer-minted asserter `hu:org:fx-k-nlm`.
  - **20 negative** `{status: empty}`:
    - 11 trace triples that no seeded intent proposes. The v1 run-record rows are absent from fixtures-v2, or their plan was held.
    - 2 matching proposals held: D6-1 and D6-2, with the held reason recorded.
    - 7 resolve tasks: 3 nodes were never seeded; on 4 seeded nodes the prompt's identifier was never created.
  - **8 unchanged:** S-01..03, M-01..05.
- **Records.** `gold.json` is unchanged. The deviation is recorded in `protocol.md` section 9 and in `FREEZE.json` `deviations[DEV-1]`, with the seeded-gold, log, receipt-set and original-gold digests. It was frozen at 05:25Z, when `evalB/B` held **0** answers. `derive-gold.mjs --check` still passes; it now preserves recorded deviations. The `score.mjs --self-test` still passes.
- **Scoring changes.** `score.mjs` gained `--gold <suite>=<file>` and the declared structural `--adapter trace-evidence`. Both apply to every arm.

| Arm | Gold | Success (95% CI) | Notes | Evidence |
| --- | --- | --- | --- | --- |
| A (first-party) | `gold.json` (raw) | 0.091 (0.000-0.212) | environment drift; superseded by DEV-1 | `score.json` |
| A | `gold.seeded.json` + adapter | **0.848 (0.727-0.970)** on 33; **28/28 on the fixture-graph tasks** | the only failures are NR-M-01..05: the run had no migrated graph, and they are reported, not counted (section 9). They are re-run in the third pass | `score-seeded.json` (`9890bf33...`) |
| B (vendor-enriched), original runner | - | **abandoned, excluded from scoring** | `evalB-20261012T042455Z` (empty `A/` and `B/`) and `evalB-20261012T043113Z` (stalled from 04:33Z, 0 answers; told to stand down by the lead). Kept in custody, never scored | |
| B2 (vendor-enriched), replacement runner `evalB2-20261012T061504Z` | `gold.seeded.json` + adapter; NR-M by rubric DEV-1b | **0.848 (0.727-0.970)**, 28/33 | see "Condition B2 scored, and the paired reads verdict" | `evalB2-.../score-seeded.json` |

### Third pass: migration-bound reads (NR-M-01..05)

**Ready since 05:31Z.**

- **Container:** `bks-neo4j-migread`, Community 5.26.31, bolt 7720, http 7520. Fresh restore of the custody export; verify ok; pre DDL 357/357; `apply-migration.mjs --mode apply`, run `mig-0b2e97d4b8e0`, 59/59 invariants. Report: `<exp>/plans/mig-0b2e97d4b8e0/runs/20261012T053055Z-apply-localhost-community-19908.json`.
- **Executor:** `http://127.0.0.1:4150`, started by `runs/release-v2/eval-runs/migread-20261012T052854Z/start-executor.sh`.
  - cwd is the run directory, and `DOTENV_CONFIG_PATH` points at an empty file, so the repository `.env` is never loaded.
  - Principal: local-dev, role **reader** with grant `read.internal`. NR-M-03 traces to the migration Source, which is INTERNAL.
  - Both bindings are available: `default` (public) and `internal`.
  - `/kg/plan` and `/kg/apply` return 403: the executor is read-only.
- **Bindings:** `migread-.../bindings.json`, with `MIGRATION_RUN_ID=mig-0b2e97d4b8e0` and `EXPORT_ID=20261011T224403Z-aura-neo4j`.
- **Scoring:** the original gold, unchanged for NR-M (manifest pointers), with `--manifest <exp>/plans/mig-0b2e97d4b8e0/migration-manifest.json`.

**Container budget.** This is my one container. The G-1 rerun (fresh Enterprise shadow, roles dropped and re-created from the fixed generator, `--gql-principal reader`) waits until the third pass is done and `bks-neo4j-migread` is stopped.

### Condition B2 scored, and the paired reads verdict (first-party A vs vendor-enriched B2)

- **Runs.** A is `evalA-20261012T042421Z`. B2 is `evalB2-20261012T061504Z`: container `bks-neo4j-evalB2` 7714, executor :4143, and pass 3 against migread :4150.
- **Seed equivalence.** `derive-gold-seeded.mjs --compare` reports A and B2 **identical**: 63 receipts each (58 partial, 5 applied), 2,208 nodes, 1,505 relationship keys and 1,478 proposal outcomes, with equal digests (`seed-compare-A-B2.json`).
  - The only change to the comparer was letting it read B2's custody directory name (`custody/`). Derivation logic is unchanged.
  - One frozen seeded gold therefore serves both arms.
- **Scoring.** B2 was scored exactly as A:
  - fixture tasks: `score.mjs --gold native-read=gold.seeded.json --adapter trace-evidence`;
  - NR-M tasks: rubric DEV-1b (`evalB2-.../third-pass/adjudication.json`, 5/5).
- **Excluded.** The stalled B directories are not scored (see the table above).

| Rule | A | B2 | B2 − A (paired bootstrap 95% CI, 10,000 resamples) | Tasks that differ |
| --- | --- | --- | --- | --- |
| **Declared rules (binding)** | 33/33, 1.000 (1.000-1.000) | 28/33, 0.848 (0.727-0.970) | **−0.152 (−0.273 to −0.030)** | K-1, D4-1, D4-2, cross-domain-1, cross-domain-2 |
| Sensitivity (post hoc, not binding) | 33/33 | 32/33, 0.970 (0.909-1.000) | −0.030 (−0.091 to 0.000) | D4-2 |

**How to read the two rows.**
- **Declared rules.** B2's five differences are all **answer-shape non-compliance, not wrong facts**. B2 omitted the `trace{}` object that `answerShape` declares and put the snapshot hashes under `assertions[].locators[].snapshotContentHash`. Its `uids.object` / `uids.asserter` are correct on four of the five.
- **Sensitivity.** The rule here is that the gold hashes may appear anywhere in the answer, applied identically to both arms. It was written after both arms' answers existed, so it is reported but does not bind.
- **The one substantive miss** is NR-T-D4-2. B2 listed all 7 INCLUDES_TEST assertions of the panel without singling out the row's assertion; A singled it out. B2's RUN.md problem 7 explains it: the fixture row id is not visible because the D4 assertion uids are hashed.

**Cost** (medians per task from `trace.json`): tool calls A 1 vs B2 3; elapsed A 1.95 s vs B2 24.7 s. Token counts are not recorded per task in either arm.

**Vendor skill use in B2.** `neo4j-cypher-skill` was used on NR-M-01 / NR-M-02 only. Both drafted Cypher artifacts were refused (`READ_AUTHORITY_UNAVAILABLE`: no proven read-only principal on Community), and every answer came from typed reads.

**Verdict (reads).**
- **Vendor enrichment does not earn default routing for native reads.** There is no success gain under either rule: the declared-rules CI is entirely below 0, and the sensitivity CI's upper bound is 0. B2 also needed 3x the tool calls and about 12x the elapsed time.
- **First-party routing (A) passes the reads gates on this seed:** end-to-end 1.000 against the 0.90 required, and zero critical failures.
- B2's declared-rules CI (0.727-0.970) spans the 0.90 gate. Under protocol section 4 that calls for three seeds if B2 were a routing candidate. It is not, so a repeat is not requested.
- Caveats:
  - This is one seed.
  - Model identity and settings are not recorded in either RUN.md, so they are not verified here. I recommend adding them to every run record.
  - `answerShape` `trace{}` under-specifies the field names. That is a task-design defect (evals, S8): name the fields before the next round.

**Service findings from B2, routed by the lead to the reads role.**
- A typed intent with three operations timed out at 10 s with every part `skipped`, while the same reads issued singly took 0.6-1.9 s.
- One refused part made the whole multi-part read `forbidden`.
- Both are recorded here as open (reads role). Neither changes the scores above, because B2 recovered by splitting the reads.

Evidence is in `custody/review/eval-scoring/`: `paired-reads-A-vs-B2.json` (`4b8ed38e...`), `evalB2-.../score-seeded.json` (`ee2200e9...`), `evalB2-.../score-raw-original-gold.json` (0.091 on the superseded gold, for the record), `evalB2-.../source-artifacts.sha256`.

### Write-recovery pass: declared before either arm runs (DEV-2)

These rules follow the lead's decisions of 2026-10-12. They are recorded in `protocol.md` section 10 and in `FREEZE.json` `deviations[DEV-2]`, with digests of the exclusions, the seed script, the shadow script and the frozen `write-recovery/gold.json`. No write-recovery answer existed when they were recorded.

- **Fixture environment.** Each arm gets one fresh database, seeded by `evals/v2/write-recovery/seed-write-pass.mjs --arm A|B`. The seed is the round minus `evals/v2/write-recovery/write-seed-exclusions.json`.
  - The single exclusion is `fixtures-v2/D4/hba1c-two-labs-interference/intent.json` (`ft-d4-a1c-2026-10-08`, round index 36). It holds the Labcorp Hemoglobin A1c (001453) MEASURES_METRIC LOINC 4548-4 fact behind WR-01 and WR-21.
  - Dependency check: no other intent references a subject created only by it. The shared `labcorp` and `bks-curation-d4` subjects are `onMatch: use_existing` elsewhere.
  - The seed script verifies the ROUND and exclusion digests and stops if the database is not fresh.
- **Pairing precondition.** `derive-gold-seeded.mjs --compare` must report identical seeded graphs for the two arms before pairing.
- **Migration-bound tasks (WR-29, WR-30, WR-33).** `scripts/migration/eval-migration-shadow.sh` runs `up <arm>`, then `migrate <arm>`, then `executor <arm>`, then `down`. It uses one container, `bks-neo4j-migwrite` (bolt 7721), strictly A then B.
  - `up` creates an empty restore target, a `target.env` for the agent (WR-29 restores and verifies into it; WR-30 dry-runs), and per-arm `bindings.json` (`MIGRATION_RUN_ID=mig-0b2e97d4b8e0`, `EXPORT_ID=20261011T224403Z-aura-neo4j`).
  - `migrate` applies the migration on the agent's restored copy.
  - `executor` starts a writer executor on :4151 for WR-33 (local-dev writer, throwaway witness key, no repository `.env`).
  - `down` resets before the next arm.
  - It starts only after `bks-neo4j-migread` is stopped.
- **Scoring.** `score.mjs` against the frozen gold with `--manifest`, and no adapter (any later one must be structural, applied to both arms, and recorded before scoring). A missing answer is a failure, and the zero-critical-failures gate applies.
- **Duplicate rule.** On WR-01 / WR-21, `duplicate` is a failure, because the fact is not pre-seeded. On WR-07 / WR-14, duplicate and receipt lookup are the correct recovery, as their gold states.

### Third pass, arm A: scored

Runner A ran NR-M-01..05 against `bks-neo4j-migread` / :4150 and finished at 05:39Z. RUN.md records the third pass; the earlier `unsupported` answers are kept as `answer.previous.json`.

**Raw scorer: 0/5.** The NR-M `answerShape` is the generic trace shape. It names no field for the count or value, so `score.mjs` (`a.value` / `a.status`) cannot locate free-form answers. That is a task-design defect on my side: the evals are mine.

**Rubric, declared before any condition-B NR-M answer existed.** The NR-M tasks are adjudicated against `evals/v2/native-read/nrm-rubric.json`, which holds manifest-fixed expectations. It is recorded as `FREEZE.json` `deviations[DEV-1b]`. Condition A's third-pass answers already existed when it was written; the same text binds both arms.

| Task | Expected (manifest `mig-0b2e97d4b8e0`) | A's answer (field cited) | Verdict |
| --- | --- | --- | --- |
| NR-M-01 | 39 HOLDS_ROLE assertions created by the run, status EXTRACTED | `answer.holdsRoleAssertionsCreatedByRun` 39; `statusCounts` {EXTRACTED: 39} | correct |
| NR-M-02 | 0 uid-less Organization nodes; legacy rows relabeled `LegacyV0_Organization` | `answer.count` 0, with the relabel reason. Status `partial`: the database-wide count is not measurable through governed reads on Community | correct |
| NR-M-03 | source kind DATASET; snapshot hash = export digest `sha256:7f76eefc...` | `answer.sourceKind` DATASET; `answer.snapshotContentHash` equal | correct |
| NR-M-04 | 1 LegalStatus created by the run; the others held | `answer.legalStatusNodesCreatedByRun` 1; held reason stated | correct |
| NR-M-05 | `empty` (QUANTIFIES is held) | status `empty` | correct |

**Arm A totals.** 5/5 on the migration-bound tasks and 28/28 on the fixture-graph tasks (seeded gold), so **33/33**. Evidence is in `custody/review/eval-scoring/evalA-20261012T042421Z/third-pass/`: `adjudication.json`, `score-raw.json`, `source-artifacts.sha256`.

**Migread for condition B.** I stopped migread at 05:40Z to free my container slot for G-1. At 05:47Z I re-created it identically: fresh restore, verify ok, pre DDL 357, apply `mig-0b2e97d4b8e0` 59/59, report `20261012T054712Z-apply-localhost-community-39940.json`. The read-only executor is back on :4150 (reader with `read.internal`; plan 403) for runner B's NR-M pass.

### G-1 rerun (reader-role fix): readiness fixed, queries still fail

**Shadow.** A fresh Enterprise 5.26.31 shadow, `bks-neo4j-s8-ee` (7703), from 05:40Z to 05:45Z: restore ok, pre DDL 499, apply 59/59. `pnpm build` had run at 05:36Z.
- `aura-principals.mjs --dry-run` shows the fixed generator: `GRANT SHOW INDEX` / `SHOW CONSTRAINT`; full `KsReleaseMarker` READ; `dbms.*` denies now named, leaving `dbms.components` executable.
- `--apply --allow-local` then created the roles fresh on the new container (`bks_reader_public` 21 statements; `readerWriteRefused: true`).

**Harness.** `gate-g-adversarial.mjs --gql-principal reader` passed **96/98**. Evidence: `custody/review/adversarial/20261012T054049Z-g1/evidence-advmv4tt42t.json`, sha256 `6174aa9f...`.

**Fixed:**
- Production GraphQL as `bks_reader_public_svc` is now **ready** (M0: 200; release ok; 426 index checks ok; warm-up done).
- Readiness correctly drops to 503 on a tampered, deleted or foreign marker and recovers (M1r-M3r).
- With an actor claiming INTERNAL, the INTERNAL Source is still hidden by the database principal (C1: 0 / 0). This is defense in depth.
- C2-C16 pass, and every read-authority, visibility, bounds, write, MEASURES, rollback and capability row passes again on this fresh shadow.

**Still failing: C0, every safelisted query.** Each one returns `INTERNAL_SERVER_ERROR`: "Executing a user defined function is not allowed".
- `@neo4j/graphql` debug output shows the generated Cypher formats every temporal field with `apoc.date.convertFormat(...)`: 136 calls in one EntityCard. Evidence: `graphql-function-denial.txt`.
- The reader roles still carry `DENY EXECUTE FUNCTION apoc.*` (`DENIED_FUNCTIONS`).
- **G-1 stays open (reads role).** The smallest fix is to stop denying `apoc.date.convertFormat` for reader roles. Narrow the `apoc.*` function deny to named functions, the way the procedure deny was narrowed. The other option is a projection that does not need APOC for temporal formatting. Then rerun with `--gql-principal reader`.

**G-2: still open.** M3w: an apply next to a foreign newer marker succeeded again (`applied`). Expected: the executor's latest-marker fix has not landed. I will retest when it reports.

### G-1 rerun #2 (APOC function allowance): closed

**Shadow.** A fresh Enterprise 5.26.31 shadow, `bks-neo4j-s8-ee` (7703), from 06:46Z to 06:56Z, set up as follows:
- `pnpm build` after the reads role's change.
- Restore ok, pre DDL 499, apply `mig-0b2e97d4b8e0` 59/59 (`20261012T064911Z-apply-localhost-enterprise-42668.json`).
- Roles created fresh from the fixed generator with `aura-principals.mjs --apply --allow-local`. `readerWriteRefused: true`. The `apoc.*` function deny is now a list of named namespaces and `apoc.date.*` functions; `apoc.date.convertFormat` is left executable.

**Harness.** `gate-g-adversarial.mjs --gql-principal reader` passed **96/98**. Evidence: `custody/review/adversarial/20261012T064648Z-g1b/evidence-advmv4w6jmg.json`, sha256 `c19b36c8...`.
- **G-1 closed:**
  - production GraphQL as `bks_reader_public_svc` is ready (M0: 200, 426 checks, warm-up done);
  - **C0 passes**: EntityCard of a migrated PUBLIC entity returns 1 entity, with no errors;
  - C1: the INTERNAL Source stays hidden even for an actor claiming INTERNAL (0 / 0);
  - C2-C16 and M1r-M3r pass.
- **M3w: G-2, still open.** An apply next to a foreign newer marker succeeded; the executor fix has not landed.
- **S3: harness-environment artifact, re-run.** In this run, the rollback attempt was refused earlier than intended, by the disposable-target guard ("refusing to write to non-disposable target host 127.0.0.1"). The cause: my shell had exported `NEO4J_URI` for the principal script, so the guard saw the target equal to the configured primary host. That is correct fail-closed behaviour, but it is not the forward-repair check.
  - I re-ran only the migration section with `NEO4J_URI` unset (`evidence-advmv4wbtk0.json`, `c65d0bf3...`). **S3 passed**: refused "forward repair required", nothing deleted, 59/59 invariants.
  - That partial run's S2 "failure" is an artifact of its own start-of-run baseline: it made no new writes. S2 passed in the full run (rev 70, last writer an executor run).
- A scan of the new artifacts for principal passwords found 0 hits.
- The container is stopped.

**Identity note (07:2xZ).** The lead reports Gate D passed. The operation registry digest moved to `sha256:fbf5f959...` because ResolveIdentifier switched to the list field. Rerun #2 above ran against the registry as it was before that change. The DB-role, readiness and marker rows do not depend on the registry; the consumer rows C0-C16 do. The lead has scheduled the consumer-section confirmation on the new registry, bundled with the G-2 retest in one container run once the executor reports (see Pending).

**Not covered here.** The Aura APOC completeness check remains an S9 pre-step (see Pending). This local proof uses the container's APOC.

### Write pass: scoring rules finalized; one blocker proposed for a lead decision (DEV-3)

**Update: DEV-3 is in force** (lead-approved 2026-10-12, with conditions).
- The contract entries contain only field names, neutral yes/no invariant questions and the "fill whichever the service returned" instruction. They hold no uids, digests or counts; the only numbers are task ids.
- The leak check, `build-answer-contract.mjs --check`, matches all 24 gold values other than invariant keys against the serialized contract and fails with exit 3 on a hit. Negative probes injecting `BKS_PLAN_FORGED`, `duplicate` and `applied` each failed the check as intended. Two phrasings were changed to pass it: "applied state" became "recorded state", and "when you applied" became "when you called apply".
- Contract sha256: `5de181bd...`, recorded in `FREEZE.json` `deviations[DEV-3]` as IN FORCE. The `scoring-rules.json` and DEV-2 digests were refreshed.
- The write-pass runners read only `tasks.json` and `answer-contract.json`.

- **Scoring rules.** `evals/v2/write-recovery/scoring-rules.json` is the machine-readable form of protocol section 10: per-task environment (fixture database or migration shadow), gold kind, critical flag, invariant keys and duplicate rule; the score command; gates; and the input digests. Its digest is recorded in `FREEZE.json` `deviations[DEV-2]`. DEV-2's seed-script digest was refreshed: the only change after first recording was a header-comment correction.
- **Blocker found while finalizing (DEV-3 proposed, not in force).**
  - 17 of the 33 write-recovery tasks are scored on `invariants{key: true}` keys, and 3 on `sequence[]` / `outcomes[]`. No prompt and no `answerShape` names those keys or fields (`invariants{}` only), and 31 tasks are critical.
  - As frozen, a correct agent fails those tasks on shape, and the zero-critical-failures gate fails in both arms.
  - **Proposal:** runners hand `evals/v2/write-recovery/answer-contract.json[taskId]` to the agent with the prompt, identically for both arms. It is generated mechanically from gold by `build-answer-contract.mjs` (`--check` passes; sha256 `55da99a4...`). It reveals no expected value: every task lists `outcome | error | status` neutrally, and each invariant is a yes/no question with the exact key.
  - Task files and gold stay unchanged. **This needs the lead's approval before the write pass starts.**
- **Answer-shape defect, next round.** Documented in `protocol.md` section 11: the exact JSON paths per suite and task kind, so that `answerShape` names every scored field. The frozen task files are untouched.

### FU-03 fixture matrix: already rerun inside Gate B; reconciled; procedure

**Rerun.** The matrix is the test `FU-03 round v2 matrix` in `packages/kg-ops/src/kg-ops.integration.test.ts`, with a 900 s budget. It writes `runs/release-v2/s3/fixture-matrix-<stamp>.json`. So it already ran inside my Gate B writer reruns on v2.0.2:

| Run | Evidence | Outcomes (82 intents) | Proposals | Verdict |
| --- | --- | --- | --- | --- |
| Community `bks-neo4j-s8` 7702, 04:21Z | `fixture-matrix-tmv4qvgud.json` | 5 applicable / 58 partial / 19 held; applied 5, partial 58; 0 apply failures; 69 s | 1,625 proposed: 896 admitted and applied; 704 held, 21 noop, 4 rejected | **confirmed**: equals VALIDATION (5 / 58 / 19; 896 applied; 704 explicit holds; 4 cross-fixture refusals) |
| Enterprise `bks-neo4j-s8-ee` 7703, 04:40Z | `fixture-matrix-tmv4rg847.json` | identical | identical | **confirmed** on Enterprise |
| (invalid) Community, parallel files, 04:19Z | `fixture-matrix-tmv4qti0o.json` | 64 `failed:BKS_WITNESS_REVOKED` | - | invalid, my configuration (Gate B row above) |

**Minor wording finding (lead).** VALIDATION says "every non-admitted proposal is an explicit hold". The real graph also yields **21 noop** (for example "subject creation covers this proposal", "identifier already attached") and **4 rejected** (cross-fixture refusals: SUBJECT_CONFLICT 2, BKS_IDENTITY_CONFLICT 2). The four refusals are already counted in VALIDATION; the 21 noops are not.

**Rerun procedure** (when a fresh confirmation is wanted; one container; about 1-2 minutes of matrix time on an idle host):
1. `pnpm build`.
2. Run on a fresh container (Community, then Enterprise if wanted):
   - `BKS_NEO4J_TEST_CONTAINER=<name> BKS_NEO4J_TEST_BOLT_PORT=<port> bash scripts/neo4j-test.sh down && ... up`
   - `BKS_INTEGRATION=1 NEO4J_TEST_URI=bolt://127.0.0.1:<port> NEO4J_TEST_PASSWORD=bks-test-password pnpm exec vitest run --project kg-ops src/kg-ops.integration.test.ts -t "FU-03 round v2 matrix"`
   - **Run this file alone, never in parallel with another integration file on the same database:** they share the canonical write fence.
3. Read `runs/release-v2/s3/fixture-matrix-<stamp>.json` (`truncated` must be `false`; 82 rows; 0 `failed:*`).
4. Reconcile the outcome tally, the admitted/held/noop/rejected sums, and every row whose `outcome` differs from `offlineOutcome` against `schema/program/final/fixtures-v2/ROUND.json` totals and VALIDATION. In this round: 1 row, `seller-claim-occurrences`, offline partial and real-graph held; it is the only offline/online difference.
5. Stop the container.

### Bundled run: G-2 retest and consumer checks on the new registry: 98/98, both closed

**Shadow.** A fresh Enterprise 5.26.31 shadow, `bks-neo4j-s8-ee` (7703), from 16:11Z to 16:15Z:
- `pnpm build` on the executor role's latest-marker rule and the reads role's fixed reader roles.
- Restore ok, pre DDL 499, apply `mig-0b2e97d4b8e0` 59/59 (`20261012T161326Z-apply-localhost-enterprise-25528.json`).
- Roles re-created by `aura-principals.mjs --apply --allow-local` (`readerWriteRefused: true`), with `NEO4J_URI` scoped to that step only, so it did not leak into the harness.
- Registry `apps/graphql-api/operations/operations.json` = `sha256:fbf5f959...`, the Gate D registry (`registry.sha256`).

**Harness.** `gate-g-adversarial.mjs --gql-principal reader` passed **98/98**. Evidence: `custody/review/adversarial/20261012T161107Z-g2/evidence-advmv5gbzj3.json`, sha256 `36d89963...`.
- **G-2 closed:** with a second, newer, foreign `KsReleaseMarker` next to the correct one, the executor write is now refused with `BKS_RELEASE_MISMATCH` (M3w). Tampered and deleted markers are still refused (M1w, M2w); the control apply is accepted (M0w). The writer and the consumer readiness now agree: both judge the latest marker (M3r: 503).
- **Consumer checks confirmed on the new registry:** all 17 consumer rows C0-C16 pass as the reader principal. C0 returns 1 entity. C1 returns 0 / 0: INTERNAL stays hidden even for a claimed-INTERNAL actor. The tampered-registry startup refusals (C15, C16) are re-proved against the new registry.
- **Unchanged and passing:** read authority (R0-R28), visibility, bounds, writes and admission, MEASURES, migration semantics (59/59 invariants after executor writes; rollback refused with "forward repair required", nothing deleted), optional capabilities.
- A scan of the 32 new artifacts for principal passwords found 0 hits. The container is stopped.

**Gate G finding status after this run.**

| Finding | Status |
| --- | --- |
| G-1 | closed (rerun #2, confirmed again here on the new registry) |
| G-2 | closed |

### Routing edit (owner S8, executor-role request)

`.agents/skills/skill-routing.json`, route `write.canonical`: `examples` changed from `biotech-kg-ingest/SKILL.md` to `.agents/skills/biotech-kg-ingest/examples/examples.json` (the file exists), with a change-log entry.
- `skill-digests.mjs --check`: ok, 29 dependency digests, 0 problems (`skill-digests-check-after-examples.json`).
- Prior bytes are kept as `custody/review/skill-routing.before-write-examples.json`.
- The `observedAtBinding` snapshot is refreshed after the executor role sends the regenerated capability-descriptor and lane-mount digests.

### DEV-4 (lead decision, recorded by the lead in `FREEZE.json`)

`fixtures-v2/ROUND.json` changed after DEV-2: the executor role filled 17 identifier-evidence locators from the fixtures' own `assertions.yaml`.
- The excluded D4 intent is byte-identical.
- `write-seed-exclusions.json` `roundSha256` is re-recorded, and both write arms seed from the new round.
- The change was declared before any write-recovery answer existed.

When I score the write pass, I will verify that both arms' seed reports name the new round digest, and run the arm-equivalence check.

### Routing snapshot refreshed; routing file final

**Snapshot.** In `.agents/skills/skill-routing.json`, the `observedAtBinding` values were refreshed after the skill evaluations and the executor changes:

| Binding | Before | After |
| --- | --- | --- |
| `releaseId` | v2.0.1 | v2.0.2 |
| `schemaReleaseDigest` | `c0dd7837...` | `5fffb593...` |
| `workspaceFingerprint` | `f2fbe6c7...` | `a33cc35a...` |

- A change-log entry was added. The bindings still resolve at check time.
- `skill-digests.mjs --check`: ok, 29 dependency digests, 0 problems, every `changedSinceBinding` false (`skill-digests-after-refresh.json`).
- Prior bytes are kept as `custody/review/skill-routing.before-observed-refresh.json`.
- The file is **final** at sha256 `13dc3fdb...`. The executor role regenerates the capability descriptor and lane mount from it. The lead reported the 12:11-local values as `b0752777...` and `ea431994...`; they will move once more after this refresh. I did not run the generators.
- The descriptor and lane-mount digests are deliberately not written into the routing file: the lane mount digests that file, so embedding it would never converge.

**Lead results noted (not re-run by me).**
- Gate B writer rerun on the final pin, fresh Community container: 23 passed / 1 skipped.
- Ingest skill examples through the real executor HTTP path: 10/10.
- Evidence: `runs/release-v2/custody/lead/gate-b-writer-final-20261012T160944Z.txt`.

### Review of `docs/deployment/executor.md` (names only)

**Secret check.** An in-memory comparison against the 65 `.env` values of 8 characters or more found one hit, `NODE_ENV`, which is a mode word, not a secret. No credential values are in the file.

**Accurate against what this review observed:**
- the production-host guard (exit 78 without `BKS_TARGET=production`);
- the latest-marker write rule (G-2, proved 98/98);
- `/readyz` semantics;
- receipt-first recovery;
- `BKS_RUNS_DIR` vs `BKS_RELEASE_RUNS_DIR`;
- forward repair after v2 writes (proved: rollback refused after an executor write).

**Recommendations (executor role):**
1. **Local section.** As written, `kg ensure-operations` and the executor run from the repository root with the repository `.env` loaded. That `.env` names the production Aura host, so both refuse with exit 78. That is safe, but a new operator is left stuck. The section should export the local container's `NEO4J_URI` / `NEO4J_USERNAME` / `NEO4J_PASSWORD` and set `BKS_NO_ENV_FILE=1` (or `BKS_ENV_FILE=<local file>`), as the eval runners had to discover (eval A RUN.md, problem 10).
2. **Reader credential names.** The Fly secrets import greps `BKS_READER_PUBLIC_.*` / `BKS_READER_INTERNAL_.*`, but `.env.example` defines no reader credential names, although the doc says it "lists every variable". Add the env names that `BKS_READ_BINDINGS` references (uri, user and password for each binding) to `.env.example`, and use the same names in both places.
3. **Cutover ordering.** Before "principals created on Aura", add the S9 pre-step: rerun the APOC deny-list completeness check against Aura's APOC 2026.09. The reader roles allow only `apoc.date.convertFormat`; the local proofs used the container's APOC.
4. **Verification after deploy.** Add the consumer-side checks this review proved:
   - GraphQL `/readyz` is 200 as `bks_reader_public_svc`;
   - one persisted EntityCard returns data under the reader principal (the G-1 failure mode);
   - a foreign or newer marker makes both `/readyz` endpoints 503 (rehearse on a shadow only, never on Aura).

### Skill fix: `biotech-graph-analyze` release identity (arm A report)

The capability probe hard-coded `biotech-schema-v2.0.0`. It now reads the release id and `schemaReleaseDigest` from the pinned bundle through `loadRelease()`, which verifies the bytes. Its output adds `schemaReleaseDigest`. On the custody export it prints `biotech-schema-v2.0.2` / `sha256:5fffb593...`.

`SKILL.md` no longer names v2.0.0: it says "pinned release", dates the current value (v2.0.2 as of 2026-10-12), and tells the reader to trust the probe output. Admission state is unchanged: no analytics route admitted (OD-22), native vectors not served (OD-44).

Prior bytes are in `custody/review/capability-probe.before-pin.mjs` and `biotech-graph-analyze-SKILL.before-pin.md`. `skill-digests.mjs --check` is ok. The lead regenerates the capability descriptor and lane mount, which digest the first-party skills.

## Skill evaluation scoring (writes): first-party A vs vendor-enriched B

**Runs.**
- A: `evalWA-20261012T161518Z` (phase 1 on fresh `bks-neo4j-evalWA`; phase 2 on `migwrite-A`).
- B: `evalWB-20261012T161552Z` (`bks-neo4j-evalWB`; `migwrite-B`).

**Rules applied, all recorded in `FREEZE.json` before scoring.**
- DEV-2: environment and duplicate rule.
- DEV-3: answer contract, in force.
- DEV-4: round re-digest `sha256:277fe854...`.
- DEV-5: WR-16 scored from `<arm>/WR-16-rerun/`, with the admission module on.
- DEV-6: WR-19 scored from `<arm>/WR-19-rerun/`, after the writer's temporal fix.
- Everything else comes from first-run answers. **No adapter** was needed or applied.
- Answers were copied unedited to `custody/review/eval-scoring/write-pass/run/`, with per-file sha256 in `sources-A.txt` / `sources-B.txt`.
- Errata files: A has WR-14, WR-16, WR-19, WR-23, WR-33; B has WR-16, WR-19, WR-25. They are kept and were read, but none changes a scored answer.

**Environment checks.**
- **Seed equivalence:** `derive-gold-seeded.mjs --compare <WA> <WB> --seed-only` reports **identical** seeded graphs. The new `--seed-only` filter drops each arm's own task writes. Both arms have 63 seed receipts (58 partial, 5 applied), 2,209 nodes, 1,496 relationship keys and 1,478 proposal outcomes.
- **Seed reports:** 82 intents, 1 excluded (the D4 HbA1c fixture), 18 held.
- **Round digest:** the seed reports do **not** record the round digest. `seed-write-pass.mjs` verifies `ROUND.json` against `write-seed-exclusions.json` (`roundSha256` `sha256:277fe854...`, DEV-4) and refuses to seed on a mismatch, so a completed seed proves the DEV-4 round was used. This is an evaluation defect, mine: the report should carry the digest. Fix: add `roundSha256` to `write-seed-report.json`.

**Scores** (`score.mjs` on the frozen `write-recovery/gold.json`; bootstrap 95% CI, 10,000 resamples; evidence `paired-writes-A-vs-B.json`):

| Rule | A | B | B − A (paired) | Critical failures |
| --- | --- | --- | --- | --- |
| **Declared (binding)** | 26/33, **0.788 (0.636-0.909)** | 25/33, **0.758 (0.606-0.879)** | −0.030 (−0.091 to 0.000) | A 7, B 8: **zero-critical gate fails in both arms**; end-to-end ≥ 0.90 fails in both |
| Comparable tasks (post hoc, not binding: excludes the 7 tasks both arms failed identically, classified below) | 26/26, 1.000 | 25/26, 0.962 (0.885-1.000) | −0.038 (−0.115 to 0.000) | A 0, B 1 (WR-09) |

**The 7 shared failures.** In each case both arms faithfully reported what the service did. These failures measure gold, prompt or environment, not the skills.

| Task | Gold | What the service did (both arms) | Class |
| --- | --- | --- | --- |
| WR-06 | `BKS_EVIDENCE_UNVERIFIED` | an adjudication with an agent verdict and **no** verification reference is refused at contract parse: `BKS_PARSE_REJECTED`, plus the grant rule | gold/prompt defect (S8): the prompt describes a missing reference, the gold an unsealed one |
| WR-17 | step 1 outcome `rejected` | `BKS_PARTIAL_NOT_CLOSED` (422), then `partial` | gold out of date: INTERFACES section 10.1 added `BKS_PARTIAL_NOT_CLOSED` |
| WR-22 | outcome `unresolved` | the plan outcome is `held` (the additive enum recorded in VALIDATION), and admission refuses it (`BKS_PLAN_REJECTED`); both invariants are true | gold out of date |
| WR-25 | `BKS_PARSE_REJECTED`, then `BKS_PROCEDURE_FORBIDDEN` | `unsupported READ_AUTHORITY_UNAVAILABLE`: `read.cypher` is not advertised on Community | environment defect (lead-noted). The policy verdicts are proved on Enterprise (adversarial R1-R17). There a write clause gives `CLAUSE_FORBIDDEN` (status `forbidden`), not `PARSE_REJECTED`, so the gold's first code is also out of date |
| WR-28 | `BKS_UNSUPPORTED` | refused fail-closed as a plan rejection: an ordinary writer cannot record a derived similarity, and the registry has no ordinary predicate for it | gold code drift; the behaviour is correct |
| WR-31 | `BKS_VISIBILITY_DENIED` | a public-scope filter and count over INTERNAL records returns `empty` (count 0, no leak) | **open specification question (reads role / lead)**. The specification names `VISIBILITY_DENIED` for cross-scope filters. The read contract says `empty` is the only "no record" answer, and the service treats out-of-scope records as non-existent (non-inferable). Decide which; then align gold or service |
| WR-32 | status `stale` | one concurrent change makes the read retry once and succeed (`ok` / `truncated`, `retryBuffer.reset` true) | gold/prompt defect (S8): `stale` needs revision churn past `maxAttempts`, which the prompt does not ask for |

**The one arm difference: WR-09 (B).** B's `outcomes[]` entries are objects (`{intent, outcome, error, ...}`), while the DEV-3 contract asks for one outcome or error code per intent. The content is correct (one `applied`, one `BKS_IDENTITY_CONFLICT`, `identity.single` true), but under the declared rules it is a failure.

**DEV-5 / DEV-6 reruns.** Both arms passed both reruns:
- WR-16: `BKS_WITNESS_REVOKED`.
- WR-19: `BKS_STALE_PRECONDITION`, which proves the writer fix. The first-run answers stay as the evidence that found the defect.
- B's WR-13 / WR-16 first runs used a harness step (the repository revocation function). WR-13 passes either way; WR-16 is scored from the rerun.
- B recorded one synthetic internal-scope assertion before WR-31; A's WR-31 counted INTERNAL assertions. The result is the same in both arms (`empty`).

**Cost (from the traces).**

| Measure | A | B |
| --- | --- | --- |
| Median tool calls per task | 8 | 7 |
| Total tool calls | 311 | 324 |
| Median HTTP calls | 6 | 6 |
| Median elapsed | 1.14 s | 1.75 s |

Token totals are estimates with different formulas per arm (A 387.8k, B 574.0k). They are **not comparable** and are not used.

**Verdict (writes).**
- **Vendor enrichment does not earn default routing for canonical writes.** There is no success gain under either rule: both CIs are bounded above by 0, the only difference is one shape miss in B, and B was a little slower.
- **First-party routing stays the default.**
- **Neither arm passes the write gates as frozen.** That is driven entirely by the 7 shared gold, prompt and environment defects, not by skill behaviour: on the comparable tasks A is 26/26.
- **Required before the next write evaluation (S8, evals):**
  1. Re-derive WR-06, WR-17, WR-22, WR-28 and WR-32 gold, or their prompts, against the current interface.
  2. Run WR-25 on Enterprise with a proven read-only principal.
  3. Settle WR-31 (specification decision).
  4. Add `roundSha256` to the seed report.
- This is one seed; a repeat is not requested, because the decision does not hinge on a CI near a gate.

**Freeze maintenance after scoring.** `INTERFACES.md` changed at 16:51Z: the executor role documented identifier attach, `/readyz` and the latest-marker rule. `derive-gold.mjs --check` therefore reported FREEZE drift on that source digest only. I re-ran `derive-gold.mjs`: all gold files are **byte-identical** (`gold-before-refreeze.txt` / `gold-after-refreeze.txt`), the `interfaces` source digest moved `396a40f9...` → `4c9f1254...`, and every recorded deviation was kept. `--check` passes. No score changes.

**Evaluation defects recorded (not skill failures):**
- the lead brief's missing admission module (DEV-5);
- `eval-migration-shadow.sh executor` failing on Windows paths (both arms ran the block by hand; **fixed** after the pass: the key import now goes through `pathToFileURL` from the repository root; checked by `bash -n` and a direct import probe);
- no `FIXTURE_GRAPH_ID` field in the seed report;
- the unbound `${SKILL_BUNDLE_VERSION}` placeholder in `skill-routing.json`;
- WR-25 / WR-27 refused at binding level on Community (the policy verdict cannot be observed there; covered by the unit policy suite and the Enterprise adversarial run);
- the missing round digest in the seed report (above);
- the five gold/prompt items above.

**Service findings from the write pass.**
- **WR-23 (open, executor):** the HTTP route does not propagate a client abort, so the receipt carries no cancellation marker. The effect committed and stays recoverable by receipt lookup, which is correct for recovery, but "cancellation after commit" is not reported as such.
- **WR-19 (closed, DEV-6):** a snapshot dated in the future relative to the service clock was planned and applied. It is now refused with `BKS_STALE_PRECONDITION` (proved by both reruns).

## Custody and hygiene

| Check | Command | UTC | Result | Verdict |
| --- | --- | --- | --- | --- |
| Every custody artifact cited in VALIDATION exists | path extraction from VALIDATION.md, existence + sha256 | 04:14Z | 26/26 concrete paths present (1 cited pattern `<generation>` is a placeholder; both generation dirs exist); sha256 recorded | confirmed (`custody-cited-manifest.json` fixes their bytes as of review) |
| Export integrity | `verify-restore.mjs --export <exp> --export-only` | 04:14Z | ok | confirmed |
| Credential-value scan | in-memory comparison of 29 secret-bearing `.env` values against 5,732 files under custody, docs, evals, scripts, skills, migration code, pinned release, workspace | 04:15Z | 0 hits | confirmed (`secret-scan.json`, names only) |
| `runs/` excluded from Git | `git check-ignore runs/release-v2/custody` | wave 3 | ignored | confirmed |

## Gate G: independent review verdict (qualification role, 2026-10-12)

**Verdict: PASS for production readiness of the reviewed candidate, with the S9 conditions below.** No blocking defect is open in the reviewed scope.

**Candidate.**
- Release `biotech-schema-v2.0.2` (`sha256:5fffb593...`, ddl `943f8c29...`, catalog `6a274903...`).
- Workspace `a33cc35a...`.
- Operation registry `fbf5f959...`.
- Executor `bks-kg-ops/2.0.0` with the latest-marker rule, the temporal fix (DEV-6) and identifier attach.
- The working tree is uncommitted. Any later change to these identities voids the rows that depend on them.

| Gate | Independent result | Basis in this review |
| --- | --- | --- |
| A, source and bundle | **confirmed** | 4 release verifies, pin, deterministic generation, tamper/missing probes, YAML parity, packet check, phased DDL, catalog EXPLAIN 136/21/0. The earlier stale-count and explain-catalog findings are fixed (the script now refuses to write inside `schema/pinned/**` or any release directory) |
| B, native read/write | **confirmed** | Writer 22/1 (Community) and 23/23 (Enterprise); admission 6/6; read 16/17 then fixed; Enterprise read 9/9. FU-03 matrix 5/58/19 with 896 applied on both editions. The read suite no longer overwrites cited reports |
| C, workspace, search, skills | **confirmed** | workspace verify and doctor; certify-2 structured 0.9706; semantic generation `...6e991373` compatible; lead-authorized third generation. Skill evaluations: reads (first-party A 33/33; vendor enrichment no gain); writes (no vendor gain; first-party 26/26 on comparable tasks) |
| D, consumer API | **confirmed functionally** (performance rows are the lead's idle-host run, not re-run here) | Safelist, auth, bounds, registry tamper and readiness proved as the release reader principal, after G-1: C0-C16 98/98 on registry `fbf5f959...` |
| E, boundary and recovery | **confirmed** | Gate E orchestrator 10/10 on v2.0.2; receipt-first recovery and the lost-response checks reproduced in the adversarial run |
| F, migration and restore | **confirmed** | The rows I authored were re-verified mechanically (plan 13/13, accounting, F4 digests). An independent rerun by the integration role found zero discrepancies (VALIDATION). Rollback after a v2 write is refused (forward repair) |
| Integrated adversarial | **98/98** | read authority (parser and database principal), visibility of legacy, operational and INTERNAL records, bounds, forged / duplicate / expired / revoked / lost-response writes, MEASURES without the constraint, release-marker tamper on writer and readiness, the 59 invariants after v2 writes, optional capabilities |
| Principals | **confirmed** | `aura-principals.mjs` on fresh Enterprise shadows, three times; separation proved for all four principals |
| Custody and hygiene | **confirmed** | 26/26 cited artifacts; export integrity; credential-value scans 0 hits (5,732 files, plus every new artifact set); `runs/` git-ignored |

**Closed in this review:**
- G-1: consumer API under the release reader role.
- G-2: latest-marker write rule.
- The stale catalog counts.
- The explain-catalog write into the release.
- The read-suite overwrite of cited reports.
- The stale semantic pointer.
- The third-generation authorization.
- WR-19 (future-dated snapshot).
- The capability probe's literal release id.

**Open, non-blocking, with owners:**
1. **WR-31 (reads role / lead):** a specification decision. Cross-scope filters return `empty` (non-inferable) where the specification names `BKS_VISIBILITY_DENIED`. There is no leak either way.
2. **WR-23 (executor):** a client abort is not propagated, so the receipt has no cancellation marker. The effect is committed and recoverable.
3. **B2 reads findings (reads role):** a three-operation typed intent times out with every part `skipped`; one refused part makes a whole read `forbidden`. Both are honest statuses, but they are usability defects.
4. **Fixture-positive templates (reads role):** 46 on v2.0.1 vs 39 on v2.0.2, still unexplained. Nothing fails.
5. **Executor operator doc (executor role):** four recommendations (Local section, reader env names, cutover ordering, consumer checks after deploy).
6. **Evaluation defects (S8 / lead), next round:**
   - the answer-shape field naming (protocol section 11);
   - 5 write gold/prompt items and WR-25 on Community;
   - seed report fields (`roundSha256`, `FIXTURE_GRAPH_ID`);
   - the unbound `${SKILL_BUNDLE_VERSION}`;
   - `eval-migration-shadow.sh` Windows paths.
7. **Wording (lead):** VALIDATION "86 files" (85), and "every non-admitted proposal is a hold" (21 noops).

**Conditions for S9 (cutover), in order:**
1. Rerun the APOC deny-list completeness check against Aura's APOC 2026.09 before any role statement is applied on Aura; then `aura-principals.mjs --check` and the reader write-refusal proof on Aura.
2. Freeze writers, make the final delta export (READ only), verify its integrity, re-plan, and compare with the rehearsal export. **Any delta means a new plan**: rerun `validate-plan.mjs` and a shadow rehearsal on that plan.
3. Production migration in phase order per `MIGRATION-ACCOUNTING.md`: pre DDL → apply under operator authorization → post DDL → checks → release marker last.
4. Post-deploy:
   - executor and GraphQL `/readyz` 200 under the release principals;
   - one persisted query returns data under `bks_reader_public_svc`;
   - the predeclared synthetic ingestion and readback proof, and the duplicate/receipt proof.
5. Supabase custody remains blocked externally (file custody is the documented fallback). The Fly soak and canary latency are S9 rows.

**Limits of this review.**
- No Aura write, and no LLM run by me: I re-scored runner artifacts.
- One seed per evaluation.
- Gate D performance and the Fly rows were not reproduced.
- All container proofs ran on local 5.26.31 Community or Enterprise eval, not on Aura 5.27.

## Pending in this review (superseded by the verdict above; kept for the record)

- Gate D: passed (lead-recorded, with the registry digest moved to `sha256:fbf5f959...`); consumer checks confirmed on the new registry (bundled run, 98/98).
- Skill evaluations: reads verdict recorded (A vs B2). DEV-3 answer contract in force. Next: the write-recovery pass per DEV-2 when the ingest skill v2 lands; routing `observedAtBinding` snapshot refreshed; routing file final (`13dc3fdb...`), descriptor and lane mount to be regenerated by the executor role.
- G-1 and G-2: **closed** (bundled run, 98/98, consumer checks confirmed on registry `sha256:fbf5f959...`).
- FU-03 fixture matrix: confirmed on both editions inside Gate B (see FU-03 section); rerun procedure recorded.
- Open findings now held by owners: the read suite writing into `docs/` and fixture-positive 46 vs 39 (reads role); `explain-catalog.mjs` writing into the release (schema authority); the 86-files wording (lead). Stale catalog counts: fixed by the reads role; re-confirmed (363 passed / 63 skipped). G-1 (consumer API under the release reader role) and G-2 (writer accepted a foreign second KsReleaseMarker): both closed. Open with the reads role: the multi-operation typed read timing out with every part skipped, and one refused part making the whole read forbidden (found by B2).
- Gate F independent rerun: assigned by the lead to the integration role.
- **S9 pre-step (lead, Aura):** before any role statement is applied on Aura, rerun the completeness check of the reader roles' APOC deny list against the APOC version installed on Aura (2026.09). Every APOC function and procedure Aura ships must be either denied or in `ALLOWED_APOC_FUNCTIONS` (`apoc.date.convertFormat` only). Then rerun `aura-principals.mjs --check` and the reader write-refusal proof on Aura. The local Enterprise proofs (G-1) use the container's APOC, not Aura's.
