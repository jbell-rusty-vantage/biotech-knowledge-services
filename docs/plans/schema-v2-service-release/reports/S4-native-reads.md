# S4 handoff: native reads and query service

Role: Reads / integration (S4). 2026-10-12. Saved by the lead verbatim from the role's final message because the tool harness blocked the role's own write to this path. Nothing was committed; Aura was never touched; no test loads `.env`.

## 1. Results

**Release binding.** Everything binds to what `loadRelease()` returns: `biotech-schema-v2.0.1` (`sha256:c0dd7837...`, catalog `sha256:84232dbf...`). The parent release v2.0.0 has the same schema and templates, so its pin is accepted. A unit test loads v2.0.0 as an override to show the code is not tied to one release.

**Catalog (FU-04).**
- All 120 supported templates were run through the read service against the fixture graph, with a binding found from fixture records and an absent binding.
- 46 returned real rows with the declared columns. 72 ran cleanly but found nothing, because the fixture graph has no records for them. 2 are unsupported (they need native vectors). 0 failed.
- Regenerated 454-question status: 54 supported, 391 held, 9 unsupported (was 123 / 322 / 9 on EXPLAIN alone).
  - 72 questions are demoted to held. The fixtures do not exercise them (only 40 of the 81 FU-03 intents applied anything). They were not marked "fixture yes" without a result.
  - 3 held questions are promoted. Q-K-09 and Q-K-11 use new proposed templates; Q-K-12 uses typed reads. All three have gold assertions.
- Q-D9-02 cost. It planned cold in 1.65 s and ran warm in 176 ms on the fixture graph; the corrected version planned in 1.77 s and ran in 153 ms. The template runner now has a per-statement timeout: a stall returns TIMEOUT promptly instead of hanging. D9/Q-D9-13 and D10/Q-D10-03 are also planning-heavy and are documented with a 20 s template deadline.

**Gold questions where typed and native routes agree:** the provenance trace (P-01b against the typed assertion trace); identifiers (CQ-ID-04); report citations (Q-K-17); the current label version (Q-D6-01#1). This holds through templates on Community and through ad hoc Cypher on Enterprise. In public scope, the typed list matches the role-enforced Cypher result exactly.

## 2. Files

New, owned: `packages/kg-ops/src/read/` (`contracts`, `visibility`, `cypher-policy`, `values`, `typed`, `templates`, `service`, `rbac`, `catalog-run`, `catalog-corrections`, `catalog-proposals`, `question-status`, `fixture-graph`, `index`); tests `read.test.ts` (66 unit), `read.integration.test.ts` (Community), `read-enterprise.integration.test.ts` (Enterprise), `apps/executor/src/modules/read.test.ts` (3 unit); `apps/executor/src/modules/read.ts`; skill `.agents/skills/biotech-kg-query/` (`SKILL.md` 125 lines, `manifest.json`, 7 references, `examples/examples.json` with 14 examples); reports `S4-question-status.json` / `.md` and `S4-catalog-patch.json`.

Changed, owned: `packages/kg-ops/src/cypher.ts` (the admin baseline read now streams with an overflow probe instead of fetching everything and slicing). `read.ts` and `resolve.ts` are deliberately unchanged so v1 decoding and digests stay identical.

Outside ownership (lead to review): `packages/kg-ops/src/index.ts` one added export line; `packages/kg-ops/package.json` and `pnpm-lock.yaml`: new dependency `@neo4j-cypher/language-support` pinned at 2.0.0-next.37 (published 2026-08-19, Apache-2.0).

Evidence (`runs/release-v2/s4/`, gitignored): `gate-b-read-rmv4oh5gq.json`; `gate-b-read-ee-emv4opu14.json` and `gate-b-read-ee-latest.json`; `catalog-assertions.json` and `catalog-corrections.json`; `custody-*/`.

## 3. Contract versions

| Contract | Version | Notes |
| --- | --- | --- |
| Typed read | `biotech-knowledge-read-intent.v2` | ops: resolve, card, list, neighbors, assertion, evidence, history, report, association, status |
| Cypher read | `biotech-cypher-read-intent.v1` | either a statement or a template `{id, statementDigest}` |
| Result | `biotech-knowledge-read-result.v2` | status, 34 typed reason codes, query/result/receipt digests, snapshot ref |
| Explain | `biotech-cypher-read-explain.v1` | policy verdict plus server plan |
| Value serialization | `bks-read-values.v1` | integers beyond 2^53 as decimal strings; integral floats tagged; DateTime as UTC instant plus offset or zone so it round-trips exactly; Date, Duration, Point; whole nodes refused |
| Visibility policy | `bks-read-visibility.v1` | |
| Cypher policy | `bks-cypher-read-policy.v1` | |

Status enum: `ok | empty | truncated | failed | skipped | unsupported | stale | forbidden`. Only `empty` means "no visible record".

## 4. Parser and policy

Choice: Neo4j's own ANTLR Cypher grammar (`@neo4j-cypher/language-support`). `@neo4j/cypher-builder` is a query builder, not a parser. The policy is an allowlist of grammar rules over the parse tree, so any Cypher 25 or GQL construct is refused by default. Syntax errors come from the parser's own diagnostics. Variable references are resolved with its symbol tables. No regex makes any decision.

Refused (52 unit cases): writes, LOAD CSV, USE, admin and SHOW commands, `CALL {} IN TRANSACTIONS`, procedures outside `db.index.fulltext.queryNodes`, `properties()`, `keys()`, `elementId()`, `{.*}`, `n[$k]`, whole-entity returns (also caught at serialization after aliasing), unlabelled new nodes, untyped relationships, unbounded paths, operational and legacy labels, `MIGRATED_FROM`, span text in public scope, and `CYPHER 25`. Before running, an EXPLAIN in the same transaction rejects any plan with write operators.

The security boundary is the database role (`read/rbac.ts`): `bks_reader_internal` and `bks_reader_public`; the public role sees only nodes with `privacyClass = 'PUBLIC'`; span text is hidden from the public role; operational and legacy labels plus `MIGRATED_FROM` are hidden from both roles; LOAD CSV and side-effect procedures are denied; neither role can write.

Where ad hoc Cypher is not available: on Community, and on any binding whose principal can write (today's Aura admin), ad hoc Cypher is `unsupported` (READ_AUTHORITY_UNAVAILABLE); on a public binding without database roles, templates are `forbidden` (VISIBILITY_UNPROVEN) because templates carry no scope filters; typed reads work everywhere since visibility is compiled into every node they touch; a binding declared read-only is checked once with a write attempt that must be refused (always rolled back).

Policy limits: property checks are static, so aliasing gets past them; the database role is what actually hides span text, and the Enterprise suite proves it. Allowlists are conservative. The transaction timeout does not bound query planning, so a slow plan returns TIMEOUT to the caller while the server finishes in the background.

## 5. Patches for other owners

- **P-1, S3 (`packages/contracts`).** Copy `read/contracts.ts` to `packages/contracts/src/read-v2.ts`; change imports to `./common.js` and `./custody.js`; export from the index; add `readIntent v2`, `cypherReadIntent`, `readResult`, `readExplain`, `readValues` to `CONTRACT_VERSIONS`; move the v1 read strings to `LEGACY_CONTRACT_VERSIONS`; add JSON Schema exports and Python models.
- **P-2, S3 (`modules/read-v1.ts`).** It loads first and grabs `POST /kg/read`, so it rejects v2 bodies with a 400. Fix: remove its HTTP route, keep only its MCP `kg_read` tool, rename its capability to `read.typed.v1`. `read.ts` already decodes v1 bodies. Until then set `BKS_DISABLE_READ_V1=1`.
- **P-3, S3 (`app.ts`).** `/describe` should take `queryCatalogDigest` and `consistency.readModes` from `capabilities["read.typed"]`; currently hard-coded to `null` and `["observed"]`.
- **P-4, S3 (`fence.ts`).** `withStableRevision` should accept a `fetchSize` option and pass it to the session, so stable reads pull `rowCap + 1` rows per batch instead of the default 1000.
- **P-5, S3 (`neo4j.ts`).** No change needed.
- **P-6, S3 (writer bugs found from the read side):** planner retry bug (`planIntentV2` runs observation probing inside a retried managed transaction and clears `obs.missing` within the callback; on driver retry the lost keys cause "observation ... is not in the frozen observation set"; same retry-local-accumulator class as the read repair; fixture seeding works around it by re-planning); CaptureAttempt nodes written as PUBLIC while the register says INTERNAL; `Int` properties stored as Float (for example `unitCount = 30.0`); planner and apply exceeded their 30 s budgets once on a cold database with the full DDL; `bks kg read` CLI only handles v1 intents.
- **P-7, lead (`.env.example`).** Add `BKS_READ_BINDINGS`, `BKS_READ_AUTHORITY`, `BKS_READ_VISIBILITY`, `BKS_READ_MAX_CONCURRENT`, `BKS_READ_MAX_CONCURRENT_PER_PRINCIPAL`, `BKS_READ_V1_RETIRED`.
- **P-8, S8 (`skill-routing.json`).** Point both read routes' examples at `examples/examples.json`; add `read.templates` to read.familiar.
- **Catalog patch for S1** (`reports/S4-catalog-patch.json`): 8 corrections and 4 proposed templates. AllNodesScan fixes for K/CQ-AX-04, K/Q-K-23, D9/CQ-RC-05, D12/Q-D12-18, QP/P-10a.4, QP/P-10c.2 (per-label uid seeks or per-type UNION branches; none plans an AllNodesScan after the fix; each returns the same rows as the released statement on the fixture graph). Unstored-label fix: Q-D5-20 matched `:Subjectable` (never stored); now matches `:Entity`. Q-D9-02: the hard 4-hop path is replaced by the P-09 "behind" set (MD-D9-03 d). Proposed templates: K/Q-K-09, K/Q-K-11, K/Q-K-12#identifiers, K/Q-K-12#carrier. Q-D9-19 unchanged (needs GDS, disabled; stays unsupported).

## 6. Commands run

- `pnpm build`: passed (full repo).
- `pnpm test`: 28 files passed, 5 skipped; 351 tests passed, 62 skipped.
- `npx vitest run --project kg-ops packages/kg-ops/src/read/read.test.ts`: 66/66.
- Executor project: 9/9 including the 3 new; a later executor-only run showed one failure in another role's `src/schema.test.ts` (merge parity); the full `pnpm test` above passed.
- `cypher.test.ts`: 6/6.
- `BKS_INTEGRATION=1 NEO4J_TEST_URI=bolt://127.0.0.1:7698 NEO4J_TEST_PASSWORD=bks-test-password npx vitest run --project kg-ops packages/kg-ops/src/read/read.integration.test.ts`: 17/17 (2026-10-12T03:13:52Z, 129 s).
- `BKS_INTEGRATION=1 NEO4J_EE_TEST_URI=bolt://127.0.0.1:7699 NEO4J_TEST_PASSWORD=bks-test-password npx vitest run --project kg-ops packages/kg-ops/src/read/read-enterprise.integration.test.ts`: 9/9 (03:20:38Z, 60 s).

Earlier failed runs were environmental (Docker hangs) or real bugs fixed during the run: a variable-shadowing error in the evidence query, DateTime offset round-trip, union column names in a correction, and subquery scope handling.

## 7. Gate B read evidence rows

Environment: local Neo4j 5.26.31 containers, Community `bks-neo4j-s4` on bolt 7698 and Enterprise eval `bks-neo4j-s4-ee` on 7699, both at 1.5 GiB with 256 MiB page cache. Identity: release v2.0.1 `sha256:c0dd7837...`, catalog `sha256:84232dbf...`.

Community (`gate-b-read-rmv4oh5gq.json`, 2026-10-12T03:13-03:16Z), all pass: typed gold answers (identifier chain, history, trace, evidence states, report, association; two asserters disagree and both are kept); temporal views (recordedAsOf before/after supersession, validAt classes, inverse edge); status distinction (empty, truncated, unsupported, stale, forbidden distinct with distinct digests); public visibility (typed): internal organization invisible to card, resolve, list, assertion and counts; legacy and operational records invisible; span text hidden; templates forbidden in public scope; ad hoc Cypher unavailable on Community; stable_revision: a write mid-read forces a retry (2 attempts), a graph that keeps changing returns `stale`; forced transient retry: 2 attempts, result digest equals a fresh read, custody dependencies only from the surviving attempt; streaming: overflow probe returns in 18 ms on a product of billions of rows, byte and list caps hold; deadline: server-side TIMEOUT; concurrency cap: second read `skipped`; serialization round-trip: null, integers beyond 2^53, floats, DateTime with offset, Date, Duration, Point compare equal in the database; digests: identical reads share query and result digests but not receipt digests, v1 still decodes; snapshot custody: the S3 planner accepts it as a `revision-equal` basis; catalog 46 / 72 / 2 / 0; typed vs template gold agree; catalog corrections pass; skill examples 8 pass.

Enterprise (`gate-b-read-ee-emv4opu14.json`, 03:20-03:21Z), all pass: reader cannot write (refused by the database for create, merge, set, delete, `IN TRANSACTIONS`, LOAD CSV, apoc.load, db.createLabel, dbms.listConfig and apoc functions, even in a WRITE session; the parser refuses the same statements before any database call); role visibility bypassing the parser (internal uid probe returns 0 for public and 1 for internal; organization count 3 vs 4; span filter and projection blocked, span text reads as null for the public role; legacy, operational and `MIGRATED_FROM` invisible to both roles); Cypher artifacts (spec 6.1 example runs with exact digest; column mismatch fails; explain works; forged template digest is `stale`; admin binding unavailable); bounds (LIST_CAP, nested lists capped, NESTING_CAP, ROW_CAP, BYTE_CAP, TIMEOUT in about 1.0 s, whole-entity return forbidden); stable_revision as reader works; typed vs Cypher gold agree; held-question promotions pass; Q-D9-02 cost measured; skill examples 6 pass.

## 8. Not run, limits, blockers

Not run: catalog run against the migration-rehearsal restore (one-container rule); HTTP routes and MCP against a live database (unit-tested without a database only); the reader roles on Aura (lead creates them from `rbac.ts`); a PROFILE benchmark path; `fixtures-v2/**` was not present when the role ran, so S3's `fixtures-v2.ts` plus the FU-03 intents were used.

Limits: 72 templates are contract-only until fixture data exists; MONDO expansion unsupported until a mapping artifact ships; snapshot dependencies recorded as `complete: false`; report sentence traces only expose the ledger digest.

Findings for other roles: Enterprise DDL vs migrated legacy edges (the Enterprise release DDL requires `assertionUid` on every relationship of an asserted type; preserved legacy relationships of the same type violate it; lead decision already taken: `rel_MEASURES_assertion_exists` blocked-by-legacy-data in v2.0.2, phased DDL); S3's `ensureOperationalState` now applies the Enterprise DDL on Enterprise servers, which is how this surfaced; `packages/schema-workspace/dist/render.js` was emitted broken from an in-progress `render.ts` around 21:41 and was rebuilt once the source was fixed.

Blocker during the run: Docker Desktop hung repeatedly under memory pressure. At the end Community `bks-neo4j-s4` is running and Enterprise `bks-neo4j-s4-ee` is stopped.

## 9. Interface deltas

- `/describe` gains `read.typed` (v2, legacy v1 contract, operations, bindings, readModes, queryCatalogDigest, releaseId) and `read.templates`. `read.cypher` appears only when a binding declares a read-only database principal.
- New MCP tools: `kg_read_v2`, `kg_read_cypher`, `kg_read_explain`, `kg_catalog_templates`.
- HTTP behaviour: read results return HTTP 200 with the status in the body; bad tokens 401/403; malformed artifacts 400; a v1 body when v1 is retired 501.
- Bindings are host configuration via `BKS_READ_BINDINGS`. Without it there are two bindings over the executor's connection: `default` (public scope) and `internal` (requires the `read.internal` grant).
- Invalidated artifacts: none. v1 contracts and digests are unchanged.

## 10. Addendum (2026-10-12, saved by the lead from the role's message)

Tests made release-agnostic for the `biotech-schema-v2.0.2` pin (expected counts derived from `loadRelease().queryCatalog`, digest and servability invariants); `read.test.ts` 66/66 and executor 13/13 pass, `pnpm build` passes, and `apps/executor/src/modules/read.ts` imports cleanly with contracts in `@bks/contracts`. The Community 17/17 and Enterprise 9/9 integration runs and `S4-question-status.json` (54/391/9) were produced on v2.0.1 and have not been rerun on v2.0.2.

## 11. Addendum: deliberate question status on v2.0.2, template-count drift, resolve fix (2026-10-12, S4)

**Run outputs vs the cited report.** `read.integration.test.ts` now writes only run outputs under `runs/release-v2/s4/`
(`catalog-assertions-<stamp>.json`, `question-status-<stamp>.{json,md}`, optional `catalog-compare-<stamp>.json`).
`reports/S4-question-status.{json,md}` are written only when `BKS_S4_WRITE_QUESTION_STATUS=1` is set. The reviewer's
52/393/9 came from an ordinary run overwriting the report (that run, `rmv4qzge8`, also failed the old hard-coded
"120 templates" check).

**Deliberate regeneration** (pinned `biotech-schema-v2.0.2`, one container `bks-neo4j-s4` created with
`scripts/neo4j-test.sh`, removed afterwards):

```text
BKS_NEO4J_TEST_CONTAINER=bks-neo4j-s4 BKS_NEO4J_TEST_BOLT_PORT=7698 BKS_NEO4J_TEST_HTTP_PORT=7498 bash scripts/neo4j-test.sh up
BKS_INTEGRATION=1 BKS_S4_WRITE_QUESTION_STATUS=1 BKS_S4_EE_EVIDENCE=runs/release-v2/s4/gate-b-read-ee-latest.json \
  BKS_S4_COMPARE_RELEASE_DIR=../biotech-meta/docs/schema/releases/biotech-schema-v2.0.1 \
  NEO4J_TEST_URI=bolt://127.0.0.1:7698 NEO4J_TEST_PASSWORD=bks-test-password \
  pnpm exec vitest run --project kg-ops packages/kg-ops/src/read/read.integration.test.ts
```

Result: 17/17 pass (run `rmv4sbi7r`, 2026-10-12T05:01Z, 120 s). Graph seed is the full fixture graph, reseeded by the
suite: the S3 Gate B fixtures, the S4 read fixture, and the FU-03 migrated packet intents (81 intents, 40 applied
admitted subsets, 41 rejected, 0 errors), plus the migrator-only operational probes. The Q-K-12 typed promotion comes
from the Enterprise evidence file `gate-b-read-ee-latest.json` (v2.0.2, all 3 promotions verified).

**Split: 56 supported / 389 held / 9 unsupported** (the release hosts 54/391/9). Two questions moved held -> supported:
CQ-MF-01 (D8/CQ-MF-01) and Q-D8-13 (D8/Q-D8-13). Their templates now find fixture-positive bindings because the binder
tries fixture subjects before minted records. **Schema authority: please update the hosted question status for these
two questions in the next revision** (no template change).

**Templates returning rows (46 -> 39 question).** Measured on ONE seeded graph with both catalogs (`catalog-compare-<stamp>.json`):

| Catalog | Fixture-positive | Contract-only | Unsupported |
| --- | --- | --- | --- |
| v2.0.1 | 48 | 70 | 2 |
| v2.0.2 | 52 | 71 | 0 |

v2.0.2 gains K/Q-K-09, K/Q-K-11, K/Q-K-12#identifiers and K/Q-K-12#carrier (all positive). D5/Q-D5-20 is contract-only
(no fixture rows). No template went from positive to empty.

I could not reproduce "39". The reviewer's own v2.0.2 run file shows 47 fixture-positive. The real regressions were in
my binder, not in the templates:
- The corrected K/CQ-AX-04 and K/Q-K-23 use `WHERE $label IN labels(x)`, so the binder no longer paired `$label` with
  the uid's label.
- The corrected D9/CQ-RC-05 uses `UNWIND $answerInputUids AS inputUid`, so the binder could not infer Assertion uids.
- Binder fixes: recognise both label forms, infer through UNWIND, subjects first.
- The correction checks show identical rows with the same binding (`catalog-corrections.json`), so **no correction
  broke a template and no S1 patch is needed**.
- The 46 vs 48 difference on v2.0.1 is the binder-order change, not the graph.
- The executor's Int-as-integer change: no template outcome changed for that reason in the comparison.

**Resolve fix (evaluation finding).**
- A mention with a `name` and no `nodeType` now runs an exact-name query over every Entity-labelled type. It is capped
  at `limitPerMention` with a one-row overflow probe (`truncated` when more exist).
- A mention with no uid, identifier or name, or a uid without a release token, is `unsupported`.
- Any operation that compiles to no query is `unsupported`, never `empty`.
- Identifier steps also carry the overflow probe.
- Tests: unit (compile, refusals, the 50-mention and lower-case `mentionId` limits) and integration (name-only resolve
  returns the organization as `candidate`).
- `biotech-kg-query` SKILL.md and `references/typed-operations.md` now document the shape limits: 20 operations per
  intent, 50 mentions per resolve, 20 identifiers per mention, `limitPerMention` <= 25, lower-case `opId` and
  `mentionId`.

**Checks:**
- `pnpm build`: pass.
- `pnpm exec vitest run --project kg-ops --project executor`: 118 passed, 55 skipped.
- Community integration on v2.0.2: 17/17.
- The Enterprise suite was not rerun for this addendum (one-container rule; its evidence `gate-b-read-ee-latest.json`
  is v2.0.2).

## 12. Addendum: reader roles usable by the consumer GraphQL API (2026-10-12, S4)

Blocking review finding: the `bks_reader_*` roles made `@neo4j/graphql` 7.6.3 and the API readiness check fail.
Changes are in `packages/kg-ops/src/read/rbac.ts` (`readerRoleStatements`, both scopes).

- **dbms procedures.** The blanket `dbms.*` deny is replaced by named and glob denies of every non-informational dbms
  procedure on 5.26.31, taken from `SHOW PROCEDURES`:
  - denied: `dbms.checkConfigValue`, `dbms.cluster.*`, `dbms.killConnection(s)`, `dbms.listActiveLocks`,
    `dbms.listCapabilities`, `dbms.listConfig`, `dbms.listConnections`, `dbms.listPools`, `dbms.quarantineDatabase`,
    `dbms.queryJmx`, `dbms.scheduler.*`, `dbms.security.*`, `dbms.setConfigValue`, `dbms.setDatabaseAllocator`,
    `dbms.setDefaultAllocationNumbers`, `dbms.setDefaultDatabase`, `dbms.showTopologyGraphConfig`, `dbms.upgrade*`;
  - still executable (exported as `ALLOWED_DBMS_PROCEDURES`): `dbms.components` (called by the library on every
    request), `dbms.info`, `dbms.showCurrentUser`, `dbms.routing.getRoutingTable`.
- **Schema metadata.** Both roles get `GRANT SHOW INDEX ON DATABASE` and `GRANT SHOW CONSTRAINT ON DATABASE`.
- **Release marker.** The `KsReleaseMarker` read grant is now `{releaseId, schemaReleaseDigest, installedAt,
  migrationRunId, ddlDigest}`.
- **Unchanged.** Every other deny is kept: no write or name privileges, DENY LOAD, apoc / gds / genai / tx / cdc /
  db-admin procedures, BOOSTED, APOC/GDS/GenAI functions, operational and legacy labels, `MIGRATED_FROM`, operational
  properties, and span text for the public role.

**Tests.**
- Unit (`read.test.ts`, 66/66): asserts the grants, the full marker read grant, that the deny list does not cover
  `dbms.components`, `dbms.info` or `dbms.routing.*`, and that the admin denies remain.
- Enterprise (`read-enterprise.integration.test.ts`), new test "consumer GraphQL under bks_reader_public", run for
  both roles:
  - `CALL dbms.components()` returns edition `enterprise`;
  - `SHOW INDEXES` and `SHOW CONSTRAINTS` return rows;
  - the marker returns releaseId, schemaReleaseDigest, installedAt, migrationRunId and ddlDigest;
  - CREATE, `dbms.listConfig`, `dbms.security.clearAuthCache` and `dbms.setConfigValue` are still refused, and no
    node is written.

**Run.**
- Command: `BKS_NEO4J_EDITION=enterprise BKS_NEO4J_TEST_CONTAINER=bks-neo4j-s4-ee BKS_NEO4J_TEST_BOLT_PORT=7699
  BKS_NEO4J_TEST_HTTP_PORT=7499 bash scripts/neo4j-test.sh up` (fresh container), then
  `BKS_INTEGRATION=1 NEO4J_EE_TEST_URI=bolt://127.0.0.1:7699 NEO4J_TEST_PASSWORD=bks-test-password pnpm exec vitest
  run --project kg-ops packages/kg-ops/src/read/read-enterprise.integration.test.ts`.
- Result: **10/10 pass** on pinned `biotech-schema-v2.0.2`, run `emv4taazd`, 2026-10-12T05:28:32Z–05:29:40Z.
  Evidence: `runs/release-v2/s4/gate-b-read-ee-emv4taazd.json` and `gate-b-read-ee-latest.json`.
- Container removed afterwards.
- Also on this run: the legacy-MEASURES edge probe no longer hits an Enterprise existence constraint on v2.0.2
  (`legacy-edge-vs-enterprise-ddl: none`).
- The deadline assertion now uses a graph-independent lazy product (`UNWIND range(1, 10000)` twice): the earlier
  4-way Entity product finished within 800 ms on the smaller Enterprise fixture graph. Result: TIMEOUT in 964 ms.
- `pnpm build` passes; `pnpm exec vitest run --project kg-ops --project executor` gives 118 passed, 56 skipped.

The qualification role can rerun its harness with `--gql-principal reader`. Any role created before this change must
be re-created from `readerRoleStatements` (drop and re-apply), including the lead's Aura roles.

## 13. Addendum: APOC function allowance for the consumer GraphQL API (2026-10-12, S4)

G-1 finding: every safelisted GraphQL query failed under the reader roles. `@neo4j/graphql` 7.6.3 formats date fields
with `apoc.date.convertFormat`, and `readerRoleStatements` denied every `apoc.*` function.

**What the library emits.**
- `apps/graphql-api/benchmarks/2026-10-12-plans.json`: 644 `apoc.date.convertFormat` calls and no other APOC function.
- The library's `dist`: also references `apoc.util.validate` (a procedure) and `apoc.util.validatePredicate` (a
  function). Both are emitted only for `@authorization` validate rules, which the projection does not use, so both stay
  denied.

**Change** (`read/rbac.ts`, both reader roles):
- PUBLIC grants EXECUTE on every function and a DENY always wins, so the function deny no longer says `apoc.*`.
- It now names:
  - every APOC core 5.26.31 function namespace except `apoc.date` (from `SHOW FUNCTIONS`: agg, any, bitwise, coll,
    convert, create, cypher, data, diff, hashing, json, label, map, math, meta, node, nodes, number, path, rel, schema,
    scoring, temporal, text, util, xml);
  - the extended / Aura APOC families (load, periodic, export, import, refactor, systemdb, trigger, ...);
  - `apoc.version`;
  - each `apoc.date.*` function except `convertFormat`;
  - `gds.*`, `genai.*` and `ai.*`.
- `ALLOWED_APOC_FUNCTIONS = ["apoc.date.convertFormat"]`.
- The procedure deny still contains `apoc.*` (no APOC procedure is executable).
- `functionDenied(name)` checks coverage. **Re-run the completeness check after any APOC upgrade; Aura runs APOC
  2026.09.**

**Tests.**
- Unit (`read.test.ts`, 66/66): no `apoc.*` in the function deny, `convertFormat` not denied, a sample of other
  APOC / GDS / GenAI / ai functions denied, and the procedure deny still `apoc.*`.
- Enterprise, both roles:
  - completeness: every APOC function the server lists in `SHOW FUNCTIONS` (246) is either allowed (only
    `convertFormat`) or covered by the deny list;
  - `RETURN apoc.date.convertFormat('2026-10-12', 'date', 'yyyy-MM-dd')` returns `2026-10-12`;
  - refused with a security error: `apoc.text.join`, `apoc.date.format`, `apoc.cypher.runFirstColumnSingle`,
    `CALL apoc.load.json`, `CALL apoc.cypher.run`, `CALL apoc.cypher.doIt`, `CALL apoc.create.node`,
    `CALL apoc.periodic.iterate`;
  - no node is written.

**Documentation.** `biotech-kg-query` SKILL.md and `references/typed-operations.md` now state:
- `list.limit` <= 500 (keyset page with `after`), `neighbors` <= 500, the other operations <= 200 (plus the earlier
  20 operations per intent and 50 mentions per resolve);
- database-wide counts of legacy or operational records are not measurable through governed reads, by design (that
  inventory is the operator / migration route).

**Run.**
- Command: `BKS_INTEGRATION=1 NEO4J_EE_TEST_URI=bolt://127.0.0.1:7699 NEO4J_TEST_PASSWORD=bks-test-password pnpm
  exec vitest run --project kg-ops packages/kg-ops/src/read/read-enterprise.integration.test.ts` on `bks-neo4j-s4-ee`
  (created with `scripts/neo4j-test.sh`, `BKS_NEO4J_EDITION=enterprise`).
- Result: **10/10**, run `emv4v0etk`, 2026-10-12T06:16:50Z–06:18:23Z, pinned `biotech-schema-v2.0.2`.
  Evidence: `runs/release-v2/s4/gate-b-read-ee-emv4v0etk.json`.
- Container removed afterwards.
- `pnpm build` passes; `pnpm test` gives 363 passed, 64 skipped.
- Roles created earlier (including the lead's Aura roles) must be dropped and re-applied from `readerRoleStatements`.

## 14. Addendum: reader-role deny-list completeness against the Aura inventory (2026-10-12, S4)

**New script:** `node packages/kg-ops/scripts/rbac-completeness.mjs <inventory.json> [--json]`.
- Offline; needs `pnpm build`.
- For both reader roles it derives the DENY EXECUTE FUNCTION / PROCEDURE globs from `readerRoleStatements` and applies
  Neo4j glob semantics.
- Checks:
  - every `apoc.*` / `gds.*` / `genai.*` / `ai.*` function except `apoc.date.convertFormat` is denied;
  - every procedure except the read allowlist is denied. The allowlist is `db.index.fulltext.queryNodes`,
    `dbms.components`, `dbms.info`, `dbms.showCurrentUser` and `dbms.routing.getRoutingTable`;
  - no allowlisted name is accidentally denied.
- Exits 1 on any gap. The lead can rerun it at S9.

**Run** against `runs/release-v2/custody/s9/aura-functions-procedures.json` (Aura 5.27, APOC 2026.09.0,
399 functions, 703 procedures).

- **Before: 30 gaps (15 per role)**, all procedures; 0 function gaps across 253 governed functions:
  - `db.cdc.current`, `db.cdc.earliest`, `db.cdc.query`, `db.cdc.translateId`;
  - `db.index.fulltext.awaitEventuallyConsistentIndexRefresh`, `db.index.fulltext.listAvailableAnalyzers`,
    `db.index.fulltext.queryRelationships`;
  - `db.info`, `db.labels`, `db.listLocks`, `db.ping`, `db.propertyKeys`, `db.relationshipTypes`;
  - `dbms.recreateDatabase`, `dbms.unquarantineDatabase`.
- **Fix** (`read/rbac.ts`): all of those are added to the procedure deny, `db.cdc.*` as a glob, plus
  `db.index.fulltext.drop*` and a defensive `aura.*`. Neither the consumer API nor the GraphQL library calls any of
  them (source grep; the API uses `dbms.components`, `SHOW INDEXES` and `SHOW CONSTRAINTS`).
- **After: 0 gaps** for both roles. No allowlisted name is denied.

**Tests.**
- New unit test in `read.test.ts` repeats the check against the same inventory when the custody file exists
  (skipped otherwise). 67/67 pass.
- `pnpm build` passes; `pnpm test` gives 364 passed, 64 skipped.
- The Enterprise suite was not rerun for this change: deny-list additions only, no allowance changed. Re-apply the
  roles from `readerRoleStatements` before S9.

## 15. Addendum: per-operation independence and bounded connection (eval runner B2, 2026-10-12, S4)

**Findings** (`runs/release-v2/eval-runs/evalB2-20261012T061504Z/RUN.md`):
1. Cause: all operations of a typed intent ran serially in ONE read transaction under ONE shared `timeoutMs` deadline.
   A timeout abandoned the attempt, so every part became `skipped`.
2. Cause: the request-level status took the most severe part status, so one refused part made the read `forbidden`.
3. Cause: neither connection acquisition / BEGIN nor the receipt's server-info lookup (`verify()` +
   `dbms.components`, driver connect timeouts) was bounded by the read budget.

**Fixes** (`packages/kg-ops/src/read/service.ts`):
1. `limits.timeoutMs` is now a per-operation budget.
   - `observed` intents with several operations run each operation in its own read transaction, with its own
     budget and transient retries, chaining causal bookmarks.
   - A slow, failed or refused operation affects only its own part. `consistency.attempts` is the maximum over
     operations.
   - `stable_revision` keeps ONE transaction (one revision for every part) with a budget of `timeoutMs` x the number
     of operations (capped at 120 s); a timeout there still fails the parts together, by design.
2. The request-level status summarizes the answered parts (truncated if any truncated, else ok if any has rows, else
   empty).
   - The most severe part status propagates only when no part answered.
   - Request-wide refusals (binding, release pin, concurrency, stable staleness) are unchanged.
   - `parts[].status` is authoritative per operation.
3. BEGIN / connection acquisition is raced against the deadline. Transient retries stop at the deadline
   (`failed TIMEOUT`). The receipt's server-info lookup is capped at 1 s and yields nulls instead of extending the read.

**Docs.** `biotech-kg-query/references/status-cookbook.md` states the per-part rule, the per-operation budget and the
stable_revision exception.

**Tests.**
- Unit: `aggregateReadStatus` cases in `read.test.ts`, 68/68.
- Community integration: new test "per-operation independence", run `rmv4w4fcw` on v2.0.2, 2026-10-12T06:47:56Z,
  **18/18 pass**:
  - three operations, each held over 0.5 s by a fault hook, under a 1.5 s per-operation budget: all answer in 2.4 s
    total, where the old shared cap would time out;
  - `neighbors` with the predicate-only `ACTIVATES` as a relationship type is `forbidden` (RELATIONSHIP_FORBIDDEN)
    while `assertion` is `ok`, an absent card is `empty` and the read is `ok`;
  - a read against a non-routable address with a 2 s budget returns `failed TIMEOUT` in 3.0 s (budget + the 1 s
    receipt cap; previously 66 s in this test, 17 s in B2).
- Run on one container (`bks-neo4j-s4`, created with `scripts/neo4j-test.sh`), removed afterwards.
- `pnpm build` passes.
- `pnpm test`: 365 passed, 65 skipped.
