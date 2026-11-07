# Schema candidate v2: summary

S team finalizer, 2026-10-09; updated by the close-out round the same day (`_runlog/closeout-refresh.md`, `_runlog/closeout-fix.md`). **This is a candidate, not a final schema.** Nothing here is accepted until the owner accepts it on the measurements and the fixtures. Every number below comes from `size-report.md`, from a command in `_runlog/finalize.md` (re-run on the same SDL) or from a close-out runlog, and its source is named. Research only, not medical advice.

**Headline:** Candidate v2 (SDL sha256 c7cf1235…4793): 69 node types · 106 relationship types · 848 from→to pairs expanded (181 collapsed) · widest union 5 · 960 input types · 1.74 MB · build 1.71 s in-process, 5.03 s deployed wall time. Budget: ≤ 90 · ≤ 160 · ≤ 600 · ≤ 6 · ≤ 4,000 · ≤ 6 MB · < 5 s. Pinned proposal: 192 · 393 · 3,940 · 144 · 38,034 · 57.9 MB · 25.66 s.

**Close-out status (2026-10-09):** SDL unchanged (sha256 c7cf1235…4793; re-assembled byte-identical; printed 1,743,672 B, 34,492 lines, 960 input types) · fixture lint 78 fixtures, 77 without errors, 2 errors / 153 warnings (baseline 562 / 201) · intents 77 / 77 valid · questions with a valid pattern 452 / 454 (value 1: 152 / 154) · final-SDL pattern rewrites 79 sections, 0 failing, 90 of 92 statements EXPLAIN ok + 2 GDS · `query-patterns.md` 39 / 39 EXPLAIN ok · planner: candidate 0 applicable, with shims 3 applicable and 11 partial · what is left for acceptance is owner-gated: OD-10 / R-95 (the 2 lint errors and the 2 broken questions), plus the decisions in section 7.

**Verdict.** The candidate passes every budget line except two:
- **Pairs.** It fails the directive's pair metric: 848 expanded pairs against ≤ 600, over by 248. It passes only if the owner adopts the collapsed count (R-01 option A: 181).
- **Wall time.** The deployed `print-schema` wall time is at the 5 s line. Today's three runs were all over it (5.01, 5.09, 5.03 s). The fix stage measured 4.97, 4.98 and 5.14 s. The in-process build is far under it.

## 1. What the candidate is

One assembled GraphQL SDL, `schema/final_biotech_schema_v2.graphql`:
- **Size.** 387,615 B, 7,295 lines, 300 definitions, 14 modules.
- **Reproducible.** `node scripts/assemble-schema.mjs` re-assembles it byte for byte, and the manifest is unchanged (finalize §1).
- **Modules.** A kernel (K) plus 13 domain modules (D1–D13). Each module file is in `schema/` with its fragment banner.

**The kernel pattern.**
- **Subjectable.** Every domain entity implements the `Subjectable` interface (56 implementers) and carries the `Entity` label.
- **Facts.** A fact is an `Assertion` with one subject and one object (HAS_SUBJECT / HAS_OBJECT to Subjectable).
- **Evidence.** An Assertion has one asserter (ASSERTED_BY) and evidence through HAS_EVIDENCE to a `SourceLocator` on a captured `SourceSnapshot`.
- **Verdicts.** verification.v1 verdicts are recorded as `Adjudication` nodes.
- **Lineage.** `Activity` is the only lineage node, one per Mission Control run.

**Typed relationships.** A relationship gets a type only when a question traverses it: 106 types. The merged register also carries 203 predicate-only relations, which are `Assertion.predicate` values (`merge-registers` output, `_runlog/fix.md` §3).

**Writes.** The GraphQL API has 0 Mutation fields. All writes go through the kg-ops executor.

**Questions.** 454 distinct questions: 154 value-1, harm share 49.1% (`questions-catalog.md`).

## 2. Headline numbers

| measure | candidate v2 (deployed options) | budget | status | pinned proposal | source |
| --- | ---: | ---: | --- | ---: | --- |
| node types | 69 | ≤ 90 | pass | 192 | finalize §2 (`count-schema`, `map`); pinned: finalize §5 |
| relationship types | 106 | ≤ 160 | pass | 393 | same |
| from→to pairs, expanded (the method that reproduces the directive's 3,940) | **848** | ≤ 600 | **fail, +248** | 3,940 | same |
| from→to pairs, collapsed (R-01 A) | 181 | ≤ 600 if the owner adopts A | pass under A | 3,883 | same |
| widest union used as a target | 5 (AdministeredMaterial) | ≤ 6 | pass | 144 (AssertionSubjectTarget) | same. Interface targets are not unions: Entity (69 implementers, 1 field) and Subjectable (56 implementers, 11 fields); see R-96 |
| executable input types | 960 | ≤ 4,000 | pass | 38,034 | finalize §3, §5 (`grep -c '^input '`) |
| executable size | 1,743,672 B (1.74 MB) | ≤ 6 MB | pass | 57,908,325 B (57.9 MB) | finalize §3, §5 (`wc -c`) |
| build, in-process (construct + print), median of 3 | 1.71 s (runs 1.91, 1.46, 1.71) | < 5 s | pass | 25.66 s (runs 30.19, 25.10, 25.66) | finalize §3, §5. `size-report.md`: 1.46 s and 24.65 s |
| deployed recipe wall time (`pnpm … print-schema`), median of 3 | 5.03 s (runs 5.01, 5.09, 5.03) | < 5 s if the budget means wall time | **over the line today** | not measured | finalize §3. `size-report.md`: 4.98 s (4.98, 4.97, 5.14) |

**Re-confirmed in the close-out fix** (`_runlog/closeout-fix.md` §6): `sha256sum` gives c7cf1235…4793; `scripts/assemble-schema.mjs` output is byte-identical; `print-schema` gives 1,743,672 B, 34,492 lines, 960 `input` and 524 `type` definitions; `scripts/schema-size.mjs` on that print gives 69 node types, 848 SDL from→to pairs and 0 Mutation fields; the IR has 106 relationship types. The build and wall times were not re-measured.

**Same SDL, same artifacts.** Re-measuring changed no structural number:
- The SDL, the manifest and `schema-map.md` are byte-identical.
- The IR differs only in `parsedAt`.
- The deployed print is byte-identical to the fix stage's print, and the `schema-size.mjs` output is identical apart from its path line.

**L3 server flags.** With the five `excludeDeprecatedFields` flags (an owner lever, R-02), the print is 732,065 B and builds in 1.09 s, median of 3. Input types are unchanged at 960 (finalize §3).

**R-01 option-B cuts** (`size-report.md`, measured in memory, none applied):

| cut | expanded pairs |
| --- | ---: |
| drop the inverse `Activity.generated` | 783 |
| also retarget STEP_USES to a 6-member union | 733 |
| also remove Subjectable from 14 record types | 593 |

The last cut needs the R-18 removal pass, which no module has run (FU-12).

**Against the pinned proposal** (from the table above; same deltas as `size-report.md`): −64% node types, −73% relationship types, −78% expanded pairs, −97.5% input types, −97.0% bytes.

## 3. The ten most important design decisions

1. **Interface instead of any-entity unions.** Assertion, Assessment, Report, Identifier and MENTIONS target `Subjectable`. This takes the widest union from 144 to 5. Two domain exceptions are registered, STEP_USES and ASSOCIATES (R-28). Whether interface targets satisfy directive rule 1 is owner decision R-96.
2. **No GraphQL aggregation or mutations.** L1 `@filterable(byAggregate: false)` and L2 `@mutation(operations: [])`. Writes go through the executor, and structural edges to foreign records are `[CONNECT]` (R-02, R-03). This is most of the 38,034 → 960 input-type cut.
3. **One lineage spine.**
   - One Activity per Mission Control run.
   - WAS_GENERATED_BY is written on create and on update.
   - WAS_INFORMED_BY is the only chaining edge.
   - `lastWriterRunId` replaces `mongoResearchRunId` (R-13; directive section 4).
4. **The claim loop.**
   - An EVIDENCE_MISSION Activity ASSESSES exactly one Claim.
   - The evidence Report is WAS_GENERATED_BY the mission (R-12).
   - A claim occurrence is an `Assertion {assertionKind: CLAIM}` with no extra label (F-05; directive 3.4).
5. **One DERIVED_FROM** replaces the four pinned citation types (R-11). Supersession is same-asserter only (R-23).
6. **Node properties are caches of FIELD Assertions.** Each has a registered field predicate, a locator and an asserter (R-14, R-45). Versioned states use asserted episodes, and exclusivity is a register flag (R-10).
7. **MENTIONS is a derived, method-versioned projection.**
   - It is never evidence, and the kernel `Mention` node is cut (R-27, R-09).
   - Support and contradiction are Adjudications over located evidence, never document → entity edges (directive 3.8).
8. **Product vs FoodItem.** Anything an organization sells is a D6 Product with a LabelVersion. Reference foods are D12 FoodItem. The two meet only through HAS_REFERENCE_FOOD and are never merged (R-62, R-63, R-64).
9. **Association, insight and report stay distinct.**
   - Scores live on D10 Association records under a method version. AFFECTS_MECHANISM carries no score (R-47, R-48).
   - Discourse metrics are projection-cache properties (R-49).
   - A read is materialized only on measured latency (R-50).
10. **Goals and recommendations are assertions, not edges.**
    - Goal links are predicate-only Assertions with a `Target` object (D5 vocabulary).
    - A recommendation is a claim occurrence with predicate RECOMMENDS_USE or RECOMMENDS_AGAINST. There is no stored RECOMMENDS edge (R-83).
    - Frontiers attach only to Event and Study (R-91).

## 4. Directive traceability (00-DIRECTIVE 3.1–3.10 and section 4)

| item | where it lives in the candidate | pattern | fixtures | what is open |
| --- | --- | --- | --- | --- |
| 3.1 targets | D5 `Target` + `vocabularies/targets.yaml`; goal predicates with a Target object; OPERATIONALIZED_BY → TargetMeasure (R-70) | P-06 | D5 `sleep-toolkit-unstructured`; xfx compound-profile | RQ-01 (Condition member unfixtured) |
| 3.2 harm | no good/bad property anywhere; 223 of 454 questions are harm (49.1%) | P-07 | 20 fixtures of kind harm, 16 disconfirmation | R-95 (acr-03) |
| 3.3 food | D12 FoodItem, FoodCategory, DietaryPattern; R-62 to R-64 | P-06, P-07 | 5 D12 fixtures (e.g. `mcdonalds-fries-prepared-food`) | R-95, FX-07 |
| 3.4 claim lifecycle | Claim, Assertion{CLAIM}, vetting Assessment, EVIDENCE_MISSION Activity, Report; `vocabularies/claim-lifecycle.yaml` | P-11 | K `resveratrol-sirt1-evidence-mission`; xfx claim-mission-report | OD-06 (R-12 confirm) |
| 3.5 ranking | computed, then a published Report / ReportItem; DecisionCriterion versions | P-05 | D10 `mg-rankings-criteria-comparison`; xfx product-comparison | OD-23 latency test |
| 3.6 association / insight / report | D10 Association (derived), Assessment, Report | P-05, P-13 (GDS) | D10 `opentargets-association-signal` | GDS not run (OD-22) |
| 3.7 frontiers | D13 Frontier, Event; ON_FRONTIER; LEADS_TO / RESPONDS_TO gated by a SUPPORT adjudication (R-22) | P-08 | 5 D13 fixtures (Madrigal chain, `lesne-2006-retraction`) | RQ-04, FU-11, OD-41 |
| 3.8 unstructured → entity | Chunk → MENTIONS (derived); SourceLocator on SourceSnapshot; HAS_EVIDENCE | P-04 | 14 fixtures of kind unstructured-to-entity (every domain) | FU-03 |
| 3.9 recommendations | claim occurrence RECOMMENDS_USE / AGAINST; financial interest through D7 | P-09 | D9 `sinclair-recommendation-disclosure-asof` | FX-07 |
| 3.10 verification | Adjudication + `vocabularies/verdict-lattice.yaml`; one asserter and one locator per assertion | P-01 | every fixture; xfx re-selection checks (0 mismatches in all three, their runlogs) | OD-08 (R-36) |
| 4 mission lineage | Activity (missionId, runId, kind), WAS_GENERATED_BY, WAS_INFORMED_BY, `lastWriterRunId` on 97 edge types | P-10a–e | K `two-run-lineage`; xfx claim-mission-report | OD-07, OD-09 (contracts v2), planner |

## 5. Fixtures and query-pattern validation

**Packet fixtures** (`fixtures/README.md`, re-rendered today):
- 75 packet fixtures (388 files) are re-pathed under `fixtures/<packet>/`.
- The relationship-register check is TYPE for 109 of 109 entries, with 0 violations.
- 77 of 77 intents are structurally valid (zod and JSON Schema).

**Cross-domain fixtures.** Three, under `fixtures/cross-domain/`, each with a `walk.md` run on the disposable Neo4j (graph sizes from their runlogs):

| fixture | packets | nodes | relationships |
| --- | --- | ---: | ---: |
| compound-profile | D1+D2+D3+D6 | 370 | 1,203 |
| product-comparison | D6+D1+D8 | 327 | 1,020 |
| claim-mission-report | D9+K+D10 | 203 | 744 |

**Fixture lint and the FU-03 gate** (`_work/lint-fixtures.mjs`, `_work/fixture-lint.json`; `_runlog/closeout-refresh.md` §2f, `closeout-fix.md` §4):
- The fixture editors applied every row of the README residual table (61 rows, all marked applied). No source.md quote was changed. The close-out fix added 13 JSON_POINTER locators to D10 `mg-rankings-criteria-comparison` for label values that had no locator.
- 78 fixtures (75 packet + 3 cross-domain): 77 without an error, **2 errors and 153 warnings** (baseline 562 errors, 201 warnings). The full-suite lint now exits 1 while errors remain.
- The 2 errors are D12 `acrylamide-fried-potato-harm` acr-03 (assertions.yaml and intent.json): QUALITY_RESULT_FOR QualityResult → Product, the pair R-73 cut. They wait for OD-10 / R-95.
- The warnings are 143 predicate-proposed names (registrars to accept, MD-X-03) and 10 retired names checked as legitimate (4 same-asserter supersedesUid, 6 HAS_REVISION_STATUS flags R-44 keeps).
- **Gate FU-03: not passed, for owner-gated reasons only**: OD-10 / R-95, the D5 target key `target:subarachnoid-hemorrhage-prognosis` minted by K `retracted-sah-2017-stale-evidence`, and the out-of-table items listed in FU-03 (among them the D11 SPL_SET_ID shared identifier).
- **Planner check** (`_work/plan-candidate.mjs`, re-run in the close-out fix on an empty graph): candidate rejected 65, threw 12, 0 applicable; candidate with shims rejected 48, threw 15, partial 11, applicable 3. Planning needs the executor changes in the README "Planner check".

**Query patterns** (`query-patterns.md`, re-validated in the close-out fix on Neo4j 5.26.31 Community, `_work/validate-patterns.mjs`):
- 39 of 39 query statements pass EXPLAIN.
- 278 DDL statements were executed, 0 failed, and 280 of 280 indexes came online.
- 9 of 9 GDS projection source queries and 1 of 1 input query pass EXPLAIN.
- 19 `CALL gds.*` statements were not run: there is no GDS on the instance.

**Packet patterns and their final-SDL rewrites (FU-04).**
- Pattern lint over the owner worktrees (`_work/lint-packet-patterns.mjs`, `closeout-refresh.md` §2a): 505 blocks, 387 ok, 31 fragment, 6 gds-unvalidated, 0 packetBug, 0 `CYPHER 25`, 81 rulingBroken. The first close-out lint had 171 failing. The 81 rulingBroken blocks are kept as the packet record.
- Final-SDL rewrites in `patterns-by-question/` for 13 packets (`_work/validate-by-question.mjs`): 79 sections, 78 ok and 1 gds-unvalidated (Q-D9-19), 0 failing; 92 statements, 90 EXPLAIN ok and 2 GDS calls; 0 static findings. K, D11 and D12 were written in the close-out fix. Their 15 new statements also ran on a synthetic graph in a rolled-back transaction with 0 runtime errors.
- Questions catalog: **452 of 454 questions have a valid pattern (value 1: 152 of 154)**; 74 use a validated final-SDL rewrite. The 2 left, Q-D12-03 and Q-D12-06 (value 1), read the cut pair and wait for OD-10 / R-95. `patterns-by-question/D12.md` section `OD-10-option-a` validates what they would read under option (a), which needs no SDL change.

**Packet-check.** All 14 packets pass: exit 0, 0 errors (`closeout-refresh.md` §1; the S copies equal the owners' working trees, `closeout-fix.md` §5).

## 6. Risks

1. **The pair metric.** On the expanded count the candidate is over budget. Cut 3 is a modeling pass, R-18, and no module has run it. If the owner rules expanded and R-18 finds fewer than 14 removable implementers, the next cuts cost value-1 questions (Q-K-04, Q-K-05, Q-K-07).
2. **Build time.** The wall-time build sits at 5 s, and pnpm and Node start-up dominate it. The in-process build is 1.71 s.
3. **The executor cannot use the candidate yet.**
   - The CLI loads the pinned workspace.
   - The sidecars fail on v2 with 264 errors (FU-09).
   - There are no v2 validation params (FU-08), so the IR misclassifies 3 relationship types.
   - There is no v2 operations file (FU-07).
   - Intent contract v1 cannot write Claim, Assessment, Adjudication or Report records (OD-09).
4. **The fixtures are not acceptance evidence yet.**
   - 2 lint errors remain, both owner-gated (OD-10 / R-95).
   - 143 fixture predicate uses are proposed-new names that their registrars have not accepted (MD-X-03). The 9 unregistered predicates of FU-13 are resolved.
   - Duplicate Identifier keys appear when packet and cross-domain fixtures share a graph (query-patterns Q-7).
   - The owner worktrees (`ft/schema-A1` … `-A8`) hold the packet close-out edits uncommitted: 48 modified files, all inside each owner's own packets. S's `packets/` copies equal those working trees (0 content diffs). If the worktrees are removed before the edits are committed, S's copies become the only record (`closeout-fix.md` §5).
5. **Interface targets.** If the owner reads rule 1 strictly (R-96), `Activity.generated` and the two Subjectable domain edges must go.
6. **GraphQL ergonomics.** Compound-first reads must be written owner-first with nested `some` filters, because there are no inverse fields (`_runlog/xfx-compound.md` finding 1).

## 7. What the owner must decide

`open-questions.md` section 1 lists 46 owner decisions. Five of them gate acceptance:
- **OD-01 / R-01:** collapsed or expanded pairs.
- **OD-02 / R-02:** ratify L1 and L2; adopt L3 or the server flags.
- **OD-09 / R-40:** contracts v2, and who builds it.
- **OD-43:** the live-data migration of the pinned graph.
- **OD-44:** the embedding model and its dimension.

Raised by the fix stage:
- **R-95 / OD-10:** acr-03, QualityResult → Product.
- **R-96 / OD-45:** interface targets and rule 1.
- **R-97 / OD-46:** K at 15 relationship types against 14 under R-01 A.
- **R-98 / OD-11:** the scope of R-14 for versioned-state payloads.

Raised or sharpened by the close-out round (`open-questions.md`, `_runlog/closeout-fix.md`):
- **R-95 / OD-10** now gates the last 2 fixture-lint errors and the last 2 questions with a broken pattern (Q-D12-03, Q-D12-06). Option (a) is drafted and validated; option (b) changes the SDL.
- **FU-14 (i):** the SDL has no typed rendition grouping for registry records and drug labels. D11 CQ-PV-05 works around it through assertion evidence; a typed edge would be an SDL change.
- **D5 target key** `target:subarachnoid-hemorrhage-prognosis` (FU-03): add it to `vocabularies/targets.yaml` or name an existing key.
- **MD-X-03:** each registrar accepts, renames or rejects its proposed-new predicates (143 lint warnings).
- **Coordinator, before cleanup:** done 2026-10-09. The owner close-out edits were committed on `ft/schema-A*`; their `packets/` trees were confirmed identical to S's copies; all nine branches were merged into `main` with `--no-ff` (merge commit 74c4d1d); then the worktrees were removed and the branches deleted.

**Not yet in `open-questions.md`:** does "< 5 s build" mean the in-process build or the wall time of the deployed recipe?

**Fixture requests** RQ-01 to RQ-04 and RQ-06 are open (`requests.md`). RQ-05 is satisfied for the pair, but its K rows are still wanted. Under R-06, an unfixtured value-1 pair is demoted to a predicate if its request is still open at acceptance.

## 8. What is not done

- **The planner cannot plan against the candidate.** `kg plan` has no IR option, and creatability is read from `@mutation` (migration-notes §5.1).
- **GDS is not validated on a live instance.** The deployed edition is unknown (OD-22).
- **No re-pin.** There are no v2 sidecars, validation params or operations file, and `pnpm workspace:build` cannot build v2 (FU-07 to FU-09).
- **The R-18 Subjectable removal pass** has not been run (FU-12).
- **Fixtures.** The residual-table edits are applied and the fixtures are linted (section 5). What is left is owner-gated (FU-03): OD-10 / R-95, the D5 target key and the out-of-table items FU-03 lists. FU-06 is measured, not fixed: 63 of 579 fixture `captureMethod` values use a canonical action-space id.
- **The R-50 latency test** has not been run, and no materialization is justified by a measurement yet.
- **Pattern rewrites.** Q-D12-03 and Q-D12-06 wait for OD-10 / R-95 (FU-04). Everything else validates (section 5). FU-05 is resolved: D10's answer-kind table regenerates byte-identical.
- **TL-04 (narrowed).** The D11 generator now quotes flow scalars, and `tooling/action-space.yaml` is its byte copy, clean under PyYAML. The `yaml.safe_load` test in the Python client's suite is not added.
- **Generated-file hygiene.** Line endings under `final/` are LF, and `build-predicates.mjs --check` and `build-tooling-scorecard.mjs --check` pass. The `open-questions.md` header counts (from `build.mjs`) are not recomputed; a note in that file says so.
- **Commit and handoff.** The run is merged into local `main` (74c4d1d, not pushed). On `main`, all 14 packets pass packet-check and `assemble-schema.mjs` reproduces sha256 c7cf1235…4793. `handoff-to-biotech-meta.md` lists the re-pin and copy steps, and none of them has been run.
