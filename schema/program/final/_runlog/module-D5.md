# Module D5 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01 to R-10, R-23, R-26, R-28, R-29, R-35, R-46, R-47, R-52, R-57, R-58, R-60, R-61, R-63, R-70, R-75, R-76, R-78, R-80, R-82, R-83, R-84, R-85, R-88, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D5`, and the rows of other modules that name a D5 type); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` "Kernel changes in synthesis"; `packets/D5/` 04, 05, 06, 09, 10, 11; scratch `inv/review-open-issues.json` (D5).

```
$ git rev-parse --short HEAD; git branch --show-current
e484fd2
ft/schema-S
$ sha256sum packets/D5/04-schema-proposal.graphql packets/D5/05-relationship-register.yaml packets/D5/06-node-register.yaml packets/D5/10-seams.yaml final/schema/kernel.graphql
69da4e8264fbaebc6ae93521ec888b7b9c4b4c90b4d5c8fb789f2aa8a8bd2bfd  packets/D5/04-schema-proposal.graphql
8f3f903d9e30660e69d2db2b4e33daf6faa8ecbd35b63f344e479e40acd9637b  packets/D5/05-relationship-register.yaml
2da04a3e2740192292a74d32b9becc1886eae8657734d1bc54a0d32e436df37d  packets/D5/06-node-register.yaml
f729977e0fffaa6c34c53f4cfb2a59602ea037b75f386bfc782f80a3096573c9  packets/D5/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
$ cp packets/D5/04-schema-proposal.graphql final/schema/D5.graphql
```

Collision checks run before editing (R-56, R-53):

```
$ for e in <13 D5 enums + TargetMeasure>; do grep -lE "^(enum|union|type) $e\b" packets/*/04-schema-proposal.graphql; done
-> every name only in D5/04-schema-proposal.graphql
$ for p in <11 D5 predicateOnly names>; do grep -l "type: \"$p\"" packets/*/04-schema-proposal.graphql; done
-> none (no predicateOnly value equals a relationship type name)
$ grep -A12 '^enum QuantityComparator' packets/D1/04-schema-proposal.graphql   -> EQ APPROX GTE GT LTE LT BETWEEN (packet)
$ grep -A10 '^enum AmountBasis' packets/D6/04-schema-proposal.graphql          -> 6 values (packet)
```

After editing, against the final modules other editors had written by then:

```
$ (in final/schema) for n in <13 enums, TargetMeasure, 6 node types>; do grep -lE "^(enum|union|type|interface) $n\b" *.graphql; done
-> only D5.graphql for every name
$ grep -A14 '^enum QuantityComparator' D1.graphql -> 12 values (R-57 list)       # equals the scratch stub
$ grep -A18 '^enum AmountBasis' D6.graphql        -> 16 values (R-58 list)       # equals the scratch stub
$ grep -nE '^type (Outcome|Condition|Biomarker|Metric|Device|DietaryPattern|FoodCategory|FoodItem|ChemicalSubstance|IngredientMaterial|Product|Constituent) ' D*.graphql
-> all 12 present, each "implements Entity & Subjectable" (every STEP_USES admissible type and TargetMeasure member)
$ grep -n '^union OutcomeMeasureTarget\|type: "MEASURES"\|type: "RESULT_FOR"' D3.graphql -> Metric | Biomarker | Outcome | Condition; MEASURES; RESULT_FOR
$ grep '^union AdministeredMaterial\|type: "ADMINISTERS"' D3.graphql -> IngredientMaterial | ProductVariant | Intervention | FoodItem | DietaryPattern; AssertedRecordedProperties
$ grep 'type: "BLOCKED_BY"' packets/D10/04-schema-proposal.graphql -> ReportItem.blockedBy: [UseConstraint!]!, blockedByAssessments: [Assessment!]!
```

## SDL edits (`final/schema/D5.graphql`, Edit tool; banner `# ---- fragment D5 ----` stays on line 1)

| ruling | edit |
| --- | --- |
| R-57 | `enum ThresholdComparator` deleted; `ProtocolStep.thresholdComparator` and `UseConstraint.doseComparator` retyped `QuantityComparator` (D1) |
| R-58 | `enum DosePeriod` deleted; `ProtocolStep.dosePeriod` and `UseConstraint.dosePeriod` retyped `AmountBasis` (D6), with docstrings |
| R-63 | time-restricted eating removed from the LIFESTYLE_PRACTICE value docstring and the Intervention docstring; both now say eating patterns are D12 DietaryPattern |
| R-70 | `union TargetMeasure = Biomarker \| Metric \| Outcome \| Condition`, docstring |
| R-10 | `Protocol.editions` (HAS_EDITION) `properties: "AssertedEdgeProperties"`; field docstring names the register field `exclusive: true` |
| R-26, R-25 | `Target.operationalizedBy` (OPERATIONALIZED_BY) class asserted, `properties: "AssertedRecordedProperties"`, nestedOperations stays `[CONNECT]` (R-03); docstring: basis CURATOR_CLASSIFICATION; questions add Q-D3-04, Q-D3-05 |
| R-80, R-78 | Protocol docstring: predicate AUTHORED_BY (registrar D3); interests HOLDS_ROLE \| HOLDS_STAKE \| RECEIVES_VALUE_FROM |
| R-28 | `ProtocolStep.uses` (STEP_USES) docstring: registered domain exception, admissible list in the register, executor-enforced |
| R-46 | `ProtocolStep.locatorUid` docstring: a cache; provenance is the HAS_EDITION authorizing Assertion's HAS_EVIDENCE |
| R-76 | UseConstraint docstring: scope descriptors only, no level, no verdict, projection-minted grouping, not a Claim, never vetted |
| R-75 | UseConstraint docstring: D10 ReportItem -BLOCKED_BY-> UseConstraint |
| header | synthesis paragraph listing the rulings and the two foreign enums |

Nothing else changed: no field, type, relationship or enum value was added or removed beyond the table.

```
$ grep -nE "StateEpisode|ThresholdComparator|DosePeriod|PROTOCOL_AUTHORED|time-restricted" final/schema/D5.graphql
-> only the synthesis header lines (29-30) and the two R-63 docstrings that now route eating patterns to D12
$ wc -c -l packets/D5/04-schema-proposal.graphql final/schema/D5.graphql
  538 27906 packets/D5/04-schema-proposal.graphql
  535 29856 final/schema/D5.graphql
$ diff packets/D5/04-schema-proposal.graphql final/schema/D5.graphql | grep -c '^[<>]'
81
```

## Registers

Written by hand from the packet files (Write tool), then one `python` replace pass on `D5.node.yaml` (each replace asserted to match once) to make the executor `mutations` text quote the packet values (create/update/delete) instead of paraphrasing.

- `_work/registers/D5.relationship.yaml`: 6 entries with every contract field (`type, class, from, to, edgeProperties, cardinality, temporal, questions, pattern, populatedBy, fixture, nestedOperations, aggregate, rationale`) plus `module: D5` and `declaredOn`. Fixtures rewritten to `final/fixtures/D5/<folder>`. HAS_EDITION gets `exclusive: true` (R-10). STEP_USES gets `admissibleTargets` (9 types, R-28). OPERATIONALIZED_BY: class asserted, AssertedRecordedProperties, 4 targets, `fixtureRequests` row for the Condition pair (R-70, R-06), Q-D3-05 added to crossPacketQuestions. `predicateOnly`: 11 entries, each `registrar: D5` (R-52) with `requiredQualifiers: [population]` except INTERVENTION_INCLUDES; subject / value additions of R-85 and R-88; CAUSES_ADVERSE_EFFECT object per R-84 with alias REPORTS_ADVERSE_EXPERIENCE. Removed: PROTOCOL_AUTHORED_BY (R-80), OFFERS_INTERVENTION (R-52/R-94), HOLDS_* (R-53/R-78), RECOMMENDS_AGAINST (R-83), REPORTS_ADVERSE_EXPERIENCE (R-84), listed under `removedPredicates`; the Target-object rejection kept under `ruleNotes` (R-83). `deferred`: the packet's 25 rows plus EXCEEDS_DOSE_THRESHOLD (R-85).
- `_work/registers/D5.node.yaml`: 6 nodes, every contract field plus `module: D5`; `mutations` as `{ graphql: none, executor: … }` (R-03); whyNode / filterProperties edits for R-57, R-58, R-63, R-70, R-76, R-80, R-46; AdverseEffect deferred row closed (R-84); new `retiredEnums` list (ThresholdComparator, DosePeriod).
- `_work/registers/D5.seams.yaml`: 31 relationship seam rows (28 accepted, 3 cut: K.Report ASSESSES D5.UseConstraint and BLOCKED_BY -> K.Assertion by R-75; OFFERS_INTERVENTION as a relationship row by R-94) and 13 predicateSeams rows (12 accepted, 1 cut: PROTOCOL_AUTHORED_BY by R-80). New rows: OPERATIONALIZED_BY -> D2.Condition (R-70), BLOCKED_BY D10.ReportItem -> D5.UseConstraint (R-75), predicateSeams AUTHORED_BY (D3, R-80), OFFERS_INTERVENTION (D6), DISCLOSES_INTEREST (D9, R-82), RECOMMENDS_AGAINST (D9, R-83). Every row has `status` and `ruling`. sharedVocabularies point at `final/`; pins targets 0.2.2, frontiers 0.2.1 (R-60); D11 dropped from the targets consumer list (R-85); QuantityComparator (D1) and AmountBasis (D6) added as consumed vocabularies.

Contract-field and SDL cross-check (python, yaml + regex over `final/schema/D5.graphql`):

```
rel missing: []
node missing: []
seam missing: []
pseam missing: []
SDL rel types ['HAS_EDITION', 'HAS_STEP', 'OPERATIONALIZED_BY', 'RESOLVES_TO_CONSTRAINT', 'STATES_CONSTRAINT', 'STEP_USES'] True
HAS_EDITION True [CONNECT] ['CONNECT']            # edgeProperties match, nestedOperations SDL vs register
HAS_STEP True [CREATE, CONNECT] ['CREATE', 'CONNECT']
STEP_USES True [CONNECT] ['CONNECT']
STATES_CONSTRAINT True [] []
RESOLVES_TO_CONSTRAINT True [] []
OPERATIONALIZED_BY True [CONNECT] ['CONNECT']
nodes ['Intervention', 'Protocol', 'ProtocolEdition', 'ProtocolStep', 'Target', 'UseConstraint'] True
predicateOnly [... 11 ...] collide with rel types: set()
fixtures ['final/fixtures/D5/antioxidant-exercise-disconfirmation', 'final/fixtures/D5/pregnancy-magnesium-upper-limit', 'final/fixtures/D5/sirolimus-label-interactions-harm', 'final/fixtures/D5/sleep-toolkit-unstructured']
counts: rel 6 predOnly 11 deferred 26 nodes 6 nodeDeferred 11 mergedInto 19 seams 31 accepted 28 cut 3 predicateSeams 13 pcut 1
enums [13 D5 enums] unions ['TargetMeasure = Biomarker | Metric | Outcome | Condition']
```

## Compile check

Scratch: `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D5/` (written as `$S` below). Stubs for the seam targets live only there: `stubs-D5.graphql` = enum QuantityComparator (12 values, R-57), enum AmountBasis (16 values, R-58), and minimal Entity & Subjectable `@node` types Biomarker, Metric (D4), Outcome, Condition (D2). The same stubs go into both inputs, so the difference is the D5 module alone. (Stub enums that no field uses are not printed: `kernel+stubs` prints 35 enums, the same as the kernel alone.)

```
$ cat final/schema/kernel.graphql $S/stubs-D5.graphql > $S/kernel+stubs.graphql
$ cat final/schema/kernel.graphql final/schema/D5.graphql $S/stubs-D5.graphql > $S/kernel+D5+stubs.graphql
$ wc -c -l ...  -> kernel+stubs 57,613 B; kernel+D5+stubs 87,469 B (= 56,040 + 29,856 + 1,573)
$ BKS_SCHEMA_PATH=$S/kernel+stubs.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $S/kernel+stubs.printed.graphql
wrote ...\module-D5\kernel+stubs.printed.graphql (346665 chars) in 2s          # wall 24 s (pnpm + tsx start)
$ BKS_SCHEMA_PATH=$S/kernel+D5+stubs.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $S/kernel+D5+stubs.printed.graphql
wrote ...\module-D5\kernel+D5+stubs.printed.graphql (486616 chars) in 3s       # wall 20 s
```

The print-schema log does not name the SDL it read. The source was confirmed: the outputs are 0.35 MB and 0.49 MB, not the ~55 MB pinned fallback, and the D5 output contains `union TargetMeasure = Biomarker | Metric | Outcome | Condition` (line 753), which exists only in `final/schema/D5.graphql`.

```
$ for f in kernel+stubs kernel+D5+stubs: wc -c, wc -l, grep -c '^input ', '^enum ', '^type ', '^union '
kernel+stubs:    346,689 B, 6,838 lines, inputs 187, enums 35, types 117, unions 0
kernel+D5+stubs: 486,640 B, 9,351 lines, inputs 247, enums 50, types 149, unions 1
$ grep -c in kernel+D5+stubs.printed.graphql: ThresholdComparator 0, DosePeriod 0, StateEpisodeProperties 0, OPERATIONALIZED_BY 2
$ node scripts/schema-size.mjs $S/kernel+D5+stubs.printed.graphql
printed size 0.5 MB | printed lines 9,352 | input types 247 | object types 149 | enums 50 | Query fields 47 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned SDL, its default, not this input)
$ node packages/schema-workspace/dist/cli.js map --sdl $S/kernel+stubs.graphql --out $S/kernel+stubs.map.md
node types 15 | relationship fields 32 | distinct relationship types 13 | from→to pairs after expansion 79
$ node packages/schema-workspace/dist/cli.js map --sdl $S/kernel+D5+stubs.graphql --out $S/kernel+D5+stubs.map.md
node types 21 | relationship fields 38 | distinct relationship types 19 | from→to pairs after expansion 148
D5 rows: STEP_USES structural 13 (Subjectable ◇13) | OPERATIONALIZED_BY asserted 4 (TargetMeasure ∪4) | HAS_EDITION asserted 1 | HAS_STEP structural 1 | RESOLVES_TO_CONSTRAINT derived 1 | STATES_CONSTRAINT derived 1
```

Packet D5 compiled the same way, for comparison (packet K + packet D5 + the four node stubs without the enum stubs, `$S/stubs-packet.graphql`):

```
$ BKS_SCHEMA_PATH=$S/packetK+stubs.graphql ... print-schema $S/packetK+stubs.printed.graphql
wrote ... (342974 chars) in 1s  -> 342,998 B, 6,806 lines, inputs 187, enums 35, types 117
$ BKS_SCHEMA_PATH=$S/packetK+packetD5+stubs.graphql ... print-schema $S/packetK+packetD5+stubs.printed.graphql
wrote ... (476818 chars) in 2s  -> 476,842 B, 9,225 lines, inputs 244, enums 50, types 148
```

| measure (marginal over the kernel + same stubs) | packet D5 | final D5 | delta |
| --- | ---: | ---: | ---: |
| SDL bytes / lines | 27,906 / 538 | 29,856 / 535 | +1,950 / −3 |
| printed bytes | +133,844 | +139,951 | +6,107 |
| printed lines | +2,419 | +2,513 | +94 |
| input types | +57 | +60 | +3 |
| enums | +15 | +15 | 0 |
| object types | +31 | +32 | +1 |

The final D5 marginal enums (15) are its 13 own enums plus D1 QuantityComparator and D6 AmountBasis; in the assembled schema those two belong to D1 and D6. The packet's 15 were its own 15 (with ThresholdComparator and DosePeriod). The +3 inputs and +6,107 B come from the fourth TargetMeasure member (Condition, R-70), the AssertedRecordedProperties fields on OPERATIONALIZED_BY (R-26), and the longer QuantityComparator / AmountBasis value lists. These causes were read from the edits; they were not measured one by one.

Module counts (R-01 collapsed): 6 node types, 6 relationship types, 9 from→to pairs (HAS_EDITION 1, HAS_STEP 1, STEP_USES 1 (interface target counted once), STATES_CONSTRAINT 1, RESOLVES_TO_CONSTRAINT 1, OPERATIONALIZED_BY 4). Packet: 8 (OPERATIONALIZED_BY 3). Widest union: TargetMeasure, 4 members (≤ 6). Expanded pairs in this compile only: 148 − 79 = 69 (kernel Subjectable fields expand over the 6 new implementers; depends on the implementer count, not a module figure).

```
$ sha256sum final/schema/D5.graphql final/_work/registers/D5.*.yaml
7fb18a838e1b29b4576b4eedea3c20d0f86798b12cbc4fd21edf4f0e7a52a251  final/schema/D5.graphql
131874094a046326d0a9ca20e6325d8f16dbeb4ac48b18003d528b0c09acfccf  final/_work/registers/D5.node.yaml
44ed6dbd407d35a9f2f61762dd4a1d9b087bc1a1263058c3efce8102e5c0c9cf  final/_work/registers/D5.relationship.yaml
5ab9f79626b552e1b5933da431b95f66fd08a9741542029476e32ed6598e0862  final/_work/registers/D5.seams.yaml
```

## Not done here (other deliverables or owner)

- Fixture edits (fixture editor; fixtures are not under final/ yet):
  - R-80: rename PROTOCOL_AUTHORED_BY to AUTHORED_BY in `pregnancy-magnesium-upper-limit` (assertions.yaml:1162, intent.json:3031/3040) and `sleep-toolkit-unstructured` (assertions.yaml:696).
  - R-23: drop the cross-asserter `supersedesUid` in `sirolimus-label-interactions-harm` (assertions.yaml:163, 277).
  - R-35: change EXTRACTED_TEXT_BYTES to TOOL_RENDITION in three intents.
  - R-10: the `sleep-toolkit-unstructured` assertions.yaml:692 note still names StateEpisodeProperties.
  - R-82: fixture a10, a stated non-affiliation written as RECEIVES_VALUE_FROM NEGATIVE, re-keys to DISCLOSES_INTEREST NEGATIVE / DENIES. R-82 states the convention but rulings.yaml has no D5 edit-fixture row for it.
- R-70: the fixture request for the Condition pair goes in `final/requests.md`. Its request number belongs to the coordinator.
- R-50: question kinds for Q-D5-18 and Q-D5-25 (questions catalog). R-80 / R-78: the 03 Q-D5-13 pattern text (query patterns). Text edits to 09 and 11 (OQ closures) belong to those deliverables.
- R-42 was not ruled for D5 and was left unchanged: Protocol `identifierSchemes: [ISBN, DOI]`. A published-paper protocol's DOI would also identify the D3 Publication.
