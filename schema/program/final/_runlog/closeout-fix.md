# Close-out round: FIXER AND SUMMARY (S)

Date: 2026-10-09. Worktree: `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). This run resumes the close-out after the orchestrator crashed, and answers the ten verifier findings on the refresh stage (`closeout-refresh.md`).

Rules followed:
- The SDL is not edited: sha256 `c7cf1235…4793` before and after.
- `packets/` in S is not edited. Its copies were compared with the owner worktrees only.
- `_work/repath-fixtures.mjs` is not run.
- Nothing is committed, and no `.env` value is printed.
- Only the container `bks-neo4j-synth` (bolt://localhost:7691) is used. No volume was pruned, and the graph holds 0 nodes and 275 indexes, as found.

Paths are given from the S root in Git Bash, with C:/ paths passed to node and python. `$SP` is the session scratchpad `fix/` folder.

## 0. Verdict on the findings

| # | finding (severity) | result | section |
|---|---|---|---|
| 1 | 00-SUMMARY.md and RUNLOG.md describe the state before the close-out (major) | fixed: both updated with measured close-out numbers | 7, 8 |
| 2 | FU-04 not closed: no K / D11 / D12 rewrite file, 14 questions broken (major) | fixed for 12 questions. The 2 left (Q-D12-03, Q-D12-06) are gated by OD-10 / R-95, and a validated option-(a) draft is attached | 1 |
| 3 | owner worktrees hold uncommitted close-out edits (major) | confirmed, and handed to the coordinator: this role may not commit. S equals the owners' working trees | 5 |
| 4 | D10 mg-rankings FU-03 added label values with no locator (major) | fixed: 13 new JSON_POINTER locators, recorded under FU-03 | 3 |
| 5 | predicates.yaml stale (`--check` exit 1) (minor) | fixed: re-run as the last generator; `--check` exit 0 | 4 |
| 6 | mixed / CRLF line endings, so digests are of CRLF bytes (minor) | fixed: 13 files under `final/` normalized to LF (content-neutral against the index), then the generators re-run | 2 |
| 7 | readiness-scorecard input digests stale (minor) | fixed: re-rendered; `--check` "no drift" | 4 |
| 8 | full-suite fixture lint exits 0 with errors; the runlog called relationship-pair a warning (minor) | fixed: the script now exits 1 when errors remain. Wording corrected below and in FU-03 | 4 |
| 9 | K retracted-sah D5 target key not tracked (minor) | fixed: added to FU-03's owner-gated items (owner D5) | 6 |
| 10 | TL-04 overstated; MD-X-03 cites 133 (minor) | fixed: TL-04 marked narrowed (the Python-client test is not added); MD-X-03 now says 143 and why | 6 |

## 1. FU-04: final-SDL rewrites for K, D11 and D12

Inputs:
- `_work/pattern-lint.json`, failing blocks: K 7, D11 4, D12 3, all rulingBroken.
- The owners' fixed packet patterns: A1 `packets/K/03-retrieval-patterns.md`, A8 `packets/D11/03…`, A2 `packets/D12/03…`. Each equals S's copy (section 5).
- Rulings R-09, R-15, R-30, R-41, R-42, R-43, R-44, R-73, R-80, R-82 and R-95 (`decision-report.md`).
- The final IR, for the triples, edge-property types and enums checked by hand: RENDITION_OF Source → MediaWork | Publication; REVISES Publication → Publication with RevisionEdgeProperties; no AUTHORED_BY relationship type, so AUTHORED_BY is a D3 predicate; APPEARS_IN Person → MediaWork with `appearanceRole`; `CaptureOutcome` = PARTIAL | FAILED; QUALITY_RESULT_FOR QualityResult → Lot only.
- `vocabularies/predicates.yaml`: AUTHORED_BY, DISCLOSES_INTEREST, FUNDED_BY, HAS_REVISION_STATUS, RECORD_LAST_UPDATED, HAS_CLAIM_CONDITION and MEASURED_CONTENT_IN_PRODUCT are all registered.

Files written:
- `patterns-by-question/K.md`: Q-K-10 (two statements), Q-K-15, Q-K-17, Q-K-21, Q-K-22, Q-K-23 and CQ-AX-04.
- `patterns-by-question/D11.md`: Q-D11-05, Q-D11-08, Q-D11-19 and CQ-PV-05.
- `patterns-by-question/D12.md`: Q-D12-18, plus the non-question section `OD-10-option-a`. That section holds two statements, `Q-D12-03#option-a` and `Q-D12-06#option-a`. Its id is not a question id, so the catalog does not count it.

Each section names its rulings, what changed, how the question is answered now, the trace, the fixtures and the episodes. Nothing is lost to a ruling. Two narrowings are recorded:
- CQ-PV-05 groups registry and label renditions through the evidence of assertions about the record holder. The SDL has no typed grouping for them (FU-14 i).
- Q-D12-18 binds the claim condition by a parameter, because HAS_CLAIM_CONDITION is a literal predicate (FU-14 j).

```
node C:/…/S/schema/program/final/_work/validate-by-question.mjs --packets K --out $SP     (iterations)
  first K run: Q-K-15 pair finding (Person)-[:APPEARS_IN]->(Person|Organization): `who` was typed by a later `who:Person` test → rewrote as (person:Person)-[ap:APPEARS_IN]->(mw:MediaWork) WHERE mw = who → 7/7 ok
node …/validate-by-question.mjs --packets D11 --out $SP
  first run: Q-D11-05 EXPLAIN error "Aggregation column contains implicit grouping expressions" (collect(...) + [flagged]) → split into two WITHs → 4/4 ok
node …/validate-by-question.mjs --packets D12 --out $SP
  first run: Q-D12-06#option-a pair finding (Product)<-[:HAS_VARIANT]-(Product) (p typed by `p:Product`) → (pv:ProductVariant)<-[:HAS_VARIANT]-(vp:Product) WHERE pv = p → 2/2 ok
```

Runtime smoke test. EXPLAIN plans a query but cannot catch runtime errors, so `$SP/smoke.mjs` ran a second check:
- It seeds a 43-node synthetic graph in one transaction, runs all 15 new statements with typed parameters, and rolls back.
- First run: Q-D11-05 was cut at a comment line ending in `;` by the smoke splitter. The validator ignores comment lines, but the comment was reworded anyway.
- Q-K-17 returned `compromised: null` for an uncompromised LOCATOR row: `null IN [...]` is null. Fixed with `coalesce(…, false)` and noted in K.md.
- Null maps were dropped from the hazard and referenceLevels lists of the D12 drafts.
- Final run (`$SP/smoke-out.txt`): 15 statements, **0 runtime errors**, every statement returned rows on the seeded data except Q-K-10#2 (no newer capture seeded). Nodes before 0, after 0 (rolled back).

```
node …/validate-by-question.mjs --packets K,D11,D12 --fill     → exit 0
  K: 7 questions ok, 8 statements EXPLAIN ok, 0 static findings
  D11: 4 ok, 4 statements ok; D12: 2 sections ok (Q-D12-18, OD-10-option-a), 3 statements ok
  plan flags: AllNodesScan on Q-K-23 and CQ-AX-04 (the dynamic-label uid lookup `MATCH (x:$($label) {uid: $uid})`; recorded in K.md and FU-14 h)
node …/validate-by-question.mjs                                → exit 0 (all 13 files; rewrites _work/by-question/*.json)
  sections 79 (D1 4, D10 3, D11 4, D12 2, D13 4, D2 2, D3 2, D5 3, D6 6, D7 7, D8 6, D9 29, K 7): 78 ok, 1 gds-unvalidated (Q-D9-19), 0 failing
  statements 92: 90 EXPLAIN ok, 2 GDS calls; static findings 0
```

## 2. Line endings (finding 6)

The Python byte scan of `schema/program/final`, `packets`, `scripts` and `packages` found CRLF only in 13 files under `final/`. All were rewritten with `\r\n → \n`:

| file | sha256 before → after (12 hex) |
|---|---|
| decision-report.md | 1277a88c915b → dbdbcbeaf651 (then the close-out section edit in §6) |
| query-patterns.md | 0a78eb95f61e → e76e82642b7c |
| RUNLOG.md | 04aac5af8ceb → 05d3556740e8 (then §8) |
| vocabularies/answer-kinds.yaml, goal-polarity.yaml, verdict-lattice.yaml | 238b0d144dcb → 616e1c642f89; 64ed765bd292 → 1c0eaf27791c; 7e868b60d026 → 2641fb13db4e |
| _runlog/questions.md | d154edbac648 → d0176b951d6a |
| _work/build-predicates.mjs, lint-fixtures.mjs, planner-probe-v2.mjs, rel-values.mjs | 122e9feadb7c → bb303e3b38b0; 2829c2c06f83 → f51412a02e6c; cc1dad595bb6 → 1dbf085b84ca; 070d0d513e42 → 97816bc8fb8a |
| _work/registers/D10.seams.yaml, D5.seams.yaml | bfd93ac07afc → 873539459268; 22bbf93cdb9d → b14d13bbf18b |

`git ls-files --eol` shows `i/lf w/lf` afterwards. `git diff --numstat` is empty for every tracked file in the list except decision-report.md (+11, the close-out section). So the normalization changed no content git stores. The digests the generators record now equal those of a clean LF checkout.

## 3. D10 mg-rankings-criteria-comparison locators (finding 4, FU-03)

- The verifier's evidence was confirmed. The three captures `scratchpad/ft/D10/fixtures/fresh/dsld-label-{173951,242510,271329}.json` are this session's scratch. Their sha256 equals each snapshot's `contentHash` in locators.yaml (ab3e2f3c…, 561e4123…, 9b1e143d…).
- The captures hold every new value: productVersionCode, netContents[0], servingsPerContainer ("30", null for 242510, "100"), upcSku and entryDate.
- The new locators were written by `$SP/add_dsld_locators.py` (`python -I`). It uses the fixtures-stage generator's method (`ft/D10/fixtures/tools/gen_locators.py`): code-point offsets, prefix and suffix of 32, quoteHash = sha256 of the exact text.
- Self-check: it regenerated loc-dsld-slowmag-serving and loc-dsld-nm250-form byte-equal.
- It appended **13 new JSON_POINTER locators**, after asserting that the 29 existing records are unchanged:

```
loc-dsld-slowmag-version-code /productVersionCode "productVersionCode":"302598-0F" 202-234
loc-dsld-slowmag-net-contents /netContents/0 887-956 · -servings-per-container 259-286 · -entry-date 8554-8578
loc-dsld-nb500-version-code 196-261 · -net-contents 1340-1425 · -upc 169-195 · -entry-date 6399-6423   (no servingsPerContainer in the capture)
loc-dsld-nm250-version-code 192-249 · -net-contents 1371-1442 · -servings-per-container 313-341 · -upc 165-191 · -entry-date 5949-5973
```

- `$SP/wire_dsld_locators.py` added the same 13 records to the intent's source locator tables. It also added them to the evidence of the `s-*-package` (net contents, UPC) and `p-a-dsld-*-label-version` (version code, servings per container, entry date) proposals. The intent was re-dumped byte-compatibly (`indent=1, ensure_ascii=False`).
- In assertions.yaml, the three Package notes, the three LabelVersion notes and the three HAS_LABEL_VERSION rows now cite the locators instead of "read from the snapshot bytes; no locator cut". No value changed.
- `fixtures/README.md` residual-table row D10/mg-rankings records the fix. `fixtures-readme-index.mjs --check` stays `changed: false`.

```
node …/_work/lint-fixtures.mjs --fixture D10/mg-rankings-criteria-comparison → exit 0, errors 0, warnings 16 (14 predicate-proposed, 2 retired-name; as before)
node …/_work/validate-intents.mjs → final 77 files, zod 77/0, JSON Schema 77/0, proposals 1333
NEO4J_URI=bolt://localhost:7691 NEO4J_USERNAME=neo4j NEO4J_PASSWORD=*** NEO4J_DATABASE=neo4j node …/_work/plan-candidate.mjs
  → pinned threw 76 / rejected 1; candidate rejected 65, threw 12; candidate+shims rejected 48, threw 15, partial 11, applicable 3 (= refresh)
node …/_work/fixtures-readme-index.mjs → fixtures 75, distinct question ids 297, violations 0; --check changed: false
```

## 4. Generators (findings 5, 7 and 8), in dependency order

`lint-fixtures.mjs` CLI change. The full suite now ends with `process.exit(res.summary.errors ? 1 : 0)`, and the header documents the exit code. Before this, only `--fixture` mode exited non-zero.

Note on the refresh runlog §2f wording: `byCategory` mixes severities. `relationship-pair` 2 are the **errors**, and `predicate-proposed` 143 plus `retired-name` 10 are the **153 warnings**.

```
node …/_work/questions-catalog.mjs (twice) → sha256 59021eca…55c0 both runs (after the decision-report edit of §6)
  valid pattern 452 / 454 · value 1 152 / 154 · validated final rewrites 74 questions · pattern broken 2 (Q-D12-03 v1, Q-D12-06 v1) · no pattern 0
node …/_work/build-predicates.mjs --check → exit 1 (stale: decision-report, questions-catalog, fixtures digests)
node …/_work/build-predicates.mjs → exit 0; --check → exit 0, upToDate true. 374 entries (registered 286, alias-of 37, retired-by 16, proposed-new 35); records decision-report dbdbcbea… then fd7731b5…, questions-catalog 59021eca…
node …/_work/lint-fixtures.mjs --out …/_work/fixture-lint.json → exit 1 (new behaviour)
  78 fixtures, 77 without errors, errors 2 (relationship-pair: D12 acrylamide QUALITY_RESULT_FOR QualityResult→Product, assertions.yaml + intent.json),
  warnings 153 (predicate-proposed 143, retired-name 10); predicatesYamlSha256 21b0412b… = the file
node …/_work/build-tooling-scorecard.mjs --check → exit 1; build → ok; --check → "no drift", exit 0
  Inputs line now: action-space f891cf00…, relationship-register 1db01e03…, decision-report fd7731b5…
node …/_work/validate-patterns.mjs --doc …/final/query-patterns.md --ddl …/_work/patterns-ddl.cypher --report $SP/qp-report.md --json $SP/qp.json
  → ddlExecuted 278, failed 0; indexes 280/280 online; queryStatements 39, queryOk 39; gds sources 9/9, input 1/1; 19 gds calls not run
```

Final re-check after every edit: the catalog sha is unchanged on re-run; `build-predicates --check` upToDate true; scorecard "no drift"; README `changed: false`.

## 5. Owner worktrees (finding 3): handed to the coordinator

`diff -rq --strip-trailing-cr -x __pycache__ <owner>/schema/program/packets/<P> S/schema/program/packets/<P>` gives **0 diffs for all 14 packets**. The owners' uncommitted edits are all inside their own packets, 48 files in total:

| worktree | branch @ head | modified files |
|---|---|---|
| A1 | ft/schema-A1 @ 7aaeb2f | 4: K/03, K/RUNLOG, D10/03, D10/RUNLOG |
| A2 | ft/schema-A2 @ 6635197 | 10: D1/03, 05, 07-fixtures/nr-trial-unstructured/assertions.yaml, 11, RUNLOG; D12/03, 05, 10, 11, RUNLOG |
| A3 | ft/schema-A3 @ f4fb477 | 6: D2/03, 10, 11, RUNLOG; D4/03, RUNLOG |
| A4 | ft/schema-A4 @ 44b87ff | 2: D3/03, RUNLOG |
| A5 | ft/schema-A5 @ 53b6a9f | 5: D5/02, 03, 10, 11, RUNLOG |
| A6 | ft/schema-A6 @ 2ca247a | 6: D6/03, 10, 11, RUNLOG; D7/03, RUNLOG |
| A7 | ft/schema-A7 @ 10ef1ea | 4: D8/03, RUNLOG; D13/03, RUNLOG |
| A8 | ft/schema-A8 @ 5b9788a | 11: D9/03, RUNLOG; D11/03, 05, 06, 07-fixtures/capture-failures-coverage/assertions.yaml, 09, RUNLOG, _notes/action-space/build-action-space.mjs, identifier-bridges.yaml, tooling/action-space.yaml |

This role may not commit. For the coordinator, before cleanup:
- Commit each owner's edits on its `ft/schema-A*` branch. Every changed file is inside that owner's own packets.
- Then merge. Because S's copies equal the working trees, the A* commits and S's `packets/` will not conflict on content. `.gitattributes` `* text=auto eol=lf` normalizes the owners' CRLF working copies on commit.
- Do not run `git worktree remove --force` on a dirty worktree. Without a commit, S's copies are the only record of the owner edits.

## 6. Documents

- `open-questions.md` (rows checked: each still has 10 cells):
  - Header close-out note extended.
  - FU-03: (i) the D10 locators, (ii) the owner-gated D5 target key `target:subarachnoid-hemorrhage-prognosis` (K `retracted-sah-2017-stale-evidence`, status PROPOSED, absent from targets.yaml 0.2.2), (iii) the lint exit code and severity wording. Owner column now "owner (fixtures stage) with D5, D12".
  - FU-04: narrowed to Q-D12-03 and Q-D12-06 (P1, blocked by OD-10 / R-95), with the validator and catalog numbers.
  - MD-X-03: 133 → 143 and why (MAX_DAILY_SERVINGS +6, STATES_METHOD_CAVEAT +2, INPUT_FEATURE_COUNT +1, INPUT_PLATFORMS +1).
  - TL-04: status "open, narrowed in close-out" (the Python-client `yaml.safe_load` test is not added; adding a test to the product client is outside this round).
  - FU-14: items (h) dynamic-label AllNodesScan, (i) no typed rendition grouping for registry records and drug labels, (j) Q-D12-18 condition binding.
- `decision-report.md` "Close-out round": the Patterns bullet now gives 13 packets, 79 sections, 90 of 92 EXPLAIN ok, 452 / 454 and 152 / 154, and the 2 owner-gated questions. A "Close-out fix" bullet was added. No ruling changed.
- `fixtures/README.md`: residual-table row D10/mg-rankings, the locator fix.

## 6a. SDL re-measure (unchanged)

```
sha256sum final/schema/final_biotech_schema_v2.graphql → c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793; git diff HEAD -- final/schema: empty
node scripts/assemble-schema.mjs --out $SP/sdl/assembled.graphql → modules 14, types 300; cmp → SDL-IDENTICAL
BKS_SCHEMA_PATH=…/final_biotech_schema_v2.graphql pnpm --filter @bks/graphql-api print-schema $SP/sdl/printed.graphql → 1743362 chars
wc → 34492 lines, 1743672 bytes; '^input ' 960; '^type ' 524
node scripts/schema-size.mjs $SP/sdl/printed.graphql --ir …/final_biotech_schema_v2.ir.json → node types 69, SDL from→to pairs 848, Mutation fields 0, input types 960
IR: nodes 69, relationshipTypes 106
```

Build and wall times were not re-measured; 00-SUMMARY keeps finalize §3's values and says so.

## 7. 00-SUMMARY.md

The structure and measured headline are kept. Changes:
- A **close-out status** line was added under the headline.
- A re-confirmation paragraph cites §6a.
- §5 was rewritten around fixture lint and the FU-03 gate, query patterns, packet patterns and rewrites, and packet-check.
- §6 risk 4 now covers the owner-gated lint errors, MD-X-03 and the uncommitted owner edits.
- §7 has new close-out items: R-95 / OD-10 scope, FU-14 (i), the D5 target key, MD-X-03 and the coordinator commit.
- §8 now covers fixtures, pattern rewrites, TL-04 narrowed, file hygiene and commit.

## 8. RUNLOG.md

The close-out runlogs (`_runlog/closeout-*.md`, this one included, 56 files) are appended under a "Close-out round" header in a fixed order: the pattern lint, the predicate registry, the packet owners, the S pattern writers, the fixture editors, the refresh, and this file last.

## 9. Left open (all outside this round's authority)

- OD-10 / R-95: owner decision. It covers the 2 lint errors and Q-D12-03 / Q-D12-06.
- FU-03 owner-gated items: the D5 target key, the D11 SPL_SET_ID shared identifier and the other out-of-table items listed there.
- MD-X-03: 143 proposed-new predicate uses.
- TL-04: the Python-client test.
- FU-14 (a)–(j).
- The owner worktree commits (section 5).
- D12's predicateOnly rows are still not in `_work/registers/`, and merge-registers was not re-run (FU-14 f).
- The `open-questions.md` header counts from build.mjs are not recomputed.
