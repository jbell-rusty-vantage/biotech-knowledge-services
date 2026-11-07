# Close-out round: REFRESH (S)

Date: 2026-10-09. Worktree: `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). This run resumes after the orchestrator crashed. No earlier refresh runlog existed, so every step was run from the start.

Rules followed: the SDL is not edited, `_work/repath-fixtures.mjs` is not run, imported or required, nothing is committed, and no `.env` values are printed.

## 0. Fixture snapshot (before)

- `git status --short schema/program/final/fixtures`: 155 lines, all ` M` except one `??` (`D1/vitamin-b6-threshold-harm/composed-body-b6-threshold-screen.txt`). Saved to scratchpad `refresh/fixtures-status-before.txt`.
- I also recorded a sha256 of every file under `final/fixtures/` (411 files) in scratchpad `refresh/fixtures-sha-before.txt`.

## 1. Re-sync packets into S

Compared `<owner worktree>/schema/program/packets/<id>/` with `S/schema/program/packets/<id>/` using `diff -rq -x __pycache__`:

- Byte diffs only in owner files with CRLF working-copy endings. Examples: D7/02-questions.md, D8 `01-ecosystem.md`, D8 fixture `intent.json` and `locators.yaml`, D3 `_notes/tools/build_fixtures.py`. In every case `diff --strip-trailing-cr` is empty, and git shows none of these files as modified in the owner worktrees (`.gitattributes`: `* text=auto eol=lf`).
- With `diff -rq --strip-trailing-cr`, all 14 packets show **0 content diffs**. There are no files present on only one side, so no deletions were needed.
- Conclusion: the S copies already match the owners' current working trees, including the owners' uncommitted close-out edits; an earlier sync copied them at about 02:50. Nothing was re-copied, so S keeps LF endings.

Packets changed relative to commit 31390a6 (that is, what this close-out round brings into S):

| Packet | Owner | Files changed vs 31390a6 |
|---|---|---|
| K | A1 | 03-retrieval-patterns.md, RUNLOG.md |
| D1 | A2 | 03, 05-relationship-register.yaml, 07-fixtures/nr-trial-unstructured/assertions.yaml, 11-open-questions.md, RUNLOG.md |
| D2 | A3 | 03, 10-seams.yaml, 11-open-questions.md, RUNLOG.md |
| D3 | A4 | 03, RUNLOG.md |
| D4 | A3 | 03, RUNLOG.md |
| D5 | A5 | 02-questions.md, 03, 10-seams.yaml, 11-open-questions.md, RUNLOG.md |
| D6 | A6 | 03, 10-seams.yaml, 11-open-questions.md, RUNLOG.md |
| D7 | A6 | 03, RUNLOG.md |
| D8 | A7 | 03, RUNLOG.md |
| D9 | A8 | 03, RUNLOG.md |
| D10 | A1 | 03, RUNLOG.md |
| D11 | A8 | 03, 05, 06-node-register.yaml, 07-fixtures/capture-failures-coverage/assertions.yaml, 09-reasoning.md, RUNLOG.md, _notes/action-space/build-action-space.mjs, identifier-bridges.yaml, tooling/action-space.yaml |
| D12 | A2 | 03, 05, 10-seams.yaml, 11-open-questions.md, RUNLOG.md |
| D13 | A7 | 03, RUNLOG.md |

`node scripts/packet-check.mjs <id>` in S: **all 14 exit 0, ok:true**.

| Packet | node types | rel types | pairs | questions | fixtures |
|---|---|---|---|---|---|
| K | 11 | 13 | 32 | 35 | 6 |
| D1 | 4 | 6 | 7 | 33 | 5 |
| D2 | 5 | 6 | 10 | 34 | 5 |
| D3 | 8 | 14 | 31 | 32 | 3 |
| D4 | 7 | 13 | 17 | 35 | 7 |
| D5 | 6 | 6 | 8 | 34 | 4 |
| D6 | 6 | 9 | 11 | 37 | 7 |
| D7 | 4 | 7 | 9 | 33 | 6 |
| D8 | 6 | 11 | 29 | 33 | 6 |
| D9 | 3 | 8 | 9 | 36 | 6 |
| D10 | 3 | 6 | 9 | 36 | 5 |
| D11 | 1 | 0 | 0 | 30 | 5 |
| D12 | 3 | 4 | 8 | 34 | 5 |
| D13 | 2 | 5 | 7 | 33 | 5 |

## 2. Generators

All commands were run from the S root in Git Bash, with C:/ paths. Scratch: `$SP` = session scratchpad `refresh/`.

### 2a. Packet pattern lint (full suite, shared report)

```
node C:/…/S/schema/program/final/_work/lint-packet-patterns.mjs      → exit 0, 2m22s; wrote final/_work/pattern-lint.{json,md}
totals: 505 blocks · ok 387 · fragment 31 · gds-unvalidated 6 · packetBug 0 · rulingBroken 81 · cypher25 0 · selfCheckDiffs 0
per packet (failing = rulingBroken): K 7, D1 4, D2 2, D3 2, D4 0, D5 3, D6 6, D7 7, D8 6, D9 30, D10 3, D11 4, D12 3, D13 4
```

The first close-out lint (in the stage results) had 171 failing blocks: 113 packetBug and 58 rulingBroken. Of the 81 rulingBroken blocks left, 30 are D9 blocks whose packetBug fixes still carry F-05; all are kept unchanged as the packet record.

### 2b. Final-SDL pattern validators

```
node …/_work/validate-by-question.mjs   → exit 0; wrote _work/by-question/{D1,D2,D3,D5,D6,D7,D8,D9,D10,D13}.json (no --fill, no --ddl)
  66 sections: 65 ok, 1 gds-unvalidated (Q-D9-19), 0 failing · 77 statements: 75 EXPLAIN ok, 2 GDS calls
node …/_work/validate-patterns.mjs --doc …/final/query-patterns.md --ddl …/_work/patterns-ddl.cypher --report $SP/qp-report.md --json $SP/qp.json
  → ddlExecuted 278, failed 0; queryStatements 39, queryOk 39; gds sources 9/9, input queries 1/1; 19 GDS calls not run (Community)
```

There is no `patterns-by-question/` file for **K, D11 or D12**: their S-pattern stage produced nothing (stage result `final: {}`). D4 has no rulingBroken block.

### 2c. Questions catalog (`_work/questions-catalog.mjs`, extended)

- The fix stage's hard-coded `PATTERN_BROKEN` map is kept for the record (`PATTERN_BROKEN_FIX_STAGE`), but the script no longer reads it.
- Pattern status is now computed per (packet, id) from `_work/pattern-lint.json` and `_work/by-question/<P>.json`:
  - **final**: a rewrite in `patterns-by-question/<P>.md` that validated ok or gds-unvalidated. The row links to `final/patterns-by-question/<P>.md#<id>` (the slug of the `## <id>` heading, lower case) first in its pattern references, and the "pattern broken" marker is dropped.
  - **broken**: packetBug or rulingBroken with no validated rewrite.
  - **ok**: a lint block exists that is not broken.
  - **none**: no lint block.
- A new header line gives the counts of valid and broken patterns.
- First run read `q.status` (undefined) instead of the validator's `class` field, which gave 0 rewrites. Fixed; the second run is correct.
- Two runs produce byte-identical output: sha256 `6d0b5e2e…5b23f`.

```
distinct questions 454 (475 rows) · value-1 154 · harm 49.1% · D10 rows missing 0 · disagreements 17
valid pattern 440 / 454 · value 1 146 / 154 · questions with a validated final rewrite 63 · pattern broken 14 · no pattern 0
broken: Q-K-10 v1, Q-K-15 v1, Q-K-17 v1, Q-K-21 v1, Q-K-22 v1, Q-K-23 v2, CQ-AX-04 v2, CQ-PV-05 v2, Q-D11-05 v1, Q-D11-08 v2, Q-D11-19 v2, Q-D12-03 v1, Q-D12-06 v1, Q-D12-18 v2
```

CQ-PV-05 has a validated rewrite in D9.md, but the D11 row's block is broken and has no D11 rewrite.

### 2d. D10 answer-kind table (FU-05)

The catalog reads `packets/D10/answer-kind-table.md`. The S copy equals the A1 copy and is unchanged against 31390a6. The D10 owner's regeneration was byte-identical (`closeout-A1-D10.md`), so no separate final copy exists or was needed.

### 2e. Fixtures: README index sections (repath-fixtures.mjs NOT run)

- New `_work/fixtures-readme-index.mjs` (read-only over the fixtures) holds its own copy of the repath `index()` logic.
- It rewrites only these README sections: `## Index`, `## Relationship register check`, `## Intent validation`, `## Planner check`; it also writes `_work/register-fixture-check.json` (content unchanged).
- The header, "Renames applied" and the editors' residual table are kept byte for byte.
- `--check` mode: after the write, and again after my header edits, it reports `changed: false` (idempotent).

```
node …/_work/validate-intents.mjs   → final 77 intent files, zod 77/0, JSON Schema 77/0, proposals 1333 (packets 1318); wrote _work/intent-validation.json
NEO4J_URI=bolt://localhost:7691 NEO4J_USERNAME=neo4j NEO4J_PASSWORD=*** NEO4J_DATABASE=neo4j node …/_work/plan-candidate.mjs   (read transactions only; 0 nodes before and after)
  → pinned threw 76 / rejected 1; candidate rejected 65, threw 12 (fix stage 63/14); candidate+shims rejected 48, threw 15, partial 11, applicable 3 (fix stage 47/17/12/1)
node …/_work/fixtures-readme-index.mjs → fixtures 75, distinct question ids 297 (was 296), rel types named 106/106, register entries 109 all TYPE, violations 0
```

Index changes reflect the editors' work. Examples: elysium now names RENDITION_OF, predimed RENDITION_OF and REVISES, lesne DERIVED_FROM. In the planner table, INVALID_EDGE_PROPERTY went 21 → 2 and ASSERTION_REQUIRED (RENDITION_OF) 1 → 0.

Hard-rule note: `lint-fixtures.mjs` reads `repath-fixtures.mjs` as text and evaluates only its `RESIDUAL` array literal through `new Function`. The module is never imported or executed, so its repath code never runs. I kept using it on that basis.

### 2f. Predicate registry refresh and fixture lint

```
node …/_work/build-predicates.mjs --check → exit 1 (upToDate false: observed fixture uses / input digests stale after FU-03; 374 entries, statuses unchanged, problems [], nothing unresolved)
node …/_work/build-predicates.mjs         → exit 0; --check → exit 0. Diff: observed subject/object types, fixture uses and fixture lists; byKind relationship 102→101, literal 148→137, retired 41→53
node …/_work/lint-fixtures.mjs --out …/_work/fixture-lint.json   (the baseline _work/fixture-lint-baseline.json is kept as the before record)
  → 78 fixtures, 77 without errors, errors 2, warnings 153 (predicate-proposed 143, retired-name 10, relationship-pair 2)
```

- The 2 errors are D12 acrylamide QUALITY_RESULT_FOR QualityResult → Product in assertions.yaml and intent.json; this waits for the owner's OD-10 / R-95.
- The 10 retired-name warnings are 4 same-asserter supersedesUid uses (K seller, D10 mg-rankings ×2, D13 madrigal-pdufa) and 6 HAS_REVISION_STATUS uses that R-44 keeps (D3 resveratrol ×3, D13 lesne ×3).
- Baseline was 562 errors and 201 warnings.

### 2g. Tooling: action-space (TL-04)

- `final/tooling/action-space.yaml` is a byte copy of `packets/D11/tooling/action-space.yaml`, regenerated by the fixed D11 generator (copied at 02:54, before this run). It is 328,318 B; the hand-patched HEAD copy is 312,570 B.
- Node `yaml` parse of HEAD (hand patch) vs the new file, as sorted-key JSON: deep-equal true.
- PyYAML `safe_load` of the new file (python -I) succeeds and is deep-equal to the Node parse.
- `node packets/D11/_notes/action-space/build-action-space.mjs --check` in S: exit 0, no warnings, no unresolved populatedBy.

### 2h. FU-06 captureMethod (measured, not rewritten)

New `_work/lint-capture-methods.mjs` (read-only) scans 237 files and finds 579 values:

- 63 start with an action-space id (16 of 164 distinct values); 0 start with a packet-local alias; 516 are free text.
- Canonical by packet: D11 35/35, D6 20/48, D1 8/66, 0 elsewhere (cross-domain 0/83).

I did not rewrite them: there is no mechanical free-text → id map, and the values sit mostly in frozen locators.yaml files.

## 3. Re-measure (SDL unchanged)

```
sha256sum final/schema/final_biotech_schema_v2.graphql → c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793; git diff HEAD -- final/schema: none
node scripts/assemble-schema.mjs --out $SP/sdl/assembled.graphql → ok, modules 14, types 300; cmp → SDL-IDENTICAL; manifest (minus `out`) → MANIFEST-IDENTICAL
BKS_SCHEMA_PATH=…/final_biotech_schema_v2.graphql pnpm --filter @bks/graphql-api print-schema $SP/sdl/printed-deployed.graphql → "1743362 chars in 1s" (resolved path, no pinned fallback)
wc → 34492 lines, 1743672 bytes; '^input ' 960; '^type ' 524
node scripts/schema-size.mjs $SP/sdl/printed-deployed.graphql --ir …/final_biotech_schema_v2.ir.json --out $SP/sdl/size-deployed.md
  diff (from "## Headline", blank lines dropped) against size-report.md section A → SIZE-DEPLOYED-SAME
```

## 4. Documents

- `final/open-questions.md`: rows updated with evidence and status.
  - FU-03: narrowed; owner-gated and out-of-table items listed.
  - FU-04: narrowed to 14 questions; blocks and priority recomputed (P1).
  - FU-05: resolved-in-closeout.
  - FU-06: measured; still open.
  - FU-13 and MD-X-02: resolved-in-closeout.
  - TL-04: resolved-in-closeout, with the Python-client test still to add.
  - New row FU-14 (P2): residuals from the stage runlogs that no other entry carries.
  - A counts note says the build.mjs header counts are not recomputed.
  - Table check: every row has its header's cell count.
- `final/fixtures/README.md`:
  - The header now warns against re-running repath-fixtures and names the new section renderer.
  - "What the repath did not change" was updated.
  - The acceptance-gate paragraph was rewritten: the gate is not met, for owner-gated reasons only.
- `final/decision-report.md`: appended "## Close-out round". It adds no new ruling.

## 5. Fixture snapshot (after)

- Every fixture file has the same sha256 as before, except `fixtures/README.md` (index sections and header).
- `git status --short schema/program/final/fixtures` is identical to the before snapshot (155 lines).
- Disposable Neo4j after the run: 275 indexes and 0 nodes, as found.

## 6. Left for the coordinator

- No `patterns-by-question/{K,D11,D12}.md` exists, so 14 questions are still "pattern broken" (FU-04).
- Owner-gated items: OD-10 / R-95 (the 2 lint errors) and MD-X-03 (143 proposed predicates).
- The FU-03 out-of-table fixture items (open-questions FU-03).
- D12's new predicateOnly rows (HAS_ACTION_LEVEL, HAS_CLAIM_CONDITION) are in `packets/D12/05` but not in `_work/registers/` (merge-registers not re-run; FU-14 f).
- `00-SUMMARY.md` and `RUNLOG.md` were not updated by this role.
- Nothing was committed.
