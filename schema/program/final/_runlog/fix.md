# Runlog: synthesis fixer stage (S team), 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Git Bash, commands from the worktree root unless a `cd` is shown. `$F` = `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final`; `$SP` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/fix`. Inputs: the three verifier lenses (numbers N-1..N-10, contract C-1..C-14, evidence E-1..E-10, numbered in the order they were handed over). No .env value was printed. Nothing was committed. Writes only under `$F` and `$SP`.

## 0. Before

```
sha256 (first 16) of final/schema/*: kernel ec981e2aab04fb59, D1 eb0537ff69c0a197, D2 3d1f1a729fcd2ec5, D3 6a3cdc8982074fc4, D4 b62054b09a774080,
  D5 7fb18a838e1b29b4, D6 6b14b735ef1a80f4, D7 83221ab14b269804, D8 9eaf3f0f2348dc15, D9 323e181a03ff6a26, D10 356dbffe86c067f2,
  D11 ec9a90a90a15bb7c, D12 f7c6b4107e27f4db, D13 24f8f6853a6b74e7, assembled d233930272c7aaa7, IR 446c8acf54b7659f
sha256 relationship-register.yaml 1a322d894ef62dd7…, node-register.yaml 7515835405e0034a…, seams.yaml 710aa28b686a68ae…
cp -r final/schema size-report.md schema-map.md questions-catalog.md *-register.yaml seams.yaml → $SP/ (backup for diffs)
docker exec bks-neo4j-synth cypher-shell … "MATCH (n) RETURN count(n)" → 0
```

## 1. SDL edits (module files; then the full measure chain in section 2)

- **C-7 / N-5 / FU-01 (R-49 applied).** kernel.graphql `Claim`: + `discourseFirstHandCount`, `discourseRetellingCount`, `discourseRecutCount`, `discourseIndependentCount: Int`, `discourseFirstOccurrenceAt: DateTime`, `discourseMethodVersion: String` and `discourseDerivedAt: DateTime` (both `@filterable(byValue: false) @sortable(byValue: false)`, the D3 Study cache convention). D7.graphql `Person` and D9.graphql `Channel`: + `influenceScore: Float`, `influenceMethodVersion`, `influenceDerivedAt` (same convention). Docstrings cite R-49/R-45 and the authority. Register fragments: K.node.yaml Claim, D7.node.yaml Person, D9.node.yaml Channel filterProperties/otherProperties/mutations updated.
- **E-2 (ClaimOccurrence, new fix ruling F-05).** kernel.graphql Assertion docstring "(stored extra label `ClaimOccurrence`)" → "(stored with the `Assertion` label only, no extra label; F-05)"; D9.graphql header and D13.graphql header comments reworded; K.node.yaml / D9.node.yaml merged-into rows, D9.relationship.yaml (RECOMMENDS rationale) and D9.seams.yaml (3 prose spots) reworded.
- python string replacements, each asserted to match exactly once (`ok kernel.graphql 1` ×2, `ok D7.graphql 1`, `ok D9.graphql 1` ×2, `ok D13.graphql 1`).

## 2. Register fragment edits

- **N-7 / C-3 (RENDITION_OF fixture).** `_work/registers/D3.relationship.yaml` RENDITION_OF Source → Publication: `fixture: final/fixtures/K/resveratrol-sirt1-evidence-mission` → `final/fixtures/cross-domain/claim-mission-report` (sed, 1 line). That fixture writes 5 RENDITION_OF rows Source → Publication (`grep -n RENDITION_OF …/claim-mission-report/assertions.yaml` → lines 810–925, objects pub-pencina-jg …). `merge-registers.mjs` line 146: the fixture-path check now also accepts `final/fixtures/cross-domain/`.
- **C-10 (populatedBy on fragments).** `rewrite-populatedby.mjs` gained `--file <fragment> --module <M>` and flow-style (`populatedBy: [a, b]`) lines. Run over the 14 fragments:
```
for M in K D1 … D13: node $F/_work/rewrite-populatedby.mjs --file $F/_work/registers/$M.relationship.yaml --module $M
→ K in 28 out 28 changed 13 | D1 18/18 6 | D2 20/19 6 | D3 62/55 15 | D4 35/33 13 | D5 11/11 6 | D6 26/26 9 | D7 58/40 7 | D8 53/50 11
  D9 19/19 8 | D10 12/12 6 | D11 0/0 0 | D12 14/14 4 | D13 22/22 5 ; unresolved 0, notInActionSpace 0 in every fragment
  (values out total 347 = the merged file's 347)
re-run with --check on K, D3, D7 → exit 0 (idempotent)
```

## 3. Measure chain

```
node scripts/assemble-schema.mjs → {"ok": true, "modules": 14, "types": 300}
wc -l -c → 7295 lines, 387615 bytes; sha256 c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793
node $F/_work/check-refs.mjs $F/schema/final_biotech_schema_v2.graphql → {"declared": 300, "dangling": []}
```

Map and module counts. `count-schema.mjs` now follows R-01 option A for module attribution (ASSESSES, DERIVED_FROM, MENTIONS, RENDITION_OF → K; `--first-declarer` restores the integrator's rule), adds per-module `expandedPairs` and `declaredCollapsedPairs`, and its `--append-map` section now carries the per-module table with budgets and over-budget flags.
```
node packages/schema-workspace/dist/cli.js map --sdl $F/schema/final_biotech_schema_v2.graphql --out $F/schema-map.md
→ {"ok": true, "bytes": 257443, "schemaDigest": "sha256:c7cf1235…4793"}   real 0.53 s
node $F/_work/count-schema.mjs $F/schema/final_biotech_schema_v2.graphql --json $SP/count.json --matrix $SP/matrix.md --append-map $F/schema-map.md
→ nodeTypes 69; Entity 69 / Subjectable 56 implementers; relationshipTypes 106; relationshipFields 148; pairsCollapsed 181; pairsExpanded 848;
  unions 16; widest union as target AdministeredMaterial 5; enums 193
  perModule (nodes / rel types / collapsed / expanded / declared collapsed):
  K 11/15/36/593/29, D1 4/6/7/7/7, D2 5/6/10/10/10, D3 8/14/30/30/31, D4 7/13/17/17/17, D5 6/6/9/64/9, D6 6/9/11/11/11, D7 4/7/9/9/9,
  D8 6/11/25/25/25, D9 3/6/7/7/9, D10 3/4/5/60/9, D11 1/0/0/0/0, D12 3/4/8/8/8, D13 2/5/7/7/7
node $F/_work/count-schema.mjs … --first-declarer   (integrator attribution, for comparison)
→ K 11/13/33/535/29, D3 8/15/32/32/31, D9 3/7/8/63/9, D10 3/4/5/60/9   (reproduces the integrator's K 13/33 and D3 15/32)
```
D3 reconciliation (N-4): under R-01 A, D3 owns 14 relationship types and 30 collapsed pairs, which is what `_runlog/module-D3.md:98` reports (14 / 30). 31 is the count of pairs produced by fields on D3's own node types (`declaredCollapsedPairs`, includes Publication.renditions RENDITION_OF Source → Publication); 32 was the first-declarer attribution (RENDITION_OF's two pairs, Source → Publication and Source → MediaWork, both counted in D3). Under R-01 A K holds 15 relationship types: RENDITION_OF and MENTIONS move in (MENTIONS is declared only on D9 Chunk), so K is one over its 14 (EXCESS row in size-report; owner decision R-97).

IR, executable, size:
```
node $F/_work/build-ir.mjs $F/schema/final_biotech_schema_v2.graphql $F/schema/final_biotech_schema_v2.ir.json
→ {"ok":true,"schemaDigest":"sha256:c7cf1235…4793","nodes":69,…}   2,102,499 bytes
for i in 1 2 3: time (BKS_SCHEMA_PATH=$F/schema/final_biotech_schema_v2.graphql NODE_OPTIONS=--max-old-space-size=8192 \
                      pnpm --filter @bks/graphql-api print-schema "$SP/printed-deployed.graphql")
→ "wrote …printed-deployed.graphql (1743362 chars) in 2s"; real 4.980 s, 4.969 s, 5.136 s (median 4.98 s)
wc -c -l → 34492 lines, 1743672 bytes; grep -c '^input ' 960; '^enum ' 196; '^type ' 524; '^type Mutation' 0;
grep -c 'discourseFirstHandCount\|influenceScore' → 27   (new fields present, so not the pinned fallback; 1.7 MB, not 55–58 MB)
cp …/synth/integrate/print2.mjs $SP/print2.mjs   (the K lever printer, already re-pointed at this worktree)
for i in 1 2 3: NODE_OPTIONS=--max-old-space-size=8192 node $SP/print2.mjs $F/schema/final_biotech_schema_v2.graphql $SP/printed-none.graphql none
→ {"bytes":1743362,"lines":34493,"inputs":960,"ms":1531} / {"ms":1459} / {"ms":1411}   (median 1.46 s)
cmp printed-none.graphql printed-deployed.graphql → IDENTICAL
for i in 1 2 3: … print2.mjs … $SP/printed-L3.graphql all
→ {"bytes":731755,"lines":22874,"inputs":960,"ms":1065} / {"ms":1044} / {"ms":1180}   (median 1.07 s); wc → 22873 lines, 732065 bytes
sha256 (first 16): printed-deployed 7f225de6f8f6c0ee, printed-L3 79359d508025a49a
for i in 1 2 3: … print2.mjs schema/pinned/final_biotech_schema_proposal.graphql $SP/printed-pinned.graphql none   (background, sequential)
→ {"bytes":57908217,"lines":693831,"inputs":38034,"ms":25061} / {"ms":24653} / {"ms":23218}   (median 24.65 s); wc -c 57908325; print deleted
node scripts/schema-size.mjs $SP/printed-deployed.graphql --ir $F/schema/final_biotech_schema_v2.ir.json --out $SP/size-deployed.md
node scripts/schema-size.mjs $SP/printed-L3.graphql --ir $F/schema/final_biotech_schema_v2.ir.json --out $SP/size-L3.md
→ deployed: 1.7 MB, 34,493 lines, input 960, object 524, enums 196, Query 158, Mutation 0, SDL nodes 69, rel fields 148, pairs 848; Where 13,818 lines
  L3: 0.7 MB, 22,874 lines, same type counts; Where 2,192 lines
diff against the integrator's size-deployed.md: only lines, Where/Sort line counts, Claim (417 → 490 lines) and Person (369 → 392) rows, ClaimWhere in the top 25
```
Line counts (N-8): `wc -l` counts newline characters; print2/schema-size count `split("\n")` elements. printSchema output has no trailing newline, so the second is always the first + 1 (34,492 vs 34,493 now; 34,373 vs 34,374 before).

Registers:
```
node $F/_work/merge-registers.mjs --report $SP/merge.json
→ sdl: nodeTypes 69, relationshipTypes 106, pairsCollapsed 181, crossModulePairs 86; relationships 109, predicateOnly 203, authorizingPredicates 10;
  seams 331, crossModuleEdges 86, oneSided 0, cutEdges 19; violations 0, warnings 3 (ASSESSES K+D10, DERIVED_FROM K+D10, RENDITION_OF D3+D9), stampIssues 0   exit 0
node $F/_work/rewrite-populatedby.mjs --check --report $SP/populatedby-merged.json
→ entriesWithPopulatedBy 109, valuesIn 347, valuesOut 347, renamed 0, duplicatesDropped 0, unresolved [], notInActionSpaceAfter []   exit 0
diff $SP/relationship-register.yaml $F/relationship-register.yaml → only: the SDL and fragment sha256 header lines, the D3 RENDITION_OF fixture line,
  and the D9 RECOMMENDS rationale line. Every populatedBy list is byte-identical to the pre-fix merged file, so the earlier rewrite of the merged
  file is now carried by the fragments and a re-merge no longer undoes it (C-10).
sha256 (first 16): relationship-register.yaml 28838ce168b82132, node-register.yaml 8cb701d7ab42a0d3, seams.yaml fb62af5944b18306
node $F/_work/rel-values.mjs → unchanged best-value table (95 v1, 11 v2, 0 v3)
```

Further commands in this section:
```
node $F/_work/count-schema.mjs … --append-map $F/schema-map.md   (re-run after adding the caveat paragraph: R-49 included; IR classes from pinned params, FU-08)
node $SP/class-check.mjs   (IR relationship class vs merged register class)
→ {"irTypes":106, "mismatches": ["HAS_VARIANT: IR structural/asserted vs register structural", "MEASURES: IR asserted/derived vs register asserted",
   "REQUIRES_INPUT_METRIC: IR structural/asserted vs register structural"]}   (the 3 mismatches N-5 names)
python -I -X utf8 $SP/build-size-report.py $SP $F   → final/size-report.md rewritten (hand header from the numbers above + both schema-size outputs embedded)
node $F/_work/rel-values.mjs → {"questionIdsWithValue":455,"relationshipTypes":106,"bestValue1":95,"bestValue2":11,"bestValue3":0,"noValue":0}
```

## 4. R-01 option-B cuts, measured in memory (N-2, C-4)

```
node $SP/whatif-cuts.mjs $F/schema/final_biotech_schema_v2.graphql
→ expandedBase 848; Subjectable fields 11, Entity fields [Activity.generated]; implementers Subjectable 56, Entity 69
  cut1 (drop Activity.generated) 783 (−65); cut2 (+ STEP_USES → 6-member union ChemicalSubstance|IngredientMaterial|Product|FoodItem|Intervention|Metric) 733 (−50)
  cut3 per-implementer contribution {10: 55, 8: 1}; 14 implementers needed; recount with 14 dropped at once → 593
```
The 6 members are the pre-review StepMeans union (packets/D5/11-open-questions.md OQ-D5-06: the move to Subjectable "admits D12 DietaryPattern, FoodCategory and D4 Device"). Which 14 types lose Subjectable is R-18's modeling question; the script's list (alphabetical among equal contributions) is not a proposal.

R-18 pass (N-10): `grep -n R-18 $F/_runlog/module-*.md` → only module-D6 (LabelVersion docstring / whyNode) and module-K (Subjectable docstring); `grep -n R-18 $F/_work/rulings.yaml` → a global rule, a K edit-text and a D6 close-oq, no per-module removal op; count-schema: Subjectable 56 implementers. Recorded as not run (R-18 status, FU-12).

Directive rule 1 (N-3): `node -e …count.json fields` → 12 interface-target fields: K Assertion.subject/object/assertedBy, Assessment.about, Report.about, Activity.about, Identifier.identifies (Subjectable), Activity.generated (Entity); D5 ProtocolStep.uses, D9 Chunk.mentions, D10 ReportItem.about, Association.members (Subjectable). `grep -n WAS_GENERATED_BY packages/kg-ops/src/*.ts` → plan.ts 236, 263, 510, 828 write it in Cypher (no GraphQL dependency). Recorded as owner decision R-96 / OD-45; cut 1 not applied.

## 5. Questions catalog (N-6, C-2, C-11)

Reproduced the broken value-1 patterns with grep over `packets/*/03-retrieval-patterns.md` and the SDL:
```
grep -n '(…:Identifier)-[…HAS_IDENTIFIER]->' packets/*/03 → D1 214 (CQ-ID-04 v2), 234 (Q-D1-06 v2), 460 (Q-D1-15 v2), 666 and 670 (Q-D1-26 v1); D2 433 (Q-D2-11 v2);
  D12 3 (header), 153 (Q-D12-05 v1), 761 (Q-D12-34 v1). SDL: Identifier.identifies @relationship(type: "HAS_IDENTIFIER", direction: IN) → stored Subjectable → Identifier
D12 03 lines ~105 (Q-D12-03) and 169 (Q-D12-06): (qr:QualityResult)-[:RESULT_FOR]->(p:Product)
D8 03 lines 622/624 (Q-D8-23): LegalStatus STATUS_OF Device, RegulatoryRecord CONCERNS Device; SDL unions LegalStatusSubject / RegulatoryRecordTopic have no Device
D2 03 line 526 (Q-D2-16): (asm:Assessment …)-[:ASSESSES]->(cl:Assertion); SDL `type Assertion implements Entity` (not Subjectable)
```
`questions-catalog.mjs`: a PATTERN_BROKEN table (the 11 ids above, each with its line evidence) marks the survived column "pattern broken" and the header counts them; `rerouted (…)` in the shared-id rows now takes its rulings from the survival computation (it printed `rerouted ()` for 6 rows, e.g. CQ-EV-05 now `rerouted (R-44)`). The script's line endings were normalized back to CRLF after the edit.
```
node $F/_work/questions-catalog.mjs   (run 4 times; last after the decision-report and register edits)
→ 454 questions; fixture: 12 declared yes with no fixture naming the id, 37 declared no while a fixture names it; 68 covered by query-patterns sections;
  survived: kept 388, partial 20, rerouted 2, noedge 43, cut 1; pattern broken 11 (CQ-ID-04 v2, Q-D1-06 v2, Q-D1-15 v2, Q-D1-26 v1, Q-D2-11 v2, Q-D2-16 v1,
  Q-D8-23 v1, Q-D12-03 v1, Q-D12-05 v1, Q-D12-06 v1, Q-D12-34 v1); cutValue1 [], patternIssues 0
grep -c 'rerouted ()' questions-catalog.md → 0 (was 6)
node $SP/cells.cjs questions-catalog.md --scan   (splits rows on unescaped pipes) → [] ; the pre-fix catalog → [] as well
```
C-11's "unescaped |" in CQ-CL-05 / CQ-CL-07 is rebutted. The cut-pair text is written `D7.Person \| D7.Organization` (escaped), and a backslash-aware split gives 13 cells, the same as the header, in both the old and the new file. A naive `split("|")` gives 14.

## 6. Query patterns and lineage on the disposable Neo4j (E-2, E-3, E-8, C-12)

```
node $F/_work/gen-patterns-ddl.mjs $F/schema/final_biotech_schema_v2.ir.json $F/_work/patterns-ddl.cypher
→ {"schemaDigest":"sha256:c7cf1235…4793","uidConstraints":69,"relAssertionIndexes":63,"relWriterIndexes":97,"statements":229}   (diff: header digest line only)
docker exec bks-neo4j-synth cypher-shell … "MATCH (n) RETURN count(n)" → 0
node $F/_work/validate-patterns.mjs --doc $F/query-patterns.md --ddl $F/_work/patterns-ddl.cypher --report $SP/patterns-empty-report.md --json $SP/patterns-empty.json
→ nodesInDatabase 0; ddlExecuted 278, ddlFailed 0; indexes 280/280 online; queryStatements 39, queryOk 39; gds sources 9/9, input 1/1; gdsCallsNotRun 19; failed 0;
  withAllNodesScan ["P-10c.2"]; withCartesianProduct ["P-10d","G-0"]; droppedAfterRun 278      (reproduces E-8)
```
Claim fixture loader (scratch `synth/xfx-claim`): `load.py` no longer adds `ClaimOccurrence` to CLAIM Assertions (F-05), and `stage2.json` carries the fixed run end times (F-07). Backups: load.py.bak, stage2.json.bak.
```
python -I -X utf8 load.py → statements 948; grep -c ClaimOccurrence load.cypher → 0
docker exec -i bks-neo4j-synth cypher-shell … --format plain < load.cypher → exit 0
"MATCH (n {fx:'xfx-claim'}) RETURN count(n)" → 203; "MATCH (n:ClaimOccurrence)" → 0; CLAIM Assertions → 8
docker exec -i … < $SP/lineage-claim.cypher   (output $SP/lineage-claim.out)
→ P-10b (new) for hu:person:david-a-sinclair: r1-ingest [RECORDED_STATEMENT_BY], r2-evidence-mission [ASSERTED_ABOUT, RECORDED_STATEMENT_BY, ASSESSED],
  r2-verification [RECORDED_STATEMENT_BY], ft-D7-sinclair-self-disclosure-unstructured [WROTE]   (the old form returns only the r2 mission and the D7 run)
  check: statements recorded per run r1-ingest 2, r2-evidence-mission 7, r2-verification 2   (= the verifier's figures)
  P-10a.2 (new): r2-evidence-mission HAS_IDENTIFIER 2, HOLDS_ROLE 4, HOLDS_STAKE 2, REALIZES_SUBSTANCE 1, RECEIVES_VALUE_FROM 1, RENDITION_OF 10; r2-verification RENDITION_OF 1
  P-10a.4 (MEASURES dropped): no rows (no derived edges in this fixture)
  P-10a per run and label: no ClaimOccurrence label; e.g. r2-evidence-mission Assertion 37 created, Publication 7, Source 10, SourceSnapshot 11
  snapshots retrieved after their run's endedAt → 0
node $F/_work/validate-patterns.mjs … --json $SP/patterns-claim.json   (claim graph loaded)
→ nodes 203, ddl 278 ok, 39/39 ok, failed 0, withAllNodesScan [], withCartesianProduct ["P-10d","G-0"], dropped 278
"MATCH (n {fx:'xfx-claim'}) DETACH DELETE n" → 203; SHOW INDEXES → 2
docker exec -i … < synth/xfx-compound/load.cypher → exit 0; then $SP/lineage-compound.cypher (sets the F-07 clocks on the loaded copy):
→ P-10a.2 old form: 13 relationship types, no HAS_IDENTIFIER; new form: the same plus HAS_IDENTIFIER 22; all HAS_IDENTIFIER episodes 22, with assertionUid 22
  P-10a with the fixed clocks: ingest created 280 / updated 0, projection 5 / 0, verify 82 / 0
docker exec -i … < synth/xfx-compound/cleanup.cypher; "MATCH (n) RETURN count(n)" → 0
```
query-patterns.md edits (python, exact match, CRLF kept): the IR digest line; Conventions (a claim occurrence has no extra label, F-05); the P-10a.2 second branch (HAS_IDENTIFIER); P-10a.4 without MEASURES, plus notes; the sixth P-10b role; the AllNodesScan sentence qualified for the empty store; the G-5 table row and Q-4 (R-49 now declared; per-frontier score open, FU-11); a fix-stage validation paragraph in the summary.

## 7. Fixtures, registers, documents

```
find fixtures (packet copies, cross-domain excluded) | sha256sum → $SP/fixtures-before.sha (388 files)
repath-fixtures.mjs edits: the register check reads cross-domain fixtures; acceptance-gate bullet (FU-03); planner-count note with the file count;
  PENDING_EDITS: D12 acr-03 flagged NON-CONFORMING until R-95; "*" when /ClaimOccurrence/ → F-05
node $F/_work/repath-fixtures.mjs --index   (3 runs; last after the final register merge)
→ {"fixtures":75,"registerEntries":109,"levels":{"TYPE":109},"violations":0}   (was TYPE 108, ABSENT 1: D3 RENDITION_OF)
find fixtures (packet copies) | sha256sum | diff - $SP/fixtures-before.sha → identical (the re-copy is byte-for-byte reproducible)
README now has: "Reading the counts: … 70 edge.assert proposals … over 27 distinct predicates …"; F-05 pending rows on 4 fixtures (D3, D5, D9, K)
node $SP/edge-assert-count.mjs $F/fixtures → {"relTypes":106,"intentFiles":77,"proposals":70,"distinctPredicates":27,"fixtures":18,
  "byPredicate":{"DIRECTLY_ACTIVATES":12,"INTERACTS_WITH":10,"SOLD_THROUGH_CHANNEL":7,"CAUSES_ADVERSE_EFFECT":6,"USE_CONSTRAINED_IN":5,…}}   (E-5)
for each of the 27: grep -c -E "predicate: \"?P\"?( |,|$|})" relationship-register.yaml → 0 for DIRECTLY_ACTIVATES, DECLARES_INGREDIENT_FORM,
  ASSOCIATED_WITH_ADVERSE_EFFECT, DISCLOSES_ROLE_AT, HIGHER_BIOAVAILABILITY_THAN, INDICATED_FOR, MATERIAL_MANUFACTURED_BY, MAY_IMPROVE_PROGNOSIS_OF,
  OFFERS_FOR_SALE (9; fixtures: K hubbard-2013, resveratrol-sirt1, retracted-sah-2017, seller-claim-occurrences, two-run-lineage; D10 mg-rankings,
  livertox, mg-bisglycinate, opentargets) → FU-13   (E-6)
Cross-domain fixture clocks (F-07, python exact-match edits; yaml.safe_load of all three → ok):
  claim assertions.yaml: act-r2-mission endedAt 04:35:02Z → 04:36:14Z; act-r2-verification endedAt 04:35:02Z → 04:36:14Z (clockBasis updated)
  compound assertions.yaml: act-ingest startedAt 05:01:14Z → 04:16:57Z, + endedAt 05:01:14Z; act-project and act-verify + endedAt 05:01:14Z
  product assertions.yaml: act-project startedAt 04:25:19Z / endedAt 05:00:00Z; act-compare startedAt = endedAt 05:00:00Z; informedBy → wasInformedBy (list)
  claim walk.md: KIND list without ClaimOccurrence; F3/F5 marked applied. compound walk.md: a note on P-10a.2 and the clocks.
NSF Sport listings (E-10): curl -s -m 30 -A "Mozilla/5.0" https://www.nsfsport.com/certified-products/listing-detail.php?id=<id> → $SP/nsf/
  1263423: 19,948 B (recorded 19,949), sha256 81a5d4ceaf72cd7d… ≠ e0f0b05e…; 1423140: 19,987 B (recorded 19,988), 6e8d7c797ac70d7e… ≠ fe7f5eb6…
  python: each of the 10 l-nsf-tn-*/l-nsf-nc-* quotes occurs once; the slice at the stored offsets ≠ exact; shift −1 for all 10 → source.md "Re-verify" updated
action-space (C-13): python yaml.safe_load(final/tooling/action-space.yaml) → ParserError line 2931 col 72 (reproduced); cmp with the packets/D11 copy → identical;
  sed line 2931: quote "enclosure URL with ?updated= epoch" → PyYAML ok (entries 167, aliases 402); Node yaml errors 0 before and after, toJS deep-equal true → TL-04
Requests (C-3, FU-02): final/requests.md written (RQ-01..RQ-06; question values checked against _work/openq/values.json); ids added to the D8 (RQ-02, RQ-03)
  and D5 (RQ-01) relationship fragments and to the D2 seam note (RQ-06)
node $F/_work/merge-registers.mjs → violations 0, warnings 3, crossModuleEdgesOneSided 0; rewrite-populatedby --check → exit 0
Planner check: not re-run. The fix stage added only nullable scalar properties, which change neither creatability nor relationship endpoints; the README's
  planner digest (d233930272c7…) is the IR that run used.
decision-report.md: R-01, R-02, R-03, R-18, R-49 and R-73 amended; R-95–R-98 and F-01–F-07 added; tally and "Cuts to budget" rewritten
  (python exact-match edits; one sed -i normalized "Deciding questions" → "Deciding question" and dropped the CRLFs, which python restored: 1,650 CRLF, 0 bare LF)
open-questions.md: generated; _work/openq/template.md edited (OD-01, OD-02, OD-10, OD-11, FX-10, FU-01, FU-02, FU-04, FU-06, FU-10; new OD-45, OD-46,
  FU-11, FU-12, FU-13, TL-04) and build.mjs (conflict count); node values.mjs && node build.mjs → entries 156, owner decisions 46, problems []
handoff-to-biotech-meta.md (11 edits) and migration-notes.md (item 8 and the L3 lines) carry the re-measured numbers.
node $SP/cells.cjs <file> --scan on open-questions, decision-report, size-report, requests, questions-catalog, fixtures/README, handoff, query-patterns → [] for each
```
Stale digests left on purpose: the cross-domain fixtures' headers (compound assertions.yaml line 6, product walk.md line 3) name the IR they were checked against, d233930272c7…. The fix stage changed only nullable scalars on Claim, Person and Channel, and those fixtures do not write them.

Final hashes (sha256, first 16): SDL c7cf1235dba876b2, IR cc1baa00e6f8e7da, size-report 53d6985f7a6631db, schema-map b6f846d8a4f91432, decision-report e985e83f411bbc07, open-questions ce3ea45902ad2311, query-patterns 0a78eb95f61e2ba7, questions-catalog 9babee1531a239fc, fixtures/README 3e89cedd82207c99, requests bc8cf3aee0fcebda, relationship-register 1db01e03e55d1708, node-register 8cb701d7ab42a0d3, seams 134b9f7c0bfa9a35, tooling/action-space 1444148f4e035c0f. (The relationship-register and seams hashes in section 3 predate the request-id edits.)

## 8. Findings → fixed | rebutted

| finding | lens · severity | result | where |
| --- | --- | --- | --- |
| N-1 00-SUMMARY / RUNLOG missing; requests.md missing | numbers · blocker | **rebutted (pending finalizer)** for 00-SUMMARY.md and RUNLOG.md: both are the finalizer's step-10 outputs, written last; this stage leaves `_runlog/fix.md` for RUNLOG. **fixed** for requests.md | requests.md |
| N-2 verdict "within every budget line"; cuts unmeasured | numbers · major | fixed: verdict reworded (over by 248 on the directive's metric); cuts measured 783 / 733 / 14 implementers → 593 | size-report, decision-report R-01 and Cuts, OD-01 |
| N-3 rule 1 and interface targets | numbers · major | fixed: owner decision R-96 / OD-45 with measured options; size-report row for interface targets (Entity 69 × 1 field, Subjectable 56 × 11 fields) | decision-report R-96, size-report |
| N-4 D3 15 types; three D3 pair figures | numbers · major | fixed: count-schema follows R-01 (A); D3 14 / 30 (= module-D3 runlog), declared 31 and first-declarer 32 explained; K is then 15 > 14, so an EXCESS row and R-97 / OD-46 | count-schema.mjs, size-report, schema-map, R-97 |
| N-5 no caveat (FU-01, FU-08) | numbers · major | fixed: FU-01 applied (F-01) and measured; FU-08 caveat with the 3 class mismatches in size-report and schema-map | size-report, schema-map |
| N-6 catalog stale | numbers · major | fixed: re-run (12 / 37, 68 sections); FU-10 updated | questions-catalog, FU-10 |
| N-7 RENDITION_OF fixture wrong | numbers · major | fixed: fragment points at cross-domain/claim-mission-report, re-merged, rewrite check exit 0; register check TYPE 109 | D3 fragment, F-02 |
| N-8 build time definition, pinned single run, line counts | numbers · minor | fixed: in-process build defined, recipe wall time beside it (median 4.98 s), pinned median of 3 (24.65 s), wc vs split explained | size-report |
| N-9 D3 [CONNECT] exceptions not in R-03 | numbers · minor | fixed: listed in R-03 | decision-report R-03 |
| N-10 R-18 pass not run | numbers · minor | fixed (recorded): status "removal pass not run" with grep evidence; FU-12 | R-18, FU-12 |
| C-1 00-SUMMARY / RUNLOG missing | contract · blocker | **rebutted (pending finalizer)**. This stage records the gate for the finalizer, including the 3.1–3.10 / section 4 traceability table that C-1 asks for | — |
| C-2 broken value-1 patterns | contract · major | fixed: reproduced by grep; the catalog marks 11 "pattern broken"; FU-04 extended with the HAS_IDENTIFIER kernel-convention correction against D1, D2 and D12 | questions-catalog, FU-04 |
| C-3 requests.md missing; RENDITION_OF | contract · major | fixed: requests.md RQ-01..RQ-06; RENDITION_OF as N-7 | requests.md |
| C-4 headline rests on A | contract · major | fixed as N-2 ("passes under A, fails under B by 248"; cuts measured) | size-report |
| C-5 D3 15 types | contract · major | fixed as N-4 | size-report |
| C-6 OD-10 / OD-11 only in open-questions | contract · major | fixed: R-95 and R-98 (owner decision = yes); acr-03 flagged NON-CONFORMING in fixtures/README | decision-report, fixtures/README |
| C-7 R-49 not in SDL | contract · major | fixed: applied (F-01), full measure chain re-run | SDL, size-report |
| C-8 L2 planner consequence | contract · major | fixed: R-02 and OD-02 carry "0 of 77", TYPE_NOT_CREATABLE 791 and the executor dependency | R-02, OD-02 |
| C-9 fixtures not acceptance evidence | contract · major | fixed: acceptance-gate bullet in fixtures/README (generator) and a size-report caveat; the finalizer must state the gate in 00-SUMMARY | fixtures/README |
| C-10 populatedBy rewrite only on the merged file | contract · minor | fixed: fragments rewritten; a re-merge reproduces every populatedBy list; FU-06 corrected | F-03, FU-06 |
| C-11 catalog stale, malformed rows, empty ruling | contract · minor | fixed (stale catalog, `rerouted ()`); **rebutted** (malformed rows: the pipes are escaped, and a backslash-aware scan finds 0) | questions-catalog |
| C-12 MEASURES in P-10a.4 | contract · minor | fixed: removed, note added | query-patterns |
| C-13 action-space not PyYAML-portable | contract · minor | fixed in the final copy (one scalar quoted; Node parse unchanged); generator fix requested (TL-04) | tooling/action-space.yaml, TL-04 |
| C-14 pinned build single run | contract · minor | fixed: median of 3 (24.65 s) | size-report |
| E-1 00-SUMMARY / RUNLOG missing | evidence · blocker | **rebutted (pending finalizer)**, as C-1 | — |
| E-2 ClaimOccurrence three ways | evidence · major | fixed: ruling F-05 (no extra label); SDL docstrings, registers, loader and walk changed; the reload shows 0 labelled nodes | F-05 |
| E-3 P-10b ASSERTED_BY, P-10a.2 HAS_IDENTIFIER | evidence · major | fixed: both branches added and validated (39/39); run on the fixtures (Sinclair: 3 runs; compound: 22 episodes) | query-patterns, F-06 |
| E-4 R-73 evidence false | evidence · major | fixed: correction paragraph, the value-1 loss stated, R-95 | R-73, R-95 |
| E-5 migration-notes 35 vs 70 vs 31 | evidence · minor | fixed: file count 70 / 27; the planner counts are labelled as rejection-reason counts in migration-notes and fixtures/README | migration-notes item 8, README |
| E-6 nine unregistered predicates | evidence · minor | fixed (listed): FU-13 with fixtures and owners | FU-13 |
| E-7 lineage clocks | evidence · minor | fixed: F-07 in all three fixtures; the reloaded claim graph has 0 snapshots after their run's end | F-07 |
| E-8 AllNodesScan depends on the store | evidence · minor | fixed: reproduced (empty store: P-10c.2; claim graph: none); sentence qualified | query-patterns |
| E-9 headline uses collapsed | evidence · minor | fixed as N-2; 00-SUMMARY must show both counts (finalizer) | size-report |
| E-10 NSF listing pages changed | evidence · minor | fixed: reproduced by re-fetch (19,948 / 19,987 B, shift −1 on 10 locators); source.md updated | product source.md |

Finalizer gate (from N-1, C-1, C-9, E-1, E-9): write 00-SUMMARY.md last, from `size-report.md` only. Its headline must show both pair counts, with the expanded 848 > 600 marked as the owner decision R-01 / OD-01. It must state that the fixtures are not yet acceptance evidence (FU-03), and it must carry the directive 3.1–3.10 / section 4 traceability table. Then concatenate `_runlog/*.md` into RUNLOG.md.
