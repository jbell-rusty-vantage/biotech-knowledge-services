# RUNLOG: schema candidate v2 synthesis (fast-track), 2026-10-08 to 2026-10-09

The S team's commands and their key outputs, stage by stage. Each section below is one `_runlog/<stage>.md` file, copied unchanged in stage order: the rulings, then the kernel and the 13 module editors, then the integrator, the deliverable stages (vocabularies, questions, query patterns, fixtures, the three cross-domain fixtures, migration, tooling, open questions), the verify-fix stage (`fix`), and the finalizer. The source files stay in `_runlog/`. Built by `bash <scratch>/synth/finalize/build-runlog.sh <final> <scratch>`; the finalizer's own commands are the last section.

- **Candidate:** `schema/final_biotech_schema_v2.graphql`, sha256 `c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793`.
- **Summary:** `00-SUMMARY.md`. Sizes: `size-report.md`. Nothing here is final until the owner accepts it on measurements and fixtures.
- **Worktree:** `biotech-knowledge-services-S`, branch `ft/schema-S`. Nothing was committed by the S agents; the coordinator commits.

## Packet-check results (run by the finalizer, 2026-10-09)

`for p in K D1 … D13: node scripts/packet-check.mjs $p` → exit 0 for all 14 packets; every report has `ok: true`, 0 errors and 0 warnings. The counts are packet-local, before synthesis.

| packet | ok | node types | rel types | pairs | questions | fixtures | budget n/r/p |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| K | true | 11 | 13 | 32 | 35 | 6 | 12/14/40 |
| D1 | true | 4 | 6 | 7 | 33 | 5 | 8/14/35 |
| D2 | true | 5 | 6 | 10 | 34 | 5 | 8/14/35 |
| D3 | true | 8 | 14 | 31 | 32 | 3 | 8/14/35 |
| D4 | true | 7 | 13 | 17 | 35 | 7 | 8/14/35 |
| D5 | true | 6 | 6 | 8 | 34 | 4 | 8/14/35 |
| D6 | true | 6 | 9 | 11 | 37 | 7 | 8/14/35 |
| D7 | true | 4 | 7 | 9 | 33 | 6 | 8/14/35 |
| D8 | true | 6 | 11 | 29 | 33 | 6 | 8/14/35 |
| D9 | true | 3 | 8 | 9 | 36 | 6 | 8/14/35 |
| D10 | true | 3 | 6 | 9 | 36 | 5 | 8/14/35 |
| D11 | true | 1 | 0 | 0 | 30 | 5 | 8/14/35 |
| D12 | true | 3 | 4 | 8 | 34 | 5 | 8/14/35 |
| D13 | true | 2 | 5 | 7 | 33 | 5 | 8/14/35 |

## Stage index

1. `_runlog/rulings.md` (13018 B)
2. `_runlog/module-K.md` (12389 B)
3. `_runlog/module-D1.md` (10652 B)
4. `_runlog/module-D2.md` (11766 B)
5. `_runlog/module-D3.md` (13837 B)
6. `_runlog/module-D4.md` (10384 B)
7. `_runlog/module-D5.md` (16199 B)
8. `_runlog/module-D6.md` (14507 B)
9. `_runlog/module-D7.md` (8417 B)
10. `_runlog/module-D8.md` (11491 B)
11. `_runlog/module-D9.md` (16007 B)
12. `_runlog/module-D10.md` (12852 B)
13. `_runlog/module-D11.md` (13148 B)
14. `_runlog/module-D12.md` (13369 B)
15. `_runlog/module-D13.md` (10731 B)
16. `_runlog/integrate.md` (11665 B)
17. `_runlog/vocabularies.md` (11598 B)
18. `_runlog/questions.md` (7357 B)
19. `_runlog/patterns.md` (30121 B)
20. `_runlog/fixtures.md` (14509 B)
21. `_runlog/xfx-compound.md` (18876 B)
22. `_runlog/xfx-product.md` (17073 B)
23. `_runlog/xfx-claim.md` (18355 B)
24. `_runlog/migration.md` (16870 B)
25. `_runlog/tooling.md` (7290 B)
26. `_runlog/openq.md` (10829 B)
27. `_runlog/fix.md` (30522 B)
28. `_runlog/finalize.md` (10990 B)

---

<!-- stage: _runlog/rulings.md -->

# Runlog: rulings stage (chief synthesizer), 2026-10-08

- **Worktree:** `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Nothing is committed; the coordinator commits.
- **Scratch:** `$S` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth`.
- **Writes:** only `final/decision-report.md`, `final/_work/rulings.yaml`, this file, and scratch under `$S/rulings/`. No packet, `workspace/`, `scripts/` or `packages/` file was touched. `.env` was never read.
- **Inputs:** the panel output from the three architects (slim C-01..C-43, coverage C-01..C-56, provenance C-01..C-57), passed in the computed task.

## Commands and key output

### Orientation and inputs
1. `git status --short | head; git log --oneline -3; ls schema/program/ …`
   - The packets are staged ("A"). HEAD is e484fd2. `final/` did not exist and was created with `mkdir -p schema/program/final/_runlog schema/program/final/_work`.
2. `cat fast-track/03-SYNTHESIS.md`, `00-DIRECTIVE.md`, `01-PACKET-CONTRACT.md`: deliverables, procedure, precedence.
3. `wc -l` over the 04, 09, 10 and 05 files of every packet (14,293 lines total). `ls $S $S/inv $S/synth`.
4. `cat $S/synth/arch-slim/RUNLOG-arch-slim.md`, `$S/synth/arch-coverage/runlog-architect-coverage.md`, `$S/synth/architect-provenance-runlog.md` and `$S/inv/inventory-final.md`. These are the architects' commands; the inventory shows only DERIVED_FROM and ASSESSES as multi-module relationship types.
5. `node -e` dump of `$S/inv/review-open-issues.json`: the open issues of all 14 packets were read.

### Kernel checks
6. `grep -n "ownership map|Editorial containers|Publication" packets/K/09-reasoning.md`
   - Line 103 lists Publication under D9.
   - Line 120 says "scholarly records: D3 publications are not D9 works".
   - 11-OQ 29 names the typed options for rendition grouping. This decides R-71 and R-43.
7. `grep '^type|interface|union|enum' packets/K/04-schema-proposal.graphql`: Source implements Entity & Subjectable.
8. `sed -n 55,135p packets/K/04-schema-proposal.graphql`: StateEpisodeProperties and AssertedEdgeProperties have identical 11-field bodies (R-10).
9. `grep 'properties: "StateEpisodeProperties"' packets/*/04*`: D3:459 HAS_REGISTRATION_VERSION, D5:344 HAS_EDITION, D6:336 HAS_LABEL_VERSION.
10. `grep -i "at most one|unique" packets/K/identifier-schemes.yaml packets/K/09-reasoning.md`: no uniqueness rule exists today (R-42).
11. `grep RENDITION_OF packets/D9/04-schema-proposal.graphql`: StructuralEdgeProperties, direction IN on MediaWork.renditions.
12. `grep supersedesUid packets/K/09-reasoning.md packets/K/04-schema-proposal.graphql`: no rule on supersession across asserters (R-23).
13. `awk '/^enum AssertionKind/' K/04`: FIELD, CLAIM, METRIC, RELATIONSHIP, COMPUTATION (R-14).
14. `grep VersionedState packets/*/04 packets/*/09`: found in D3 04 and K 09.

### Domain SDL checks
15. D2:
    - `grep '^type|^union|^enum OutcomeKind|ConditionKind' packets/D2/04*` and the D5/D3 unions.
    - TargetMeasure = Biomarker | Metric | Outcome.
    - OutcomeMeasureTarget = Metric | Biomarker | Outcome | Condition.
16. `sed -n 396,438p packets/D2/04*` and `grep -A14 "name: Outcome" packets/D2/06*`:
    - Outcome lists LOINC.
    - whyNode cites Q-D2-26, -07, -20 and -14.
17. Question values: a `grep '^| <id> |'` loop over 32 ids in `packets/*/02-questions.md`.
    - Q-D2-26, -07, -20 and -14 are v2.
    - Q-D3-04, Q-D3-05, Q-D8-23, Q-D4-08, Q-D11-11, Q-D6-16 and Q-D2-09 are v1.
    - Q-D8-06, Q-D8-11 and Q-D1-10 are v2.
    - Shared-id value conflicts: CQ-AX-24 (D10 v1 / D3 v2), CQ-EV-05 (D3 v1 / K v2), CQ-PF-03 (D8 v1 / D6 v2) (R-08).
18. `grep OQ-D5-45|OQ-D5-43 packets/D5/11*`, `grep '^| 8 ' packets/D3/11*`, `grep OPERATIONALIZED_BY packets/*/07-fixtures/*/assertions.yaml`:
    - The D5 antioxidant fixture has 4 OPERATIONALIZED_BY rows.
    - D3 #8 is narrowed to Condition (R-70).
19. Predicate registry scan (R-52, R-53):
    - Command: `node $S/rulings/preds.mjs packets` (yaml@2.9.1 parses every 05 `predicateOnly`).
    - Result: 257 entries, 230 distinct names.
    - Duplicates: CAUSES_ADVERSE_EFFECT (D12, D5); CONTRACT_MANUFACTURES_FOR (D7, D8); FIELD_NOT_REPORTED (D4, K); FINANCING_AMOUNT (D13, D7); HAS_REVISION_STATUS (D13, K); the 5 target predicates (D1, D12, D5, plus D6 and D8 for INTENDED_FOR_TARGET); MANUFACTURES (D6, D7, D8); OFFERS_INTERVENTION (D5, D6); RATES_CLAIM (D8, K); RECOMMENDS_AGAINST (D10, D5); RECOMMENDS_USE (D7, D9); RECORDING_OF (D13, D9); SUCCEEDED_BY (D6, D7); SUPPLIES_MATERIAL (D1, D7).
    - The full list is in `$S/rulings/preds-all.txt`.
20. `grep MANUFACTURER_STATEMENT|SOLE_SUPPLIER_OF|MANUFACTURES|PREPARED_WITH|ENDORSES_PRODUCT|DISTRIBUTES` in the D6, D7, D8 and D9 05 files:
    - D7 05:178 says MANUFACTURER_UNNAMED "replaces … D6 MANUFACTURER_STATEMENT".
    - D6 SOLE_SUPPLIER_OF is already removed (R-68).
21. `grep '^union' packets/*/04*`: 18 unions, the widest being AdministeredMaterial with 6.
    - D8 RegulatoryRecordTopic and LegalStatusSubject include Device.
    - QualityResultFor = Lot | Product.
    - PatentTopic = ChemicalSubstance | IngredientMaterial.
22. Fixture checks with `grep` for D8 QUALITY_RESULT_FOR and CONCERNS:
    - QUALITY_RESULT_FOR objects are all Lot.
    - The CONCERNS Patent object is D1.ChemicalSubstance.
    - CONCERNS/STATUS_OF → Device appears in 0 fixtures.
    - The D4 cgm-recall note (line 308) reaches the Device through Product (R-72, R-73).
23. `grep OQ-D8-32|29|34 packets/D8/11*`: six unfixtured pairs; the labeler-of-record asserter; the request for a supersession rule.
24. `grep MEASURED_CONTENT_IN_PRODUCT|CONTAINS_UNDECLARED|SAMPLE_POSITIVE_OUTBREAK_STRAIN packets/*/07-fixtures`: only D6 recall-moringa-mogo matches; the D1 predicates have no fixture.
25. Enum dump loop (`awk '/^enum X /'`) for 21 enums:
    - EventKind contains PUBLICATION and RETRACTION.
    - EventRole contains AUTHOR and PUBLISHER, and lacks AWARDING_BODY and AWARDEE.
    - Comparator values in D1, D5 and D8; QuantityBasis, DosePeriod and AmountBasis values.
    - MechanismDirection vs EstimateDirection.
    - ProductKind, PanelKind, ComponentLineRole and LegalStatusKind have no Rx values.
    - D10 AssociationKind; K SourceRevisionKind.
26. `grep PUBLICATION|AUTHOR|PUBLISHER packets/D13/07-fixtures/*`:
    - No `eventKind: PUBLICATION`.
    - lesne-2006-retraction uses INVOLVES PUBLISHER/AUTHOR at lines 246–349 (R-44).
27. Seam and SDL spot checks:
    - `grep time-restricted packets/D5/04*`: lines 44 and 285.
    - `grep -i conference packets/D9/06*`: line 119.
    - `grep OPERATED_BY|COVERS packets/D7/10-seams.yaml`: lines 27 and 48.
    - `grep HOLDS_EQUITY_IN packets/D2/03*`: line 628.
    - INVESTIGATES questions: [Q-D3-10].
    - `grep -c "@mutation(operations: [])"` = the `@node` count in every module.
    - No `@fulltext`/`@vector` anywhere.
    - `@node(labels` shows "Entity" on MechanismEvidenceContext, Association and CaptureAttempt.
28. Interfaces and identity checks:
    - `grep "^type DecisionCriterion|Association|ReportItem|MechanismEvidenceContext|CaptureAttempt"`: implements lines.
    - D6/D7 Verbatim and currency fields: D6 lines 53, 65, 67; D7 lines 52, 80, 102.
    - D1 OQ-D1-26.
    - vocab pin greps across the 10-seams files.
29. `grep "25.4|38.8|11.6|8,609|14,028|22,369|2.9 KB|4,069|4,030"` over the 09/11 files and K lever-experiments, to locate the packet-reported numbers.
    - D7 09 states "costs 25 KB and 12 inputs more than Shape A".
    - D5 09 D-05 states "+2.9 KB / +8 inputs".
30. The D10 answer-kind table: `grep disagree|shared` plus `awk` of the Disagreements block (17 rows, 5 shared-id kind conflicts, the CQ-PF-03 split). The rows for CQ-CL-06, Q-D9-08 and Q-D9-19 are declared and ruled materialized (lines 429, 444, 455) (R-49, R-50).
31. Shared enum declarations: `grep '^enum (MassBasis|SexScope|PartitionSex|ModelOrganism|ContentStatementKind|AmountBasis)'` finds one declaration each (R-56). D11 registry: `readiness-scorecard.md` line 7 reads "167 merged entries … 402 packet-local aliases", and `grep -c '^  - id:'` = 167 (R-39).
32. D2 MechanismProjectionProperties (lines 196–220) and facet usage in D2 03:
    - `highestSetting`: line 211, under Q-D2-02.
    - `nHumanContexts`: line 335, under Q-D2-06.
    - `nNoChangeContexts`: line 561 only, under Q-D2-18 (R-47).
33. D2 ContextExposure fixtures: EXPOSED_TO → D1.ChemicalSubstance (dasatinib, quercetin) in dq-senescence lines 19–22 and 101–109, plus metformin-exercise-harm and nr-muscle-unstructured (R-86).
34. DOI/PMID identifiers in the K and D3 fixtures attach to D3.Publication (5) and never to Source (R-42).
35. Name collisions: `comm -12` of the relationship-type names from all 04 files (106) against the registered predicate names gives HAS_IDENTIFIER, HOLDS_ROLE, HOLDS_STAKE and RECEIVES_VALUE_FROM (R-53).
36. Hub check: an `awk` count of `@relationship` per type puts the maximum at 8 (K Assertion). No hub exceeds 12.
37. Stale seams:
    - `grep PanelDefinition|LabTest packets/D10/10-seams.yaml`: LabTest is present (line 71).
    - `grep "Compound\b|D9.Publication|D9.Conference" packets/D13/10-seams.yaml`: no seam rows.
    - `grep VersionedState`; `grep OQ-D6-02`.

### Measurements
38. `for m in K D1..D13: cmp $S/arch-slim/mods/<m>.graphql packets/<m>/04-schema-proposal.graphql`: all 14 are "same". The architects' assembly equals the packets.
39. Re-measured the slim variant prints with `wc -c`, `grep -c '^input '` and `grep -c '^enum '`:

    | print | bytes | input types | enums |
    | --- | ---: | ---: | ---: |
    | printed (baseline) | 1,735,059 | 975 | 204 |
    | pr-state | 1,728,062 | 973 | 204 |
    | pr-outcome | 1,726,708 | 971 | 203 |
    | pr-device | 1,733,944 | 972 | 204 |
    | pr-d8unfix | 1,732,756 | 968 | 204 |
    | pr-enums | 1,733,476 | 971 | 200 |
    | printed-v (all) | 1,714,710 | 955 | 199 |

40. `node $S/arch-slim/pairs.mjs` on each assembly:

    | assembly | collapsed pairs | expanded pairs | Subjectable implementers | Entity implementers |
    | --- | ---: | ---: | ---: | ---: |
    | assembled | 184 | 851 | 56 | 69 |
    | asm-state | 184 | 851 | | |
    | asm-outcome | 183 | 838 | | |
    | asm-device | 181 | 848 | | |
    | asm-d8unfix | 182 | 849 | | |
    | asm-enums | 184 | 851 | | |
    | assembled-v | 178 | 833 | | |

41. Baseline print-schema re-run:
    - Command: `BKS_SCHEMA_PATH=$S/arch-slim/assembled.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $S/rulings/printed-baseline.graphql`
    - Output: "wrote … printed-baseline.graphql (1734771 chars) in 2s".
    - Measured 1,735,059 B (not ~55 MB, so the scratch SDL was used), 975 inputs, 204 enums, 0 Mutation fields. Wall time was 1m04s including pnpm startup.
42. Assembly and print of the adopted combination:
    - Commands:
      - `cp -r $S/arch-slim/mods $S/rulings/mods-adopted && node $S/arch-slim/variant.mjs $S/rulings/mods-adopted state,device,d8unfix,enums` → "ok state,device,d8unfix,enums".
      - `node scripts/assemble-schema.mjs --modules $S/rulings/mods-adopted --out $S/rulings/asm-adopted.graphql` → 304 types.
      - `node $S/arch-slim/pairs.mjs $S/rulings/asm-adopted.graphql` → collapsed 179, expanded 846.
      - `BKS_SCHEMA_PATH=$S/rulings/asm-adopted.graphql … print-schema $S/rulings/printed-adopted.graphql` → "(1722773 chars) in 2s".
    - Measured 1,723,061 B, 959 inputs, 200 enums.
    - Deltas checked with `echo $((…))`:
      - Adopted combination: 11,998 B.
      - Single variants: state 6,997; device 1,115; d8unfix 2,303; enums 1,583; outcome 8,351.

### Outputs and validation
43. Wrote `final/decision-report.md`:
    - 94 rulings, R-01..R-94: `grep -c '^#### R-'` = 94, numbered without gaps.
    - 9 owner decisions: `grep -c 'Owner decision:\*\* yes'` = 9.
    - The "## Cuts to budget" placeholder is in place.
44. Wrote `final/_work/rulings.yaml`. Validation with `node $S/rulings/check-yaml.mjs final/_work/rulings.yaml` (yaml@2.9.1) parses it:
    - 14 modules and 275 edits. Per module: K 46, D1 11, D2 17, D3 22, D4 8, D5 34, D6 23, D7 22, D8 24, D9 13, D10 15, D11 9, D12 11, D13 20.
    - 83 rulings are cited by edits or global rules. The other 11 (R-11, R-32, R-33, R-34, R-36, R-40, R-61, R-64, R-77, R-90, R-91) are listed under `global.noModuleEdit`.
    - Two flow-sequence quoting fixes were applied with `sed` before the parse passed.

## Not done in this stage
- The final candidate was not assembled with all the rulings applied. That is the integrator's job: R-43 and R-70 add pairs, and R-57, R-58, R-30 and R-47 are not printed.
- No Cypher was run against bks-neo4j-synth. The rulings change no pattern shape that needed an EXPLAIN here; the pattern edits are listed per module.
- `final/requests.md` is not written. The fixture requests are listed in rulings.yaml under R-70 and R-73 for the stage that writes requests.md.

---

<!-- stage: _runlog/module-K.md -->

# Module K — kernel editor run log (S team, 2026-10-08)

## Kernel changes in synthesis (domain editors: follow these)

Two of these break the published kernel pattern (packets/K/09-reasoning.md). They are marked **non-additive**.

1. **Non-additive. `StateEpisodeProperties` is removed (R-10).** Edges that attach an entity to a versioned state use `AssertedEdgeProperties`: D3 HAS_REGISTRATION_VERSION, D5 HAS_EDITION and D6 HAS_LABEL_VERSION. Their 05 entries carry the new register field `exclusive: true`, and the executor enforces non-overlap per relationship type. The M11 verbatim-base list is now AssertedEdgeProperties, AssertedRecordedProperties, StructuralEdgeProperties and **DerivedEdgeProperties** (added by R-47). A domain superset type based on StateEpisodeProperties now copies AssertedEdgeProperties; the field list is identical.
2. **Non-additive, by extension of pattern item 11. RENDITION_OF has kernel meaning (R-43).** It runs Source → D9 MediaWork | D3 Publication. It is asserted with recorded time only (`AssertedRecordedProperties`, `[CONNECT]`) and is declared IN on `MediaWork.renditions` and `Publication.renditions`. D3 registers it. The kernel-meaning types are now DERIVED_FROM, ASSESSES, MENTIONS and RENDITION_OF. Source family is the OCCURS_IN work, else the RENDITION_OF work, else the Source.
3. `Assertion.validObservedAtPrecision: TimePrecision` is added (R-24).
4. `BasisKind.CURATOR_CLASSIFICATION` is added (R-25). Use it for ON_FRONTIER, the D2 hallmark mapping, D5 OPERATIONALIZED_BY and D4 curator attachments.
5. `SourceRevisionKind` (K) is the only revision vocabulary (R-44). D3 REVISES records a revising work once it is identified. HAS_REVISION_STATUS is only for non-scholarly Sources and for flags with no notice. One (asserter, notice) is never recorded both ways.
6. ASSERTED_BY also admits D3 Publication and D9 MediaWork, for a multi-author work's own voice (R-15, P20).
7. The kernel predicate conventions have registrar K (R-52): FIELD_NOT_REPORTED, HAS_REVISION_STATUS, RATES_CLAIM, CORRECTS (new), HAS_IDENTIFIER, CITES_AS_SUPPORT and HAS_CREDENTIAL. Domains remove their own registrations of these.
8. Only D10 ASSOCIATES and D5 STEP_USES may target Subjectable outside the kernel-meaning types (R-28).
9. `contentHashBasis` has five values (R-35): RAW_BYTES, CANONICAL_PROJECTION, TOOL_RENDITION, STORED_EXCERPT_TEXT and SYNTHETIC_FIXTURE.
10. `DerivedEdgeProperties.score` is a retrieval score only. It is never set between two domain entities (R-47).

The rest are docstring changes in `kernel.graphql`, made only to align it with R-09, R-14, R-16, R-18, R-19, R-20, R-22, R-23, R-31, R-37, R-38 and R-42. None of them changes a type or a field.

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-09 to R-53 read in full for the kernel); `final/_work/rulings.yaml` (`global`, `modules.K`, and every other module's rows that name a K type).

```
$ sha256sum packets/K/04-schema-proposal.graphql packets/K/05-relationship-register.yaml packets/K/06-node-register.yaml packets/K/10-seams.yaml
b2c2b1b0094ead58428513868e38fa893f72d977adbc66ae7a89924a8cb7d5c7  packets/K/04-schema-proposal.graphql
4d296e0ea5fdf0d42b627b699504f1c82aebd333bd6079130356ec85b16ed9bf  packets/K/05-relationship-register.yaml
b1c9fd55358d664a668cbb1792c261931eb1e868be779406b9ec1e6663676dca  packets/K/06-node-register.yaml
47d2e171ff797457a1942689560fa7c49eae3193f97754a34469798cf5b10937  packets/K/10-seams.yaml
```

## Commands

```
$ mkdir -p final/schema final/_work/registers final/_runlog
$ cp packets/K/04-schema-proposal.graphql final/schema/kernel.graphql
```

The SDL edits were made with the Edit tool. The banner `# ---- fragment K ----` stays on line 1.

| ruling | SDL edit |
| --- | --- |
| R-10 | removed `type StateEpisodeProperties`; AssertedEdgeProperties docstring now states the `exclusive: true` rule |
| R-22 | AssertedEdgeProperties docstring: projection gate and one episode per (from, to, type, asserter) |
| R-24 | `Assertion.validObservedAtPrecision: TimePrecision`; qualifier `sourceRecordRemovedAt:` in the qualifiers docstring |
| R-25 | `BasisKind.CURATOR_CLASSIFICATION` (placed before UNSTATED), with the enum docstring |
| R-47 | `DerivedEdgeProperties.score` docstring; M11 base |
| R-44 | `SourceRevisionKind` docstring; `SourceSnapshot.revisionKind` is a capture cache; HAS_REVISION_STATUS convention in the Assertion docstring |
| R-09, R-43, R-26 | Source docstring (D9 containers MediaWork and Channel; D3 Publications; RENDITION_OF; source family; curation files as Sources) |
| R-43 | `Report.distinctSourceFamilyCount` docstring |
| R-35, R-37 | `contentHashBasis` five values; `contentHash` identity vs `canonicalProjectionHash` change detection; durable `storageUri` |
| R-38 | `SourceLocator.selectorJson`: `basis` is mandatory |
| R-15, R-16 | Assertion docstring (asserter defaults); `assertedBy` field docstring (Publication, MediaWork) |
| R-14, R-19, R-20, R-23, R-31, R-52 | Assertion docstring (FIELD / RELATIONSHIP / CLAIM kinds; CORRECTS; RATES_CLAIM object slot; supersedesUid same asserter) |
| R-20 | Assessment docstring: `occurrence=` facet, "and the speaker" |
| R-18, R-28 | Subjectable docstring (versioned-state rule; the two domain exceptions) |
| R-42 | Identifier docstring (uniqueness) |

Registers were built from the packet's 05, 06 and 10 files. Every entry keeps every contract field and adds `module: K`.
- `K.relationship.yaml` is written by hand from 05.
- `K.node.yaml` is built from 06 by a Python string-replace script (stdin). Each replace was asserted to match exactly once.
- `K.seams.yaml` is written by hand from 10.

```
$ python - <<'EOF' ... (K.node.yaml build) ... EOF
13                       # occurrences of "module: K" (top + 11 nodes + header comment)
$ python -c "yaml.safe_load(...)"   # per file
K.node.yaml {'version': 1, 'module': 'K', 'nodes': 11, 'deferred': 10, 'mergedInto': 33}
K.relationship.yaml {'version': 1, 'module': 'K', 'relationships': 13, 'predicateOnly': 6, 'authorizingPredicates': 1, 'deferred': 43}
K.seams.yaml {'version': 1, 'module': 'K', 'seams': 27, 'predicateSeams': 1, 'sharedVocabularies': 6}
```

Contract-field and SDL cross-check (Python, yaml + regex over `kernel.graphql`):

```
rel missing: []
node missing: []
seam missing: []
13 True                      # relationship types in SDL == register entries
predicateOnly & relTypes: set()
11 True                      # node types in SDL == node register
relationshipProperties types: ['AssertedEdgeProperties', 'DerivedEdgeProperties', 'StructuralEdgeProperties', 'AssertedRecordedProperties', 'IdentifierLinkProperties', 'EvidenceEdgeProperties']
```

Compiling the kernel alone with print-schema:

```
$ BKS_SCHEMA_PATH=C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/schema/kernel.graphql \
  NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema \
  C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-K/kernel.printed.graphql
wrote ...\synth\module-K\kernel.printed.graphql (326571 chars) in 1s
wall: 7 s
$ wc -c -l kernel.printed.graphql      -> 6498 lines, 326595 bytes
$ grep -c '^input '                    -> 179
$ grep -c '^enum '                     -> 35
$ grep -c '^type '                     -> 105
$ grep -c validObservedAtPrecision     -> 5
$ grep -c CURATOR_CLASSIFICATION       -> 2
$ grep -c StateEpisodeProperties       -> 0
```

The print-schema log does not name the SDL it used. I confirmed the source in two ways: the output is 0.3 MB, not the ~55 MB pinned fallback, and it contains the two additions made only in `final/schema/kernel.graphql` (`validObservedAtPrecision`, `CURATOR_CLASSIFICATION`).

Comparison with the K packet SDL compiled the same way:

```
$ BKS_SCHEMA_PATH=.../packets/K/04-schema-proposal.graphql ... print-schema .../synth/module-K/K-packet.printed.graphql
wrote ... (322880 chars) in 1s
-> 6466 lines, 322904 bytes, 179 inputs, 35 enums, 105 types, StateEpisodeProperties 0
```

| measure | K packet | final kernel | delta |
| --- | ---: | ---: | ---: |
| SDL bytes / lines | 51,355 / 1,171 | 56,040 / 1,190 | +4,685 / +19 |
| printed bytes | 322,904 | 326,595 | +3,691 |
| printed lines | 6,466 | 6,498 | +32 |
| input types | 179 | 179 | 0 |
| enums | 35 | 35 | 0 |

When the kernel is compiled alone, removing StateEpisodeProperties saves 0 printed bytes: no kernel field uses it, so it never reached the printed output. Its saving shows only in the assembled schema (decision report, −6,997 B and −2 inputs, measured in the state variant). The +3,691 B comes from docstrings and the one new field.

```
$ node packages/schema-workspace/dist/cli.js map --sdl .../final/schema/kernel.graphql --out .../synth/module-K/kernel-map.md
"schemaDigest": "sha256:ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71"
node types 11 | relationship fields 32 | distinct relationship types 13 | from→to pairs after expansion 47 (kernel alone: Subjectable has 3 implementers)
$ node scripts/schema-size.mjs .../synth/module-K/kernel.printed.graphql
printed size 0.3 MB | printed lines 6,499 | input types 179 | object types 105 | enums 35 | Query fields 26 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned SDL, which is its default, not the kernel)
$ sha256sum final/schema/kernel.graphql final/_work/registers/K.*.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
5409bbe9ee92c6dcc3a897ccbadd97ea843b24a139a7f76addee267a6ebf1ab4  final/_work/registers/K.node.yaml
90243b5c2ee5a18f62b20a9e528f0e4a5c850a040aa6c64f791fcf16d994d170  final/_work/registers/K.relationship.yaml
bcc2b8b113d45779a87a825c3e17f82549494e1b1547f50fa30a26dbc9bd8b5e  final/_work/registers/K.seams.yaml
```

## Register edits (summary)

- **Relationship register:**
  - `module: K` is added to every entry.
  - ASSERTED_BY: the cardinality and rationale follow R-15 and R-16.
  - DERIVED_FROM: the rationale follows R-11, R-20, R-21 and R-48. citesAssociations stays cut.
  - HAS_IDENTIFIER: the uniqueness rule from R-42.
  - predicateOnly: every entry gets `registrar: K`, and CORRECTS is added (R-20, R-52). The meanings of RATES_CLAIM (R-31), HAS_REVISION_STATUS (R-44) and FIELD_NOT_REPORTED (R-16) are updated.
  - HAS_IDENTIFIER moves to a new list, `authorizingPredicates`, under R-53.
  - deferred: CORRECTS is added. The reasons for RENDITION_OF (R-43), ANNOUNCED_IN and REVISES_SOURCE (R-44) and RESOLVES_MENTION (R-27) are updated.
- **Node register:**
  - `module: K` is added to every entry.
  - Assertion `otherProperties` goes from 17 to 18 (R-24).
  - The Source whyNode is updated (R-43, R-42).
  - The Mention, RetractionNotice and SourceRevisionEvent rows are updated (R-09, R-44).
- **Seams:**
  - Removed: DERIVED_FROM ReportItem→Association and BLOCKED_BY ReportItem→Assertion (R-09).
  - Added: RENDITION_OF Source→D3.Publication (R-43), REVISES D3.Publication→D3.Publication (R-44), STEP_USES D5.ProtocolStep→Subjectable (R-28) and HOLDS_ROLE D7.Person→D7.Organization (R-15).
  - A new `predicateSeams` list holds AUTHORED_BY, registrar D3 (R-94, R-15).
  - Notes are updated on MENTIONS (R-27), OCCURS_IN (R-19), RENDITION_OF→MediaWork (R-43), ASSERTED_BY (R-15), ASSOCIATES (R-28, R-48), OBSERVED_IN_CONTEXT and RESOLVES_TO_CONSTRAINT (R-29, R-76), and WAS_GENERATED_BY CaptureAttempt (R-41, R-17, R-09).
  - sharedVocabularies point at `final/` (R-09). Pins are targets 0.2.2 and frontiers 0.2.1 (R-60). The predicates and assessment-vocabularies registers are added (R-52, R-54).

## Not done here (other deliverables or owner)

- Text edits to 09-reasoning, 03-retrieval-patterns, 02-questions and 11-open-questions. These cover R-09, R-10, R-14 to R-31, R-37, R-38, R-43, R-44, R-45, R-46, R-48, R-49, R-50 and R-76. They belong to query-patterns, questions-catalog and open-questions.
- The `identifier-schemes.yaml` edits for R-42 (new schemes, normalizationRule ids, the uniqueness rule). They belong to the vocabulary editor.
- R-12 and R-13 are owner confirmations. The removals in R-09 and R-10 are non-additive and wait for owner confirmation.

---

<!-- stage: _runlog/module-D1.md -->

# Module D1 — module editor run log (S team, 2026-10-08/09)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-03, R-06, R-07, R-10, R-14, R-27, R-28, R-30, R-42, R-47, R-50, R-52 to R-58, R-64, R-68, R-72, R-73, R-84 to R-94 read for D1); `final/_work/rulings.yaml` (`global`, `modules.D1`, and the rows of D2, D3, D5, D6, D8, D12, D13 that name a D1 type or a D1 seam); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` "Kernel changes in synthesis"; `packets/D1/` 04, 05, 06, 10, 09, 11; `scratchpad/inv/review-open-issues.json` (D1).

```
$ sha256sum packets/D1/04-schema-proposal.graphql packets/D1/05-relationship-register.yaml packets/D1/06-node-register.yaml packets/D1/10-seams.yaml final/schema/kernel.graphql final/_work/rulings.yaml
1c677704dddce7c0fab179dc1645573b8c56e715a3ae0c42702677476c678e0d  packets/D1/04-schema-proposal.graphql
32ff110c0afa6c8f061eb8b341d6f4e69a881ceb3794304f688b5cfa74f52911  packets/D1/05-relationship-register.yaml
05a604428b6f0e2343279e627de336a3fa14d3a7a51b6cc71e8c4c1d871ec8c8  packets/D1/06-node-register.yaml
2ae098bb26ec1e5d16964efdb90f2628be2f3462423d6d2bdcace9920e7e6612  packets/D1/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
19dba4c3c822d3cbee75f232a015ca4ca6719eb4e8b3dc508ecb1f218123ac81  final/_work/rulings.yaml
$ cp packets/D1/04-schema-proposal.graphql final/schema/D1.graphql
```

## SDL edits (`final/schema/D1.graphql`, banner `# ---- fragment D1 ----` kept on line 1)

| ruling | edit |
| --- | --- |
| R-57 | `QuantityComparator` + OUTSIDE_REFERENCE_RANGE, ABSENT, CONFORMS_TO_DESCRIPTION, REFERENCE_ONLY, UNKNOWN (appended after the seven existing values, so existing values keep their order); docstring names the consumers D5, D8, D12 and the D8 mapping |
| — | header comment: synthesis line (rulings applied; registers carry the predicate and seam rulings; DERIVED_FROM_TAXON stays D1's typed edge, R-53) |

Nothing else changed in the SDL. Checked against the global rules: no `@fulltext`/`@vector` (R-04); `@filterable(byAggregate:false)` and `@mutation(operations: [])` on every type and relationship (R-02); every D1 edge is asserted with `[CONNECT]` (R-03); no StateEpisodeProperties (R-10); D1 declares no relationship to a type outside D1 (no union, no Subjectable target, R-05/R-28); MassBasis and ContentStatementKind declared once, here (R-56). The retired enum names appear nowhere in the SDL (docstrings say "retired D5 threshold / D8 spec enum").

## Registers (`final/_work/registers/D1.{node,relationship,seams}.yaml`)

Written by hand from 06, 05 and 10; every entry keeps the contract fields and adds `module: D1`; fixtures point at `final/fixtures/D1/<folder>`.

- **relationship:** 6 types unchanged. predicateOnly: + PHYSICAL_FORM, MATERIAL_GRADE, PLANT_PART, EXTRACT_RATIO as FIELD predicates of the IngredientMaterial properties (R-14); + SOURCED_FROM_COUNTRY (R-52); + EXCEEDS_DOSE_THRESHOLD with `storage: report-only` (R-85); − SUPPLIES_MATERIAL, MANUFACTURES_MATERIAL (R-68, D7 registers SUPPLIES_MATERIAL / MANUFACTURES); − the five target predicates (R-52, D5 registers); MEASURED_CONTENT_IN_PRODUCT / CONTAINS_UNDECLARED_SUBSTANCE subject D6 Product | ProductVariant, surveys without a lot only (R-73). Every predicateOnly entry carries `registrar: D1`. MATERIAL_CONTAINS rationale now states the four ContentEdgeProperties qualifiers the SDL declares and the R-64 alignment with D12 (the packet 05 text still described the statementKind-only option). Deferred list + MANUFACTURES_MATERIAL, SUPPLIES_MATERIAL, target predicates.
- **node:** 4 types unchanged. `mutations` → `{ graphql: none, executor: [create, update] }` (R-03, from the packet mutationNote). whyNode text: R-73 (patents concern only ChemicalSubstance), R-14, R-85 (Constituent subject of HAS_UPPER_LIMIT), R-90 (Taxon = source organisms only).
- **seams:** relationship `seams` (21 rows; 19 accepted, 2 cut: AFFECTS_MECHANISM → D2.MolecularEntity, R-94; CONCERNS D8.Patent → D1.IngredientMaterial, R-73), `predicateSeams` (30 rows, all accepted, registrar per R-52; new rows SAMPLE_TESTED_POSITIVE_FOR R-73, HAS_APPROVED_INDICATION R-88, HAS_ACTION_LEVEL R-93, SOURCED_FROM_COUNTRY R-52), `facetSeams` (plantPart= on D5 SAFETY_SIGNAL, R-54), sharedVocabularies pointing at `final/vocabularies/` and `final/schema/kernel.graphql`, providedVocabularies (QuantityComparator consumers D5, D8, D12). Each row carries `status` and `ruling` (`none` = no ruling touches the row).

Cross-check (Python, yaml + regex):

```
node {'version': 1, 'module': 'D1', 'nodes': 4, 'deferred': 4, 'mergedInto': 12}
relationship {'version': 1, 'module': 'D1', 'relationships': 6, 'predicateOnly': 18, 'deferred': 18}
seams {'version': 1, 'module': 'D1', 'seams': 21, 'predicateSeams': 30, 'facetSeams': 1, 'sharedVocabularies': 6, 'providedVocabularies': 4}
rel types 6 True          # SDL relationship types == register entries
nodes 4 True              # SDL node types == node register
rel missing [] / node missing [] / seam missing [] / pseam missing []
predicateOnly & all relationship types (packets/*/04 + final/schema/*.graphql): set()
status counts {'accepted': 50, 'cut': 2}
D1-registrar predicateSeams not in predicateOnly: []
name collisions with kernel: set() ; with other final modules present (D2, D3, D5, D7, D12, D13): set()
```

## Compile check

D1 declares no edge to another module's type, so no seam stubs were needed: kernel + D1 only.

```
$ SYN=C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D1
$ cp final/schema/kernel.graphql final/schema/D1.graphql $SYN/mods/
$ node scripts/assemble-schema.mjs --modules $SYN/mods --out $SYN/K+D1.graphql
{ "ok": true, "modules": 2, "types": 70 }
$ BKS_SCHEMA_PATH=$SYN/K+D1.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $SYN/K+D1.printed.graphql
wrote ...\module-D1\K+D1.printed.graphql (425403 chars) in 1s          # wall 21 s incl. pnpm/tsx start-up
$ BKS_SCHEMA_PATH=$SYN/mods/kernel.graphql ... print-schema $SYN/kernel.printed.graphql
wrote ...\module-D1\kernel.printed.graphql (326571 chars) in 2s
$ # packet D1 SDL against the final kernel, for comparison
$ BKS_SCHEMA_PATH=$SYN/K+D1packet.graphql ... print-schema $SYN/K+D1packet.printed.graphql
wrote ...\module-D1\K+D1packet.printed.graphql (424864 chars) in 2s
```

Source confirmed: outputs are 0.3–0.4 MB (not the ~55 MB pinned fallback) and `K+D1.printed.graphql` contains `CONFORMS_TO_DESCRIPTION` (2 hits), a value that exists only in `final/schema/D1.graphql`. The print-schema log does not name the SDL path.

| measure | kernel alone | kernel + D1 (final) | marginal D1 | kernel + D1 (packet) |
| --- | ---: | ---: | ---: | ---: |
| SDL bytes / lines | 56,040 / 1,190 | 77,829 / 1,620 (assembled) | D1.graphql 21,114 / 417 | packet 04: 20,064 / 401 |
| printed bytes | 326,595 | 425,451 | **+98,856** | 424,910 |
| printed lines | 6,498 | 8,373 | +1,875 | 8,363 |
| input types | 179 | 230 | **+51** | 230 |
| enums | 35 | 48 | +13 | 48 |
| object types | 105 | 134 | +29 | — |

The final D1 costs +541 printed bytes and 0 inputs over the packet SDL on the same kernel (the 5 enum values and docstring). `wc` / `grep -c '^input '` / `grep -c '^enum '` / `grep -c '^type '` on each printed file.

```
$ node packages/schema-workspace/dist/cli.js map --sdl $SYN/mods/D1.graphql --out $SYN/D1-map.md
"schemaDigest": "sha256:eb0537ff69c0a19719440daeae0241ba77769ecf35460534402c628b4b587e0c"
node types 4 | relationship fields 7 | distinct relationship types 6 | from→to pairs 7 | edge property profiles 1 | unions 0 | enums 14
$ node packages/schema-workspace/dist/cli.js map --sdl $SYN/K+D1.graphql --out $SYN/K+D1-map.md
"schemaDigest": "sha256:a3d710e2296dbfe5a1b8db2f3006dcb0e91c5a2e87dd40ee10192b27ea16a431"
node types 15 | relationship fields 39 | distinct relationship types 19 | from→to pairs 86 (kernel alone 47: Subjectable grows from 3 to 7 implementers) | enums 46
$ node scripts/schema-size.mjs $SYN/K+D1.printed.graphql
printed size 0.4 MB | printed lines 8,374 | input types 230 | object types 134 | enums 48 | Query fields 34 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned default SDL, not this file)
```

Cypher shape check of the Q-D1-11 filter on the disposable Neo4j (bks-neo4j-synth, 5.26):

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** "EXPLAIN MATCH (t:Taxon)<-[:PARENT_TAXON*0..3]-(s:Taxon)<-[:DERIVED_FROM_TAXON]-(m:IngredientMaterial)-[c:MATERIAL_CONTAINS]->(k:Constituent) WHERE t.uid = 'hu:taxon:x' AND c.recordedTo IS NULL AND c.statementKind = 'STANDARDIZATION_CLAIM' AND c.comparator IN ['GTE','GT','EQ','APPROX'] AND c.quantity >= 2.5 AND c.unitCode = '%' RETURN m.uid, k.uid, c.quantity"
Planner: "COST" / Runtime: "SLOTTED"   exit 0
```

```
$ sha256sum final/schema/D1.graphql final/_work/registers/D1.*.yaml
eb0537ff69c0a19719440daeae0241ba77769ecf35460534402c628b4b587e0c  final/schema/D1.graphql
d68c2ca2e75eadcb6a3c10d54fae5baf58da01c9be62628c5e77db2650e844e1  final/_work/registers/D1.node.yaml
436b618d7fa750b4f7dc4fa0d87b552c12f3f61ea24bf02afe4d94fdcae96e6e  final/_work/registers/D1.relationship.yaml
7f7dfa3839fee6a20c6cf86d1646c33bb76810ff598c195c65005eb93f1b6c19  final/_work/registers/D1.seams.yaml
```

## Open for other S stages

1. Fixtures (not edited here): vitamin-b6-threshold-harm c10a–c10d write EXCEEDS_DOSE_THRESHOLD as stored COMPUTATION Assertions; R-85 puts them inside a published Report. nr-salt-moiety-us-canada p02 SUPPLIES_MATERIAL carries the free-text qualifier "single supplier"; D7's registration (R-68) uses `exclusivity=SOLE|NON_EXCLUSIVE|UNSTATED`, so the fixture editor re-keys it.
2. EXCEEDS_DOSE_THRESHOLD had no registrar in any packet; registered here as D1 report-only (R-85 assigns the edit to D1's register). Registry builder to confirm.
3. `global.retiredNames` lists DERIVED_FROM_TAXON; that is the retired D12 predicate spelling (R-53). D1's typed edge keeps the name; a name lint must not flag `@relationship(type: "DERIVED_FROM_TAXON")`.
4. D12 05 qualifier `comparator` still lists "GE | GT | LE | LT | APPROX" (D12's register); R-57 spelling is GTE / LTE (D12 editor).
5. Unfixtured D1 predicates: MEASURED_CONTENT_IN_PRODUCT / CONTAINS_UNDECLARED_SUBSTANCE (OQ-D1-30), no typed pair affected.
6. Q-D1-03 / Q-D1-19 / CQ-ST-02 answer kinds (R-50) live in the question catalog, not in these registers.

---

<!-- stage: _runlog/module-D2.md -->

# Module D2 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md`: R-01–R-08, R-15, R-17, R-25, R-26, R-29, R-42, R-47, R-50, R-52–R-60, R-70, R-83–R-90, R-94 read in full.
- `final/_work/rulings.yaml`: `global` and `modules.D2`, plus every other module row naming a D2 type (D3 R-70/R-07, D5 R-70/R-84, D8 R-88, D10 R-47).
- `final/_runlog/module-K.md` (the kernel changes), `final/schema/kernel.graphql`, `final/_work/registers/K.*.yaml`.
- `packets/D2/` 04, 05, 06, 10, 03 (Q-D2-14 and Q-D2-18), and the fixtures; `review-open-issues.json` D2; `inventory-final.md`; `packets/D10/answer-kind-table.md` (Q-D2-14, Q-D2-18).

```
$ sha256sum packets/D2/04-schema-proposal.graphql packets/D2/05-relationship-register.yaml packets/D2/06-node-register.yaml packets/D2/10-seams.yaml final/schema/kernel.graphql
1796b1114aa50b9e5369006213b78ca74f9837cebec7ceb0a4a9e57dcfa16bfa  packets/D2/04-schema-proposal.graphql
26339e16831c7008269721c769010ee287c1070d12de62af7133a9a5ddc7b7ff  packets/D2/05-relationship-register.yaml
3bbb38e4fb0bbe9f97566599f45480f9b06ddbdba1255fb0b724e597e2294c04  packets/D2/06-node-register.yaml
ebd97e2d16eb8adab047eebd1b2ea48ee1a3d81d822573d87ddf17d6f3574c0d  packets/D2/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
```

## SDL: `final/schema/D2.graphql`

```
$ cp packets/D2/04-schema-proposal.graphql final/schema/D2.graphql
```

Edits were made with the Edit tool. The banner `# ---- fragment D2 ----` stays on line 1, and a synthesis block was added to the header.

| ruling | SDL edit |
| --- | --- |
| R-47 | `MechanismProjectionProperties.nNoChangeContexts` removed. The docstring now says: a superset of kernel DerivedEdgeProperties (an M11 base); `score` stays null (executor-validated); the Q-D2-18 ranking reads D10 Association. Q-D2-18 is dropped from the `questions` of the edge-property docstring and of `Mechanism.affectedBy` |
| R-59 | `enum MechanismDirection` removed; `direction: EstimateDirection` (D3) |
| R-58 | `exposureBasis: AmountBasis` (D6), replacing D3 QuantityBasis; the header and the enum note are rewritten |
| R-17 | `MechanismEvidenceContext @node(labels: ["MechanismEvidenceContext"])`, with no Entity label |
| R-25 | `bestBasis` docstring: ranked by the one kernel basis order |
| R-25, R-26 | MechanismReferenceProperties docstring: the hallmark-mapping curation file is a kernel Source with a snapshot per version, and the mapping basis is CURATOR_CLASSIFICATION |
| R-29 | `MechanismEvidenceContext.assertions` docstring: written in the Assertion's intent, corrected by supersession |
| R-86, R-26 | `exposures` docstring: structural, and written alongside IN_STUDY_ARM (confirm; no type change) |
| R-90 | MechanismEvidenceContext docstring: species join on ncbiTaxonId (confirm) |
| R-70, R-84 | Condition docstring: a TargetMeasure member through D5 OPERATIONALIZED_BY, and the CAUSES_ADVERSE_EFFECT object. Outcome docstring: TargetMeasure, no LOINC (R-42) |
| R-03 | no change: asserted `[CONNECT]`, structural to foreign or kernel records `[CONNECT]`, derived `[]` (verified below) |

One fix during the compile check. The Outcome docstring had a line starting with `union TargetMeasure; R-70) and`. It was valid GraphQL, but `grep '^union '` counted it in the printed schema (3 instead of 2). The line was reflowed, and every `^(union|type|enum|input|interface) ` line in D2.graphql is now a real declaration (21 lines: 11 enums, 3 edge-property types, 2 unions, 5 nodes).

```
$ grep -n 'QuantityBasis\|MechanismDirection\|nNoChange\|LOINC' final/schema/D2.graphql   -> header/docstring mentions only (no type use)
$ wc -c -l final/schema/D2.graphql   -> 452 lines, 24350 bytes (packet: 438 lines)
$ sha256sum final/schema/D2.graphql  -> 3d1f1a729fcd2ec595e875abcabe9d3b7de1931496120cfbe5f7d0d3b8421b71
```

M11 verbatim-base prefix (Python, regex over kernel.graphql and D2.graphql):

```
MechanismReferenceProperties <- AssertedRecordedProperties True 5 8
ExposureRoleProperties <- StructuralEdgeProperties True 2 3
MechanismProjectionProperties <- DerivedEdgeProperties True 7 14
```

## Compile check (kernel + scratch stubs + D2)

The stubs live in scratch only: `scratchpad/synth/module-D2/stubs.graphql`. They define:
- the D3 enums AdministrationRoute, SexScope and EstimateDirection, and the D6 enum AmountBasis, copied by `awk` from the in-progress `final/schema/D3.graphql` and `D6.graphql`;
- four minimal `@node` types implementing `Entity & Subjectable` (ChemicalSubstance, IngredientMaterial, Intervention, StudyArm), each with only the 7 Entity fields.

```
$ cat final/schema/kernel.graphql stubs.graphql > kernel+stubs.graphql
$ cat final/schema/kernel.graphql stubs.graphql final/schema/D2.graphql > kernel+stubs+D2.graphql
$ BKS_SCHEMA_PATH=<C:/ abs>/<file>.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <C:/ abs scratch>/<file>.printed.graphql
kernel           wrote ... (326571 chars) in 3s   wall 19 s
kernel+stubs     wrote ... (347193 chars) in 2s   wall 20 s
kernel+stubs+D2  wrote ... (457476 chars) in 2s   wall 15 s   (final D2 file, after the docstring reflow)
packet D2 (kernel + stubs + D3 QuantityBasis stub + packets/D2/04)  wrote ... (457612 chars) in 1s
```

There were no errors. Each output is 0.3–0.5 MB, not the ~55 MB pinned fallback. The D2 output contains `MechanismEvidenceContext` (124 occurrences) and `EstimateDirection` (9). It has 0 occurrences of `nNoChangeContexts`, `MechanismDirection` and `QuantityBasis`, so the file that was printed is the final D2 file.

| printed schema | bytes | lines | input types | enums | object types | unions | Mutation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kernel alone | 326,595 | 6,498 | 179 | 35 | 105 | 0 | 0 |
| kernel + stubs | 347,217 | 6,838 | 187 | 35 | 117 | 0 | 0 |
| kernel + stubs + final D2 | 457,533 | 8,976 | 251 | 50 | 149 | 2 | 0 |
| kernel + stubs + packet D2 (comparison) | 457,669 | 8,971 | 251 | 50 | 149 | — | — |

Marginal cost:
- **Final D2 over kernel alone** (includes the stubs): +130,938 B, +2,478 lines, +72 inputs.
- **D2 over kernel + stubs**: +110,316 B, +2,138 lines, +64 inputs, +15 enums.
- **Synthesis vs packet D2**: −136 B, +5 lines, 0 inputs.

```
$ node packages/schema-workspace/dist/cli.js map --sdl .../kernel+stubs.graphql    -> 15 node types | 32 rel fields | 13 rel types | 79 expanded pairs
$ node packages/schema-workspace/dist/cli.js map --sdl .../kernel+stubs+D2.graphql -> 20 node types | 39 rel fields | 19 rel types | 122 expanded pairs  (schemaDigest sha256:0c1b9b24…)
D2 rows: EXPOSED_TO 3 (ContextExposure 3) | AFFECTS_MECHANISM 2 (MechanismModulator 2) | PARTICIPATES_IN 2 | IN_STUDY_ARM 1 | OBSERVED_IN_CONTEXT 1 | PART_OF_MECHANISM 1  = 10 pairs
```

The +43 expanded pairs are D2's 10 own pairs plus the kernel's Subjectable-target fields expanded over D2's 4 new Subjectable implementers and the stubs. Under R-01 the collapsed count is D2's own 10 pairs.

## Registers

The registers were built with Python string-replace scripts in scratch (`build_rel.py`, `build_node.py`). Each replace asserts an exact match count. `D2.seams.yaml` was written by hand from 10-seams, and the R-55 rename was then applied with an asserted replace.

- **D2.relationship.yaml**
  - `module: D2` on all 6 entries; fixtures rewritten to `final/fixtures/D2/<folder>`.
  - AFFECTS_MECHANISM: Q-D2-18 removed from `questions` and the rationale rewritten (R-47, R-59).
  - Rationale notes added: PART_OF_MECHANISM (R-25, R-26), OBSERVED_IN_CONTEXT (R-29), EXPOSED_TO (R-86).
  - predicateOnly: `registrar: D2` on all 17 rows. NO_CHANGE_IN: promoteWhen updated (R-47). MEDIATES_TARGET admitted (R-83). DEVELOPS_THERAPY_TARGETING flagged (R-52 rule 3 would name D7).
  - deferred OPERATIONALIZED_BY reason (R-70, R-26, R-42).
- **D2.node.yaml**
  - `module: D2` on all 5 entries.
  - Outcome: LOINC dropped (R-42, R-70) and whyNode updated (R-70). Condition whyNode (R-84, R-88, R-70). Mechanism whyNode (R-47, Q-D2-18).
  - MechanismEvidenceContext: `labels: [MechanismEvidenceContext]` (R-17) and the AmountBasis comment (R-58).
  - `mutations` rewritten to `{ graphql: none, executor: [...] }` (R-03).
  - deferred Association reason (R-47).
- **D2.seams.yaml**
  - 22 seams: 8 owned by this module, 14 owned by others. Each has `module`, `status` and `ruling`, and all 22 are accepted.
  - New row: OPERATIONALIZED_BY D5.Target → D2.Condition (R-70). The Target → Outcome row was updated, and Q-D2-18 was added to ASSOCIATES (R-47).
  - 6 predicateSeams: USE_CONSTRAINED_IN and CAUSES_ADVERSE_EFFECT split (R-84, R-85); HAS_APPROVED_INDICATION added (R-88).
  - 10 sharedVocabularies:
    - re-pinned targets@0.2.2 and frontiers@0.2.1 (R-60);
    - re-homed d3-enums (EstimateDirection), d6-enums (AmountBasis) and ModelOrganism (R-56);
    - added predicates and assessment-vocabularies. The conflict subkind is `D7.conflict-relevance` (R-55).

Foreign seam types were checked against the final module SDLs (`grep -l 'type: "<T>"' final/schema/*.graphql`). REFLECTS_MECHANISM and HAS_ANALYTE are in D4; MEASURES and INVESTIGATES in D3; OPERATIONALIZED_BY in D5 (AssertedRecordedProperties, `union TargetMeasure = Biomarker | Metric | Outcome | Condition`); ASSOCIATES in D10; MENTIONS and COVERS_LOCATOR in D9; HAS_SUBJECT, HAS_OBJECT and OCCURRENCE_OF in the kernel; ASSESSES in the kernel and D10.

R-53 lint: D2's 17 predicate names were checked against the 106 relationship type names in every 04 and final SDL (`comm -12`), and none matched. No other packet's 05 registers a D2 predicate name.

R-06 fixture check (`grep` over `packets/D2/07-fixtures/*/assertions.yaml`): every D2 pair has a fixture edge except **EXPOSED_TO → D1.IngredientMaterial**. Its deciding question CQ-MX-04 is value 1, so the pair is kept under the R-06 exception and needs a numbered request in `final/requests.md`.

Validation (PyYAML, regex over D2.graphql):

```
rel {'relationships': 6, 'predicateOnly': 17, 'deferred': 26}   node {'nodes': 5, 'deferred': 6, 'mergedInto': 5}
seam {'seams': 22, 'predicateSeams': 6, 'sharedVocabularies': 10}
rel missing [] | node missing [] | seam missing [] | predseam missing []
SDL rel types 6 == register | SDL node types 5 == register | edgeProperties resolve
predOnly & relTypes set() | registrar {'D2'} | pairs (register from x to) 10 | non-accepted seams []
nested: asserted [CONNECT] x2, structural [CONNECT] x3, derived [] x1
$ sha256sum
a5cb746f173fc4fca87afc45514ad64e759fb8bf5cdaf531cab9dccce9bb4784  _work/registers/D2.node.yaml
30f5130f2aaaaab6c05a289c6bd4984f77c4551fdb9b53a07d5823fdd34d26d6  _work/registers/D2.relationship.yaml
4a35ef36a0b28ab748ef64d73c60e37eb471ab6b94b80118793f749393999cba  _work/registers/D2.seams.yaml
```

## Not done here (other deliverables or owner)

- 03-pattern edits go to query-patterns:
  - Q-D2-18 ranking on Association (R-47);
  - MechanismDirection values → EstimateDirection (INCREASES → INCREASED and so on, R-59);
  - Q-D2-21 → HOLDS_STAKE | HOLDS_ROLE | RECEIVES_VALUE_FROM (R-89).
- The Q-D2-14 answer kind (materialized → retrieved, R-50) goes to the questions catalog.
- Fixture edits go to the fixtures stage:
  - first-author asserters → D3 Publication (R-15);
  - cell-free contexts route IN_MEDIUM and basis MEDIUM_CONCENTRATION (R-58);
  - `direction` values (R-59).
- Open-question closures (items 1, 30 and 33) go to open-questions.
- The fixture requests for EXPOSED_TO → IngredientMaterial and OPERATIONALIZED_BY → Condition go to the owner of `final/requests.md`.

---

<!-- stage: _runlog/module-D3.md -->

# Module D3 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md`. I read R-01 to R-10, R-14 to R-20, R-26, R-28 to R-30, R-43, R-44, R-52, R-53, R-56, R-58, R-59, R-63, R-70 to R-72, R-80, R-82 and R-94 in full.
- `final/_work/rulings.yaml`: `global` and `modules.D3`, plus every other module's rows that name a D3 type.
- `final/schema/kernel.graphql`, `final/_work/registers/K.*.yaml` and `final/_runlog/module-K.md`. The last one lists the kernel changes and gives the K print-schema baseline.
- `scratchpad/inv/review-open-issues.json` (D3) and `scratchpad/inv/inventory-final.md` (D3 rows).

```
$ git rev-parse --short HEAD
e484fd2
$ sha256sum packets/D3/04-schema-proposal.graphql packets/D3/05-relationship-register.yaml packets/D3/06-node-register.yaml packets/D3/10-seams.yaml
96aa64ce076128e5321c69be4e048923052f80e29e77dbd2f229a7ca21c0f5e6 *packets/D3/04-schema-proposal.graphql
9d6f1082015217387587ccef21ac56dbdbc7362c3ecc7b091b1cc329b3c5a408 *packets/D3/05-relationship-register.yaml
7d1a102b6e9726839d251fe7cc4b4f0b5be2b0fb59ce86676f5d0d96f8548541 *packets/D3/06-node-register.yaml
e8986aebb8558d3a7c655fef10ff190c1f16b7befaccadf878527254c226a882 *packets/D3/10-seams.yaml
```

## SDL: `final/schema/D3.graphql`

```
$ cp packets/D3/04-schema-proposal.graphql final/schema/D3.graphql
```

I made the edits with the Edit tool and one asserted Python replace (R-63). The banner `# ---- fragment D3 ----` stays on line 1, and a synthesis block was added to the header comment.

| ruling | SDL edit |
| --- | --- |
| R-10 | `Study.registrationVersions` (HAS_REGISTRATION_VERSION): `properties: "AssertedEdgeProperties"` (was StateEpisodeProperties). The docstring names `exclusive: true` |
| R-44 | removed `enum PublicationRevisionStatus`. `Publication.revisionStatus: SourceRevisionKind`, whose docstring reads "null = none known; single work-level cache". RevisionEdgeProperties docstring: recorded when the revising work is identified, per asserter, never recorded both ways |
| R-58 | removed `enum QuantityBasis`. `InterventionComponent.quantityBasis: AmountBasis` (D6). `AdministrationRoute` gains `INTRAPERITONEAL` and `IN_MEDIUM`, with an enum docstring |
| R-72 | `union AdministeredMaterial = IngredientMaterial \| ProductVariant \| Intervention \| FoodItem \| DietaryPattern` (Device removed, 6 → 5). Docstring: a device used as an intervention is reached through ProductVariant or Intervention |
| R-63 | AdministeredMaterial docstring: an eating pattern is administered as a DietaryPattern (no type change) |
| R-70 | OutcomeDefinition docstring: TargetMeasure = Metric \| Biomarker \| Outcome \| Condition. The clause "D2 Condition terms do not reach a Target" is removed |
| R-71 | `Publication.venueName` docstring: "venue name only, no container node" |
| R-43 | new field `Publication.renditions: [Source!]!` on `RENDITION_OF`, direction IN, `AssertedRecordedProperties`, `[CONNECT]`, aggregate false, `@filterable(byValue: true, byAggregate: false)`. The Publication docstring now says renditions are grouped by RENDITION_OF, not by a shared Identifier (R-42) |
| R-71, R-80 | Publication docstring: owner D3. Authors are AUTHORED_BY → D7 Person \| Organization, registered by D3. The stale sentence "kernel map still lists Publication under D9" is removed |

Unchanged: RESULT_FOR keeps its name, because D8 renames to QUALITY_RESULT_FOR (R-53). SexScope and EstimateDirection stay declared here (R-56, R-59).

## Registers

The registers were built from the packet's 05, 06 and 10 files. Every entry keeps the contract fields and adds `module: D3`. Fixture paths were rewritten to `final/fixtures/D3/<folder>`. RENDITION_OF uses the K fixture, `final/fixtures/K/resveratrol-sirt1-evidence-mission`.

- `D3.node.yaml`: a Python string-replace script (stdin). Each replace is asserted to match exactly once. The edits are `module: D3` on the 8 nodes, the quantityBasis note (R-58), the revisionStatus note (R-44), the Publication whyNode (R-43) and a header note on how `mutations` is read (R-03).
- `D3.relationship.yaml`: `scratchpad/synth/module-D3/build_rel.py`, run from `schema/program` with `python -I`; every replace is asserted.
  - R-10: HAS_REGISTRATION_VERSION uses `edgeProperties: AssertedEdgeProperties` and gains `exclusive: true`.
  - R-72: ADMINISTERS `to` no longer lists D4.Device.
  - R-44: REVISES rationale.
  - R-70: MEASURES rationale.
  - R-07: INVESTIGATES questions are now `[Q-D3-10, Q-D2-06]`.
  - R-43: new RENDITION_OF entry with `meaning: kernel`, `from: K.Source`, `declaredOn` and `ruling`.
  - predicateOnly changes:
    - AUTHORED_BY: registrar D3, with the subjects, objects and aliases of R-80.
    - FUNDER_ROLE_STATEMENT becomes FUNDED_BY: object D7.Organization, qualifier `roleText:`, aliases (R-82).
    - COMPETING_INTEREST_STATED is removed and becomes a DISCLOSES_INTEREST predicate seam (R-82).
    - ADMINISTERED_MATERIAL_PURITY is added: FIELD, subject InterventionComponent (R-52).
  - deferred: notes added to USES_INTERVENTION_DEVICE (R-72) and CORRECTS (the K convention is a different meaning, R-20/R-52).
  - The first run failed `yaml.safe_load` on line 44: the plain scalar contained `exclusive: true, R-10`. I reworded it and re-ran.
- `D3.seams.yaml` was written by hand from 10-seams.yaml.
  - Relationship seams: 25 rows. Each carries `status` and `ruling`. "packet" means accepted as published, with no ruling changing it. One row is cut: ADMINISTERS → D4.Device (R-72). One row is new: RENDITION_OF K.Source → D3.Publication (direction IN, owner this; R-43).
  - `predicateSeams` (R-94): 11 rows. D3 is registrar of AUTHORED_BY, FUNDED_BY, MATERIAL_PROVIDED_BY and ADMINISTERED_MATERIAL_PURITY. The other registrars: DISCLOSES_INTEREST (D9); the D1 amount predicates; the D12 food predicates; EVENT_ABOUT and CONTINGENT_ON (D13); HAS_REVISION_STATUS and HAS_IDENTIFIER (K).
  - `kernelTypesReferenced`: StateEpisodeProperties becomes AssertedEdgeProperties, and Source is added. `dependsOn`: OPERATIONALIZED_BY gains D2.Condition (R-70). `sharedVocabularies`: AmountBasis (D6), AdministrationRoute, the EstimateDirection consumer D2 (R-59), predicates, assessment-vocabularies, and final vocabulary paths with pins (R-60).

```
$ python -I .../synth/module-D3/build_rel.py          -> ok
$ python -c "yaml.safe_load(...)"   # per file
D3.node.yaml         {'version': 1, 'module': 'D3', 'nodes': 8, 'deferred': 3, 'mergedInto': 12}
D3.relationship.yaml {'version': 1, 'module': 'D3', 'relationships': 15, 'predicateOnly': 18, 'deferred': 46}
D3.seams.yaml        seams 25 (accepted 24, cut 1), predicateSeams 11
```

I cross-checked the contract fields against the SDL with Python (yaml plus a regex over `D3.graphql`):

```
rel missing: []    node missing: []    seam missing: []
rel types SDL==register: True 15
nodes SDL==register: True 8
predicateOnly & relTypes: set()
retired names in SDL outside comments: []      # StateEpisodeProperties, PublicationRevisionStatus, QuantityBasis, COMPETING_INTEREST_STATED, FUNDER_ROLE_STATEMENT
no kernel conventions in predicateOnly         # FIELD_NOT_REPORTED, HAS_REVISION_STATUS, RATES_CLAIM, CORRECTS, HAS_IDENTIFIER, CITES_AS_SUPPORT, HAS_CREDENTIAL
```

## Counts (`scratchpad/synth/module-D3/count.mjs`, graphql parse; unions expanded per member)

```
$ node .../count.mjs C:/.../final/schema/D3.graphql
nodeTypes 8: Study, RegistrationVersion, StudyArm, InterventionComponent, StudyPopulation, OutcomeDefinition, StudyResult, Publication
relationshipTypes 15: HAS_REGISTRATION_VERSION, HAS_ARM, HAS_POPULATION, HAS_OUTCOME, HAS_STUDY_ROLE, INVESTIGATES, HAS_COMPONENT, STATED_IN, ADMINISTERS, MEASURES, RESULT_FOR, RESULT_FOR_ARM, REPORTS_ON, REVISES, RENDITION_OF
fieldPairs 31 (kernel-meaning 1; module-owned 30)
unions: AdministeredMaterial=5, StatingRecord=2, OutcomeMeasureTarget=4, StudyParty=3
$ node .../count.mjs C:/.../packets/D3/04-schema-proposal.graphql
nodeTypes 8 · relationshipTypes 14 · fieldPairs 31 (kernel-meaning 0) · unions: AdministeredMaterial=6, StatingRecord=2, OutcomeMeasureTarget=4, StudyParty=3
```

Under R-01, RENDITION_OF is a kernel-meaning type and is counted once in K. The D3-owned figures are therefore 14 relationship types and 30 pairs, with no interface targets. The packet had 31 pairs; the change is −1 for ADMINISTERS → Device and +1 for RENDITION_OF.

## Compile check (print-schema)

The scratch stubs live in `scratchpad/synth/module-D3/stubs.graphql` and are never published. They are minimal `@node @query(aggregate:false) @mutation(operations: [])` types for IngredientMaterial, ProductVariant, Intervention, FoodItem, DietaryPattern, Metric, Biomarker, Outcome, Condition, Organization, Person and Award, plus the enums MassBasis (D1) and AmountBasis (D6). The inputs were assembled with `cat`: kernel only; kernel + stubs; kernel + stubs + D3.

```
$ BKS_SCHEMA_PATH=C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D3/<name>.graphql \
  NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema \
  C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D3/<name>.printed.graphql
kernel-only        wrote ... (326571 chars) in 3s   (wall 56 s, first run)
kernel+stubs       wrote ... (341926 chars) in 2s   (wall 20 s)
kernel+stubs+D3    wrote ... (543390 chars) in 2s   (wall 29 s; final SDL, re-run after the R-63 docstring edit)
```

It compiled on the first attempt with no errors. The print-schema log does not name the SDL it used. I confirmed the source in three ways:
- the outputs are 0.3–0.5 MB, not the ~55 MB pinned fallback;
- the D3 output contains the new `INTRAPERITONEAL` / `IN_MEDIUM` values and the 5-member `union AdministeredMaterial`;
- it contains the docstring text "R-63", which exists only in `final/schema/D3.graphql`.

`grep -c "StateEpisodeProperties\|QuantityBasis\|PublicationRevisionStatus"` over the D3 output gives 0.

| printed | bytes | lines | `^input ` | `^enum ` | `^type ` | `^union ` | Mutation fields |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| kernel only | 326,595 | 6,498 | 179 | 35 | 105 | 0 | 0 |
| kernel + stubs | 341,950 | 6,930 | 203 | 35 | 141 | 0 | 0 |
| kernel + stubs + D3 (final) | 543,440 | 11,160 | 343 | 65 | 203 | 4 | 0 |

The kernel-only numbers equal module-K's run (326,595 B, 179 inputs).

**Marginal cost of D3:**
- Over kernel + stubs: **+201,490 B, +4,230 lines, +140 input types, +30 enums.**
- Over the kernel alone: +216,845 B and +164 inputs. This figure includes the stubs (+15,355 B, +24 inputs).

The final D3 SDL is 45,070 B and 868 lines; the packet's was 42,827 B and 865 lines.

**Packet comparison** (same method). The unedited packet D3 was compiled against the final kernel, the same stubs, a Device stub and a stub copy of StateEpisodeProperties. It needs those last two because the kernel removed StateEpisodeProperties.

| printed | bytes | lines | `^input ` | `^enum ` |
| --- | ---: | ---: | ---: | ---: |
| kernel + stubs + extra | 343,150 | 6,966 | 205 | 35 |
| kernel + stubs + extra + packet D3 | 540,575 | 11,112 | 344 | 66 |

- Packet D3 marginal: +197,425 B, +139 inputs, +31 enums.
- Final D3 marginal: +201,490 B, +140 inputs, +30 enums.
- Delta, final minus packet: **+4,065 B, +1 input, −1 enum**. The new RENDITION_OF field and its filters outweigh the removals: Device member, QuantityBasis, PublicationRevisionStatus and StateEpisodeProperties. The extra docstrings are part of the bytes.

## Cypher check (bks-neo4j-synth, Neo4j 5.26)

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "EXPLAIN MATCH (src:Source)-[r:RENDITION_OF]->(p:Publication)<-[v:REVISES]-(n:Publication) WHERE r.recordedTo IS NULL AND v.recordedTo IS NULL RETURN src.uid, p.uid, n.uid, v.revisionKind"
Planner: "COST"   Runtime: "SLOTTED"   (plans; R-44 revision branch over R-43)
```

## Open items for other S stages (not edited here: outside final/schema and registers, or not required by a ruling)

1. Fixtures (D3 folders): `revisionStatus` must be remapped. NONE_KNOWN becomes null (5 occurrences) and RETRACTED becomes RETRACTION (9 occurrences, R-44).
   - dq-bone a63 uses COMPETING_INTEREST_STATED with a literal object. Under DISCLOSES_INTEREST (R-82) the object is an Organization (Mayo Clinic), and per R-15 the author statements are asserted by the D7 Persons.
   - dq-bone a64 uses FUNDER_ROLE_STATEMENT with a literal and names no funder. FUNDED_BY needs a D7.Organization object with `roleText:` as a qualifier, so the fixtures editor must attach it to the named funder(s).
   - `source.md` (aspree) names StateEpisodeProperties.
2. RENDITION_OF fixture: K `resveratrol-sirt1-evidence-mission` has no RENDITION_OF rows yet; its questions.md says "no … RENDITION_OF in the K fixtures". The rows pmc-3799917 / pubmed-23471411 → Publication must be added for R-06.
3. Patterns: D3 03 CQ-EV-05 (lines 231, 239) joins Publication-HAS_IDENTIFIER->Identifier<-HAS_IDENTIFIER-Source. That join is forbidden by R-42/R-43, so the final query patterns should use Source -RENDITION_OF-> Publication.
4. R-14 (global): D3 cites RegistrationVersion field facts as locators on the HAS_REGISTRATION_VERSION attach Assertion and has "no per-field predicates". R-14 asks for FIELD Assertions with registered field predicates. No D3 ruling row covers this, so it is left unchanged and needs a chief ruling.
5. OQ-D1-26 names UNIT_DOSE_AMOUNT, ADMINISTERED_AMOUNT and REGISTRY_ID_AS_PRINTED as D3 predicates. No ruling registers them, so they are not added.

---

<!-- stage: _runlog/module-D4.md -->

# Module D4: module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-03, R-06, R-25, R-26, R-28, R-42, R-52, R-53, R-54, R-55, R-56, R-70, R-72 and R-94 read in full for D4).
- `final/_work/rulings.yaml`: `global` and `modules.D4`, plus the rows in other modules that name a D4 type (D3 R-72 ADMINISTERS → Device; D5 R-26 / R-70 OPERATIONALIZED_BY and TargetMeasure; D8 R-72 unions).
- `final/schema/kernel.graphql`, and the kernel editor's notes in `_runlog/module-K.md`.

```
$ sha256sum packets/D4/04-schema-proposal.graphql packets/D4/05-relationship-register.yaml packets/D4/06-node-register.yaml packets/D4/10-seams.yaml final/schema/kernel.graphql final/_work/rulings.yaml final/decision-report.md
0b2925a1bea8158199922a9daf4edf384e80fc447c0e7719e810937ded6f3024  packets/D4/04-schema-proposal.graphql
05ead78938703bc42da9221e1853ed0e540ccb8810a0aeafc9f7a39ded30040f  packets/D4/05-relationship-register.yaml
223b34b32283c1e6709cf3867af46460a25d7a31aacc765fe6a71298861d0f18  packets/D4/06-node-register.yaml
01a278ca526939506105d4ff9967ede8915d07efe6eea359b5f616a7ca0379ef  packets/D4/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
19dba4c3c822d3cbee75f232a015ca4ca6719eb4e8b3dc508ecb1f218123ac81  final/_work/rulings.yaml
327c2c3d7b2c00bdcfa51935388194ef2eabae64a10b6b149d8edb9533c47762  final/decision-report.md
```

## Rulings applied

| ruling | where | edit |
| --- | --- | --- |
| R-26 (change-edge-class) | SDL `AssayVersion.performingLab`; 05 PERFORMED_BY_LAB; seams | PERFORMED_BY_LAB: structural → asserted, `StructuralEdgeProperties` → `AssertedRecordedProperties`, `[CONNECT]` (unchanged). A curator inference uses basisKind CURATOR_CLASSIFICATION. `MeasurementField` docstring updated. This answers 11 #42. |
| R-26 (edit-text) | SDL banner; 05 header and the rationales of QUANTIFIES, HAS_ANALYTE, OUTPUTS_METRIC, REQUIRES_INPUT_METRIC, INTERVAL_FOR | These are identity-defining components. They stay structural only if the record's attach Assertion cites the defining span. QUANTIFIES's "no Assertion needed" was replaced. |
| R-52 (remove-predicate) | 05 predicateOnly; seams predicateSeams | FIELD_NOT_REPORTED is removed from predicateOnly (registrar K) and is read through a `predicateSeams` row. The 15 remaining entries carry `registrar: D4` and `module: D4`. |
| R-72 (close-oq #12) | 05 DELIVERS rationale; seams | There is one Device path. The CONCERNS / STATUS_OF → D6.Product rows are marked resolved. The ADMINISTERS D3.InterventionComponent → D4.Device row is **cut**. |
| R-94 (edit-seam) | seams | HAS_ITEM `from` is K.Report. The StepMeans union is dropped (STEP_USES → K.Subjectable, R-28). The RESOLUTION subkind `about` reads "surface-form SourceLocator", replacing Mention. Relationship seams and `predicateSeams` are now separate lists. |
| R-55 (edit-text) | seams registeredValues `D4.test-and-sell` | conclusionCodes are the D7.conflict-relevance codes [DIRECT, INDIRECT, NOT_RELEVANT, UNDETERMINED], with `conclusionCodesRegistrar: D7`. |
| R-03 | 06 `mutations` | Written as `{ graphql: none, executor: ... }`. The executor text comes from each node's archetype (insert-only versioned states: create only). |
| R-42 / R-70 | 06 Metric comment; seams | LOINC is on D4 Metric only (11 #37 closed). TargetMeasure and OutcomeMeasureTarget are now four-member unions. OPERATIONALIZED_BY is asserted with CURATOR_CLASSIFICATION (D5 R-26). |
| R-60 | seams sharedVocabularies | References point at `final/vocabularies/` (targets @0.2.2, frontiers @0.2.1). |
| R-94 (edit-pattern Q-D4-10), R-50 (Q-D4-08 retrieved → assessment) | none | Neither applies to the SDL or the registers. The word "RegulatoryStatus" does not occur in packets/D4 (`grep -rn RegulatoryStatus packets/D4` returns nothing). The answer kind lives in 02/03, which belong to the pattern and fixture editors. |

Checks with no change needed:
- R-02: every type has L1 `@filterable(byAggregate:false)` and `@mutation(operations: [])`.
- R-04: `@fulltext` / `@vector` count is 0.
- R-17: labels are `[X, Entity]`.
- R-56: no D4 enum name collides with the kernel or any packet SDL (a loop over the 21 D4 enums against `^enum|type|union|interface` returned no hits). SexScope is consumed from D3 and not redeclared.
- R-53: no D4 relationship type is declared by another packet. No predicateOnly value equals any of the 106 relationship-type names across the packet SDLs and the final kernel. No other packet registers a D4 predicateOnly name.
- R-06: every D4 relationship type appears in at least one D4 fixture (`grep -l` per type over `07-fixtures/*/assertions.yaml` and `intent.json`).

## Commands

```
$ python scratchpad/synth/module-D4/build_sdl.py packets/D4/04-schema-proposal.graphql final/schema/D4.graphql
ok 26992          # three asserted single-match replacements; banner '# ---- fragment D4 ----' stays on line 1
$ python scratchpad/synth/module-D4/build_regs.py packets/D4 final/_work/registers
rel ok            # 13 'module: D4' inserts, 13 fixture rewrites, 15 predicateOnly entries tagged, all asserted
node ok           # 7 'module: D4' inserts, 7 mutations rewrites
# D4.seams.yaml written with the Write tool from packets/D4/10-seams.yaml
$ python scratchpad/synth/module-D4/check.py final
rel {'relationships': 13, 'predicateOnly': 15, 'deferred': 40}
node {'nodes': 7, 'deferred': 5, 'mergedInto': 19}
seams {'seams': 29, 'predicateSeams': 5, 'registeredValues': 2, 'sharedVocabularies': 8}
rel missing [] | node missing [] | seam missing []
seam status {'accepted': 28, 'cut': 1}
SDL rel types 13 fields(pairs) 17 reg types 13 True     # edgeProperties and nestedOperations match the SDL for all 13
SDL node types 7 True | enums 21 unions 0
predicateOnly 15 False(FIELD_NOT_REPORTED) collide w/ D4 types set()
fixtures: final/fixtures/D4/{clock-noise-vs-retest-advice, consumer-panel-and-blood-clock, hba1c-two-labs-interference, nr-nad-compound-to-test, wearable-hrv-algorithm-changes}
@fulltext/@vector 0 0
```

## Compile check

The scratch files are in `scratchpad/synth/module-D4/`. `stubs.graphql` (sha256 85550f8b…) is the D4 packet's scratch stub set: D1 ChemicalSubstance, D2 Mechanism, D2 MolecularEntity, D6 Product, D7 Organization and the D3 enum SexScope. The stubs exist only in scratch.

```
$ cat final/schema/kernel.graphql > k.graphql
$ cat final/schema/kernel.graphql stubs.graphql > ks.graphql
$ cat final/schema/kernel.graphql stubs.graphql final/schema/D4.graphql > compile.graphql    # sha256 731f1d31…
$ BKS_SCHEMA_PATH=<scratch>/<x>.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <scratch>/out-<x>.graphql
k        exit 0, wall 7 s, "wrote …out-k.graphql (326571 chars) in 1s"
ks       exit 0, wall 8 s, "wrote …out-ks.graphql (352161 chars) in 1s"
compile  exit 0, wall 6 s, "wrote …out-compile.graphql (528061 chars) in 1s"
$ wc -c -l; grep -c '^input ' / '^type ' / '^enum '
```

| variant | printed bytes | lines | inputs | object types | enums |
| --- | ---: | ---: | ---: | ---: | ---: |
| kernel alone | 326,595 | 6,498 | 179 | 105 | 35 |
| kernel + stubs | 352,185 | 6,923 | 189 | 120 | 35 |
| kernel + stubs + final D4 | 528,111 | 10,490 | 293 | 177 | 57 |
| kernel + stubs + packet D4 (comparison) | 527,888 | 10,489 | 293 | — | — |

- **D4 marginal over kernel + stubs:** +175,926 B, +3,567 lines, +104 inputs.
- **Over the kernel alone, stubs included:** +201,516 B and +114 inputs.
- **Final D4 against packet D4:** +223 B, +1 line, 0 inputs. This comes from R-26 (PERFORMED_BY_LAB now prints `properties: AssertedRecordedProperties!`) plus docstrings.
- **The source is confirmed:** the output is 0.5 MB, not the ~55 MB pinned fallback. `out-compile.graphql` contains `type AssayVersionPerformingLabRelationship { … properties: AssertedRecordedProperties! }`, which exists only in the final D4 file.
- **Build:** 1 s (6 s wall).

```
$ node scripts/schema-size.mjs out-compile.graphql
printed size 0.5 MB | printed lines 10,491 | input types 293 | object types 177 | enums 57 | Query fields 50 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned default SDL, not this file)
$ node packages/schema-workspace/dist/cli.js map --sdl compile.graphql   -> 23 node types, 49 rel fields, 26 rel types, 160 expanded pairs
$ node packages/schema-workspace/dist/cli.js map --sdl ks.graphql        -> 16 node types, 32 rel fields, 13 rel types, 87 expanded pairs
```

D4 module counts:
- 7 node types, 13 relationship types and 17 from→to pairs on the collapsed count (R-01). D4 has no union or interface targets, so collapsed = declared.
- Widest union: 0.
- The interface-expanded marginal is 160 − 87 = 73. It includes the kernel's Subjectable targets expanding to the 7 D4 implementers.

```
$ sha256sum final/schema/D4.graphql final/_work/registers/D4.*
b62054b09a7740809ade7b6f3f01c9c424b7097d312a101cb090182201a1bb00  final/schema/D4.graphql
20ba64489219e3fc44573d0888a0d214edfbd737ec883ca7edbbfc0601a0f2d9  final/_work/registers/D4.node.yaml
65d7e7fb576f1e2c9fea7cff7042763b5dcde7ccb1844b144df47dd1bffc60d9  final/_work/registers/D4.relationship.yaml
534c88c20715148c2a377c82065f7d7f3445801d882d6d8b129447bc17c96e5f  final/_work/registers/D4.seams.yaml
```

## Open items for other S stages

1. **Fixture editor.** `hba1c-two-labs-interference` d05 (PERFORMED_BY_LAB) still has `edgeClass: structural` and `basisKind: CALCULATED`. Under R-26 and R-25 it becomes asserted with `basisKind: CURATOR_CLASSIFICATION`. The other curator mappings (d02, c05, f01/f02) may need the same basis.
2. **Pattern editor.** Q-D4-08 answer kind is retrieved → assessment (R-50). The "RegulatoryStatus" rename in Q-D4-10 (R-94) has nothing to rename in packets/D4: grep finds 0 occurrences.
3. **Registry (R-52).** OUTCOME_MEASURED_WITH has only a D3 subject (OutcomeDefinition). Under the subject-owner rule its registrar could be D3. No ruling moved it, so it is kept as `registrar: D4`.
4. **R-55 reading.** `D4.test-and-sell` is kept as a D4 subkind that reuses the D7 codes. If R-55's "one register entry" means D4 should use `D7.conflict-relevance` itself, the assessment-vocabularies editor can merge it.

---

<!-- stage: _runlog/module-D5.md -->

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

---

<!-- stage: _runlog/module-D6.md -->

# Module D6 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01 to R-10, R-18, R-26, R-30, R-39, R-52 to R-58, R-62, R-67, R-68, R-72 to R-74, R-87, R-88, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D6`); `final/_runlog/module-K.md` (kernel changes 1 to 10); `final/schema/kernel.graphql`; `packets/D6/` 04, 05, 06, 10, 09, 11, RUNLOG; `review-open-issues.json` (D6); `inventory-final.md` (D6 rows).

```
$ sha256sum packets/D6/04-schema-proposal.graphql packets/D6/05-relationship-register.yaml packets/D6/06-node-register.yaml packets/D6/10-seams.yaml final/schema/kernel.graphql final/_work/rulings.yaml
5145271961dea2c7e218dd43f62a4fc514240aef4b415e28aded42692c055881  packets/D6/04-schema-proposal.graphql
d81ff877b2f16ba9d009685a1c7a61964241ce40ef1e182438ec047ce5c07ad6  packets/D6/05-relationship-register.yaml
b27093a8a355922565ab2bc565c6664306a46e983d5be2b1832afa79553ab001  packets/D6/06-node-register.yaml
2a867d1ed7866da29345d044f68e11a53a74d7e2ae342b676ff8aa44a8034e2a  packets/D6/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
19dba4c3c822d3cbee75f232a015ca4ca6719eb4e8b3dc508ecb1f218123ac81  final/_work/rulings.yaml
```

Scratch: `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D6/` (`$D` below). Build scripts `build_sdl.py`, `build_rel.py`, `build_node.py` copy the packet file and apply string replacements; each replacement asserts its exact match count and cites its ruling. `D6.seams.yaml` was written by hand from packet 10.

## Fixture check before editing (R-06)

Every D6 pair has a fixture, so R-06 cuts nothing in D6:

```
$ for r in HAS_VARIANT … SELLER_OF_RECORD; do grep -l "$r" packets/D6/07-fixtures/*/*.yaml …; done
HAS_VARIANT: 5 folders · HAS_PACKAGE: 6 · HAS_LABEL_VERSION: 5 · DECLARES_COMPONENT: 5 · NAMES_RESPONSIBLE_PARTY: 3 · BRANDED_AS: 4 · LISTING_FOR: 4 · HAS_OFFER: 3 · SELLER_OF_RECORD: 2
$ grep -h -A8 "predicate: DECLARES_COMPONENT" */assertions.yaml | grep -o "uid: hu:[a-z-]*:" | sort | uniq -c
      4 uid: hu:constituent:      10 uid: hu:food:      20 uid: hu:material:     (all three union members fixtured)
```

## SDL: `final/schema/D6.graphql`

```
$ python -I $D/build_sdl.py C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
ok header · ok header-kernel-path · ok R-30 docstring · ok R-30 declaredNameVerbatim · ok R-30 formVerbatim/statementVerbatim
ok R-88 ProductKind · ok R-88 PanelKind · ok R-88 ComponentLineRole · ok R-58 AmountBasis · ok R-10 labelVersions
ok R-08/R-18 LabelVersion docstring · ok R-08 seals
wrote …\final\schema\D6.graphql 26137 bytes
```

The banner `# ---- fragment D6 ----` stays on line 1.

| ruling | SDL edit |
| --- | --- |
| R-10 | `Package.labelVersions` (HAS_LABEL_VERSION): `properties: "AssertedEdgeProperties"` (was StateEpisodeProperties); docstring names `exclusive: true` and R-22 |
| R-30 | `ComponentLineProperties`: removed `declaredNameVerbatim`, `formVerbatim`, `statementVerbatim`; docstring says the locator exact text and qualifiers `declaredName:`, `form:`, `statement:` carry them |
| R-58 | `AmountBasis` + PER_DOSE, PER_DAY, PER_WEEK, PER_CYCLE, PER_KG_BODY_WEIGHT_PER_DAY, PER_KG_DIET, SINGLE_DOSE, MEDIUM_CONCENTRATION, NOT_STATED, OTHER (16 values); docstring names owner D6 and consumers D2, D3, D5, D12 |
| R-88 | ProductKind PRESCRIPTION_DRUG, PanelKind PRESCRIBING_INFORMATION, ComponentLineRole ACTIVE_INGREDIENT |
| R-08 | LabelVersion questions and `seals` docstring: CQ-PF-03 → CQ-PF-03b |
| R-18 | LabelVersion docstring: implements Subjectable under the kernel versioned-state rule |
| header | synthesis-edit list; kernel path points at `final/schema/kernel.graphql` |

Mechanical checks (Python over the final files):

```
SDL rel types 9 [BRANDED_AS, DECLARES_COMPONENT, HAS_LABEL_VERSION, HAS_OFFER, HAS_PACKAGE, HAS_VARIANT, LISTING_FOR, NAMES_RESPONSIBLE_PARTY, SELLER_OF_RECORD]
SDL nodes ['Product', 'ProductVariant', 'Package', 'LabelVersion', 'MerchantListing', 'Offer']
props used ['AssertedEdgeProperties', 'AssertedRecordedProperties', 'ComponentLineProperties', 'StructuralEdgeProperties']
M11 prefix ok True        (ComponentLineProperties starts with AssertedRecordedProperties' 5 fields, in order)
union DeclaredComponentTarget = IngredientMaterial | Constituent | FoodItem   (width 3)
$ wc -c -l packets/D6/04-schema-proposal.graphql final/schema/D6.graphql
  487 23841 packets/D6/04-schema-proposal.graphql
  517 26137 final/schema/D6.graphql
```

## Compile check

Inputs (scratch only): `$D/k.graphql` = kernel; `$D/ks.graphql` = kernel + `$D/stubs.graphql` (stubs for the seam targets IngredientMaterial, Constituent, FoodItem, Brand, Organization, each `Entity & Subjectable` with the 7 Entity fields, plus D1's 5-value `enum MassBasis`); `$D/ksd6.graphql` = kernel + stubs + `final/schema/D6.graphql`.

```
$ for v in k ks ksd6; do BKS_SCHEMA_PATH=$D/$v.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $D/out-$v.graphql; done
k    rc=0 wall=31s  "wrote …\out-k.graphql (326571 chars) in 3s"
ks   rc=0 wall=18s  "wrote …\out-ks.graphql (352024 chars) in 2s"
ksd6 rc=0 wall=12s  "wrote …\out-ksd6.graphql (493844 chars) in 2s"
$ tail -c +<size of ks.graphql + 1> $D/ksd6.graphql | cmp - final/schema/D6.graphql   -> compiled D6 == final D6
```

The print-schema log does not name the SDL. The source is confirmed because every output is 0.3 to 0.5 MB, not the ~55 MB pinned fallback, and `out-ksd6` holds D6-only names (`ComponentLinePropertiesWhere`, PRESCRIPTION_DRUG). Wall time includes pnpm start-up; the build itself reports 2 to 3 s.

```
$ for v in k ks ksd6; do wc -c; wc -l; grep -c '^input '; grep -c '^type '; grep -c '^enum '; grep -c '^union '; done
$ grep -c "PRESCRIPTION_DRUG\|MEDIUM_CONCENTRATION\|ACTIVE_INGREDIENT" out-ksd6.graphql   -> 4
$ grep -c "type Mutation" out-ksd6.graphql                                                -> 0
$ grep -n "declaredNameVerbatim\|StateEpisodeProperties" out-ksd6.graphql                 -> 1 (the labelVersions docstring text "StateEpisodeProperties retired")
```

| printed | bytes | lines | input types | object types | enums | unions |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| kernel alone | 326,595 | 6,498 | 179 | 105 | 35 | 0 |
| kernel + stubs | 352,048 | 6,923 | 189 | 120 | 35 | 0 |
| kernel + stubs + D6 | 493,891 | 9,556 | 258 | 158 | 48 | 1 |
| **D6 marginal (vs kernel + stubs)** | **+141,843** | **+2,633** | **+69** | **+38** | **+13** | **+1** |
| D6 + stubs marginal (vs kernel alone) | +167,296 | +3,058 | +79 | +53 | +13 | +1 |

Packet-reported D6 marginal (packet 09, against the A1 kernel 790e7244 + stubs) was +150,147 B and +71 inputs. The final module costs 8,304 B and 2 inputs less. Two of the causes are certain: `StateEpisodePropertiesSort/Where` no longer exist (R-10), and three String fields left the edge-property inputs (R-30). The 10 AmountBasis values and the 3 R-88 values cost bytes in the other direction. The kernels differ too, so this is not a controlled comparison: the packet SDL cannot be compiled against the final kernel, because the final kernel has no StateEpisodeProperties.

```
$ node packages/schema-workspace/dist/cli.js map --sdl $D/ks.graphql   --out $D/map-ks.md     # sha256:7fc602a2…
$ node packages/schema-workspace/dist/cli.js map --sdl $D/ksd6.graphql --out $D/map-ksd6.md   # sha256:d190df19…
```

| map | node types | rel. fields | rel. types | pairs (expanded) | unions |
| --- | ---: | ---: | ---: | ---: | ---: |
| kernel + stubs | 16 | 32 | 13 | 87 | 0 |
| kernel + stubs + D6 | 22 | 41 | 22 | 146 | 1 |
| D6 marginal | +6 | +9 | +9 | +59 | +1 |

D6 contributes 11 collapsed pairs (R-01): 5 intra-module, 3 DECLARES_COMPONENT union members, BRANDED_AS, NAMES_RESPONSIBLE_PARTY and SELLER_OF_RECORD. The expanded +59 is those 11 plus 48 = 6 new Subjectable implementers × 8 kernel fields that target Subjectable in this assembly.

## Registers

```
$ python -I $D/build_rel.py <worktree>
module lines added: 9 · ok fixture paths x9 · ok R-10 HAS_LABEL_VERSION · ok R-10 rationale · ok R-30/R-58/R-87/R-88 DECLARES_COMPONENT rationale
ok R-67 NAMES_RESPONSIBLE_PARTY · predicateOnly entries: 26 with registrar: 26
ok removed INTENDED_FOR_TARGET (R-52) · ok removed PREPARED_WITH (R-62) · ok removed MANUFACTURES (R-68) · ok removed MANUFACTURER_STATEMENT (R-68)
ok R-52 OFFERS_INTERVENTION · ok R-52 SUCCEEDED_BY · ok R-74 LISTING_PACKAGE_SIZES · ok R-08 BEARS_SEAL · ok R-10 LABEL_FOR · ok R-94 MediaWork
ok R-68 MANUFACTURES deferred · ok R-68 CONTRACTS_MANUFACTURING · ok R-74 CERTIFIED_UNDER · ok R-68 DISTRIBUTES_PRODUCT · ok R-83 ENDORSES_PRODUCT
$ python -I $D/build_node.py <worktree>
ok header · module lines added: 6 · ok R-03 mutations x5 · ok R-03 LabelVersion mutations · ok R-18/R-08 LabelVersion whyNode · ok R-74 ProductLot · ok R-94 LabelSnapshot
```

Validation (Python, PyYAML safe_load plus regex over the SDL):

```
D6.relationship.yaml {'version': 1, 'module': 'D6', 'relationships': 9, 'predicateOnly': 22, 'registeredElsewhere': 8, 'deferred': 58}
  every entry has type, class, from, to, edgeProperties, cardinality, temporal, questions, pattern, populatedBy, fixture, nestedOperations, aggregate, rationale, module (MISSING [] x9)
  HAS_LABEL_VERSION AssertedEdgeProperties exclusive=True
  predicateOnly names 31, collide with relationship types (all packet 04 + final/schema): []      (R-53)
  reg==sdl True
D6.node.yaml {'version': 1, 'module': 'D6', 'nodes': 6, 'deferred': 5, 'mergedInto': 16}; nodes==sdl True; no field missing
D6.seams.yaml {'version': 1, 'module': 'D6', 'seams': 29, 'predicateSeams': 13, 'sharedVocabularies': 8}
  seams: accepted 28, cut 1 (QUALITY_RESULT_FOR → D6.Product, R-73); predicateSeams: accepted 13
  seam type refs not in final SDLs (K + D1..D13 present on 2026-10-08): []
  out seams == SDL cross-module targets: BRANDED_AS→Brand, DECLARES_COMPONENT→Constituent|IngredientMaterial|FoodItem, NAMES_RESPONSIBLE_PARTY→Organization, SELLER_OF_RECORD→Organization
```

The seam targets were checked against the final SDLs on disk: D8's RegulatoryRecordTopic, LegalStatusSubject, LotOfTarget and CertificationCoverageTarget; D3's AdministeredMaterial; D12's referencedByProducts and memberProducts; D4's DELIVERS; D5's STEP_USES → Subjectable; D1's Constituent.

Register edits, in summary:
- **Relationship register:**
  - Every entry gets `module: D6`, and `fixture` becomes `final/fixtures/D6/<folder>`.
  - HAS_LABEL_VERSION gets AssertedEdgeProperties, `exclusive: true` and an `exclusiveNote` (see issues).
  - DECLARES_COMPONENT's rationale cites R-30, R-58, R-87 and R-88. NAMES_RESPONSIBLE_PARTY's cites R-67.
  - Every predicateOnly entry gets `registrar: D6`. OFFERS_INTERVENTION gets its subjects (R-52), SUCCEEDED_BY the D7 Organization pair (R-52), LISTING_PACKAGE_SIZES the R-74 text, and BEARS_SEAL CQ-PF-03b.
  - Four entries move to a new `registeredElsewhere` list of 8 rows: INTENDED_FOR_TARGET, PREPARED_WITH→HAS_RECIPE_INGREDIENT, MANUFACTURES and MANUFACTURER_STATEMENT→MANUFACTURER_UNNAMED. The list also holds SUPPLIES_MATERIAL, SAMPLE_TESTED_POSITIVE_FOR, SOURCED_FROM_COUNTRY and DISTRIBUTES.
  - Stale deferred reasons are updated: LABEL_FOR, REGION_HAS_DECLARATION, MANUFACTURES, CONTRACTS_MANUFACTURING, CERTIFIED_UNDER, DISTRIBUTES_PRODUCT and ENDORSES_PRODUCT.
- **Node register:**
  - `module: D6` on every node.
  - `mutations` is read as `{ graphql: none, executor: … }` (R-03).
  - LabelVersion whyNode follows R-18 and R-08. ProductLot follows R-74, and the LabelSnapshot mergedInto row follows R-94.
- **Seams:**
  - Each row carries `status` and `ruling`.
  - RESULT_FOR becomes QUALITY_RESULT_FOR, and the row is cut (R-73).
  - OFFERS_INTERVENTION and LINKS_TO_OFFER move to `predicateSeams` (R-94).
  - Union notes are refreshed to the final D8 and D3 SDLs (R-72, R-67).
  - STEP_USES goes to K.Subjectable (R-28).
  - Eleven `predicateSeams` rows are added for the registrars named by R-52, R-62, R-68, R-73, R-88 and R-18.
  - sharedVocabularies point at `final/`. AmountBasis is listed as provided by D6. Pins are targets 0.2.2 and frontiers 0.2.1 (R-60).

```
$ sha256sum final/schema/D6.graphql final/_work/registers/D6.*.yaml
6b14b735ef1a80f479264325feb62140ee078a81082661f79e78253d3abd1523  final/schema/D6.graphql
a744c4277bdeab867cca8d58261c085be13ae275b648ae3f16b88f26a1037b0f  final/_work/registers/D6.node.yaml
aa00bd63fe1fa380f1ca17e3189a9ef8a3cb72d694299130eec4f32f23cd2452  final/_work/registers/D6.relationship.yaml
93d43143f4d68c4b675b54f4f8c426917c1e17253892e602787d5c6ece0623b9  final/_work/registers/D6.seams.yaml
```

Note: the D6.seams.yaml hash above was taken after the MANUFACTURER_UNNAMED row was corrected to D7's registration (subject Organization, object literal; packet D7 05 line 178).

## Issues for the integrator and owner

1. **R-10 vs D6's NON-EXCLUSIVE design.** The ruling sets `exclusive: true` on HAS_LABEL_VERSION. The packet had declared it non-exclusive: parallel open episodes per asserting source (packet 03 Q-D6-01; adversarial fix M14). With R-22 (one episode per (from, to, type, asserter)), the fixtures are consistent only if the executor checks non-overlap per (package, type, asserter). R-10 does not fix that scope.
2. **Q-D6-01 pattern.** The pattern in packet 03 reads `c.declaredNameVerbatim`, which R-30 removed. The query-patterns editor must read the line Assertion's locator text or its `declaredName:` qualifier instead.
3. **R-39.** The `populatedBy` rewrite to action-space ids is not in modules.D6, and K did not apply it either. The measured alias map is in the D6.relationship.yaml header.
4. **Fixture re-keys belong to the fixtures editor:** MANUFACTURER_STATEMENT→MANUFACTURER_UNNAMED (filing-channels-niagen-10k), PREPARED_WITH→HAS_RECIPE_INGREDIENT (prepared-food-bigmac-mcdonalds), SAMPLE_POSITIVE_OUTBREAK_STRAIN→SAMPLE_TESTED_POSITIVE_FOR (recall-moringa-mogo e14, e15, e19), and the per-line verbatim fields → qualifiers (R-30).
5. **Other modules' seams that still name StateEpisodeProperties for HAS_LABEL_VERSION:** packet D1 10-seams line 19. That row belongs to the D1 editor.

---

<!-- stage: _runlog/module-D7.md -->

# Module D7 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-03, R-05..R-07, R-15, R-19, R-20, R-27, R-28, R-30, R-46, R-50, R-52..R-55, R-60, R-67..R-69, R-72, R-77..R-83, R-89, R-91, R-92, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D7`, and every other module's rows that name D7); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` "Kernel changes in synthesis"; `scratchpad/inv/review-open-issues.json` (D7); `scratchpad/inv/inventory-final.md` (D7 seam rows).

```
$ sha256sum packets/D7/04-schema-proposal.graphql packets/D7/05-relationship-register.yaml packets/D7/06-node-register.yaml packets/D7/10-seams.yaml
d691417f5133a1bba863f0e921059947745c7f71e37602ec58f212bacb3936ac  packets/D7/04-schema-proposal.graphql
8f8b0ee432b1600808af413fac805744bdf7677c205a3feb36c6aeb03802dc83  packets/D7/05-relationship-register.yaml
c856a14010e20a4e14d7e23977e70b357e8aaaf0444e7cc1fc8ce761a0df38a1  packets/D7/06-node-register.yaml
16f6f33aaa1a9d663b9e9aaadde841116f38b8c8de1ef3438e7d360d4cebae4b  packets/D7/10-seams.yaml
$ cp packets/D7/04-schema-proposal.graphql final/schema/D7.graphql
```

## SDL edits (`final/schema/D7.graphql`, banner `# ---- fragment D7 ----` kept on line 1)

| ruling | edit |
| --- | --- |
| R-30 | `RoleEdgeProperties.roleTitleVerbatim` removed (Assertion qualifier `roleText:`) |
| R-30 | `StakeEdgeProperties.stakeClassVerbatim` removed (Assertion qualifier `stakeClass:`) |
| R-30 | `ValueEdgeProperties.currency` renamed `unitCode` (`iso4217:<CODE>`) |
| R-30 | docstrings of RoleEdgeProperties, StakeEdgeProperties, ValueEdgeProperties, OrgRoleKind; header synthesis line |

No other ruling requires an SDL change in D7. Node types, relationship types and pairs are unchanged: 4 node types, 7 relationship types, 9 relationship fields = 9 from→to pairs (collapsed and expanded are the same: D7 declares no union and no interface target). The four D7 edge-property types now start with AssertedEdgeProperties' eleven fields verbatim and add only filterable qualifiers (M11).

Not changed (no ruling requires it): `Award.currency` (R-30 names only ValueEdgeProperties), `Organization.legalName` / `status` projections, `PublicActorBasis.SPEAKER_OR_CREATOR`.

## Registers

Written by hand from the packet's 05, 06, 10 (each entry: every contract field plus `module: D7`; `fixture` → `final/fixtures/D7/<folder>`).

- `D7.node.yaml`: `mutations` read per R-03 as `{ graphql: none, executor: unstated, packet: {…} }` (the packet does not state executor operations, nothing invented); deferred Facility closed (R-67), ConflictRelevanceAssessment (R-55, R-20), FinancingRound (R-69, R-92), PseudonymousActor (R-79); mergedInto role rows (R-30).
- `D7.relationship.yaml`: rationales (R-30, R-69, R-78, R-15); every predicate entry names `registrar: D7` (R-52); removed OPERATES_CHANNEL (R-79), AUTHORED (R-80), SPEAKS_AT (R-81), ENDORSES_PRODUCT and RECOMMENDS_USE (R-83), FINANCING_AMOUNT / DATE_OF_FIRST_SALE / INVESTOR_COUNT (R-92), SUCCEEDED_BY (R-52, D6 registrar); added DISTRIBUTES (R-68) and aliases/qualifiers on the manufacturer set (R-68); DISCLOSES_INTERESTS_OF note (R-82); new `authorizingPredicates` list for the seven typed edges (R-53, K precedent); deferred reasons updated (R-67, R-68, R-69, R-79, R-80, R-81, R-82, R-83, R-78, R-47).
- `D7.seams.yaml`: relationship `seams` and `predicateSeams` split (R-94); each row `status` + `ruling`. Cut: OPERATED_BY typed row (R-79), COVERS → Organization (R-67), publisherUid property reference (R-46). CQ-MF-01 dropped from the two D8 ISSUED_BY rows (QualityResult, CertificationListing) per R-67, which leaves them with `questions: []` (kept as inbound hub-split rows; flagged). Predicate rows: D7 manufacturer set (owner this, R-68); OPERATED_BY (D9, R-79), RECOMMENDS_USE (D9, R-83), DISCLOSES_INTEREST (D9, R-82), AUTHORED_BY (D3, R-80), OFFERS_INTERVENTION (D6, R-52), SUCCEEDED_BY (D6, R-52), REPORTED_MARKET_MOVE / FINANCING_AMOUNT / DATE_OF_FIRST_SALE / INVESTOR_COUNT (D13, R-92), EVENT_ABOUT (D13, R-69). Vocabulary pins: targets 0.2.2, frontiers 0.2.1 (R-60). Owner field names re-checked by grep against packets/{D3,D4,D6,D8,D9,D13}/04 (Study.roles, StudyParty = Organization | Person | Award, Publication.reportsOn, AssayVersion.performingLab, Product.brand, LabelVersion.responsibleParty, Offer.sellerOfRecord, RegulatoryRecord.issuedBy/addressedTo, Patent.assignees/licensees, MediaWork.appearances/sponsors, ContentSponsor = Organization | Brand, Chunk.mentions, Event.involvedOrganizations/involvedPeople; CertificationCoverageTarget = Product | ProductVariant | Lot).

Rulings that do not edit these files (carried to the patterns / answer-kind integrator): R-19 (CQ-CL-05, Q-D7-06: T = OCCURS_IN MediaWork.publishedAt with snapshot fallback; in-container disclosure via Source -RENDITION_OF-> work; OVERLAP reads a.validObservedAt through r.assertionUid) and R-50 (Q-D7-22 materialized → retrieved) live in 03 / the answer-kind table.

```
$ python (yaml.safe_load + regex over final/schema/D7.graphql)
node {'version': 1, 'module': 'D7', 'nodes': 4, 'deferred': 9, 'mergedInto': 12}
rel {'version': 1, 'module': 'D7', 'relationships': 7, 'predicateOnly': 18, 'authorizingPredicates': 7, 'deferred': 25}
seams {'version': 1, 'module': 'D7', 'seams': 31, 'predicateSeams': 15, 'sharedVocabularies': 7}
SDL node types ['Organization', 'Person', 'Brand', 'Award'] 4
SDL rel fields 9 distinct 7
nodes match True
rels match True
register pairs 9
rel missing [] / node missing [] / seam missing [] / pseam missing []
predicateOnly & relTypes set()
retired still in predicateOnly set()
status {'accepted': 43, 'cut': 3}
cut rows [('OPERATED_BY', 'R-79'), ('COVERS', 'R-67'), ('publisherUid (property reference)', 'R-46')]
SDL fields ['unitCode', 'currency']          # unitCode = ValueEdgeProperties; currency = Award.currency (unruled)
```

## Compile check

D7 references no type outside the module except kernel types, so no seam stubs were needed (scratch dir `scratchpad/synth/module-D7/`).

```
$ cat final/schema/kernel.graphql final/schema/D7.graphql > synth/module-D7/K+D7.graphql
$ wc -c -l final/schema/D7.graphql synth/module-D7/K+D7.graphql
   465  23299 final/schema/D7.graphql
  1655  79339 K+D7.graphql
$ BKS_SCHEMA_PATH=C:/.../synth/module-D7/K+D7.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema C:/.../synth/module-D7/K+D7.printed.graphql
wrote ...\synth\module-D7\K+D7.printed.graphql (452056 chars) in 3s
wall: 79 s (first pnpm/tsx start in this shell)
$ BKS_SCHEMA_PATH=C:/.../final/schema/kernel.graphql ... print-schema C:/.../synth/module-D7/K.printed.graphql
wrote ...\synth\module-D7\K.printed.graphql (326571 chars) in 2s
wall: 19 s
$ cat final/schema/kernel.graphql packets/D7/04-schema-proposal.graphql > synth/module-D7/K+D7packet.graphql
$ BKS_SCHEMA_PATH=C:/.../synth/module-D7/K+D7packet.graphql ... print-schema C:/.../synth/module-D7/K+D7packet.printed.graphql
wrote ...\K+D7packet.printed.graphql (453569 chars) in 2s
wall: 12 s
$ for f in ...; wc -c; wc -l; grep -c '^input '; '^enum '; '^type '; '^union '; '^interface '
K.printed.graphql          bytes=326595 lines=6498 input=179 enum=35 type=105 union=0 interface=2
K+D7.printed.graphql       bytes=452102 lines=8821 input=241 enum=48 type=141 union=0 interface=2
K+D7packet.printed.graphql bytes=453615 lines=8837 input=241 enum=48 type=141 union=0 interface=2
$ grep -c "roleTitleVerbatim\|stakeClassVerbatim" K+D7.printed.graphql   -> 0
$ grep -c "^type Award \|^type Brand \|^type Person \|^type Organization " K+D7.printed.graphql -> 4
```

Source confirmation: all outputs are 0.3–0.45 MB, not the ~55 MB pinned fallback; K+D7 contains the four D7 node types and none of the removed R-30 fields, and differs from the packet variant.

| measure | kernel alone | kernel + D7 (final) | D7 marginal | kernel + D7 packet | R-30 effect |
| --- | ---: | ---: | ---: | ---: | ---: |
| printed bytes | 326,595 | 452,102 | +125,507 | 453,615 | −1,513 |
| printed lines | 6,498 | 8,821 | +2,323 | 8,837 | −16 |
| input types | 179 | 241 | +62 | 241 | 0 |
| enums | 35 | 48 | +13 | 48 | 0 |
| object types | 105 | 141 | +36 | 141 | 0 |
| build (print-schema log) | 2 s | 3 s | | 2 s | |

---

<!-- stage: _runlog/module-D8.md -->

# Module D8 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- Read: `final/decision-report.md` (R-01 to R-08, R-14 to R-16, R-23, R-31, R-52 to R-57, R-66 to R-68, R-72 to R-74, R-84, R-88, R-93, R-94), `final/_work/rulings.yaml` (`global`, `modules.D8`, and other modules' rows naming D8), `final/schema/kernel.graphql`, `final/_runlog/module-K.md` ("Kernel changes in synthesis"), `packets/D8/04`, `05`, `06`, `10`, `11` (OQ-D8-02), fixture predicate scan.

```
$ sha256sum packets/D8/04-schema-proposal.graphql packets/D8/05-relationship-register.yaml packets/D8/06-node-register.yaml packets/D8/10-seams.yaml final/schema/kernel.graphql final/_work/rulings.yaml final/decision-report.md
2656eda17ac00c47817eb822c7b3b264de49637ac0d5f44b79dec5185b2bd6c0  packets/D8/04-schema-proposal.graphql
9e70e0868d573ad57ff18fd6141e247751d86bcfa9c2af3648f1673e32091ce3  packets/D8/05-relationship-register.yaml
aac6d4a3a8f905840746c9245145fdf14db561af0651b8747070c0408ac69e70  packets/D8/06-node-register.yaml
d0beff5d1b1cba12eff9d3d1e6ba8790e5fb44dc2690a9d5eead1495c71314ea  packets/D8/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
19dba4c3c822d3cbee75f232a015ca4ca6719eb4e8b3dc508ecb1f218123ac81  final/_work/rulings.yaml
327c2c3d7b2c00bdcfa51935388194ef2eabae64a10b6b149d8edb9533c47762  final/decision-report.md
```

Kernel changes 1 to 10 (module-K.md) checked against D8: D8 never used StateEpisodeProperties, RENDITION_OF, contentHashBasis or a Subjectable target; it registered RATES_CLAIM (removed, item 7). No other kernel change touches D8.

## Commands

```
$ cp packets/D8/04-schema-proposal.graphql final/schema/D8.graphql      # banner "# ---- fragment D8 ----" kept on line 1
```

SDL edits were made with the Edit tool, plus one Python string-replace pass (11 replacements, each asserted to match once).

| ruling | SDL edit |
| --- | --- |
| R-57 | `enum SpecComparator` deleted; `QualityResult.specComparator: QuantityComparator` (D1). Field docstring carries the UNKNOWN rationale |
| R-72 | `RegulatoryRecordTopic = ChemicalSubstance \| IngredientMaterial \| Product \| Lot` (5 → 4); `LegalStatusSubject = ChemicalSubstance \| IngredientMaterial \| Product \| Patent` (5 → 4); RegulatoryRecord.concerns and LegalStatus docstrings name the Product -DELIVERS-> Device path |
| R-73 | `union QualityResultFor` deleted, `QualityResult.resultFor: [Lot!]!`; `union PatentTopic` deleted, `Patent.concerns: [ChemicalSubstance!]!`; QualityResult docstring: a survey row without a lot is a D1 predicate; identity rule uses the lot uid |
| R-88 | `LegalStatusKind.PRESCRIPTION_ONLY` |
| R-66 | RegulatoryPathway docstring: D13 deletes ApprovalPathway / DesignationType and retypes its Event fields; OQ-D8-02 mapping published in final/vocabularies |
| R-08 | CQ-PF-03 → CQ-PF-03a in the Lot and CertificationListing docstrings and two field docstrings |
| header | synthesis edit list; counts point at this run log |

Registers were built from the packet's 05, 06 and 10. Every entry keeps every contract field and adds `module: D8`.
- `D8.relationship.yaml`: scratch `synth/module-D8/build_rel.py` (string replaces asserted to match once; regex adds `module: D8` and rewrites `fixture:` to `final/fixtures/D8/<folder>`).
- `D8.node.yaml`: scratch `synth/module-D8/build_node.py` (same method).
- `D8.seams.yaml`: written by hand from 10.

```
$ python build_rel.py  C:/Users/.../schema/program     -> ok
$ python build_node.py C:/Users/.../schema/program     -> first run AssertionError (match string lacked "it"); fixed with sed; rerun -> ok
```

Register edits, by ruling:

| ruling | edit |
| --- | --- |
| R-72 | CONCERNS and STATUS_OF `to` lose D4.Device; rationales name the Product -DELIVERS-> Device path; seams rows `cut`; new seam row DELIVERS D6.Product → D4.Device (owner other, declared by D4) |
| R-73 | QUALITY_RESULT_FOR `to: Lot`; CONCERNS cardinality notes Patent → D1.ChemicalSubstance only; `fixtureRequest` on STATUS_OF (LNHPD NPN, CQ-MF-02) and COVERS (NSF variant listing, CQ-PF-03a); deferred rows for the cut pairs; seams rows `cut`; predicate SAMPLE_TESTED_POSITIVE_FOR (registrar D8) |
| R-07 | `demotionCandidate` on ASSIGNED_TO, LICENSED_TO, MEASURES_ANALYTE |
| R-52 | `D8.` prefix dropped on 13 literal predicates; `registrar: D8` on every predicateOnly row; RATES_CLAIM (K) and INTENDED_FOR_TARGET (D5) removed and listed in seams `predicateSeams` |
| R-68 | MANUFACTURES, CONTRACT_MANUFACTURES_FOR, DISTRIBUTES, SUPPLIES_INGREDIENT, EXCLUSIVE_SUPPLIER_OF removed (D7 registers MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL, DISTRIBUTES); predicateSeams rows |
| R-88 | HAS_APPROVED_INDICATION `ruling: R-88` (subject D6.Product \| D1.ChemicalSubstance, object D2.Condition) |
| R-93 | HAS_ACTION_LEVEL, HAS_CLAIM_CONDITION added (registrar D8) |
| R-03 | node `mutations` rewritten `{ graphql: none, executor: "..." }`; executor text restates each type's docstring write rule |
| R-67 | Facility deferred row and LISTING_COVERS_FACILITY_OF promoteWhen: D8 is the designated future owner, promotion trigger |
| R-08 | CQ-PF-03 → CQ-PF-03a (ISSUED_BY, COVERS, CertificationListing whyNode, seams) |
| R-60, R-94 | seams: `seams` / `predicateSeams` split; vocabulary files under final/; pins targets 0.2.2, frontiers 0.2.1; new rows quantity-comparator (D1, R-57) and predicates (R-52) |

## Checks

```
$ python -c "yaml.safe_load(...)"  (per file)
D8.relationship.yaml {'version': 1, 'module': 'D8', 'relationships': 11, 'predicateOnly': 27, 'deferred': 24}
D8.node.yaml         {'version': 1, 'module': 'D8', 'nodes': 6, 'deferred': 9, 'mergedInto': 35}
D8.seams.yaml        {'version': 1, 'module': 'D8', 'seams': 29, 'predicateSeams': 12, 'sharedVocabularies': 8}
seams by (owner, status): (this, accepted) 20, (other, accepted) 5, (this, cut) 4
rel missing [] · node missing [] · seam missing [] · pseam missing []
11 True     # relationship types in SDL == register entries
6 True      # node types in SDL == node register
predicateOnly & reltypes set()     # R-53: against 106 relationship type names in all packet SDLs + final kernel
filterProperties checked           # every filterProperty exists in the SDL and is not @filterable(byValue: false)
```

R-53 / R-52 collision scan: no D8 predicateOnly name equals any relationship type in `packets/*/04-schema-proposal.graphql` or `final/schema/kernel.graphql`, and no other packet's 05 registers any of the 27 D8 predicate names.

Module counts (scratch `synth/module-D8/count.mjs`, graphql parser over the SDL; union members expanded; no interface targets, so collapsed = expanded):

```
$ node count.mjs final/schema/D8.graphql
nodeTypes 6, relationshipTypes 11, pairs 25, widestUnion 4, enums 20, maxRelFieldsOnType 3
pairsPerType ISSUED_BY 3, ADDRESSED_TO 1, CONCERNS 5, STATUS_OF 4, STATUS_FROM 1, LOT_OF 2, QUALITY_RESULT_FOR 1,
             MEASURES_ANALYTE 3, COVERS 3, ASSIGNED_TO 1, LICENSED_TO 1
unions RegulatoryRecordTopic 4, LegalStatusSubject 4, LotOfTarget 2, QualityAnalyte 3, CertificationCoverageTarget 3
$ node count.mjs packets/D8/04-schema-proposal.graphql
nodeTypes 6, relationshipTypes 11, pairs 29, widestUnion 5, enums 21, unions 7
```

Neo4j (disposable `bks-neo4j-synth`, 5.26): the R-72 device path plans without error.

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "EXPLAIN MATCH (d:Device {uid: $uid})<-[:DELIVERS]-(p:Product)<-[e:STATUS_OF]-(s:LegalStatus) WHERE ... MATCH (s)-[:STATUS_FROM]->(r:RegulatoryRecord) OPTIONAL MATCH (rec:RegulatoryRecord {recordKind:'RECALL'})-[:CONCERNS]->(p) RETURN ..."
Statement: "READ_ONLY" · Planner: "COST" · Runtime: "SLOTTED"
```

## Compile check

Scratch `synth/module-D8/`: `stubs.graphql` (sha256 `44d2bbb6…`) = 6 stub node types (ChemicalSubstance, IngredientMaterial, Constituent, Product, ProductVariant, Organization; Entity & Subjectable, 7 Entity fields) + `enum QuantityComparator` with the R-57 values. Stubs stay in scratch.

```
$ cat kernel.graphql stubs.graphql            > kernel-stubs.graphql
$ cat kernel.graphql stubs.graphql D8.graphql > kernel-stubs-D8.graphql
$ BKS_SCHEMA_PATH=<C:/ abs>/kernel-stubs.graphql    NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <C:/ abs>/kernel-stubs.printed.graphql
wrote ...\kernel-stubs.printed.graphql (357427 chars) in 2s            (wall 16 s incl. pnpm/tsx start)
$ BKS_SCHEMA_PATH=<C:/ abs>/kernel-stubs-D8.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <C:/ abs>/kernel-stubs-D8.printed.graphql
wrote ...\kernel-stubs-D8.printed.graphql (510116 chars) in 3s         (wall 16 s)
$ BKS_SCHEMA_PATH=<C:/ abs>/kernel-only.graphql ... print-schema .../kernel-only.printed.graphql
wrote ...\kernel-only.printed.graphql (326571 chars) in 1s
# packet baseline: kernel + stubs without QuantityComparator + a Device stub + packets/D8/04
$ BKS_SCHEMA_PATH=<C:/ abs>/kernel-stubs-D8packet.graphql ... print-schema .../kernel-stubs-D8packet.printed.graphql
wrote ...\kernel-stubs-D8packet.printed.graphql (516743 chars) in 1s
```

No errors. Every print is 0.3–0.5 MB, not the ~55 MB pinned fallback. The final print contains `PRESCRIPTION_ONLY` (2), `QuantityComparator` (3), `resultFor(... ): [Lot!]!`, and 0 occurrences of SpecComparator / QualityResultFor / PatentTopic, so it was built from this SDL.

```
$ wc -c, wc -l, grep -c '^input ' / '^enum ' / '^type ' / '^union '
kernel-only           326595 B   6498 lines  179 inputs  35 enums  105 types  0 unions
kernel-stubs          357451 B   7008 lines  191 inputs  35 enums  123 types  0 unions
kernel-stubs-D8       510156 B  10334 lines  299 inputs  56 enums  171 types  5 unions
kernel-stubs-D8packet 516783 B  10477 lines  309 inputs  56 enums  174 types  7 unions
```

| measure | value |
| --- | ---: |
| final/schema/D8.graphql | 34,793 B, 689 lines (packet 33,616 B, 694 lines) |
| D8 marginal over kernel + stubs | +152,705 B, +3,326 lines, +108 inputs |
| D8 + stubs marginal over kernel alone | +183,561 B, +120 inputs |
| final vs packet baseline (same kernel; the packet baseline also carries a Device stub) | −6,627 B, −10 inputs, −2 unions |

The −10 inputs include the Device stub's own inputs, so they are not all from the R-72/R-73 cuts.

## Left for other stages (not D8 files)

- `final/requests.md`: two numbered fixture requests (R-73): COVERS → D6.ProductVariant (NSF variant listing, CQ-PF-03a) and STATUS_OF → D6.Product (LNHPD NPN, CQ-MF-02). They are recorded as `fixtureRequest` in the register, but the file is not written.
- `final/fixtures/D8/`: rename the 14 `D8.`-prefixed predicate uses (13 names) (R-52); COA assertions in eurofins-coa-quantity-by-input asserted by the issuing lab (R-16). A grep of the D8 fixtures' assertions.yaml found no use of SUPPLIES_INGREDIENT, EXCLUSIVE_SUPPLIER_OF, MANUFACTURES, DISTRIBUTES or INTENDED_FOR_TARGET, and one fixture (imu-tek-warning-letter-recall) uses RATES_CLAIM, which is unchanged.
- `final/vocabularies/`: the R-57 comparator mapping, the OQ-D8-02 RegulatoryPathway mapping (R-66), and the D8 predicate rows (R-52, R-73, R-88, R-93).
- Packet text outside the deliverables: 03 Q-D8-23 pattern (R-72), Q-D8-19 answer kind (R-50), CQ-PF-03a (R-08), and closing OQ-D8-29, OQ-D8-31 and OQ-D8-34.

---

<!-- stage: _runlog/module-D9.md -->

# Module D9 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01 to R-06, R-15 to R-29, R-43, R-49, R-50, R-52 to R-55, R-65, R-67, R-74, R-79 to R-84, R-88, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D9`, and every other module's rows that name a D9 type or predicate); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` ("Kernel changes in synthesis"); `final/_work/registers/K.*.yaml`; `scratchpad/inv/review-open-issues.json` (D9 block).

```
$ git rev-parse --short HEAD
e484fd2
$ sha256sum packets/D9/04-schema-proposal.graphql packets/D9/05-relationship-register.yaml packets/D9/06-node-register.yaml packets/D9/10-seams.yaml final/schema/kernel.graphql
bb5d7e250a4a1fa0a84e2fb33cbd8c03280e560da2fa1c118f33b2ef44509644  packets/D9/04-schema-proposal.graphql
350623eab56e72f0765d3fb5e1335c0fb9ca1e3a68e8e0aab142363a889552c5  packets/D9/05-relationship-register.yaml
e21fa2eca34ac8ae1fd3e9ffe1fe52dfedf158a17afbda24b8317803acc5acfb  packets/D9/06-node-register.yaml
1fcb16336dd0c5af1b039e9229c77408682a8df1492c5d1d87786246ff000af0  packets/D9/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
```

## Commands

```
$ cp packets/D9/04-schema-proposal.graphql final/schema/D9.graphql
```

The SDL edits were made with the Edit tool and with a Python string-replace script (each replace asserted to match exactly once). The banner `# ---- fragment D9 ----` stays on line 1. Line endings are LF (`grep -c $'\r'` → 0).

| ruling | SDL edit (final/schema/D9.graphql) |
| --- | --- |
| R-43, R-26 | `MediaWork.renditions` (RENDITION_OF): `properties: "StructuralEdgeProperties"` → `"AssertedRecordedProperties"`; docstring `class: asserted`, kernel meaning (Source → MediaWork \| D3 Publication; declared by D9 and D3; registered by D3), recorded time only, source-family rule. `nestedOperations: [CONNECT]` unchanged (R-03 asserted). |
| R-19 | `MediaWork.occurrences` (OCCURS_IN) docstring: every Assertion whose evidence is in this work, not only CLAIM; exactly one container per Assertion. MediaWork type docstring, first sentence, likewise. |
| R-15 | MediaWork type docstring: a multi-byline work is the ASSERTED_BY target of what it states in its own voice; a bylined web article is asserted by its single named author, else the site owner. |
| R-94 | Header: `Mention;` dropped from the "What D9 does NOT declare" kernel types list. A synthesis line was added to the header. |

No type, field, enum or union was added or removed. The rest of the D9 rulings change no SDL:
- R-17: Chunk keeps `@node(labels: ["Chunk"])` (confirmed).
- R-79: OPERATED_BY and REPUBLISHES stay predicate-only (confirmed).
- R-52, R-65, R-55, R-82, R-83 are register and seam edits.
- R-20 (closes K-2, K-3), R-65 (closes D13-2), R-49 (fixture edit), R-55 (fixture re-key) and R-50 (CQ-CL-07 answer kind retrieved → assessment) touch 11-open-questions, fixtures or 02-questions. None of those is a deliverable of this stage. They are listed under "Left for later stages".

```
$ diff packets/D9/04-schema-proposal.graphql final/schema/D9.graphql   # 6 hunks, exactly the edits above
$ wc -c -l packets/D9/04-schema-proposal.graphql final/schema/D9.graphql
  343 18943 packets/D9/04-schema-proposal.graphql
  348 19862 final/schema/D9.graphql            (+5 lines, +919 bytes)
```

Registers were built from the packet's 05, 06 and 10 files. Every entry keeps every contract field and adds `module: D9`.
- `D9.node.yaml` was built from 06 by a Python string-replace script (stdin), each replace asserted to match once.
- `D9.relationship.yaml` and `D9.seams.yaml` were written by hand from 05 and 10.

### Register edits

- **Relationship register** (`D9.relationship.yaml`):
  - `module: D9` is added to every entry. Every `fixture` now points at `final/fixtures/D9/hl52-transcript-nmn-practice`.
  - RENDITION_OF (R-43, R-26): class asserted, AssertedRecordedProperties, `kernelMeaning: true`, `registrar: D3`, `declaredBy: [D9, D3]`. The rationale now says a wrong join is corrected by a superseding episode. The entry stays because D9 declares `MediaWork.renditions`. D3's register holds the registration.
  - OCCURS_IN (R-19): `from`, cardinality and rationale cover every Assertion whose evidence is in a MediaWork. T falls back to the snapshot.
  - MENTIONS (R-27): `kernelMeaning: true` and `registrar: D9`. It is licensed by entity-link/vN, and RESOLUTION is needed only on a surface-form binding.
  - COVERS_LOCATOR (R-27): answers cite HAS_EVIDENCE.
  - APPEARS_IN (R-80, R-81): rationale only.
  - New list `authorizingPredicates` (R-53, R-52): APPEARS_IN and CONTENT_SPONSORED_BY. These Assertion predicates authorize D9's typed asserted edges. They need registration (the executor rejects unregistered predicates), but they cannot be predicateOnly entries. This follows K's HAS_IDENTIFIER handling.
  - `predicateOnly`:
    - Every entry has `registrar: D9`.
    - CORRECTS is removed (K registers it, R-20, R-52). It is recorded under `deferred`.
    - RECOMMENDS_AGAINST is added (R-52, R-83).
    - RECOMMENDS_USE gets aliases RECOMMENDS_FOR and ENDORSES_PRODUCT. Its subject is the means, never a Target, and a goal is the qualifier `target:<key>` (R-83).
    - DISCLOSES_INTEREST is rewritten as the one disclosure predicate, with its aliases (R-82).
    - OPERATED_BY gets alias OPERATES_CHANNEL and the R-79 promotion trigger. REPUBLISHES cites R-79.
    - RECORDING_OF cites R-65. CITES_CONTENT cites R-74.
  - `deferred`: the reasons for RECOMMENDS (R-83), RETELLS (R-21), QUALIFIED_BY and ASSESSES_RETELLING… (R-20), RECORDING_OF… (R-65, R-81), AUTHORED_BY (R-80) and REPORTS_ADVERSE_EXPERIENCE (R-84) are updated, and a CORRECTS row is added.
- **Node register** (`D9.node.yaml`):
  - `module: D9` is added to each of the 3 nodes.
  - The header lists the synthesis edits.
  - mergedInto `Conference` follows R-65: Channel EVENT_SERIES + D13 DATA_PRESENTATION Events, with edition and session as qualifiers on PRESENTED_AT_CONFERENCE.
  - mergedInto `ConflictRelevanceAssessment` follows R-55: registrar D7, and D9 contributes the disclosure facets.
  - The MediaWork whyNode follows R-15.
  - The Chunk mutationsNote records R-17 (labels `["Chunk"]`).
- **Seams** (`D9.seams.yaml`):
  - `seams` and `predicateSeams` are separate lists (R-94). Every row has `module: D9`, `status` (accepted \| cut) and `ruling` (`none` = carried unchanged).
  - Rows added:
    - RENDITION_OF, K.Source → D9.MediaWork (R-43).
    - ASSERTED_BY → MediaWork \| ACCOUNT Channel (R-15).
    - The predicate seams DISCLOSES_INTEREST (R-82), RECOMMENDS_USE \| RECOMMENDS_AGAINST (R-83), PRESENTED_AT_CONFERENCE (D13 → D9.Channel, R-65) and CORRECTS (registrar K, R-20).
  - Cut: RECOMMENDS (derived, not declared; R-83).
  - Notes updated:
    - ASSESSES: R-20, R-49 and R-55. The merged disclosureFinding list is written out. DISCOURSE_METRIC and the interim OTHER form are withdrawn.
    - DERIVED_FROM: R-20 and R-21.
    - OCCURS_IN and HOLDS_* reads: R-19.
    - ON_FRONTIER: R-91.
  - Vocabulary files now point at `final/` (targets pin 0.2.2, frontiers pin 0.2.1, R-60), not at sibling worktrees.

Contract-field and SDL cross-check (Python, yaml + regex over `final/schema/D9.graphql`; script `scratchpad/synth/module-D9/check.py`):

```
$ python .../synth/module-D9/check.py final/_work/registers
relationship {'version': 1, 'module': 'D9', 'relationships': 8, 'authorizingPredicates': 2, 'predicateOnly': 10, 'deferred': 18}
node {'version': 1, 'module': 'D9', 'nodes': 3, 'deferred': 11, 'mergedInto': 31, 'unionsRetired': 8}
seams {'version': 1, 'module': 'D9', 'seams': 12, 'predicateSeams': 11, 'sharedVocabularies': 7}
rel missing []
seam missing []
pseam missing []
sdl rel types ['APPEARS_IN', 'CHUNK_OF', 'CONTENT_SPONSORED_BY', 'COVERS_LOCATOR', 'MENTIONS', 'OCCURS_IN', 'PUBLISHES', 'RENDITION_OF'] True
predicateOnly & reltypes set() predicateOnly without registrar []
nodes ['Channel', 'Chunk', 'MediaWork'] True
packet predicateOnly ['CITES_CONTENT', 'CORRECTS', 'DEPICTS', 'DISCLOSES_INTEREST', 'LINKS_TO_OFFER', 'OPERATED_BY', 'RECOMMENDS_USE', 'RECORDING_OF', 'REPUBLISHES', 'TAKES']
final predicateOnly ['CITES_CONTENT', 'DEPICTS', 'DISCLOSES_INTEREST', 'LINKS_TO_OFFER', 'OPERATED_BY', 'RECOMMENDS_AGAINST', 'RECOMMENDS_USE', 'RECORDING_OF', 'REPUBLISHES', 'TAKES']
fixtures ['final/fixtures/D9/hl52-transcript-nmn-practice']
Channel lost [] / MediaWork lost [] / Chunk lost []      # no packet node-register field dropped
(no packet relationship-register field dropped)
```

The retired names that remain in the final files (OPERATES_CHANNEL, RECOMMENDS_FOR, COMPETING_INTEREST_STATED, REPORTS_ADVERSE_EXPERIENCE, DISCOURSE_METRIC, StateEpisodeProperties) appear only as `aliases`, as "retired" or "withdrawn" notes, or in the SDL's "absorbs pinned …" history line.

## Compile check (kernel + D9 + scratch seam stubs)

The stubs live in scratch only (`scratchpad/synth/module-D9/mods*/seam-closure.graphql`). They are D7 Person, Organization and Brand, each `implements Entity & Subjectable` with the 7 Entity fields, `@query(aggregate: false)` and `@mutation(operations: [])`.

```
$ node scripts/assemble-schema.mjs --modules .../synth/module-D9/mods    --out .../synth/module-D9/K+D9.graphql      # ok, modules 3, types 66
$ node scripts/assemble-schema.mjs --modules .../synth/module-D9/mods-ks --out .../synth/module-D9/K+stubs.graphql   # ok, modules 2, types 54
$ node scripts/assemble-schema.mjs --modules .../synth/module-D9/mods-pk --out .../synth/module-D9/K+D9packet.graphql  # packet D9 SDL, same kernel + stubs
  K+D9 manifest: kernel.graphql ec981e2a…, D9.graphql 323e181a…, seam-closure.graphql d4242b2d…; assembled sha256 25f34429…
$ BKS_SCHEMA_PATH=C:/Users/Pinda/AppData/Local/Temp/claude/.../synth/module-D9/K+D9.graphql NODE_OPTIONS=--max-old-space-size=8192 \
  pnpm --filter @bks/graphql-api print-schema C:/.../synth/module-D9/K+D9.printed.graphql
wrote ...\K+D9.printed.graphql (445125 chars) in 1s          wall 7 s
$ ... K+stubs.graphql    -> wrote ...\K+stubs.printed.graphql (341798 chars) in 1s     wall 7 s
$ ... final/schema/kernel.graphql -> wrote ...\K.printed.graphql (326571 chars) in 1s
$ ... K+D9packet.graphql -> wrote ...\K+D9packet.printed.graphql (440480 chars) in 1s
$ wc -c / wc -l / grep -c '^input ' / '^enum ' / '^type ' / '^union '
K           bytes=326595 lines=6498 inputs=179 enums=35 types=105 unions=0
K+stubs     bytes=341822 lines=6756 inputs=185 enums=35 types=114 unions=0
K+D9        bytes=445199 lines=8701 inputs=236 enums=42 types=143 unions=1
K+D9packet  bytes=440552 lines=8642 inputs=234 enums=42 types=142
$ grep -c "^type MediaWork \|^type Chunk \|^type Channel " K+D9.printed.graphql   -> 3
$ grep -A4 "^type MediaWorkRenditionsRelationship" K+D9.printed.graphql           -> properties: AssertedRecordedProperties!
$ grep -c Mutation K+D9.printed.graphql                                           -> 0
$ diff <(grep '^input ' K+D9packet.printed | sort) <(grep '^input ' K+D9.printed | sort)
> input AssertedRecordedPropertiesSort {
> input AssertedRecordedPropertiesWhere {
```

There were no compile errors. The print-schema log does not name the SDL it used. I confirmed the source two ways: every output is 0.3–0.45 MB, not the ~55 MB pinned fallback, and K+D9 contains the D9 types plus the R-43 edge-property change.

| measure | K alone | K + stubs | K + D9 + stubs | D9 marginal over K + stubs | D9 marginal over K alone | packet D9 marginal over K + stubs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| printed bytes | 326,595 | 341,822 | 445,199 | +103,377 | +118,604 | +98,730 |
| printed lines | 6,498 | 6,756 | 8,701 | +1,945 | +2,203 | — |
| input types | 179 | 185 | 236 | +51 | +57 | +49 |
| enums | 35 | 35 | 42 | +7 | +7 | +7 |
| object types | 105 | 114 | 143 | +29 | +38 | +28 |

The synthesis edits cost +4,647 printed bytes, +2 inputs (AssertedRecordedPropertiesSort/Where) and +1 object type (AssertedRecordedProperties), all from R-43. No kernel field uses AssertedRecordedProperties, so D9's RENDITION_OF is the first field to print it. In the full assembly D3 Publication.renditions and the other domains' AssertedRecordedProperties edges share it.

Pairs and types:

```
$ node .../synth/module-D9/d9pairs.mjs final/schema/D9.graphql
node types 3 Channel,MediaWork,Chunk | relationship types 8 | pairs collapsed 9 | pairs excl. kernel-meaning 7 | unions ContentSponsor=2
  APPEARS_IN|Person|MediaWork, CHUNK_OF|Chunk|SourceSnapshot, CONTENT_SPONSORED_BY|MediaWork|Brand, CONTENT_SPONSORED_BY|MediaWork|Organization,
  COVERS_LOCATOR|Chunk|SourceLocator, MENTIONS|Chunk|Subjectable, OCCURS_IN|Assertion|MediaWork, PUBLISHES|Channel|MediaWork, RENDITION_OF|Source|MediaWork
$ node .../synth/arch-slim/pairs.mjs K+stubs.graphql      -> collapsed(interface=1) 29 expanded 71 Subjectable implementers 6 Entity 14
$ node .../synth/arch-slim/pairs.mjs K+D9.graphql         -> collapsed(interface=1) 38 expanded 104 Subjectable implementers 8 Entity 17
$ node .../synth/arch-slim/pairs.mjs K+D9packet.graphql   -> collapsed(interface=1) 38 expanded 104 Subjectable implementers 8 Entity 17
$ node packages/schema-workspace/dist/cli.js map --sdl .../K+D9.graphql --out .../K+D9-map.md
  node types 17 | relationship fields 40 | distinct relationship types 21 | pairs after expansion 104 | schemaDigest sha256:25f34429…
```

D9 adds 3 node types, 8 relationship types and 9 collapsed pairs (+9 over K + stubs: 29 → 38). Under R-01, 7 of those pairs are D9-owned once the kernel-meaning types RENDITION_OF and MENTIONS are counted in K. The widest union is ContentSponsor with 2 members, within the ≤6 limit. R-43 changes no pair count: the packet SDL and the final SDL give the same 38 / 104.

```
$ sha256sum final/schema/D9.graphql final/_work/registers/D9.*.yaml
323e181a03ff6a268bf732b07348cb86a223e758e9b63831d0120fffc96744bb  final/schema/D9.graphql
882cd4b3b4f961535dcf7e7fb7b0eae2ddec59d8c88c51606eef2feb2617aafa  final/_work/registers/D9.node.yaml
17a7c68ab0a220a01074ebfb42d75d9bbd5b3e9348d98990ae50714429af08f2  final/_work/registers/D9.relationship.yaml
446725ac129b1c8e42016af47a38a75b9f16af0c75e36b566e197c79374a54cf  final/_work/registers/D9.seams.yaml
```

## Left for later stages (not deliverables of the module editor)

- **Fixtures (R-43, R-26).** Nine RENDITION_OF rows in five D9 fixtures (`grep -c RENDITION_OF packets/D9/07-fixtures/*/assertions.yaml`: hl52 3, hl-essentials 3, lifespan 1, longecity 1, rapa 1, sinclair 0) are written `class: structural`. Under R-43 each needs an authorizing Assertion (predicate RENDITION_OF, registrar D3) and AssertedRecordedProperties.
- **Fixtures (R-49).** `hl-essentials-recut-nmncom-retelling/assertions.yaml:152` still carries `assessmentKind: OTHER # interim; kernel request K-10 DISCOURSE_METRIC`. R-49 removes it, and metrics become projection-cache properties.
- **Fixtures (R-55).** Re-key the disclosureFinding values to the merged list. One fixture (hl52 or sinclair) must give the same Assessment through the D7 and D9 patterns.
- **R-49 schema form.** The ruling puts the metrics on the measured node (Claim, Channel or Person) as projection-cache properties. rulings.yaml lists only a fixture edit for D9, so no property was added to Channel ("2–3 scalar properties per measured type, not measured"). This is for the integrator or the owner.
- **11-open-questions closures.** K-2 and K-3 (R-20), D13-2 (R-65), C-6/C-10 (R-17) and C-9 (R-79). **02-questions:** the CQ-CL-07 answer kind changes from retrieved to assessment (R-50).
- **Vocabulary stage.** `final/vocabularies/predicates.yaml` must carry D9's ten predicateOnly entries, the two authorizingPredicates and the aliases. `vocab-source-genres.yaml` still lives in `packets/D9/`.

---

<!-- stage: _runlog/module-D10.md -->

# Module D10 — module editor run log (S team, 2026-10-08/09)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01, R-03, R-06, R-11, R-15, R-17, R-24, R-26, R-28, R-31–R-35, R-45–R-53, R-60, R-68, R-72, R-75, R-83, R-91, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D10`); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` ("Kernel changes in synthesis").
- `packets/D10/` 04, 05, 06, 10, 03 (pattern lines for predicate reads), 11; `review-open-issues.json` D10 block; `inventory-final.md`.

```
$ sha256sum packets/D10/04-schema-proposal.graphql packets/D10/05-relationship-register.yaml packets/D10/06-node-register.yaml packets/D10/10-seams.yaml final/schema/kernel.graphql
9b67b502733a88ef465977b3d7bdea5743f022dd16372a9538166df940008e12  packets/D10/04-schema-proposal.graphql
771da5d819c2776da001573bff2e22c1022c9f6b1e748ae2209d891d7f98df1f  packets/D10/05-relationship-register.yaml
3ea63fd63e738b1f021ef20806144599ea5c15d1f648e6e65da8f813fca3913c  packets/D10/06-node-register.yaml
a8f2c0bc7e136f50b4ae6019ab666d6ac594bfb1b7cdd8dd005c9f699cf04a55  packets/D10/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
$ git rev-parse --short HEAD   -> e484fd2
```

## Checks before editing

```
$ grep -n 'DERIVED_FROM\|ASSESSES' final/schema/kernel.graphql      # kernel declares both with no properties -> D10 fields match (R-53)
$ for e in CriterionKind CriterionDirection ReportItemKind ReportSectionKind OptionDisposition AssociationKind DecisionCriterion ReportItem Association; do grep -l "^(enum|type) $e" packets/*/04* final/schema/kernel.graphql; done
  -> each declared only in packets/D10 (R-56: no enum/type collision)
$ for p in <11 D10 predicateOnly names>; do grep -l "type: \"$p\"" packets/*/04*; grep -l "predicate: $p" packets/*/05*; done
  -> 0 relationship types with those names (R-53); each registered only by D10
$ for p in FORM_OF PREPARATION_OF CONTAINS_INGREDIENT USE_CONSTRAINED_IN HAS_UPPER_LIMIT MANUFACTURES RECOMMENDS_USE RECOMMENDS_AGAINST WORSENS_TARGET NO_EFFECT_ON_TARGET IMPROVES_TARGET INTENDED_FOR_TARGET DECLARES_AMOUNT RATES_CLAIM; do grep -l "predicate: $p" packets/*/05*; done
  USE_CONSTRAINED_IN: D5 | HAS_UPPER_LIMIT: D5 | MANUFACTURES: D6 D7 D8 | RECOMMENDS_USE: D7 D9 | RECOMMENDS_AGAINST: D10
  WORSENS_TARGET / NO_EFFECT_ON_TARGET / IMPROVES_TARGET: D5 | INTENDED_FOR_TARGET: D1 D5 D6 D8 | RATES_CLAIM: D8 K
  FORM_OF, PREPARATION_OF, CONTAINS_INGREDIENT, DECLARES_AMOUNT: registered nowhere (open issue, see below)
$ awk (heading of 03 lines 265, 322, 420, 424, 445, 453, 518, 830)
  -> Q-D10-01, Q-D10-03, Q-D10-07, Q-D10-07, Q-D10-08, Q-D10-08, Q-D10-11, Q-D10-25
$ grep -l "^type <T> " packets/*/04*   # every seam target type exists: ChemicalSubstance, IngredientMaterial (D1); Product (D6);
  Intervention, ProtocolStep, Target, UseConstraint (D5); FoodItem (D12); Device, LabTest, Biomarker (D4); Outcome, Mechanism,
  Condition, MolecularEntity (D2); Organization, Person (D7); RegulatoryRecord (D8); Event, Frontier (D13); Study (D3)
$ grep -n 'type: "CONCERNS"\|type: "ADDRESSED_TO"\|type: "ON_FRONTIER"\|type: "OCCURRENCE_OF"' packets/*/04* final/schema/kernel.graphql
  -> CONCERNS, ADDRESSED_TO in D8 (RegulatoryRecord.concerns / addressedTo); ON_FRONTIER in D13; OCCURRENCE_OF in the final kernel
$ grep -l USE_CONSTRAINED_IN / HAS_UPPER_LIMIT packets/D10/07-fixtures/*/*
  -> livertox-green-tea-extract-harm / mg-rankings-criteria-comparison; no D10 fixture uses RECOMMENDS_FOR or RECOMMENDS_AGAINST
```

## Commands and edits

```
$ cp packets/D10/04-schema-proposal.graphql final/schema/D10.graphql
```

SDL edits (Edit tool; banner `# ---- fragment D10 ----` kept on line 1):

| ruling | SDL edit |
| --- | --- |
| R-17, R-48 | `Association @node(labels: ["Association"])` (was `["Association", "Entity"]`) |
| R-48, R-28 | ASSOCIATES field docstring: no score on the edge, score on the node only, superseded uncited Associations removable, registered Subjectable exception |
| R-48, R-49, R-51, R-47 | Association type docstring: lifecycle; discourse metrics and rule-based classifications are not Associations; AFFECTS_MECHANISM unscored, Q-D2-18 on Associations |
| R-46, R-45 | DecisionCriterion type docstring and `publisherUid` docstring: cache only; authority = authorizing Assertion ASSERTED_BY / WAS_GENERATED_BY |
| R-24 | `validFrom` docstring: BellLabs policy validity, not world valid time |
| R-60 | `targetKeys` docstring: targets@0.2.2; acknowledged exception OQ-D5-47 |
| (header) | synthesis line listing the rulings |

No type, field, enum value, directive, edge-property type or nestedOperations changed (R-03 check: HAS_ITEM, USES_CRITERION, ASSESSES, DERIVED_FROM, BLOCKED_BY reach kernel or other-module records -> [CONNECT]; ASSOCIATES derived -> []).

```
$ diff packets/D10/04-schema-proposal.graphql final/schema/D10.graphql            # docstrings, header and the one label line only
$ diff <(grep -v '^\s*#\|"' packets/D10/04…) <(grep -v '^\s*#\|"' final/schema/D10.graphql)   # only docstring continuation lines differ
```

Registers written by hand from 05, 06 and 10 (Write tool), every contract field kept, `module: D10` added, `fixture` / `exercisedIn` rewritten to `final/fixtures/D10/<folder>`:
- `D10.relationship.yaml`: 6 relationships (rationales cite R-11, R-53, R-26, R-75, R-48, R-28, R-47, R-33); `kernelMeaning` on ASSESSES and DERIVED_FROM; predicateOnly 11 entries with `registrar: D10` (R-52); RECOMMENDS_FOR and RECOMMENDS_AGAINST moved to a new `mergedInto` list (registrar D9, R-83); deferred 16 (AFFECTS_MECHANISM row rewritten per R-47; DISCOURSE_METRIC per R-49 and COMPUTED_FOOD_CATEGORY per R-51 added).
- `D10.node.yaml`: 3 nodes; `labels` per node (R-17); `mutations` as `{ graphql: none, executor: … }` (R-03); publisherUid cache (R-46); deferred 9, mergedInto 9.
- `D10.seams.yaml`: 14 relationship seams (13 accepted, 1 cut: ASSOCIATES -> D12.FoodItem, R-94); "CONCERNS / ADDRESSED_TO" split into two rows (R-94); 9 predicateSeams (R-83, R-52, R-68); vocabulary pins targets@0.2.2, frontiers@0.2.1 under final/vocabularies/ (R-60).

```
$ python - (yaml.safe_load + contract-field and SDL cross-check)
rel {'version': 1, 'module': 'D10', 'relationships': 6, 'predicateOnly': 11, 'mergedInto': 2, 'deferred': 16}
node {'version': 1, 'module': 'D10', 'nodes': 3, 'deferred': 9, 'mergedInto': 9}
seam {'version': 1, 'module': 'D10', 'seams': 14, 'predicateSeams': 9, 'sharedVocabularies': 9}
rel missing [] | node missing [] | seam missing []
SDL rel types == register types: True (ASSESSES, ASSOCIATES, BLOCKED_BY, DERIVED_FROM, HAS_ITEM, USES_CRITERION)
SDL nodes ['DecisionCriterion', 'ReportItem', 'Association'] == register
relationship fields 9 | predicateOnly & relTypes: set() | @fulltext 0 | @vector 0
labels ['["DecisionCriterion", "Entity"]', '["ReportItem", "InformationArtifact"]', '["Association"]']
```

## Compile check

Scratch (`…/scratchpad/synth/module-D10/`): `stubs.graphql` = one stub `type UseConstraint implements Entity & Subjectable` with the 7 Entity fields (the only seam target a D10 field names outside the kernel). Assembled by `cat`: `k-stub.graphql` = kernel + stub; `k-stub-d10.graphql` = kernel + stub + D10.

```
$ BKS_SCHEMA_PATH=C:/…/final/schema/kernel.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema C:/…/synth/module-D10/kernel.printed.graphql
wrote …\kernel.printed.graphql (326571 chars) in 3s            wall 44 s (first run, cold tsx)
$ BKS_SCHEMA_PATH=C:/…/synth/module-D10/k-stub.graphql … print-schema C:/…/synth/module-D10/k-stub.printed.graphql
wrote …\k-stub.printed.graphql (331796 chars) in 2s            wall 20 s
$ BKS_SCHEMA_PATH=C:/…/synth/module-D10/k-stub-d10.graphql … print-schema C:/…/synth/module-D10/k-stub-d10.printed.graphql
wrote …\k-stub-d10.printed.graphql (430289 chars) in 2s        wall 12 s
$ wc -c / wc -l / grep -c '^input ' / '^enum ' / '^type '
kernel:      bytes 326595 lines 6498 inputs 179 enums 35 types 105
k-stub:      bytes 331820 lines 6586 inputs 181 enums 35 types 108
k-stub-d10:  bytes 430321 lines 8400 inputs 223 enums 41 types 136
$ grep -c "R-46\|R-48\|targets@0.2.2" k-stub-d10.printed.graphql   -> 5     (final D10 docstrings are in the output)
$ grep -c "^type DecisionCriterion \|^type ReportItem \|^type Association " k-stub-d10.printed.graphql -> 3
```

Source confirmation: outputs are 0.3–0.4 MB (not the ~55 MB pinned fallback); the kernel output equals the kernel editor's measurement (326,595 B, 179 inputs); the D10 output contains text that exists only in `final/schema/D10.graphql`. No compile errors.

| measure | kernel alone | kernel + stub | kernel + stub + D10 | D10 marginal (over kernel + stub) |
| --- | ---: | ---: | ---: | ---: |
| printed bytes | 326,595 | 331,820 | 430,321 | +98,501 |
| printed lines | 6,498 | 6,586 | 8,400 | +1,814 |
| input types | 179 | 181 | 223 | +42 |
| enums | 35 | 35 | 41 | +6 |
| object types | 105 | 108 | 136 | +28 |
| build ("in Ns") | 3 s | 2 s | 2 s | — |

Over the kernel alone (stub included): +103,726 B, +44 inputs. The packet's own measurement against the earlier kernel was +96,999 B, +42 inputs (packets/D10/11 #39); the +1,502 B difference over kernel + stub comes from the synthesis docstrings and the kernel version, inputs unchanged.

```
$ node packages/schema-workspace/dist/cli.js map --sdl C:/…/synth/module-D10/k-stub.graphql --out …/k-stub-map.md
  node types 12 | relationship fields 32 | distinct relationship types 13 | pairs after expansion 55
$ node packages/schema-workspace/dist/cli.js map --sdl C:/…/synth/module-D10/k-stub-d10.graphql --out …/k-stub-d10-map.md
  node types 15 | relationship fields 41 | distinct relationship types 17 | pairs after expansion 82   (Subjectable 5 implementers)
  D10 rows: ASSESSES 21 (8 fields, D10+K), DERIVED_FROM 8 (8 fields, D10+K), ASSOCIATES 5, BLOCKED_BY 2, HAS_ITEM 1, USES_CRITERION 1
```

D10 module counts: 3 node types; 6 relationship types declared, 4 new to the assembled schema (ASSESSES and DERIVED_FROM counted once in K, R-01/R-53); 9 relationship fields = 9 from→to pairs collapsed (R-01: HAS_ITEM 1, USES_CRITERION 1, ASSESSES 1, DERIVED_FROM 3, BLOCKED_BY 2, ASSOCIATES 1); 0 unions. Expanded marginal on this stub assembly: +27 (55 -> 82), of which the Subjectable targets grow with every implementer added later.

Cypher spot check on the disposable Neo4j (bks-neo4j-synth, 5.26):

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p … "EXPLAIN MATCH (row:ReportItem {itemKind:'ROW', disposition:'BLOCKED'})-[:BLOCKED_BY]->(uc:UseConstraint)<-[:RESOLVES_TO_CONSTRAINT]-(a:Assertion)-[:HAS_EVIDENCE]->(loc:SourceLocator) RETURN …"
  Planner: "COST"  Runtime: "SLOTTED"        (BLOCKED_BY rationale trace parses)
$ docker exec bks-neo4j-synth cypher-shell … "EXPLAIN MATCH (as:Association {associationKind:'EVIDENCE_AGGREGATE'})-[:ASSOCIATES]->(m) WHERE as.recordedTo IS NULL OPTIONAL MATCH (as)-[:DERIVED_FROM]->(i:Assertion) RETURN …"
  Planner: "COST"  Runtime: "SLOTTED"        (Association read without the Entity label parses)
```

```
$ sha256sum final/schema/D10.graphql final/_work/registers/D10.*.yaml
356dbffe86c067f2121af2e3d19bcc24a78debc291ffacfacac2c916a841b08e  final/schema/D10.graphql      (308 lines, 19,249 bytes)
321d51b3343e649fbdb1c0a77c79002affadb3546323c27807f7b239c45bb469  final/_work/registers/D10.node.yaml
3df0639293b36bd73c4b063cb39651c5c31575f39719937bb3b47426797769a9  final/_work/registers/D10.relationship.yaml
04a74d6e4b10e7449b889e3869ac94e4553c6a9798c9e6d5c094e710056a6ed6  final/_work/registers/D10.seams.yaml
```

## Open items (not in this editor's file set)

- D10 rulings that edit packet text outside the SDL and registers were not applied here: R-83 rewrite of the Q-D10-08 / Q-D10-03 guideline branches (03 line 453 still reads `RECOMMENDS_AGAINST` with a Target object), R-94 03 line ~744 (container from OCCURS_IN), R-50 answer-kind-table re-run, R-15 fixture asserters (first author -> D3 Publication), R-75 / R-20 close-oq in 11, R-47 / R-49 / R-51 text in 09.
- D10 patterns read four predicates no packet registers: FORM_OF, PREPARATION_OF, CONTAINS_INGREDIENT (Q-D10-07, Q-D10-11) and DECLARES_AMOUNT (criteria inputPredicates example). Under R-52 the executor rejects unregistered predicates; the registry builder must assign a registrar or the patterns must be renamed.
- `publisherUid` as a cache (R-46) has no `methodVersion` / `derivedAt` as R-45 condition 3 asks; no ruling adds the fields, so none were added.
- The fixture folders are referenced as `final/fixtures/D10/<folder>`; copying them there is the fixtures stage's job.

---

<!-- stage: _runlog/module-D11.md -->

# Module editor D11 (S team, 2026-10-08)

Scratch: `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/module-D11/` (`$S` below).

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-03, R-04, R-09, R-10, R-13, R-16, R-17, R-27, R-35, R-36, R-38, R-39, R-41 to R-46, R-50, R-52, R-53, R-54, R-71, R-72, R-82, R-84, R-85, R-88, R-94 read); `final/_work/rulings.yaml` (`global`, `modules.D11`, and the D5 row R-85 naming D11); `final/_runlog/module-K.md` "Kernel changes in synthesis"; `final/schema/kernel.graphql`.

```
$ sha256sum packets/D11/04-schema-proposal.graphql packets/D11/05-relationship-register.yaml packets/D11/06-node-register.yaml packets/D11/10-seams.yaml final/schema/kernel.graphql
80ada99d67ec8cf0b077f98f051455d19b361bf5137f4754ac3eb73b25d63225  packets/D11/04-schema-proposal.graphql
4f4f9734ec88a78f8734ac604580995d47666fb21cb9c937cc0dcbd5e6fff41a  packets/D11/05-relationship-register.yaml
4a8886ff18fd413f9d18f8407315c4fb21e61359769686f723e4e4843fb99ca6  packets/D11/06-node-register.yaml
7bcba2d443732405a4000936d780d6f23330e76b95c629eddfd1aaa00e4fe894  packets/D11/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
$ node scripts/packet-check.mjs D11      -> exit 0, ok true; nodeTypes 1, relationshipTypes 0, pairs 0, questions 30, fixtures 5
```

## Rulings applied

`modules.D11` in rulings.yaml has 9 rows.

| ruling | where | change |
| --- | --- | --- |
| R-17 | D11.graphql, D11.node.yaml, D11.seams.yaml | `@node(labels: ["CaptureAttempt", "Occurrence"])` (was `"Entity"`); docstring, `labels`, `archetype`, kernelTypesReferenced |
| R-41 | D11.graphql, D11.node.yaml, D11.seams.yaml | privacyClass INTERNAL by default; FAILED / PARTIAL only, not Subjectable, not a second lineage mechanism (docstring, lineage, privacy, seam note) |
| R-39 | D11.graphql (toolId docstring), D11.node.yaml, D11.seams.yaml | toolId = canonical action-space id, never an alias; populatedBy checked canonical; alias map referenced (see checks) |
| R-35 | D11.graphql (LOSSY_RENDITION docstring), D11.seams.yaml | names contentHashBasis TOOL_RENDITION; projection registry belongs in the action space (see issues) |
| R-82 | D11.relationship.yaml, D11.seams.yaml | predicateOnly FUNDED_BY, DISCLOSES_SUPPORT_FROM, DECLARES_NO_COMPETING_INTEREST removed; predicateSeams FUNDED_BY (D3), DISCLOSES_INTEREST (D9) added |
| R-52 | D11.relationship.yaml | names already SCREAMING_SNAKE (adversarial review); `registrar` added to each remaining predicateOnly entry |
| R-50 | D11.seams.yaml | WAS_GENERATED_BY Report -> Activity note: Q-D11-22 materialized by a PROJECTION Activity; Report{PROFILE} only when BellLabs publishes coverage |
| R-44 | D11.seams.yaml | REVISES note (SourceRevisionKind); added RENDITION_OF K.Source -> D3.Publication and predicate seam HAS_REVISION_STATUS (Q-D11-04/05 read both branches). Fixture edit (resveratrol) is the fixtures stage's |
| R-42 | D11.node.yaml | Identifier.registrationStatus declined: recorded as a deferred row (the 11-OQ close is the open-questions stage's) |

Global / other rulings that touch D11 text: R-03 (node `mutations` = `{ graphql: none, executor }`), R-10 (HAS_REGISTRATION_VERSION, HAS_LABEL_VERSION notes), R-72 (CONCERNS union), R-84/R-85/R-88 (predicate seams; targets consumer list), R-16 (FIELD_NOT_REPORTED note), R-27/R-38 (MENTIONS, COVERS_LOCATOR notes; ANNOTATED_BY deferred reason), R-09 (Mention cut; vocabulary paths -> final/vocabularies/), R-43/R-42 (RENDITION_OF_RECORD and SAME_AS deferred reasons), R-46 (uid pointers), R-28 (ATTEMPTED_FOR), R-04 (dependsOn indexes are deployment DDL), R-60 (pins), R-54 (D11.quantity-basis subkind), R-94 (seam/predicateSeam split; rows re-checked against final SDLs).

## Commands

```
$ cp packets/D11/04-schema-proposal.graphql final/schema/D11.graphql      # then 6 Edit-tool edits; banner `# ---- fragment D11 ----` stays on line 1
$ wc -c -l packets/D11/04-schema-proposal.graphql final/schema/D11.graphql
  120 8368 packets/D11/04-schema-proposal.graphql
  126 9176 final/schema/D11.graphql                                       # +6 lines, +808 B (docstrings + banner)
```

Registers were written by hand from 05, 06 and 10 (Write tool), every entry with `module: D11`; fixture path `final/fixtures/D11/capture-failures-coverage`.

Final SDL declarations of every seam type (graphql@16 parse of `final/schema/*.graphql`, script `$S/rels.cjs`):

```
$ node $S/rels.cjs REPORTS_ON REVISES HAS_REGISTRATION_VERSION HAS_ARM HAS_COMPONENT ADMINISTERS HAS_STUDY_ROLE REALIZES_SUBSTANCE HAS_ACTIVE_MOIETY HAS_LABEL_VERSION DECLARES_COMPONENT STATUS_OF STATUS_FROM CONCERNS LOT_OF CHUNK_OF COVERS_LOCATOR MENTIONS RENDITION_OF OCCURRENCE_OF
ADMINISTERS  D3 InterventionComponent.administers OUT -> AdministeredMaterial  AssertedRecordedProperties [CONNECT]
CHUNK_OF     D9 Chunk.snapshot OUT -> SourceSnapshot  StructuralEdgeProperties
CONCERNS     D8 RegulatoryRecord.concerns OUT -> RegulatoryRecordTopic  AssertedRecordedProperties
COVERS_LOCATOR D9 Chunk.locators OUT -> SourceLocator  DerivedEdgeProperties []
DECLARES_COMPONENT D6 LabelVersion.components OUT -> DeclaredComponentTarget  ComponentLineProperties
HAS_ACTIVE_MOIETY D1 ChemicalSubstance.activeMoieties OUT -> ChemicalSubstance  AssertedRecordedProperties
HAS_ARM / HAS_COMPONENT D3 StructuralEdgeProperties [CREATE, CONNECT]
HAS_LABEL_VERSION D6 Package.labelVersions OUT -> LabelVersion  AssertedEdgeProperties
HAS_REGISTRATION_VERSION D3 Study.registrationVersions OUT -> RegistrationVersion  AssertedEdgeProperties
HAS_STUDY_ROLE D3 Study.roles OUT -> StudyParty  StudyRoleEdgeProperties
LOT_OF       D8 Lot.lotOf OUT -> LotOfTarget  AssertedRecordedProperties
MENTIONS     D9 Chunk.mentions OUT -> Subjectable  DerivedEdgeProperties []
REALIZES_SUBSTANCE D1 IngredientMaterial.substances OUT -> ChemicalSubstance  AssertedRecordedProperties
RENDITION_OF D3 Publication.renditions IN -> Source ; D9 MediaWork.renditions IN -> Source  AssertedRecordedProperties
REPORTS_ON   D3 Publication.reportsOn OUT -> Study  AssertedRecordedProperties
REVISES      D3 Publication.revises OUT -> Publication  RevisionEdgeProperties (revisionKind: SourceRevisionKind!)
STATUS_FROM  D8 LegalStatus.establishedBy OUT -> RegulatoryRecord ; STATUS_OF D8 LegalStatus.statusOf OUT -> LegalStatusSubject AssertedEdgeProperties
union AdministeredMaterial = IngredientMaterial | ProductVariant | Intervention | FoodItem | DietaryPattern
union StudyParty = Organization | Person | Award
union DeclaredComponentTarget = IngredientMaterial | Constituent | FoodItem
union RegulatoryRecordTopic = ChemicalSubstance | IngredientMaterial | Product | Lot
union LegalStatusSubject = ChemicalSubstance | IngredientMaterial | Product | Patent
union LotOfTarget = Product | ProductVariant
```

(These are the other module editors' files as they stood when read; their own runlogs are authoritative.)

Action-space aliases (R-39), parsed with yaml@2 (PyYAML 1.1 fails on line 2931, a `?updated=` inside a flow sequence):

```
$ grep -c "^  - id: <id>$" tooling/action-space.yaml   # for each of the 10 node populatedBy ids + ncbi-eutils-pubmed -> 1 each
$ node -e "...yaml.parse(action-space.yaml)..."
entries 167 aliases 402 unresolved 0
D11 aliases whose canonical id differs from the local id: []
```

Register validation (`$S/check.cjs`: yaml@2 + graphql@16 over the final files):

```
node { nodes: 1, deferred: 9, mergedInto: 3 }
rel { relationships: 0, predicateOnly: 2, deferred: 9 }
seams { seams: 24, predicateSeams: 6, shared: 8, status: { accepted: 26, added: 4 } }
node missing []                                     # contract fields present
SDL object types [ 'CaptureAttempt' ] enums [ 'CaptureOutcome', 'CaptureFailureKind' ]
@node(labels: ["CaptureAttempt", "Occurrence"])
own props 14 = filter 5 + other 9 true
filterProps missing in SDL []
relationship fields 0
predicateOnly colliding with rel types []           # R-53, over every final/schema/*.graphql
seam types not declared in final SDL []
```

## Compile check

D11 declares no relationship field and references only kernel types (Entity, PrivacyClass), so no seam stubs were needed: the compile input is `kernel.graphql` + `D11.graphql`.

```
$ cat final/schema/kernel.graphql final/schema/D11.graphql > $S/compile.graphql ; cp final/schema/kernel.graphql $S/kernel-only.graphql
$ wc -c -l  -> compile.graphql 1316 lines 65216 B ; kernel-only.graphql 1190 lines 56040 B
$ BKS_SCHEMA_PATH=$S/compile.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema $S/compile.printed.graphql
wrote ...\module-D11\compile.printed.graphql (340949 chars) in 3s          # wall 39.7 s (pnpm + tsx startup)
$ BKS_SCHEMA_PATH=$S/kernel-only.graphql ... print-schema $S/kernel.printed.graphql
wrote ...\module-D11\kernel.printed.graphql (326571 chars) in 2s          # wall 19.0 s
```

The printer log does not name the SDL. Source confirmed: output is 0.34 MB (not the ~55 MB pinned fallback), and it contains the docstring text "never :Entity (R-17)" that exists only in `final/schema/D11.graphql`; `enum EntityImplementation` lists CaptureAttempt.

| measure | kernel alone | kernel + D11 | D11 marginal |
| --- | ---: | ---: | ---: |
| printed bytes | 326,595 | 340,973 | **+14,378** |
| printed lines | 6,498 | 6,779 | +281 |
| input types (`grep -c '^input '`) | 179 | 183 | **+4** |
| enums | 35 | 37 | +2 |
| object types | 105 | 108 | +3 |
| build (printer's own "in Ns") | 2 s | 3 s | |

Type diff (kernel vs kernel + D11): enums CaptureFailureKind, CaptureOutcome; inputs CaptureAttemptSort, CaptureAttemptWhere, CaptureFailureKindEnumScalarFilters, CaptureOutcomeEnumScalarFilters; types CaptureAttempt, CaptureAttemptEdge, CaptureAttemptsConnection. The packet reported +14,028 B / +4 inputs against A1's kernel; the +350 B difference is the synthesis docstrings.

```
$ node scripts/schema-size.mjs $S/compile.printed.graphql
printed size 0.3 MB | printed lines 6,780 | input types 183 | object types 108 | enums 37 | Query fields 28 | Mutation fields 0
(its SDL rows 192 / 3940 describe the pinned default SDL, not this file)
$ node packages/schema-workspace/dist/cli.js map --sdl $S/compile.graphql --out $S/compile-map.md
schemaDigest sha256:667728bebb61e5a8d069f5242238bf228fee173de10278a0b7bdc5618293f1e8
node types 12 | relationship fields 32 | distinct relationship types 13 | from→to pairs after expansion 48   # kernel alone: 11 / 32 / 13 / 47
```

D11 module counts: 1 node type, 0 relationship types, 0 pairs (collapsed, R-01). Expanded: +1 (kernel WAS_GENERATED_BY Activity.generated -> Entity gains the CaptureAttempt implementer; counted once in K under R-01).

Cypher check on the disposable Neo4j 5.26 (Q-D11-17 with the final labels):

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "EXPLAIN CYPHER 25 MATCH ..."
25 is not a valid option for cypher version. Valid options are: 5          # 5.26 has no CYPHER 25 prefix
$ docker exec bks-neo4j-synth cypher-shell ... --format plain "EXPLAIN MATCH (act:Activity {missionId: 'm'})<-[:WAS_GENERATED_BY]-(c:CaptureAttempt:Occurrence) RETURN act.runId, c.toolId, c.outcome, c.failureKind ORDER BY act.runId, c.attemptedAt"
Planner "COST", Runtime "SLOTTED" ; exit 0
```

## Outputs

```
$ wc -c -l ; sha256sum
  126  9176  ec9a90a90a15bb7cea1390504fdaf1df115a32a0312bd51238a28f1fea286ee6  final/schema/D11.graphql
   81  9207  c9d0a7a58d2bc94b5c5da563cbf5846688c606526de99f47053c627da007d239  final/_work/registers/D11.node.yaml
   81  7088  7c7df51962768655bffa428d58dbd33e6b77ca7664c6941fbe17da6feeffb93b  final/_work/registers/D11.relationship.yaml
  110 18593  8b5ae2c0144b68793c21bb30efbd8b2f122b0e5fc1f19c4a922d88ec6dce9bce  final/_work/registers/D11.seams.yaml
```

## Issues for other stages

1. CQ-PV-05 (packets/D11/03) joins two Sources through one shared Identifier node, which R-42 forbids; the join must go through the record both describe (e.g. the D3 Study with the NCT). Flagged in the RENDITION_OF_RECORD deferred row; query-patterns stage.
2. Registrar of PROSPECTIVE_REGISTRATION_FLAG (subject D3.Study: R-52 rule 3 gives D3) and RECORD_LAST_UPDATED (subject K Source; not in K's closed convention list) left as D11 (only existing registrar); predicates.yaml stage decides.
3. R-35 / R-39 text: the projection registry (h2t-v1, xml-textcontent/v1, canonical-json, EDGAR tag strip) is not yet in `tooling/action-space.yaml` (generated file; its generator lives in packets/D11/_notes). The 402-alias map already exists there (0 unresolved).
4. Assessment subkind D11.quantity-basis (APPLICABILITY) must be in final/vocabularies/assessment-vocabularies.yaml (R-54).
5. Packet patterns use the `CYPHER 25` prefix, which Neo4j 5.26 rejects.
6. Text edits to packets/D11 09, 03, 11 (R-17, R-39, R-41, R-42 close, R-50 Q-D11-22) and the resveratrol fixture (R-44) belong to the query-patterns, open-questions and fixtures stages.

---

<!-- stage: _runlog/module-D12.md -->

# Module D12 — module editor run log (S team, 2026-10-08/09)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01 to R-06, R-09, R-10, R-14, R-17, R-28, R-42 to R-46, R-50 to R-64, R-72, R-73, R-85, R-87, R-93, R-94 read); `final/_work/rulings.yaml` (`global`, `modules.D12`, and every other module's row naming a D12 type or a D12 seam target: D1, D3, D5, D6, D8, D10).
- `final/schema/kernel.graphql` (sha256 ec981e2a…), the kernel editor's notes (`_runlog/module-K.md`), `final/_work/registers/K.*.yaml` (format).
- `scratchpad/inv/review-open-issues.json` (D12 open list), `scratchpad/inv/inventory-final.md` (D12 rows).

```
$ git rev-parse --short HEAD; git branch --show-current
e484fd2
ft/schema-S
$ sha256sum packets/D12/04-schema-proposal.graphql packets/D12/05-relationship-register.yaml packets/D12/06-node-register.yaml packets/D12/10-seams.yaml final/schema/kernel.graphql
3c302e083c7867ae7b26fc76b4daabb332bccbccb1d664db21f52e1c677469d3  packets/D12/04-schema-proposal.graphql
35779635fc4b106cf9e090247d189d3add26d4c3e1c135e7c349bcb81548d4a5  packets/D12/05-relationship-register.yaml
034af8dfff49b092c1e902d28a8f1668615d005c9ed6a59ee5df397454858efa  packets/D12/06-node-register.yaml
285c0a45246244806a03c5df231202d5fcbe99bde229c3bca69cbad626f37f4a  packets/D12/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
```

## Rulings that touch D12, and what each changed

`modules.D12` in rulings.yaml has 11 rows. None changes a type, field, union, enum or relationship of the D12 SDL; the SDL edits are docstrings only.

| ruling | file | change |
| --- | --- | --- |
| R-63 | SDL, node reg, seams | DietaryPattern docstring: the only node for any eating pattern (TRE, fasting-mimicking included), administered by D3 as a DietaryPattern, admissible STEP_USES target; OQ-D12-03 closed |
| R-46 | SDL, node reg, rel reg (deferred DEFINED_BY) | definedBySourceUid = frozen identity key; the defined-by trace is the attach Assertion's HAS_EVIDENCE |
| R-62 | SDL (referencedByProducts), rel reg, node reg (deferred), seams | HAS_REFERENCE_FOOD licensed by a RESOLUTION Assessment when a resolver chose it; only link, never a merge; HAS_RECIPE_INGREDIENT subject FoodItem \| D6.Product, alias PREPARED_WITH |
| R-57 | SDL (FoodContentProperties docstring), rel reg qualifierGrammar | `comparator:` values are D1 QuantityComparator values (GTE/LTE, not GE/LE) |
| R-58 | SDL (amountBasis docstring), rel reg | AmountBasis is D6's single enum (D12 still writes PER_100G, PER_100ML, PER_SERVING) |
| R-52 | rel reg, seams | `registrar: D12` on the 11 D12 predicates; target predicates + CAUSES_ADVERSE_EFFECT moved to `removedRegistrations` (registrar D5) and to `predicateSeams` |
| R-85 | seams | FoodCategory admitted as subject of target predicates and INTERACTS_WITH; FoodItem/FoodCategory of CAUSES_ADVERSE_EFFECT (OQ-D12-28 closed) |
| R-53 | rel reg, seams | FOOD_FROM_TAXON alias DERIVED_FROM_TAXON; RESULT_FOR → QUALITY_RESULT_FOR |
| R-51 | rel reg (IN_FOOD_CATEGORY rationale, deferred COMPUTED_FOOD_CATEGORY) | CALCULATED Assertion authorizes IN_FOOD_CATEGORY; patterns return basisKind + derivationRule |
| R-64 | rel reg (FOOD_CONTAINS rationale, deferred QUANTITATIVELY_CONTAINS) | two types kept; canonical read `[:MATERIAL_CONTAINS\|FOOD_CONTAINS]` |
| R-03 | node reg | `mutations: { graphql: none, executor: "create; update; never delete" }` |
| R-42 | node reg | "(requested)" markers dropped on the seven D12 food schemes (K adds them) |
| R-72 | seams, rel reg (deferred ADMINISTERS_PATTERN) | AdministeredMaterial = IngredientMaterial \| ProductVariant \| Intervention \| FoodItem \| DietaryPattern; RegulatoryRecordTopic includes Product \| Lot |
| R-73 | seams | QUALITY_RESULT_FOR → D8.Lot accepted; → D6.Product **cut (contested, see Issues)**; MEASURED_CONTENT_IN_PRODUCT (D1) predicate seam added |
| R-87 | seams | DECLARES_COMPONENT: one Assertion per line (OQ-D12-32 closed) |
| R-93 | seams | HAS_ACTION_LEVEL / HAS_CLAIM_CONDITION (registrar D8) (OQ-D12-31 closed) |
| R-43, R-44 | seams | added RENDITION_OF Source → D3.Publication and REVISES Publication → Publication rows; HAS_REVISION_STATUS (registrar K) only for flags with no identified notice |
| R-94 | seams | `seams` / `predicateSeams` split; StepMeans note dropped (STEP_USES → K.Subjectable incl. DietaryPattern, FoodCategory); ASSOCIATES → FoodItem row recorded as cut |
| R-60 | seams | targets @0.2.2, frontiers @0.2.1, files under final/vocabularies/ |
| R-06 | rel reg (fixture comments) | every typed pair is fixtured: 8 of 8 (checked below) |

Not done here (other deliverables): R-44 fixture edit (PREDIMED → REVISES), R-93 / R-51 pattern edits (Q-D12-06, Q-D12-18, Q-D12-14), R-50 question kind (Q-D12-08), OQ closures in 11-open-questions.

## Commands

```
$ cp packets/D12/04-schema-proposal.graphql final/schema/D12.graphql      # banner '# ---- fragment D12 ----' kept on line 1
  (docstring edits with the Edit tool, table above)
$ grep -n "OQ-D12\|RESULT_FOR\|StepMeans\|DERIVED_FROM_TAXON\|PREPARED_WITH\|Mention\|StateEpisode\|@fulltext\|@vector" final/schema/D12.graphql
189: ... FOOD_FROM_TAXON (predicate-only; renamed from DERIVED_FROM_TAXON, which is a D1 edge type)   # history note, kept
266: ... (R-63; OQ-D12-03 closed) ...
```

Name checks (R-53, R-56):

```
$ grep -ho 'type: "[A-Z_]*"' packets/*/04-schema-proposal.graphql final/schema/*.graphql | sort -u   -> 106 relationship type names
  none of the 11 D12 predicateOnly names is a relationship type name                                  -> "checked" (0 collisions)
$ grep -l FOOD_CONTAINS|IN_FOOD_CATEGORY|HAS_REFERENCE_FOOD|PATTERN_COMPONENT packets/*/04 final/schema/*  -> D12 only
$ for each of the 12 D12 type/enum/union names: grep -lE "^(type|enum|union|interface) <name>\b"     -> D12 only (packet + final)
```

Fixture coverage of typed pairs (R-06), from `packets/D12/07-fixtures/*/assertions.yaml` subject/object types:

| pair | fixture assertion |
| --- | --- |
| FoodItem -FOOD_CONTAINS-> D1.Constituent | mcd-02, mcd-03, mcd-04 |
| FoodItem -FOOD_CONTAINS-> D1.ChemicalSubstance | olive-01, olive-02 |
| FoodItem -IN_FOOD_CATEGORY-> FoodCategory | mcd-06 |
| D6.Product -IN_FOOD_CATEGORY-> FoodCategory | mcd-08, acr-02 |
| D6.Product -HAS_REFERENCE_FOOD-> FoodItem | mcd-01 |
| DietaryPattern -PATTERN_COMPONENT-> FoodItem | pred-01, pred-02 |
| DietaryPattern -PATTERN_COMPONENT-> D1.Constituent | pred-03 |
| DietaryPattern -PATTERN_COMPONENT-> FoodCategory | upf-03, upf-04 |

Registers (Python string-replace scripts in `scratchpad/synth/module-D12/build_rel.py` and `build_node.py`; each replace asserted to match exactly once; seams written by hand):

```
$ python build_rel.py  final/_work/registers/D12.relationship.yaml   -> ok 25014
$ python build_node.py final/_work/registers/D12.node.yaml           -> ok 9581
$ python -c "yaml.safe_load(...)"
D12.relationship.yaml {'version': 1, 'module': 'D12', 'relationships': 4, 'predicateOnly': 11, 'removedRegistrations': 6, 'deferred': 12}
  contract fields missing per relationship: FOOD_CONTAINS [], IN_FOOD_CATEGORY [], HAS_REFERENCE_FOOD [], PATTERN_COMPONENT []
  every predicateOnly entry has registrar: True
D12.node.yaml {'version': 1, 'module': 'D12', 'nodes': 3, 'deferred': 8, 'mergedInto': 6}
  contract fields missing per node: FoodItem [], FoodCategory [], DietaryPattern []
D12.seams.yaml {'seams': 21, 'predicateSeams': 13, 'sharedVocabularies': 9}
  seams accepted 19, cut 2 (QUALITY_RESULT_FOR -> D6.Product R-73 contested; ASSOCIATES -> FoodItem R-94); predicateSeams accepted 13
```

## Compile check

Scratch stubs only (`scratchpad/synth/module-D12/stubs-D12.graphql`, 65 lines): D1 ChemicalSubstance, D1 Constituent, D6 Product (7 Entity fields, Entity & Subjectable, no relationships), enums D1 ContentStatementKind (packet D1 values) and D6 AmountBasis (16 values, R-58).

```
$ cat final/schema/kernel.graphql stubs-D12.graphql                  > K+stubs.graphql       # 57,595 B
$ cat final/schema/kernel.graphql stubs-D12.graphql final/schema/D12.graphql > K+stubs+D12.graphql  # 75,933 B
$ BKS_SCHEMA_PATH=C:/.../synth/module-D12/<name>.graphql NODE_OPTIONS=--max-old-space-size=8192 \
    pnpm --filter @bks/graphql-api print-schema C:/.../synth/module-D12/<name>.printed.graphql
kernel        : wrote ... (326571 chars) in 2s   wall 12 s
K+stubs       : wrote ... (341900 chars) in 3s   wall 60 s
K+stubs+D12   : wrote ... (424366 chars) in 1s   wall 63 s   (final; first run 2s / 19 s)
K+stubs+D12packet (packet SDL, for comparison): wrote ... (423860 chars) in 2s
```

The wall times include pnpm/tsx start-up while other S agents run print-schema in parallel; the build itself reports 1–3 s. The output is 0.4 MB, not the ~55 MB pinned fallback, and contains the string "R-63; OQ-D12-03 closed", which exists only in `final/schema/D12.graphql`.

```
$ wc -c / wc -l / grep -c '^input ' / '^enum ' / '^type ' / '^union ' / '^type Mutation'
kernel             326,595 B  6,498 lines  179 inputs  35 enums  105 types  0 unions  0 Mutation
K+stubs            341,924 B  6,753 lines  185 inputs  35 enums  114 types  0 unions  0 Mutation
K+stubs+D12        424,398 B  8,332 lines  231 inputs  43 enums  136 types  2 unions  0 Mutation
K+stubs+D12packet  423,892 B  8,329 lines  231 inputs  43 enums  136 types
$ node scripts/schema-size.mjs .../K+stubs+D12.printed.graphql
printed size 0.4 MB | printed lines 8,333 | input types 231 | object types 136 | enums 43 | Query fields 40 | Mutation fields 0
(its "SDL node types 192 / pairs 3940" rows describe the pinned default SDL, not this file)
```

(The two stub enums do not print in K+stubs because nothing references them there; that is why K+stubs shows 35 enums.)

| measure | kernel alone | K + stubs | K + stubs + D12 | D12 marginal over K + stubs | over kernel alone |
| --- | ---: | ---: | ---: | ---: | ---: |
| printed bytes | 326,595 | 341,924 | 424,398 | +82,474 | +97,803 |
| printed lines | 6,498 | 6,753 | 8,332 | +1,579 | +1,834 |
| input types | 179 | 185 | 231 | +46 | +52 |
| enums | 35 | 35 | 43 | +8 | +8 |
| object types | 105 | 114 | 136 | +22 | +31 |

Final vs packet D12 (same kernel + stubs): +506 printed bytes, +3 lines, 0 inputs (docstrings only). The FoodContentProperties docstring edit (R-57) does not print.

Schema map (pairs):

```
$ node packages/schema-workspace/dist/cli.js map --sdl .../K+stubs.graphql     --out .../K+stubs-map.md
node types 14 | relationship fields 32 | distinct relationship types 13 | pairs after expansion 71
$ node packages/schema-workspace/dist/cli.js map --sdl .../K+stubs+D12.graphql --out .../K+stubs+D12-map.md
node types 17 | relationship fields 37 | distinct relationship types 17 | pairs after expansion 103
D12 rows: PATTERN_COMPONENT 3 (PatternComponentTarget ∪3) | FOOD_CONTAINS 2 (FoodComponentTarget ∪2) | IN_FOOD_CATEGORY 2 | HAS_REFERENCE_FOOD 1
```

D12 own: 3 node types, 4 relationship types, 5 relationship fields, 8 from→to pairs (collapsed = expanded; no interface target), widest union 3. The other +24 expanded pairs are kernel edges to Subjectable/Entity gaining 3 implementers (counted in K under R-01 collapsed).

Cypher validation on the disposable Neo4j (container bks-neo4j-synth):

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** "EXPLAIN MATCH (f:FoodItem)-[r:MATERIAL_CONTAINS|FOOD_CONTAINS]->(c) WHERE r.recordedTo IS NULL AND r.amountBasis = 'PER_100G' AND r.quantity >= 0.5 MATCH (a:Assertion {uid: r.assertionUid}) OPTIONAL MATCH (p:Product)-[h:HAS_REFERENCE_FOOD]->(f) RETURN ..."
Plan: "EXPLAIN" | Statement: "READ_ONLY" | Planner: "COST"   (exit 0)
```

Digests of the outputs:

```
f7c6b4107e27f4db9f787db9de971e344522da674b6f1631e7c6132483fec4c0  final/schema/D12.graphql (309 lines, 18,338 B)
bf4e027d8ef1ad4c89e3d648983fd03038ce5707e201ea8cbc99294ce4710c77  final/_work/registers/D12.node.yaml
7c6e6b6394631a8298cd62c31488da33ebeb380333ff384cc633f1d8a8f4edea  final/_work/registers/D12.relationship.yaml
698d74005d7538db14670e9af377482e661b591e40827d5bfdcfd3c52c9489af  final/_work/registers/D12.seams.yaml
```

## Issues for the chief synthesizer

1. **R-73 conflicts with a D12 fixture.** R-73 cuts QUALITY_RESULT_FOR → D6.Product on the premise that no fixture writes it, citing D8 fixtures only. D12 `acrylamide-fried-potato-harm` acr-03 writes QualityResult → Product (FDA 2004 survey, 428 ug/kg, "one individual purchased product; no lot") for Q-D12-03 and Q-D12-06, both value 1. The seam row is marked "cut (R-73) — contested". Either re-key acr-03 to the D1 predicate MEASURED_CONTENT_IN_PRODUCT (R-73's fallback), or keep the Product member under R-06 and R-73's own clause "until a survey fixture promotes the Product member".
2. **Qualifier key `comparator` has two meanings.** The 05 grammar defines it as a comparison operator, but the predimed and upf fixtures write `comparator:hu:...` (a comparator-arm uid) on target-effect Assertions. Fixture or grammar editors should rename one of them (e.g. `comparatorArm:`).
3. USED_FOOD_CLASSIFICATION / USED_COMPOSITION_DATABASE keep registrar D12 (no ruling moves them), but R-52 rule 3 (owner of the subject type, D3.Study) would name D3 (OQ-D12-27).

---

<!-- stage: _runlog/module-D13.md -->

# Module D13 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-01–R-07, R-44, R-65, R-66, R-69, R-81, R-91, R-92, R-94 read in full; the other D13 mentions located by `grep -n D13`), `final/_work/rulings.yaml` (`global`, `modules.D13`), `final/schema/kernel.graphql`, `final/_runlog/module-K.md` (kernel changes 1–10), packets/D13 04, 05, 06, 09 (compile check), 10, and `scratchpad/inv/review-open-issues.json` (D13).

```
$ git rev-parse --short HEAD
e484fd2
$ sha256sum packets/D13/04-schema-proposal.graphql packets/D13/05-relationship-register.yaml packets/D13/06-node-register.yaml packets/D13/10-seams.yaml final/schema/kernel.graphql
e40285b99b2813402f19f65e20b02cb18e817500e7d21face846d0158fc9a479  packets/D13/04-schema-proposal.graphql
0c7095d74b813059e06f25a5c31a28e97dda084bdb3f67b02d8394f73891ba8e  packets/D13/05-relationship-register.yaml
d211c2036d16f99851871af3fa95c89ee06deedf287fb372389d16a4b3c4446c  packets/D13/06-node-register.yaml
c7e7adbd5885dc08ca178c89c78e03b050569b08e5f7fe1c4931c5b0bb67bba4  packets/D13/10-seams.yaml
ec981e2aab04fb598bb3076b1ed7c0ddca57dd45018afd5dfbff797060424c71  final/schema/kernel.graphql
$ grep -n "D13" final/_work/rulings.yaml        # modules.D13 = 20 rows (R-44 x4, R-66 x3, R-69 x2, R-92 x2, R-52, R-21 x2, R-22, R-25, R-35, R-94, R-60, R-65)
$ grep -rn "INVOLVES" -A12 packets/D13/07-fixtures/*/assertions.yaml | grep "Person\|role"
  -> only lesne-2006-retraction writes INVOLVES to D7.Person (roles AUTHOR); PUBLISHER row is to an Organization
$ grep -n "RegulatoryPathway" -A40 packets/D8/04-schema-proposal.graphql   # 33 values, copied into the scratch stub
```

## SDL: `final/schema/D13.graphql`

```
$ cp packets/D13/04-schema-proposal.graphql final/schema/D13.graphql
```

Edits with the Edit tool; banner `# ---- fragment D13 ----` stays on line 1, followed by a six-line synthesis note.

| ruling | SDL edit |
| --- | --- |
| R-44 | `EventKind.PUBLICATION` removed; `RETRACTION` gets a value docstring (curated frontier milestone only, EVENT_ABOUT → D3 Publication, clock cites the notice locator, no second date Assertion) |
| R-44 | `EventRole.AUTHOR` and `EventRole.PUBLISHER` removed; `Event.involvedPeople` docstring drops "authors of a retracted paper" and the CQ-EV-05 question (authors via D3 AUTHORED_BY) |
| R-66 | `enum ApprovalPathway` and `enum DesignationType` removed; `Event.approvalPathway` and `Event.designationType` retyped to D8 `RegulatoryPathway`, docstrings carry the OQ-D8-02 mapping |
| R-66 | `EventRole.APPLICANT`, `REGULATOR`, `ISSUER` docstrings: only without DOCUMENTED_BY_RECORD, executor-enforced; Event docstring: one record + at most one Event, no re-asserted D3/D8 date, process chains from the D8 application identifier |

Unchanged on purpose: the 23 L3 directives (`@filterable(byValue: false …) @sortable(byValue: false)`) the packet already carried. R-02 makes L3 an owner lever and not a program default, but no ruling asks D13 to remove them (see issues).

```
$ grep -n "ApprovalPathway\|DesignationType\|PUBLICATION\|\bAUTHOR\b\|PUBLISHER\|SPEAKS_AT\|StateEpisode\|HAS_REVISION_STATUS\|NORMALIZED_TEXT" final/schema/D13.graphql
  -> only the synthesis note (lines 3-5), the RETRACTION docstring (line 48) and the pinned-merge history in the EventRole docstring (line 110)
$ grep -c "^enum " final/schema/D13.graphql            -> 8   (packet: 10)
$ awk '/^enum EventKind/,/^}/' … | grep -c value       -> 26  (packet: 27)
$ awk '/^enum EventRole/,/^}/' … | grep -c value       -> 14  (packet: 16)
$ wc -c -l final/schema/D13.graphql                    -> 367 lines, 27,203 bytes (packet: 25,812 bytes)
$ sha256sum final/schema/D13.graphql                   -> 24f8f6853a6b74e72569f9a7b6bc60abe2a58a16b337cac1928ab26aa7ae0508
```

## Compile check

Scratch (`scratchpad/synth/module-D13/`): `stubs.graphql` (1,964 bytes) = D7 `Organization`, D7 `Person`, D3 `Study`, D8 `RegulatoryRecord` (each `Entity & Subjectable`, the seven Entity fields only, `@query(aggregate:false) @mutation(operations:[])`) + D8 `enum RegulatoryPathway` (33 values copied from packets/D8). `kernel+stubs.graphql` = kernel.graphql + stubs; `compile.graphql` = kernel+stubs + final D13; `compile-packet.graphql` = kernel+stubs + packets/D13 04 (for the delta).

```
$ for n in kernel+stubs compile compile-packet; do
    BKS_SCHEMA_PATH=C:/…/scratchpad/synth/module-D13/$n.graphql NODE_OPTIONS=--max-old-space-size=8192 \
      pnpm --filter @bks/graphql-api print-schema C:/…/scratchpad/synth/module-D13/$n.printed.graphql; done
wrote …\kernel+stubs.printed.graphql (346841 chars) in 3s      exit 0, wall 46 s (first run, tsx warm-up)
wrote …\compile.printed.graphql (423117 chars) in 2s           exit 0, wall 20 s
wrote …\compile-packet.printed.graphql (421943 chars) in 2s    exit 0, wall 12 s
$ BKS_SCHEMA_PATH=C:/…/final/schema/kernel.graphql … print-schema C:/…/module-D13/kernel.printed.graphql
wrote …\kernel.printed.graphql (326571 chars) in 1s            exit 0
```

No errors or warnings. Source confirmation (the printer does not name its SDL): every output is 0.33–0.42 MB, not the ~55 MB pinned fallback, and `compile.printed.graphql` contains the final-only edits:

```
$ grep -c "RegulatoryPathway" compile.printed.graphql                       -> 13
$ grep -c "A curated frontier milestone only" compile.printed.graphql       -> 1
$ grep -c "ApprovalPathway\|DesignationType" compile.printed.graphql        -> 0
$ awk '/^enum EventRole/,…' | grep -c "AUTHOR\|PUBLISHER"                   -> 0
$ grep -n "approvalPathway" compile.printed.graphql                         -> approvalPathway: RegulatoryPathway; RegulatoryPathwayEnumScalarFilters
$ grep -c "^type Mutation" compile.printed.graphql                          -> 0
```

| build | bytes | lines | `^input` | `^enum` | `^type` |
| --- | ---: | ---: | ---: | ---: | ---: |
| kernel alone | 326,595 | 6,498 | 179 | 35 | — |
| kernel + 4 stubs (+ unused RegulatoryPathway) | 346,865 | 6,838 | 187 | 35 | 117 |
| kernel + stubs + **final D13** | **423,189** | **8,409** | **231** | 44 | 139 |
| kernel + stubs + packet D13 | 421,999 | 8,407 | 232 | 45 | 139 |

(`wc -c`, `wc -l`, `grep -c '^input '`, `grep -c '^enum '`, `grep -c '^type '` on each printed file.)

- **Marginal cost of final D13 over kernel + stubs: +76,324 bytes, +1,571 lines, +44 input types.**
- Over the kernel alone (stubs included in the delta): +96,594 bytes, +1,911 lines, +52 input types.
- Final vs packet D13 on the same kernel + stubs: +1,190 bytes (docstrings for R-44/R-66), −1 input type and −1 enum (two D13 enum filter inputs replaced by one `RegulatoryPathwayEnumScalarFilters`; in the assembled schema D8 pays for that input).

## Registers

- `D13.relationship.yaml`: written by hand from 05. Edits: R-22 (`projectionGate: SUPPORT` on LEADS_TO, RESPONDS_TO; packet text kept as `projectionGateNote`), R-25 (`basisKind: CURATOR_CLASSIFICATION` on ON_FRONTIER), R-44 (INVOLVES: CQ-EV-05 dropped from the Event → Person pair, lesne removed from otherFixtures, `pairFixtures` records that Event → Person has no fixture left), R-66 and R-69 (INVOLVES and DOCUMENTED_BY_RECORD rationale; LEADS_TO rationale), R-92 (FINANCING_AMOUNT + ROUND_TOTAL / REMAINING; DATE_OF_FIRST_SALE, INVESTOR_COUNT added), R-52 (HAS_REVISION_STATUS and RECORDING_OF predicateOnly rows removed), R-07 (`demotionCandidate` on DOCUMENTED_BY_RECORD). Fixtures rewritten to `final/fixtures/D13/<folder>`.
- `D13.node.yaml`: built from 06 by a Python string-replace script (stdin); each replace asserted to match exactly once. Edits: `module: D13`; R-03 `mutations: { graphql: none, executor: … }`; R-66 note on approvalPathway / designationType; R-69 FinancingRound note; R-65 Conference note; EventKind count note (27 → 26, R-44).
- `D13.seams.yaml`: written by hand from 10. `seams` (10) and `predicateSeams` (11) split per R-94; every row `status: accepted` with its ruling (none cut). Added rows: REVISES D3.Publication → D3.Publication (R-44), predicate seams EVENT_ABOUT → D7.Award (R-69), DATE_OF_FIRST_SALE, INVESTOR_COUNT (R-92), AUTHORED_BY (R-44/R-80), HAS_REVISION_STATUS (R-44/R-52/R-21); sharedVocabularies refs point at final/ (R-09), targets @0.2.2 (R-60), new `regulatory-pathways` (consumed from D8, R-66).

```
$ python - <<'EOF' … (D13.node.yaml build) … EOF
ok 4                       # occurrences of "module: D13"
$ python (yaml.safe_load + regex over final/schema/D13.graphql)
node {'nodes': 2, 'deferred': 9, 'mergedInto': 15}
rel {'relationships': 5, 'predicateOnly': 17, 'deferred': 25}
seams {'seams': 10, 'predicateSeams': 11, 'sharedVocabularies': 5}
rel missing [] / node missing [] / seam missing [] / pseam missing []
SDL rel types ['DOCUMENTED_BY_RECORD', 'INVOLVES', 'LEADS_TO', 'ON_FRONTIER', 'RESPONDS_TO'] True   # SDL == register
rel fields/pairs 7          # frontiers, leadsTo, respondsTo, involvedOrganizations, involvedPeople, regulatoryRecords, studies (IN)
node types ['Event', 'Frontier']
predicateOnly & relTypes set()        # R-53
enums ['EventKind', 'EventStatus', 'ReadoutStage', 'EndpointStatement', 'DiscontinuationScope', 'EventRole', 'FrontierGranularity', 'FrontierCurationStatus']
unions []
$ wc -c -l final/_work/registers/D13.*.yaml
  126 / 10,628  D13.node.yaml;  278 / 23,682  D13.relationship.yaml;  277 / 16,006  D13.seams.yaml
```

## Module numbers

2 node types, 5 relationship types, 7 from→to pairs (collapsed = expanded: no interface or union targets), 0 unions, 1 edge-property type, 8 enums.

## Not applied here (other files or stages)

- R-21, R-35, R-44 fixture edits (lesne a09–a11 → REVISES, drop INVOLVES PUBLISHER/AUTHOR rows, a10/a11 and bioage `derivedFrom=` → DERIVED_FROM, contentHashBasis NORMALIZED_TEXT → CANONICAL_PROJECTION): fixtures stage.
- R-21 Q-D13-22 pattern, R-94 03 line ~188, R-44/R-66/R-69 text in 09-reasoning: patterns and reasoning are not final-module files.
- R-66 vocab-frontiers `breakthroughCriteria` remap to RegulatoryPathway: vocabularies stage (recorded in D13.seams.yaml sharedVocabularies).

## Open issues for the coordinator

1. R-06: INVOLVES Event → D7.Person has no fixture after R-44 (its only rows were lesne AUTHOR roles). R-81 names INVOLVES {PRESENTER} (deciding CQ-CL-05, v1, a D7/D9 question); D13's own questions on the pair are Q-D13-14 (v2) and Q-D13-25 (v3). Needs a numbered request in final/requests.md or a cut to a predicate.
2. R-02: the packet's 23 L3 directives are kept (no ruling removes them); the owner lever decision applies to D13 and D3/D8/D11 alike.

---

<!-- stage: _runlog/integrate.md -->

# Runlog: integrator stage (S team), 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Commands were run from the worktree root in Git Bash. `$F` = `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final`; `$SP` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/integrate`. No .env value was printed. Nothing was committed.

## 1. Assemble

```
node scripts/assemble-schema.mjs
→ {"ok": true, "out": "...\\final\\schema\\final_biotech_schema_v2.graphql", "modules": 14, "types": 300}   exit 0
wc -c -l schema/program/final/schema/final_biotech_schema_v2.graphql
→ 7269 lines, 385018 bytes
manifest sha256 d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705
module digests (first 12): kernel ec981e2aab04, D1 eb0537ff69c0, D2 3d1f1a729fcd, D3 6a3cdc898207, D4 b62054b09a77, D5 7fb18a838e1b,
  D6 6b14b735ef1a, D7 83221ab14b26, D8 9eaf3f0f2348, D9 323e181a03ff, D10 356dbffe86c0, D11 ec9a90a90a15, D12 f7c6b4107e27, D13 24f8f6853a6b
```
No duplicate names, so no module edit was needed. A dangling-reference check followed (script saved as `final/_work/check-refs.mjs`):
```
node $F/_work/check-refs.mjs $F/schema/final_biotech_schema_v2.graphql
→ {"declared": 300, "dangling": []}
```
At the end of the stage, re-running `node scripts/assemble-schema.mjs` gave the same output and the same sha256, d233930272c7…d705. The module SDLs were not touched in this stage.

## 2. Map

```
node packages/schema-workspace/dist/cli.js map --sdl $F/schema/final_biotech_schema_v2.graphql --out $F/schema-map.md
→ {"ok": true, "bytes": 256847, "schemaDigest": "sha256:d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705"}   (0.77 s)
Totals table: node types 69, interfaces 2, relationship fields 148, distinct relationship types 106,
  pairs after union/interface expansion 848, edge property profiles 20, unions 16, enums 193, domains 14
```
The mapper does attribute the modules from the `# ---- fragment <id> ----` banners. Two problems with its output:
- It numbers the domains D1–D14 in file order: its "Domain D1" is fragment K, its "D2" is fragment D1, and so on.
- It expands interface targets into every implementing domain. As a result the K row has 8 in every column.

I added a module-labelled section with this command:
```
node $F/_work/count-schema.mjs $F/schema/final_biotech_schema_v2.graphql --append-map $F/schema-map.md
```
The command replaces or appends the section `## Module seam matrix (integrator)` at the end of schema-map.md. Its header line reads "From→to pairs (collapsed): 181; cross-module: 86".

The map file's first line says "Rendered from the pinned SDL". That is the renderer's fixed wording. The digest printed on that line is the digest of the candidate.

## 3. Executable

Deployed options, using the recipe from the task:
```
time (BKS_SCHEMA_PATH=$F/schema/final_biotech_schema_v2.graphql NODE_OPTIONS=--max-old-space-size=8192 \
      pnpm --filter @bks/graphql-api print-schema "$SP/printed-deployed.graphql")
→ wrote ...printed-deployed.graphql (1734903 chars) in 2s        real 0m6.354s
wc -c -l → 34373 lines, 1735213 bytes;  grep -c '^input ' → 960;  '^enum ' → 196;  '^type ' → 524;  '^type Mutation' → none
grep -c 'validObservedAtPrecision\|CURATOR_CLASSIFICATION' → 10
```
The fallback was ruled out:
- The output is 1.7 MB, not the 55–58 MB of the pinned schema.
- It contains fields that exist only in the synthesis kernel.
- print-schema does not log its input path.

To time the build precisely and to measure L3, I used the K lever printer, copied to `$SP/print2.mjs` and re-pointed from the A1 worktree to this worktree's `apps/graphql-api` with `sed s#biotech-knowledge-services-A1#biotech-knowledge-services-S#`:
```
NODE_OPTIONS=--max-old-space-size=8192 node $SP/print2.mjs $F/schema/final_biotech_schema_v2.graphql $SP/printed-none.graphql none   (x3)
→ {"bytes":1734903,"lines":34374,"inputs":960,"ms":1780} / {"ms":1731} / {"ms":1561}
cmp printed-none.graphql printed-deployed.graphql → IDENTICAL
NODE_OPTIONS=--max-old-space-size=8192 node $SP/print2.mjs $F/schema/final_biotech_schema_v2.graphql $SP/printed-L3.graphql all    (x3)
→ {"bytes":728774,"lines":22797,"inputs":960,"ms":1258} / {"ms":1315} / {"ms":1330}
wc -c -l printed-L3.graphql → 22796 lines, 729084 bytes; '^type ' 524; '^enum ' 196; no Mutation
sha256 (first 16): printed-deployed 269a15347ca86c0c, printed-L3 41d98d5f68f6d0ea
```
`bytes` in print2 is a JS string length (chars). The byte figures in the reports come from `wc -c`.

Pinned baseline, printed the same way:
```
time (NODE_OPTIONS=--max-old-space-size=8192 node $SP/print2.mjs .../schema/pinned/final_biotech_schema_proposal.graphql $SP/printed-pinned.graphql none)
→ {"bytes":57908217,"lines":693831,"inputs":38034,"ms":34001}   real 1m14.822s
wc -c → 57908325; wc -l → 693830; sha256 (first 16) e0120c0799e4f9dc   (scratch print deleted afterwards, 58 MB)
```

IR, built with the same `parseSchema` call that the map command uses (new script `final/_work/build-ir.mjs`):
```
node $F/_work/build-ir.mjs $F/schema/final_biotech_schema_v2.graphql $F/schema/final_biotech_schema_v2.ir.json
→ {"ok":true,"schemaDigest":"sha256:d233930272c7…d705","nodes":69,...}   2,091,344 bytes (contains a parsedAt timestamp)
```

schema-size:
```
node scripts/schema-size.mjs $SP/printed-deployed.graphql --ir $F/schema/final_biotech_schema_v2.ir.json --out $SP/size-deployed.md
node scripts/schema-size.mjs $SP/printed-L3.graphql       --ir $F/schema/final_biotech_schema_v2.ir.json --out $SP/size-L3.md
→ headline (both): input 960, object 524, enums 196, Query fields 158, Mutation 0, SDL node types 69, relationship fields 148, pairs 848
  deployed: 1.7 MB, 34,374 lines, Where family 13,769 lines;  L3: 0.7 MB, 22,797 lines, Where family 2,192 lines
```
`final/size-report.md` was put together from three parts:
1. A headline section written by hand, using only the numbers above and those in step 4.
2. The deployed schema-size output.
3. The L3 schema-size output.

## 4. Counts and budget

Counting script `final/_work/count-schema.mjs`, new. It attributes modules from the `# MODULE` banners. The collapsed count follows R-01 option A; the expanded count follows option B.
```
node $F/_work/count-schema.mjs $F/schema/final_biotech_schema_v2.graphql --json $SP/count.json --matrix $SP/matrix.md
→ nodeTypes 69; interfaces Entity 69 / Subjectable 56 implementers; relationshipTypes 106; relationshipFields 148;
  pairsCollapsed 181; pairsExpanded 848; unions 16; widest union as target AdministeredMaterial 5; enums 193
  perModule (nodes / rel types / collapsed pairs): K 11/13/33, D1 4/6/7, D2 5/6/10, D3 8/15/32, D4 7/13/17, D5 6/6/9, D6 6/9/11,
  D7 4/7/9, D8 6/11/25, D9 3/7/8, D10 3/4/5, D11 1/0/0, D12 3/4/8, D13 2/5/7
cross-check with the slim architect's pairs.mjs: "collapsed(interface=1) 181 expanded 848 Subjectable implementers 56 Entity 69"
```
The pinned SDL was counted by the same method:
```
node $F/_work/count-schema.mjs .../schema/pinned/final_biotech_schema_proposal.graphql
→ nodeTypes 192, relationshipTypes 393, relationshipFields 1082, pairsCollapsed 3883, pairsExpanded 3940, unions 39, widest AssertionSubjectTarget 144
```
Budget result: every line passes under option A. Expanded pairs are 848 against a limit of 600, which is the R-01 owner decision. No cut was made.

Step-7 checks (`final/_work/rel-values.mjs`, new; run after merge-registers):
```
node $F/_work/rel-values.mjs
→ node types with < 2 filterProperties in the register: none
  {"questionIdsWithValue":455,"relationshipTypes":106,"bestValue1":95,"bestValue2":11,"bestValue3":0,"noValue":0}
  best v2: ASSIGNED_TO, DERIVED_FROM_TAXON, DOCUMENTED_BY_RECORD, INCLUDES_TEST, INTERVAL_FOR, LICENSED_TO, MATERIAL_CONTAINS,
           MEASURES_ANALYTE, PARENT_TAXON, PART_OF_MECHANISM, WAS_ASSOCIATED_WITH
```
The first run reported 453 ids and `COVERS: CQ-PF-03a | ISSUED_BY: CQ-PF-03a` without a value. I then added the R-08 split ids: CQ-PF-03a is v1 and CQ-PF-03b is v2.

Hub check, from count.json: the most relationship fields per node are Assertion 8, Study 6 and ReportItem 6. No node exceeds 12.

## 5. Registers

Merge script: `final/_work/merge-registers.mjs`, new. It writes final/node-register.yaml, final/relationship-register.yaml and final/seams.yaml.

All 42 fragments parsed with yaml@2. Their top-level keys were listed with `$SP/explore.mjs`.

Run 1, `--check-only`: 0 violations and 7 warnings. Two of the warnings were false positives from my endpoint parser:
- A parenthetical "(member of union CertificationCoverageTarget)" was read as an endpoint.
- Claim was not seen as a Subjectable implementer.

I fixed the parser in two ways: parenthetical remarks are stripped, and an interface named in a register covers its implementers.

Run 2: 0 violations and 3 warnings, which were the duplicate entries described in I-03. I then added a check that every cross-module SDL pair has a seam row on both sides, as contract rule 8 requires.

Run 3, the first write: 86 cross-module edges, 8 of them one-sided. Two of those were false. STEP_USES rows name concrete members of Subjectable, so I changed the matcher to let a row naming an implementer match an interface pair. That left 6 genuinely one-sided pairs, which are listed under I-01.

Fragment fixes:
- **I-01:** I added seam rows for the 6 pairs:
  - 3 in `D9.seams.yaml`: CHUNK_OF, COVERS_LOCATOR, MENTIONS.
  - 2 in `D10.seams.yaml`: DERIVED_FROM, from ReportItem and from Association.
  - 1 in `D5.seams.yaml`: RESOLVES_TO_CONSTRAINT.
  - Re-merge: crossModuleEdgesOneSided 0.
- **Warning cleanup:** the cut row `ASSOCIATES Association → D12.FoodItem` matched through Subjectable. Now only exact pairs are checked against cut rows. Statuses are normalized to their first word.
- **I-02:** `sed -i 's#^    fixture: 07-fixtures/#    fixture: final/fixtures/K/#' K.relationship.yaml` changed 13 lines. I added a check that every fixture path is under `final/fixtures/<module>/`.

Final run:
```
node schema/program/final/_work/merge-registers.mjs      exit 0
→ sdl: nodeTypes 69, relationshipTypes 106, pairsCollapsed 181, crossModulePairs 86
  nodeRegister: nodes 69, deferred 108, mergedInto 227, retiredEnums 2, unionsRetired 8
  relationshipRegister: relationships 109, predicateOnly 203, authorizingPredicates 10, deferred 386, ruleNotes 2, removedPredicates 5,
                        registeredElsewhere 8, mergedInto 2, removedRegistrations 6
  seams: seams 331, predicateSeams 156, facetSeams 1, crossModuleEdges 86 (all accepted, 0 one-sided), cutEdges 19
  violations 0, warnings 3 (ASSESSES K+D10, DERIVED_FROM K+D10, RENDITION_OF D3+D9 registrar D3: kernel-meaning types, counted once), stampIssues 0
```
The checks found:
- **Relationship types:** all 106 SDL types have a register entry with non-empty questions, pattern, populatedBy and fixture.
- **Node types:** all 69 have whyNode and identityKeys.
- **Predicates:** the 213 predicateOnly and authorizingPredicates values are unique, so no predicate has two registrars. None equals an SDL relationship type name.
- **Fixture requests:** three relationship entries carry a `fixtureRequest` and also a fixture. They are D5 OPERATIONALIZED_BY, D8 STATUS_OF and D8 COVERS.

decision-report.md:
- I added "### Integration rulings (integrator, 2026-10-09)", I-01 to I-03, under "## Merge rulings" after the Tally.
- I filled in "## Cuts to budget": no cut was made, with the numbers and the next demotion tier.

---

<!-- stage: _runlog/vocabularies.md -->

# Runlog: VOCABULARIES stage (S team), 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Git Bash. `$W` = the worktree,
`$F` = `$W/schema/program/final`, `$SP` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/vocab`.
Wrote only `$F/vocabularies/*.yaml`, `$F/_work/vocab/*.mjs` (copies of the scratch scripts, for re-runs) and this file. No `.env`
value printed. Nothing committed. Packets, `schema/pinned`, `packages/`, `scripts/`, `workspace/` untouched
(`git status --short -- schema/program/packets schema/pinned packages scripts workspace | grep -vc '^A  '` → 0).

## Outputs (`$F/vocabularies/`)

| file | bytes | sha256 (first 16) | from |
| --- | ---: | --- | --- |
| targets.yaml | 42,063 | 02de43f1a6b5473d | packets/D5/vocab-targets.yaml@0.2.2 + 11 asserted edits + `synthesis` block (version stays 0.2.2) |
| frontiers.yaml | 112,688 | 0ec7d348a1a05f8f | packets/D13/vocab-frontiers.yaml@0.2.1 + 22 asserted edits + `synthesis` block (version stays 0.2.1) |
| identifier-schemes.yaml | 111,768 | e1633169c4ffda7b | K identifier-schemes.yaml v2 + D11 identifier-bridges.yaml + final node-register + R-42 additions (generated) |
| verdict-lattice.yaml | 15,197 | 7e868b60d02692c2 | K 09-reasoning verification.v1 correspondence + decision 2; R-22, R-31, R-32, R-36 |
| goal-polarity.yaml | 13,455 | 64ed765bd2926e04 | directive 3.1/3.2; targets polarityRule; final D5 register; R-52, R-59, R-83, R-84, R-85 |
| claim-lifecycle.yaml | 11,276 | abb93b15d2242a51 | directive 3.4; K 09-reasoning claim lifecycle + lineage spine; D10 report-skeletons §4; R-12, R-13, R-20, R-32, R-45 |
| answer-kinds.yaml | 14,403 | 238b0d144dcb1fda | packets/D10/answer-kind-table.md (counts recomputed); R-08, R-49, R-50 |

Input hashes (sha256, first 16): answer-kind-table.md 73bd9020bdf1ce21, K/identifier-schemes.yaml 29f77d32663989ed,
D11/identifier-bridges.yaml e52bc00ce7d4b1be, D5/vocab-targets.yaml 7a743bcb773e3be3, D13/vocab-frontiers.yaml b668b70f5d172756,
final/node-register.yaml 7515835405e0034a, K/09-reasoning.md f5967ff966fbbcfa. Assembled SDL d233930272c7…d705 (385,018 B).

## Commands and key output

1. Read the contract and rules: `03-SYNTHESIS.md` (deliverables, procedure step 3), `00-DIRECTIVE.md` 3.1–3.10 and 4, PLAN 6.2; the
   inputs: K `identifier-schemes.yaml` and `09-reasoning.md`, D11 `identifier-bridges.yaml`, D5 `vocab-targets.yaml`, D13
   `vocab-frontiers.yaml`, D10 `answer-kind-table.md` and `report-skeletons.md`, `final/decision-report.md` (R-08, R-12, R-22, R-25,
   R-31..R-36, R-42, R-44, R-45, R-49, R-50, R-59, R-60, R-66, R-70, R-83..R-85, R-92), `final/_work/rulings.yaml`, the final D5
   register, `review-open-issues.json` (vocabulary-related items: D10.open[5], D12.open[2]).

2. SDL facts:
   ```
   node $SP/sdl-facts.mjs $W $SP/sdl-facts.json
   → {"sha256":"d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705","bytes":385018,"enums":193,"unions":16,"nodeTypes":69,"relationshipTypes":106,"labels":73}
   ```
   Same 69 / 106 / 193 enums / 16 unions as the integrator's map.

3. verification.v1 spellings (read only, another repo): the contracts source is not in the local checkout
   (`find … -path "*contracts/src/verification/*.ts"` → nothing). Corroboration found in a maintenance-job copy:
   ```
   grep -n -o '<field>: "<v>" | …' .../ai-engineer-knowledge-services/.git/maintenance/jobs/20d31a43-…/attempt-1/worktree/apps/verification-executor/dist/executor.d.ts
   → verdict: "context_only" | "contradicted" | "derived_failed" | "derived_verified" | "directly_supported" | "insufficient_evidence" | "locator_error" | "mixed_or_conflicting" | "not_supported" | "parser_error" | "partially_supported" | "pending_semantic_review" | "source_unavailable" | "supported_with_qualification" | "unverifiable"
   → policyOutcome: "abstain" | "fail" | "pass" | "pass_with_warnings" | "review"
   sha256 executor.d.ts 9689fd44ac2a05e3…, 13,842 B, dated Oct 1
   grep -n ADMITTED .../apps/verification-executor/src/index.ts → 217: const ADMITTED_VERDICTS = new Set(["directly_supported", "supported_with_qualification"]);
   ```
   The 15 values equal the SDL SemanticVerdict (SCREAMING_SNAKE) one for one; the 5 equal PolicyOutcome.

4. Identifier schemes:
   ```
   node $SP/build-identifiers.mjs $W
   → schemes 113 (seed 47, requested 66; added by synthesis R-42: 10), withPattern 81, usedByAtLeastOneNodeType 103, bridgeRows 22, problems []
     unparsedRegisterItems: 3 prose fragments ("every scheme in identifier-schemes.yaml" on K.Identifier; two comma-split parentheticals) — no code lost
     notRegistered: NCIT (optional in D11, not in R-42), UCUM (a unit vocabulary)
     unusedByNodeRegister: CHEMSPIDER, EIN, FDA_FEI, NANOPUB, NIHMS, ORG_STUDY_ID, RW_RECORD, SPL_SET_ID, TICKER, UMLS_CUI
   ```
   103 K v2 codes + 10 R-42 codes (SPL_SET_ID, EIN, ORG_STUDY_ID; NDB_NUMBER, FNDDS_FOOD_CODE, FOODON, PHENOL_EXPLORER_FOOD,
   WWEIA_CATEGORY, FOODEX2, LANGUAL) = 113. Every scheme any final node register lists is in the register. Rule ids: D11's where a D11
   row exists, else minted by S (`digits-v1`, `upper-v1`, `verbatim-v1`, or `<code>-v1`; `ruleOrigin` says which). Pattern conflicts
   kept to K (MESH: D11 also admits Q qualifier UIs; SEC_CIK: D11 admits 1–10 digits, K validates the left-padded value).
   Re-run after setting the three D11-requested codes' domains to [D11] → same counts, problems [].

5. Answer kinds:
   ```
   node $SP/answer-kind-counts.mjs $W $SP/answer-kind-counts.json
   → rows 475, distinctIds 453, sharedIds 22; declared {retrieved 336, materialized 26, assessment 89, published 24}
     ruling {retrieved 345, materialized 20, assessment 90, published 20}; 17 disagreements; 6 published variants
     byPolarity benefit 21 / harm 230 / neutral 224; byValue 1: 162, 2: 261, 3: 52
     drift [] (every row's declared kind equals the packet's current 02-questions.md), missingInTable [], extraInTable []
   ```
   (First run parsed 17 ruling cells with "⚑" / "+ published variant" wrongly and summed to 458; parser fixed, re-run above.)
   The per-packet and per-audience counts equal the table's own Summary section.

6. Targets and frontiers:
   ```
   node $SP/build-targets.mjs $W
   → {"edits":11,"version":"0.2.2","targets":15,"top":12,"children":3,"deferred":6,"badParents":[],"predicates":[5 goal predicates],"consumers":[K,D1..D10 without D5/D11, D12, D13]}
   node $SP/build-frontiers.mjs $W $SP/sdl-facts.json
   → {"edits":22,"version":"0.2.1","frontiers":25,"themes":7,"milestoneKinds":18,"eventKindsVocab":26,"eventKindsSdl":26,"missingInVocab":[],"missingInSdl":[],"problems":[],"badPathwayValues":[],"pathwayTokensNotInEnum":[],"breakthroughCriteria":5,"queryShapes":9}
   ```

7. Hand-written: verdict-lattice.yaml, goal-polarity.yaml, claim-lifecycle.yaml, answer-kinds.yaml (numbers copied from step 5 output).

8. Consistency check against the SDL and across files:
   ```
   node $SP/check-vocab.mjs $W $SP/sdl-facts.json $SP/answer-kind-counts.json $SP/cypher > $SP/check-report.json
   → exit 0; problems 0; sdlEnums blocks 6, enums compared 43 (exact value and order); 8 Cypher statements token-checked (labels,
     relationship types, properties against the SDL): 0 unknown
   ```
   What it checks: every `sdlEnums` block equals the SDL enum; the capture-fidelity mapping covers each of the 15 verdicts once and
   each of the 5 policy outcomes once, statuses ∈ AssertionStatus, v1 spellings; carriers typed SemanticVerdict / PropertyStatus;
   lifecycle states, dispositions, transitions, node and relationship types, caches; goal predicates ↔ targets mapping; question
   polarity totals and every packet's harm share ≥ 1/3 against the table; answer-kind counts (final, declared, byPacket, byAudience,
   byPolarity, byValue, disagreements, published variants) against step 5; Target fields, TargetMeasure members, OPERATIONALIZED_BY
   edge-property type, targetKeys holders; Frontier fields, the five D13 relationship types and their properties, Event pathway fields
   typed RegulatoryPathway, eventKinds = EventKind; identifier codes unique, patterns compile, every usedBy node type exists,
   Identifier.scheme is a String.
   Mutation test (scratch copy of the facts with EffectDirection shortened, an extra SemanticVerdict and WAS_INFORMED_BY removed) →
   7 problems reported, so the checks fire.

9. Cypher on the disposable Neo4j 5.26 (bks-neo4j-synth, bolt 7691):
   ```
   node $SP/explain.mjs $SP/cypher     # EXPLAIN <statement> via docker exec cypher-shell -P '{params}'
   → frontiers.QF-01, QF-02, QF-03, QF-05, QF-07, QF-09, targets.QP-TARGET-01, targets.whatIsThisFor: exit 0, PLANNED (Plan "EXPLAIN", READ_ONLY, COST)
   failed: 0
   negative control: EXPLAIN MATCH (n) RETURN n.x +  → "Invalid input ''"
   ```
   One query was changed before it planned against the final names: QF-09 `f.label` → `f.name AS label` (Frontier has no label
   property; the label is Entity.name).

10. Final regeneration in order (sdl-facts → identifiers → targets → frontiers → counts → check → explain): same counts, check exit 0,
    explain failed 0. Scripts copied to `$F/_work/vocab/` (sdl-facts, build-identifiers, build-targets, build-frontiers,
    answer-kind-counts, check-vocab, explain); each takes the worktree path as its first argument.

## Edits applied to the packet vocabularies

targets (11): consumers drop D11 (R-85); measures seam → TargetMeasure 4 members incl. D2.Condition (R-70), class asserted
recorded-time, AssertedRecordedProperties (R-26), basis CURATOR_CLASSIFICATION (R-25); purpose and study branch with Condition; SDL
path → final/schema; outcome qualifier spelling note; seam rule text; pin path → final/vocabularies/targets.yaml@0.2.2 (R-60, R-09);
not-goal predicates RECOMMENDS_USE / RECOMMENDS_AGAINST registrar D9 (R-83), REPORTS_ADVERSE_EXPERIENCE retired (R-84), MEDIATES_TARGET
admitted (R-83); D2 obligation incl. Condition; predicate list registrar and FoodCategory subjects (R-52, R-85).

frontiers (22): targets pin → final @0.2.2 and regulatory-pathways consumed from D8 (R-60, R-66); PUBLICATION event kind removed
and listed under retiredEventKinds, the NEJM example re-typed as a D3 Publication, RETRACTION definition per R-44; approvalPathway /
designationType values → RegulatoryPathway in APPROVAL, REGULATORY_DESIGNATION, ms:diagnostic-clearance, one example, BC-DESIGNATION,
BC-FIRST-APPROVAL (R-66; mapping table from OQ-D8-02 in `synthesis.regulatoryPathwayMapping`); "ClaimOccurrence (D9)" → kernel claim
occurrence (4 places); "ABOUT" → EVENT_ABOUT predicate (2); NarrativeArc note; ON_FRONTIER basis CURATOR_CLASSIFICATION (R-25);
QF-09 f.label → f.name; frontiers pin path (R-60).

## Not done here (other stages or owner)

- `final/vocabularies/predicates.yaml` (R-52), `assessment-vocabularies.yaml` (R-34, R-54) and the R-57 comparator mapping are named
  by rulings but are not in this stage's assignment; the OQ-D8-02 RegulatoryPathway mapping is published inside frontiers.yaml
  (`synthesis.regulatoryPathwayMapping`).
- Open items recorded in the files: verdict order for R-22 "highest verdict"; effect of a human REJECT; EXTRACTED definition;
  RATES_CLAIM lattice mapping values (owner, R-31); R-36 (owner); R-12 owner confirmation; D8 statedVerdict (OQ-D8-14, owner);
  qualifier spelling `outcome:` vs `outcomeUid`; CQ-PF-03a/b not yet in any 02-questions.md.

---

<!-- stage: _runlog/questions.md -->

# Run log: questions catalog (S stage "questions", 2026-10-09)

Deliverable: `final/questions-catalog.md`, generated by `final/_work/questions-catalog.mjs` (deterministic, no timestamps). Scratch: `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/questions/`. Nothing was written outside `final/` except that scratch folder. Nothing was committed.

## 1. Inputs surveyed

```
wc -l packets/*/02-questions.md ; grep -c '^| *\(Q-\|CQ-\)' packets/*/02-questions.md
```
All 14 packets use the contract header `id | question | audience | value | polarity | answer kind | answer shape | sources | fixture`. Row counts per packet: K 35, D1 33, D2 34, D3 32, D4 35, D5 34, D6 37, D7 33, D8 33, D9 36, D10 36, D11 30, D12 34, D13 33 (475). D3 has a second table (property matrix) whose first column is not an id; the generator only reads tables whose header's second cell is `question`.

```
sed -n 41,75p packets/D10/answer-kind-table.md
```
D10 summary: 475 rows, 453 distinct ids, 22 ids in two packets; 17 disagreements; CQ-PF-03 left for synthesis to split. `final/decision-report.md` R-08 (split CQ-PF-03 into 03a D8 v1 retrieved / 03b D6 v2 assessment; a shared id carries the lowest declared value) and R-50 (D10 rulings adopted).

## 2. Exploration (scratch)

```
node scratchpad/synth/questions/explore.mjs scratchpad/synth/questions/rows.json
```
Output: `rows 475 ids 453`; 22 `DUP` ids (CQ-TM-03, CQ-AX-04, CQ-AX-07, CQ-AX-08, CQ-PF-01, CQ-ID-04, CQ-ST-02, CQ-EV-05, CQ-EV-04, CQ-AX-24, CQ-RC-06, CQ-CM-04, CQ-AX-19, CQ-PF-03, CQ-CL-05, CQ-EC-01, CQ-MF-01, CQ-CL-07, CQ-PV-02, CQ-PV-04, CQ-PV-05, CQ-RC-05); value sets {1,2,3}; polarity {neutral, harm, benefit}; kinds {retrieved, published, assessment, materialized}; audiences {researcher, agent, biohacker, investor}; fixture {yes, no}; 15 rows whose question cell names another packet's row id (K "reuses", D3, D7, D11).

```
node scratchpad/synth/questions/sim.mjs
```
Output: 6 cross-packet pairs with word-set Jaccard >= 0.30 (top 0.45 Q-K-14 / Q-D10-17). Each pair was read; all six are related but differ in scope, so none was merged (reasons are in the script's `REVIEWED_RAW` table and printed in the catalog).

```
node -e "<compare packets/*/05-relationship-register.yaml with final/relationship-register.yaml>"
```
Output: `final q 296 packet q 297`; in packets not final: `Q-D2-18 CQ-PF-03`; in final not packets: `CQ-PF-03a`. No packet relationship type is missing from the merged register.

```
node -e "<list final/seams.yaml cutEdges>"
```
Output: 19 cut seam rows; those with questions: D1 CONCERNS→IngredientMaterial (Q-D1-17, R-73); D3 ADMINISTERS→Device (CQ-ST-01, Q-D3-04, R-72); D5 ASSESSES→UseConstraint and BLOCKED_BY→Assertion (CQ-RC-06, R-75); D5 OFFERS_INTERVENTION (Q-D5-17, R-94, R-52); D7 OPERATED_BY (CQ-CL-05, CQ-CL-07, R-79); D7 COVERS→Organization (CQ-MF-01, Q-D7-10, R-67); D7 publisherUid (Q-D7-06, R-46); D8 CONCERNS/STATUS_OF→Device (Q-D8-23, R-72); D8 CONCERNS Patent→IngredientMaterial (Q-D8-11, Q-D8-13, R-73); D8 QUALITY_RESULT_FOR→Product (Q-D8-06, CQ-AX-19, Q-D8-18, Q-D8-19, R-73); D9 RECOMMENDS projection (Q-D9-01, R-83); D10 ASSOCIATES→FoodItem (Q-D12-20, R-94); D12 QUALITY_RESULT_FOR→Product (Q-D12-03, Q-D12-06, `ruling: null`, seam status `cut (R-73) — contested`); D12 ASSOCIATES→FoodItem (Q-D12-20, `ruling: null`, seam status `cut (R-94)`).

Survival is computed from register entries **and** live seam rows. A first version read only register entries and reported CQ-MF-01 and Q-D12-06 (both value 1) as cut; both keep typed edges through accepted seam rows (CQ-MF-01: BRANDED_AS, NAMES_RESPONSIBLE_PARTY; Q-D12-06: QUALITY_RESULT_FOR → Lot), so they are *partial*. `crossModuleEdges` is not read for survival: its `questions` is the union over every seam row of a pair, cut rows included (ASSOCIATES → Subjectable lists Q-D12-20 although both Q-D12-20 rows are cut).

```
grep -n 'CQ-EV-05' final/_runlog/module-D13.md
```
Output line 91: "R-44 (INVOLVES: CQ-EV-05 dropped from the Event → Person pair …)". The generator reads module runlogs for the ruling when a register entry stops citing a question and no `edit-question`/`edit-pattern` op names it.

## 3. Generator runs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/questions-catalog.mjs
```
Final output:
```
{ "out": "final/questions-catalog.md", "bytes": 430152, "rows": 475, "packetIds": 453, "distinct": 454, "shared": 21,
  "value1": 154, "value2": 249, "value3": 51, "harm": 223, "harmShare": "49.1%",
  "audience": { "biohacker": { "n": 220, "harm": 134, "share": "60.9%", "v1": 92 }, "investor": { "n": 159, "harm": 88, "share": "55.3%", "v1": 54 },
                "researcher": { "n": 220, "harm": 94, "share": "42.7%", "v1": 75 }, "agent": { "n": 115, "harm": 35, "share": "30.4%", "v1": 45 } },
  "kinds": { "retrieved": 331, "materialized": 20, "assessment": 84, "published": 19 }, "disagreements": 17, "fixtureYes": 324,
  "survival": { "kept": 388, "partial": 20, "rerouted": 2, "noedge": 43, "cut": 1 }, "cutValue1": [], "links": 23, "similar": 6, "unreviewed": 0,
  "missingD10": 0, "patternIssues": 0, "queryPatternsPresent": false, "crossDomainFixtures": [] }
```
Per-row kinds (475 rows) match D10's summary: declared retrieved 336 / materialized 26 / assessment 89 / published 24; ruling 345 / 20 / 90 / 20.

```
sha256sum final/questions-catalog.md   # run twice
```
Identical digest on two consecutive runs (deterministic). After the last fix (D10's ruling cells carry their own ⚑ marker, which the generator now strips so a disagreement shows one ⚑): catalog `587729f830c1df43fc4f1ec34c650c581c5ed4ce4b5827379c84cda116e19dd3` (430,152 B, 1,888 lines), script `8412dd6d136b59057b3842de8e4831c49b1aaa33a7e767fc596536afed32aa78`. Counts unchanged by that fix.

```
node scratchpad/synth/questions/tablecheck.mjs final/questions-catalog.md
```
`{"tables":27,"rows":1721,"bad":0,"lines":1888}`: every table row has its header's column count.

## 4. Open points for the finalizer

- `final/query-patterns.md` did not exist at generation time; every pattern reference points at `packets/<P>/03-retrieval-patterns.md#<heading>` (all 475 rows have a heading of their own). Re-run the script after query-patterns.md lands; it then cites `final/query-patterns.md#<section>` for every id that file mentions.
- `final/fixtures/cross-domain/` had no `questions.md` yet; re-run after the three cross-domain fixtures land to list them in the fixture column.
- Value-1 questions Q-D12-03 and Q-D12-06 lose the QualityResult → Product pair under R-73, which their D12 seam row marks contested (fixture acrylamide-fried-potato-harm acr-03 writes it). They keep QUALITY_RESULT_FOR → Lot and the predicate MEASURED_CONTENT_IN_PRODUCT. Owner decision.
- Only Q-D5-17 (value 2) lost every typed edge (OFFERS_INTERVENTION, R-94/R-52); its predicate route OFFERS_INTERVENTION (registrar D6) remains.
- Fixture column vs fixture folders: 13 rows say yes but no `07-fixtures/*/questions.md` names the id; 31 say no but a fixture names the id (listed under "Data checks"). The catalog reports the packet's column; owners should reconcile.

---

<!-- stage: _runlog/patterns.md -->

# Stage: query patterns (S) — run log

Agent: S query-patterns, 2026-10-09 (UTC). Worktree `biotech-knowledge-services-S`, branch ft/schema-S. Writes: `final/query-patterns.md`, `final/_work/validate-patterns.mjs`, `final/_work/gen-patterns-ddl.mjs`, `final/_work/patterns-ddl.cypher`, this file. Scratch: `scratchpad/synth/qp/`. No `.env` values were read or printed. Paths passed to node use `C:/…` forms.

## Inputs read

- `.agents/skills/neo4j-cypher-skill/SKILL.md`, `neo4j-gds-skill/SKILL.md`, `neo4j-vector-index-skill/SKILL.md`.
- `fast-track/00-DIRECTIVE.md` (sections 1–5), `03-SYNTHESIS.md` (deliverable row `query-patterns.md`).
- `final/schema/final_biotech_schema_v2.ir.json` (digest `sha256:d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705`), `final/decision-report.md` (R-01 … R-94 headings; R-04, R-12, R-13, R-17, R-19, R-22, R-27, R-47, R-48, R-49, R-50, R-68, R-75 … R-78, R-82 … R-85, R-91 in full), `final/_work/rulings.yaml`.
- Packets: `K/03-retrieval-patterns.md` (all), `D10/03-retrieval-patterns.md` (all), `D10/answer-kind-table.md` (summary + materialized rows); targeted sections of D2, D3, D4, D5, D7, D9, D12, D13 `03-retrieval-patterns.md`; scratch `inv/review-open-issues.json`.

## Commands and key output

1. `node scratchpad/synth/qp/dump.js` — compact dump of the IR → `scratchpad/synth/qp/schema-dump.txt` (79,834 B). IR arrays: nodes 69, relationshipTypes 106, unions 16, interfaces 2, edgePropertyTypes 20, enums 193.
2. IR classification (node one-liner over the IR): relClass asserted 64, derived 7, structural 35. By edge properties: validFrom+recordedFrom 26 types; recordedFrom only 37; DerivedEdge-style (derivedAt) 6; structural props only 28; no properties 9. Mismatches noted: MEASURES relClass derived with AssertedRecordedProperties; HAS_VARIANT, REQUIRES_INPUT_METRIC relClass asserted with StructuralEdgeProperties (open issue Q-3).
3. `docker ps` → `bks-neo4j-synth neo4j:5.26-community 0.0.0.0:7691->7687`; `CALL dbms.components()` → `Neo4j Kernel 5.26.31 community`; database empty (0 nodes), indexes `index_343aff4e`, `index_f7700477` (LOOKUP), 0 constraints.
4. cypher-shell probes: `CYPHER 25 EXPLAIN …` → "25 is not a valid option for cypher version. Valid options are: 5"; `CYPHER 5 EXPLAIN` ok; dynamic labels `$($label)` in MATCH ok; `CALL (n) {…}` ok; QPE `{1,4}` ok.
5. `node scratchpad/synth/qp/probe.mjs` (neo4j-driver from packages/kg-ops): COLLECT with UNION ok; QPE `-[:PARENT_OF]-{0,2}` ok; `OPTIONAL CALL` ok; `$asOf - duration({days: $days})` ok; `db.index.vector.queryNodes` and `db.index.fulltext.queryNodes` EXPLAIN ok; `CREATE VECTOR INDEX … vector.quantization.enabled/hnsw` ok; multi-label fulltext with list property ok; relationship-property index ok; composite uniqueness ok (all probe objects dropped).
6. `node scratchpad/synth/qp/probe2.mjs` — plan of `MATCH (x:$($label) {uid: $uid})`: `AllNodesScan → Filter x:$all($label)`; static label: `NodeUniqueIndexSeek`. (A third probe statement `WHERE x:$($label)` → SyntaxError "Dynamic Label and Types are only allowed in MATCH, CREATE, MERGE, SET and REMOVE clauses"; its probe constraint was dropped by probe3.)
7. `node scratchpad/synth/qp/probe3.mjs` — with a uniqueness constraint on a probe label, `MATCH (x:ProbeEntity {uid:$uid})<-[:HAS_SUBJECT]-(a:Assertion)` plans `NodeUniqueIndexSeek`; afterwards SHOW CONSTRAINTS → [] and SHOW INDEXES → the two lookup indexes (clean).
8. `node schema/program/final/_work/gen-patterns-ddl.mjs C:/…/final/schema/final_biotech_schema_v2.ir.json C:/…/final/_work/patterns-ddl.cypher` →
   `{"schemaDigest":"sha256:d2339302…dd705","uidConstraints":69,"relAssertionIndexes":63,"relWriterIndexes":97,"statements":229}`; file 233 lines.
9. Negative control: `node …/validate-patterns.mjs --doc scratchpad/synth/qp/negative-control.md` → NEG-1 `Neo.ClientError.Statement.SyntaxError: Invalid input 'AS'…`; NEG-2 `SyntaxError: Variable \`b\` not defined`; an unmarked block → "block has no @ddl/@id/@gds marker". The validator reports syntax and semantic errors.
10. Validator run A (no `--fill`): 278 DDL accepted; 39 query statements, 9 projection sources, 1 GDS input query EXPLAIN ok; 19 CALL gds.* not run; failed 0; 13 fulltext/vector indexes not yet ONLINE at the state check (populating); CartesianProduct in P-10d, G-0, G-5; NodeByLabelScan in P-09 (from `MATCH (org:Organization) WHERE org = x`). 278 objects dropped after the run. Fixes: P-09 branch → `WITH x AS org WHERE org:Organization`; G-5 frontier moved into the EXISTS; validator calls `db.awaitIndexes(300)` before the state check.
11. Validator run B (`--fill`): failed 0; 280/280 indexes ONLINE; 278 dropped. Post-check: 2 indexes, 0 constraints, but **354 nodes** — another S agent had started loading the cross-domain fixture graph (`mission:ft-S-xfx-fixtures`) into the shared instance.
12. Read-only peek at that graph (labels and relationship types, assembled names) and sample uids.
13. Smoke run 1 (`node scratchpad/synth/qp/smoke.mjs …query-patterns.md`, READ session): `labels(who)[0]` returned `Entity` (Organization asserter) and `labels(n)[0]` returned `EvidenceAssessment` (Adjudication); P-04b 0 rows (the chunk's spans hold assertions about the intervention component, filtered out by the about-X EXISTS); P-12 0 rows (no Biomarker in the fixture; hop 2 was mandatory). Fixes: KIND convention (16 replacements of `labels(x)[0]`), P-04b returns all covered assertions with `aboutX`, P-12 hop 2 `OPTIONAL CALL`.
14. Smoke run 2 — output below.
15. Validator run C and D (`--fill`, 04:38Z, 681 nodes present): exit 1 — D-1#4 `Neo.DatabaseError.Schema.ConstraintCreationFailed: Unable to create Constraint( name='identifier_key', … (:Identifier {scheme, issuer, value}) )`. Read-only check found 4 duplicate keys: (UNII, FDA GSRS, 8XM2XT8VWI) on `hu:identifier:xfx-cp-ident-sub-nrcl-unii` and `hu:identifier:unii-8xm2xt8vwi`; (UNII, FDA GSRS, 0I8H2M0L7N); (PUBCHEM_CID, NCBI PubChem, 439924); (DSLD, NIH ODS, 323170) — the cross-domain fixture and a packet fixture mint different uids for one identifier (open issue Q-7). A transient check at 04:37Z (327 nodes) showed none, so the graph was being reloaded.
16. Validator change: a `ConstraintCreationFailed` is reported as a data conflict (statement accepted by the parser and planner, refused by the store), never as a pattern failure.
17. Validator run E (final, `--fill`, 2026-10-09T04:39:17Z → 04:39:33Z): exit 0. Output below.
18. Final instance check: `SHOW INDEXES` → 2 (the instance's own LOOKUP indexes), `SHOW CONSTRAINTS` → 0. Every object this stage created was dropped (run E: 277).

## Smoke run 2 (read-only, in-progress fixture graph; not acceptance evidence)

```text
nodes in graph: 556 at 2026-10-09T04:37:25.744Z
P-01b {"assertionUid":"hu:assertion:xfx-cp-id-sub-nrcl-unii"} rows=1 {"a.uid":"hu:assertion:xfx-cp-id-sub-nrcl-unii","a.predicate":"HAS_IDENTIFIER","a.status":"ACCEPTED","a.assertionKind":"RELATIONSHIP","asserterKind":"Organization","asserterUid":"hu:org:xfx-cp-org-fda","container":null,"ev.role":"SUPPORTS","ev.origin":"DECLARED","ev.authority":null,"ev.independence"
P-01c {} rows=82 {"a.uid":"hu:assertion:xfx-cp-id-person-brenner-orcid","a.predicate":"HAS_IDENTIFIER","noLocator":false,"noAdjudication":false,"irreproducible":true,"noLineage":false}
P-02a {"uid":"hu:substance:xfx-cp-sub-nr"} rows=13 {"a.uid":"hu:assertion:xfx-cp-a-moiety","a.predicate":"HAS_ACTIVE_MOIETY","a.valueString":null,"a.valueNumber":null,"a.unitCode":null,"a.status":"ACCEPTED","a.validFrom":null,"a.validTo":null,"a.validFromBasis":"UNKNOWN","a.validObservedAt":null,"a.recordedAt":{"year":2026,"month":10,"day":9,"hour":
P-02b {"uid":"hu:substance:xfx-cp-sub-nrcl"} rows=6 {"relType":"HAS_ACTIVE_MOIETY","outgoing":true,"otherUid":"hu:substance:xfx-cp-sub-nr","episodeKind":"RECORDED_ONLY","r.validFrom":null,"r.validTo":null,"r.validFromBasis":null,"r.recordedFrom":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0}
P-02d {"uid":"hu:substance:xfx-cp-sub-nr"} rows=32 {"kind":"ASSERTION","uid":"hu:assertion:xfx-cp-c-label-max-moiety","what":"MOIETY_EQUIVALENT_AMOUNT","opened":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0},"closed":null,"basis":null,"change":"OPENED"}
P-04b {"entityUid":"hu:substance:xfx-cp-sub-nrcl"} rows=8 {"chunkUid":"hu:chunk:xfx-cp-chunk-cz-sec6","linker":"entity-link/v1","linkScore":null,"assertionUid":"hu:assertion:xfx-cp-f-cz-purity","a.predicate":"ADMINISTERED_MATERIAL_PURITY","aboutX":false,"ev.role":"SUPPORTS","loc.exact":"The NR capsule consisted of 100 mg or 250 mg of NR chloride (99% purit
P-04e {"chunkUid":"hu:chunk:xfx-cp-chunk-cz-sec6"} rows=8 {"a.uid":"hu:assertion:xfx-cp-f-cz-qty","a.predicate":"QUANTITY","locatorUid":"hu:locator:xfx-cp-l-cz-arms","loc.selectorJson":"{\"basis\":\"raw-utf8-codepoints@1\",\"end\":30075,\"exact\":\"The 4 capsules amounted to a single dose of either placebo (a total of 4 placebo capsules) or 100 mg NR (1 ca
P-09 {"itemUid":"hu:product:xfx-cp-prod-tn"} rows=0 
P-10a {"missionId":"mission:ft-S-xfx-fixtures"} rows=24 {"act.runId":"run:ft-S-xfx-compound-ingest","act.activityKind":"INGESTION","label":"Activity","createdCount":3,"updatedCount":0}
P-10a.2 {"missionId":"mission:ft-S-xfx-fixtures"} rows=13 {"act.runId":"run:ft-S-xfx-compound-ingest","relType":"ADMINISTERS","edges":3}
P-10a.3 {"missionId":"mission:ft-S-xfx-fixtures"} rows=87 {"act.runId":"run:ft-S-xfx-compound-ingest","kind":"Assessment","out.uid":"hu:assessment:xfx-cp-r-mention-nrcl","subkind":"RESOLUTION"}
P-10a.4 {"missionId":"mission:ft-S-xfx-fixtures"} rows=3 {"runId":"run:ft-S-xfx-compound-projection","relType":"AFFECTS_MECHANISM","edges":1}
P-10b {"uid":"hu:substance:xfx-cp-sub-nr"} rows=2 {"act.missionId":"mission:ft-S-xfx-fixtures","act.runId":"run:ft-S-xfx-compound-ingest","act.activityKind":"INGESTION","act.startedAt":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0},"act.endedAt":null,"roles":["WROTE","ASSERTED_ABOUT"]}
P-10c {"missionId":"mission:ft-S-xfx-fixtures"} rows=0 
P-10c.2 {"missionId":"mission:ft-S-xfx-fixtures"} rows=1 {"relType":"AFFECTS_MECHANISM","edges":1}
P-10c.3 {"missionId":"mission:ft-S-xfx-fixtures"} rows=0 
P-10d {"r1":"run:ft-S-xfx-compound-ingest","r2":"run:ft-S-xfx-compound-verify"} rows=80 {"label":"Adjudication","n.uid":"hu:adjudication:xfx-cp-adj-a-sr-nad-d14","change":"CREATED","n.supersedesUid":null,"alsoWrittenByR1":false}
P-10d.2 {"r2":"run:ft-S-xfx-compound-ingest"} rows=39 {"relType":"STATED_IN","e.relationshipUid":"rel:xfx-cp-a-sr-ae-serious","state":"OPEN","e.recordedFrom":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0},"e.recordedTo":null}
P-10e {"uid":"hu:substance:xfx-cp-sub-nr"} rows=1 {"act.missionId":"mission:ft-S-xfx-fixtures","act.runId":"run:ft-S-xfx-compound-ingest","act.activityKind":"INGESTION","act.operationKind":null,"act.startedAt":{"year":2026,"month":10,"day":9,"hour":4,"minute":32,"second":44,"nanosecond":0,"timeZoneOffsetSeconds":0},"act.endedAt":null,"act.intentDig
P-12 {"startUid":"hu:material:xfx-cp-mat-niagen"} rows=1 {"startUid":"hu:material:xfx-cp-mat-niagen","via":"realizes+moiety","modulatorUid":"hu:substance:xfx-cp-sub-nr","modulator":"NICOTINAMIDE RIBOSIDE","mechanismUid":"hu:mechanism:xfx-cp-mech-deacetylation","mechanism":"protein deacetylation","am.direction":"NO_CHANGE","am.bestBasis":"DIRECT_MEASUREMEN
P-12 {"startUid":"hu:substance:xfx-cp-sub-nr"} rows=1 {"startUid":"hu:substance:xfx-cp-sub-nr","via":"self","modulatorUid":"hu:substance:xfx-cp-sub-nr","modulator":"NICOTINAMIDE RIBOSIDE","mechanismUid":"hu:mechanism:xfx-cp-mech-deacetylation","mechanism":"protein deacetylation","am.direction":"NO_CHANGE","am.bestBasis":"DIRECT_MEASUREMENT","am.humanMe
```

## Final validator run (E)

### validate-patterns.mjs output

```json
{
  "neo4j": "5.26.31 community",
  "ddlExecuted": 278,
  "ddlFailed": 0,
  "ddlDataConflicts": [
    "D-1#4: Neo.DatabaseError.Schema.ConstraintCreationFailed: Unable to create Constraint( name='identifier_key', type='UNIQUENESS', schema=(:Identifier {scheme, issuer, value}) ):"
  ],
  "nodesInDatabase": 681,
  "indexesAfterDdl": {
    "total": 279,
    "online": 279,
    "notOnline": []
  },
  "queryStatements": 39,
  "queryOk": 39,
  "gdsProjectionSources": 9,
  "gdsProjectionSourcesOk": 9,
  "gdsInputQueries": 1,
  "gdsInputQueriesOk": 1,
  "gdsCallsNotRun": 19,
  "failed": 0,
  "withAllNodesScan": [],
  "withCartesianProduct": [
    "P-10d",
    "G-0"
  ],
  "otherNotifications": [
    "P-10d: Neo.ClientNotification.Statement.CartesianProduct",
    "G-0: Neo.ClientNotification.Statement.CartesianProduct",
    "G-5: Neo.ClientNotification.Statement.CartesianProduct"
  ],
  "missingParams": [],
  "droppedAfterRun": 277,
  "kept": false
}
```

| statement | kind | result | plan operators | notes |
| --- | --- | --- | --- | --- |
| D-2#1 | ddl | ok |  |  |
| D-2#2 | ddl | ok |  |  |
| D-2#3 | ddl | ok |  |  |
| D-2#4 | ddl | ok |  |  |
| D-2#5 | ddl | ok |  |  |
| D-2#6 | ddl | ok |  |  |
| D-2#7 | ddl | ok |  |  |
| D-2#8 | ddl | ok |  |  |
| D-2#9 | ddl | ok |  |  |
| D-2#10 | ddl | ok |  |  |
| D-2#11 | ddl | ok |  |  |
| D-2#12 | ddl | ok |  |  |
| D-2#13 | ddl | ok |  |  |
| D-2#14 | ddl | ok |  |  |
| D-2#15 | ddl | ok |  |  |
| D-2#16 | ddl | ok |  |  |
| D-2#17 | ddl | ok |  |  |
| D-2#18 | ddl | ok |  |  |
| D-2#19 | ddl | ok |  |  |
| D-2#20 | ddl | ok |  |  |
| D-2#21 | ddl | ok |  |  |
| D-2#22 | ddl | ok |  |  |
| D-2#23 | ddl | ok |  |  |
| D-2#24 | ddl | ok |  |  |
| D-2#25 | ddl | ok |  |  |
| D-2#26 | ddl | ok |  |  |
| D-2#27 | ddl | ok |  |  |
| D-2#28 | ddl | ok |  |  |
| D-2#29 | ddl | ok |  |  |
| D-2#30 | ddl | ok |  |  |
| D-2#31 | ddl | ok |  |  |
| D-2#32 | ddl | ok |  |  |
| D-2#33 | ddl | ok |  |  |
| D-2#34 | ddl | ok |  |  |
| D-2#35 | ddl | ok |  |  |
| D-2#36 | ddl | ok |  |  |
| D-2#37 | ddl | ok |  |  |
| D-2#38 | ddl | ok |  |  |
| D-2#39 | ddl | ok |  |  |
| D-2#40 | ddl | ok |  |  |
| D-2#41 | ddl | ok |  |  |
| D-2#42 | ddl | ok |  |  |
| D-2#43 | ddl | ok |  |  |
| D-2#44 | ddl | ok |  |  |
| D-2#45 | ddl | ok |  |  |
| D-2#46 | ddl | ok |  |  |
| D-2#47 | ddl | ok |  |  |
| D-2#48 | ddl | ok |  |  |
| D-2#49 | ddl | ok |  |  |
| D-2#50 | ddl | ok |  |  |
| D-2#51 | ddl | ok |  |  |
| D-2#52 | ddl | ok |  |  |
| D-2#53 | ddl | ok |  |  |
| D-2#54 | ddl | ok |  |  |
| D-2#55 | ddl | ok |  |  |
| D-2#56 | ddl | ok |  |  |
| D-2#57 | ddl | ok |  |  |
| D-2#58 | ddl | ok |  |  |
| D-2#59 | ddl | ok |  |  |
| D-2#60 | ddl | ok |  |  |
| D-2#61 | ddl | ok |  |  |
| D-2#62 | ddl | ok |  |  |
| D-2#63 | ddl | ok |  |  |
| D-2#64 | ddl | ok |  |  |
| D-2#65 | ddl | ok |  |  |
| D-2#66 | ddl | ok |  |  |
| D-2#67 | ddl | ok |  |  |
| D-2#68 | ddl | ok |  |  |
| D-2#69 | ddl | ok |  |  |
| D-2#70 | ddl | ok |  |  |
| D-2#71 | ddl | ok |  |  |
| D-2#72 | ddl | ok |  |  |
| D-2#73 | ddl | ok |  |  |
| D-2#74 | ddl | ok |  |  |
| D-2#75 | ddl | ok |  |  |
| D-2#76 | ddl | ok |  |  |
| D-2#77 | ddl | ok |  |  |
| D-2#78 | ddl | ok |  |  |
| D-2#79 | ddl | ok |  |  |
| D-2#80 | ddl | ok |  |  |
| D-2#81 | ddl | ok |  |  |
| D-2#82 | ddl | ok |  |  |
| D-2#83 | ddl | ok |  |  |
| D-2#84 | ddl | ok |  |  |
| D-2#85 | ddl | ok |  |  |
| D-2#86 | ddl | ok |  |  |
| D-2#87 | ddl | ok |  |  |
| D-2#88 | ddl | ok |  |  |
| D-2#89 | ddl | ok |  |  |
| D-2#90 | ddl | ok |  |  |
| D-2#91 | ddl | ok |  |  |
| D-2#92 | ddl | ok |  |  |
| D-2#93 | ddl | ok |  |  |
| D-2#94 | ddl | ok |  |  |
| D-2#95 | ddl | ok |  |  |
| D-2#96 | ddl | ok |  |  |
| D-2#97 | ddl | ok |  |  |
| D-2#98 | ddl | ok |  |  |
| D-2#99 | ddl | ok |  |  |
| D-2#100 | ddl | ok |  |  |
| D-2#101 | ddl | ok |  |  |
| D-2#102 | ddl | ok |  |  |
| D-2#103 | ddl | ok |  |  |
| D-2#104 | ddl | ok |  |  |
| D-2#105 | ddl | ok |  |  |
| D-2#106 | ddl | ok |  |  |
| D-2#107 | ddl | ok |  |  |
| D-2#108 | ddl | ok |  |  |
| D-2#109 | ddl | ok |  |  |
| D-2#110 | ddl | ok |  |  |
| D-2#111 | ddl | ok |  |  |
| D-2#112 | ddl | ok |  |  |
| D-2#113 | ddl | ok |  |  |
| D-2#114 | ddl | ok |  |  |
| D-2#115 | ddl | ok |  |  |
| D-2#116 | ddl | ok |  |  |
| D-2#117 | ddl | ok |  |  |
| D-2#118 | ddl | ok |  |  |
| D-2#119 | ddl | ok |  |  |
| D-2#120 | ddl | ok |  |  |
| D-2#121 | ddl | ok |  |  |
| D-2#122 | ddl | ok |  |  |
| D-2#123 | ddl | ok |  |  |
| D-2#124 | ddl | ok |  |  |
| D-2#125 | ddl | ok |  |  |
| D-2#126 | ddl | ok |  |  |
| D-2#127 | ddl | ok |  |  |
| D-2#128 | ddl | ok |  |  |
| D-2#129 | ddl | ok |  |  |
| D-2#130 | ddl | ok |  |  |
| D-2#131 | ddl | ok |  |  |
| D-2#132 | ddl | ok |  |  |
| D-2#133 | ddl | ok |  |  |
| D-2#134 | ddl | ok |  |  |
| D-2#135 | ddl | ok |  |  |
| D-2#136 | ddl | ok |  |  |
| D-2#137 | ddl | ok |  |  |
| D-2#138 | ddl | ok |  |  |
| D-2#139 | ddl | ok |  |  |
| D-2#140 | ddl | ok |  |  |
| D-2#141 | ddl | ok |  |  |
| D-2#142 | ddl | ok |  |  |
| D-2#143 | ddl | ok |  |  |
| D-2#144 | ddl | ok |  |  |
| D-2#145 | ddl | ok |  |  |
| D-2#146 | ddl | ok |  |  |
| D-2#147 | ddl | ok |  |  |
| D-2#148 | ddl | ok |  |  |
| D-2#149 | ddl | ok |  |  |
| D-2#150 | ddl | ok |  |  |
| D-2#151 | ddl | ok |  |  |
| D-2#152 | ddl | ok |  |  |
| D-2#153 | ddl | ok |  |  |
| D-2#154 | ddl | ok |  |  |
| D-2#155 | ddl | ok |  |  |
| D-2#156 | ddl | ok |  |  |
| D-2#157 | ddl | ok |  |  |
| D-2#158 | ddl | ok |  |  |
| D-2#159 | ddl | ok |  |  |
| D-2#160 | ddl | ok |  |  |
| D-2#161 | ddl | ok |  |  |
| D-2#162 | ddl | ok |  |  |
| D-2#163 | ddl | ok |  |  |
| D-2#164 | ddl | ok |  |  |
| D-2#165 | ddl | ok |  |  |
| D-2#166 | ddl | ok |  |  |
| D-2#167 | ddl | ok |  |  |
| D-2#168 | ddl | ok |  |  |
| D-2#169 | ddl | ok |  |  |
| D-2#170 | ddl | ok |  |  |
| D-2#171 | ddl | ok |  |  |
| D-2#172 | ddl | ok |  |  |
| D-2#173 | ddl | ok |  |  |
| D-2#174 | ddl | ok |  |  |
| D-2#175 | ddl | ok |  |  |
| D-2#176 | ddl | ok |  |  |
| D-2#177 | ddl | ok |  |  |
| D-2#178 | ddl | ok |  |  |
| D-2#179 | ddl | ok |  |  |
| D-2#180 | ddl | ok |  |  |
| D-2#181 | ddl | ok |  |  |
| D-2#182 | ddl | ok |  |  |
| D-2#183 | ddl | ok |  |  |
| D-2#184 | ddl | ok |  |  |
| D-2#185 | ddl | ok |  |  |
| D-2#186 | ddl | ok |  |  |
| D-2#187 | ddl | ok |  |  |
| D-2#188 | ddl | ok |  |  |
| D-2#189 | ddl | ok |  |  |
| D-2#190 | ddl | ok |  |  |
| D-2#191 | ddl | ok |  |  |
| D-2#192 | ddl | ok |  |  |
| D-2#193 | ddl | ok |  |  |
| D-2#194 | ddl | ok |  |  |
| D-2#195 | ddl | ok |  |  |
| D-2#196 | ddl | ok |  |  |
| D-2#197 | ddl | ok |  |  |
| D-2#198 | ddl | ok |  |  |
| D-2#199 | ddl | ok |  |  |
| D-2#200 | ddl | ok |  |  |
| D-2#201 | ddl | ok |  |  |
| D-2#202 | ddl | ok |  |  |
| D-2#203 | ddl | ok |  |  |
| D-2#204 | ddl | ok |  |  |
| D-2#205 | ddl | ok |  |  |
| D-2#206 | ddl | ok |  |  |
| D-2#207 | ddl | ok |  |  |
| D-2#208 | ddl | ok |  |  |
| D-2#209 | ddl | ok |  |  |
| D-2#210 | ddl | ok |  |  |
| D-2#211 | ddl | ok |  |  |
| D-2#212 | ddl | ok |  |  |
| D-2#213 | ddl | ok |  |  |
| D-2#214 | ddl | ok |  |  |
| D-2#215 | ddl | ok |  |  |
| D-2#216 | ddl | ok |  |  |
| D-2#217 | ddl | ok |  |  |
| D-2#218 | ddl | ok |  |  |
| D-2#219 | ddl | ok |  |  |
| D-2#220 | ddl | ok |  |  |
| D-2#221 | ddl | ok |  |  |
| D-2#222 | ddl | ok |  |  |
| D-2#223 | ddl | ok |  |  |
| D-2#224 | ddl | ok |  |  |
| D-2#225 | ddl | ok |  |  |
| D-2#226 | ddl | ok |  |  |
| D-2#227 | ddl | ok |  |  |
| D-2#228 | ddl | ok |  |  |
| D-2#229 | ddl | ok |  |  |
| D-1#1 | ddl | ok |  |  |
| D-1#2 | ddl | ok |  |  |
| D-1#3 | ddl | ok |  |  |
| D-1#4 | ddl | DATA CONFLICT Neo.DatabaseError.Schema.ConstraintCreationFailed: Unable to create Constraint( name='identifier_key', type='UNIQUENESS', schema=(:Identifier {scheme, issuer, value}) ): |  |  |
| D-1#5 | ddl | ok |  |  |
| D-1#6 | ddl | ok |  |  |
| D-1#7 | ddl | ok |  |  |
| D-1#8 | ddl | ok |  |  |
| D-1#9 | ddl | ok |  |  |
| D-1#10 | ddl | ok |  |  |
| D-1#11 | ddl | ok |  |  |
| D-1#12 | ddl | ok |  |  |
| D-1#13 | ddl | ok |  |  |
| D-1#14 | ddl | ok |  |  |
| D-1#15 | ddl | ok |  |  |
| D-1#16 | ddl | ok |  |  |
| D-1#17 | ddl | ok |  |  |
| D-1#18 | ddl | ok |  |  |
| D-1#19 | ddl | ok |  |  |
| D-1#20 | ddl | ok |  |  |
| D-1#21 | ddl | ok |  |  |
| D-1#22 | ddl | ok |  |  |
| D-1#23 | ddl | ok |  |  |
| D-1#24 | ddl | ok |  |  |
| D-1#25 | ddl | ok |  |  |
| D-1#26 | ddl | ok |  |  |
| D-1#27 | ddl | ok |  |  |
| D-1#28 | ddl | ok |  |  |
| D-1#29 | ddl | ok |  |  |
| D-1#30 | ddl | ok |  |  |
| D-1#31 | ddl | ok |  |  |
| D-1#32 | ddl | ok |  |  |
| D-3#1 | ddl | ok |  |  |
| D-3#2 | ddl | ok |  |  |
| D-3#3 | ddl | ok |  |  |
| D-3#4 | ddl | ok |  |  |
| D-3#5 | ddl | ok |  |  |
| D-3#6 | ddl | ok |  |  |
| D-3#7 | ddl | ok |  |  |
| D-3#8 | ddl | ok |  |  |
| D-3#9 | ddl | ok |  |  |
| D-3#10 | ddl | ok |  |  |
| D-3#11 | ddl | ok |  |  |
| D-3#12 | ddl | ok |  |  |
| D-3#13 | ddl | ok |  |  |
| D-3#14 | ddl | ok |  |  |
| D-4#1 | ddl | ok |  |  |
| D-4#2 | ddl | ok |  |  |
| D-4#3 | ddl | ok |  |  |
| P-01a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, Apply, OptionalExpand(All), NodeUniqueIndexSeek, Distinct, Union, Filter, VarLengthExpand(Pruning,BFS,All), Argument, Expand(All), LetSemiApply, Expand(Into) | 6 token warnings |
| P-01b | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, OptionalExpand(All), Filter, Expand(All), NodeUniqueIndexSeek, Argument | 2 token warnings |
| P-01c | query | ok | ProduceResults, Projection, CacheProperties, Limit, Filter, LetAntiSemiApply, LetSemiApply, NodeByLabelScan, Expand(All), Argument | 1 token warnings |
| P-02a | query | ok | ProduceResults, Projection, CacheProperties, Top, Filter, Expand(All), NodeUniqueIndexSeek |  |
| P-02b | query | ok | ProduceResults, Projection, CacheProperties, Top, Filter, Expand(All), NodeUniqueIndexSeek |  |
| P-02c | query | ok | ProduceResults, Projection, CacheProperties, NodeUniqueIndexSeek |  |
| P-02d | query | ok | ProduceResults, Projection, Sort, Apply, NodeUniqueIndexSeek, Distinct, Union, CacheProperties, Filter, Expand(All), Argument |  |
| P-02e | query | ok | ProduceResults, Projection, CacheProperties, Sort, Filter, Expand(All), NodeUniqueIndexSeek |  |
| P-03 | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, Filter, Expand(All), NodeUniqueIndexSeek, Argument | 1 token warnings |
| P-04a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, Filter, Expand(All), SemiApply, ProcedureCall, Expand(Into), Argument | 3 token warnings |
| P-04b | query | ok | ProduceResults, Projection, CacheProperties, Sort, LetSemiApply, Filter, Expand(All), Top, NodeUniqueIndexSeek, Expand(Into), Argument | 2 token warnings |
| P-04c | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(All), Top, ProcedureCall |  |
| P-04d | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(All), NodeUniqueIndexSeek | 3 token warnings |
| P-04e | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(All), NodeUniqueIndexSeek |  |
| P-05a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, PartialSort, Unwind, Apply, EagerAggregation, Filter, NodeIndexSeek, NodeUniqueIndexSeek, Expand(All), Argument | 5 token warnings |
| P-05b | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, OptionalExpand(All), Filter, AntiSemiApply, Expand(All), NodeUniqueIndexSeek, NodeIndexSeek, Argument |  |
| P-05c | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, OptionalExpand(All), Expand(All), Filter, NodeUniqueIndexSeek, Argument |  |
| P-06a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, OptionalExpand(All), Filter, Expand(All), SemiApply, Distinct, Union, NodeIndexSeek, NodeUniqueIndexSeek, Argument, Expand(Into) | 2 token warnings |
| P-06b | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Limit, Filter, Expand(All), Distinct, Union, NodeIndexSeek, NodeUniqueIndexSeek, Argument | 9 token warnings |
| P-07 | query | ok | ProduceResults, Projection, CacheProperties, Top, EagerAggregation, Apply, Distinct, Union, NodeIndexSeek, NodeUniqueIndexSeek, Expand(All), Filter, Argument | 5 token warnings |
| P-08a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, Filter, Expand(All), Distinct, Union, NodeIndexSeek, NodeUniqueIndexSeek, Argument | 3 token warnings |
| P-08b | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, EagerAggregation, Sort, Filter, Expand(All), NodeUniqueIndexSeek, Expand(Into), Argument | 1 token warnings |
| P-08c | query | ok | ProduceResults, Projection, Top, Filter, VarLengthExpand(All), NodeUniqueIndexSeek |  |
| P-09 | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, Filter, Expand(All), OptionalExpand(All), NodeUniqueIndexSeek, Distinct, Union, Argument, Apply, Repeat(Trail), Optional, SemiApply, Expand(Into) | 2 token warnings |
| P-10a | query | ok | ProduceResults, PartialSort, OrderedAggregation, LetAntiSemiApply, Expand(All), CacheProperties, Sort, Projection, NodeIndexSeek, Filter, Argument |  |
| P-10a.2 | query | ok | ProduceResults, Sort, EagerAggregation, Filter, Expand(Into), Expand(All), NodeIndexSeek |  |
| P-10a.3 | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(All), NodeIndexSeek |  |
| P-10a.4 | query | ok | ProduceResults, EagerAggregation, Apply, NodeIndexSeek, Distinct, CacheProperties, Union, DirectedRelationshipIndexSeek |  |
| P-10b | query | ok | ProduceResults, Sort, EagerAggregation, CacheProperties, Apply, NodeUniqueIndexSeek, Distinct, Union, Projection, Filter, Expand(All), Argument, NodeIndexSeek |  |
| P-10c | query | ok | ProduceResults, Top, EagerAggregation, CacheProperties, Filter, VarLengthExpand(All), Unwind, Apply, Expand(All), NodeIndexSeek, Projection, Argument |  |
| P-10c.2 | query | ok | ProduceResults, EagerAggregation, Filter, Apply, Expand(All), NodeIndexSeek, DirectedUnionRelationshipTypesScan | 1 token warnings |
| P-10c.3 | query | ok | ProduceResults, Sort, EagerAggregation, CacheProperties, Filter, VarLengthExpand(Pruning,BFS,All), NodeIndexSeek |  |
| P-10d | query | ok | ProduceResults, Projection, CacheProperties, LetSemiApply, Sort, LetAntiSemiApply, CartesianProduct, NodeIndexSeek, Expand(All), Filter, Argument, Expand(Into) | Neo.ClientNotification.Statement.CartesianProduct |
| P-10d.2 | query | ok | ProduceResults, Projection, CacheProperties, Filter, Expand(Into), Expand(All), NodeIndexSeek |  |
| P-10e | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, Filter, Expand(All), NodeUniqueIndexSeek, Argument | 6 token warnings |
| P-11a | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Sort, Apply, NodeUniqueIndexSeek, Distinct, Union, Argument, NodeIndexSeek, OptionalExpand(All), Optional, Expand(Into), Filter, Expand(All) | 5 token warnings |
| P-11b | query | ok | ProduceResults, Projection, CacheProperties, Top, Apply, Filter, AntiSemiApply, Expand(All), NodeIndexScan, Expand(Into), NodeIndexSeek, EagerAggregation, Argument | 1 token warnings |
| P-12 | query | ok | ProduceResults, Projection, CacheProperties, RollUpApply, Top, Apply, Filter, Expand(All), NodeUniqueIndexSeek, Distinct, Union, Argument, Unwind, Optional, OptionalExpand(All) | 5 token warnings |
| G-0 | query | ok | ProduceResults, EmptyResult, Create, Apply, Unwind, SetProperty, Eager, Filter, NodeIndexSeek, CartesianProduct, NodeUniqueIndexSeek(Locking), Optional, Expand(Into) | Neo.ClientNotification.Statement.CartesianProduct |
| G-1 | gds-input | ok | ProduceResults, Projection, Filter, EagerAggregation, Expand(All), NodeIndexSeek |  |
| G-2 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), NodeIndexSeek |  |
| G-2#2 | gds-call | not run (GDS) |  |  |
| G-2#3 | gds-call | not run (GDS) |  |  |
| G-3 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), NodeUniqueIndexSeek |  |
| G-3#2 | gds-call | not run (GDS) |  |  |
| G-3#3 | gds-call | not run (GDS) |  |  |
| G-4 | gds-projection-source | ok | ProduceResults, Projection, Apply, EagerAggregation, Filter, Expand(All), NodeUniqueIndexSeek, Distinct, Union, Unwind, Argument |  |
| G-4#2 | gds-call | not run (GDS) |  |  |
| G-4#3 | gds-call | not run (GDS) |  |  |
| G-5 | gds-projection-source | ok | ProduceResults, Projection, EagerAggregation, Filter, Expand(All), SemiApply, NodeIndexSeekByRange, SelectOrSemiApply, LetSemiApply, Argument, Expand(Into), NodeUniqueIndexSeek, NodeHashJoin | 1 token warnings; Neo.ClientNotification.Statement.CartesianProduct |
| G-5#2 | gds-call | not run (GDS) |  |  |
| G-5#3 | gds-call | not run (GDS) |  |  |
| G-6 | gds-projection-source | ok | ProduceResults, Projection, OrderedDistinct, Filter, Expand(All), NodeByLabelScan |  |
| G-6#2 | gds-call | not run (GDS) |  |  |
| G-6#3 | gds-call | not run (GDS) |  |  |
| G-7 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), NodeByLabelScan | 1 token warnings |
| G-7#2 | gds-call | not run (GDS) |  |  |
| G-7#3 | gds-call | not run (GDS) |  |  |
| G-8 | gds-projection-source | ok | ProduceResults, Projection, Unwind, EagerAggregation, Filter, Expand(All), NodeByLabelScan | 1 token warnings |
| G-8#2 | gds-call | not run (GDS) |  |  |
| G-8#3 | gds-call | not run (GDS) |  |  |
| G-9 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), DirectedRelationshipTypeScan | 2 token warnings |
| G-9#2 | gds-call | not run (GDS) |  |  |
| G-9#3 | gds-call | not run (GDS) |  |  |
| G-10 | gds-projection-source | ok | ProduceResults, Projection, Filter, Expand(All), NodeByLabelScan |  |
| G-10#2 | gds-call | not run (GDS) |  |  |
| G-10#3 | gds-call | not run (GDS) |  |  |
| G-10#4 | gds-call | not run (GDS) |  |  |

---

<!-- stage: _runlog/fixtures.md -->

# Runlog: fixtures stage (fixture curator, S team), 2026-10-09

- **Worktree:** `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Nothing committed; the coordinator commits. Commands run from the worktree root in Git Bash unless noted.
- `$F` = `schema/program/final`; `$SP` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/fixtures`.
- **Writes:** `$F/fixtures/{K,D1..D13}/` (75 copied folders), `$F/fixtures/README.md`, `$F/_work/repath-fixtures.mjs`, `$F/_work/validate-intents.mjs`, `$F/_work/plan-candidate.mjs`, their outputs `$F/_work/{repath-manifest,intent-validation,plan-candidate-results,register-fixture-check}.json`, and this file. Scratch only under `$SP`. No packet, `workspace/`, `scripts/`, `packages/` or `schema/pinned` file was touched; `$F/fixtures/cross-domain/` (another S agent) was not touched. `.env` was never read or printed; NEO4J_* were set explicitly on each command, pointing at the disposable container.

## 1. Inputs

```
git status --short | head; git log --oneline -3          → HEAD e484fd2; packets staged ("A"); final/ untracked
find schema/program/packets -path '*07-fixtures*' -maxdepth 3 -type d | sort
  → 75 fixture folders (K 6, D1 5, D2 5, D3 3, D4 7, D5 4, D6 7, D7 6, D8 6, D9 6, D10 5, D11 5, D12 5, D13 5)
find … -type f | sed 's#.*/##' | sort | uniq -c
  → 75 each of assertions.yaml, intent.json, locators.yaml, questions.md, source.md; plus intent-r2.json, intent-step2.json,
    lineage-index.yaml, 2 directive-3.8-walk.yaml, 7 composed-body*.txt, 1 extract_text_version.py
cat fast-track/03-SYNTHESIS.md                             → step 8 wording; fixtures deliverable
sed -n 150,420p $F/_work/rulings.yaml                      → op counts: 12 edit-fixture, 11 rename-predicate, 21 remove-predicate, 7 remove-enum, 1 rename-field, 5 retype-field
grep fixture-handoff lines in $F/_runlog/module-*.md        → D1, D2, D3, D4, D5, D6, D8, D9, D10, D11, D12, D13 hand fixture edits to this stage
```

Vocabulary diff, packet SDL vs candidate SDL (`$SP/diff.mjs`, graphql parse of each `04-schema-proposal.graphql` against `final_biotech_schema_v2.graphql`):
```
final: 69 nodes 106 rels 193 enums 20 edgeProps
types gone: K StateEpisodeProperties; D2 MechanismDirection; D3 QuantityBasis, PublicationRevisionStatus; D5 DosePeriod, ThresholdComparator;
            D8 SpecComparator, QualityResultFor, PatentTopic; D13 ApprovalPathway, DesignationType
relationship types gone: none; enum values gone: EventKind.PUBLICATION, EventRole.AUTHOR, EventRole.PUBLISHER
```
Retired-name scan over the fixtures' assertions.yaml + intent*.json (grep, before renaming), non-zero hits only:
StateEpisodeProperties 5, QuantityBasis 1 (comment), MANUFACTURER_STATEMENT 3, PROTOCOL_AUTHORED_BY 6, PREPARED_WITH 3, DECLARES_NO_COMPETING_INTEREST 2, COMPETING_INTEREST_STATED 3, FUNDER_ROLE_STATEMENT 3, SAMPLE_POSITIVE_OUTBREAK_STRAIN 9, DERIVED_FROM_TAXON 13 (D1 only: stays, D1 typed edge), `D8.<NAME>` 42, RESULT_FOR 49 (D12 acrylamide = D8 edge; D3 fixtures = D3's own type), NORMALIZED_TEXT 49, EXTRACTOR_TEXT 7, EXTRACTED_TEXT_BYTES 6, `currency` 10 (prose + `Award.currency`, a kept node property), roleTitleVerbatim 45, stakeClassVerbatim 38, declaredNameVerbatim 86, formVerbatim 16, statementVerbatim 9, nNoChangeContexts 9, Mention 22, PUBLISHER 4, AUTHOR 16 (D13 EventRole; D9 hits are `appearanceRole: AUTHOR`, a different enum), NOT_LESS_THAN 4, NOT_MORE_THAN 2.
Module-qualified type references whose owner moved (`$SP/owners.mjs scan`): none. Type names unknown to the candidate (`$SP/unknown.mjs`): Mention (D11 nr-chloride), StateEpisodeProperties (2).
Enum value checks: MechanismDirection INCREASES/DECREASES → EstimateDirection INCREASED/DECREASED; ThresholdComparator, QuantityBasis, DosePeriod values are subsets of QuantityComparator / AmountBasis; PublicationRevisionStatus {NONE_KNOWN, CORRECTED, EXPRESSION_OF_CONCERN, RETRACTED, WITHDRAWN} vs SourceRevisionKind (nullable); D13 madrigal-pdufa valueString PRIORITY_REVIEW / ACCELERATED → US_PRIORITY_REVIEW / US_ACCELERATED_APPROVAL (OQ-D8-02 mapping in packets/D8/11-open-questions.md).

## 2. Re-path + renames

```
node schema/program/final/_work/repath-fixtures.mjs
→ {"ok": true, "fixtures": 75, "files": 388, "byteIdentical": 265, "pathOnly": 58, "renamed": 65,
   "renameApplications": 192, "pathApplications": 90, "violations": []}
```
Path rewrites: `../../<file>` → `../../../../packets/<P>/<file>` 49; `packets/<P>/04-schema-proposal.graphql` → `final/schema/<module>.graphql` 16; `../../04-schema-proposal.graphql` → `../../../schema/<module>.graphql` 1; `packets/<P>/07-fixtures/` → `final/fixtures/<P>/` 22; `../../../D2/07-fixtures/` → `../../D2/` 1; packet-relative `07-fixtures/` 1. A first run rewrote `../../../D2/…` twice; the `../../<file>` rule was fixed with a `(K|D\d+)/` lookahead before the counted run.
Renames applied (ruling: count): R-68 MANUFACTURER_UNNAMED 3; R-80 AUTHORED_BY 6; R-62 HAS_RECIPE_INGREDIENT 3; R-73 SAMPLE_TESTED_POSITIVE_FOR 9; R-82 DISCLOSES_INTEREST 5, FUNDED_BY 3; R-52 D8. prefix dropped 42; R-53 QUALITY_RESULT_FOR 7 (D12 acrylamide only); R-10 AssertedEdgeProperties 5; R-58 "D3 QuantityBasis" → "D6 AmountBasis" 1; R-35 CANONICAL_PROJECTION 49, TOOL_RENDITION 13; R-57 GTE 4, LTE 2; R-59 DECREASED 3; R-44 RETRACTION 19, NONE_KNOWN → null 10; R-66 US_PRIORITY_REVIEW 5, US_ACCELERATED_APPROVAL 3. Zero-hit rules are kept in the table for completeness. The R-44 value rules were added after the planner run showed `invalid SourceRevisionKind value "RETRACTED"` (9 subjects) and `"NONE_KNOWN"` (5); the repath was re-run.

Checks of the copy:
```
diff -r packets/<P>/07-fixtures final/fixtures/<P>   (all 14)           → only path lines and rename lines differ (reviewed)
node -e <compare every locator's quote/prefix/suffix/offsets/properties and every snapshot contentHash, packet vs final intents>
→ { locators: 1648, quoteOrOffsetDiffs: 0, locatorPropertyDiffs: 0 }; no contentHash differs
node -e <manifest: non-text files; source.md + locators.yaml>
→ non-text files 8, byte-identical 8; source/locators 150: byte-identical 129, path-only 21, renamed 0
grep rewritten ../../../../packets/... paths from every final fixture folder; [ -e ] each   → none missing; ../../D2/nr-muscle-unstructured exists
```

## 3. Intent validation (structural)

```
node schema/program/final/_work/validate-intents.mjs
→ final:     77 files, zod valid 77 / invalid 0, JSON Schema valid 77 / invalid 0, proposals 1318
  originals: 77 files, zod valid 77 / invalid 0, JSON Schema valid 77 / invalid 0, proposals 1318
  fixtures with an intent 75 (0 without); kinds edge.assert 547, assertion.literal 306, edge.structural 305,
  identifier.attach 65, node.upsert 55, mention.stage 21, state.attach 17, edge.close 2
```
zod = `IngestionIntent.safeParse` from `packages/contracts/dist`; JSON Schema = Ajv 2020-12 (ajv@8.20.0) over `packages/contracts/json-schema/biotech-knowledge-intent.v1.json` with ajv-formats@3.0.1 (the first run without formats printed "unknown format date-time ignored"; re-run with formats, same counts).

## 4. Planner check (03-SYNTHESIS step 8)

Source read: `packages/kg-ops/src/cli.ts` (`kg plan` → `planIntent(connect(), SchemaModel.fromWorkspace(), …)`), `plan.ts` (creation gate `allowedMutations.create`, `schema.uidToken`, `registeredPredicates` from `ir.params`, `schema.node("Mention")` in mention.stage, StateEpisodeProperties / VersionedState in state.attach, `mongoResearchRunId` and `SUPPORTED_BY` in emitted Cypher), `schema-access.ts`, `neo4j.ts`, `packages/schema-workspace/src/load.ts` (`defaultWorkspaceDir = <repo>/workspace`, pinned dir).

```
docker ps | grep neo4j           → bks-neo4j-synth Up, 0.0.0.0:7691->7687
cypher-shell "MATCH (n) RETURN count(n)"   → 0 (at the start of this stage)
NEO4J_URI=bolt://localhost:7691 NEO4J_USERNAME=neo4j NEO4J_PASSWORD=*** NEO4J_DATABASE=neo4j node packages/kg-ops/dist/cli.js ping
→ ok, Neo4j/5.26.31, schemaDigest sha256:8313a6f83a2429fffdc9ce6cbdb03cc2808c7b06022040a1e4f36cd2720ae3eb (pinned)
… BKS_RUNS_DIR=$SP/runs node packages/kg-ops/dist/cli.js kg plan $F/fixtures/K/resveratrol-identifier-crosswalk/intent.json --out $SP/cli-plan-K_resveratrol-identifier-crosswalk.json
→ exit 1; plan outcome rejected, schemaDigest sha256:8313a6f8… (pinned); errors INVALID_SOURCE_KIND ("API" not in pinned SourceKind), INVALID_SELECTOR_KIND …
… node packages/kg-ops/dist/cli.js kg plan $F/fixtures/D6/recall-moringa-mogo/intent.json --out $SP/cli-plan-D6_recall-moringa-mogo.json
→ exit 1; {"code":"ERROR","message":"Cannot run query in this transaction, because it has been rolled back …"}
node $SP/pinned-debug.mjs <crosswalk intent>   (wraps tx.run to print the first failure)
→ Neo.ClientError.Procedure.ProcedureCallFailed: There is no such fulltext schema index: CompoundSearch (db.index.fulltext.queryNodes)
```
`kg ensure-operations` was not run: it would write the pinned operations file into the shared disposable database.

In-process harness (no change under packages/): `final/_work/plan-candidate.mjs` imports `planIntent`, `SchemaModel`, `GraphClient` from `packages/kg-ops/dist` and plans every final intent under three models: pinned (`SchemaModel.fromWorkspace()`), candidate (`new SchemaModel(final_biotech_schema_v2.ir.json, loadSidecars(), …)`), candidate+shims (all node types creatable; 20 uid tokens from `final/node-register.yaml`). Iterations: run 1 exposed TYPE_NOT_CREATABLE everywhere; run 2 added the shims (54 types say `create` in the register's `mutations.executor`; 15 D3/D7/D9 entries say `{create:false…}` or `unstated` and stayed blocked); run 3 shimmed all 69; later runs added reason details, statement-token counts, the R-44 value renames, and the graph-state record. Two harness edits through shell heredocs lost backslashes in regexes (one run threw on every intent: ReferenceError); fixed with the Edit tool and re-run.

Final run:
```
NEO4J_URI=bolt://localhost:7691 NEO4J_USERNAME=neo4j NEO4J_PASSWORD=*** NEO4J_DATABASE=neo4j node schema/program/final/_work/plan-candidate.mjs
→ graphAtStart {"nodes": 681, "xfxUidNodes": 354}   (written meanwhile by the cross-domain fixture agent; was 0 at stage start)
  pinned            {"threw": 76, "rejected": 1}
  candidate         {"rejected": 63, "threw": 14}   proposals rejected 1067; subjects conflict 791 (TYPE_NOT_CREATABLE), missing 90; no-uid-token rows 90
  candidate+shims   {"rejected": 47, "threw": 17, "partial": 12, "applicable": 1}
                    proposals admitted 324 / held 374 / rejected 330 / no_op_duplicate 1; 1711 statements:
                    mongoResearchRunId 1182, SUPPORTED_BY 149, agentRunUid 149, WAS_GENERATED_BY 665, HAS_EVIDENCE 0, lastWriterRunId 0
                    26 subject rows matched xfx nodes (23 MATCH_ADOPTED, 3 MATCH_REVIEW); 0 for the unshimmed candidate
  threw: UNKNOWN_NODE_TYPE Mention 14 intents (P8); TypeError reading 'isList' 3 intents (assertion.literal quantityBasis/massBasis/amountReferent; candidate Assertion lacks them)
  errors: INVALID_ACTIVITY_KIND 31 (P3), INVALID_SOURCE_PROPERTY Source.tool 29
  subjects: create 456, review_required 255, use_existing 23, conflict 23, missing 89 (REQUIRED_PROPERTY_MISSING 271, INVALID_PROPERTY 23, SUBJECT_UNKNOWN 89)
  proposal reasons: SUBJECT_REVIEW_REQUIRED 371, SUBJECT_MISSING 156, SUBJECT_CONFLICT 53, LITERAL_VALUE_REQUIRED 35, RELATIONSHIP_NOT_IN_SCHEMA 31,
                    RELATIONSHIP_ENDPOINTS_INVALID 31 (HAS_IDENTIFIER, P6), UNREGISTERED_PREDICATE 29 (20 of 23 names registered in the candidate register),
                    INVALID_EDGE_PROPERTY 21 (R-30 verbatim fields), STATE_TARGET_NOT_VERSIONED 10, ASSERTION_REQUIRED (RENDITION_OF) 1, EPISODE_NOT_FOUND 2
cypher-shell "MATCH (n) RETURN count(n)"   → 681 after the run (unchanged by planning; read transactions only)
```
Mapping to K's executor list (packets/K/11-open-questions.md P1–P21) and new needs N1–N6: in `final/fixtures/README.md`, section "Planner check". Exercised and confirmed: P1, P3, P4, P5, P6, P8. New (not in P1–P21): N1 re-pin workspace/sidecars/params or a schema-IR option, N2 creatability from the register (R-03), N3 uid tokens from the register, N4 state.attach without VersionedState/StateEpisodeProperties (R-10), N5 candidate predicate registry (R-52), N6 assertion.literal basis fields → qualifiers (crash guard). Contract gaps (R-40): object-valued predicate-only assertions, multi-value / value-less literals.

## 5. Index and register check

```
node schema/program/final/_work/repath-fixtures.mjs --index   (and --index-only after each validation/planner re-run)
→ {"ok": true, "readme": "final/fixtures/README.md", "fixtures": 75, "registerEntries": 109, "levels": {"TYPE": 108, "ABSENT": 1}, "violations": 1, "validation": true, "plan": true}
```
- Index: kinds other 24, harm 20, disconfirmation 16, unstructured-to-entity 14, reliability-gap 1; 296 distinct question ids; 106 of 106 candidate relationship types named by at least one fixture.
- Register check: every `fixture` path in `final/relationship-register.yaml` exists (109 of 109). 108 entries name their type in a non-comment line of the fixture's assertions.yaml. **Violation:** D3 RENDITION_OF (K.Source → Publication), fixture `K/resveratrol-sirt1-evidence-mission`, type absent. `grep -rlE RENDITION_OF final/fixtures/*/*/{assertions.yaml,intent*.json}` → 6 D9 fixtures (Source → MediaWork) and D11/sirolimus-spl-boxed-warning (a prose note); K questions.md Q-K-21 row says no K fixture writes RENDITION_OF. Q-K-21 and CQ-EV-05 are value 1 (02-questions tables) → R-06 needs a fixture or a numbered request.
- Pair heuristic (both endpoint types named within ±8 lines of the type): 93 of 108; the 15 others are listed in the README for a hand check (refs instead of type names, not necessarily wrong).
- Residual scan and pending edits per fixture: README table (54 fixture rows).

## Not done here

- Structural `edit-fixture` rulings (R-15, R-16, R-21, R-23, R-26/R-25, R-30, R-43, R-44 row drops / REVISES, R-49, R-55, R-58, R-73 acrylamide, R-82, R-85) — listed per fixture, not applied (renames only).
- The three cross-domain fixtures (`final/fixtures/cross-domain/`, another S agent).
- `final/requests.md` entry for the RENDITION_OF → Publication pair (coordinator).

---

<!-- stage: _runlog/xfx-compound.md -->

# Runlog: cross-domain fixture 1, compound profile (xfx-compound)

Stage: S, cross-domain fixture 1 (D1+D2+D3+D6). Agent: claude-opus-5-5 (S sub-agent). Date: 2026-10-09 (UTC).
Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. I wrote only under
`schema/program/final/fixtures/cross-domain/compound-profile/` and this runlog. Scratch is
`C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/xfx-compound/`
(`$SCR` below). Raw captures are in `$SCR/fresh/` and the build scripts in `$SCR/`; neither is committed. No `.env` value was read or printed.
Nothing was committed.

Output: `final/fixtures/cross-domain/compound-profile/` with `source.md`, `locators.yaml`, `assertions.yaml`, `intent.json`, `questions.md` and `walk.md`.

## 1. Inputs read

- `schema/program/fast-track/03-SYNTHESIS.md`: deliverables, and step 8 (fixtures; the planner check "where feasible").
- `final/schema-map.md` totals: 69 node types, 106 relationship types, 848 expanded pairs, 16 unions.
- `final/_work/rulings.yaml`, the rulings relied on:
  - R-14 node values are caches of FIELD Assertions;
  - R-15 a Publication may be the asserter;
  - R-16 asserter defaults;
  - R-22 one episode per asserter;
  - R-26 structural vs asserted;
  - R-27 MENTIONS are retrieval only;
  - R-42 identifier uniqueness;
  - R-47 AFFECTS_MECHANISM score null;
  - R-52 predicate registry;
  - R-59 EstimateDirection;
  - R-82 FUNDED_BY;
  - R-89 interest edges.
- `final/schema/final_biotech_schema_v2.ir.json`. `node $SCR/dump-ir.js <types>` wrote `$SCR/ir-dump.txt`: 69 nodes, every relationship triple (concrete from → to),
  16 unions, 20 edge property types and 193 enums. The type-checker in step 4 reads the same IR.
- `final/relationship-register.yaml` predicateOnly list (the 11 FIELD predicates in step 4 are checked against it).
- `final/query-patterns.md` (sha256 `ed6ab40c46ccc52c406da25856e87db5067775953499f67c67ae579ecaac3fa5`). It appeared while this stage was running, and the walk runs its
  P-xx blocks unchanged (step 7). Earlier, the walk used K's trace convention from `packets/K/03-retrieval-patterns.md` (Q-K-01..03).
- Packet fixtures reused:
  - `packets/D1/07-fixtures/nr-trial-unstructured` (Conze dose basis, printed registry id);
  - `packets/D1/07-fixtures/nr-salt-moiety-us-canada` (GSRS, DSLD 323170);
  - `packets/D2/07-fixtures/nr-muscle-unstructured` (Elhassan 2019);
  - `packets/D6/07-fixtures/label-versions-truniagen-dsld`;
  - for shapes only: `packets/D3/07-fixtures/aspree-registry-history-harm/assertions.yaml` (StudyResult / STATED_IN) and `packets/D3/09-reasoning.md` (applicability vocabulary).
- `packets/D10/answer-kind-table.md` gives the kinds in `questions.md` (grep per question id).
- Compound chosen: **nicotinamide riboside**, as the chloride salt in the branded material NIAGEN. It is the one compound that the D1, D2 and D6 packet fixtures all touched,
  and D3-shaped trial records exist for it (NCT02712593, NCT02950441).

## 2. Fresh captures (all re-fetched 2026-10-09 with curl; MCP and Firecrawl were not needed)

Command: in `$SCR/fresh`, one `curl -sS -L -A <UA> -o <file> -w "<file> http=%{http_code} bytes=%{size_download}"` per URL, then `date -u`.

| file | url | http | bytes | retrievedAt (UTC) |
| --- | --- | --- | ---: | --- |
| gsrs_8XM2XT8VWI.json | https://gsrs.ncats.nih.gov/api/v1/substances(8XM2XT8VWI)?view=full | 200 | 16358 | 2026-10-09T04:16:57Z |
| gsrs_0I8H2M0L7N.json | https://gsrs.ncats.nih.gov/api/v1/substances(0I8H2M0L7N)?view=full | 200 | 19145 | 2026-10-09T04:16:58Z |
| epmc_PMC6611812_fulltext.xml | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6611812/fullTextXML | 200 | 146708 | 2026-10-09T04:17:00Z |
| ctgov_NCT02712593.json | https://clinicaltrials.gov/api/v2/studies/NCT02712593 | 200 | 8747 | 2026-10-09T04:17:00Z |
| epmc_PMC6702140_fulltext.xml | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6702140/fullTextXML | 200 | 189550 | 2026-10-09T04:17:02Z |
| ctgov_NCT02950441.json | https://clinicaltrials.gov/api/v2/studies/NCT02950441 | 200 | 6822 | 2026-10-09T04:17:02Z |
| dsld_323170.json | https://api.ods.od.nih.gov/dsld/v9/label/323170 | 200 | 4452 | 2026-10-09T04:17:03Z |
| ctgov_NCT0271593.txt | https://clinicaltrials.gov/api/v2/studies/NCT0271593 | 404 | 31 | 2026-10-09T04:20:28Z |
| quickgo_GO0006476.json | https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/GO:0006476 | 200 | 603 | 2026-10-09T04:20:29Z |
| ols_chebi_15846.json | https://www.ebi.ac.uk/ols4/api/ontologies/chebi/terms?obo_id=CHEBI:15846 | 200 | 9115 | 2026-10-09T04:20:30Z |
| ols_chebi_18304.json | https://www.ebi.ac.uk/ols4/api/ontologies/chebi/terms?obo_id=CHEBI:18304 | 200 | 7789 | 2026-10-09T04:20:30Z |
| ols_uberon_0001379.json | https://www.ebi.ac.uk/ols4/api/ontologies/uberon/terms?obo_id=UBERON:0001379 | 200 | 7121 | 2026-10-09T04:58:16Z |
| ols_uberon_0000178.json | https://www.ebi.ac.uk/ols4/api/ontologies/uberon/terms?obo_id=UBERON:0000178 | 200 | 10596 | 2026-10-09T04:58:17Z |

`sha256sum` (RAW_BYTES):

```
1a3167f256ef0426c33d505f49e91c523392046d0edcbec97c9d36c976eab58b  gsrs_8XM2XT8VWI.json
3316792f5779d6e2a6c179ae2d5956d662250736e9c35a209f678ed434a8a9ad  gsrs_0I8H2M0L7N.json
ae7b5a420c48282b6604bd3c6e22ac818dcd0fc5a9fbaba0d45abf62e34661d2  epmc_PMC6611812_fulltext.xml
b4f637f2a707990d2b651a3c926982fdbc2e78a02be6ac5488f7d4c0ab1ffdaf  ctgov_NCT02712593.json
fb1c0ad79ed4a06783c98d48dd51e7ec0a9640f71d8233626bdbd7c245820a03  epmc_PMC6702140_fulltext.xml
79e06200c9ddbe0d461add746395259ea3995ddfee7f16bf235ee5b2c17fdf48  ctgov_NCT02950441.json
d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d  dsld_323170.json
9707cbeb19b1c589560a481b948ce6a043990896f5c6402c517123bc0cbef04e  ctgov_NCT0271593.txt
211c7658247aad552093bdf79dabdb185ac9c67eba96a09b658de8baf84415cc  quickgo_GO0006476.json
cd764d214432cb22a109642d1b5e34e6f472785e7cabdc930ccc9835aba12353  ols_chebi_15846.json
e6c08e08954519be0e1373b8409da14543f04afec3bb30e81b1c15340d356cae  ols_chebi_18304.json
dbbd73a9f8762f0a59f9b2ecce50cccf1f4299c71042fd394b4217c4b3539dbf  ols_uberon_0001379.json
e6a51f559811919b854cc6f88e7490e3ac7dd7d2148c0d6628386f151605252d  ols_uberon_0000178.json
```

**Comparison with the packet captures of 2026-10-08.**

- Byte-identical to the digests the packets record (D1 nr-salt-moiety-us-canada, D1 nr-trial-unstructured, D2 nr-muscle-unstructured): both GSRS records,
  both Europe PMC JATS files, NCT02950441, DSLD 323170 and the 404 body.
- Changed: NCT02712593 (8,747 bytes today; D1 recorded 8,748 bytes, sha256:120b38f3…). Every value quoted from it was re-selected in today's bytes.

**Content probes.** Run with `python -I` and stdout utf-8; they read the captures to choose quotes and found:

- GSRS: version 18 (salt) and 24 (cation); codes UNII, CAS, PUBCHEM, CHEBI and DRUG BANK; `relationships[0].type` "ACTIVE MOIETY"; mwt 290.7006 / 255.2476.
- Conze 2019:
  - the abstract;
  - the Results "Blood NAD+" paragraph (Par26), where the day-14 sentence reads "142 ± 14%";
  - the AE paragraph (Par28: "Ninety-five AEs were reported by 61 participants"; "There were no serious AEs …");
  - the Figure 3 caption ("Error bars represent standard error of the mean.");
  - the competing-interests note ("ChromaDex funded the study.");
  - the Brenner `<contrib>` with ORCID 0000-0002-4955-3226.
- Elhassan 2019: the Results (acetylation; NAAD / NAD+), the line "NR chloride (Niagen) … 250-mg capsules (ChromaDex)", the Declaration of Interests, and the registry
  id in the STAR Methods.
- Registries:
  - NCT02712593: secondary outcome "Blood Nicotinamide Riboside Metabolites", placebo arm typed EXPERIMENTAL, `hasResults` false;
  - NCT02950441: arm description "1000mg (2x250mg tablets twice daily)", status UNKNOWN / last known RECRUITING.
- DSLD 323170: ingredientRows (Niagen 300 mg, form Nicotinamide Riboside Chloride 8XM2XT8VWI), maxDailyServings 3, "Distributed by" / "ChromaDex, Inc", entered 2025-04-24.

## 3. Locators (`python -I $SCR/build_locators.py $SCR/fresh $SCR/locators.json`)

Every quote is cut from the capture by start and end anchors and is never typed. Offsets are 0-based code points into the UTF-8-decoded raw bytes, end exclusive.
`quoteHash` is the sha256 of the exact text. A JSON_POINTER quote must contain the pointer's value. The re-selection `snapshot[start:end] == exact` is checked.
Final run: `snapshots=13 locators=99 failures=0`. Notes: `l-cz-mention-nrcl` occurs 3 times (first occurrence used, as in D1), and `l-cz-sem` occurs 2 times (the Figure 3 caption, selected by anchor).
The Conze offsets match packet D1's for the shared spans (l-cz-capsule 28769, l-cz-arms 29785, l-cz-registry 22841, l-cz-period 36701, l-cz-gras 5731).
The chunk `<sec id="Sec6">` span 28532–30482 has span digest `sha256:564450bd…`, which equals D1's chunk-sec6 `spanDigest`.

## 4. Build and type-check against the final IR (`python -I $SCR/build_fixture.py $SCR <IR> $SCR/out`)

Final run (builtAt 2026-10-09T05:01:14Z): `errors 0`;
`counts nodes=67 assertions=80 assessments=12 adjudications=80 structural=36 derived=9 chunks=2 locators=99 snapshots=13` (plus 2 RENDITION_OF assertions and their 2 adjudications).
The fixture uses 27 node types and 39 relationship types.

**What the type-check covers:**

- every node type and property is in the IR;
- enum values are checked against the IR enums;
- required properties are present;
- every typed edge's (from, to) is an IR triple;
- edge-property keys and enums are checked, as are required edge properties;
- ASSERTED_BY, HAS_SUBJECT and HAS_OBJECT targets are allowed for the referenced types;
- every evidence locator exists;
- a typed edge's type equals its Assertion's predicate;
- no predicate-only assertion uses a relationship-type name;
- every propertyEvidence locator exists.

**Fixes made during the build:**

- The first run gave 22 errors `HAS_OBJECT -> Identifier`: Identifier is Entity-only, not Subjectable. HAS_IDENTIFIER assertions now carry a literal object (`scheme:value`),
  and the typed episode points at the Identifier node. That is the kernel convention in the SDL docstring.
- The first cut had 16 locators that no record cited. Each node now carries a `propertyEvidence` map (R-14), and `verify_yaml.py` reports `unusedLocators=[]`.

**Typecheck notes.** These are not errors: 11 FIELD predicates are not in the final predicateOnly list (DOSAGE_FORM ×3, DURATION_ISO, MAX_DAILY_SERVINGS, MOLECULAR_FORMULA, MOLECULAR_WEIGHT ×2,
QUANTITY ×2, REGISTRY_ID_AS_PRINTED). Ten of them follow the R-14 property-name convention. `final/vocabularies/predicates.yaml` (R-52) does not exist, so their registration
cannot be checked. REGISTRY_ID_AS_PRINTED is packet D1's predicate and is not registered in the final register.

**Computed numbers** (command `python -I -c …`, output recorded):

- ratio 255.2476 / 290.7006 = 0.878043;
- trial 1000 mg salt → 878.04 mg cation;
- label 300 mg salt → 263.41 mg cation;
- label maximum 900 mg/d salt → 790.24 mg/d cation;
- label maximum / trial top arm = 0.9; in P-03, score = study / use = 1000 / 900 = 1.11;
- UPC 850015311116: computed check digit 6 = printed 6; GTIN-14 00850015311116.

**Digests computed by the builder:**

- `LabelVersion.contentDigest` / `compositionDigest`: sha256 of canonical JSON of DSLD panel fields;
- `payloadHash` of arms: the locator quoteHash; of components: sha256 of canonical properties; of RegistrationVersion: the snapshot hash.

These are this fixture's own canonicalization and are not comparable with packet D6's digests.

## 5. Intent (`python -I $SCR/gen_intent.py …` and `node $SCR/validate_intent.mjs <worktree> $SCR/out/intent.json`)

`subjects=42 proposals=103 sources=13 locators=99 notExpressed=13 errors=0`, made of edge.assert 37, edge.structural 31, identifier.attach 22 and assertion.literal 13.
Validation against `packages/contracts` IngestionIntent (zod) printed `OK … 103 proposals, 42 subjects, 13 sources, 99 locators`.
The gen_intent check confirms that every nodeType, triple and subject property exists in the final IR. `schemaDigest` = the candidate IR digest.

Not expressible in intent v1 (listed in `intent.json` notes):

- predicate-only object assertions (FUNDED_BY, 4 mechanism assertions, 3 COMPUTATION assertions with an object);
- OBSERVED_IN_CONTEXT;
- Assessments and Adjudications;
- DERIVED_FROM inputs;
- the asserters of identifier.attach;
- RENDITION_OF;
- D9 chunks and derived edges;
- run-lineage edges between Activities.

**Planner check (03-SYNTHESIS step 8): not feasible here.** `node packages/kg-ops/dist/cli.js kg plan` loads `SchemaModel.fromWorkspace()`, which reads the pinned workspace.
`bks-schema build` has no SDL override, and pointing it at the candidate would mean editing `workspace/` or the scripts. Both are out of scope for S.

## 6. Graph load on the disposable Neo4j (`bks-neo4j-synth`, bolt 7691)

1. `python -I $SCR/gen_cypher.py $SCR <IR>` wrote `$SCR/load.cypher` (1,573 statements in the final run). Labels come from the IR. Every node and edge carries `fixtureTag: 'xfx-cp'`.
2. Loaded with `docker cp` + `docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password -f /tmp/xfx-cp-load.cypher`.
3. The first ever load stopped at one statement with "Could not compile query due to insanely frequent schema changes" (354 nodes, 987 of 1,030 rels).
   After `cleanup.cypher` (`MATCH (n {fixtureTag: 'xfx-cp'}) DETACH DELETE n`), the reload was complete. The final run loaded 370 nodes and 1,203 relationships.
4. The synth DB also held 203 untagged nodes from another S fixture (cross-domain fixture 2). With an identifier-value entry, my first W1 returned their NR nodes too.
   The value-entry statements W1, W7a, W7d and the walk version of P-03 are therefore scoped by `fixtureTag` and marked as harness-only. No other container was touched and no volume was pruned.

## 7. Walk queries (all on the loaded fixture graph)

- **Fixture walk W0–W10** (`$SCR/walk/queries.cypher`, split per id). Each statement ran as `EXPLAIN` and then for real (`--format plain`).
  `EXPLAIN-OK count: 11` for W1–W10 and 1 for W0. Outputs are in `$SCR/walk/results.txt` and `results-W0.txt`; walk.md quotes them.
- **`final/query-patterns.md` blocks**, extracted by `@id` and run unchanged with fixture parameters (`python -I $SCR/walk/run_patterns.py <query-patterns.md> $SCR/walk/patterns`).
  All 14 were ok. Rows returned:

  | statement | rows | statement | rows |
  | --- | ---: | --- | ---: |
  | P-01b | 5 | P-04e | 5 |
  | P-01c | 82 | P-10a | 27 |
  | P-02a | 6 | P-10a.2 | 13 |
  | P-02b | 2 | P-10a.3 | 94 |
  | P-03 | 5 | P-10a.4 | 3 |
  | P-04b | 8 | P-10b | 2 |
  | P-04d | 5 | P-12 | 1 |

  Block sha256 prefixes are in `patterns-results.txt`.
  - Before restructuring, P-03 needed the D3 vocabulary shape: a parent `D3.applicability` plus `D3.applicability.dimension` children with `conclusionCode`, `facets`
    `dimension=` / `missing=` and `score`, ASSESSING the Study and a ProductVariant. The fixture was rebuilt to that shape.
  - P-01/P-04 read `expectedSelectedContentDigest`, so every HAS_EVIDENCE now carries it (= locator quoteHash).
  - P-12 read `compartmentOntologyId`, so the UBERON captures were added.
  - P-01c had flagged the 2 RENDITION_OF assertions as unadjudicated, so they now have adjudications.
- **GraphQL.**
  - Validation: `node $SCR/walk/validate_graphql.mjs <graphql@16.14.2> <printed> $SCR/walk/graphql-walk.graphql` printed `OK: 4 operations valid` against
    `synth/integrate/printed-deployed.graphql` (1,735,213 B, sha256 269a1534…) and against `printed-L3.graphql`.
    In the first draft, `assertions.subject` needed the `some` filter (`SubjectableRelationshipFilters`); fixed.
  - Execution: `node $SCR/walk/exec_graphql.mjs <worktree> <final SDL> …` used `createNeo4jGraphQL` from `apps/graphql-api/dist/server.js` with an explicit driver to
    bolt://localhost:7691 (no server, no env credentials). The first attempt used the ESM graphql instance and failed in `assertSchema` (two graphql realms);
    the fix was to require the CJS instance next to `@neo4j/graphql`.
    Final: schema built in 1,335 ms; G1 ok 245 ms, G2 ok 139 ms, G3 ok 2,794 ms, G4 ok 1,083 ms. Output is in `$SCR/walk/graphql-results.json`.
- **Full pipeline.** `bash $SCR/run_all.sh` ran end to end: captures check, build, intent, source.md, copy to final, `verify_yaml.py`, load, walk, patterns, GraphQL, cleanup. Exit 0.
  - `verify_yaml.py` re-parses the written YAML, re-hashes every capture and re-selects every quote: `snapshots=13 locators=99 evidenceRefs=149 assertions=80 assessments=12 failures=0 unusedLocators=[]`.
  - Cleanup: `MATCH (n {fixtureTag:'xfx-cp'}) DETACH DELETE n`, then `rm -f /tmp/xfx-cp-*.cypher` in the container. Check: `remainingFixtureNodes 0`.

## 8. Findings handed to the finalizer (details in walk.md "What the walk found")

1. The compound-first join runs in Cypher. In GraphQL it must be written owner-first with nested `some` filters, because IngredientMaterial / ChemicalSubstance have no inverse fields
   for ADMINISTERS, DECLARES_COMPONENT, REALIZES_SUBSTANCE or HAS_ACTIVE_MOIETY, and entities have no field to their Assertions. Assertion has no field to its MechanismEvidenceContext.
2. Multi-asserter asserted edges (REALIZES_SUBSTANCE, ADMINISTERS) duplicate traversal rows unless the query de-duplicates.
3. P-10a.2 cannot see HAS_IDENTIFIER authorizations (literal-object Assertions). There are 22 in this fixture.
4. P-01c flags CALCULATED assertions as `noLocator`, and every snapshot here as `irreproducible`, because there is no durable `storageUri`.
5. The "one locator per reported number" rule has no field on `EvidenceEdgeProperties`: there is `facet` but no field name. Two numbers sharing a locator give identical HAS_EVIDENCE edges.
6. Two cross-domain fixtures minted separate Identifier nodes for UNII 0I8H2M0L7N. Merging them under `identifier_key` (R-42) would join the compound profile to the product comparison.
7. Predicate gaps: `final/vocabularies/predicates.yaml` is absent, and REGISTRY_ID_AS_PRINTED is unregistered.

## 9. Files written

- `schema/program/final/fixtures/cross-domain/compound-profile/source.md`: 13 blocks; the first `kind:` line is `unstructured-to-entity`.
- `…/locators.yaml`: 13 snapshots, 99 locators.
- `…/assertions.yaml`:
  - 67 nodes, 13 sources, 2 chunks;
  - 80 assertions + 2 RENDITION_OF;
  - 12 assessments, 80 adjudications (82 in the graph with the renditions');
  - 36 structural and 9 derived edges.
- `…/intent.json`: biotech-knowledge-intent.v1, 103 proposals, valid.
- `…/questions.md`: 32 question rows plus the cross-domain question.
- `…/walk.md`.
- `schema/program/final/_runlog/xfx-compound.md`: this file.

---

<!-- stage: _runlog/xfx-product.md -->

# Runlog: cross-domain fixture 2, product comparison (D6+D1+D8), S team, 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Shell: Git Bash. `$F` = `.../schema/program/final`; `$SP` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/xfx-product`. Writes only under `$F/fixtures/cross-domain/product-comparison/` and this file; raw captures and scripts stay in `$SP` (not committed). No .env value printed. Nothing committed.

## 1. Orientation (read-only)

```
node -e '<dump of $F/schema/final_biotech_schema_v2.ir.json: nodes, relationshipTypes, enums>' > $SP/typemap.txt
→ 69 node types; relationship types used here: DECLARES_COMPONENT (LabelVersion→IngredientMaterial, ComponentLineProperties),
  HAS_LABEL_VERSION, HAS_VARIANT, HAS_PACKAGE, NAMES_RESPONSIBLE_PARTY, REALIZES_SUBSTANCE, HAS_ACTIVE_MOIETY, COVERS
  (CertificationListing→Product|ProductVariant|Lot), ISSUED_BY, LOT_OF, USES_CRITERION, HAS_ITEM, ASSESSES, DERIVED_FROM,
  HAS_SUBJECT/HAS_OBJECT/ASSERTED_BY/HAS_EVIDENCE/WAS_GENERATED_BY (kernel)
  enums checked: MassBasis {SALT_FORM ACTIVE_MOIETY NUTRIENT_EQUIVALENT MATERIAL_AS_IS UNSPECIFIED}, CriterionKind {SCORE BLOCK FILTER TIEBREAK},
  CriterionDirection, OptionDisposition {SELECTED ALTERNATIVE REJECTED BLOCKED NOT_EVALUATED}, CertifiedObjectKind, ReportKind (COMPARISON)
grep rulings: R-14 (FIELD assertions), R-40 (intent v1 gap), R-52 (predicate registry), R-73 (COVERS→ProductVariant kept with a fixture request), R-85, R-87 (one Assertion per label line)
```

## 2. Candidate search (probe; not the fixture captures)

```
curl -s "https://api.ods.od.nih.gov/dsld/v9/search-filter?q=%22nicotinamide%20riboside%22&size=100" → 93 hits
  chosen: 323170 Tru Niagen 300 mg (ChromaDex), 323125 NiaCel 400 (Thorne, entered 2025-01-23), 333430 Liposomal Nicotinamide Riboside+ (Codeage)
  probe of labels: 323170 row "Niagen" 300 mg, form Nicotinamide Riboside Chloride (UNII 8XM2XT8VWI);
                   323125 row "Nicotinamide Riboside Hydrogen Malate" 415 mg, no form, maxDailyServings 1;
                   333430 row "Nicotinamide Riboside" 500 mg, no form; also 270933/205969 Basis (Elysium) 250 mg per 2 caps, no form (not used)
curl GSRS search "NICOTINAMIDE RIBOSIDE MALATE" → total 0; "nicotinamide riboside" → 108 (only 0I8H2M0L7N and 8XM2XT8VWI are NR records)
curl PubChem name "nicotinamide riboside hydrogen malate" → PUGREST.NotFound; "nicotinamide riboside malate" → CID 146673021, C15H20N2O10, MW 388.33
curl nsfsport.com search-results.php?keyword=niacel → listing-detail.php?id=1423140 (Thorne NiaCel 400, lot-scoped)
curl nsfsport.com listing-detail.php?id=1263423 → TRU NIAGEN 300mg, Lot # All, Package Size 30, 60, 90
curl info.nsf.org Listings.asp?TradeName=nicotinamide& → NSF/ANSI 173, Codeage LLC, Liposomal Nicotinamide Riboside+, Product ID All
firecrawl_scrape (MCP, maxAge 0) https://www.thorne.com/products/dp/niacel-400 → JS-rendered comparison widget says "Nicotinamide Riboside 415 mg";
  raw HTML (curl, 397,651 B) carries only "Nicotinamide Riboside Hydrogen Malate" / "415mg"; the widget text is not in the raw bytes → not used

## 3. Fresh captures (the fixture's snapshots)

```
bash $SP/bin/capture.sh $SP/raw < $SP/bin/sources.tsv   (first 10 rows), then < $SP/bin/sources2.tsv (last 3 rows; see 'Later additions')
  (curl -s -m 90, browser User-Agent; prints key, url, retrievedAt, http, bytes, sha256)
  dsld_323170.json  2026-10-09T04:19:41Z  http 200  4452 B  sha256:d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d
  dsld_323125.json  2026-10-09T04:19:42Z  http 200  4933 B  sha256:f76f932080400688993edc41e571dad97bee30f9f40b88f3ef6ce4dc73997ff0
  dsld_333430.json  2026-10-09T04:19:43Z  http 200  6295 B  sha256:bbb1d1a2564c059191c852a251233182e1076ca434a1eb184cf2bdeb1d22b2ba
  gsrs_8XM2XT8VWI_full.json  2026-10-09T04:19:44Z  http 200  16358 B  sha256:1a3167f256ef0426c33d505f49e91c523392046d0edcbec97c9d36c976eab58b
  gsrs_0I8H2M0L7N_full.json  2026-10-09T04:19:44Z  http 200  19145 B  sha256:3316792f5779d6e2a6c179ae2d5956d662250736e9c35a209f678ed434a8a9ad
  pubchem_146673021_props.json  2026-10-09T04:19:45Z  http 200  373 B  sha256:5497e09d836271cf139dedc45ced8190420463faee3452217fe0194d2d4ed0e5
  pubchem_146673021_synonyms.json  2026-10-09T04:19:46Z  http 200  607 B  sha256:16442d4def5e2d9895b0e3d6098efbd34f51a900cf4f51d3ecf8c3c85ff29ef7
  nsfsport_1263423.html  2026-10-09T04:19:47Z  http 200  19949 B  sha256:e0f0b05e0c911848b23eda2005e4bcfec064eceaac7f25dcb2bad30d329262a8
  nsfsport_1423140.html  2026-10-09T04:19:47Z  http 200  19988 B  sha256:fe7f5eb6fb379c4016c354b23d75b59222b05ae04b8c5865739aa61a0c224a51
  nsf173_nicotinamide.html  2026-10-09T04:19:48Z  http 200  10049 B  sha256:b0045665dcae22dff20594e82b4e19e747e1ec1700346d487f78c609f78dd943
  dsld_298081.json  2026-10-09T04:21:29Z  http 200  4891 B  sha256:3fea23ce9945b8498be75864b118c12a5214bc582cc771b571649de9a298b332
  thorne_niacel400.html  2026-10-09T04:21:29Z  http 200  397634 B  sha256:572faadab7de6f04d87a9dc2dfc5d24681a0ea55c649d71cfae56437df3a8a83
  truniagen_300mg.js  2026-10-09T04:21:31Z  http 200  16441 B  sha256:4c2f6a1c3c33b4e5f64353b733bb18fa1ec1249e62054b30c2cd8681255c090a
```
Cross-checks with packet fixtures: dsld_323170.json and both GSRS records are byte-identical to packets/D1/07-fixtures/nr-salt-moiety-us-canada
(sha256 d9002592…, 1a3167f2…, 3316792f…); truniagen_300mg.js is byte-identical to D6 offer-roles-price-kinds-truniagen shopify-tn-live (4c2f6a1c…).
All captures decode as UTF-8.

## 4. Locators

```
python -I $SP/bin/build_locators.py $SP/raw $SP/captures.tsv $F/fixtures/cross-domain/product-comparison/locators.yaml $SP/locators.json
→ ok snapshots=13 locators=66 (every quote re-selected from the raw bytes; sha256 of each capture re-checked against captures.tsv)
  occurrencesInSnapshot = 1 for 65 locators; l-th-price-visible = 2 (the Thorne page renders the price block twice; first occurrence selected)
  offsets of the DSLD 323170 locators equal D1's (l-tn-qty 3286–3327, l-tn-row 3540–3647, l-tn-form 3739–3850, l-tn-maxdaily 1216–1267)
```

## 5. Derived amounts (rule:mw-ratio.v1, rule:daily-max.v1; inputs are the located MW and label values)

```
python -I -c "<mw_nr=255.2476 (GSRS 0I8H2M0L7N v24); mw_cl=290.7006 (GSRS 8XM2XT8VWI v18); mw_mal=388.33 (PubChem CID 146673021)>"
→ ratio chloride 0.8780429073761802; ratio hydrogen malate 0.657295599103855
  Tru Niagen 300 mg salt → 263.41287221285404 mg NR/capsule; × 3 servings/day → 790.2386166385621 mg/d; salt 900 mg/d
  NiaCel 400 415 mg salt → 272.7776736280998 mg NR/capsule; × 1 (label 323125) → 272.78 mg/d; × 2 (label 298081) → 545.5553472561996 mg/d
  PubChem-only cross-check 415 × 255.25/388.33 = 272.7802384569825 (same to 0.1 mg)
  Tru Niagen price: 4900 cents / (30 × 263.41287) mg × 100 = 0.6200658759050689 USD per 100 mg NR (one-time, 30-count)
  Codeage 500 mg, mass basis unstated: not derived (sensitivity only: 500 × 0.87804 = 439.0214536880901 if it were the chloride salt)
```

Later additions to the captures and locators (same procedure; captures.tsv appended; the sources2 rows are also listed in section 3):
```
bash $SP/bin/capture.sh $SP/raw < $SP/bin/sources2.tsv
  dsld_298081.json  2026-10-09T04:21:29Z  http 200  4891 B  sha256:3fea23ce9945b8498be75864b118c12a5214bc582cc771b571649de9a298b332
  thorne_niacel400.html  2026-10-09T04:21:29Z  http 200  397634 B  sha256:572faadab7de6f04d87a9dc2dfc5d24681a0ea55c649d71cfae56437df3a8a83
  truniagen_300mg.js  2026-10-09T04:21:31Z  http 200  16441 B  sha256:4c2f6a1c3c33b4e5f64353b733bb18fa1ec1249e62054b30c2cd8681255c090a
curl PubChem .../cid/146673021/cids/JSON?cids_type=component → CID [222656, 439924]   (probe; then captured:)
  pubchem_146673021_components.json  2026-10-09T04:25:19Z  http 200  76 B  sha256:a16db13d60129ad317900a757a864a692f7988628de97f796e04775af9aba174
grep GSRS 0I8H2M0L7N: "codeSystem":"PUBCHEM","code":"439924","type":"PRIMARY" (1 occurrence)
grep thorne_niacel400.html: '"price":44' 1 occurrence; '>$74<' 1 occurrence (the rendered block appears twice with its spans)
python GTIN check: 8 50015 31111 6 → 00850015311116 ok; 850015311857 → 00850015311857 ok; 6 93749 01208 5 → 00693749012085 ok; 8 50049 60921 0 → 00850049609210 ok
UNII locators re-anchored on the record's top-level approvalID ("access":["admin"]}],"approvalID":…): the first plain occurrence of 0I8H2M0L7N is a relatedSubstance reference
python -I $SP/bin/build_locators.py … → ok snapshots=14 locators=77 (all quotes re-selected; every capture digest re-checked)
```

## 6. Fixture records, IR checks, intent

```
python -I $SP/bin/build_fixture.py $F/schema/final_biotech_schema_v2.ir.json $SP/locators.json $F/fixtures/cross-domain/product-comparison $SP
  checks: node types, property names, required properties, enum values (node props, Assertion fields, ComponentLineProperties, TimePrecision),
  typed (type, from, to) triples for every asserted and structural edge, HAS_SUBJECT/HAS_OBJECT/ASSERTED_BY/ASSESSES/DERIVED_FROM/HAS_ITEM/USES_CRITERION
  pairs, edge-property names, locator refs, derivedFrom refs, body citations, unique ranks; every CALCULATED number recomputed from the quotes
  run 1 → 5 errors (AgentKind LLM_AGENT/SERVICE, ListingKind BRAND_STORE not in enums) → fixed (AUTOMATED_AGENT, DATA_ANALYSIS_PIPELINE, DTC_PRODUCT_PAGE; TimePrecision has no SECOND/MINUTE → INSTANT)
  run 3 → 31 errors: (Assertion)-[:HAS_OBJECT]->(Identifier) not in IR → identifier assertions rewritten per K 09 item 3 (literal scheme:value, HAS_IDENTIFIER edge to the Identifier)
  final → ok entities 97 assertions 111 assessments 5 items 8 typesUsed 15; unused locators []
  calc tn 263.4128722128540498368424420 / 790.2386166385621495105273260; nc 272.7776736280998120155537816 / 272.7776736280998120155537816; nc0 … / 545.5553472561996240311075632
  composed-body.txt bodyDigest sha256:8701c9c51404081b2c35c73d05b7cbada680e8d39a44e9f98ac77edb9bcaa36b (3,061 B), citationCompleteness 0.667 (10 of 15 sentences cite; SCOPE 4 and INTERESTS 1 uncited framing, OPTIONS rows 0 uncited)
python -I $SP/bin/emit.py <IR> $SP/locators.json $SP/fixture.json $F/fixtures/cross-domain/product-comparison $SP
  → assertions.yaml; intent proposals 155, subjects 57, sources 14, excluded 13 (R-40 kinds); load.cypher 1,349 statements
node $SP/bin/validate_intent.mjs packages/contracts/dist $F/fixtures/cross-domain/product-comparison/intent.json
  → OK 155 proposals {node.upsert 46, edge.structural 9, edge.assert 61, assertion.literal 12, identifier.attach 27}; subjects 57; locators 77; danglingRefs 0
```

## 7. Planner probe (03-SYNTHESIS step 8; read-only, current kg-ops dist, final/_work/planner-probe-v2.mjs)

```
NEO4J_PROBE_PASSWORD=*** node schema/program/final/_work/planner-probe-v2.mjs $SP/planner-probe.json $F/fixtures/cross-domain/product-comparison/intent.json
 run 1 (first emit): v2 rejected, errors INVALID_SOURCE_PROPERTY (source.properties.tool); subject reasons REQUIRED_PROPERTY_MISSING entityKind ×9, hostItemId ×2;
        INVALID_PROPERTY IngredientMaterial.searchText ("a derived search projection") ×3
   fixes in the fixture: Organization entityKind/organizationKind (fixture classifications), MerchantListing hostItemId (Shopify product id 7387359477829,
   Thorne sku SP654, both located: l-tns-id, l-th-sku), searchText dropped, source.properties emptied, snapshot.properties without bytes;
   build_fixture.py now also checks required properties
 run 2: v1 thrown (rolled-back transaction, as in _runlog/migration.md section 4)
        v2    rejected: SUBJECT_CONFLICT 155; subject TYPE_NOT_CREATABLE 57 (no v2 type allows CREATE, R-03); no uid token for Lot 19, Package 4, LabelVersion 4
        v2sim partial: admitted 40, rejected 114, no_op_duplicate 1; subjects create 27, use_existing 3, conflict 27 (the no-uid-token types);
              RELATIONSHIP_ENDPOINTS_INVALID 1 ("ChemicalSubstance has no HAS_IDENTIFIER field": planner reads a forward field, v2 declares Identifier.identifies);
              write audit: planner still writes v1 keys (maturity, schemaVersion, mongoResearchRunId, SUPPORTED_BY ×16, Assertion.statedAsOf …), as recorded in migration.md
 → every remaining reason is a planner/IR-params gap already listed in migration notes; no fixture-side error remains.
```

## 8. Walk in the disposable Neo4j (walk.md)

```
docker cp $SP/load.cypher bks-neo4j-synth:/tmp/xfx-product-load.cypher
docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** -f /tmp/xfx-product-load.cypher → exit 0 (first load 22.6 s wall)
  (the DB already held 354 nodes from another S stage; every statement here is scoped to fixture:'xfx-product')
MATCH (n {fixture:'xfx-product'}) … → 327 nodes, 1,020 relationships; 22 primary labels
python -I $SP/bin/run_walk.py $SP/walk-queries.cypher $SP/walk-results.md   (cypher-shell --format plain, -P {T: …})
 run 1: W1–W6 exit 0; W7 exit 1 (toString(list) type mismatch → reduce())
        W2 at 2024-06-01 ranked NiaCel on a COVERS episode observed in 2026 → query now counts an unknown-start episode only from its
        Assertion's validObservedAt; an option covered only later is "NOT_EVALUATED (certification at T unknown)"
 run 2 (after cellValues fix, reload: 327 nodes / 1,020 rels, exit 0):
   W1 T=2026-10-09: Codeage 500 mg UNSPECIFIED → NR, daily NULL; NiaCel SP654 LSP65404 415 mg SALT_FORM → 272.8 mg/d PROPOSED; Tru Niagen V12.3 300 mg SALT_FORM → 790.2 mg/d ACCEPTED
   W1 T=2024-06-01: NiaCel SP654 LSP65403 → 545.6 mg/d (only option with a label in force)
   W2 T=2026-10-09: NiaCel RANKED 1 (lotScore 1, NSF CfS LOT x19); Tru Niagen RANKED 2 (lotScore 0, PRODUCT_ALL_SIZES x1); Codeage NOT_EVALUATED (no moiety amount; NSF/ANSI 173)
   W2 T=2024-06-01: NiaCel NOT_EVALUATED (certification at T unknown)
   W3 17 rows: every non-CALCULATED input of c-nc-day has locator + snapshot digest
   W4: run:ft-S-xfx-product-ingest 32 records; run:ft-S-xfx-product-project 2 records, informedBy ingest
   W5: 8 items; rows SELECTED 1 / ALTERNATIVE 2 / NOT_EVALUATED, cites 7 / 6 / 4
   W6: 414956 and 417281 listed (1423140, observed 2026-10-09T04:19:47Z); 999999 none
   W7: field silent (Codeage), offer package without label version (Tru Niagen store), price disagreement 44 / 74 USD (Thorne)
python -I <assemble walk.md from walk.template.md + walk-queries.cypher + walk-results.md>  → walk.md (results pasted by script, not by hand)
MATCH (n {fixture:'xfx-product'}) DETACH DELETE n → 327 deleted; remaining 0; /tmp/xfx-product-load.cypher removed
```

## 9. Final checks

```
python -I $SP/bin/verify.py $F/fixtures/cross-domain/product-comparison $SP/raw
  → locators 77, snapshots 14, problems [] (digest, offsets, quoteHash, occurrence counts), unresolved refs [], unused []
  → bodyDigest match True; assertions 111; producedBy on all True
python -I -c "<yaml.safe_load assertions.yaml>" → predicates: HAS_IDENTIFIER 31, COVERS 21, LOT_OF 19, DECLARES_COMPONENT 4, MAX_DAILY_SERVINGS 4,
  HAS_LABEL_VERSION 4, MOLECULAR_WEIGHT 3, REALIZES_SUBSTANCE 3, NAMES_RESPONSIBLE_PARTY 3, OFFER_PRICE_ONE_TIME 3, ISSUED_BY 3,
  MOIETY_EQUIVALENT_AMOUNT 3, PER_MAX_DAILY_DOSE_AMOUNT 3, HAS_ACTIVE_MOIETY 2, LISTING_FOR 2, MOLECULAR_FORMULA 1, FIELD_NOT_REPORTED 1, BEARS_SEAL 1;
  89 entities (+3 activities), 5 decision criteria, 5 assessments, 8 report items
```

## 10. Files written

`$F/fixtures/cross-domain/product-comparison/`: source.md, locators.yaml (77 locators, 14 snapshots), assertions.yaml (record of truth),
intent.json (ingestion run, zod-valid), questions.md, walk.md, composed-body.txt (draft report body; its sha256 is Report.bodyDigest).
This runlog. Scratch only (not committed): $SP/raw (14 captures; candidate probes in $SP/probe), $SP/bin/*, $SP/fixture.json, $SP/load.cypher,
$SP/walk-queries.cypher, $SP/walk-results.md, $SP/planner-probe.json.

## 11. Open points for the coordinator / owner

1. Asserter of DSLD-relayed label lines: this fixture follows R-16 rule 1 (labeler of record, qualifier relayedBy:NIH ODS DSLD …), as packets/D1 does;
   packets/D6 label-versions-truniagen-dsld asserts its lines by NIH ODS. No ruling names the asserter of a registry-relayed label; one is needed.
2. COVERS → ProductVariant now has a fixture (k-tn-covers: NSF listing 1263423 names the 300 mg variant), which is the R-73 fixture request for CQ-PF-03a.
3. Candidate IR params: no uid token for LabelVersion, Package, Lot (planner NO_UID_TOKEN); planner reads HAS_IDENTIFIER as a forward field; both already in migration notes.
4. NR hydrogen malate has no GSRS record; its MW (388.33, 2 decimals) and moiety link come from PubChem + BellLabs curation (PROPOSED). The NiaCel rank rests on it.
5. The criteria set bl:compare:nr-products@1 is fixture-illustrative; the report is a PROPOSED draft (no report.publish in intent v1, R-40).

---

<!-- stage: _runlog/xfx-claim.md -->

# Runlog — cross-domain fixture 3: claim → mission → report (D9 + D7 + K + D10)

Agent: S team, role "CROSS-DOMAIN FIXTURE 3", 2026-10-09 (UTC). Worktree `biotech-knowledge-services-S`, branch `ft/schema-S`.
Output: `final/fixtures/cross-domain/claim-mission-report/`. Scratch: `scratchpad/synth/xfx-claim/` (captures in `cap/`,
generator `gen.py`, Neo4j load and query scripts). Nothing committed. `.env` not read.

## 1. Inputs read

- `fast-track/00-DIRECTIVE.md` (3.4, 3.8, 3.9, 3.10, section 4), `01-PACKET-CONTRACT.md` (fixture file set), `03-SYNTHESIS.md`.
- `final/schema/kernel.graphql` (Source, SourceSnapshot, SourceLocator, Assertion, Adjudication, Claim, Assessment,
  Report, Activity, Agent, Identifier), `final/schema/D9.graphql` (Channel, MediaWork, Chunk), `final/schema/D7.graphql`
  (Person, Organization, HOLDS_ROLE / HOLDS_STAKE edge properties), `final/schema/D10.graphql` (ReportItem),
  `final/schema/D3.graphql` (Publication), `final/schema/D1.graphql` (ChemicalSubstance, IngredientMaterial).
- `packets/K/03-retrieval-patterns.md` Q-K-04 … Q-K-08 (the four lineage patterns and the evidence-mission pattern).
- `packets/K/07-fixtures/resveratrol-sirt1-evidence-mission/` and `two-run-lineage/` (record conventions).
- `packets/D9/07-fixtures/hl52-transcript-nmn-practice/` and `sinclair-recommendation-disclosure-asof/` (the captured
  episode transcript and the self-disclosure page snapshots this fixture reuses).
- `packets/D10/report-skeletons.md` section 4 (`d10.evidence-report@1`).

## 2. Commands and key output

### 2.1 Choosing the claim (existing D9 captures, hashes re-verified)

```
$ sha256sum ft/D9/cap/hl52-episode.md ft/D9/cap/sinclair-affiliations.md ft/D9/cap4/wb-aff-20211209003848.html ft/D9/cap/yt-hl52.md
3158acee44e12235c743aabb3750c7b0d0a807f560bb16477bef76529b0ae973  hl52-episode.md          (= D9 hl52-web snapshot)
4a360dd31a561a81b4a6fc70ec16f890322f6dcbe860aab7e31b78ff69688f3f  sinclair-affiliations.md (= D9 aff-now)
ce81648413b5dd1dc70f5c6fcd7a4daac4f8abbf4fc649ee15e706f037c1b590  wb-aff-20211209003848.html (= D9 aff-20211209, the verified copy)
e5b79dd9cc6777dd910ac067b72f0f8083cd0f12fd2fb50d83396a98255ee730  yt-hl52.md               (= D9 hl52-youtube)
$ grep -n -i "NMN\|NAD" hl52-episode.md
  line 1033 "... But if you take it for about two weeks, you'll double, on average double your NAD levels in the blood.
  Okay? That's not public information. That's from clinical trials that are not yet published over the last two years."
  line 1073 "... without any exceptions, that if you do what I do, your NAD levels go up by about twofold or more."
  line 1021 "All right. Well, disclaimer is I don't recommend anything, but I talk about what I do."
$ grep -n -i "metro\|edenroc" wb-aff-20211209003848.html
  line 279 "MetroBiotech, an EdenRoc company</a> aka Bauhaus; NAD boosters (2015-present) F,I,E,A,B (EdenRoc),IP"
$ grep -n -i "metro" sinclair-affiliations.md
  line 39 "[MetroBiotech International, an EdenRoc Sciences company](https://www.metrobiotech.com/), NAD boosters (2015-present)"
$ grep -n -i "metro\|disclos" hl52-episode.md
  no MetroBiotech mention in the episode (only the site footer link "Disclaimer & Disclosures")
$ grep -c "" yt-hl52.md -> 3284 lines; the caption track carries no cue times
$ which yt-dlp youtube-dl ffmpeg -> none; python -c "import youtube_transcript_api" -> ModuleNotFoundError (readiness finding)
```

The publisher page states chapter media times (`?timestamp=3405` "Resveratrol, NAD, NMN, NR; Dosage, Timing", next chapter
`?timestamp=4150`); no per-sentence media time is capturable with the installed tools, so the claim is located by quote.

Chosen claim: David A. Sinclair, guest on Huberman Lab episode 52 (published 2021-12-27), states that taking NMN for about
two weeks doubles blood NAD on average, citing unpublished clinical trials; his self-disclosure page as archived 18 days
before lists MetroBiotech ("NAD boosters", F,I,E,A,B,IP). The episode does not mention MetroBiotech.

### 2.2 Evidence mission captures (R2): PubMed and PMC through NCBI E-utilities (curl, no key)

```
$ curl -s ".../esearch.fcgi?db=pubmed&term=(nicotinamide mononucleotide[Title] OR NMN[Title] OR MIB-626[Title]) AND (NAD[Title/Abstract]) AND (randomized[Title/Abstract] OR trial[Title/Abstract]) AND human[mh]&retmax=60"
count 19: 42514320 42304075 42056497 41162813 40275690 39185644 39116016 38789831 38430946 38191197 37619764 36797393
          36482258 36002548 35441939 35182418 34238308 33888596 31685720
$ curl -s ".../esearch.fcgi?db=pubmed&term=MIB-626[Title/Abstract] OR (Igarashi M[Author] AND nicotinamide mononucleotide[Title])"
          42603990 40746868 36740954 35927255 35182418
$ for p in 35182418 36740954 36482258 35927255 38430946 42514320 31685720; do curl -s -D hdr-$p.txt ".../efetch.fcgi?db=pubmed&id=$p&retmode=xml" -o pubmed-$p.xml; done
35182418 HTTP 200   8686 B sha256:e0c39a48f89d31cac5c1953d5d45c3126bb98604e4d2fef73be0daa1d2e55829 (Date 2026-10-09T04:18:51Z)
36740954 HTTP 200  34546 B sha256:3d55660e84b1ea5bbe55dc2f20cc903c17aba5d8202fa1fc149ed453a8c60141 (04:18:52Z)
36482258 HTTP 200  22029 B sha256:9094d15aa0110b07463a0c8e7b1dc0f5c1ea087e4d1c24a8973ba22edfc763a7 (04:18:53Z)
35927255 HTTP 200  22955 B sha256:3ecd9ec76b2397933cb5f648db112be599d948c77fc53a4d5fcd41375b141e33 (04:18:54Z; not used)
38430946 HTTP 200   9937 B sha256:2e87e49f1ee3b7c389a4971ba23b9bf4ae4875cf24605bdde303d4c07a5407f4 (04:18:55Z)
42514320 HTTP 200  34659 B sha256:9096e58e926b03013d6d1339738d679a6f3a2f3eb41adc69c3b88f52dc7493b2 (04:18:56Z; not used: abstract reports no NAD outcome)
31685720 HTTP 200  15376 B sha256:a52c4d9cf3d67674cbbe41a1d81ea809a53db3862785fb95968ff741247340dd (04:18:57Z; not used: single dose, blood NAD not reported)
$ for c in 11491622 9735188 9158788; do curl -s -D hdr-pmc$c.txt ".../efetch.fcgi?db=pmc&id=$c&retmode=xml" -o pmc-$c.xml; done
PMC11491622 HTTP 200  19125 B sha256:39e0919b45ad619b9bed469117962048e841550e7e977f1c52081b29f5f53250 (04:19:28Z; front matter and abstract only, no body)
PMC9735188  HTTP 200 132466 B sha256:35cd5da84b36c67d46c219e9219ac334b8fbbe83670955345b515625cadbbd33 (04:19:29Z)
PMC9158788  HTTP 200 115989 B sha256:535652976b1fe80c3b717d1f65d4f7dfbf243f07f6567a5f6ce5c98a025d1199 (04:19:30Z; not used)
$ curl efetch db=pmc PMC9261366, PMC9036060; db=pubmed 35821806, 35479740
PMC9261366  HTTP 200 116618 B sha256:0f1fd6d73d1fae30a802429fee1578e7fea173bd42a3c4fa21b0c46066d61a35 (04:21:41Z)
PMC9036060  HTTP 200 129159 B sha256:7c0c1cd8f7deaf1e65c001d941fb181da04ba0a6158bc06c737acf134d8506de (04:21:43Z)
35821806    HTTP 200  16959 B sha256:544017c9615cedebf1933516f44c7ec93d2b3aacc0ba8e10a16aa622d3d117ac (not used)
35479740    HTTP 200  33334 B sha256:5272e16561b014a24aaddef0b927fa5f7ee800e73bc10da2559b321c2d250661 (not used)
```

Full text of Pencina 2023 (J Gerontol A, PMID 35182418) is not in PMC:

```
$ firecrawl scrape "https://academic.oup.com/biomedgerontology/article/78/1/90/6532484" --only-main-content --max-age 0 -> 601 B (navigation only)
$ firecrawl scrape "https://academic.oup.com/jcem/article/108/8/1968/7027634" --only-main-content --max-age 0 -> 591 B (navigation only)
$ curl -L -A "Mozilla/5.0" ".../article-pdf/78/1/90/48909943/glac049.pdf" -> HTTP/1.1 403 Forbidden (HTML, 5623 B)
$ firecrawl scrape "https://academic.oup.com/biomedgerontology/article-pdf/78/1/90/48909943/glac049.pdf" --max-age 0 -o oup-glac049-pdf.md
  -> 38206 B, Scrape ID 01a11ee3-d060-7382-b3c6-2d234d78d8e7, file time 2026-10-09T04:20:15Z
```

The PDF rendition contains the article text, Table 1, Funding and Conflict of Interest. It also contains Markdown tables
headed "A. NAD", "C. 2-PY" … with round numbers and empty cells that are not article text: the tool's digitization of
Figure 1. They are not used as evidence; the NAD fold change at Day 14 cannot be read from the article text (Table 1
reports baseline-corrected Cmax and AUClast only; the absolute baseline is in the figure).

Key reads (python over the captures; locators are generated on the raw captured strings by `gen.py`, section 2.4):

- Pencina 2023 J Gerontol: 32 adults, 1 000 mg MIB-626 once or twice daily or placebo for 14 days; "MIB-626 treatment was
  associated with substantial dose-related increases in blood NAD levels."; Table 1 NAD Cmax (baseline-corrected, µg/mL)
  placebo 1.36 (74.9), once daily 23.0 (35.1), twice daily 40.4 (40.1); "Received: December 14, 2021"; "This project was
  funded by a research grant from Metro International Biotech."; "S.L. and D.L. are employees of Metro International Biotech."
- Pencina 2023 JCEM (PMID 36740954, PMC11491622): 2 × 500 mg twice daily for 28 days; contributor Sinclair, David A with
  affiliation "Metro International Biotech" (PMC front matter); GrantList Agency "Metro International Biotech".
- Yi 2023 GeroScience (PMID 36482258, PMC9735188): 300 / 600 / 900 mg for 60 days; Table 2 NAD (nM) 600 mg 7.95 ± 3.29 →
  day 30 39.0 ± 12.6 → day 60 45.3 ± 11.8; 900 mg 10.5 ± 6.8 → 43.1 ± 14.3 → 48.5 ± 19.8; serum "NAD+ + NADH"
  (colorimetric kit); first post-baseline sample at day 30; COI: authors employed by Abinopharm and Aba Chemicals.
- Huang 2022 Front Aging (PMC9261366): 300 mg/day, day 60 NAD+/NADH +38 % vs +14.3 % placebo, "not statistically significant".
- Kuerec 2024 Mech Ageing Dev (PMID 38430946): post-hoc of the Yi trial, "a large coefficient of variation (29.2-113.3%) within group".
- Okabe 2022 Front Nutr (PMC9036060): 250 mg/day for 12 weeks; "the extent of this increase may vary among individuals".

### 2.3 R2 verification re-capture of the episode page

```
$ firecrawl scrape "https://www.hubermanlab.com/episode/dr-david-sinclair-the-biology-of-slowing-and-reversing-aging" --max-age 0 -o hl52-episode-r2.md
  Scrape ID 01a11ee6-fa92-734b-9da5-876755c52e43, 2026-10-09T04:23:37Z, 150589 B,
  sha256:85cdbb3355b8f480d473cc293ebbf3fd12237dce8a1116a2e0833aa1960ad77b
$ grep -c "you'll double, on average double your NAD levels in the blood" hl52-episode-r2.md -> 1
```

### 2.4 More captures added while writing the report

```
$ firecrawl_search (MCP) "Morita Izawa Hirano 'Clinical evaluation of changes in biomarkers by oral intake of NMN' Glycative Stress Research 2022"
  -> J-STAGE article page https://www.jstage.jst.go.jp/article/gsr/9/2/9_33/_article (open access)
$ curl -s -D … -A "Mozilla/5.0" ".../gsr/9/2/9_33/_article" -> HTTP 200, 87305 B, sha256:6ced34eb5737255338fa5be3f65695d3554bdbca997943b7e5fb8c5b5ba4972b (04:29:43Z; not quoted)
$ curl -s -L ".../gsr/9/2/9_33/_pdf/-char/en" -> HTTP 200 application/pdf, 4135873 B, sha256:801b288c4e60ea67eb1d3f7518247871e3e2490fa96058b716303afdcd077124 (04:29:52Z)
$ pdftotext -enc UTF-8 jstage-gsr9-33.pdf (pdftotext 4.00) -> 37134 B, sha256:9c44a7f142cf33146494bfb123490cd636fb369d524824c21148aa79bf7791d7
  line 184: "NAD also showed a significant decrease from 17.4 to 13.7 ng/mL, p < 0.05, while NMN showed no significant change from 1.32 to 1.28 ng/mL."
  "Conflict of Interest Statement / Authors have no conflict of interest in this study."
$ curl efetch db=pmc id=11205942 (review, PMID 38921475) -> HTTP 200, 295427 B, sha256:32103e76b6d993c5f020ac9a3c00b3719039d1a4bb1e8c2f1e011abc44aaed74 (04:36:14Z)
  table cell "NMN: 0.0882 (µg)<break/>NAD: 23.0 (µg)" for "1000 mg NMN 1× Daily n = 12": corroborates the tool-rendered Table 1 of Pencina 2023
COI and funding read from the captures: Yi 2023 "fully funded by Aba Chemicals Co. … and Abinopharm, Inc."; product "AbinoNutra™NMN …
  developed and manufactured by Aba Chemicals"; Huang 2022 "Author HH was employed by Effepharm (Shanghai) Co., Ltd." (no captured
  link between Effepharm and the product -> independence UNKNOWN); Okabe 2022 "funded by Mitsubishi Corporation Life Sciences Limited",
  "employees of Mitsubishi … prepared NMN and the placebo", visits at "0-week … 4-, 8-, 12-week"; Kuerec 2024 affiliations include
  Abinopharm and ABA Chemicals (PubMed AffiliationInfo).
```

### 2.5 Generator (scratch `synth/xfx-claim/`): gen.py → build2.py → emit.py

```
$ python -I -X utf8 gen.py cap/ <fixture dir>            (first run 2026-10-09T04:35:02Z, frozen in clock.json)
  snapshots 16 locators 59
  D7 reselect {'loc-sin-metrobiotech': {'rawEqual': False, 'equalAfterNbspToSpace': True}, 'loc-sin-edenroc': {'rawEqual': True, ...},
               'loc-sin-legend': {'rawEqual': False, 'equalAfterNbspToSpace': True}}  D9 w1 True
  (anchor failures fixed along the way: NBSP in the archive copy and in the J Gerontol PDF rendition, thin spaces U+2009 in the PMC
   table cells, "2 months" with NBSP in Huang; each fixed by moving the anchors, never by editing captured text)
$ python -I -X utf8 build2.py <fixture dir>
  records 203 assertions 40 assessments 7 adjudications 28
  families {'pub-pencina-jg': ['INTERESTED_PARTY'], 'pub-yi': ['INTERESTED_PARTY'], 'pub-kuerec': ['INTERESTED_PARTY'],
            'pub-huang': ['UNKNOWN'], 'pub-okabe': ['INTERESTED_PARTY'], 'pub-morita': ['INDEPENDENT']} distinct 6 independent 1
  bodyDigest sha256:f11f7d49e853db7d9dd6654ebceb48fda6da58a3e8c6e0e1f9cdf469c260191f
  bundle     sha256:f5f40226acf0b7f1963d4d3ea17a4627ea4c173c39a3fafa3a115307132bf487  citationCompleteness 0.9444 (17 / 18)
  propositionHash claim-avg       sha256:b63b223b105020831467ea8cc78738597dc447968197abff9653720c6ecb045a
                  claim-universal sha256:b4c5ce44d5bc3f090e628f853c634072e46dcd679f8553484f6568ea8437411f
                  claim-broad     sha256:f038d9ae7df764094a7d2496f18ac78bb25fece2e4e7b1938eaf017744a5f38a
$ python -I -X utf8 emit.py <fixture dir>
  intent.json sha256:a2e811d44b69a8832f40f4cce90507e46e6930bdf7077199356e1597ac8efcfd (2 proposals)
  intent-r2.json sha256:c17ebe5c762349f1ea1054de9f427762e20f5d7e4a6624ec9dddb1c63d250efc (27 proposals)
$ node validate.mjs <worktree> <fixture dir>     (IngestionIntent.safeParse from packages/contracts/dist/ingest.js)
  OK   intent.json: 2 sources, 9 locators, 3 subjects, 2 proposals (edge.assert)
  OK   intent-r2.json: 11 sources, 44 locators, 13 subjects, 27 proposals (edge.assert, assertion.literal, identifier.attach)
```

Modeling corrections made during the run:
- The occurrence predicate was first a new value; it now uses the D2-registered INCREASES_LEVEL_OF with the qualifier
  `compartment: blood`.
- Morita is now DECREASES_LEVEL_OF POSITIVE, with no OCCURRENCE_OF (cardinality zero_or_one), instead of a NEGATIVE occurrence.
- The Morita uid lost its underscore, because the `@bks/contracts` Uid regex rejects `_`.
- Huang's independence moved from INTERESTED_PARTY to UNKNOWN.
- Two report sentences were rewritten after a fact check: Okabe's first sample is at 4 weeks, not at 30 days or later, and
  "maker of the NMN tested" is now stated per trial, only from located spans.

### 2.6 Re-selection from the written files

```
$ python (yaml load of locators.yaml): sha256(selectorJson) == selectorDigest, sha256(NFC exact) == quoteHash, selectorJson.exact == exact
  -> locators 59 snapshots 16 bad 0
$ python (re-select from captures): every snapshot contentHash re-hashed from scratch files; every TEXT_QUOTE re-selected at its
  UTF-16 offsets -> reselected 58 mismatch 0 (+1 WHOLE_SNAPSHOT absence locator)
```

### 2.7 Disposable Neo4j (bks-neo4j-synth, 5.26.31, bolt 7691): load and patterns

```
$ docker exec bks-neo4j-synth cypher-shell … "MATCH (n) RETURN labels(n)[0], count(*)"   (pre-existing data of other S agents, untouched)
$ python -I -X utf8 load.py  -> load.cypher (948 statements; every node tagged fx:'xfx-claim', MERGE-free CREATE after
  "MATCH (n {fx:'xfx-claim'}) DETACH DELETE n")
$ docker exec -i bks-neo4j-synth cypher-shell -u neo4j -p *** --format plain < load.cypher   -> exit 0
$ … "MATCH (n {fx:'xfx-claim'}) RETURN count(n)" -> 203 ; relationships between them -> 744 (22 types, all in the assembled SDL:
  checked by grep -c 'type: "<T>"' final_biotech_schema_v2.graphql for each)
$ … < queries.cypher  (K Q-K-04, Q-K-05 x2, Q-K-06 x3, Q-K-07 x3, Q-K-08 x2, Q-K-01 x2, CQ-CL-05 x2, Q-K-21, Q-K-19) -> exit 0, queries.out
$ … < queries2.cypher (Q-K-04 with a deterministic label key) -> 188 distinct records, 195 WAS_GENERATED_BY edges
$ … < queries3.cypher (Q-K-17 citations: HAS_EVIDENCE 27 / DERIVED_FROM 24, changed 0; 3.8 trace; item citation counts 2/11/4/7/2/2)
$ … "CYPHER 25 MATCH (a:Activity {missionId:'x'}) RETURN count(a)" -> "25 is not a valid option for cypher version. Valid options are: 5"
$ … "EXPLAIN MATCH (x:$('Claim') {uid:'u'}) RETURN x" -> plan returned (dynamic labels accepted)
```

The key outputs are quoted in `walk.md` and `questions.md`. One finding: Neo4j returned `labels(n)` as `["Entity", "Claim"]` for a node
created `:Claim:Entity`, so the K pattern's `labels(n)[0]` groups records under "Entity" and "InformationArtifact".

## 3. Files written

`final/fixtures/cross-domain/claim-mission-report/`: source.md, locators.yaml (16 snapshots, 59 locators, 4 referenced sibling
locators), assertions.yaml (7 Activities, 4 Agents, 16 entities, 14 Sources, 3 Claims, 40 Assertions, 7 Assessments, 3 named
Adjudications + 25 CAPTURE_FIDELITY records, 1 Report, 6 ReportItems, lineage index), intent.json, intent-r2.json,
composed-body.txt, questions.md, walk.md. This runlog. Scratch only: captures, gen.py, build2.py, emit.py, load.py, validate.mjs,
queries*.cypher and *.out, stage1.json, stage2.json, clock.json.

## 4. Open items handed back

- F1, F2, F3 and F5 (query-patterns: CYPHER 25 prefix on 5.26; `labels(n)[0]`; no ASSERTED_BY role in Q-K-05; HAS_IDENTIFIER not
  counted by Q-K-04 part 2).
- F4 (D7 locator NBSP) and F6 (D7 `entityKind: UNSPECIFIED`, not a final enum value).
- F7 and F8 (tooling: Firecrawl PDF figure digitization, no caption-timecode tool, OUP 403).
- F9 (D3 StudyResult not instantiated for the metric assertions; fixture metric predicates unregistered; intent v1 expressiveness).
- RESOLUTIONs as-res-metro and as-res-trial stay PROPOSED: no company registry record was captured, and the episode names no trial.

## 5. Cleanup

```
$ docker exec bks-neo4j-synth cypher-shell … "MATCH (n {fx:'xfx-claim'}) DETACH DELETE n RETURN count(*)" -> 203 deleted; remaining 0
  (only this fixture's nodes; other agents' data and the container untouched; reload with load.cypher to re-run walk.md)
```

---

<!-- stage: _runlog/migration.md -->

# Runlog: migration notes (S, MIGRATION NOTES role), 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Writes only `final/migration-notes.md`, `final/_work/diff-v1-v2.mjs` (+ its outputs `diff-v1-v2.json`, `diff-v1-v2.tables.md`), `final/_work/planner-probe-v2.mjs`, `final/_work/consumer-check-v2.mjs`, and this log. Scratch: `<scratchpad>/synth/mig/` (probe and consumer-check JSON outputs). Nothing committed; no packet, pinned, workspace, scripts or packages file touched.

## 1. Inputs surveyed

```
$ git log --oneline -1   -> e484fd2 Schema program checkpoint
$ ls schema/program/final -> decision-report.md node-register.yaml relationship-register.yaml schema-map.md seams.yaml size-report.md _work/ _runlog/ schema/
$ v1 IR: workspace/schema-ir.json  (irVersion bks-schema-ir.v1, nodes 192, relationshipTypes 393, enums 183, unions 39, interfaces 11, edgePropertyTypes 47)
$ v2 IR: final/schema/final_biotech_schema_v2.ir.json (schemaDigest sha256:d233930272c7…, nodes 69, relationshipTypes 106, enums 193, unions 16, interfaces 2, edgePropertyTypes 20)
$ node <scratch>/mig/peek.mjs  -> packet 06 mergedInto shapes: K/D5/D8/D9/D11/D12/D13 {pinned,into,...}; D1/D4/D7/D10 {from,into,how}; D2 {type,into,how}; D3/D6 {name,into,how|reason}
$ node <scratch>/mig/peek2.mjs -> final/node-register.yaml: nodes 69, deferred 108, mergedInto 227, retiredEnums 2, unionsRetired 8
                                  final/relationship-register.yaml: relationships 109, predicateOnly 203, deferred 386, mergedInto 2, removedRegistrations 6
                                  packets (sum): mergedInto 227, node deferred 107, rel deferred 375, predicateOnly 229
```

## 2. Code read (no command output; line references used in migration-notes)

`packages/kg-ops/src/plan.ts` (840 lines), `read.ts`, `resolve.ts`, `schema-access.ts`, `operations.ts`; `apps/graphql-api/src/server.ts`, `print-schema.ts`, `limits.ts`, `Dockerfile`; `packages/contracts/src/ingest.ts`, `common.ts`; `schema/sidecars/*.yaml`; `packages/schema-workspace/src/sidecars.ts`, `build.ts`; `packets/K/11-open-questions.md` (P1–P21), every packet's 11-open-questions intent-gap item; `final/decision-report.md` R-02, R-03, R-04, R-11, R-40.

```
$ grep -n "mongoResearchRunId|Mention|SUPPORTED_BY|externalRun|TradeItem" packages/kg-ops/src/*.ts apps/executor/src/*.ts
  plan.ts:141 nodeDefaults …mongoResearchRunId; :176 ON MATCH SET n.mongoResearchRunId; :196-197 externalRunSystem/externalRunId; :517 MERGE (a)-[:SUPPORTED_BY]->(loc);
  :524 EXECUTOR_EDGE_FIELDS …"mongoResearchRunId"; :608 "TradeItemIdentifier"; :627 :657 :701 :757 :763 :809 r./n.mongoResearchRunId; :796 (a)-[:SUPPORTED_BY]->; :823-828 Mention
  read.ts:144 :162 SUPPORTED_BY; :148 externalRunSystem/externalRunId
$ grep -n "INTENT_VERSION|…" packages/contracts/src/*.ts -> ingest.ts:18 biotech-knowledge-intent.v1, :19 plan.v1, :20 receipt.v1; read.ts:15 read-intent.v1; common.ts:19 "runId is the external run id the Activity node records as externalRunId"
$ grep apps/graphql-api/Dockerfile -> :15 COPY schema/pinned schema/pinned; :27 COPY --from=build /repo/schema/pinned apps/graphql-api/dist/schema
```

## 3. Type-level diff (script)

```
$ node schema/program/final/_work/diff-v1-v2.mjs
  -> writes final/_work/diff-v1-v2.json (607,137 B) and final/_work/diff-v1-v2.tables.md (200,610 B)
  inputs: v1 sha256:8313a6f8… nodes 192 rels 393 enums 183 unions 39 interfaces 11 edgeProps 47
          v2 sha256:d2339302… nodes 69 rels 106 enums 193 unions 16 interfaces 2 edgeProps 20
          mergedInto rows 227, node deferred rows 108, rel deferred rows 761 (final + packets; de-duplicated per module/name/reason when applied), predicate rows 434
  nodes: kept 49, merged 119, renamed 3, removed:folded 13, removed:deferred 8   (sum 192)
         v2-only 20 = new 6 + absorbing >1 v1 type 11 + rename targets 3
  relationship types: kept 50, merged 111, renamed 15, demoted 30, removed:pattern 66, removed:deferred 114, removed:unmapped 7   (sum 393)
         v2-only 56 = new 17 + absorbing >1 v1 type 24 + rename targets 15
  kept relationship types: class changed 7, edge-property type changed 31
  properties: verified renames 9 (mongoResearchRunId→lastWriterRunId on every mapped type + 8 others); types compared 178; fields removed 2,172, added 1,991
  mongoResearchRunId: v1 on 192 node types + 42 edge-property types; v2 on 0; lastWriterRunId on 69 node types + 20 of 20 edge-property types
  enums: kept 59 (29 with value changes), removed 124 (9 with a named replacement), new 134; unions kept 1 / removed 38 / new 15; interfaces kept 1 / removed 10 / new 1; edge-property types kept 6 / removed 41 / new 14
```

Iterations (same command; the script was edited between runs). Run 1 left 13 relationship types unmapped and classed only 13 as demoted. Added, in order: (a) "Replaces A, B" scanning of v2 relationship-register entries and v2 relationship docstrings (SUPPORTED_BY → HAS_EVIDENCE, EVALUATES → ASSESSES, HAS_EPISODE/HAS_SERIES/DISTRIBUTES_RENDITION → PUBLISHES …); (b) deferred reasons that are themselves a v2 type name; (c) predicate detection in deferred reasons; (d) slash-list pairing for property renames (run 1 paired `ciUpper → intervalLower`); (e) `into` texts starting "string id / property / enum" classed as folded (PolicyVersion); (f) arrows count only with the deferred type on their left (run 3 mapped RECOMMENDS → HAS_SUBJECT from an unrelated arrow; now demoted → RECOMMENDS_USE). A Python patch left one literal backspace byte in the script (`\b` → 0x08); found with `od -c`, replaced, `grep -c $'\x08'` → 0. Final-run numbers are the block above.

```
$ node <scratch>/mig/evals-map.cjs     (per eval task: v1-only names and their v2 class)
read-01-what-do-we-know: MARKETS_PRODUCT (removed:pattern → NAMES_RESPONSIBLE_PARTY/SELLER_OF_RECORD)
read-02-as-of: none
ingest-01-price-observation: CONTAINS (removed:deferred), HAS_PRICE_OBSERVATION (removed:deferred), PriceObservation (merged → Offer)
ingest-02-correction: HAS_FORMULATION_VERSION (merged → HAS_LABEL_VERSION), SUPPORTED_BY (merged → HAS_EVIDENCE), FormulationVersion (merged → LabelVersion)
ingest-03-forbidden: ADVISES_ORGANIZATION (merged → HOLDS_ROLE), ENDORSES_PRODUCT (demoted → predicate RECOMMENDS_USE), RECOMMENDS (demoted → predicate RECOMMENDS_USE), SUPPORTED_BY (merged → HAS_EVIDENCE)
$ node -e (v2 IR inspection) -> AssertedRecordedProperties: relationshipUid!, assertionUid!, recordedFrom!, recordedTo, lastWriterRunId (30 v2 types use it; AssertedEdgeProperties 19)
     SourceLocator requires selectorKind!, selectorDigest!, selectorJson!; Activity requires activityKind!, externalRunSystem!, runId!
     SelectorKind v1 7 values → v2 13 (TEXT_POSITION, MEDIA_TIME, PDF_PAGE, IMAGE_REGION, SECTION gone); ActivityKind v1 15 → v2 7 (no overlap)
     SourceSnapshot.contentHashBasis: v1 enum ContentHashBasis → v2 String (R-35 vocabulary); Source.genre String
     Adjudication.evaluates = ASSESSES → Assertion
```

## 4. Planner probe (current kg-ops dist, read-only against bks-neo4j-synth)

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** "SHOW FULLTEXT INDEXES YIELD name RETURN count(*) AS fulltext"  -> 0
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** "MATCH (n) RETURN count(n) AS nodes"                          -> 0
$ NEO4J_PROBE_PASSWORD=*** node schema/program/final/_work/planner-probe-v2.mjs <scratch>/mig/planner-probe.json <77 packet intents (packets/*/07-fixtures/*/intent*.json) + examples/ingestion-intent.example.json>
  intents 78; context.activityKind: EXTRACTION 40, INGESTION 37, RESEARCH 1
  v1 model (pinned IR): thrown 77 ("Cannot run query in this transaction, because it has been rolled back"), rejected 1. The probe DB has 0 fulltext indexes;
     resolveMentions' fulltext query fails inside the managed read transaction and its catch cannot revive the transaction. Not a usable baseline on this DB.
  v2 model (candidate IR, planner unchanged): applicable 0, partial 0, rejected 63, thrown 15 (UNKNOWN_NODE_TYPE: unknown node type Mention)
     plan errors: INVALID_ACTIVITY_KIND 32, INVALID_SOURCE_PROPERTY 4, LOCATOR_WITHOUT_SNAPSHOT 1
     subject reasons: TYPE_NOT_CREATABLE 791 ("<T> excludes CREATE in @mutation"), REQUIRED_PROPERTY_MISSING 289, "node type X has no registered uid token" 90, INVALID_PROPERTY 37
  v2sim (v2 + every node creatable + EXTRACTION→INGESTION + mention.stage proposals dropped): applicable 1, partial 32, rejected 41, thrown 4
     thrown: TypeError at plan.js:761 (assertion.literal: `assertion.properties.find((p) => p.name === k)!` is undefined for quantityBasis/massBasis/amountReferent) in 3 packet intents + examples/ingestion-intent.example.json
     proposal reasons: SUBJECT_CONFLICT 416, SUBJECT_REVIEW_REQUIRED 268, SUBJECT_MISSING 138, RELATIONSHIP_NOT_IN_SCHEMA 35 (DIRECTLY_ACTIVATES 12, CAUSES_ADVERSE_EFFECT 6, USE_CONSTRAINED_IN 4, INTERACTS_WITH 3, REPORTS_ASSOCIATION_SCORE 2, …),
        LITERAL_VALUE_REQUIRED 34, RELATIONSHIP_ENDPOINTS_INVALID 32 ("<T> has no HAS_IDENTIFIER field": ChemicalSubstance 19, Study 4, MerchantListing 4, Publication 2, Device 2, …),
        INVALID_EDGE_PROPERTY 29 (RoleEdgeProperties.roleTitleVerbatim 13, StakeEdgeProperties.stakeClassVerbatim 13, FoodContentProperties.statementKind missing 2, RevisionEdgeProperties.reasonsVerbatim 1), EPISODE_NOT_FOUND 2, DEPENDS_ON_HELD 3, INVALID_ASSERTION 1
     subject reasons: REQUIRED_PROPERTY_MISSING 326 (entityKind 134, productKind+marketedName 31, materialKind 27, descriptionVerbatim+definingSystem 14, brandKind 14, …), NO_UID_TOKEN 116 (LabelVersion 16, Intervention 15, Brand 15, Package 12, FoodCategory 9, …),
        INVALID_PROPERTY 37 (SourceRevisionKind "RETRACTED" 9 / "NONE_KNOWN" 5 on Publication.revisionStatus; Metric/Biomarker/IngredientMaterial.searchText "derived search projection" 16)
  v2sim write audit (statements of the non-rejected plans): relationship SUPPORTED_BY written 238× in 32 intents (absent in v2); edge property mongoResearchRunId 310× in 28 intents;
     153 (label, property) pairs absent in v2: maturity, schemaVersion, mongoResearchRunId on 39 labels; Activity.description, Activity.externalRunId;
     Assertion.agentRunUid, amountReferent, assertionBasis, extractionMethod, jurisdiction, massBasis, predicateClass, quantityBasis, segmentKind, statedAsOf, statedAsOfPrecision, statedTense;
     SourceLocator.uri, section + 13 fixture-supplied keys (byteStart, byteEnd, jsonPointer, xpath, htmlSelector, normalization, …); SourceSnapshot.canonicalUri + 7 fixture-supplied keys
```

Iterations: run 1 had only v1/v2 (v2 plans all rejected, so the write audit saw no statements); added the v2sim model; run 2 added reason samples; one Python patch turned `"\n"` into a real newline in the script (syntax error), fixed with Edit.

## 5. Consumer check (sidecars, renderer, operations file, replay set, repo consumers)

```
$ node schema/program/final/_work/consumer-check-v2.mjs <scratch>/integrate/printed-deployed.graphql C:/Users/Pinda/Proyectos/Biotech/biotech-meta/docs/schema <scratch>/mig/consumer-check.json
  sidecars: validateSidecars(v2 IR) 264 errors (domains.yaml 75, terminology.yaml 90, task-routes.yaml 64, identity-rules.yaml 32, ingestion-rules.yaml 3); the same sidecars on the v1 IR: 0
            ingestion-rules.yaml: kernel plumbing SUPPORTED_BY and USED do not exist; edge profile StateEpisodeProperties does not exist
            renderWorkspace(v2 IR) renders 752 files without throwing (build.ts:12-13 runs validateSidecars first and throws)
  operations.cypher (pinned): 1,151 statements (564 constraints, 336 indexes, 32 fulltext, 3 vector, 216 other); 561 name a label absent in v2 (155 labels); 314 name a relationship type absent in v2 (142 types)
  validation params inherited by the v2 IR: 190 uid tokens (141 for types absent in v2; 20 v2 node types without one); 482 registered predicates (pinned registry);
            assertedTypes absent in v2 125, derivedTypes 39, exclusiveTypes 6; v2 node types whose SDL allows CREATE: 0 of 69
  GraphQL ops of the replay set (7 files, 25 operations) validated against the printed v2 API: valid 4, invalid 21 (7 mutations: v2 has no Mutation root; 14 unknown field / type / enum value)
     per file: roundtrip-ops.json 2/6, W00 graphql-ops-T1 0/2, T2 1/4, T3 0/1, T4 1/4, T5 0/4, T6 0/4
  Cypher files of the replay set: 257 — replays (names unchanged) 3, rewrite: remodel (>= half of references unchanged) 197, rewrite: remodel (< half) 50, lost (> half of references to removed types) 3, no schema references 4; median kept share 0.65
     most common removed names (files): :VersionedState 113, SUPERSEDES 47, :Facility 21, REANCHORS 19, :PolicyVersion 18, USED 18, AUTHORIZED_BY 15, ASSESSES_APPLICABILITY_TO 14, HAS_PRICE_OBSERVATION 13, HAS_EVIDENCE_TARGET 13
  repo consumers naming v1-only types/fields (quoted or label-like uses): evals 2 files, examples 1, biotech-* skills 4, python 1, graphql-api 1, executor app 1, kg-ops src 4, contracts src 5, sidecars 3
```

Iterations: run 1 counted mutation operations as valid (graphql.validate has no rule for a missing Mutation root; added an explicit check: 11 valid → 4) and matched skills under every path containing "biotech-" (the worktree path itself); run 2 matched prose words ("Community", "CONTAINS"); the final run restricts name matches to quoted / label-like uses and to `.agents/skills/biotech-*`, and the graphql-api scan to `src/`, Dockerfile, fly.toml, package.json.

Spot checks used in the notes:

```
$ node (apps/graphql-api) per-operation validate of the 25 replay GraphQL operations against the printed v2 API
  valid: roundtrip "read product back", "read Cypher-ingested assertion", T2d, T4d; mutations (no Mutation root): roundtrip 3 + T5 4;
  others: Query.documents, Query.sourceRevisionEvents, Query.equivalenceAssessments, type FormulationVersion, Assertion.supersedesConnection/massBasis/quantityBasis/predicateClass,
          Adjudication.status/supersedesConnection/considersAssessments, SourceLocator.artifactType, Source.sourceKindNote/renditionOfPublication/revisionEvents, Activity.usedAssertions, ActivityKind ANSWER_COMPOSITION
$ grep -l (packet intents) -> Publication.revisionStatus RETRACTED|NONE_KNOWN: D3 aspree-registry-history-harm, dq-bone-trial-unstructured, resveratrol-retraction
                              roleTitleVerbatim|stakeClassVerbatim: D7 ×5, D9 ×3; searchText: D1 ×4, D4 ×6; mention.stage: 14 intents; GTIN/UPC/EAN/ASIN/SKU schemes: 5 intents
$ node (IR) v1 SPONSORS_CONTENT Organization|ConsumerBrand → Channel|Conference|Document|Episode|Series; v2 CONTENT_SPONSORED_BY MediaWork → Brand|Organization (direction reversed)
$ read W00/fixtures/00-common-base.cypher, 06-two-archetype-labels-must-fail.cypher, W07/fixtures/w07-00-sources.cypher -> v1 property/enum shapes (activityKind EXTRACTION, entityType, artifactType, sourceKind genre values, SourceLocator.uri, selectorKind SECTION)
```

## 7. Data-migration statements (EXPLAIN only, bks-neo4j-synth, Neo4j 5.26)

```
$ docker exec bks-neo4j-synth cypher-shell -u neo4j -p *** --format plain "EXPLAIN <stmt>"   (8 statements, as printed in migration-notes §5.8)
OK  MATCH (n) WHERE n.mongoResearchRunId IS NOT NULL CALL { … } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH ()-[r]->() WHERE r.mongoResearchRunId IS NOT NULL CALL { … } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH (a:Assertion)-[r:SUPPORTED_BY]->(l:SourceLocator) CALL { … MERGE (a)-[e:HAS_EVIDENCE]->(l) … } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH (a:Assertion)-[r:CONTRADICTED_BY]->(l:SourceLocator) CALL { … } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH (adj:Adjudication)-[r:EVALUATES]->(a:Assertion) CALL { … MERGE (adj)-[:ASSESSES]->(a) DELETE r } IN TRANSACTIONS OF 10000 ROWS
OK  MATCH (act:Activity) WHERE act.externalRunId IS NOT NULL AND act.runId IS NULL SET act.runId = act.externalRunId REMOVE act.externalRunId
OK  MATCH (n:ConsumerBrand) SET n:Brand REMOVE n:ConsumerBrand
OK  MATCH (n:VersionedState) REMOVE n:VersionedState
```

## 8. Output

```
$ node <scratch>/mig/assemble-notes.cjs <scratch>/mig/migration-notes.head.md final/_work/diff-v1-v2.tables.md final/migration-notes.md
  -> final/migration-notes.md 176,688 B, 1,436 lines; appendices A1, A2, A3, A4, A5, A7, A8 copied verbatim from the generated tables (A6, the per-type field diff, stays in _work/diff-v1-v2.tables.md)
```
The narrative (sections 0–8) was written from the numbers in §§3–7; line references were re-checked with grep (plan.ts assertionProps :449–485, read.ts assertion.trace :139–154 and gap test :151, resolve.ts catch :119, server.ts loadPinnedSdl :103, createNeo4jGraphQL :163, excludeDeprecatedFields :168).

---

<!-- stage: _runlog/tooling.md -->

## Stage: tooling (action space, readiness scorecard, populatedBy rewrite), 2026-10-09

Worktree `biotech-knowledge-services-S`, branch `ft/schema-S`. Commands run from the worktree root in Git Bash. `SP` is the scratch directory `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/tooling`.

### 1. Re-run D11's generator against the packets in this worktree

D11's `build-action-space.mjs` reads every packet from its own agent worktree (`biotech-knowledge-services-<A>/…`) and writes into `packets/D11/`. Neither is allowed here. So the script was copied to scratch and six string replacements were made by `$SP/patch.mjs`:

- `here` → `packets/D11/_notes/action-space` in S.
- `worktree` → S.
- `pdir(p)` → `S/schema/program/packets/<p>`.
- The three output paths → `$SP/out/`.

The merge logic is unchanged.

```
cp packets/D11/_notes/action-space/build-action-space.mjs $SP/build-orig.mjs
node $SP/patch.mjs                      → patched 6
node $SP/build-S.mjs                    → entries 167, external 144, internal 23, aliases 402, packetRows 343,
                                          readinessExternal r3 35 / r2 51 / r1 35 / r0 21 / unscored 2,
                                          priority P0 52 / P1 74 / P2 11 / P3 30,
                                          topGaps G4 217q/82v1 498, G13 136q/64v1 327, G11 134q/55v1 311,
                                          unknownQuestionIds [], unresolvedPopulatedBy [], warnings []
cmp $SP/out/action-space.yaml        packets/D11/tooling/action-space.yaml        → IDENTICAL
cmp $SP/out/readiness-scorecard.md   packets/D11/tooling/readiness-scorecard.md   → IDENTICAL
cmp $SP/out/identifier-bridges.yaml  packets/D11/identifier-bridges.yaml          → IDENTICAL
sha256 action-space.yaml = 7c090d6c0559fb24bc43a39c3fccd4b5babaa8345e437a4f0da6f7b3608ab06f (both)
```

The packets as merged into S (after the review fixes) reproduce D11's committed output byte for byte.

### 2. final/tooling/action-space.yaml

```
cp packets/D11/tooling/action-space.yaml final/tooling/action-space.yaml
sha256 → 7c090d6c0559fb24bc43a39c3fccd4b5babaa8345e437a4f0da6f7b3608ab06f   (unchanged copy; schema kept)
grep -c '^  - id:' → 167 ; YAML parse → 167 entries, 402 aliases, 25 gaps
```

### 3. populatedBy rewrite (R-39)

```
cp final/relationship-register.yaml $SP/relationship-register.before.yaml   (sha256 bcad6734…986d69e)
node $SP/probe.mjs                         → 378 populatedBy values, all in `relationships` (109 entries);
                                              0 unresolved through aliases["<module>:<id>"]
node final/_work/rewrite-populatedby.mjs --check
                                           → valuesIn 378, valuesOut 347, viaAlias 378, renamed 368,
                                              duplicatesDropped 31, entriesChanged 109, distinct ids 80,
                                              unresolved [], notInActionSpaceAfter [], wouldChange true (exit 1 = would change)
node final/_work/rewrite-populatedby.mjs --report C:/…/final/_work/populatedby-rewrite-report.json   → exit 0
node final/_work/rewrite-populatedby.mjs --check
                                           → idempotent: viaAlias 10, alreadyCanonical 337, renamed 0, duplicatesDropped 0,
                                              entriesChanged 0, unresolved [], wouldChange false, exit 0
sha256 final/relationship-register.yaml → 1a322d894ef62dd75168c6f7f7b991c23fa3b13c99b5fe0c62b9d3717a3f6e5f
git diff --no-index --stat before after   → 337 insertions, 368 deletions; every changed line is a list item
                                              (the script also checks that the document minus populatedBy is deep-equal)
node final/_work/merge-registers.mjs --check-only   → violations 0, warnings 3 (the known I-03 double entries), exit 0
```

The 31 dropped duplicates are local ids that the alias map merges into one tool. They were found by grouping the report's `changes` by target:

- D7's SEC form sources plus `tool:sec-edgar-http` → `sec-edgar`.
- `src:orcid-*` plus `tool:orcid-api` → `orcid`.
- `src:nih-reporter` plus `tool:nih-reporter-api` → `nih-reporter`.
- `src:gleif-level2` plus `tool:gleif-api` → `gleif-lei`.
- `src:companies-house-psc` plus `tool:companies-house-web` → `companies-house`.
- `src:npi-registry-other-names` plus `tool:npi-registry-mcp` → `nppes-npi`.
- D3 `pubmed` plus `pmc-jats` → `ncbi-eutils-pubmed`.
- D3 `isrctn` plus `isrctn-web` → `isrctn`.
- D2 `hagr-drugage-bulk` plus `hagr-genage` → `hagr`.
- D4's three wearable API docs → `wearable-api-docs`.
- D8 `nsf-listings` plus `informed-sport` → `certification-databases`.

**Caution:** `merge-registers.mjs` without `--check-only` regenerates `relationship-register.yaml` from `_work/registers/*.relationship.yaml`. Those fragments still carry the packet-local ids. Re-run `rewrite-populatedby.mjs` after every re-merge.

### 4. final/tooling/readiness-scorecard.md

```
node final/_work/build-tooling-scorecard.mjs
  → entries 167; catalog 453 → survivors 454 (CQ-PF-03 → 03a v1 + 03b v2, R-08; decision-report "No cut was made.")
    needing a tool 430; value-1 survivors 154, needing a tool 149, needing a readiness ≤ 1 tool 111
    priority P0 52 / P1 74 / P2 11 / P3 30, changed 0
    register additions: 4 entries / 6 entry-question links — bks-entity-resolution +3 (Q-D2-06 via D3 INVESTIGATES; Q-K-21, CQ-EV-05 via D3 RENDITION_OF),
      isrctn +1 and ncbi-eutils-pubmed +1 (Q-D2-06, D3 INVESTIGATES), crossref-rest +1 (Q-K-21, D3 RENDITION_OF); 2 gaps (G13 +1, G15 +1)
    relationship types 106: best tool readiness 3 → 62, 2 → 36, 1 → 4, 0 → 4; 8 types with no tool above readiness 1
      (BLOCKED_BY, CHUNK_OF, COVERS_LOCATOR, MENTIONS, OCCURS_IN, RESOLVES_TO_CONSTRAINT, STATES_CONSTRAINT, USES_CRITERION; all best value 1)
    unresolvedPopulatedBy [], unknownRegisterQuestions [], weak entries (readiness ≤ 2 or unscored, ≥ 1 question) 103
    re-ranked by value: 1 G4 217q v1 82 · 2 G13 137q v1 65 · 3 G11 134q v1 55 · 4 G6 117q v1 44 · 5 G12 105q v1 36 ·
      6 G2 68q v1 31 (D11 rank 8) · 7 G8 74q v1 28 (D11 6) · 8 G7 73q v1 26 (D11 7)
node final/_work/build-tooling-scorecard.mjs --check   → no drift (deterministic)
sha256 final/tooling/readiness-scorecard.md → a71985a7e62b2466c6f051b47d4c7095fdc46827f1ab748abd920ae365ead5a7
```

### Files written by this stage

- `final/tooling/action-space.yaml`
- `final/tooling/readiness-scorecard.md`
- `final/relationship-register.yaml` (populatedBy only)
- `final/_work/rewrite-populatedby.mjs`
- `final/_work/build-tooling-scorecard.mjs`
- `final/_work/populatedby-rewrite-report.json`
- this log

Scratch only: `$SP/patch.mjs`, `$SP/build-orig.mjs`, `$SP/build-S.mjs`, `$SP/probe.mjs`, `$SP/out/*`, `$SP/relationship-register.before.yaml`.

### Not done here (for the coordinator)

- R-39 also says to rewrite every fixture `captureMethod` through the aliases. Fixtures belong to another S stage (`final/fixtures/` was being written while this stage ran), so this stage did not touch them. The alias map in `final/tooling/action-space.yaml` (`aliases`) is the input for that step.

---

<!-- stage: _runlog/openq.md -->

# Run log: open questions and handoff stage (S team, 2026-10-09)

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Writes: `final/open-questions.md`, `final/handoff-to-biotech-meta.md`, `final/_work/openq/` (generator and inputs), this file. Scratch: `…/scratchpad/synth/openq/`. Read-only in biotech-meta. No commit. No Neo4j or print-schema run in this stage (nothing it writes changes the SDL).

## 1. Inputs read

```
$ git status --short | head; git branch --show-current          -> ft/schema-S (packets staged by the coordinator)
$ wc -l schema/program/packets/*/11-open-questions.md           -> 1,087 lines in 14 files
$ wc -c schema/program/packets/*/11-open-questions.md           -> 355,214 B total
$ cat schema/program/fast-track/03-SYNTHESIS.md                 (deliverables, procedure, precedence)
$ wc -c final/{decision-report.md,size-report.md,schema-map.md,node-register.yaml,relationship-register.yaml,seams.yaml} final/_work/rulings.yaml
                                                                -> 113,288 / 12,413 / 259,054 / 153,333 / 307,875 / 306,795 / 52,926 B
$ cat final/decision-report.md                                  (read in full, 1,558 lines)
$ grep -c "^#### R-" final/decision-report.md                   -> 94
$ awk '/^#### R-/{h=$0} /^- \*\*Owner decision:\*\*/{print h" || "$0}' final/decision-report.md | grep -v "Owner decision:\*\* no\.$"
                                                                -> R-01, R-02, R-03, R-09, R-10, R-12, R-13, R-36, R-40 = yes; R-31 "no" (mapping values stay with the owner)
                                                                   (tally line 1474 "Owner decisions: 9" agrees)
$ grep -n "close-oq\|request-fixture" final/_work/rulings.yaml  -> 23 close-oq / request-fixture rows (used as a cross-check of the mapping)
$ cat packets/{K,D1..D13}/11-open-questions.md                  (read in full)
$ node -e '<dump review-open-issues.json>'                      -> open / rebutted items for all 14 packets
$ awk/sed of final/_runlog/module-*.md "Not done / Open items / Issues" sections, integrate.md
$ cat final/size-report.md                                      (headline numbers quoted in the handoff, attributed to it)
$ for t in validObservedAtPrecision CURATOR_CLASSIFICATION TOOL_RENDITION CANONICAL_PROJECTION "enum StateEpisode" "type Mention" independenceCount discourse methodVersion; do grep -c "$t" final/schema/final_biotech_schema_v2.graphql; done
                                                                -> 2 10 3 1 0 0 0 4 9  (R-49 metric fields absent: FU-01)
$ grep -n -i "discourse" final/schema/final_biotech_schema_v2.graphql -> docstrings only (lines 5794, 6155, 6404, 6892)
$ grep -n -i "polarity" final/decision-report.md                -> line 1291 only (no ruling on D10 #3: OD-37)
```

biotech-meta (read only):

```
$ ls docs/schema; ls docs/schema/ontology-lab; ls -R .../final-proposal-team/run-2026-10-04-fable51-01 | head
$ cat ontology-lab/README.md ontology-lab/proposal-index.md     (round protocol, promotion gates, 0.2.0 index sections 1–10)
$ cat .../run-2026-10-04-fable51-01/README.md 03-conflict-ledger.md; cat ontology-lab/round-template.md
$ head -60 README.md; head -40 OPEN-QUESTIONS.md; grep -n "^## \|^### " OPEN-QUESTIONS.md; head -40 CHANGELOG.md
$ sed -n '/^## Status after the final schema proposal run/,/^## Agent evaluation/p' OPEN-QUESTIONS.md
$ sed -n 1,40p .../reports/00-final-proposal-summary.md
```

This repository's pin and deploy touch-points:

```
$ ls schema schema/pinned; cat schema/pinned/PIN.json           -> pinnedAt 2026-10-07, sourceRun run-2026-10-04-fable51-01, 5 files with sha256/bytes
$ node -e '<print package.json scripts>'                        -> workspace:build, workspace:verify, schema:map, test, test:integration, neo4j:test:up, …
$ sed -n 1,140p packages/schema-workspace/src/cli.ts; grep -n "PIN\|pinned" packages/schema-workspace/src/load.ts
                                                                -> load.ts:26 readPinnedSdl() reads "final_biotech_schema_proposal.graphql"
$ grep -n "BKS_SCHEMA_PATH\|pinned\|readFile" apps/graphql-api/src/*.ts
                                                                -> server.ts:105 BKS_SCHEMA_PATH, server.ts:108 schema/pinned/final_biotech_schema_proposal.graphql
$ grep -n "pinned\|final_biotech_schema_proposal\|PIN" apps/executor/src/mcp.ts packages/kg-ops/src/*.ts …
                                                                -> kg-ops operations.ts:34 reads pinnedDir/operations.cypher
$ grep -n "schema" apps/graphql-api/Dockerfile                  -> lines 15 (COPY schema/pinned) and 27 (into dist/schema)
$ sed -n 1,40p scripts/fly.sh                                   -> deploy usage line
$ sed -n 1,80p evals/baseline-comparison/README.md
$ grep -n -o "SUPPORTED_BY\|mongoResearchRunId\|validFromBasis\|archetype\|WAS_GENERATED_BY\|relationshipUid\|entityType\|:Entity" score.py tasks.json
                                                                -> tasks.json:46 SUPPORTED_BY, :56 SUPPORTED_BY, :61 relationshipUid/validFromBasis, :62 WAS_GENERATED_BY, :64 entityType
$ node -e '<tasks.json ids>'                                    -> 5 tasks
$ grep -n "@neo4j/graphql\"" apps/graphql-api/package.json; node -e '<installed version>'   -> ^7.6.3 / 7.6.3
```

Sibling stages that landed while this stage ran (checked so no stale gap is reported):

```
$ ls final; for f in 00-SUMMARY.md questions-catalog.md query-patterns.md migration-notes.md requests.md RUNLOG.md vocabularies tooling/action-space.yaml; do [ -e final/$f ] …; done
      -> present: questions-catalog.md, query-patterns.md, vocabularies/, tooling/action-space.yaml; absent: 00-SUMMARY.md, migration-notes.md, requests.md, RUNLOG.md
$ ls final/vocabularies                                         -> answer-kinds, claim-lifecycle, frontiers, goal-polarity, identifier-schemes, targets, verdict-lattice (no predicates.yaml, no assessment-vocabularies.yaml)
$ head -40 final/fixtures/README.md; grep -c "Pending ruling edits" final/fixtures/README.md
      -> 75 fixtures, 388 files, 65 with ruling renames; structural edits listed as pending (FU-03 reworded)
$ sed -n '/^## .*[Oo]pen/,$p' final/query-patterns.md           -> Q-1..Q-6 (merged as OD-44, FU-07, FU-08, FU-01, OD-22, TL-03)
$ grep -n -i "ddl" final/query-patterns.md                      -> D-2 = _work/patterns-ddl.cypher, 229 statements
$ sed -n '/^## 4. Open points/,$p' final/_runlog/questions.md   -> OD-10 confirmed; FU-10
$ sed -n '/^### Not done here/,$p' final/_runlog/tooling.md     -> R-39 fixture captureMethod rewrite not done (FU-06)
$ sed -n '/^## Not done here/,$p' final/_runlog/vocabularies.md -> predicates.yaml / assessment-vocabularies.yaml not written; KN-15 items
$ sed -n '60,140p' final/_runlog/migration.md                   -> planner probe (v2: applicable 0 of 78, rejected 63, thrown 15); sidecars 264 errors;
                                                                   pinned operations.cypher 561/1,151 statements name absent labels, 314 absent rel types;
                                                                   inherited params 190 uid tokens (141 absent types); replay set GraphQL 4/25 valid, Cypher 3/257 unchanged
$ head -c 600 final/_work/populatedby-rewrite-report.json       -> register populatedBy rewritten (368 renamed, 0 unresolved); fixtures not (FU-06)
```

## 2. Question values (priority input)

```
$ node scratchpad/synth/openq/values.mjs <ids…>                 -> "ids with a value: 455" (453 packet ids + CQ-PF-03a v1 / CQ-PF-03b v2, R-08)
   catalog ids with no packet value: CQ-AX-05, CQ-AX-12, CQ-PV-06, CQ-PV-01, CQ-TM-05
$ grep -h "^| <ids> |" packets/*/02-questions.md               (question texts for BM-01..05, OD-19, OD-27, OD-41, OD-42 blocks cells)
$ grep -n -A12 "type: INCLUDES_TEST" final/relationship-register.yaml -> questions Q-D4-03, Q-D4-25 (FX-09)
```

## 3. Mapping and generation

```
mapping.tsv: 573 packet items (14 packets) -> entry ids / R-xx / CLOSED / MEAS; 10 ids renamed once with sed (KN-15→KN-14, MD-D6-04→BM-04, MD-D7-11→MD-D11-04, MD-D8-06→MD-D10-05, OD-40..45 renumbered)
build.mjs run 1: 143 entries, problems [] ; R-09 leaked into section 8 through secondary targets
build.mjs run 2: owner-decision rulings aliased to OD-01..OD-09 (R-01→OD-01, R-02→OD-02, R-03→OD-03, R-09→OD-04, R-10→OD-05, R-12→OD-06, R-13→OD-07, R-36→OD-08, R-40→OD-09); resolved table gets status/evidence columns
edit script run 1 failed ("missing: | GATE | OQ-D1-21 |", nothing written); rerun as edit2.cjs with the TL-02 anchor -> ok
build.mjs run 3 (after merging sibling-stage open points: OD-44, KN-15, FU-07..FU-10, TL-03):
$ node schema/program/final/_work/openq/values.mjs && node schema/program/final/_work/openq/build.mjs
{ "mappingItems": 573, "packets": 14,
  "primary": { "open entry": 196, "closed in packet": 128, "resolved by a ruling": 245, "closed by measurement": 4 },
  "anyOpen": 230, "anyRuling": 266, "entries": 150,
  "bySection": { "OD": 44, "KN": 15, "EX": 5, "BM": 7, "MD": 55, "FX": 11, "FU": 10, "TL": 3 },
  "ownerDecisions": 44, "odRuling": 9, "odConflict": 2, "odGate": 5, "odP1": 16,
  "priority": { "gate · P1": 3, "gate": 10, "none": 74, "P1": 39, "P3": 5, "P2": 18, "gate · P2": 1 },
  "resolvedRulings": 78, "rulingsInReport": 97, "problems": [] }
entries with no packet item (synthesis-sourced): OD-05 OD-11 OD-44 KN-15 MD-D5-07 MD-D10-06 MD-D12-02 FX-01 FX-04 FX-10 FU-02 FU-03 FU-04 FU-07 FU-08 FU-09 FU-10 TL-03
```

The generator was moved from scratch to `final/_work/openq/` (paths made relative) and re-run there; the output counts were identical.

## 4. Checks

```
$ node -e '<table cell-count check>'                            -> open-questions.md 238 table rows, 0 bad, 0 leftover placeholders; handoff 24 rows, 0 bad
$ grep -c "<!--" final/open-questions.md                         -> 0
$ sha256sum final/schema/final_biotech_schema_v2.graphql         -> d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705
$ wc -c final/schema/final_biotech_schema_v2.graphql             -> 385018
$ du -sh packets final fast-track domains                        -> 15M 17M 72K 64K
```

## 5. Outputs

- `final/open-questions.md`: 150 open entries (44 owner decisions: 9 rulings, 2 post-ruling conflicts, 33 from packets and sibling stages), 78 rulings in the resolved table, 573 packet items accounted for.
- `final/handoff-to-biotech-meta.md`: run id and location proposal, file copy table, proposal-index / CHANGELOG / OPEN-QUESTIONS text, rounds 0010–0016, 13 re-pin steps with the gates from open-questions.
- `final/_work/openq/`: `template.md`, `mapping.tsv`, `values.mjs`, `values.json`, `build.mjs`.

---

<!-- stage: _runlog/fix.md -->

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

---

<!-- stage: _runlog/finalize.md -->

# Runlog: synthesis finalizer stage (S team), 2026-10-09

Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`. Git Bash, commands from the worktree root.
- `$F` = `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final`
- `$SP` = `C:/Users/Pinda/AppData/Local/Temp/claude/C--Users-Pinda-Proyectos-Biotech/d38640f3-1d90-4042-9623-ff67cb1b7809/scratchpad/synth/finalize`
- `$FX` = the fix stage's scratch (`…/scratchpad/synth/fix`)

Ground rules: no `.env` value was printed, and nothing was committed. Every write went under `$F` or `$SP`; nothing under packets/, schema/pinned, workspace/, scripts/ or packages/ was edited. The disposable container was bks-neo4j-synth only: it was not stopped and no volume was pruned.

## 0. Before

```
sha256sum $F/schema/final_biotech_schema_v2.graphql → c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793
cp SDL, manifest, schema-map.md → $SP (before-copies for cmp)
```

## 1. Assemble

```
node scripts/assemble-schema.mjs → {"ok": true, "modules": 14, "types": 300}
sha256sum → c7cf1235…4793 (unchanged); wc -l -c → 7295 lines, 387615 bytes
cmp $SP/before.graphql $F/schema/final_biotech_schema_v2.graphql → SDL-IDENTICAL
diff manifest before/after → MANIFEST-IDENTICAL
node $F/_work/check-refs.mjs $F/schema/final_biotech_schema_v2.graphql → {"declared": 300, "dangling": []}
```

## 2. Map and counts (into scratch, then compared)

```
time node packages/schema-workspace/dist/cli.js map --sdl $F/schema/final_biotech_schema_v2.graphql --out $SP/schema-map.md
→ {"ok": true, "bytes": 257443, "schemaDigest": "sha256:c7cf1235…4793"}   real 0.525 s
node $F/_work/count-schema.mjs $F/schema/final_biotech_schema_v2.graphql --json $SP/count.json --matrix $SP/matrix.md --append-map $SP/schema-map.md
→ nodeTypes 69; Entity 69 / Subjectable 56 implementers; relationshipTypes 106; relationshipFields 148; pairsCollapsed 181; pairsExpanded 848;
  unions 16; widestUnionAsTarget AdministeredMaterial 5; enums 193;
  perModule K 11/15/36/593/29, D1 4/6/7/7/7, D2 5/6/10/10/10, D3 8/14/30/30/31, D4 7/13/17/17/17 … (same as _runlog/fix.md §3)
cmp $SP/schema-map.md $F/schema-map.md → MAP-IDENTICAL   (final/schema-map.md not rewritten)
```

## 3. IR, executable, size, query patterns

```
node $F/_work/build-ir.mjs $F/schema/final_biotech_schema_v2.graphql $SP/ir.json → {"ok":true,"schemaDigest":"sha256:c7cf1235…4793","nodes":69,…}
diff $SP/ir.json $F/schema/final_biotech_schema_v2.ir.json → only line 4 differs, "parsedAt" (05:58:18Z vs 05:32:19Z); final IR not rewritten

export BKS_SCHEMA_PATH=$F/schema/final_biotech_schema_v2.graphql NODE_OPTIONS=--max-old-space-size=8192
pnpm --filter @bks/graphql-api print-schema $SP/printed-deployed.graphql   (×3, log shown)
→ "wrote …finalize\printed-deployed.graphql (1743362 chars) in 2s" / "in 2s" / "in 1s"   (the log names this run's output and the 1.74 MB size, so no pinned fallback)
TIMEFORMAT='real %R s'; for i in 1 2 3: time (pnpm --filter @bks/graphql-api print-schema $SP/printed-deployed.graphql >/dev/null 2>&1)
→ real 5.009 s, 5.087 s, 5.034 s   (median 5.03 s; all three > 5 s.  Fix stage: 4.980, 4.969, 5.136)
  (the first timing attempt used /usr/bin/time and then date+bc; neither exists in this Git Bash, so it was redone with the bash `time` keyword)
wc -c -l → 34492 lines, 1743672 bytes; grep -c: '^input ' 960, '^type ' 524, '^enum ' 196, '^type Mutation' 0, 'discourseFirstHandCount\|influenceScore' 27
cmp $SP/printed-deployed.graphql $FX/printed-deployed.graphql → PRINT-IDENTICAL-TO-FIX

cp $FX/print2.mjs $SP/print2.mjs   (the K lever printer, re-pointed at this worktree by the integrator)
for i in 1 2 3: node $SP/print2.mjs $F/schema/final_biotech_schema_v2.graphql $SP/printed-none.graphql none
→ {"bytes":1743362,"lines":34493,"inputs":960,"ms":1913} / {"ms":1459} / {"ms":1712}   (median 1.71 s; fix stage 1.46 s)
cmp printed-none printed-deployed → NONE-IDENTICAL-TO-DEPLOYED
for i in 1 2 3: node $SP/print2.mjs … $SP/printed-L3.graphql all
→ {"bytes":731755,"lines":22874,"inputs":960,"ms":1104} / {"ms":1086} / {"ms":1058}   (median 1.09 s); wc → 22873 lines, 732065 bytes; '^input ' 960

node scripts/schema-size.mjs $SP/printed-deployed.graphql --ir $F/schema/final_biotech_schema_v2.ir.json --out $SP/size-deployed.md
node scripts/schema-size.mjs $SP/printed-L3.graphql --ir $F/schema/final_biotech_schema_v2.ir.json --out $SP/size-L3.md
diff (minus the "Printed schema" path line) against $FX/size-deployed.md and $FX/size-L3.md → SIZE-DEPLOYED-SAME, SIZE-L3-SAME
```
Conclusion: every structural number in `final/size-report.md` is current for SDL c7cf…4793. The timings vary between runs: in-process 1.71 s today against 1.46 s, and wall time 5.03 s today against 4.98 s. `size-report.md` is generated by the fix stage and was **not** edited. `00-SUMMARY.md` gives both.

Query patterns (the disposable Neo4j held 0 nodes, 0 constraints and 2 indexes before and after):
```
docker ps --filter name=bks-neo4j-synth → bks-neo4j-synth Up 4 hours neo4j:5.26-community
node $F/_work/validate-patterns.mjs --doc $F/query-patterns.md --ddl $F/_work/patterns-ddl.cypher --report $SP/patterns-report.md --json $SP/patterns.json
→ {"neo4j":"5.26.31 community","ddlExecuted":278,"ddlFailed":0,"nodesInDatabase":0,"indexesAfterDdl":{"total":280,"online":280},
   "queryStatements":39,"queryOk":39,"gdsProjectionSources":9,"gdsProjectionSourcesOk":9,"gdsInputQueries":1,"gdsInputQueriesOk":1,
   "gdsCallsNotRun":19,"failed":0,"withAllNodesScan":["P-10c.2"],"withCartesianProduct":["P-10d","G-0"],"droppedAfterRun":278,"kept":false}
  (no --fill: query-patterns.md not rewritten)
```

## 4. Planner check re-run (open item: not re-run after the fix stage's scalar-only SDL change)

```
sed (const here → "$F/_work"; output → $SP/plan-candidate-results.json) $F/_work/plan-candidate.mjs > $SP/plan-candidate.mjs   (2-line diff, nothing else changed)
NEO4J_URI=bolt://localhost:7691 NEO4J_USERNAME=neo4j NEO4J_PASSWORD=*** NEO4J_DATABASE=neo4j node $SP/plan-candidate.mjs
→ digests: pinned 8313a6f8…, candidate c7cf1235…4793 (was d2339302… in the stored result); graphAtStart 0 nodes (was 681); intents 77
  pinned           threw 76, rejected 1; admitted 10
  candidate        rejected 63, threw 14 (Mention 14); proposals rejected 1067; subjects conflict 791 / missing 90; TYPE_NOT_CREATABLE 791   (unchanged)
  candidateShimmed rejected 47, threw 17, partial 12, applicable 1; proposals admitted 322 / held 379 / rejected 328 (was 324/374/330);
                   subjects create 466 / review 268 / conflict 23 / missing 89 (was 456/255/23/89; the difference is the empty graph)
docker exec … "MATCH (n) RETURN count(n)" → 0
```
Re-render of `fixtures/README.md`:
```
cp $F/fixtures/README.md $SP/README.before.md; cp $F/_work/plan-candidate-results.json $SP/plan-candidate-results.before.json
node $F/_work/repath-fixtures.mjs --index-only   (with the stored results) → {"ok":true,"fixtures":75,"registerEntries":109,"levels":{"TYPE":109},"violations":0,…}
cmp → README-REPRODUCED   (the renderer is deterministic, and the README had no hand edits)
cp $SP/plan-candidate-results.json $F/_work/plan-candidate-results.json; node $F/_work/repath-fixtures.mjs --index-only → same counts
diff README.before README → only the "Planner check" section changed: lines 385, 389 (candidate digest c7cf…4793), 396, 400, 411, 422–424
```
This closes the open item "the fixtures README still names the old IR digest". The planner verdict is unchanged: 0 of 77 intents plan against the candidate.

## 5. Pinned baseline

```
sha256sum schema/pinned/final_biotech_schema_proposal.graphql → 77633441ce24c5ef…
time node packages/schema-workspace/dist/cli.js map --sdl <pinned> --out $SP/pinned-map.md → bytes 1082419; real 0.649 s
  map: node types 192; relationship fields 1082; distinct relationship types 393; from→to pairs after union/interface expansion 3940
node $F/_work/count-schema.mjs <pinned> --json $SP/pinned-count.json → nodeTypes 192, relationshipTypes 393, pairsCollapsed 3883, pairsExpanded 3940,
  unions 39, widestUnionAsTarget AssertionSubjectTarget 144
for i in 1 2 3: node $SP/print2.mjs <pinned> $SP/printed-pinned.graphql none   (background, sequential)
→ {"bytes":57908217,"lines":693831,"inputs":38034,"ms":30190} / {"ms":25100} / {"ms":25659}   (median 25.66 s; fix stage 24.65 s)
wc -c → 57908325; grep -c '^input ' → 38034; print deleted afterwards
```

## 6. Packet-check (all 14)

```
for p in K D1 … D13: node scripts/packet-check.mjs $p > $SP/pc-$p.txt → exit 0 for all 14; ok=true, errors 0, warnings 0 in every report
```
| packet | ok | node types | rel types | pairs | questions | fixtures | budget n/r/p |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| K | true | 11 | 13 | 32 | 35 | 6 | 12/14/40 |
| D1 | true | 4 | 6 | 7 | 33 | 5 | 8/14/35 |
| D2 | true | 5 | 6 | 10 | 34 | 5 | 8/14/35 |
| D3 | true | 8 | 14 | 31 | 32 | 3 | 8/14/35 |
| D4 | true | 7 | 13 | 17 | 35 | 7 | 8/14/35 |
| D5 | true | 6 | 6 | 8 | 34 | 4 | 8/14/35 |
| D6 | true | 6 | 9 | 11 | 37 | 7 | 8/14/35 |
| D7 | true | 4 | 7 | 9 | 33 | 6 | 8/14/35 |
| D8 | true | 6 | 11 | 29 | 33 | 6 | 8/14/35 |
| D9 | true | 3 | 8 | 9 | 36 | 6 | 8/14/35 |
| D10 | true | 3 | 6 | 9 | 36 | 5 | 8/14/35 |
| D11 | true | 1 | 0 | 0 | 30 | 5 | 8/14/35 |
| D12 | true | 3 | 4 | 8 | 34 | 5 | 8/14/35 |
| D13 | true | 2 | 5 | 7 | 33 | 5 | 8/14/35 |

These are packet-local counts, before synthesis. The assembled per-module counts under R-01 A are in `size-report.md`.

## 7. Summary, RUNLOG, deliverables

- **Read.** 03-SYNTHESIS, 00-DIRECTIVE, `size-report.md`, and the decision-report rulings R-01 to R-98 with F-01 to F-07. Also the open-questions §1, §6 and §7 tables, the fixtures README, the query-patterns validation summary, `requests.md`, the questions-catalog header, and the xfx runlogs §7–§9.
- **Checked against the SDL.** `grep -c '^type <T> '` for the 20 types `00-SUMMARY.md` names: 1 each. Fixture kinds from the README index: disconfirmation 16, harm 20, other 24, reliability-gap 1, unstructured-to-entity 14 (75).
- **Wrote `$F/00-SUMMARY.md`.**
- **Built `$F/RUNLOG.md`.** A header, then `_runlog/*.md` concatenated in stage order, then the deliverables listing (see RUNLOG.md for the command).

```
bash $SP/build-runlog.sh $F $SP
→ checks that every _runlog/*.md is in the stage list and that every stage file exists (28 stages), then writes $F/RUNLOG.md
  first build: 402279 bytes, 0 deliverables missing ("**NO**" rows: 0); re-run once after this block was appended
→ deliverables: every file in the 03-SYNTHESIS table exists (sizes in RUNLOG.md, last section); packet fixtures 75 folders / 388 files, cross-domain 3 / 21
git status --short -- . ':!schema/program/packets' → changes only under schema/program/final/ (checked after the last write)
```

---

## Deliverables (03-SYNTHESIS table), checked by the finalizer

Existence and size of every file the 03-SYNTHESIS deliverables table names, plus the supporting files beside them. Bytes are `wc -c`.

| deliverable (03-SYNTHESIS) | path under `final/` | exists | bytes |
| --- | --- | --- | ---: |
| 00-SUMMARY.md | `00-SUMMARY.md` | yes | 15514 |
| kernel module | `schema/kernel.graphql` | yes | 57287 |
| domain module | `schema/D1.graphql` | yes | 21114 |
| domain module | `schema/D2.graphql` | yes | 24350 |
| domain module | `schema/D3.graphql` | yes | 45070 |
| domain module | `schema/D4.graphql` | yes | 26992 |
| domain module | `schema/D5.graphql` | yes | 29856 |
| domain module | `schema/D6.graphql` | yes | 26137 |
| domain module | `schema/D7.graphql` | yes | 23974 |
| domain module | `schema/D8.graphql` | yes | 34793 |
| domain module | `schema/D9.graphql` | yes | 20530 |
| domain module | `schema/D10.graphql` | yes | 19249 |
| domain module | `schema/D11.graphql` | yes | 9176 |
| domain module | `schema/D12.graphql` | yes | 18338 |
| domain module | `schema/D13.graphql` | yes | 27210 |
| assembled SDL | `schema/final_biotech_schema_v2.graphql` | yes | 387615 |
| (supporting) assembly manifest | `schema/final_biotech_schema_v2.graphql.manifest.json` | yes | 2238 |
| (supporting) IR of the assembled SDL | `schema/final_biotech_schema_v2.ir.json` | yes | 2102499 |
| schema-map.md (with the module seam matrix) | `schema-map.md` | yes | 261421 |
| size-report.md | `size-report.md` | yes | 17306 |
| questions-catalog.md | `questions-catalog.md` | yes | 438556 |
| query-patterns.md | `query-patterns.md` | yes | 95519 |
| relationship-register.yaml | `relationship-register.yaml` | yes | 305870 |
| node-register.yaml | `node-register.yaml` | yes | 153574 |
| seams.yaml | `seams.yaml` | yes | 306869 |
| vocabularies/ | `vocabularies/targets.yaml` | yes | 42063 |
| vocabularies/ | `vocabularies/frontiers.yaml` | yes | 112688 |
| vocabularies/ | `vocabularies/identifier-schemes.yaml` | yes | 111768 |
| vocabularies/ | `vocabularies/verdict-lattice.yaml` | yes | 15197 |
| vocabularies/ | `vocabularies/goal-polarity.yaml` | yes | 13455 |
| vocabularies/ | `vocabularies/claim-lifecycle.yaml` | yes | 11276 |
| vocabularies/ | `vocabularies/answer-kinds.yaml` | yes | 14403 |
| fixtures/ index | `fixtures/README.md` | yes | 88869 |
| cross-domain fixture (6 files) | `fixtures/cross-domain/compound-profile/assertions.yaml` | yes | 167479 |
| cross-domain fixture (7 files) | `fixtures/cross-domain/product-comparison/assertions.yaml` | yes | 143812 |
| cross-domain fixture (8 files) | `fixtures/cross-domain/claim-mission-report/assertions.yaml` | yes | 91164 |
| decision-report.md | `decision-report.md` | yes | 127794 |
| migration-notes.md | `migration-notes.md` | yes | 177306 |
| tooling/action-space.yaml | `tooling/action-space.yaml` | yes | 312570 |
| tooling readiness scorecard and gap list | `tooling/readiness-scorecard.md` | yes | 46080 |
| open-questions.md | `open-questions.md` | yes | 83124 |
| (supporting) fixture requests (R-06) | `requests.md` | yes | 3366 |
| handoff-to-biotech-meta.md | `handoff-to-biotech-meta.md` | yes | 21257 |
| RUNLOG.md | `RUNLOG.md` | yes (this file) | — |

Packet fixtures under `fixtures/<packet>/` (folders / files):

| packet | fixtures | files |
| --- | ---: | ---: |
| K | 6 | 34 |
| D1 | 5 | 25 |
| D2 | 5 | 25 |
| D3 | 3 | 16 |
| D4 | 7 | 35 |
| D5 | 4 | 20 |
| D6 | 7 | 35 |
| D7 | 6 | 30 |
| D8 | 6 | 32 |
| D9 | 6 | 30 |
| D10 | 5 | 30 |
| D11 | 5 | 25 |
| D12 | 5 | 26 |
| D13 | 5 | 25 |
| **packets total** | **75** | **388** |
| cross-domain | 3 | 21 |

---

# Close-out round

Close-out of FU-03, FU-04, FU-05, FU-13 / MD-X-02 and TL-04, 2026-10-09, resumed twice after orchestrator crashes. Each section below is one `_runlog/closeout-*.md` file (56 files), copied unchanged in this order: the pattern lint, the predicate registry, the packet owners (A1–A8), the S pattern writers, the fixture editors (first pass, second pass, single-fixture editors, S fixture editors), the refresh, and last the fixer and summary (`closeout-fix.md`), which answers the verifier findings and updates `00-SUMMARY.md`. The source files stay in `_runlog/`. The SDL is unchanged in this round (sha256 `c7cf1235…4793`). Nothing was committed by the S agents; the coordinator commits.

---

<!-- stage: _runlog/closeout-pattern-linter.md -->

# Close-out round: pattern linter (S), 2026-10-09

Role: PATTERN LINTER. Scope: FU-04 (packet pattern rewrites the rulings require). No SDL change; nothing committed (the coordinator commits).

## Deliverables

- `final/_work/lint-packet-patterns.mjs`: reproducible linter (Node 22+, `neo4j-driver` from `packages/kg-ops`, `graphql` and `yaml` from `packages/schema-workspace`).
- `final/_work/pattern-lint.json`: full report (inputs with sha256 and worktree HEADs, self-check, per-block statements, findings, classes, FU-04 confirmation).
- `final/_work/pattern-lint.md`: readable report (summary, FU-04 table, inline-code prose findings, rulings.yaml edit-pattern ops, then one table per packet: line, question, class, reason).

## Inputs

- Packet patterns, SDLs and 05 registers are read from the owner worktrees `biotech-knowledge-services-A1` … `-A8` (K→A1, D10→A1, D1→A2, D12→A2, D2→A3, D4→A3, D3→A4, D5→A5, D6→A6, D7→A6, D8→A7, D13→A7, D9→A8, D11→A8), never from the S copies. The S copies of `03-retrieval-patterns.md` were confirmed byte-identical to the owner copies (`diff -q`, 14 of 14 "same").
- Final: `final/schema/final_biotech_schema_v2.ir.json` (relationship triples, labels, properties, enums) and the printed SDL (self-check only); `final/relationship-register.yaml`; `final/vocabularies/predicates.yaml` when present (it appeared during this round from the predicate-registry role; the run used sha256 f3465df9…080d2, recorded in the JSON); `_work/rulings.yaml`; `decision-report.md`; DDL from `_work/patterns-ddl.cypher` and the D-1, D-3 and D-4 blocks of `query-patterns.md`.

## Commands

```bash
# environment (container state before the runs)
docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "CALL dbms.components() YIELD versions, edition RETURN versions, edition; MATCH (n) RETURN count(n); SHOW INDEXES YIELD name RETURN count(*); SHOW CONSTRAINTS YIELD name RETURN count(*);"
#   5.26.31 community; 0 nodes; 2 indexes (the default lookup indexes); 0 constraints

# static-only development runs
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --no-db --json <scratch>/nodb.json --md <scratch>/nodb.md

# final run (EXPLAIN on bks-neo4j-synth; writes final/_work/pattern-lint.{json,md}; drops the DDL it created)
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs
#   ~55 s; exit 0

# container state after the run
docker exec bks-neo4j-synth cypher-shell -u neo4j -p bks-test-password "SHOW INDEXES YIELD name RETURN count(*); SHOW CONSTRAINTS YIELD name RETURN count(*);"
#   2 indexes, 0 constraints (as found)
```

## Key output (final run, 2026-10-09T06:48Z)

- Self-check: the linter's SDL reader on the printed final SDL reproduces the IR exactly (labels, 106 relationship types' triples, node properties): 0 differences. The packet world (14 owner SDLs) has the same 69 node-type and 106 relationship-type names as the final schema, so ruling breakage shows up as cut pairs, removed properties, enum values, retired predicates and pending pattern edits, not as renamed types.
- DDL: 299 statements executed, 298 accepted (229 generated + 32 D-1 + 14 D-3 + 3 D-4 + packet DDL). The one error is D9 03 line 42 (`CYPHER 25` vector index with an in-index `WITH [...]` filter, 2026.01+ syntax). 282 indexes/constraints created by the run were dropped afterwards.
- 505 blocks: ok 297, fragment 31, gds-unvalidated 6, packetBug 113, rulingBroken 58; failing 171. 24 packetBug blocks also carry ruling-level findings. 76 blocks start with `CYPHER 25` (K 35, D11 30, D9 5, D1/D3/D4/D8/D10/D13 1 each); 46 packetBug blocks have that prefix as their only problem.

| packet | blocks | failing | packetBug | rulingBroken | fragment | gds-unvalidated | ok |
| --- | --- | --- | --- | --- | --- | --- | --- |
| K | 36 | 35 | 35 | 0 | 0 | 0 | 1 |
| D1 | 36 | 9 | 6 | 3 | 2 | 0 | 25 |
| D2 | 39 | 5 | 3 | 2 | 10 | 1 | 23 |
| D3 | 33 | 6 | 5 | 1 | 1 | 1 | 25 |
| D4 | 38 | 3 | 3 | 0 | 2 | 1 | 32 |
| D5 | 35 | 4 | 2 | 2 | 7 | 1 | 23 |
| D6 | 41 | 8 | 3 | 5 | 4 | 0 | 29 |
| D7 | 34 | 8 | 1 | 7 | 0 | 2 | 24 |
| D8 | 35 | 8 | 2 | 6 | 2 | 0 | 25 |
| D9 | 40 | 30 | 5 | 25 | 1 | 0 | 9 |
| D10 | 37 | 7 | 4 | 3 | 0 | 0 | 30 |
| D11 | 30 | 30 | 30 | 0 | 0 | 0 | 0 |
| D12 | 36 | 9 | 9 | 0 | 2 | 0 | 25 |
| D13 | 35 | 9 | 5 | 4 | 0 | 0 | 26 |

Rulings named on ruling-broken blocks (count of blocks): F-05 30 (D9's `ClaimOccurrence` label), R-30 11, R-42 7, R-44 5, R-80 5, R-68 4, and 1–2 each for R-15, R-19, R-21, R-43, R-47, R-52, R-59, R-62, R-66, R-72, R-73, R-82, R-83, R-89, R-93, R-94, R-95, R-09.

## FU-04 items (all detected)

| item | detected | where |
| --- | --- | --- |
| R-42 shared-Identifier joins | yes | D3 CQ-EV-05 (two joins, line 231, 239), D11 CQ-PV-05 (section intent); also D1 CQ-ID-04, D5 Q-D5-20, D9 Q-D9-13, D11 Q-D11-05, Q-D11-19 |
| R-83 guideline branches | yes | D10 Q-D10-03, Q-D10-08 (RECOMMENDS_AGAINST with a Target; register ruleNote) |
| R-94 stale names | yes | D10 line 744 (trace prose `D9 Episode/Publication`); D13 line 188 already applied in the owner copy (no DocumentTextVersion / Episode below the header); the block there still fails on `CYPHER 25` + `SEARCH` |
| R-89 Q-D2-21 | yes | HOLDS_EQUITY_IN, CONSULTS_FOR, INVENTOR_OF_PATENT_LICENSED_TO unregistered (predicates.yaml maps them to HOLDS_STAKE / HOLDS_ROLE / RECEIVES_VALUE_FROM) |
| R-47 Q-D2-18 | yes | AFFECTS_MECHANISM ranking; `r.nNoChangeContexts` not on MechanismProjectionProperties |
| R-30 Q-D6-01 | yes | `c.declaredNameVerbatim`; same property also in D1 CQ-PF-01, CQ-ID-03 and D6 CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-10, Q-D6-11, D12 Q-D12-18; `roleTitleVerbatim` in D7 Q-D7-02, Q-D7-08 |
| R-09 CQ-AX-04 | yes | EMPTY_RESULT in the section's pattern line (the block is also `CYPHER 25`) |
| fix-1 HAS_IDENTIFIER direction | yes | D1 214, 234, 460, 666, 670; D2 433; D12 153, 761 (blocks) and D12 3 (inline code in the preamble); also D4 Q-D4-09 line 382 (not in the FU-04 list) |
| fix-2 RESULT_FOR | yes | D12 Q-D12-03, Q-D12-06 (pair absent at packet level too: D8 declares QUALITY_RESULT_FOR; related R-95) |
| fix-3 Q-D8-23 | yes | STATUS_OF → Device and CONCERNS → Device (R-72) |
| fix-4 Q-D2-16 | yes | (Assessment)-[:ASSESSES]->(Assertion); the same pair in D13 Q-D13-17, Q-D13-24 |
| CYPHER 25 prefix | yes | 76 blocks |

## Design decisions and limits

- Packet level = the owner packet SDL + the K kernel, with sibling packet SDLs accepted for seam names (a seam name is noted, not failed). A name, pair, property or predicate that no packet declares is a packetBug; one the packets declare but the final schema (or `predicates.yaml`) does not is rulingBroken.
- `ClaimOccurrence` is documented in K's Assertion docstring ("stored extra label") but declared by no `@node`; the linter accepts docstring-documented extra labels for the packet world, so D9's 30 uses classify as rulingBroken under F-05 rather than packetBug.
- Macros are expanded from the Conventions definitions (D3 ASOF/VALID/LIVE, D10 ASOF/VALIDAT, D12 AS_OF/AS_OF_REC, D8 AS_OF/KNOWN_AT; TRACE becomes a unique null). A question block that elides a convention fragment (`// + TRACE(a)`, `// DOSE`) and reads its variables cannot be planned; it is a fragment unless its static findings classify it.
- Statements are split at `;` and, for blocks holding several queries without `;`, at a new top-level clause after a top-level RETURN. Templates with `<PLACEHOLDER>` (K line 27–28) are not run.
- GDS: `gds.graph.project(...)` source queries are EXPLAINed after rewriting the call to a map literal; `CALL gds.*` and statements reading columns a GDS call yields are gds-unvalidated.
- Edit-pattern ops in `rulings.yaml` are tested textually against the owner section (the PENDING table); R-19 Q-K-09 has no textual marker and is reported "not testable". Q-D4-10 (R-94) is applied in the owner copy.
- Prose checks: module-qualified type names in a block's trace lines and comments (`D9 Episode`), and backtick Cypher in 03 prose outside fences (direction, pair, type, label only). Both are reported separately and not counted as failing blocks.
- Static analysis is regex-based. Variables are scoped per UNION branch; a variable re-bound by `expr AS v` is not type-checked after that. Variable-length patterns are checked for type names only, not for endpoint pairs.

---

<!-- stage: _runlog/closeout-predicate-registry.md -->

# Close-out: predicate registry (S), 2026-10-09

Closes MD-X-02 and FU-13 (final/open-questions.md); opens MD-X-03 for what the registrars still decide. No SDL change
(candidate sha256 c7cf1235…4793 untouched). Nothing committed (the coordinator commits). Research only, not medical advice.

## Outputs

| file | what |
| --- | --- |
| `final/_work/build-predicates.mjs` | generator of the registry (deterministic; `--check` exits 1 when the file is stale or a used name is unresolved) |
| `final/vocabularies/predicates.yaml` | R-52 registry, 374 entries |
| `final/_work/lint-fixtures.mjs` | fixture lint; exports `loadLintContext`, `lintFixture(dir, ctx)`, `lintFixtures(ctx)` |
| `final/_work/fixture-lint-baseline.json` | baseline lint of the 78 fixtures |
| `final/open-questions.md` | rows MD-X-02 and FU-13 updated (resolved-in-closeout), row MD-X-03 added |

## Inputs read

- Register fragments `final/_work/registers/<M>.relationship.yaml` (predicateOnly, authorizingPredicates, removedPredicates,
  registeredElsewhere, mergedInto, removedRegistrations), cross-checked against the merged `final/relationship-register.yaml`:
  drift 0 (203 merged predicateOnly rows = fragment rows).
- Candidate IR `final/schema/final_biotech_schema_v2.ir.json` (asserted relationship types → authorizing predicates;
  SDL type names for subject / object types; edge-property and enum declarations for the lint).
- `final/_work/rulings.yaml` (global.names.predicates, retiredNames, module register/rename/remove/extend-predicate ops),
  `final/decision-report.md` R-52 and R-53 sections.
- Patterns: `packets/<P>/03-retrieval-patterns.md` (14) and `final/query-patterns.md`; predicate contexts
  (`predicate: 'X'`, `.predicate IN [...]`, `= 'X'`) plus quoted tokens that are known names; Cypher `//` comments skipped;
  questions attributed per heading (03 files), else per line / nearest lead-in line / `Questions:` line.
- Fixtures: `final/fixtures/**/assertions.yaml` and `intent*.json` (159 files): `predicate`, `inputPredicates`,
  `predicateOnly` map keys, `binding.predicate`, intent `assertion.predicate`, assertion.literal `predicate`, predicate-only
  edge.assert `relationshipType`.

## Commands

```
$ node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/build-predicates.mjs
{ "entries": 374,
  "byStatus": { "registered": 286, "proposed-new": 35, "retired-by": 16, "alias-of": 37 },
  "byKind": { "relationship": 102, "authorizing": 65, "literal": 148, "field": 14, "retired": 41, "computation": 4 },
  "closeout": { "MD-X-02 registered": 9, "MD-X-02 retired-by": 4, "FU-13 registered": 1, "FU-13 alias-of": 4,
                "FU-13 retired-by": 4, "closeout alias-of": 12, "closeout retired-by": 6, "closeout registered": 1,
                "closeout proposed-new": 35 },
  "registerDrift": [], "problems": [], "registrarRule3Mismatches": [ 33 rows, informational ] }
$ node …/build-predicates.mjs --check            -> "upToDate": true, exit 0
$ sha256sum final/vocabularies/predicates.yaml    -> f3465df9827bd4d9a0f572f7c8df32795b9f89bf67bff27a8edb1f3cd4c080d2 (two runs, same)

$ node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --baseline
{ "fixtures": 78, "clean": 29, "errors": 562, "warnings": 201,
  "byCategory": { "edge-property": 209, "edge-property-type": 7, "enum-value": 11, "node-property": 2, "node-type": 3,
                  "predicate-alias": 56, "predicate-proposed": 133, "predicate-report-only": 4, "predicate-retired": 34,
                  "predicate-unregistered": 2, "relationship-pair": 4, "relationship-type": 1, "retired-name": 297 } }
$ sha256sum final/_work/fixture-lint-baseline.json -> 43dc6b5b80101f0a5431739775c0f8b1dd1ac6d1fa8e55c8fb0e4e4872da68c7 (two runs, same)
```

Baseline by packet (errors / warnings; fixtures clean of errors):

| packet | fixtures | clean | errors | warnings | main categories |
| --- | ---: | ---: | ---: | ---: | --- |
| K | 6 | 1 | 30 | 22 | predicate-alias 25 (DIRECTLY_ACTIVATES, OFFERS_FOR_SALE), retired-name 21 (supersedesUid, Mention, HAS_REVISION_STATUS) |
| D1 | 5 | 1 | 48 | 20 | edge-property 24 (R-30 verbatim fields), predicate-report-only 4 (EXCEEDS_DOSE_THRESHOLD), predicate-proposed 20 |
| D2 | 5 | 0 | 19 | 0 | edge-property 9 (nNoChangeContexts, R-47), retired-name 9, predicate-alias 1 (HOLDS_EQUITY_IN) |
| D3 | 3 | 1 | 3 | 7 | predicate-unregistered 1 (OCCURRENCE_OF as a predicate), relationship-pair 1, enum-value 1 |
| D4 | 7 | 6 | 2 | 0 | predicate-alias 2 (`AlgorithmVersion.*` FIELD predicates) |
| D5 | 4 | 1 | 8 | 14 | edge-property 4, retired-name 17 (supersedesUid, Mention) |
| D6 | 7 | 2 | 170 | 0 | edge-property 84 + retired-name 86 (R-30 declaredNameVerbatim / formVerbatim / statementVerbatim) |
| D7 | 6 | 1 | 106 | 0 | edge-property 53 + retired-name 53 (R-30 roleTitleVerbatim / stakeClassVerbatim) |
| D8 | 6 | 6 | 0 | 4 | predicate-proposed 2 |
| D9 | 6 | 1 | 65 | 14 | edge-property 30, retired-name 30, predicate-alias 4 (INCREASES_LEVEL), predicate-proposed 14 |
| D10 | 5 | 0 | 60 | 29 | predicate-retired 32, predicate-alias 24 (FU-13 and the other D10 placeholders), predicate-proposed 27 |
| D11 | 5 | 1 | 19 | 5 | edge-property-type 5 (AssertedEdgeProperties where AssertedRecordedProperties), node-type 3 (Mention) |
| D12 | 5 | 2 | 9 | 11 | relationship-pair 3 (QUALITY_RESULT_FOR → Product, R-73), edge-property-type 2 |
| D13 | 5 | 3 | 23 | 14 | retired-name 31 (role AUTHOR/PUBLISHER, derivedFrom=, HAS_REVISION_STATUS), enum-value 6 |
| cross-domain | 3 | 3 | 0 | 61 | predicate-proposed 61 (FIELD / METRIC literals) |

## Decisions (CLOSEOUT table in the generator; each row cites the item and the ruling)

MD-X-02:
- Registered, R-52 rule 3 (owner of the subject type): UNIT_DOSE_AMOUNT, ADMINISTERED_AMOUNT (D3; subject InterventionComponent;
  D1 / D11 contribute), REGISTRY_ID_AS_PRINTED (D3; Publication), PROSPECTIVE_REGISTRATION_FLAG (D3; D11 contributes),
  RECORD_LAST_UPDATED (K; Source; D11 contributes), OUTCOME_MEASURED_WITH (D3; D4 contributes), USED_FOOD_CLASSIFICATION and
  USED_COMPOSITION_DATABASE (D3; D12 contributes). EXCEEDS_DOSE_THRESHOLD confirmed D1 with `storage: report-only` (R-85);
  the lint flags its 4 stored uses in D1/vitamin-b6-threshold-harm.
- Retired by R-52 (pattern names with no registrar): FORM_OF → REALIZES_SUBSTANCE | HAS_ACTIVE_MOIETY; PREPARATION_OF →
  MATERIAL_CONTAINS | FOOD_CONTAINS; CONTAINS_INGREDIENT and DECLARES_AMOUNT → DECLARES_COMPONENT. `patternEdit` on each says
  what D10's Q-D10-07 / Q-D10-11 read instead (the authorizing predicate of a typed edge is its type name, so the
  `p.predicate IN [...]` shape survives).

FU-13 (the nine edge.assert predicates):
- Registered: HIGHER_BIOAVAILABILITY_THAN (D1, rule 3; IngredientMaterial → IngredientMaterial; Q-D10-11).
- Alias (re-key only): DIRECTLY_ACTIVATES → ACTIVATES (D2), OFFERS_FOR_SALE → DISTRIBUTES (D7, R-68),
  ASSOCIATED_WITH_ADVERSE_EFFECT → CAUSES_ADVERSE_EFFECT (D5, R-85), INDICATED_FOR → HAS_APPROVED_INDICATION (D8, R-88).
- Retired (structural edit): MAY_IMPROVE_PROGNOSIS_OF → IMPROVES_TARGET with a Target object (R-83);
  DECLARES_INGREDIENT_FORM → LabelVersion -DECLARES_COMPONENT-> material (R-52); DISCLOSES_ROLE_AT → typed HOLDS_ROLE
  (R-82, R-30); MATERIAL_MANUFACTURED_BY → Organization -MANUFACTURES-> IngredientMaterial (R-68).

Also resolved (fixture or pattern names outside the two lists): HOLDS_EQUITY_IN → HOLDS_STAKE, CONSULTS_FOR → HOLDS_ROLE,
INVENTOR_OF_PATENT_LICENSED_TO → RECEIVES_VALUE_FROM (R-89, D2 Q-D2-21 pattern); SUPPLIES, SUPPLIED_INGREDIENT →
SUPPLIES_MATERIAL and PROCESSED_INGREDIENT → MANUFACTURES (R-68; D2 / D12 patterns); INCREASES_LEVEL → INCREASES_LEVEL_OF;
STATES_REGULATORY_STATUS → RATES_CLAIM; DISCLOSES_AFFILIATE_COMMISSION → DISCLOSES_INTEREST; REPORTS_ADVERSE_EVENT_RATE →
CHARACTERIZES_INCIDENCE; MAX_DAILY_SUPPLEMENTAL_AMOUNT → PER_MAX_DAILY_DOSE_AMOUNT; STATES_METHOD_MAY_CHANGE →
STATES_METHOD_CAVEAT; `AlgorithmVersion.inputFeatureCount` / `.inputPlatforms` → INPUT_FEATURE_COUNT / INPUT_PLATFORMS;
retired CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT (→ HAS_CLAIM_CONDITION, R-93), ARM_DAILY_DOSE (→ ADMINISTERED_AMOUNT),
LABEL_DECLARED_AMOUNT / LABEL_SERVING_DIRECTIONS (→ D6 LabelVersion line and fields); DEVELOPS_THERAPY_TARGETING registrar
moved D2 → D7 (rule 3; the D2 register flagged it for the registry editor). 35 names stay proposed-new (MD-X-03).

## Notes on method

- Subject / object types are SDL names only: structured register fields first, then "X → Y" and "subject … / object …"
  windows of the prose (negated mentions such as "never a Target" are dropped; "D1 substance" reads as ChemicalSubstance),
  else the SDL types the fixtures use (`typesBasis` says which).
- Authorizing entries: every relationship type whose relClass is asserted or whose declaring field says class asserted
  (adds MEASURES, which the IR marks derived with flag derived-registry; MD-X-03 e).
- The lint reads D4's `edgeClass: structural` rows as edge listings (the `predicate` key names the structural type).
- Retired-name scan reuses `RESIDUAL` from `_work/repath-fixtures.mjs` (parsed from its source, one definition).
- Categories overlap by design (an R-30 field is both edge-property and retired-name), so per-category counts do not add
  to a count of distinct defects.

---

<!-- stage: _runlog/closeout-A1-D10.md -->

# Close-out — A1 / packet D10 (pattern lint, FU-05)

2026-10-09. Worktree C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A1 (ft/schema-A1, HEAD 7aaeb2f). Wrote only `schema/program/packets/D10/03-retrieval-patterns.md` and `schema/program/packets/D10/RUNLOG.md` there (plus this log). No SDL change; nothing committed. (Uncommitted K/03 + K/RUNLOG changes in the same worktree belong to the K owner's close-out, not this role.)

## Commands and key outputs

1. Read D10 entries of `final/_work/pattern-lint.json`: 37 blocks, 7 failing = 4 packetBug (CQ-RC-06 property `assessmentSubkind` on UseConstraint; Q-D10-07 unregistered PREPARATION_OF/FORM_OF/CONTAINS_INGREDIENT; Q-D10-11 unregistered FORM_OF; Q-D10-17 `CYPHER 25` + SEARCH syntax error) + 3 rulingBroken (Q-D10-03, Q-D10-08 R-83; Q-D10-21 R-94).
2. Edited 03 (4 blocks):
   - CQ-RC-06: separate `uc:UseConstraint` / `bs:Assessment` BLOCKED_BY targets; `coalesce(uc.constraintKind, bs.assessmentSubkind)`.
   - Q-D10-07: predicates → `REALIZES_SUBSTANCE, HAS_ACTIVE_MOIETY, MATERIAL_CONTAINS` (D1), `FOOD_CONTAINS` (D12), `DECLARES_COMPONENT` (D6) — all registered in owner 05 registers.
   - Q-D10-11: `EXISTS { MATCH … WHERE predicate IN ['HAS_ACTIVE_MOIETY','REALIZES_SUBSTANCE'] }`.
   - Q-D10-17: `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS ch, score AS sim`.
3. `node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D10 --json <scratchpad>/lint-D10.json --md <scratchpad>/lint-D10.md`
   → `D10: 37 total, 3 failing (0 packetBug, 3 rulingBroken), 0 fragment, 0 gds`; selfCheckDiffs 0; fixed blocks all `ok`. (Shared pattern-lint.json/.md not overwritten; the linter owner's full re-run will pick up the change.)
4. `node scripts/packet-check.mjs D10` (A1) → `{"ok": true, … nodeTypes 3, relationshipTypes 6, pairs 9, questions 36, fixtures 5}`, exit 0.
5. FU-05: `python C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A1/schema/program/packets/D10/_notes/answer_kind_table.py C:/Users/Pinda/Proyectos/Biotech` → exit 0, no stderr warnings; `answer-kind-table.md` byte-identical to committed (`cmp` identical; sha256 73bd9020bdf1ce21…). 475 rows, 17 disagreements, 5 conflicts, 6 variants. Owner HEADs read: A1 7aaeb2f, A2 6635197, A3 f4fb477, A4 44b87ff, A5 53b6a9f, A6 2ca247a, A7 10ef1ea, A8 5b9788a.
   - Drift: A5 `D5/02-questions.md` has one uncommitted edit (CQ-RC-06 answer-shape text only; kind unchanged `published`) — no table effect.

## Result

packetBug 4 → 0; rulingBroken 3 unchanged (S stage writes final-SDL versions). FU-05 reproduced. RUNLOG entry "Close-out: pattern lint" appended in packets/D10/RUNLOG.md.

---

<!-- stage: _runlog/closeout-A1-K.md -->

# Close-out: pattern lint — A1 / packet K (2026-10-09)

Worktree `biotech-knowledge-services-A1` (ft/schema-A1 @ 7aaeb2f, uncommitted edits). Written only under `schema/program/packets/K/` there; SDL untouched.

## Input

Linter report `final/_work/pattern-lint.md`: K 36 blocks, 1 ok, 35 packetBug, 0 rulingBroken (7 "also ruling"). All 35 carried the `CYPHER 25` prefix; EXPLAIN errors after stripping it:
- Q-K-14: `SyntaxError: Invalid input 'SEARCH'` (Cypher 25 vector SEARCH clause, Neo4j 2026.01+).
- Q-K-16: `In a WITH/RETURN with DISTINCT or an aggregation, it is not possible to access variables declared before the WITH/RETURN: adj` (ORDER BY adj.recordedAt after collect()).

## Commands

```
sed -i '/^CYPHER 25$/d' schema/program/packets/K/03-retrieval-patterns.md     # 35 lines removed
python (exact-string replacements): header prose, dynamic-label note, Q-K-14 prose + block, Q-K-16 block
grep -rn -i "cypher 25" schema/program/packets/K   # only the explanatory prose mentions remain; no SDL/register hits
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs \
  --packets K --json <scratchpad>/lint-K.json --md <scratchpad>/lint-K.md
  -> "K: 36 total, 7 failing (0 packetBug, 7 rulingBroken), 0 fragment, 0 gds"; selfCheckDiffs 0; CYPHER 25 prefix: no
node scripts/packet-check.mjs K
  -> {"ok": true, nodeTypes 11, relationshipTypes 13, pairs 32, questions 35, fixtures 6}; exit 0
```

Linter outputs went to the scratchpad so the shared all-packet `pattern-lint.{json,md}` was not overwritten by a K-only run; the coordinator re-runs the full lint.

## Result

- Blocks fixed: 35 (35 prefix removals; Q-K-14 rewritten to `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score WHERE c:Chunk AND c.language = 'en'`; Q-K-16 projects `adj.recordedAt AS adjRecordedAt` before ORDER BY).
- Remaining: 0 packetBug; 7 rulingBroken left as the packet record (R-44 Q-K-10/Q-K-17/Q-K-22, R-15 Q-K-15/Q-K-23, R-43 Q-K-21, R-09 CQ-AX-04); S writes the final-SDL versions.
- No schema change needed.

---

<!-- stage: _runlog/closeout-A2-D1.md -->

# Close-out — packet owner A2, packet D1 (pattern lint)

2026-10-09. Worktree `biotech-knowledge-services-A2` (ft/schema-A2, head 6635197), writes under `schema/program/packets/D1/` only; not committed.

Input from `final/_work/pattern-lint.json`: D1 total 36, failing 9, packetBug 6, rulingBroken 3.

| Block | Finding | Fix |
|---|---|---|
| Q-D1-01 (L83) | predicate `MOLECULAR_WEIGHT` not registered in any packet 05 register | registered in D1 `05-relationship-register.yaml` predicateOnly (FIELD Assertion on ChemicalSubstance; D1 registrar per R-52 rule 3, matching `final/vocabularies/predicates.yaml` proposed-new, registrar D1); note added to OQ-D1-16 |
| CQ-ID-04 (L212) | `(Identifier)-[:HAS_IDENTIFIER]->(ChemicalSubstance)` and `->(other)` reversed | `(s)-[l:HAS_IDENTIFIER]->(i:Identifier)`, `(other)-[l2:HAS_IDENTIFIER]->(i)`; R-42 identifier-join stays (rulingBroken, left for S) |
| Q-D1-06 (L228) | two reversed HAS_IDENTIFIER hops | `(x)-[l1:HAS_IDENTIFIER]->(i1:Identifier), (x)-[l2:HAS_IDENTIFIER]->(i2:Identifier)` |
| Q-D1-08 (L307) | `CYPHER 25` prefix; `SEARCH … VECTOR INDEX` syntax error on 5.26; `c.recordedTo` not on D9 Chunk | prefix removed; `CALL db.index.vector.queryNodes('chunk_embedding', 8, $embedding) YIELD node AS c, score`; recordedTo filter dropped (Chunk has no recorded time); SEARCH form kept only as a prose note for 2026.01+ |
| Q-D1-15 (L454) | `(dep:Identifier)-[:HAS_IDENTIFIER]->(t)` reversed | `(t)-[:HAS_IDENTIFIER]->(dep:Identifier)` |
| Q-D1-26 (L661) | UNION branches return different column names; two reversed HAS_IDENTIFIER hops | both branches alias `uid`, `name`, `scientificName`; `(node)-[:HAS_IDENTIFIER]->(id:Identifier)` |

Also: header line now says Neo4j 5.26 / Cypher 5 (was "5/2025+"); Q-D1-16 comment "or D8 Trademark" (prose finding: no Trademark type anywhere) reworded; fixture `07-fixtures/nr-trial-unstructured/assertions.yaml` retrievalPath text "Neo4j SEARCH" -> `db.index.vector.queryNodes`. Grep for reversed HAS_IDENTIFIER / CYPHER 25 / SEARCH in 04 SDL, 05, 06, 09, 10, 11, SUMMARY: none other (10-seams HAS_IDENTIFIER row already says from K.Identifier, direction IN, i.e. the IN field).

rulingBroken blocks left as the packet record (S writes final versions): CQ-PF-01 and CQ-ID-03 (R-30 `declaredNameVerbatim`/`formVerbatim`), CQ-ID-04 (R-42), Q-D1-16 (R-68 MANUFACTURES_MATERIAL -> MANUFACTURES).

Commands and key outputs:

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D1 \
  --json <scratchpad>/lint-D1.json --md <scratchpad>/lint-D1.md
  -> "D1: 36 total, 4 failing (0 packetBug, 4 rulingBroken), 2 fragment, 0 gds"; selfCheckDiffs 0; proseFindings 0
node scripts/packet-check.mjs D1   (in A2)
  -> ok: true, exit 0 (nodeTypes 4, relationshipTypes 6, pairs 7, questions 33, fixtures 5)
```

rulingBroken went 3 -> 4 because CQ-ID-04 was packetBug with alsoRulingBroken (R-42); after the direction fix only the ruling issue remains. Per-packet reports written to the session scratchpad, not to `final/_work/pattern-lint.{json,md}`; the coordinator's full re-run refreshes the shared report. SDL unchanged.

---

<!-- stage: _runlog/closeout-A2-D12.md -->

# Close-out: pattern lint — packet owner A2, packet D12 (2026-10-09)

Scope: fix every packetBug block of `biotech-knowledge-services-A2/schema/program/packets/D12/03-retrieval-patterns.md` (lint class packetBug); write only under `packets/D12/` in A2; no SDL change; no commit.

Input: `final/_work/pattern-lint.json` D12 = {total 36, failing 9, packetBugs 9, rulingBroken 0}.
packetBug blocks (question → finding): Q-D12-03 (RESULT_FOR pair, rf.assertionUid), Q-D12-04 (lv.asOfStatement), Q-D12-05 (HAS_IDENTIFIER direction), Q-D12-06 (RESULT_FOR pair, HAS_ACTION_LEVEL unregistered), Q-D12-07 (SUPPLIED_INGREDIENT/PROCESSED_INGREDIENT retired), Q-D12-16 (u.exposureChange), Q-D12-18 (HAS_CLAIM_CONDITION unregistered), Q-D12-26 (implicit grouping), Q-D12-34 (implicit grouping + HAS_IDENTIFIER direction).

Commands and key outputs:

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D12 --json <scratchpad>/lint-D12.json --md <scratchpad>/lint-D12.md
  -> "D12: 36 total, 3 failing (0 packetBug, 3 rulingBroken), 2 fragment, 0 gds"; selfCheckDiffs 0
  rulingBroken left for S: Q-D12-03 / Q-D12-06 (QualityResult)-[:QUALITY_RESULT_FOR]->(Product) pair cut [R-73/R-95]; Q-D12-18 dc.statementVerbatim [R-30]
(cd biotech-knowledge-services-A2) node scripts/packet-check.mjs D12
  -> {"ok": true, "packet": "D12", nodeTypes 3, relationshipTypes 4, pairs 8, questions 34, fixtures 5}; exit 0
```

The re-run wrote its reports to the session scratchpad, not over the shared `final/_work/pattern-lint.{json,md}`.

Files changed (A2, uncommitted): `packets/D12/03-retrieval-patterns.md` (9 blocks + header convention line), `05-relationship-register.yaml` (predicateOnly: HAS_ACTION_LEVEL | HAS_CLAIM_CONDITION consumed from D8 per R-93), `10-seams.yaml` (D8 seam RESULT_FOR -> QUALITY_RESULT_FOR), `11-open-questions.md` (OQ-D12-31 close-out note), `RUNLOG.md` ("Close-out: pattern lint").

Not changed: `04-schema-proposal.graphql` (no docstring repeated an error); fixture `07-fixtures/acrylamide-fried-potato-harm` still writes D8 `RESULT_FOR` (the S re-pathed fixtures own that, FU-03). The A2 worktree also shows uncommitted D1 edits by the D1 owner; untouched.

---

<!-- stage: _runlog/closeout-A3-D2.md -->

# Close-out — packet owner A3, packet D2 (pattern lint)

2026-10-09. Worktree `biotech-knowledge-services-A3` (branch ft/schema-A3, head f4fb477, uncommitted edits under `schema/program/packets/D2/` only). No SDL change.

## Baseline (S `final/_work/pattern-lint.json`)

D2: total 39, failing 5 — packetBug 3 (Q-D2-11, Q-D2-16, Q-D2-21 [alsoRulingBroken R-52/R-89]), rulingBroken 2 (Q-D2-10 R-59, Q-D2-18 R-47).

## Edits (A3 worktree, `schema/program/packets/D2/`)

| Block | Finding | Fix |
|---|---|---|
| Q-D2-11 (03 l.433) | HAS_IDENTIFIER direction reversed | `(x)-[:HAS_IDENTIFIER]->(id:Identifier)` |
| Q-D2-16 (03 l.526) | no pair Assessment→Assertion for ASSESSES | `(cl)-[:OCCURRENCE_OF]->(:Claim)<-[:ASSESSES]-(asm:Assessment {assessmentKind:'EVIDENCE_SYNTHESIS'})` |
| Q-D2-21 (03 l.628-629) | 4 unregistered predicates (HOLDS_EQUITY_IN, CONSULTS_FOR, INVENTOR_OF_PATENT_LICENSED_TO, SUPPLIES) | D7 typed `HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM` (Person→Organization, `recordedTo IS NULL`) + D7 predicate-only `SUPPLIES_MATERIAL` (Organization→IngredientMaterial, D1 REALIZES_SUBSTANCE roll-up); section prose reworded |

Also: `11-open-questions.md` item 19 marked resolved; `10-seams.yaml` ASSESSES seam names K.Claim. `RUNLOG.md` entry "Close-out: pattern lint".

## Commands and outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D2 \
  --json <scratchpad>/lint-D2.json --md <scratchpad>/lint-D2.md
# run 1 (after query fixes): D2: 39 total, 3 failing (0 packetBug, 3 rulingBroken) — Q-D2-21 prose still named the old predicates (R-89 pending-edit check reads prose)
# run 2 (prose reworded):    D2: 39 total, 2 failing (0 packetBug, 2 rulingBroken), 10 fragment, 1 gds; ok 26; cypher25 0; selfCheckDiffs 0
#                            Q-D2-11 ok, Q-D2-16 ok, Q-D2-21 ok

cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A3 && node scripts/packet-check.mjs D2
# {"ok": true, "packet": "D2", counts: nodeTypes 5, relationshipTypes 6, pairs 10, questions 34, fixtures 5}  exit 0
```

The per-packet lint reports went to the session scratchpad, not to `final/_work/pattern-lint.{json,md}` (shared report left for the linter owner to regenerate).

## Remaining

- rulingBroken (not rewritten here, by instruction): Q-D2-10 (R-59: `r.direction = 'DECREASES'` not in final EstimateDirection), Q-D2-18 (R-47: `nNoChangeContexts`; ranks AFFECTS_MECHANISM, not a D10 Association).
- Fixture `07-fixtures/nr-muscle-unstructured` A-nr-06 still uses the draft predicate `HOLDS_EQUITY_IN` (FU-03 re-path; D7 form is a HOLDS_STAKE {stakeKind: EQUITY} episode).

---

<!-- stage: _runlog/closeout-A3-D4.md -->

# Close-out — packet owner A3, packet D4 (pattern lint)

2026-10-09. Worktree `biotech-knowledge-services-A3` (ft/schema-A3), writes under `schema/program/packets/D4/` only; not committed.

Input from `final/_work/pattern-lint.json`: D4 total 38, failing 3, packetBug 3, rulingBroken 0.

| Block | Finding | Fix |
|---|---|---|
| Q-D4-09 (L379) | `(Identifier)-[:HAS_IDENTIFIER]->(Device)` reversed | `(d)-[:HAS_IDENTIFIER]->(id:Identifier)` |
| Q-D4-14 (L469) | `od.measureText` not on OutcomeDefinition (D3) | `od.name, od.description, od.timepoint` |
| Q-D4-22 (L604) | `CYPHER 25` prefix + `SEARCH … VECTOR INDEX` syntax error on 5.26 | prefix removed; `CALL db.index.vector.queryNodes('metric_embedding', 20, $textEmbedding) YIELD node AS m, score AS vs` |

Grep for the same errors elsewhere in D4 (SDL docstrings, registers, 09/10/11, SUMMARY; `_notes/` excluded): none.

Commands and key outputs:

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D4 \
  --json <scratchpad>/lint-D4.json --md <scratchpad>/lint-D4.md
  -> "D4: 38 total, 0 failing (0 packetBug, 0 rulingBroken), 2 fragment, 1 gds"; selfCheckDiffs 0
  -> Q-D4-09 ok, Q-D4-14 ok, Q-D4-22 ok (EXPLAIN ok)
node scripts/packet-check.mjs D4   (in A3)
  -> ok: true, exit 0 (nodeTypes 7, relationshipTypes 13, pairs 17, questions 35, fixtures 7)
```

The per-packet run wrote its reports to the session scratchpad, not to `final/_work/pattern-lint.{json,md}`; the coordinator's full re-run refreshes the shared report. SDL unchanged.

---

<!-- stage: _runlog/closeout-A4-D3.md -->

# Close-out — packet owner A4 / D3 (pattern lint, FU-04)

2026-10-09. Worktree `biotech-knowledge-services-A4` (ft/schema-A4, base 44b87ff). Edited only `schema/program/packets/D3/03-retrieval-patterns.md` and appended `RUNLOG.md` ("Close-out: pattern lint"). No SDL change; nothing committed.

## Input
`final/_work/pattern-lint.json`: D3 `{"total":33,"failing":6,"packetBugs":5,"rulingBroken":1}`. packetBug blocks: CQ-EV-05 (UNION column names differ), Q-D3-11 and Q-D3-12 (`r.recordedTo` — iterator `r` shadowed the StudyResult variable), Q-D3-13 (implicit grouping key `loc.selectorDigest` inside an aggregate), Q-D3-14 (`CYPHER 25` + `SEARCH` clause).

## Fixes
- CQ-EV-05: aliased both UNION branches of statement 2 (`kind, uid, predicate, recordedAt, dependants`); `;` after statement 1.
- Q-D3-11 / Q-D3-12: `all(rv IN relationships(path) WHERE ASOF(rv))`.
- Q-D3-13: `WITH … collect(aloc.selectorDigest) AS verifierDigests` then `loc.selectorDigest IN verifierDigests`.
- Q-D3-14: `CALL db.index.vector.queryNodes('chunk_embedding', 50, $queryEmbedding) YIELD node AS ch, score`; header text "Cypher 25" → "Cypher 5 (Neo4j 5.26)".
- grep of D3 (excluding `_notes/`) for `CYPHER 25` / `SEARCH` / the shadowed filter: no other occurrences in SDL, registers or seams.

## Commands and key outputs
```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D3 \
  --json <scratchpad>/lint-D3.json --md <scratch>/lint-D3.md
  -> "D3: 33 total, 2 failing (0 packetBug, 2 rulingBroken), 1 fragment, 1 gds"; selfCheckDiffs 0
node scripts/packet-check.mjs D3   (in A4)
  -> "ok": true, exit 0
```
Lint reports went to the session scratchpad so the shared `final/_work/pattern-lint.{json,md}` were not overwritten; the coordinator's full re-run will refresh them.

## Left for S
rulingBroken (not rewritten, packet stays a record of its SDL): CQ-EV-05 shared-Identifier Publication↔Source join (R-42); Q-D3-04 `rec.revisionStatus = 'RETRACTED'` vs SourceRevisionKind (R-44). Fragment (Conventions `TRACE` body, needs outer `e`) and gds-unvalidated CQ-ST-07 unchanged.

---

<!-- stage: _runlog/closeout-A5-D5.md -->

# Close-out: pattern lint — packet owner A5, packet D5

Date: 2026-10-09. Worktree `biotech-knowledge-services-A5` (branch ft/schema-A5, HEAD 53b6a9f). Writes only under `schema/program/packets/D5/`. No SDL change, nothing committed.

## Input

`final/_work/pattern-lint.json` D5: total 35, failing 4, packetBug 2, rulingBroken 2.

- L164 CQ-RC-06 packetBug: `(ReportItem)-[:BLOCKED_BY]->(Assertion)` no such pair; D10 SDL has ReportItem→UseConstraint (`blockedBy`) and ReportItem→Assessment (`blockedByAssessments`).
- L481 Q-D5-13 packetBug (+ruling R-80): `i.observedAt` not a property of D7 Role/Stake/ValueEdgeProperties (D7 header: observedAt removed; use the authorizing Assertion's `validObservedAt` via `assertionUid`).
- L621 Q-D5-17 rulingBroken (R-80), L687 Q-D5-20 rulingBroken (R-42): left as is (S writes final-SDL versions).

## Fixes (A5 worktree, packets/D5)

- 03 CQ-RC-06 (b): `MATCH (i)-[:BLOCKED_BY]->(uc:UseConstraint)` + `OPTIONAL MATCH (i)-[:DERIVED_FROM]->(b:Assertion)-[:RESOLVES_TO_CONSTRAINT]->(uc)`; D10-writes comment and trace line rewritten.
- 03 Q-D5-13: `OPTIONAL MATCH (ia:Assertion {uid: i.assertionUid})`, `ia.validObservedAt AS observedAt`; comment and bitemporal note rewritten.
- Same BLOCKED_BY→Assertion text repeated in 10-seams.yaml (ASSESSES note; BLOCKED_BY row now `to: "D5.UseConstraint | D10.Assessment"`, direction IN), 02-questions.md (CQ-RC-06 answer shape), 11-open-questions.md (OQ-D5-39 marked superseded). 03 header gained a close-out note; RUNLOG entry "Close-out: pattern lint".

## Commands and outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D5 \
  --json <scratchpad>/lint-D5.json --md <scratchpad>/lint-D5.md
# outputs to scratch so the full-suite final/_work/pattern-lint.{json,md} is not overwritten by a single-packet run
# selfCheckDiffs 0; exit 0
# D5: total 35, ok 24, fragment 7, gdsUnvalidated 1, packetBugs 0, rulingBroken 3, failing 3, cypher25 0
#   rulingBroken: Q-D5-13 (R-80 PROTOCOL_AUTHORED_BY), Q-D5-17 (R-80), Q-D5-20 (R-42 identifier join)

cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A5 && node scripts/packet-check.mjs D5
# {"ok": true, "packet": "D5", counts nodeTypes 6, relationshipTypes 6, pairs 8, questions 34, fixtures 4}; exit 0
```

Files modified (A5): 02-questions.md, 03-retrieval-patterns.md, 10-seams.yaml, 11-open-questions.md, RUNLOG.md.

---

<!-- stage: _runlog/closeout-A6-D6.md -->

# Close-out: pattern lint — A6 / D6

2026-10-09. Worktree C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A6 (ft/schema-A6, HEAD 2ca247a, uncommitted). Writes only under schema/program/packets/D6/.

Input (S pattern-lint.json, 2026-10-09T06:48Z): D6 total 41, failing 8, packetBug 3 (Q-D6-01 L67, CQ-AX-19 L704, Q-D6-18 L756), rulingBroken 5.

Fixes (03-retrieval-patterns.md):
1. Q-D6-01 — `r.validObservedAt` not on HAS_LABEL_VERSION (StateEpisodeProperties); kernel field is Assertion.validObservedAt → join `(ea:Assertion {uid: r.assertionUid})`, coalesce `ea.validObservedAt`.
2. CQ-AX-19 — `RESULT_FOR` → `QUALITY_RESULT_FOR` (D8 rename, OQ-D8-30). Also 10-seams.yaml inbound row and 11-open-questions.md OQ-D6-13.
3. Q-D6-18 — "Aggregation column contains implicit grouping expressions" (`xs + collect(...)`) → `WITH p, xs, collect(DISTINCT pk) AS pks, … ` then `WITH p, xs + pks + lvs + ls AS scope`.

Commands:
- `node C:/…/final/_work/lint-packet-patterns.mjs --packets D6 --json <scratch>/lint-D6.json --md <scratch>/lint-D6.md`
  → D6: total 41, ok 31, fragment 4, gdsUnvalidated 0, packetBugs 0, rulingBroken 6, cypher25 0, selfCheckDiffs 0. (Scratch output used so the shared final/_work/pattern-lint.{json,md} was not overwritten mid-round.)
- `node scripts/packet-check.mjs D6` (A6) → ok true, exit 0 (nodeTypes 6, relationshipTypes 9, pairs 11, questions 37, fixtures 7).

Remaining rulingBroken (6, left for S): Q-D6-01, CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-10 (R-30 DECLARES_COMPONENT declaredNameVerbatim / formVerbatim / statementVerbatim), Q-D6-11 (R-30 + predicate PREPARED_WITH not in final predicate vocabulary).
No SDL change. No commit.

---

<!-- stage: _runlog/closeout-A6-D7.md -->

# Close-out: pattern lint — packet owner A6, packet D7 (2026-10-09)

Worktree `biotech-knowledge-services-A6` (branch ft/schema-A6, HEAD 2ca247a); wrote only `schema/program/packets/D7/{03-retrieval-patterns.md, RUNLOG.md}`. Not committed.

Input: `final/_work/pattern-lint.json` D7 = 34 total, 8 failing, 1 packetBug, 7 rulingBroken.

## Fix

Q-D7-04 (03 line ~310): `Neo.ClientError.Statement.SyntaxError: Type mismatch: inv defined with conflicting type Relationship (expected Node)`.
Variable `inv` bound both to the issuer `INVOLVES` edge and to the investor node. Change:

```
- MATCH (x:Organization {uid: $issuer})<-[inv:INVOLVES]-(e)
- WHERE e.eventKind = 'FINANCING'
+ MATCH (x:Organization {uid: $issuer})<-[iss:INVOLVES]-(e)
+ WHERE e.eventKind = 'FINANCING' AND iss.role = 'ISSUER'
```

(D13 `EventRoleEdgeProperties.role: EventRole!` declares `ISSUER`.) No other D7 text repeats the error.

## Commands

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D7 \
  --json <scratchpad>/lint-D7.json --md <scratchpad>/lint-D7.md
# -> "D7: 34 total, 7 failing (0 packetBug, 7 rulingBroken), 0 fragment, 2 gds"; selfCheckDiffs 0; Q-D7-04 class ok
node scripts/packet-check.mjs D7      # (A6) -> exit 0, "ok": true, nodeTypes 4, relationshipTypes 7, pairs 9, questions 33, fixtures 6
```

The shared `final/_work/pattern-lint.{json,md}` were not overwritten (D7-only run written to scratch); the coordinator's full re-run will pick up the fix.

Remaining rulingBroken (unchanged by instruction): R-19 pendingEdit, R-30 `roleTitleVerbatim`, R-80 predicate `AUTHORED`.

---

<!-- stage: _runlog/closeout-A7-D13.md -->

# Close-out — A7 / D13 pattern lint

2026-10-09. Worktree `biotech-knowledge-services-A7` (ft/schema-A7, HEAD 10ef1ea). Wrote only `schema/program/packets/D13/03-retrieval-patterns.md` and `schema/program/packets/D13/RUNLOG.md` there; this log in S. No commit. SDL unchanged.

## Input
`final/_work/pattern-lint.json`: D13 total 35, failing 9, packetBug 5, rulingBroken 4.

## packetBug blocks fixed (5)
- L187 Q-D13-05: removed `CYPHER 25` + `SEARCH c IN (VECTOR INDEX ...)`; now `CALL db.index.vector.queryNodes('chunk_embedding', 8, $queryEmbedding) YIELD node AS c, score`; dropped `c.recordedTo` (not a D9 Chunk property).
- L470 Q-D13-16: implicit grouping (`events` with `count(st)`) → `WITH x, events, collect(DISTINCT st.uid) AS registeredStudies`.
- L503 Q-D13-17: `(Assessment)-[:ASSESSES]->(Assertion)` → `(occ)-[:OCCURRENCE_OF]->(:Claim)<-[:ASSESSES]-(as:Assessment)-[:DERIVED_FROM]->(occ)` (kernel Assessment docstring rule).
- L671 Q-D13-24: same pair → via OCCURRENCE_OF Claim.
- L690 Q-D13-25: ORDER BY on `e` after aggregation → projected `orderAt`.
- Conventions "Kernel path names" bullet clarified (no Assessment→Assertion).

## Commands
```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D13 --json <scratch>/lint-D13.json --md <scratch>/lint-D13.md
  -> "D13: 35 total, 4 failing (0 packetBug, 4 rulingBroken), 0 fragment, 0 gds"; cypher25 0; selfCheckDiffs 0
  -> fixed blocks Q-D13-05/16/17/24/25: class ok, EXPLAIN ok
cd biotech-knowledge-services-A7 && node scripts/packet-check.mjs D13
  -> exit 0; {"ok": true, "packet": "D13", counts nodeTypes 2, relationshipTypes 5, pairs 7, questions 33, fixtures 5}
```
Report written to scratch (not over `final/_work/pattern-lint.json`); the S coordinator's full re-lint will pick up the A7 change.

## Remaining (rulingBroken, left for S final-SDL versions)
Q-D13-04 L132 (R-66), Q-D13-12 L366 (R-66), Q-D13-14 L421 (R-44 PUBLISHER), Q-D13-22 L611 (R-21 pending edit-pattern).

---

<!-- stage: _runlog/closeout-A7-D8.md -->

# Close-out: pattern lint — packet owner A7, packet D8 (2026-10-09)

Worktree `biotech-knowledge-services-A7` (branch ft/schema-A7, HEAD 10ef1ea); wrote only `schema/program/packets/D8/{03-retrieval-patterns.md, RUNLOG.md}`. Not committed. SDL unchanged.

Input: `final/_work/pattern-lint.json` D8 = 35 total, 8 failing, 2 packetBug, 6 rulingBroken.

## Fixes (03-retrieval-patterns.md)

1. Q-D8-03 statement 2 (line ~153): `CYPHER 25` prefix + Cypher 25 `SEARCH c IN (VECTOR INDEX chunk_embedding FOR $questionEmbedding LIMIT 20) SCORE AS score`
   (SyntaxError "Invalid input 'SEARCH'") ->
   `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score`. Statements (1)/(2) now end with `;`.
2. CQ-EC-01 (line ~547): the shared post-UNION AS_OF filter read `r.validFrom`/`r.validTo` on ADDRESSED_TO|ISSUED_BY (and CONCERNS,
   QUALITY_RESULT_FOR, LOT_OF), which carry `AssertedRecordedProperties` (no valid time). Filters moved into each UNION branch:
   AS_OF on STATUS_OF|COVERS and ASSIGNED_TO|LICENSED_TO (AssertedEdgeProperties); KNOWN_AT on CONCERNS|QUALITY_RESULT_FOR|LOT_OF,
   ADDRESSED_TO|ISSUED_BY and the intermediate CONCERNS hop.
3. TRACE convention fragment (static finding, not counted): `adj.semanticVerdict` -> `adj.verdict` (kernel `Adjudication.verdict: SemanticVerdict!`).

grep of D8 (04 SDL, 05/06 registers, 09, 10, fixtures) for `CYPHER 25`, `SEARCH c IN`, `semanticVerdict`: no other occurrence.
rulingBroken blocks (CQ-MF-01, Q-D8-10, Q-D8-13 [R-68]; Q-D8-18, Q-D8-19 [R-73]; Q-D8-23 [R-72]) left untouched by design.

## Commands

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D8 \
  --json <scratchpad>/d8-lint.json --md <scratchpad>/d8-lint.md
# -> D8: total 35, ok 27, fragment 2, gdsUnvalidated 0, packetBugs 0, rulingBroken 6, failing 6, cypher25 0; selfCheckDiffs 0
node scripts/packet-check.mjs D8      # (A7) -> exit 0, "ok": true, nodeTypes 6, relationshipTypes 11, pairs 29, questions 33, fixtures 6
```

The shared `final/_work/pattern-lint.{json,md}` were not overwritten (D8-only run written to scratch); the coordinator's full re-run will pick up the fix.

---

<!-- stage: _runlog/closeout-A8-D11.md -->

# Close-out: packet owner A8, packet D11 (pattern lint + TL-04)

Date: 2026-10-09. Worktree: C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A8 (ft/schema-A8 @ 5b9788a). The edits are uncommitted and limited to schema/program/packets/D11/. The D9 edits in the same worktree belong to the D9 close-out. No SDL change.

## Input

`final/_work/pattern-lint.json` D11: 30 blocks, 30 failing, 30 packetBug, 0 rulingBroken.

| block(s) | packet issue |
|---|---|
| all 30 | `CYPHER 25` prefix |
| Q-D11-16 | aggregation with an implicit grouping key (`npi`) |
| CQ-AX-04, Q-D11-22 | dynamic label in WHERE (`x:$($label)`), which Cypher 5 allows only in MATCH/CREATE/MERGE/SET/REMOVE |
| CQ-AX-14, Q-D11-10 | label `Mention` not declared (the kernel cut it) |
| CQ-PV-04 | `line.quantityBasis` is not on ComponentLineProperties; `'UNSPECIFIED'` is not a QuantityBasis value |

## Edits (A8 schema/program/packets/D11/)

- `03-retrieval-patterns.md`:
  - Removed all 30 `CYPHER 25` lines.
  - CQ-AX-04 now uses `MATCH (x:$($label) {uid: $uid})`. Q-D11-22 now uses `MATCH (n:$(e.label))`.
  - Q-D11-16: `WITH npi, h, collect(CASE WHEN ra IS NULL THEN null ELSE {...} END) AS hypotheses`; the verdict reads `size(hypotheses)`.
  - CQ-AX-14 and Q-D11-10 are rewritten to the K Q-K-13 shape. The span is a SourceLocator that a RESOLUTION Assessment cites with `HAS_EVIDENCE {role:'CONTEXT'}`. The candidates are `ASSESSES`. The licensed edge is `(:Chunk)-[:MENTIONS]->(cand)` with the assessment uid in `derivedFromAssessmentUids`.
  - CQ-PV-04 reads `line.massBasis`, `line.amountBasis` and `ic.massBasis`. `basisRisk` is true when the D1 MassBasis is UNSPECIFIED or null on either side.
  - Conventions and prose: `Mention` removed.
- `07-fixtures/capture-failures-coverage/assertions.yaml` `queries.CQ-AX-04`: same fix (no CYPHER 25, MATCH dynamic label). A diff against the `03` block shows the two are still identical.
- `05-relationship-register.yaml` (line 68), `06-node-register.yaml` (line 50) and `09-reasoning.md` (line 104): "Mention + RESOLUTION Assessment" is replaced by the span-locator form.
- Left as is: the `Mention` node in fixture `nr-chloride-gsrs-identifier-bridge`. It is the FU-03 residual already listed in `final/fixtures/README.md`.
- TL-04, `_notes/action-space/build-action-space.mjs`: new `quoteFlowScalars(doc)`, applied to the action-space document and to the reconciliation block.
  - Inside flow collections it double-quotes every string; flow-map keys that are bare words stay plain.
  - Anywhere in the document it also quotes any string that matches a PyYAML YAML 1.1 implicit resolver: bool, int, float, null, merge, value or timestamp.
  - The hand-written `scoredAt` in `identifier-bridges.yaml` (line 30) is now quoted too, because PyYAML read it as a date.
  - Regenerated `tooling/action-space.yaml` and the `identifier-bridges.yaml` block.

## Commands and key outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D11 --json <scratchpad>/lint-D11.json --md <scratchpad>/lint-D11.md
  → D11: total 30, ok 26, packetBugs 0, rulingBroken 4, cypher25 0, selfCheckDiffs 0
  → rulingBroken (left in packet names): Q-D11-05 (R-42), Q-D11-08 (R-82 DISCLOSES_SUPPORT_FROM / DECLARES_NO_COMPETING_INTEREST),
    Q-D11-19 (R-42), CQ-PV-05 (R-42 pending edit-pattern, prose)
docker exec bks-neo4j-synth cypher-shell … "EXPLAIN MATCH (x:$($label) {uid: $uid}) RETURN x"   → plans on 5.26
node schema/program/packets/D11/_notes/action-space/build-action-space.mjs           → exit 0
node schema/program/packets/D11/_notes/action-space/build-action-space.mjs --check   → exit 0 (summary JSON byte-identical to pre-change --check; scorecard unchanged)
python -I -c "import yaml,sys; yaml.safe_load(open(sys.argv[1],encoding='utf-8'))" …/D11/tooling/action-space.yaml   → exit 0 (before: ParserError line 2931 '(?)' in a flow sequence)
python -I -c "…same…" …/D11/identifier-bridges.yaml                                   → exit 0 (before: ParserError line 557)
deep-equal (JSON, sorted keys): Node-yaml(before) == Node-yaml(after) == PyYAML(after)  → True for action-space.yaml and identifier-bridges.yaml
PyYAML safe_load over every D11 *.yaml (fixtures, registers, seams, tooling)           → all load
node scripts/packet-check.mjs D11                                                       → exit 0 (nodeTypes 1, relationshipTypes 0, pairs 0, questions 30, fixtures 5)
```

The S report `final/_work/pattern-lint.{json,md}` was not overwritten; the per-packet run wrote to the scratchpad. A full linter rerun will show D11 at 0 packetBug.

## Result

30 blocks fixed. Remaining: 0 packetBug and 4 rulingBroken; S writes the final-SDL versions of the rulingBroken blocks. TL-04 is closed for D11. RUNLOG entry: "2026-10-09 — Close-out: pattern lint (A8, D11)".

---

<!-- stage: _runlog/closeout-A8-D9.md -->

# Close-out — packet owner A8, packet D9 (pattern lint)

Date: 2026-10-09. Worktree: C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A8 (ft/schema-A8 @ 5b9788a, uncommitted edits under schema/program/packets/D9/ only).

## Input

`final/_work/pattern-lint.json` D9: total 40, failing 30, packetBug 5, rulingBroken 25. The 5 packetBug blocks (all also rulingBroken for F-05 `ClaimOccurrence`):

| line | block | packet issue |
|---|---|---|
| 41 | Conventions index DDL | `CYPHER 25`; `CREATE VECTOR INDEX … WITH [...]` syntax error on 5.26 |
| 118 | CQ-CL-05 | `CYPHER 25` |
| 304 | Q-D9-02 | `CYPHER 25` |
| 591 | Q-D9-19 | `CYPHER 25` |
| 616 | Q-D9-20 | `CYPHER 25`; `SEARCH` clause syntax error on 5.26 |

## Edits (schema/program/packets/D9/03-retrieval-patterns.md)

- Removed the `CYPHER 25` prefix from all 5 blocks; header text says Cypher 5 (also valid Cypher 25).
- `chunk_embedding` DDL: dropped the 2026.01+ `WITH [ … ]` in-index filter clause; prose names it as the 2026.01+ addition.
- Q-D9-20: `SEARCH` → `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score` + `WITH c, score WHERE c.language = 'en'`; SEARCH form kept as a comment (as final P-04a).
- No SDL / register / docstring change (grep for `CYPHER 25` / `SEARCH` in D9 found none outside 03 and RUNLOG history). rulingBroken blocks untouched.

## Commands and key outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D9 --json <scratchpad>/lint-D9.json --md <scratchpad>/lint-D9.md
  → "D9: 40 total, 30 failing (0 packetBug, 30 rulingBroken), 1 fragment, 0 gds"; cypher25 0; selfCheckDiffs 0
  → blocks 41, CQ-CL-05, Q-D9-02, Q-D9-19 (projection), Q-D9-20: EXPLAIN ok
node scripts/packet-check.mjs D9   (in A8)
  → ok: nodeTypes 3, relationshipTypes 8, pairs 9, questions 36, fixtures 6; exit 0
```

The shared `final/_work/pattern-lint.{json,md}` were not overwritten (reports went to the scratchpad); the coordinator re-runs the full lint.

Files written: A8 `schema/program/packets/D9/03-retrieval-patterns.md`, `schema/program/packets/D9/RUNLOG.md`; this log. Nothing committed.

---

<!-- stage: _runlog/closeout-S-patterns-D1.md -->

# Close-out — S pattern writer, packet D1 (FU-04)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S, 31390a6). Not committed; SDL unchanged (sha256 `c7cf1235…4793`).

## Inputs

- `final/_work/pattern-lint.json` D1: total 36, failing 9 (packetBug 6, rulingBroken 3; CQ-ID-04 packetBug with alsoRulingBroken R-42).
- Owner's fixed `biotech-knowledge-services-A2/schema/program/packets/D1/03-retrieval-patterns.md` (head 6635197 + uncommitted close-out edits; `_runlog/closeout-A2-D1.md`: owner re-lint "36 total, 4 failing (0 packetBug, 4 rulingBroken)").
- Rulings read: R-30, R-42, R-68 (`decision-report.md`); `vocabularies/predicates.yaml` (MANUFACTURES_MATERIAL alias-of MANUFACTURES; SUPPLIES_MATERIAL qualifiers buyer, exclusivity; MARKETED_UNDER_MARK D1); `vocabularies/identifier-schemes.yaml` rules (identity, uniqueness, bridges).
- Qualifier spelling `declaredName:` / `form:` taken from the re-pathed fixtures (`fixtures/D10/mg-rankings-criteria-comparison`, `fixtures/cross-domain/product-comparison`, `fixtures/D1/*` after the FU-03 close-out).

## Output

`final/patterns-by-question/D1.md`: CQ-PF-01 (R-30), CQ-ID-03 (R-30), CQ-ID-04 (R-42), Q-D1-16 (R-68). 4 rewritten, 4/4 EXPLAIN ok, 0 static findings, 0 gds-unvalidated, 0 lost. CQ-ID-04 drops the `alsoAssignedTo` shared-Identifier column; disagreement is now same (scheme, value) from another issuer (value comparison of two Identifiers, never identity) plus RESOLUTION / EQUIVALENCE Assessments about the substance.

## Commands

```
docker ps --filter name=bks-neo4j-synth   -> Up 5 hours
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D1 --fill
  -> D1: {"questions":4,"ok":4,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":4,"statementsExplainOk":4,"staticFindings":0}
     report: final/_work/by-question/D1.json (Neo4j 5.26.31 community)
```

Plan probe (scratchpad driver script, EXPLAIN only) for CQ-ID-04's `sameValueElsewhere` subquery: `NodeUniqueIndexSeek UNIQUE oi:Identifier(scheme, issuer, value) WHERE scheme = i.scheme AND issuer IS NOT NULL AND value IS NOT NULL` then Filter on value / issuer. Cost grows with the size of the scheme; a `(scheme, value)` index would make it a point seek. That is executor DDL (EX-01), not SDL; noted in D1.md.

`validate-by-question.mjs` reused unchanged (shared). No other container touched; no volumes pruned.

---

<!-- stage: _runlog/closeout-S-patterns-D10.md -->

# Close-out — S pattern writer / packet D10 (FU-04)

2026-10-09. Worktree C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S (ft/schema-S @ 31390a6). Wrote `final/patterns-by-question/D10.md` and this log; `final/_work/by-question/D10.json` is the validator's report. No SDL change (sha256 c7cf1235dba876b2… unchanged); nothing committed. Shared validator `final/_work/validate-by-question.mjs` reused unchanged.

## Inputs

- `final/_work/pattern-lint.json` D10: 37 blocks, 7 failing = 4 packetBug (CQ-RC-06, Q-D10-07, Q-D10-11, Q-D10-17; fixed by owner A1, see `closeout-A1-D10.md`) + 3 rulingBroken: Q-D10-03 (R-83), Q-D10-08 (R-83), Q-D10-21 (R-94).
- Owner patterns: `biotech-knowledge-services-A1/schema/program/packets/D10/03-retrieval-patterns.md` (7aaeb2f + uncommitted close-out edits).
- Rulings: decision-report R-83, R-94, R-19, R-34, R-78/R-89; `_work/rulings.yaml` lines 354-360; `vocabularies/predicates.yaml` (RECOMMENDS_AGAINST registrar D9; CHARACTERIZES_EVIDENCE_STRENGTH subject Claim; USE_CONSTRAINED_IN object Condition; HOLDS_ROLE / HOLDS_STAKE / RECEIVES_VALUE_FROM registered).
- Final IR pairs checked: OCCURS_IN Assertion→MediaWork; RENDITION_OF Source→MediaWork|Publication; BLOCKED_BY ReportItem→UseConstraint|Assessment; ASSESSES Assessment|Report|ReportItem→Target|Claim; RESOLVES_TO_CONSTRAINT Assertion→UseConstraint.

## Commands and key outputs

1. `node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D10`
   → `D10: {"questions":3,"ok":3,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":3,"statementsExplainOk":3,"staticFindings":0}`.
2. Negative self-test on a scratch copy (scratchpad, `--no-db`): OCCURS_IN → Publication, `HAS_INTEREST_IN` predicate, `tloc.exactX` → 5 findings (pair, retired-by:R-78 predicate, property ×3), all 3 questions failing. Confirms macro-expanded static checks run on this file.
3. `node …/validate-by-question.mjs --packets D10 --fill` → same counts, exit 0; status lines filled ("EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); final-SDL static check clean").
4. `sha256sum final/schema/final_biotech_schema_v2.graphql` → c7cf1235dba876b2… (unchanged).

## Result

3 questions rewritten, 3/3 EXPLAIN ok, 0 GDS, 0 lost. Q-D10-03 / Q-D10-08: guideline branch → WORSENS_TARGET | NO_EFFECT_ON_TARGET with speechAct CAUTIONS | RECOMMENDS, USE_CONSTRAINED_IN population guidance, D9 RECOMMENDS_AGAINST via `target:<key>` qualifier (no Target object). Q-D10-21: container from OCCURS_IN (R-94), statement time per R-19, RECOMMENDS_USE subject only (R-83), interest families HOLDS_ROLE | HOLDS_STAKE | RECEIVES_VALUE_FROM.

Note for open-questions (not edited by this role): the `target:<key>` qualifier prefix used by R-83 is not among the "registered prefixes" listed in the Assertion.qualifiers docstring of the final SDL; worth registering in the qualifier vocabulary (no SDL change needed now).

---

<!-- stage: _runlog/closeout-S-patterns-D13.md -->

# Close-out — S final-SDL pattern writer, packet D13

2026-10-09. Worktree `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). No SDL change and no commit.

## Inputs

- `final/_work/pattern-lint.json`, D13 entry: 35 total, 9 failing (5 packetBug, 4 rulingBroken). The rulingBroken blocks are Q-D13-04 L132 (R-66, the designationType literals), Q-D13-12 L366 (R-66, the approvalPathway literals), Q-D13-14 L421 (R-44, PUBLISHER) and Q-D13-22 L609 (R-21, the edit-pattern is not applied).
- Owner log `_runlog/closeout-A7-D13.md`: the owner fixed all 5 packetBug blocks in A7 (Q-D13-05, -16, -17, -24, -25). The re-lint shows 4 failing, all rulingBroken.
- Owner patterns: `biotech-knowledge-services-A7/schema/program/packets/D13/03-retrieval-patterns.md` (10ef1ea plus the uncommitted close-out edits).
- Rulings: decision-report R-21, R-44, R-45 and R-66. Final SDL: RegulatoryPathway, EventRole, Publication, RevisionEdgeProperties. Also `vocabularies/frontiers.yaml` `breakthroughCriteria` and `synthesis.regulatoryPathwayMapping`, and `vocabularies/predicates.yaml`.

## Output

`final/patterns-by-question/D13.md`: a header with counts and 4 sections (Q-D13-04, Q-D13-12, Q-D13-14, Q-D13-22). A draft of this file from an earlier attempt in this round was already on disk with its EXPLAIN lines unfilled. I checked it against the owner copy, the rulings, the SDL and the vocabularies, and made these edits:

- **Q-D13-04.** BC-FIRST-APPROVAL keeps 510(k) on a diagnostic frontier (frontiers.yaml), so the `US_DEVICE_510K` exclusion now has `OR $diagnosticFrontier` (`// @param diagnosticFrontier:bool`).
- **Q-D13-14.** R-44 says the publisher is reached "through the Publication". The final Publication has no publisher edge, so the revision-actor row also carries `work.venueName`. The publisher actor is still the asserter of the primary REVISES episode (the one not DERIVED_FROM another).

No question is lost. One part of a question is answered by another route: the PUBLISHER actor in Q-D13-14 (R-44).

## Validator

`final/_work/validate-by-question.mjs` already existed (shared). I reused it unchanged.

```
cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D13 --out <scratchpad>/bq
# D13: {"questions":4,"ok":4,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":4,"statementsExplainOk":4,"staticFindings":0}

node .../validate-by-question.mjs --packets D13 --fill      # after the edits; exit 0
# D13: {"questions":4,"ok":4,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":4,"statementsExplainOk":4,"staticFindings":0}
#   wrote 4 "- EXPLAIN: ok on Neo4j 5.26.31 community (1/1 statement); final-SDL static check clean" lines
#   report final/_work/by-question/D13.json; no plan contains AllNodesScan or CartesianProduct

# negative control: a scratch copy with BREAKTHROUGH_THERAPY, ACCELERATED/CONDITIONAL and PUBLISHER restored (--files <scratchpad>/neg/D13.md --out <scratchpad>/neg/out)
#   Q-D13-04 failing: enumValue `e.designationType` = 'BREAKTHROUGH_THERAPY': not a value of RegulatoryPathway
#   Q-D13-12 failing: 4 enumValue findings (e.approvalPathway and r0.pathway: 'ACCELERATED', 'CONDITIONAL')
#   Q-D13-14 failing: enumValue `inv.role` = 'PUBLISHER': not a value of EventRole
```

Neo4j: bks-neo4j-synth 5.26.31 Community, bolt://localhost:7691. Run without `--ddl`, so the indexes were left untouched.

## Open points (not SDL)

- Q-D13-22 depends on an Assertion → Assertion DERIVED_FROM, which intent contract v1 cannot write (FX-D13-01 (a), OD-09). On the current fixtures the lesne relays are carried in `rationale` only.
- No field on Frontier marks a diagnostic frontier. The caller supplies `$diagnosticFrontier`.
- A Publication has no publisher Organization edge, only `venueName`. The publisher actor therefore comes from the REVISES asserter.

---

<!-- stage: _runlog/closeout-S-patterns-D2.md -->

# Close-out — S final-SDL pattern writer, packet D2

2026-10-09. Worktree `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). No SDL change and no commit.

## Inputs

- `final/_work/pattern-lint.json`, D2 entry: total 39, failing 5. Of those, 3 are packetBug (Q-D2-11, Q-D2-16, and Q-D2-21, which is also ruling-broken under R-52/R-89) and 2 are rulingBroken:
  - Q-D2-10, R-59: `r.direction = 'DECREASES'` is not an EstimateDirection value.
  - Q-D2-18, R-47: reads `r.nNoChangeContexts`, and the R-47 edit-pattern is not applied (it still ranks the AFFECTS_MECHANISM edge).
- Owner log `_runlog/closeout-A3-D2.md`: the owner fixed Q-D2-11, Q-D2-16 and Q-D2-21 in A3, and the re-lint shows 2 failing, both rulingBroken. The owner did not rewrite Q-D2-10 or Q-D2-18.
- Owner patterns: `biotech-knowledge-services-A3/schema/program/packets/D2/03-retrieval-patterns.md` (f4fb477 plus the uncommitted close-out edits), sections Q-D2-10 (line 405) and Q-D2-18 (line 555).
- Rulings: decision-report R-47 and R-59, and `_work/rulings.yaml` lines 179–183. Final SDL: `MechanismProjectionProperties`, `EstimateDirection`, `Association`, `AssociationKind`. `vocabularies/predicates.yaml` lists MEDIATES_TARGET as registered (D2; Mechanism → Target).

## Output

`final/patterns-by-question/D2.md` has 2 sections:

- **Q-D2-10.** Uses `'DECREASED'`, adds AS-OF and status on the mediation Assertion, keeps polarity POSITIVE only, gives the modulator label `ChemicalSubstance|Intervention`, and adds TRACE on `med` and on the projection inputs.
- **Q-D2-18.** Ranks D10 `Association {associationKind: 'EVIDENCE_AGGREGATE'}` with `anchorUid` = the modulator, on `$methodVersion`. Joins the facet edge with `bestBasis = 'DIRECT_MEASUREMENT'`. Counts `nNoChangeContexts` at query time from the `DERIVED_FROM` inputs, and traces through `Association.inputs`.

No question is lost.

## Validator

`final/_work/validate-by-question.mjs` already existed (shared, written by another pattern writer). I reused it unchanged.

```
cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D2
# D2: {"questions":2,"ok":2,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":2,"statementsExplainOk":2,"staticFindings":0}
#   Q-D2-10: ok   Q-D2-18: ok

# negative control: a scratch copy with 'DECREASES' and r.nNoChangeContexts restored, --out <scratchpad>/neg
#   Q-D2-10 failing: enumValue `r.direction` = 'DECREASES': not a value of EstimateDirection
#   Q-D2-18 failing: property `r.nNoChangeContexts`: not a property of [:AFFECTS_MECHANISM] (MechanismProjectionProperties)

node .../validate-by-question.mjs --packets D2 --fill     # exit 0; wrote the two "- EXPLAIN:" lines; report final/_work/by-question/D2.json
```

Neo4j: bks-neo4j-synth 5.26.31 Community, bolt://localhost:7691. Run without `--ddl`, so the indexes were left untouched. No plan contains AllNodesScan or CartesianProduct.

## Open points (not SDL)

- The `Association.methodVersion` string for the Q-D2-18 support score is not named by any ruling. The pattern takes `$methodVersion`. D2 and D10 need to fix it; `bl-assoc/evidence-aggregate@1` (G-1) is a candidate.
- No D2 fixture writes the EVIDENCE_AGGREGATE Associations or the MEDIATES_TARGET Assertion, so both patterns return no rows on the current fixtures.

## Re-verification (second pass, same day)

- `pattern-lint.json` D2 classes re-read: rulingBroken = Q-D2-10 (R-59), Q-D2-18 (R-47). packetBug = Q-D2-11, Q-D2-16, Q-D2-21 (Q-D2-21 also lists R-52/R-89 predicate retirements). In A3, Q-D2-21 now reads HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM and SUPPLIES_MATERIAL. A3 Q-D2-10 and Q-D2-18 are unchanged in the owner file, so the final-SDL versions live only in `patterns-by-question/D2.md`.
- SDL sha256 prefix `c7cf1235dba8`, unchanged.
- Spot-checked these final SDL names by hand:
  - `Association`: anchorUid, score, components, inputCount, inputSetDigest, methodVersion, computedAt, staleAfter, recordedAt/To.
  - `Association.inputs` DERIVED_FROM OUT and `members` ASSOCIATES OUT.
  - `Activity`: runId, activityKind, methodVersion.
  - `Adjudication`: adjudicationKind, verdict, recordedTo.
  - `MechanismProjectionProperties`: no nNoChangeContexts; direction is EstimateDirection.
  - Enums AssertionStatus, Polarity, EstimateDirection, AssociationKind.
  - MEDIATES_TARGET and NO_CHANGE_IN are registered in `vocabularies/predicates.yaml`.
- `node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D2` returned `{"questions":2,"ok":2,"failing":0,"gdsUnvalidated":0,"statements":2,"statementsExplainOk":2,"staticFindings":0}`, exit 0.
- A run with no `--packets` filter (all `patterns-by-question/*.md`: D13, D2, D3, D5, D7 at that time) also passed with 0 failing.

---

<!-- stage: _runlog/closeout-S-patterns-D3.md -->

# Close-out — final-SDL pattern writer S / D3 (FU-04)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S, 31390a6). No SDL change, nothing committed.

## Inputs
- `final/_work/pattern-lint.json` D3: `{"total":33,"failing":6,"packetBugs":5,"rulingBroken":1}`; `alsoRulingBroken` 1 (CQ-EV-05).
- Owner's fixed `biotech-knowledge-services-A4/schema/program/packets/D3/03-retrieval-patterns.md` (working tree over 44b87ff; owner log `_runlog/closeout-A4-D3.md`).

## State found
`final/patterns-by-question/D3.md` and the shared `final/_work/validate-by-question.mjs` already existed (written earlier in this round, 03:05). Re-verified rather than rewritten: rulings, final-SDL names, cited open-question ids, EXPLAIN.

## Commands and key outputs
```
docker ps --filter name=bks-neo4j-synth   -> Up 5 hours
node C:/.../final/_work/lint-packet-patterns.mjs --packets D3 --json <scratchpad>/lint-D3.json --md <scratchpad>/lint-D3.md
  -> selfCheckDiffs 0; non-ok blocks: Conventions TRACE (fragment), CQ-EV-05 rulingBroken (R-42 identifierJoin x2),
     CQ-ST-07 gds-unvalidated, Q-D3-04 rulingBroken (R-44 'RETRACTED' not a SourceRevisionKind value)
     => owner fixed all 5 packetBugs; 2 ruling-broken questions remain for S
grep SDL: RevisionEdgeProperties.revisionKind: SourceRevisionKind!; Publication.revisionStatus: SourceRevisionKind
  (+ revisionStatusMethodVersion); SourceRevisionKind has RETRACTION, WITHDRAWAL; OPERATIONALIZED_BY carries
  AssertedRecordedProperties; Publication.renditions = RENDITION_OF IN (R-43)
grep open-questions.md: FX-10, FU-03, OD-11, FX-01, MD-D10-04 all present
node C:/.../final/_work/validate-by-question.mjs --packets D3 --fill
  -> D3: {"questions":2,"ok":2,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":3,"statementsExplainOk":3,"staticFindings":0}
     exit 0; report final/_work/by-question/D3.json (Neo4j 5.26.31 community, schemaDigest c7cf1235…4793)
```

## Result
- CQ-EV-05 (R-42, R-43, R-44, R-45): Publication↔Source shared-Identifier joins replaced by `(p)<-[ro:RENDITION_OF]-(src:Source)` with ASOF(ro); flag branch returns a full TRACE. Answered in full; depends on writers asserting RENDITION_OF (fixture gap FX-10 / FU-03).
- Q-D3-04 (R-44, R-45): `'RETRACTED'` → `'RETRACTION'`; WITHDRAWAL deliberately not excluded (packet behavior kept); ASOF on OPERATIONALIZED_BY. Answered in full.
- Lost: 0. gds-unvalidated: 0 (CQ-ST-07 not ruling-broken, unchanged).

---

<!-- stage: _runlog/closeout-S-patterns-D5.md -->

# Close-out — S final-SDL pattern writer, packet D5

2026-10-09. Worktree `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). No SDL change and no commit.

## Inputs

- `final/_work/pattern-lint.json` (generated 2026-10-09T06:48:53Z), D5 entry: total 35, ok 23, fragment 7, gds-unvalidated 1 (Q-D5-19), failing 4.
  - packetBug 2: CQ-RC-06 (`(ReportItem)-[:BLOCKED_BY]->(Assertion)`, R-09 pair) and Q-D5-13 (`i.observedAt` on the D7 interest edges). Q-D5-13 is also flagged `alsoRulingBroken`: `PROTOCOL_AUTHORED_BY` was retired by R-80 and replaced with `AUTHORED_BY`.
  - rulingBroken 2: Q-D5-17 (R-80, `PROTOCOL_AUTHORED_BY`) and Q-D5-20 (R-42, the effect→measure join through a shared Identifier).
- Owner patterns: `biotech-knowledge-services-A5/schema/program/packets/D5/03-retrieval-patterns.md` (A5 head 53b6a9f plus the owner's uncommitted close-out edits).
  - The owner fixed both packet bugs: CQ-RC-06 now uses `ReportItem -BLOCKED_BY-> UseConstraint`, and Q-D5-13 now reads `ia.validObservedAt`.
  - The owner left `PROTOCOL_AUTHORED_BY` in Q-D5-13 and Q-D5-17 and the shared-Identifier join in Q-D5-20. These are in packet SDL, so the final-SDL versions are written here.
  - Re-read in this session: sections Q-D5-13 (line 479), Q-D5-17 (line 621) and Q-D5-20 (line 687).
- Rulings:
  - R-80 (decision-report line 1274): D5 renames PROTOCOL_AUTHORED_BY. `predicates.yaml` line 834 marks it `alias-of:AUTHORED_BY`.
  - R-94 / R-52: `questions-catalog.md` line 1187 marks Q-D5-17 "CUT R-94, R-52", with the predicate route OFFERS_INTERVENTION left.
  - R-42 (decision-report line 605, OQ-D5-45).
  - R-70 (decision-report line 1125: "Q-D5-20 (v3) uses the same join").
- Registry checks:
  - `OFFERS_INTERVENTION` and the `OFFER_PRICE_{BUNDLE, COUPON_ADJUSTED, LIST, ONE_TIME, PER_UNIT, SUBSCRIPTION}` predicates are registered (predicates.yaml lines 9883 and 9967–10173).
  - `PriceObservation` appears only in an SDL comment (line 4142, "What is NOT here, on purpose"). It is not a type.

## Output

`final/patterns-by-question/D5.md` has a header with counts and 3 sections:

- **Q-D5-13 (R-80).** Uses `AUTHORED_BY` with subject Protocol or the current ProtocolEdition, and object `Person|Organization`. Reads the episode as-of. TRACE of the interest Assertion is inlined.
- **Q-D5-17 (R-80, R-94/R-52).** Answered by the predicate route `OFFERS_INTERVENTION` (subject `Offer|Organization|Product`). The offerer is the Offer's open SELLER_OF_RECORD seller. Monitoring is read through `AUTHORED_BY`. The price is read from `OFFER_PRICE_*` Assertions on the Offer (`valueNumber`, `unitCode`, `validObservedAt`). TRACE(o) is inlined.
  - Not answered: a price for an offer asserted on an Organization or a Product with no Offer. Those rows return `prices = []`.
- **Q-D5-20 (R-42, R-70).** The shared-Identifier join is replaced by the typed member `Target -OPERATIONALIZED_BY-> Condition` (open episode). The causality framing comes from CAUTIONS Assertions on the same snapshot, and TRACE(ae) is inlined.
  - Narrowed: an effect that relates to the target only through an Outcome, Metric or Biomarker returns no row (OQ-D5-45, closed by R-42 / R-70). The question is not lost.

Counts: 3 questions rewritten (2 rulingBroken plus 1 alsoRulingBroken), 3/3 EXPLAIN ok, 0 GDS, 0 lost.

## Validator

`final/_work/validate-by-question.mjs` already existed (shared). I reused it unchanged.

```
cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
docker ps --filter name=bks-neo4j-synth   # Up 5 hours
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D5 --fill
# D5: {"questions":3,"ok":3,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":3,"statementsExplainOk":3,"staticFindings":0}
#   Q-D5-13: ok   Q-D5-17: ok   Q-D5-20: ok          exit 0; report final/_work/by-question/D5.json

# negative control: a scratchpad copy with PROTOCOL_AUTHORED_BY, (pr:PriceObservation) and the shared-Identifier join restored
node .../validate-by-question.mjs --files <scratchpad>/negD5/D5.md --out <scratchpad>/negD5/out
#   Q-D5-13 failing: predicate 'PROTOCOL_AUTHORED_BY' has status alias-of:AUTHORED_BY
#   Q-D5-17 failing: :PriceObservation is not a node type or interface of the final SDL
#   Q-D5-20 failing: identifierJoin: 2 holders joined through one Identifier (id); R-42
#   exit 1
```

Neo4j: bks-neo4j-synth 5.26.31 Community, bolt://localhost:7691. Run without `--ddl`, so the indexes were left untouched.

## Open points (not SDL; open-questions.md not edited)

- The fixtures do not write `OFFERS_INTERVENTION`, `OFFER_PRICE_*` on an offered intervention, or a curated `Target -OPERATIONALIZED_BY-> Condition` for an adverse-effect pair. As a result, Q-D5-17 and Q-D5-20 return no rows on the current fixtures.
  - The R-70 / R-06 fixture request (ASPREE hemorrhage or dementia → a target) is still open with D5.
- Q-D5-17 has no price for offers asserted on an Organization or a Product without an Offer node. That is a D6 modeling choice, not a schema defect.

---

<!-- stage: _runlog/closeout-S-patterns-D6.md -->

# Close-out: final-SDL pattern writer (S) — D6

2026-10-09. Worktree C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S (ft/schema-S). Writes: `final/patterns-by-question/D6.md`, `final/_work/by-question/D6.json` (validator report), this log. No SDL change, no commit.

Inputs:
- `final/_work/pattern-lint.json` perPacket D6: total 41, ok 29, fragment 4, packetBugs 3, rulingBroken 5, alsoRulingBroken 1, failing 8. RulingBroken blocks: CQ-PF-01 (L153), CQ-AX-25 (L173), Q-D6-08 (L466), Q-D6-10 (L505), Q-D6-11 (L524); alsoRulingBroken: Q-D6-01 (L61, packetBug L67 + R-30).
- Owner copy `biotech-knowledge-services-A6/schema/program/packets/D6/03-retrieval-patterns.md` after the A6 close-out (`_runlog/closeout-A6-D6.md`: packetBugs fixed; owner re-lint 0 packetBug, 6 rulingBroken = the six above).
- Rulings: R-30 (ComponentLineProperties `declaredNameVerbatim`, `formVerbatim`, `statementVerbatim` → line Assertion qualifiers `declaredName:` / `form:` / `statement:` and locator exact), R-62 (PREPARED_WITH retired → D12 HAS_RECIPE_INGREDIENT, subject FoodItem | Product, object FoodItem; `predicates.yaml` status alias-of).
- Final SDL checks done by hand: ComponentLineProperties fields (SDL line 4173); `Assertion.qualifiers: [String!]`; HAS_SUBJECT admits Product, ProductVariant, Package, FoodItem, LabelVersion; HAS_REFERENCE_FOOD Product → FoodItem; DECLARES_COMPONENT LabelVersion → Constituent | FoodItem | IngredientMaterial.

Commands:
- `docker ps --filter name=bks-neo4j-synth` → Up.
- `node C:/…/final/_work/validate-by-question.mjs --packets D6` (shared validator, reused unchanged)
  → D6: questions 6, ok 6, failing 0, statements 7, EXPLAIN ok 7, static findings 0; CQ-AX-25 planned a CartesianProduct (packet shape: unanchored DECLARES_COMPONENT scan joined to C).
- CQ-AX-25 rewritten as a scoped UNION anchored on C (`CALL (sub) { … UNION … UNION … }`), then
  `node C:/…/final/_work/validate-by-question.mjs --packets D6 --fill`
  → D6: {"questions":6,"ok":6,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":7,"statementsExplainOk":7,"staticFindings":0}; Neo4j 5.26.31 community; IR digest sha256:c7cf1235…4793; no AllNodesScan / CartesianProduct; Q-D6-08 DirectedRelationshipTypeScan (served by the planned DECLARES_COMPONENT(lineRole) relationship index).

Result: 6 questions rewritten (Q-D6-01, CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-10, Q-D6-11), 7 statements EXPLAIN ok, 0 gds-unvalidated, 0 lost; Q-D6-11 preparation notes reanswered through HAS_RECIPE_INGREDIENT (R-62).

Issues for the coordinator (not edited here; FU-03 fixture work):
- D6 fixtures still write the R-30 edge fields on DECLARES_COMPONENT (already in `fixtures/README.md` residual table). The rewritten patterns return the located span beside the qualifier so pre-edit data still answers.
- `fixtures/D6/prepared-food-bigmac-mcdonalds` d03 was renamed PREPARED_WITH → HAS_RECIPE_INGREDIENT but keeps the LabelVersion as subject and the text in `valueString`; the registry admits Product | FoodItem subjects. This structural edit is not in the README residual table (only the rename is listed). Until it is applied, Q-D6-11 does not find d03.
- No qualifier-prefix registry in `final/vocabularies/` for `declaredName:` / `form:` / `statement:` (R-30 names them; K 11-OQ 22 "verbatim-base prefix" check is S's).

---

<!-- stage: _runlog/closeout-S-patterns-D7.md -->

# Close-out: S final-SDL pattern writer, packet D7

2026-10-09. Worktree `biotech-knowledge-services-S` (branch ft/schema-S, base 31390a6). No SDL change, no commit.

## Inputs

- `final/_work/pattern-lint.json`, D7 entry: total 34, ok 24, failing 8, packetBug 1, rulingBroken 7, gds-unvalidated 2.
  - packetBug: Q-D7-04 (EXPLAIN type mismatch on `inv`). The owner fixed it in A6. It is an uncommitted edit at lines 310–311 and is the only diff in `packets/D7/03-retrieval-patterns.md`.
  - rulingBroken (7):
    - CQ-CL-05 L23 and Q-D7-06 L354: R-19 pendingEdit. T was not read from the OCCURS_IN MediaWork's `publishedAt`.
    - CQ-EC-04 L166, Q-D7-22 L698 and Q-D7-25 L764: R-80. The pattern uses AUTHORED, which is retired. It becomes AUTHORED_BY.
    - Q-D7-02 L263 and Q-D7-08 L411: R-30. `r.roleTitleVerbatim` is not on RoleEdgeProperties.
  - gds-unvalidated: Q-D7-03 and Q-D7-23 are discovery variants. They are not ruling-broken and are left as they are.
- Owner patterns: `biotech-knowledge-services-A6/schema/program/packets/D7/03-retrieval-patterns.md` (HEAD 2ca247a plus the Q-D7-04 fix). The lint line numbers still match the file (checked with `sed -n` on lines 166, 263, 411, 698 and 764).
- Final SDL: `final/schema/final_biotech_schema_v2.graphql`, sha256 c7cf1235dba876b2…4793. Checked by hand:
  - MediaWork has `publishedAt` and `publishedAtPrecision`. It also has `occurrences` (OCCURS_IN, IN) and `renditions` (RENDITION_OF, IN).
  - Assertion has `qualifiers`, `validObservedAt`, `polarity`, `speechAct` and `assertionKind`.
  - Assessment has `verdict`, `rationale`, `conclusionCode`, `facets`, `assessmentSubkind` and `recordedTo`.
  - Identifier has `scheme` and `value`.
  - `roleTitleVerbatim` is removed (SDL comments at lines 4648 and 6947).
- Predicate registry `final/vocabularies/predicates.yaml`:
  - AUTHORED_BY (D3): subject Publication, Protocol or ProtocolEdition; object Person or Organization.
  - AUTHORED is `alias-of:AUTHORED_BY`, kind retired.
  - DISCLOSES_INTEREST (D9): subject MediaWork, Organization, Person or Publication; object Organization.
  - FUNDED_BY (D3): Publication → Organization.
  - INVENTOR_ON_PATENT_ASSIGNED_TO (D7): Person → Organization.
  - NOMINATES_DIRECTOR (D7): Organization → Person.
- Rulings: `_work/rulings.yaml` lines 68, 71, 73, 134 and 207–209 (R-19, R-80 and R-82), and line 3598 for R-30 `roleText:`. Also decision-report R-19, R-30, R-80 and R-82.

## Output

`final/patterns-by-question/D7.md` has a header with counts and a per-question table, then 7 sections:

- CQ-CL-05 (R-19, plus R-82)
- CQ-EC-04 (R-80, plus R-82)
- Q-D7-02 (R-30)
- Q-D7-06 (R-19, plus R-82)
- Q-D7-08 (R-30)
- Q-D7-22 (R-80)
- Q-D7-25 (R-80)

All 7 are rewritten. None is answered through another path, and none is lost. The kernel TRACE chain is kept in every section.

The file was already present at the start of this pass (03:06, written by an earlier pass in this role). This pass reviewed it against the lint, the owner file, the SDL and the predicate registry, made no content edits, and re-ran the validator with `--fill`.

## Validator

I reused the shared `final/_work/validate-by-question.mjs` without changing it.

```
cd C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D7 --fill
# D7: {"questions":7,"ok":7,"failing":0,"gdsUnvalidated":0,"fragment":0,"statements":7,"statementsExplainOk":7,"staticFindings":0}
# every statement: EXPLAIN ok (Neo4j 5.26.31 community, bks-neo4j-synth, bolt://localhost:7691)

node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --out <scratchpad>/bq-all   # all files, no fill
# D13 4/4 ok, D2 2/2 ok, D3 2/2 ok (3 statements), D5 3/3 ok, D7 7/7 ok; 0 static findings
```

The report is at `final/_work/by-question/D7.json`.

## Open items (reported, not acted on)

- The D7 Attia fixture names a "D9 container" in a comment but writes no MediaWork, OCCURS_IN or RENDITION_OF. On that fixture, Q-D7-06 and CQ-CL-05 take the snapshot fallback (`tBasis = SNAPSHOT_FALLBACK`). This is a pending fixture edit. It is not in the FU-03 table in `fixtures/README.md`, so it goes to the coordinator or the fixture editor.
- The validator checks that each predicate is registered. It does not check the subject/object slot order. AUTHORED_BY (Publication subject, Person object) was checked by hand.

---

<!-- stage: _runlog/closeout-S-patterns-D8.md -->

# Close-out — FINAL-SDL PATTERN WRITER (S) for D8 — 2026-10-09

Scope: FU-04 follow-through for packet D8. No SDL edit, no commit.

## Inputs read
- `final/_work/pattern-lint.json` D8: total 35, failing 8 (packetBug 2, rulingBroken 6). rulingBroken: CQ-MF-01 (R-68, L333), Q-D8-10 (R-68, L350), Q-D8-13 (R-68, L399), Q-D8-18 (R-73, L483), Q-D8-19 (R-73, L512), Q-D8-23 (R-72 + R-94, L620, incl. pendingEdit R-72).
- Owner copy `biotech-knowledge-services-A7/schema/program/packets/D8/03-retrieval-patterns.md` (head 10ef1ea + owner's uncommitted close-out edits: Q-D8-03 off CYPHER 25, CQ-EC-01 AS_OF/KNOWN_AT, TRACE adj.verdict; the six ruling-broken blocks left as packet record).
- decision-report R-68, R-72, R-73, R-94; `final/vocabularies/predicates.yaml` (SUPPLIES_MATERIAL qualifiers buyer/exclusivity; MANUFACTURER_UNNAMED literal on Organization; CONTRACT_MANUFACTURES_FOR Org→Org qualifier product; MEASURED_CONTENT_IN_PRODUCT / CONTAINS_UNDECLARED_SUBSTANCE subject Product|ProductVariant, object ChemicalSubstance); final SDL (QualityResult.resultFor: [Lot]; LotOfTarget = Product | ProductVariant; DELIVERS stored Product → Device; RegulatoryRecordTopic / LegalStatusSubject without Device; CertificationCoverageTarget = Product | ProductVariant | Lot); fixtures D7/niagen-ownership-brand-history n-19/n-20 (qualifier spelling `exclusivity=SOLE`, `buyer=<uid>`), D4/noninvasive-glucose-cgm-recall (recall → Product, DELIVERS c04).

## Written
- `final/patterns-by-question/D8.md` — header + counts, 6 sections (## CQ-MF-01, Q-D8-10, Q-D8-13, Q-D8-18, Q-D8-19, Q-D8-23), TRACE inlined as `CALL (…) {…}` or carried as assertionUid per row.
- Reused shared validator `final/_work/validate-by-question.mjs` (unchanged).

## Commands and key outputs
- `docker ps --filter name=bks-neo4j-synth` → Up; `CALL dbms.components()` → Neo4j Kernel 5.26.31 community.
- `node C:/…/S/schema/program/final/_work/validate-by-question.mjs --packets D8 --out <scratch>/bq` → D8: questions 6, ok 6, failing 0, statements 6, EXPLAIN ok 6, staticFindings 0.
- Plan check: Q-D8-23 plan had DirectedRelationshipTypeScan (LOT_OF with `lt = p OR lt IN variants`); rewritten to UNWIND lot targets → no scans.
- Negative test: `validate-by-question.mjs --files <scratch>/neg/D8.md --no-db` with SUPPLIES_INGREDIENT, QUALITY_RESULT_FOR→Product and reversed DELIVERS → 4 failing (alias-of predicate, 3 pair findings). Validator catches the ruling breaks.
- `node C:/…/S/schema/program/final/_work/validate-by-question.mjs --packets D8 --fill` → exit 0; 6/6 ok; report `final/_work/by-question/D8.json`; no AllNodesScan / CartesianProduct / label or type scan in any plan.

## Results
- Rewritten 6; answered through another path 3 (Q-D8-18, Q-D8-19 via Lot + D1 survey predicates, R-73; Q-D8-23 via Product -DELIVERS-> Device, R-72); lost 0; EXPLAIN ok 6/6; gds-unvalidated 0.
- Applied alongside (not flagged by lint because X was unlabeled): R-73 patent leg of Q-D8-10 / Q-D8-13 through IngredientMaterial -REALIZES_SUBSTANCE-> ChemicalSubstance <-CONCERNS- Patent.
- No SDL change needed; nothing added to open-questions.md.

---

<!-- stage: _runlog/closeout-S-patterns-D9.md -->

# Close-out — S final-SDL pattern writer, packet D9 (FU-04)

Date: 2026-10-09. Worktree: C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S (ft/schema-S @ 31390a6, uncommitted). SDL unchanged (sha256 c7cf1235…4793). Nothing committed.

## Inputs

- `final/_work/pattern-lint.json`, packet D9: total 40, failing 30, packetBug 5, rulingBroken 25 (the 5 packetBug blocks are also rulingBroken). Every failing block carries finding `label ClaimOccurrence is not declared [F-05]`; Q-D9-13 also `identifierJoin [R-42]`.
- Owner copy: `biotech-knowledge-services-A8/schema/program/packets/D9/03-retrieval-patterns.md` (ft/schema-A8 @ 5b9788a + uncommitted close-out edits, `_runlog/closeout-A8-D9.md`: `CYPHER 25` removed, vector `WITH [...]` dropped, Q-D9-20 `SEARCH` → `db.index.vector.queryNodes`). Owner re-lint: 30 failing, 0 packetBug, 30 rulingBroken.
- Rulings read: F-05, R-12, R-19, R-20, R-21, R-42, R-43, R-49 (+ F-01 / FU-11), R-54, R-55, R-65, R-79..R-84, R-88, R-91, R-94; final IR, `vocabularies/predicates.yaml`, `vocabularies/claim-lifecycle.yaml`, query-patterns P-09 / D-2..D-4, fixtures `final/fixtures/D9/*` (claim occurrences are `class: claim-occurrence`; longecity writes `sourceKind:COMMUNITY`).

## Output

`final/patterns-by-question/D9.md`: 29 sections (28 questions + `D9-DDL` for the Conventions index block), 30 rewritten blocks, file-level macros TRACE / OVERLAP / DISCLOSURES (`cypher-macros` fence of the shared validator contract).

Rulings applied: F-05 (all 30 blocks: `ClaimOccurrence` → `Assertion {assertionKind: 'CLAIM'}`; indexes → `assertion_proposition` / `assertion_speech_act`); R-42 → R-43 (Q-D9-13: RENDITION_OF Source → Publication instead of a shared Identifier); R-88 (Q-D9-21 unblocked: Rx from ProductKind PRESCRIPTION_DRUG or LegalStatus PRESCRIPTION_ONLY STATUS_OF); R-12 (Q-D9-22 via the EVIDENCE_MISSION Activity); R-49 (CQ-CL-06, Q-D9-08, Q-D9-19 stored forms → projection-cache properties; per-frontier score FU-11); R-19 / R-82 / R-55 (CQ-CL-05, Q-D9-02: T, OVERLAP, DISCLOSES_INTEREST); R-20 / R-21 (CQ-CL-03/04, CQ-PV-04/05, Q-D9-04/05/09/10); R-83 (RECOMMENDS_USE); R-84 (Q-D9-11); R-65 / R-81 / R-91 (Q-D9-18/19). Questions lost: 0.

## Commands and key outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D9 --no-db --out <scratchpad>/bq
  → D9: questions 29, failing 0, staticFindings 0
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/validate-by-question.mjs --packets D9 --out <scratchpad>/bq
  → D9: {"questions":29,"ok":28,"failing":0,"gdsUnvalidated":1,"statements":38,"statementsExplainOk":36,"staticFindings":0}
  → only plan flag: CartesianProduct in Q-D9-19#projection (single Frontier row); no AllNodesScan
docker exec bks-neo4j-synth cypher-shell … "WITH {… validToPrecision: null} AS EP … datetime.truncate(toLower(EP.validToPrecision), EP.validTo) …"
  → "Invalid call signature for Truncate: Provided input was [NO_VALUE, NO_VALUE, NO_VALUE]"  (AND does not short-circuit)
  → fix: OVERLAP macro guards each truncate with CASE; re-test returns TRUE/FALSE without error
node <scratchpad>/smoke/smoke.mjs   (runtime smoke: 15-node synthetic graph in one transaction, every non-DDL non-GDS statement executed, tx rolled back)
  → 0 runtime errors; CQ-CL-05: interests[].temporalOverlap UNKNOWN (YEAR bound in T's year), operators OVERLAPS, sponsors OVERLAPS,
    disclosures[].timing DISCLOSED_IN_CONTAINER; Q-D9-02 same; 15 statements returned rows, the rest 0 rows (no data for their shape)
node …/validate-by-question.mjs --packets D9 --fill
  → same counts; status lines written; report final/_work/by-question/D9.json; exit 0
node …/validate-by-question.mjs --out <scratchpad>/bq-all   (all patterns-by-question files, report to scratch so other writers' JSON is untouched)
  → D1 4/4, D10 3/3, D13 4/4, D2 2/2, D3 2/2, D5 3/3, D6 6/6, D7 7/7, D8 6/6, D9 28 ok + 1 gds-unvalidated; exit 0
```

The shared validator `final/_work/validate-by-question.mjs` existed and was reused unchanged.

## Open-questions edit

Added `MD-D9-03` (section 5): D9 indexes missing from the final DDL (FU-07 input), D9 assessment subkinds waiting on R-54's assessment-vocabularies file, Q-D9-19 prose vs Cypher weighting, Q-D9-02 hop bound vs P-09. No SDL change proposed.

## Files written

- `final/patterns-by-question/D9.md` (new)
- `final/_work/by-question/D9.json` (validator report)
- `final/open-questions.md` (MD-D9-03 row)
- this log

---

<!-- stage: _runlog/closeout-fixtures-D1.md -->

# Close-out — fixture editor (S) for final/fixtures/D1 (FU-03), 2026-10-09

Scope: `final/fixtures/D1/<folder>/` only (5 fixtures). No SDL change, no source.md / locators.yaml / snapshot digest /
sourced-value change. Nothing committed (the coordinator commits).

## Inputs read
- FU-03 table rows `D1/*` in `final/fixtures/README.md` (R-30 on 4 fixtures; R-68 nr-salt; R-85 vitamin-b6; nr-trial prose only).
- `final/_work/rulings.yaml` `modules.D1`: no `edit-fixture` op (register / question / seam edits only).
- `final/vocabularies/predicates.yaml`: entries whose `fixtureEdit` names D1 fixtures: EXCEEDS_DOSE_THRESHOLD (R-85, report-only);
  SUPPLIES_MATERIAL qualifiers (R-68). No alias / retired predicate is used by D1 fixtures (lint before: 0 predicate-alias, 0 predicate-retired).
- decision-report R-15, R-30, R-42, R-43, R-68, R-85.

## Lint before (`node C:/.../final/_work/lint-fixtures.mjs --fixture D1/<folder>`)
| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| ashwagandha-plant-part-harm | 4 | 0 | edge-property 2, retired-name 2 (R-30) |
| lgg-strain-resolution | 8 | 4 | edge-property 4, retired-name 4 (R-30); predicate-proposed 4 |
| nr-salt-moiety-us-canada | 14 | 8 | edge-property 8, retired-name 6 (R-30); predicate-proposed 8 |
| nr-trial-unstructured | 0 | 0 | — |
| vitamin-b6-threshold-harm | 22 | 8 | edge-property 10, retired-name 8 (R-30); predicate-report-only 4 (R-85); predicate-proposed 8 |
| **D1** | **48** | **20** | |

## Edits
1. **R-30** (scratchpad `d1-r30.mjs`): 12 DECLARES_COMPONENT verbatim edge fields moved in assertions.yaml (w08; g08, g10; a10, a12;
   b11, b12, b14) to a `qualifiers: ["declaredName:<text>", "form:<text>"]` line on the same (authorizing) Assertion, and the
   same 12 removed from intent `edgeProperties`. Intent v1 `edge.assert.assertion` has no `qualifiers` field
   (additionalProperties false), so each proposal's `rationale` is prefixed `qualifiers: declaredName:…; form:…` (precedent:
   cross-domain intent-r2 `roleText:`); intent `notes` record the gap. nr-salt `"amount": 263.0` kept as written.
2. **R-68** nr-salt p02 SUPPLIES_MATERIAL: qualifier "single supplier" → `exclusivity=SOLE` plus `buyer=org-niagen-bio`
   (the 10-K filer, "We rely on a single supplier, W.R. Grace, for NRC", l-10k-single-supplier); note updated. p02 stays out
   of the intent (object-bearing predicate-only; unchanged v1 gap).
3. **R-85** vitamin-b6: c10a–c10d removed from `assertions` (no stored EXCEEDS_DOSE_THRESHOLD Assertion); added `reports:`
   rpt-b6-threshold-screen (K.Report, reportKind COMPARISON, status PROPOSED, ASSESSES con-b6, DERIVED_FROM c08, c09, d01, d02,
   s01) with `items:` (HAS_ITEM) c10a–c10d as ROW items (same ids, since source.md names them; predicate EXCEEDS_DOSE_THRESHOLD,
   valueBoolean, cellValues, ASSESSES the label version + con-b6, DERIVED_FROM their own daily amount and threshold, body
   offsets). New file `composed-body-b6-threshold-screen.txt` (BellLabs-composed body, 1,164 code points),
   bodyDigest sha256:7ff64a042018db335b107ff5b799c02c96fd23967a937d88d10d10a70df56f8c (re-verified; row offsets re-sliced).
   Activity act-report (ANSWER) added. questions.md Q-D1-03 "answered through" now: retrieved over c06/c08/c09/d01/d02 at query
   time + the published Report rows. intent notes: c10a–d dropped from the CALCULATED list, Report noted as not expressible in v1.
   Items nest under the Report: the lint flags a top-level `reportItems:` array's `predicate` as stored (its report detection
   reads the parent key only for objects, not array elements) — recorded here, lint not changed.
4. **R-15 / R-42 / R-43** nr-trial (not listed in the table's pending column, but the ruling covers it: person-conze "stands for
   the author group"): t01–t06 asserter → D3 Publication pub-sr2019 (title from source.md; publicationKind ARTICLE, venueName
   Sci Rep); PMID / PMCID / DOI moved from the K Source to the Publication (one identifier, one Subjectable); person-conze node
   dropped (no author-level statement); t00 RENDITION_OF src-sr2019 → pub-sr2019 (AssertedRecordedProperties, asserter K Agent
   agent-ingest, evidence l-epmc-ids) in assertions.yaml and as an intent `edge.assert`. Gives FX-10 one more
   Source → Publication RENDITION_OF fixture row.

## Checks
- Intent v1 (zod `IngestionIntent` + JSON Schema biotech-knowledge-intent.v1, Ajv 2020 + ajv-formats; scratchpad `val-d1.mjs`,
  same method as `_work/validate-intents.mjs` without rewriting the shared `intent-validation.json`): 5/5 valid both ways.
- `git status`: only assertions.yaml, intent.json, vitamin-b6 questions.md, the new body file, and the 5 D1 rows of
  fixtures/README.md changed; source.md / locators.yaml untouched.

## Lint after
| fixture | errors | warnings (all predicate-proposed, registrar-gated) |
| --- | --- | --- |
| ashwagandha-plant-part-harm | 0 | 0 |
| lgg-strain-resolution | 0 | 4 DECLARED_VIABLE_COUNT (D6) |
| nr-salt-moiety-us-canada | 0 | 8 MOLECULAR_WEIGHT ×4, MOLECULAR_FORMULA ×2 (D1), MAX_DAILY_SERVINGS ×2 (D6) |
| nr-trial-unstructured | 0 | 0 |
| vitamin-b6-threshold-harm | 0 | 8 MOLECULAR_WEIGHT ×4 (D1), MAX_DAILY_SERVINGS ×4 (D6) |
| **D1** | **0** (from 48) | **20** (unchanged; owner/registrar-gated) |

## Not changed / for others
- README Index rows (relationships exercised) for D1 not regenerated: nr-trial now also exercises RENDITION_OF; vitamin-b6
  HAS_ITEM / ASSESSES / DERIVED_FROM from a Report.
- source.md of vitamin-b6 still says "threshold screens c10a–c10d (one CALCULATED Assertion per label × threshold)"; source.md
  is frozen, the assertions.yaml header and questions.md carry the R-85 reading.
- `_work/fixture-lint-baseline.json` not rewritten (shared; coordinator re-runs `--baseline`).

---

<!-- stage: _runlog/closeout-fixtures-D8.md -->

# Close-out: fixture editor (S), final/fixtures/D8 — FU-03 (2026-10-09)

Scope: `final/fixtures/D8/<folder>/` only (6 fixtures). SDL unchanged (candidate sha256 c7cf1235…4793). Nothing committed
(the coordinator commits). source.md, locators.yaml and snapshot digests untouched (sha256 of all 6 source.md + 6
locators.yaml checked before/after: identical). Research only, not medical advice.

## What applies to D8

| source | D8 items |
| --- | --- |
| FU-03 table (fixtures/README.md) | eurofins-coa-quantity-by-input: R-16; nmn-us-exclusion-reversal: R-23 supersedesUid residual (assertions.yaml 592, intent-step2.json 651, questions.md 8) |
| `_work/rulings.yaml` D8 `edit-fixture` ops | R-16 only ("COA assertions asserted by the issuing lab, not the executor agent") |
| `vocabularies/predicates.yaml` re-keys (alias-of / retired-by) | none used by D8 fixtures (lint: 0 predicate-alias, 0 predicate-retired) |
| other typical rulings (R-30, R-44, R-09/R-27, R-15, R-43/R-26, R-47, R-49, R-55, R-58, F-05) | grep of D8 fixtures: no occurrence (the `*Verbatim` keys in D8 are D8 node properties the candidate declares, not R-30 edge fields) |

## Baseline

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D8/<folder>   (×6)
certification-listing-lot-scope 0/0; eu-nrcl-authorisation-data-protection 0/0; eurofins-coa-quantity-by-input 0/0;
imu-tek-warning-letter-recall 0 errors / 2 warn (predicate-proposed CLAIMS_THERAPEUTIC_EFFECT, assertions.yaml 466 + intent.json i12);
nmn-us-exclusion-reversal 0 errors / 2 warn (retired-name supersedesUid, assertions.yaml 592, intent-step2.json 651);
us8197807-claims-held-invalid 0/0.   Total: 0 errors, 4 warnings.
```

## Edits

1. **R-16, eurofins-coa-quantity-by-input** (scratch script `edit-eurofins.mjs`, textual, count-checked):
   - assertions.yaml c08–c15 (contrast COA lot 2404101ORA: QUALITY_RESULT_FOR ×3, MEASURES_ANALYTE ×3, LOT_OF, LOT_EXPIRY_AS_PRINTED):
     asserter `agent-a7` (Agent) → `elite` (D7.Organization, Elite Source Products, Inc.). R-16 rule 1 lists "Manufactured for"
     as a presented issuer; the COA prints "Manufactured for: Elite Source Products, Inc." (loc-as-mfr). The free-text qualifier
     ("'Manufactured for' names the brand owner, which is not the issuer") is replaced by a note citing R-16 rule 1. No
     `asserterBasis` qualifier (rule 1 needs none; PUBLISHER_DEFAULT / INFERRED do not apply).
   - No ISSUED_BY row added: the COA names no laboratory and no signatory, and "Manufactured for" does not say who issued the
     result (not invented).
   - intent.json: 8 `asserterRef` agent-a7 → elite, 8 rationales reworded, new subject `elite` (Organization, use_existing),
     `notes` updated. Eurofins rows c01–c07 were already asserted by Eurofins. The two D8.coa-classification QUALITY
     assessments stay with the agent (BellLabs curation, R-16 rule 3).
   - Stale prose left as is: source.md says the contrast rows "are asserted by the executor agent with a qualifier" (source.md
     is frozen this round).
2. **R-23, nmn-us-exclusion-reversal**: checked — n14 supersedes n04; both asserted by FDA (`ref: fda`), so the same-asserter
   rule holds and the supersession stays. assertions.yaml n14 note and intent-step2.json n14 rationale reworded to state the
   same-asserter check (the structured `supersedes: n04` key is unchanged); intent v1 cannot carry the link (OD-09).
   questions.md Q-D8-01 keeps "n14 names it in supersedesUid" (correct kernel field use; not linted).
3. Other agent-asserted rows checked under R-16 rule 3 and kept: eu-nrcl e08 (ENTRY_INTO_FORCE_COMPUTED, CALCULATED) and
   nmn n09 (CITED_TRIAL_ID_AS_PARSED, the research-stage parser reading, expected REJECTED).

## After

```
lint-fixtures.mjs --fixture D8/<folder> (×6): 0 errors; warnings 2, all imu-tek predicate-proposed CLAIMS_THERAPEUTIC_EFFECT
node <scratchpad>/validate-d8.mjs   (zod IngestionIntent + Ajv 2020-12 over biotech-knowledge-intent.v1.json, as validate-intents.mjs,
                                     without overwriting _work/intent-validation.json)
  7/7 D8 intent files: zod ok, jsonSchema ok (eurofins intent.json: 22 proposals, 17 subjects)
```

Lint: 0 errors / 4 warnings → 0 errors / 2 warnings. Remaining (owner-gated): MD-X-03(a) — i12 `CLAIMS_THERAPEUTIC_EFFECT`
is proposed-new (registrar D6); the registry candidate (IMPROVES_TARGET / INTENDED_FOR_TARGET, claimClass DISEASE_CLAIM,
R-83) needs a Target object the quoted claim does not name, so it is not re-keyed here. Also noted, no lint hit:
MD-X-03(c) D8 ORGANIZATION_RENAMED vs D7 FORMER_NAME (us8197807 a-row at assertions.yaml 556).

## README

`fixtures/README.md` FU-03 table: rows D8/eurofins-coa-quantity-by-input and D8/nmn-us-exclusion-reversal → applied; row
D8/imu-tek-warning-letter-recall added with the owner-gated MD-X-03(a) item. No other rows touched.

---

<!-- stage: _runlog/closeout-fixtures2-D1.md -->

# Close-out (second attempt) — fixture editor (S) for final/fixtures/D1 (FU-03), 2026-10-09

Scope: `final/fixtures/D1/<folder>/` (5 fixtures) and the 5 D1 rows of the FU-03 table in `final/fixtures/README.md`.
No SDL change; no source.md / locators.yaml / snapshot digest / sourced value changed. Nothing committed.
Guide used: the lost first attempt's log `_runlog/closeout-fixtures-D1.md` (same decisions re-applied and re-verified;
the R-85 Report was re-composed so that each ROW ASSESSES exactly one entity, per the ReportItem row rule).
Not run: `_work/repath-fixtures.mjs` (read as text only, by lint-fixtures.mjs itself); `_work/validate-intents.mjs`
(it rewrites the shared `intent-validation.json`; a scratchpad copy restricted to D1 was used instead).

## Inputs
- FU-03 rows D1/*: R-30 (ashwagandha, lgg, nr-salt, vitamin-b6), R-68 (nr-salt), R-85 (vitamin-b6); nr-trial prose only.
- `_work/rulings.yaml` `modules.D1`: no `edit-fixture` op. R-68 rename MANUFACTURES_MATERIAL → MANUFACTURES: no D1 fixture uses it.
- `vocabularies/predicates.yaml`: EXCEEDS_DOSE_THRESHOLD `storage: report-only`, fixtureEdit = vitamin-b6 c10a–d → Report;
  SUPPLIES_MATERIAL qualifiers `buyer`, `exclusivity`. No alias / retired predicate in D1 fixtures.
- decision-report R-15, R-26, R-30, R-42, R-43, R-68, R-85.

## Lint before — `node C:/.../final/_work/lint-fixtures.mjs --fixture D1/<folder>` (report mode)
| fixture | errors | warnings |
| --- | --- | --- |
| ashwagandha-plant-part-harm | 4 (edge-property 2, retired-name 2) | 0 |
| lgg-strain-resolution | 8 (edge-property 4, retired-name 4) | 4 |
| nr-salt-moiety-us-canada | 14 (edge-property 8, retired-name 6) | 8 |
| nr-trial-unstructured | 0 | 0 |
| vitamin-b6-threshold-harm | 22 (edge-property 10, retired-name 8, predicate-report-only 4) | 8 |
| **D1** | **48** | **20** |

## Edits
1. R-30 (scratchpad `d1-r30.mjs`, writes only under fixtures/D1): 12 verbatim fields on 8 DECLARES_COMPONENT line Assertions
   (w08; g08, g10; a10, a12; b11, b12, b14) moved from `edge.properties` to `qualifiers: ["declaredName:…", "form:…"]` on
   the same Assertion; same 12 removed from intent `edgeProperties`; each proposal's `rationale` now starts
   `qualifiers: declaredName:…; form:… |` (intent v1 edge.assert.assertion has no qualifiers field — gap noted in intent
   `notes`). nr-salt `"amount": 263.0` kept as written.
2. R-68 nr-salt p02 SUPPLIES_MATERIAL: `"single supplier"` → `exclusivity=SOLE`, `buyer=org-niagen-bio` (the 10-K filer:
   "We rely on a single supplier, W.R. Grace, for NRC", l-10k-single-supplier); note updated. p02 stays out of the intent
   (object-bearing predicate-only; unchanged v1 gap).
3. R-85 vitamin-b6: c10a–c10d removed from `assertions`; new `reports:` rpt-b6-threshold-screen (K.Report, COMPARISON,
   PROPOSED, policy:bl-publish@fixture, policyOutcome REVIEW, publishedAt null; ASSESSES con-b6 + both label versions;
   DERIVED_FROM c08, c09, d01, d02; generatedBy new Activity act-report ANSWER) with `items:` (HAS_ITEM) sec:scope,
   sec:threshold-screen (HARMS_AND_AVOIDANCE) and 4 ROW items with the ids c10a–c10d (source.md names them), each ASSESSES its
   one label version, cites its own daily amount + threshold, cellValues carry `EXCEEDS_DOSE_THRESHOLD=<bool>`, a
   non-property `screen:` keeps predicate/rule/value. Body file `composed-body-b6-threshold-screen.txt` (1,116 code points,
   LF, ASCII; sha256:7012659d1ec792b96e97408896a9301a04678350c33006e11c6978d7d74ba88d; section/row offsets computed from the
   file). Header comment, questions.md Q-D1-03 "answered through", intent notes updated.
4. R-15 / R-42 / R-43 nr-trial (ruling-wide; the first attempt applied it too): t01–t06 asserter person-conze → D3
   Publication pub-sr2019 (title, venue "Sci Rep", citationText from source.md; publicationKind ARTICLE); PMID/PMCID/DOI moved
   from the Source to the Publication; person-conze node dropped (no author-level statement); t00 RENDITION_OF src-sr2019 →
   pub-sr2019 (AssertedRecordedProperties, asserter K Agent agent-ingest, evidence l-epmc-ids) in assertions.yaml and as an
   intent `edge.assert`.

## Checks
- Intent v1 (scratchpad `val-d1.mjs`: zod `IngestionIntent` + Ajv 2020 over biotech-knowledge-intent.v1.json with
  ajv-formats): 5/5 valid both ways (proposals 11/12/13/9/15).
- `git status`: only D1 assertions.yaml ×5, intent.json ×5, vitamin-b6 questions.md, the new body file and the 5 D1 FU-03 rows.

## Lint after
| fixture | errors | warnings (all predicate-proposed, registrar-gated) |
| --- | --- | --- |
| ashwagandha-plant-part-harm | 0 | 0 |
| lgg-strain-resolution | 0 | 4 DECLARED_VIABLE_COUNT (D6) |
| nr-salt-moiety-us-canada | 0 | MOLECULAR_WEIGHT ×4, MOLECULAR_FORMULA ×2 (D1), MAX_DAILY_SERVINGS ×2 (D6) |
| nr-trial-unstructured | 0 | 0 |
| vitamin-b6-threshold-harm | 0 | MOLECULAR_WEIGHT ×4 (D1), MAX_DAILY_SERVINGS ×4 (D6) |
| **D1** | **0** (from 48) | **20** (unchanged) |

## For the coordinator
- README Index rows for D1 (relationships exercised) not regenerated: nr-trial now also RENDITION_OF; vitamin-b6 HAS_ITEM.
- vitamin-b6 source.md still describes c10a–d as CALCULATED Assertions (frozen; header + questions.md carry R-85).
- `_work/fixture-lint-baseline.json` and `_work/intent-validation.json` not rewritten (shared).

---

<!-- stage: _runlog/closeout-fixtures2-D10.md -->

# Close-out (recovery, second attempt): fixture editor (S), packet D10 (FU-03)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S). Writes: `final/fixtures/D10/<folder>/assertions.yaml` and `intent.json` (5 folders), the five D10 rows of the FU-03 table in `final/fixtures/README.md`, this log. SDL unchanged. Nothing committed. source.md, locators.yaml, composed bodies, questions.md, snapshot digests and every sourced number / identifier / quote are untouched (git diff: only assertions.yaml + intent.json under D10). `final/_work/repath-fixtures.mjs` was not run, imported or required; the only `_work` script executed is `lint-fixtures.mjs --fixture D10/<folder>` (report mode, no `--baseline` / `--out`, so it writes nothing).

## Guide used

The first attempt's log `final/_runlog/closeout-fixture-editor-D10.md` (same session) lists the decisions; its edit scripts were still in the session scratchpad (`<scratchpad>/d10fx/e-{ot,lt,fda,bg,rk}.mjs` + `lib.mjs`). I re-read every script as text before running: each writes only `final/fixtures/D10/<folder>/{assertions.yaml,intent.json}`, and each exact-match edit refuses to run unless its anchor occurs exactly once.

## Commands and key outputs

```
# state check: current D10 files vs the pre-edit backup of the first attempt (<scratchpad>/d10fx/D10-orig) -> all 30 files identical (= HEAD 31390a6)
node <scratchpad>/d10fx/lint.mjs   # wrapper: spawnSync node final/_work/lint-fixtures.mjs --fixture D10/<folder>, per folder
  before: fda-qhc 6 err / 9 warn; livertox 6 / 2; mg-bisglycinate 11 / 8; mg-rankings 35 / 8; opentargets 2 / 2  => 60 errors, 29 warnings
node <scratchpad>/d10fx/e-ot.mjs ; e-lt.mjs ; e-fda.mjs ; e-bg.mjs ; e-rk.mjs
  -> ot done; lt done; fda done; bisglycinate: yaml asserters replaced 6, intent asserters replaced 8; rk done, proposals 39
# result vs the first attempt's verified output (<scratchpad>/d10fx/applied): all 10 edited files byte-identical
node <scratchpad>/d10fx/lint.mjs
  after: fda-qhc 0 / 9; livertox 0 / 2; mg-bisglycinate 0 / 8; mg-rankings 0 / 16; opentargets 0 / 2  => 0 errors, 37 warnings
node <scratchpad>/d10fx/vint.mjs   # zod IngestionIntent (packages/contracts/dist) + Ajv 2020 on biotech-knowledge-intent.v1.json, D10 only
  -> all five: zod true, json true (proposals: fda 12, livertox 8, mg-bisglycinate 11, mg-rankings 39, opentargets 10)
node <scratchpad>/d10fx/readme2.mjs  # replaces exactly the five `| D10/<folder> |` rows (each must match once and still be in baseline form)
```

## Edits applied

| fixture | edit | source |
|---|---|---|
| opentargets-association-signal | INDICATED_FOR -> HAS_APPROVED_INDICATION; asserter e-label-holder -> e-fda (regulator); basisKind MANUFACTURER_CLAIM dropped; qualifier labelHolder:REMEDYREPACK; e-label-holder kept as documented entity, removed from intent subjects | predicates.yaml alias fixtureEdit (R-88) |
| livertox-green-tea-extract-harm | ASSOCIATED_WITH_ADVERSE_EFFECT ×2 -> CAUSES_ADVERSE_EFFECT + sourceKind:REFERENCE_MONOGRAPH + population:UNSPECIFIED (polarity / speechAct kept); REPORTS_ADVERSE_EVENT_RATE -> CHARACTERIZES_INCIDENCE (literal kept) | aliases (R-84/R-85) |
| fda-qhc-magnesium-disconfirmation | STATES_REGULATORY_STATUS ×2 -> RATES_CLAIM; CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT -> HAS_CLAIM_CONDITION, subject the Claim, qualifier productClass=; product-class pseudo-entity e-dietary-supplements removed (entities, intent subjects, i-harms ASSESSES) | alias; retired (R-93) |
| mg-bisglycinate-rct-unstructured | R-15: first-author stand-in e-authors removed, asserter e-publication (D3.Publication), COI statement asserted by e-lopresti; ARM_DAILY_DOSE ×2 -> ADMINISTERED_AMOUNT on new InterventionComponent e-ic-mg (StudyArm -HAS_COMPONENT-> structural, e-ic-mg -ADMINISTERS-> material via new a-administers); MATERIAL_MANUFACTURED_BY -> e-biogena -MANUFACTURES-> e-mg-bisglycinate; DISCLOSES_ROLE_AT -> HOLDS_ROLE {roleKind EXECUTIVE_OFFICER} + roleText:managing director; comparisonKind BETWEEN_GROUP -> BETWEEN_ARM; Target resolved (hu:target:sleep, no vocabularyKey) | R-15, R-68, R-82/R-30, R-58, retired ARM_DAILY_DOSE |
| mg-rankings-criteria-comparison | per DSLD label (173951, 271329, 242510): ProductVariant, Package, LabelVersion; HAS_VARIANT / HAS_PACKAGE structural; HAS_LABEL_VERSION asserted by NIH ODS; DECLARES_INGREDIENT_FORM + LABEL_DECLARED_AMOUNT -> one DECLARES_COMPONENT line (ComponentLineProperties; declaredName:/form: qualifiers, R-30); LABEL_SERVING_DIRECTIONS -> MAX_DAILY_SERVINGS on the LabelVersion; MAX_DAILY_SUPPLEMENTAL_AMOUNT ×3 -> PER_MAX_DAILY_DOSE_AMOUNT (LabelVersion, object magnesium, rule:daily-max.v1); criterion inputPredicates + BLOCK rule re-keyed; DISCLOSES_AFFILIATE_COMMISSION -> DISCLOSES_INTEREST; STATES_METHOD_MAY_CHANGE -> STATES_METHOD_CAVEAT; Target resolved; supersedesUid kept (R-23: both versions Labdoor) | retired / alias entries; R-23 check |

Not present in D10 (grep): Mention node (the mg-bisglycinate `mentions:` list is the derived Chunk MENTIONS, R-09/R-27 compliant), RENDITION_OF, nNoChangeContexts, interim OTHER discourse Assessments (the two `claimType: OTHER` are Claims), disclosureFinding, HAS_REVISION_STATUS / REVISES, ClaimOccurrence, INCREASES_LEVEL, HOLDS_EQUITY_IN, AlgorithmVersion.*. R-15 does not apply to the other four fixtures (Organization / Agent asserters only).

Facts without a locator (unchanged from the first attempt): DSLD productVersionCode, netContents, servingsPerContainer and entryDate, read from the captured snapshot bytes (sha256 = snapshot contentHash) and marked as such in entity notes / qualifiers. No locator added, no fact invented.

## Remaining (warnings only; no error, no owner-gated item)

- predicate-proposed ×35 (registrar-gated names, not D10 fixture edits): REPORTS_DOSE_RANGE_STUDIED ×8, REDUCES_RISK_OF ×1 (Claim binding; re-keying changes propositionHash), STATES_ATTRIBUTION_CAVEAT ×2, CHARACTERIZES_ABSORPTION ×4; REPORTS_EFFECT_SIZE, STATES_LIMITATION, STATES_STUDY_DESIGN, INDEXED_AS_PUBLICATION_TYPE ×2 each; MAX_DAILY_SERVINGS ×6; STATES_METHOD_CAVEAT ×4, DISCLAIMS_ENDORSEMENT ×2.
- retired-name ×2: mg-rankings supersedesUid (same asserter, legitimate under R-23).

## Gaps recorded (no schema change; for the coordinator / open-questions owner)

- intent v1: assertion.literal has no object slot (PER_MAX_DAILY_DOSE_AMOUNT object magnesium only in assertions.yaml); AssertionCore has no qualifiers (kept in rationale); asserterRef doc names Person / Organization / Agent while R-15 needs a Publication asserter (executor P20 widening).
- predicates.yaml HAS_CLAIM_CONDITION subjectTypes [RegulatoryRecord] should admit Claim (R-93 fixtureEdit uses the Claim).
- R-88 text (labeler of record asserts label statements) vs the INDICATED_FOR fixtureEdit (regulator asserts the approved indication); the fixtureEdit was followed.
- README index rows for D10 ("relationships exercised") not refreshed; they miss HOLDS_ROLE, ADMINISTERS, HAS_COMPONENT, HAS_LABEL_VERSION, DECLARES_COMPONENT, HAS_VARIANT, HAS_PACKAGE (outside my rows).

---

<!-- stage: _runlog/closeout-fixtures2-D11.md -->

# Close-out (recovery, 2nd attempt): fixture editor (S) for final/fixtures/D11/ (FU-03), 2026-10-09

Scope: `final/fixtures/D11/<folder>/` (5 fixtures) and the D11 rows of the FU-03 table in `final/fixtures/README.md` only.
No SDL change (candidate untouched). No commit. The only script executed from `final/_work/` is `lint-fixtures.mjs --fixture D11/<f>`
(read-only report mode); `repath-fixtures.mjs` was read as text only. source.md, locators.yaml quotes / offsets, snapshot digests and
sourced numbers, identifiers and quotes are unchanged. Research only, not medical advice.

The first attempt's log (`_runlog/closeout-S-fixtures-D11.md`) stops after its baseline and "Edit sources" sections (no edits
recorded); its baseline and edit-source list were re-checked here and match.

## Edit sources

- FU-03 rows D11/* (README "Residual non-final names and pending ruling edits"): chloride (R-09/R-27 Mention x4), nr-trial (Mention
  prose), resveratrol (R-44 REVISES by asserters; R-30 verbatim edge fields), sirolimus (R-30 declaredNameVerbatim).
- `vocabularies/predicates.yaml`: no fixtureEdit names a D11 fixture; no alias / retired predicate is used by a D11 fixture.
  Proposed-new predicates used (warn, registrar D3): WELL_TOLERATED_AT_DOSE, DOSE_EXCEEDS_LABEL_RECOMMENDATION, PRECONDITIONS_HEART.
- `_work/rulings.yaml` modules.D11 edit-fixture ops: R-44 only.
- Rulings that touch D11 fixture data although no row names them: R-10/R-26 (asserted types use AssertedRecordedProperties;
  DECLARES_COMPONENT is asserted), R-15 (multi-author paper asserter = the D3 Publication), R-30 (roleTextVerbatim,
  reasonsVerbatim), R-35 (a Firecrawl rendition is TOOL_RENDITION), R-42/R-43 (no Identifier shared by a Source and a work;
  renditions grouped by asserted RENDITION_OF).

## Baseline (read-only)

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D11/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| capture-failures-coverage | 0 | 0 | — |
| nr-chloride-gsrs-identifier-bridge | 8 | 0 | retired-name 4 (Mention), node-type 3 (Mention), edge-property-type 1 (HAS_ACTIVE_MOIETY) |
| nr-trial-jats-unstructured | 6 | 3 | edge-property-type 3 (ADMINISTERS, REALIZES_SUBSTANCE, REPORTS_ON), edge-property 3 (intent roleTextVerbatim), predicate-proposed 3 |
| resveratrol-retraction-integrity | 1 | 2 | edge-property 1 (intent reasonsVerbatim), predicate-proposed 2 (PRECONDITIONS_HEART) |
| sirolimus-spl-boxed-warning | 4 | 0 | retired-name 2 (declaredNameVerbatim), edge-property-type 1 (REALIZES_SUBSTANCE), edge-property 1 (intent declaredNameVerbatim) |
| **total** | **19** | **5** | |

Intent validation (read-only scratch script `<scratchpad>/validate-d11-intents.mjs`: zod `IngestionIntent` from
packages/contracts/dist + Ajv 2020 on packages/contracts/json-schema/biotech-knowledge-intent.v1.json, the same two checks as
`_work/validate-intents.mjs`; writes nothing): 5/5 zod true, JSON Schema true.

## Edits

All edits were exact single-occurrence replacements (scratch helper `rep.py`, refuses paths outside final/fixtures/D11/) or
parse-modify-write of intent.json with `JSON.stringify(j, null, 2) + "\n"` (each intent round-trips byte-identical before editing).

### nr-chloride-gsrs-identifier-bridge (R-09/R-27, R-10/R-26)
- assertions.yaml: Mention node `mention-title-nr` removed (comment explains the span form). r01 (Europe PMC proposal): `about: []`
  (CHEBI:80498 never a node), proposal moved to `facets`, span l-jats-title-mention cited CONTEXT. r02: ASSESSES sub-nr only; the
  span locator's role SUPPORTS → CONTEXT (Q-K-13 / Q-D11-10 shape); summary now says it licenses the derived Chunk MENTIONS.
  m01 HAS_ACTIVE_MOIETY edge AssertedEdgeProperties → AssertedRecordedProperties.
- intent.json: p10 `mention.stage` kept with reworded reason (v1 has no proposal kind for a RESOLUTION hypothesis on a span; the v1
  docstring says it stages a surface-form node — GAP, recorded in notes). questions.md: records-used `mention-title-nr` → the span locator.

### nr-trial-jats-unstructured (R-15, R-30, R-10/R-26, R-42/R-43, Mention prose)
- assertions.yaml: R-15 asserter person-martens → pub-martens2018 on a01, a02, a03, a05, a08, a09, a10, c01, c02 (9). a10 "The
  authors declare no competing interests." names no individual author, so it is the paper's own voice (R-15 keeps only statements
  naming one author with the Person). R-30: a08/a09/a11 `roleTextVerbatim` → Assertion qualifier `roleText:`. R-10/R-26: ADMINISTERS
  (a01), REALIZES_SUBSTANCE (a03), REPORTS_ON (a05) → AssertedRecordedProperties. R-42/R-43: i03-source-pmcid (PMCID on Source,
  shared with the work) → i03-rendition-of (RENDITION_OF src-jats → pub-martens2018, asserter NLM, AssertedRecordedProperties,
  qualifier rendition-rule:); i02 note updated. `mentions:` comment reworded (no Mention). Person node kept (ORCID, author).
- intent.json: asserterRef martens → paper ×7; unused Person subject dropped; roleTextVerbatim ×3 → rationale (OD-09); new resolved
  Source subject + p15 RENDITION_OF (source uid pinned `hu:source:ft-d11-europepmc-jats-pmc5876407`). locators.yaml: note only.
  questions.md Q-D11-08: asserter wording.

### resveratrol-retraction-integrity (R-44, R-30, R-15, R-42/R-43, R-35)
- R-44: already REVISES by each revising asserter (v01 RW, v02 NLM, v03 APS), no flag Assertion; confirmed, plus
  `revisionStatusMethodVersion` on the Publication cache (R-45) and a note naming its authority.
- R-30: `reasonsVerbatim` removed from v01–v03 edges and intent p03; v03 carries `statement:` (the normalizedExact of l-aps-reason).
- R-15: c01 asserter person-hattori → pub-hattori2002; Person node and intent subject dropped; intent p06 asserterRef → article.
- R-42/R-43: i05-source-ids → i05-rendition-of (RENDITION_OF src-pubmed-12003802 → pub-hattori2002, NLM, l-pm-ids); note lists the
  four same-shape renditions. taintPath cypher joins through `RENDITION_OF` (recordedTo IS NULL) instead of a shared Identifier;
  expected gains `renditionAssertion`. Intent: p07 RENDITION_OF with resolved Source subject (uid `hu:source:ft-d11-pubmed-12003802`).
- R-35: the Firecrawl snapshot contentHashBasis → TOOL_RENDITION (locators.yaml, intent, assertions note, questions.md; the repath
  rename had set CANONICAL_PROJECTION in the intent and left NORMALIZED_TEXT in locators.yaml).
- `docker exec bks-neo4j-synth cypher-shell … "EXPLAIN <taintPath cypher>"` → plans (SLOTTED).

### sirolimus-spl-boxed-warning (R-30, R-10/R-26; R-42 owner-gated)
- s03 DECLARES_COMPONENT: asserted (speechAct/polarity/basisKind), qualifiers `declaredName: SIROLIMUS` and `statement: numerator 1 mg /
  denominator 1 mL`; the verbatim fields leave lineProperties. Intent p03 edge.structural → edge.assert (asserter VistaPharm,
  edgeProperties orderIndex/amount/unitCode, qualifiers in rationale). s04 REALIZES_SUBSTANCE → AssertedRecordedProperties.
- OWNER-GATED, not edited structurally: i02 attaches SPL_SET_ID to the openFDA Source while i01 attaches it to the LabelVersion; R-42
  forbids a shared Identifier and R-43 RENDITION_OF targets MediaWork | Publication only, so a label rendition has no typed grouping
  edge. i02 and queries.CQ-PV-05 are marked; questions.md CQ-PV-05 row notes it. Needs an owner/K ruling (open-questions entry for the
  coordinator; this role may not edit open-questions.md).

### capture-failures-coverage
- queries.CQ-AX-04 synced with the A8 owner's pattern fix (no `CYPHER 25`; `MATCH (x:$($label) {uid: $uid})`); `diff` against
  A8 `07-fixtures/capture-failures-coverage/assertions.yaml` → identical. EXPLAIN of the dynamic-label MATCH plans on 5.26.
  No FU-03 row; no other edit (R-17/R-39 are edit-text ops).

## Result

| fixture | errors before → after | warnings before → after | remaining (owner/registrar-gated) |
| --- | --- | --- | --- |
| capture-failures-coverage | 0 → 0 | 0 → 0 | — |
| nr-chloride-gsrs-identifier-bridge | 8 → 0 | 0 → 0 | — |
| nr-trial-jats-unstructured | 6 → 0 | 3 → 3 | predicate-proposed WELL_TOLERATED_AT_DOSE ×2, DOSE_EXCEEDS_LABEL_RECOMMENDATION (registrar D3) |
| resveratrol-retraction-integrity | 1 → 0 | 2 → 2 | predicate-proposed PRECONDITIONS_HEART ×2 (registrar D3; candidate IMPROVES_TARGET, R-83) |
| sirolimus-spl-boxed-warning | 4 → 0 | 0 → 0 | R-42 × CQ-PV-05 shared SPL_SET_ID (not a lint finding) |
| **total** | **19 → 0** | **5 → 5** | |

Intent validation after edits: 5/5 zod true, JSON Schema true (proposals 1, 10, 15, 7, 6). All D11 assertions.yaml / locators.yaml
parse (PyYAML safe_load). `git diff` over final/fixtures/D11: 15 files; no source.md change; locators.yaml changes are one note and
one contentHashBasis value. README FU-03 rows D11/* (4) set to "applied" with owner-gated items; other rows untouched.

Gaps recorded: (1) v1 `mention.stage` still documents a surface-form node (R-09); (2) v1 AssertionCore has no qualifiers (OD-09),
so roleText:/declaredName:/statement:/rendition-rule: travel in rationale; (3) R-42 × CQ-PV-05: no typed rendition grouping for
drug labels (owner ruling needed).

---

<!-- stage: _runlog/closeout-fixtures2-D12.md -->

# Close-out (second attempt): fixture editor (S) for final/fixtures/D12/ (FU-03)

Date: 2026-10-09. Recovery round: fixtures were reset to 31390a6; the first attempt's log (`closeout-S-fixtures-D12.md`) was
read as a guide and every edit was re-applied and re-verified here. Scope: `final/fixtures/D12/<folder>/` and the D12 rows
of `fixtures/README.md` only. No SDL change, no source.md / locators.yaml / snapshot digest / sourced value change, no
commit. No script other than `lint-fixtures.mjs --fixture` (read-only) was run inside the repo; `repath-fixtures.mjs` was
neither run nor imported. Edits were made by scratch Python scripts in the session scratchpad that open only D12 files.

## Edit sources

- FU-03 table rows: acrylamide (R-09/R-27 Mention; R-73/R-95 acr-03 owner-gated), predimed (R-44), upf (R-44).
- predicates.yaml: no alias / retired entry and no fixtureEdit names a D12 fixture (no predicate-* lint violation).
- rulings.yaml D12 edit-fixture: R-44 "PREDIMED revision status -> REVISES". Applied by principle where the D12 fixture has
  the shape: R-15 (first-author Person asserters), R-42 (PMID/DOI on the work), R-43/R-26 (RENDITION_OF asserted).

## Baseline

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D12/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| acrylamide-fried-potato-harm | 5 | 0 | edge-property-type 1, relationship-pair 2, retired-name 2 (Mention) |
| mcdonalds-fries-prepared-food | 2 | 0 | predicate-unregistered 1, relationship-type 1 (HAS_PACKAGE edge.assert on a structural type) |
| olive-oil-polyphenols-preparation | 0 | 0 | — |
| predimed-retraction-disconfirmation | 0 | 8 | retired-name 8 (HAS_REVISION_STATUS) |
| upf-diet-rct-unstructured | 2 | 3 | edge-property-type 1, relationship-pair 1 (STATED_IN StudyResult -> Source), retired-name 3 |
| **total** | **9** | **11** | 20 violations |

## Edits

- acrylamide: acr-03 edge AssertedEdgeProperties -> AssertedRecordedProperties, with an OWNER-GATED note (R-95 / OD-10);
  intent p03-result-for rationale marks the same; acr-04 note and intent p06 reason reworded (no surface-form node,
  SourceLocator + RESOLUTION Assessment, MENTIONS only from a D9 Chunk). The Product pair itself is not changed.
- mcdonalds: intent p03-package HAS_PACKAGE edge.assert -> edge.structural (no asserter / assertion; properties {}).
- predimed: pred-05 / 05b HAS_REVISION_STATUS FIELD -> D3 REVISES notice (pmid-29897867) -> 2013 article (pmid-23432189),
  revisionKind RETRACTION, by NLM and by NEJM; pred-06 -> REVISES 2018 article (pmid-29897866) -> 2013 article,
  CORRECTED_AND_REPUBLISHED, by NLM; three D3 Publications added, PMID/DOI moved off the Sources (R-42); pred-08..10
  RENDITION_OF Source -> Publication (curation agent, CURATOR_CLASSIFICATION, CONTEXT locator inside each record);
  R-15 pred-01..03, 07 asserter = 2018 Publication, pred-04 = 2013 Publication (Estruch Person removed). Intent: p05 /
  p05b / p06 edge.assert REVISES with edgeProperties.revisionKind; p08..p10 edge.assert RENDITION_OF; new subjects
  pub-2013, pub-2018, pub-notice, src-notice (canonicalUri = the captured notice efetch URI), agent-curation; `estruch`
  subject removed. questions.md Q-D12-09 / Q-D12-10 reworded to REVISES.
- upf: upf-07 (one status over two errata) -> upf-07 + upf-07b D3 REVISES ERRATUM by NLM (31269427 and 33027677 ->
  31105044; validFrom 2019-07-02 / 2020-10-06 = issue dates printed in the ErratumIn citations, PUBLICATION_PROXY; errata
  DOIs taken from the same citations); upf-08 RENDITION_OF JATS Source -> Publication; R-15 upf-01..06 asserter = the
  Publication (Hall Person removed); upf-02 STATED_IN object -> Publication, AssertedRecordedProperties; PMID/DOI moved to
  the Publication (PMCID stays on the Source); StudyResult keys pValueVerbatim / resultVerbatim -> pValueText / resultText
  (values unchanged). Intent: p08 / p08b REVISES, p09 RENDITION_OF, subjects pub-hall / pub-erratum-2019 /
  pub-erratum-2020 / agent-curation; `hall` subject removed. questions.md Q-D12-26 reworded.

Count: 36 structural edits (acrylamide 4, mcdonalds 1, predimed 18, upf 13) over assertions.yaml, intent.json, questions.md.

## Validation

- Intents, biotech-knowledge-intent.v1: zod IngestionIntent (packages/contracts/dist) + JSON Schema (Ajv 2020 +
  ajv-formats 3.0.1), same imports as `_work/validate-intents.mjs`, run from a scratch script
  (`<scratchpad>/d12/validate-d12.mjs`) so `_work/intent-validation.json` is not rewritten:
  acrylamide 7 proposals, mcdonalds 12, olive 6, predimed 11, upf 10 — all zod true, jsonSchema true.
- Residual scan over D12 non-comment lines (Mention, supersedesUid, HAS_REVISION_STATUS, R-30 verbatim fields,
  ClaimOccurrence, nNoChangeContexts, retired predicate names): 0 hits.

## After

| fixture | errors | warnings |
| --- | --- | --- |
| acrylamide-fried-potato-harm | 2 | 0 |
| mcdonalds-fries-prepared-food | 0 | 0 |
| olive-oil-polyphenols-preparation | 0 | 0 |
| predimed-retraction-disconfirmation | 0 | 0 |
| upf-diet-rct-unstructured | 0 | 0 |
| **total** | **2** | **0** |

Remaining, owner-gated: acrylamide acr-03 and intent p03-result-for, relationship-pair
QualityResult-[:QUALITY_RESULT_FOR]->Product (R-73 cut the Product member; R-95 / OD-10).

## Notes / gaps

- intent v1 cannot stage a StudyResult, so D3 STATED_IN (upf-02) stays in assertions.yaml only (stated in the intent notes).
- intent v1 has no evidence roles or Assertion qualifiers: CONTEXT / QUALIFIES roles and the renditionRule / erratumIn /
  issueDate qualifiers are carried in proposal rationales.
- acr-05 CAUSES_ADVERSE_EFFECT has no `population:` qualifier although the registry lists it as required (requiredQualifiers:
  population). The fixture says on purpose "no population qualifier" (laboratory animals, not a person-level population).
  The lint does not check it. Not changed here; the registrar (D5) or the owner should decide whether
  `population:laboratory animals` is expected.
- fixtures/README.md: D12 rows set to applied; a D12/mcdonalds-fries-prepared-food row added (it had no FU-03 row).

---

<!-- stage: _runlog/closeout-fixtures2-D13.md -->

# Close-out (second attempt) — S fixture editor / D13 fixtures (FU-03)

2026-10-09. Recovery round after `final/fixtures/` was reset to 31390a6. Scope: `final/fixtures/D13/<folder>/` (5 fixtures)
and the three D13 rows of the FU-03 table in `final/fixtures/README.md`. No SDL change, no commit. `repath-fixtures.mjs`
and every other writing script were read as text only; the only project script executed was `lint-fixtures.mjs --fixture`
(report mode). Guide: the lost first attempt's log `_runlog/closeout-S-fixtures-D13.md` (same decisions re-applied and
re-verified here). `open-questions.md` already holds FX-D13-01 from that attempt; its content still matches, so it was
not edited.

Inputs: FU-03 rows for D13; `_work/rulings.yaml` modules.D13 edit-fixture ops (R-44 lesne; R-21 lesne a10/a11 + bioage;
R-35 already applied by the repath); R-92 (FINANCING_AMOUNT already uses amountKind/amountBasis qualifiers, no edit);
`vocabularies/predicates.yaml` via the lint (no alias / retired / report-only predicate in any D13 fixture).

## Baseline lint

```
$ node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D13/<folder>
D13/bioage-strides-discontinuation          E 1  W 0   retired-name Mention [assertions 260]
D13/lesne-2006-retraction                   E 22 W 13  retired-name 29 (role=AUTHOR/PUBLISHER, derivedFrom=, HAS_REVISION_STATUS), enum-value 6
D13/madrigal-financing-after-readout        E 0  W 0
D13/madrigal-maestro-nash-topline-8k        E 0  W 0
D13/madrigal-pdufa-to-accelerated-approval  E 0  W 1   supersedesUid [169]
total 23 errors / 14 warnings
```

## Edits applied (10)

lesne-2006-retraction (assertions.yaml, intent.json, questions.md):
1. R-44: INVOLVES PUBLISHER (a05) and AUTHOR (a06, a07) dropped, with p-a05..p-a07; Person entities/subjects `lesne`,
   `ashe` removed (no other use).
2. R-44: new D3 Publication `notice` (RETRACTION_NOTICE; DOI 10.1038/s41586-024-07691-8 from the notice snapshot URI
   and l07/l08/l12; PMID 38914864 from l12; publishedAt 2024-06-24 from l04; venue Nature); intent subject mode new
   (DOI issuer Crossref, PMID issuer NLM).
3. R-44: a09 (publisher) -> REVISES notice -> article, RevisionEdgeProperties revisionKind RETRACTION; evidence l03, l04, l07, l15.
4. R-44 + R-21: a10 (Retraction Watch) -> REVISES, basisKind CITED_FROM_PRIOR_WORK, `derivedFrom: [hu:assertion:fx-d13-lesne-a09]`.
5. R-44 + R-21: a11 (NLM) -> REVISES, same; validFromBasis PUBLICATION_PROXY kept.
6. R-44: a12 (Retraction Watch EXPRESSION_OF_CONCERN) kept as HAS_REVISION_STATUS: l09 names only the article DOI
   (no identified notice) — the case R-44 reserves it for; note added.
7. R-44 (EventKind.RETRACTION: clock cites the notice locator, no second date Assertion): a02 / p-a02 dropped.
8. Prose (kernelRevisionRecord.noticeSource, pubmedCorroboration, corroboration) and questions.md (CQ-EV-05, Q-D13-22,
   CQ-TM-01) updated to REVISES / DERIVED_FROM; intent notes + p-a10/p-a11 rationale record the v1 gap (no
   Assertion -> Assertion DERIVED_FROM field).

bioage-strides-discontinuation (assertions.yaml, intent.json):
9. R-09/R-27: a05 note's interim surface-form wording replaced; RESOLUTION Assessment r01 added (about the D2 Condition
   R74.01, evidence l04 CONTEXT, status PROPOSED, methodVersion = the ICD-10-CM lookup recorded on the entity,
   facet surfaceForm). R-21 checked: no derived record (corroboration.derivedRecords note). Intent notes: v1 has no
   Assessment write.

madrigal-pdufa-to-accelerated-approval (assertions.yaml):
10. R-23 check: a02 supersedes a01, both asserted by Madrigal -> allowed; note added.

Not applicable to D13 (grep + lint): R-30, R-15, R-43/R-26, R-47, R-49, R-55, R-58, R-68/R-73/R-80/R-82/R-85 re-keys,
F-05, predicate aliases / retired names. Unchanged: every source.md, locators.yaml, snapshot digest, quote, number and
identifier (`git status` lists no locators.yaml / source.md under D13).

## Validation

```
$ node <scratchpad>/d13v.mjs   (zod IngestionIntent from packages/contracts/dist + Ajv 2020-12 + ajv-formats over
                                packages/contracts/json-schema/biotech-knowledge-intent.v1.json; same method as
                                _work/validate-intents.mjs, read-only, does not write _work/intent-validation.json;
                                also YAML-parses each assertions.yaml)
bioage-strides-discontinuation: zod ok; jsonSchema ok; proposals 11; yaml ok
lesne-2006-retraction: zod ok; jsonSchema ok; proposals 7; yaml ok        (was 11: -p-a02, -p-a05..07; p-a09..11 edge.assert REVISES)
madrigal-financing-after-readout: zod ok; jsonSchema ok; proposals 13; yaml ok
madrigal-maestro-nash-topline-8k: zod ok; jsonSchema ok; proposals 9; yaml ok
madrigal-pdufa-to-accelerated-approval: zod ok; jsonSchema ok; proposals 22; yaml ok

$ node .../final/_work/lint-fixtures.mjs --fixture D13/<folder>
D13/bioage-strides-discontinuation          E 0 W 0
D13/lesne-2006-retraction                   E 0 W 3   HAS_REVISION_STATUS a12 [assertions 430; intent 596, 601] — legitimate (R-44)
D13/madrigal-financing-after-readout        E 0 W 0
D13/madrigal-maestro-nash-topline-8k        E 0 W 0
D13/madrigal-pdufa-to-accelerated-approval  E 0 W 1   supersedesUid a02 [169] — legitimate (R-23 same asserter)
total 23 errors / 14 warnings -> 0 errors / 4 warnings (all legitimate; no owner-gated item)
```

## Bookkeeping
- `final/fixtures/README.md`: the three D13 FU-03 rows replaced in one read-modify-write (rows matched by their
  `| D13/<folder> |` prefix; other rows untouched).
- Registry `observed` counts for HAS_REVISION_STATUS / REVISES / INVOLVES change with these edits; `build-predicates.mjs`
  was not run (it writes outside D13) — the coordinator's regeneration picks them up.
- Q-D13-22 pattern (R-21 edit-pattern, collapse DERIVED_FROM chains) is a pattern-owner item, not edited here.

---

<!-- stage: _runlog/closeout-fixtures2-D2.md -->

# Close-out (second attempt) — fixture editor (S) for final/fixtures/D2/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D2/<folder>/ only (5 fixtures) and the 5 D2 rows of the fixtures/README.md FU-03 table.
No SDL change, no source.md / locators.yaml / snapshot digest / sourced value change, no commit. Recovery round: the folder
was reset to 31390a6; the lost first attempt's log (`_runlog/closeout-S-fixtures-D2.md`) was read as a guide and every edit
was re-applied and re-verified here. Scripts: only `final/_work/lint-fixtures.mjs --fixture D2/<folder>` (report mode, writes
nothing) was executed from final/_work; repath-fixtures.mjs was not run or imported (lint-fixtures reads its RESIDUAL as text).
Intent validation used a read-only scratchpad script (zod IngestionIntent + Ajv 2020-12 + ajv-formats@3.0.1 over the D2
intents only; writes nothing; final/_work/intent-validation.json not touched).

## Baseline (before edits)

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D2/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| dq-senescence-biomarker-path | 2 | 0 | edge-property 1, retired-name 1 (nNoChangeContexts) |
| metformin-exercise-harm | 4 | 0 | edge-property 2, retired-name 2 (nNoChangeContexts) |
| nr-muscle-unstructured | 7 | 0 | edge-property 3, retired-name 3 (nNoChangeContexts), predicate-alias 1 (HOLDS_EQUITY_IN) |
| reactome-chembl-reference | 2 | 0 | edge-property 1, retired-name 1 (nNoChangeContexts) |
| sirt1-activation-disconfirmation | 4 | 0 | edge-property 2, retired-name 2 (nNoChangeContexts) |
| **total** | **19** | **0** | |

Intent v1 (scratchpad validator) before edits: 5/5 zod ok, 5/5 JSON Schema ok; proposals dq 14, metformin 9, nr 11, reactome 13, sirt1 7.

Edit sources: FU-03 rows D2/* (R-47 nNoChangeContexts; R-15; R-58); predicates.yaml fixtureEdit for D2 (HOLDS_EQUITY_IN →
HOLDS_STAKE, nr-muscle A-nr-06); rulings.yaml D2 edit-fixture ops (R-15, R-58) plus D2 rulings that touch fixture data
(R-47 score null on AFFECTS_MECHANISM; R-26 mapping basis CURATOR_CLASSIFICATION; R-59 DECREASED in prose; R-30 stakeClass:
qualifier). Q-D2-21 patternEdit (R-89) belongs to the pattern owner, not applied here.

## Edits applied (assertions.yaml, intent.json, questions.md; source.md / locators.yaml untouched)

Applied with a scratchpad script that writes only final/fixtures/D2/<folder>/ files and asserts the exact count of every
replacement (dry run first, then write; 15 files). A close-out header comment was added to each assertions.yaml.

| fixture | edits |
| --- | --- |
| all 5 | R-47: `nNoChangeContexts` removed from all 9 AFFECTS_MECHANISM derived edges; `score` set to null on the 6 that carried a value (1.0 ×4, 0.5, 0.0; the other 3 were already null); comment above `derivedEdges:` |
| dq-senescence-biomarker-path | R-15: first-author Person `asserter-hickson2019` → D3.Publication `pub-hickson2019` (PMID 31542391, PMCID PMC6796530, DOI 10.1016/j.ebiom.2019.08.069, EBioMedicine 2019;47:446-456, all from source.md) as asserter of A-dq-01..07; intent.json subject replaced (nodeType Publication, identifiers, sorted) and both REFLECTS_MECHANISM edge.assert `asserterRef`; notes; R-59 prose DECREASES → DECREASED (crossDomainPath ×1, questions.md ×2) |
| metformin-exercise-harm | R-15: `pub-konopka2019` (PMID 30548390, PMCID PMC6351883, DOI 10.1111/acel.12880) asserts A-m-01/02/04/05; A-m-03 stays ChEMBL; intent notes (no asserter is expressed in this intent); R-59 prose ×3 in questions.md |
| nr-muscle-unstructured | predicates.yaml fixtureEdit: A-nr-06 HOLDS_EQUITY_IN → HOLDS_STAKE, `edgeProperties: { stakeKind: EQUITY }`, R-30 qualifier `stakeClass: owns stock` (verbatim from L-nr-09); R-15: A-nr-01..05 asserted by `pub-elhassan2019` (PMID 31412242, PMCID PMC6702140, DOI 10.1016/j.celrep.2019.07.043), A-nr-06 (one author's competing interest) asserted by the named Person `person-cb`; intent.json: new edge.assert `p-a-nr-06` HOLDS_STAKE person-cb → org-chromadex (asserterRef person-cb, evidence l-nr-09, stakeKind EQUITY, validFrom 2019-08-13 PUBLICATION_PROXY as in assertions.yaml); A-nr-06 removed from the notes' not-expressed list; questions.md CQ-MX-01 (asserter), Q-D2-21 (HOLDS_STAKE), Q-D2-01 (R-59) |
| reactome-chembl-reference | R-26: hallmark-mapping A-r-ref-03..06 basisKind EXPERT_OPINION → CURATOR_CLASSIFICATION (assertions.yaml ×4, intent.json edge.assert ×3; A-r-ref-03 has no proposal); header comment; notes; questions.md Q-D2-12 and R-59 ×1 |
| sirt1-activation-disconfirmation | R-15: `pub-pacholec2010` (PMID 20061378, PMCID PMC2832984, DOI 10.1074/jbc.M109.088682) asserts A-s-01..03, `pub-howitz2003` (PMID 12939617, DOI 10.1038/nature01960) asserts A-s-04 (author affiliations kept in the Publication notes); R-58: the 3 IN_VITRO_CELL_FREE contexts get route IN_MEDIUM + exposureBasis MEDIUM_CONCENTRATION (assertions.yaml + intent.json subjects; exposureAmount stays null, not stated); comment rewritten; questions.md Q-D2-05 (R-47 null count from A-s-01, R-58, R-15); notes |

Not invented: no concentration for the cell-free contexts; no publishedAt on the new Publications (only venue/citation and
the identifiers printed in source.md); no RENDITION_OF from the captured Sources to the Publications (not required by the rows).
Intent v1 gap recorded in nr-muscle notes: edge.assert has no qualifiers field, so `stakeClass: owns stock` lives only in
assertions.yaml. Q-D2-21 patternEdit (R-89) is the pattern owner's. R-58 is n/a for dq, metformin, nr-muscle, reactome (no
cell-free context); R-15 is n/a for reactome (no author asserter).

## Checks (after edits)

- `node .../_work/lint-fixtures.mjs --fixture D2/<folder>`: 0 errors, 0 warnings on all 5 (19 → 0).
- `node .../_work/lint-fixtures.mjs` (summary only, nothing written): byPacket D2 = {fixtures 5, clean 5, errors 0, warnings 0}.
- Intent v1 (scratchpad validator, read-only): 5/5 zod ok, 5/5 JSON Schema ok; proposals dq 14, metformin 9, nr 12 (+1), reactome 13, sirt1 7.
- YAML parse of all 5 assertions.yaml ok; every assertion asserter ref resolves to an entity; every intent asserterRef resolves to a subject; no derived edge carries nNoChangeContexts or a non-null score.
- `git status`: only the 15 D2 assertions/intent/questions files, README.md (D2 rows) and this log changed by this role; source.md and locators.yaml unchanged.
- fixtures/README.md FU-03 rows D2/* (5) rewritten to "applied …; owner-gated: none" (single read-modify-write of exactly those 5 lines; diff against a pre-edit copy shows only lines 198–202 changed).

---

<!-- stage: _runlog/closeout-fixtures2-D3.md -->

# Close-out (recovery, second attempt) — fixture editor (S) for final/fixtures/D3/ (FU-03)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S). Folder reset to baseline 31390a6 by the coordinator; the lost first attempt's log `closeout-fixture-editor-D3.md` was read as a guide and every edit re-applied and re-verified here. Edited only `final/fixtures/D3/<folder>/` (assertions.yaml, intent.json, questions.md) and the two D3 rows of the FU-03 table in `final/fixtures/README.md`. No SDL change. source.md, locators.yaml, snapshot digests, quotes and sourced numbers untouched. Nothing committed. No script other than `lint-fixtures.mjs --fixture` was executed from `final/_work/` (`repath-fixtures.mjs` and `validate-intents.mjs` read as text only; lint-fixtures reads repath-fixtures.mjs as text, not import).

## Inputs
- FU-03 rows: `D3/dq-bone-trial-unstructured` (R-82 FUNDED_BY needs a D7.Organization funder + `roleText:`), `D3/resveratrol-retraction` (HAS_REVISION_STATUS residuals, R-44; F-05 ClaimOccurrence prose). No row for `D3/aspree-registry-history-harm`.
- `vocabularies/predicates.yaml`: no alias / retired / proposed entry is used by a D3 fixture (lint reports 0 predicate-alias / predicate-retired) — no re-key to apply. FUNDED_BY: registered, kind relationship, Publication → Organization, qualifier roleText.
- `_work/rulings.yaml`: no `edit-fixture` op for D3 fixtures (the R-44 "resveratrol" op sits under D11 = D11's own fixture). Rulings applied as they bear on these copies: R-82, R-42/R-43, R-44, F-05. Checked, nothing to do: R-15 (paper asserters already the Publication), R-23, R-09/R-27, R-30, R-47, R-49, R-55, R-58 (quantityBasis values are AmountBasis values).

## Baseline lint
```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D3/<folder>
  aspree-registry-history-harm   0 errors, 0 warnings
  dq-bone-trial-unstructured     1 error  (enum-value disagreements.5.registry NONE)
  resveratrol-retraction         2 errors (predicate-unregistered OCCURRENCE_OF a21; relationship-pair ChemicalSubstance-[:OCCURRENCE_OF]->Claim),
                                 7 warnings (retired-name HAS_REVISION_STATUS: assertions 817, 846, 1947, 1949, 1957; intent 1709, 1711)
  total 10 (3 errors, 7 warnings)
```
Scoped intent validation (scratchpad `validate-d3-intents.mjs`: zod IngestionIntent + Ajv 2020-12 over `packages/contracts/json-schema/biotech-knowledge-intent.v1.json`, read-only; the shared `_work/intent-validation.json` is not rewritten): all three valid (119 / 120 / 24 proposals).

## Edits (structural only)
dq-bone-trial-unstructured
1. R-82 a64: FUNDED_BY FIELD literal → RELATIONSHIP `pub` → new resolved entity `org-nih` (D7.Organization "National Institutes of Health", uid hu:org:fx-national-institutes-of-health) — the funder named by locator l39 ("This work was supported by National Institutes of Health grant nos …"); the l40 sentence moves to qualifier `roleText:`; evidence l39 + l40; note added. The table's "a64 names no funder" holds for l40 alone; l39 in the same acknowledgements paragraph names it, so nothing is invented.
2. intent.json: subject `org-nih` (resolved, Organization) added; p-a64 assertion.literal → edge.assert FUNDED_BY pub → org-nih (registered predicate-only name: lint allows edge.assert, no edge written, no edgeProperties — the convention D5 fixtures use for AUTHORED_BY); roleText carried in the rationale (v1 has no Assertion qualifiers field, OD-09).
3. disagreements[masking] `registry: NONE` → `registry: RegistrationVersion.masking NONE` (lint read the free-text key as RegistryKind; the registry's value NONE is unchanged).
4. questions.md Q-D3-08 names the FUNDED_BY object and roleText.

resveratrol-retraction
5. R-42/R-43 a06: Source HAS_IDENTIFIER DOI (the work's DOI on a second Subjectable) → asserted RENDITION_OF Source → Publication pub-article (projectsTo AssertedRecordedProperties; asserter NLM unchanged; evidence l06 DOI + l07 PMID; qualifier `rendition-rule:`). intent p-a06 identifier.attach → edge.assert RENDITION_OF (no edgeProperties; qualifier in rationale).
6. R-44 a11 (OpenAlex is_retracted flag, no identified notice — the case R-44 keeps HAS_REVISION_STATUS for): kept; its note, the projection rule, kernelPathCQ_EV_05 and questions.md CQ-EV-05 now go through Source -RENDITION_OF-> Publication, and prose no longer repeats the predicate name.
7. R-44 projection values: RETRACTED → RETRACTION, NONE_KNOWN → null; questions.md CQ-EV-05 projection value and Q-D3-03 filter `= RETRACTION`.
8. F-05 a21: `predicate: OCCURRENCE_OF` + `object: claim` → `occurrenceOf: claim` (structural OCCURRENCE_OF Assertion → Claim) + `proposition:` (the Claim's text, = l01 quote); note no longer names a ClaimOccurrence label. The occurrence's own predicate is not registered → `predicate: null` + `predicatePending` (owner-gated; not invented). intent notes: "a21 OCCURRENCE_OF" → "a21 claim occurrence (… predicate pending registration, F-05/R-52)".

aspree-registry-history-harm
9. projections: Publication.revisionStatus result NONE_KNOWN → null (R-44).

## Final lint and validation
```
node .../final/_work/lint-fixtures.mjs --fixture D3/<folder>
  aspree-registry-history-harm   0 errors, 0 warnings
  dq-bone-trial-unstructured     0 errors, 0 warnings
  resveratrol-retraction         0 errors, 3 warnings: retired-name HAS_REVISION_STATUS at assertions.yaml:826 (a11), intent.json:1720,1722 (p-a11) — legitimate under R-44, kept
scoped intent validation (zod + Ajv): aspree 119 ok, dq-bone 120 ok (59 subjects), resveratrol 24 ok
python yaml.safe_load of the three assertions.yaml: ok
git status: only assertions.yaml / intent.json / questions.md under fixtures/D3 + README.md (D3 rows) changed
```
Violations 10 (3 errors, 7 warnings) → 3 (0 errors, 3 legitimate R-44 warnings).

## Owner-gated / for the coordinator
- resveratrol a21: no registered predicate for "Resveratrol increases longevity through SirT1 …" (ChemicalSubstance subject, no object node). Registrar D2 (R-52) to register one; then a21 and the Claim take it. Not recorded in open-questions.md (outside this role's write scope) — coordinator to add if wanted.
- FU-03 README rows D3/dq-bone-trial-unstructured and D3/resveratrol-retraction set to "applied".

---

<!-- stage: _runlog/closeout-fixtures2-D4.md -->

# Close-out (second attempt): fixture editor (S), final/fixtures/D4/ (FU-03)

2026-10-09. This is the recovery round, run after the coordinator reset final/fixtures/ to 31390a6. Writes went only to `final/fixtures/D4/<folder>/` (assertions.yaml and intent.json) and the D4 rows of the FU-03 table in `final/fixtures/README.md`. source.md, locators.yaml, quotes, snapshot digests and sourced numbers and identifiers are untouched. The SDL is unchanged and nothing is committed. Guide: `_runlog/closeout-fixture-editor-D4.md` (the lost first attempt). I re-applied its decisions and verified each one again.

Scripts executed: only `_work/lint-fixtures.mjs --fixture D4/<folder>`, which runs in report mode and writes nothing. I also ran three scratchpad scripts:

- `edit-d4.mjs` wrote the D4 edits.
- `val-d4.mjs` validates the D4 intents only and writes nothing.
- `readme-d4.mjs` replaced the one D4 row of the table and inserted three new D4 rows.

I did not run or import `repath-fixtures.mjs` or `validate-intents.mjs`, since the latter writes `_work/intent-validation.json`.

## Inputs (re-checked)

- **FU-03 table:** one D4 row, `D4/hba1c-two-labs-interference`. R-26/R-25 make PERFORMED_BY_LAB d05 asserted with basisKind CURATOR_CLASSIFICATION.
- **predicates.yaml:** D4/dunedinpace-paper-unstructured has two aliases under R-52:
  - `AlgorithmVersion.inputFeatureCount` is an alias of INPUT_FEATURE_COUNT.
  - `AlgorithmVersion.inputPlatforms` is an alias of INPUT_PLATFORMS.
- **rulings.yaml, D4 section:** no `edit-fixture` op. R-26 change-edge-class is the d05 edit above. The other D4 ops are text, pattern, question or seam edits, not fixture edits.
- **R-15 (general):** three D4 fixtures used a first-author Person "asserter for the author group". The title, venue and PMID/PMCID/DOI are printed in each source.md (snapshot title and Citation), so the edit needs no new fact.
- **Other typical rulings:** a grep of D4 for Mention, nNoChangeContexts, supersedesUid, ClaimOccurrence, HAS_REVISION_STATUS, R-30 verbatim fields and retired predicates returned no hits.

## Baseline

```
lint-fixtures.mjs --fixture D4/<folder> (x7)
  dunedinpace-paper-unstructured: errors 2 (predicate-alias: AlgorithmVersion.inputFeatureCount, AlgorithmVersion.inputPlatforms); other six 0/0
```

## Edits

| fixture | edit |
|---|---|
| dunedinpace-paper-unstructured | a04 predicate re-keyed to INPUT_FEATURE_COUNT and a05 to INPUT_PLATFORMS (R-52). The intent names no predicate for these, because p04 and p05 are node.upsert. |
| dunedinpace-paper-unstructured | R-15: Person person-belsky becomes D3 Publication pub-belsky-2022 (uid hu:publication:pmid-35029144; publicationKind ARTICLE, venueName, citationText; identifiers PMID 35029144, PMCID PMC8853656, DOI 10.7554/eLife.73420). Applied to asserters a01–a06 and to the intent subject plus asserterRef ×2. |
| clock-noise-vs-retest-advice | R-15: person-higgins-chen becomes pub-higgins-chen-2022 (hu:publication:pmid-36277076; PMCID PMC9586209; DOI 10.1038/s43587-022-00248-2). Applied to b04 and b05, and to intent asserterRef ×2. |
| nr-nad-compound-to-test | R-15: person-martens becomes pub-martens-2018 (hu:publication:pmid-29599478, the same uid as D11/nr-trial-jats-unstructured; PMCID PMC5876407; DOI 10.1038/s41467-018-03421-7). Applied to e03–e05, and to intent asserterRef ×2. |
| hba1c-two-labs-interference | d05 PERFORMED_BY_LAB in assertions.yaml: edgeClass changes from structural to asserted, with edgePropertiesType AssertedRecordedProperties, assertionKind RELATIONSHIP, speechAct STATES and polarity POSITIVE. basisKind changes from CALCULATED to CURATOR_CLASSIFICATION. validTime is OBSERVATION_ONLY as of the snap-labcorp capture time, 2026-10-08T17:40:00-04:00, matching d01/d02. Asserter agent-curation, locator lc-testno, derivationRule and notes are kept. A closeoutNote was added. |
| hba1c-two-labs-interference | intent p05-d05: kind changes from edge.structural to edge.assert, with assertion {POSITIVE, CURATOR_CLASSIFICATION, STATES, validity as above} and asserterRef agent-curation. v1 AssertionCore has no derivationRule field, so the inference rule moved into the rationale. The `notes` field was updated. |

The three intents touched for R-15 round-trip byte-identically through JSON.stringify(…, null, 2), so the script rewrote them. The hba1c intent was edited by targeted text replacement.

## After

```
lint-fixtures.mjs --fixture D4/<folder> (x7)
  errors 0 on all 7; warnings 2 (dunedinpace: predicate-proposed INPUT_FEATURE_COUNT, INPUT_PLATFORMS)
val-d4.mjs (zod IngestionIntent + Ajv 2020 over biotech-knowledge-intent.v1.json): 7/7 zod true, json true
git status final/fixtures: only assertions.yaml / intent.json in 4 D4 folders + README.md (D4 rows)
```

In the FU-03 table, the hba1c row is set to applied, and applied rows were added for clock-noise-vs-retest-advice, dunedinpace-paper-unstructured and nr-nad-compound-to-test.

## Owner-gated / recorded, not changed

- **Proposed-new predicates:** INPUT_FEATURE_COUNT and INPUT_PLATFORMS stay `proposed-new` in predicates.yaml until the D4 registrar accepts them. They account for the 2 lint warnings.
- **MD-D4-03:** nr-nad s02 keeps `assessmentSubkind: D4.test-and-sell`, because the R-55 question of one register entry versus a D4 subkind is still open. No conclusionCode was added.
- **Publication identifiers:** they are stated on the entity and the intent subject without evidence locators. There is no identifier span in locators.yaml, and this round may not change that file.

---

<!-- stage: _runlog/closeout-fixtures2-D5.md -->

# Close-out (second attempt): fixture editor (S) for final/fixtures/D5/ (FU-03)

Date: 2026-10-09. This is the recovery run after the first-round edits were wiped (repath-fixtures.mjs re-copy, coordinator reset to 31390a6).
Guide: the lost first attempt's log `_runlog/closeout-S-fixtures-D5.md`, read only as a guide. I re-applied and re-verified every edit here.
Scope: `final/fixtures/D5/<folder>/` (4 fixtures) and the D5 rows of the FU-03 table in `final/fixtures/README.md`.
Not changed: the SDL, source.md, locator quotes, snapshot digests, and any sourced value. Nothing committed.
I never ran or imported `repath-fixtures.mjs`. `lint-fixtures.mjs` only reads it as text (`readFileSync`, line 62), and I ran it only in `--fixture` report mode.

## Baseline (before edits)

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D5/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| antioxidant-exercise-disconfirmation | 4 | 0 | edge-property ×4 (`orderIndex` on OPERATIONALIZED_BY, now AssertedRecordedProperties) |
| pregnancy-magnesium-upper-limit | 1 | 0 | enum-value ×1 (`computedNotStored.Q-D5-06.verdict: ABOVE`) |
| sirolimus-label-interactions-harm | 0 | 14 | retired-name ×14 (`supersedesUid`) |
| sleep-toolkit-unstructured | 3 | 0 | retired-name ×3 (`Mention`) |
| **total** | **8** | **14** | **22 violations** |

Intent validation used a scratch, read-only copy of the `_work/validate-intents.mjs` method: zod `IngestionIntent` plus Ajv 2020-12 over `packages/contracts/json-schema/biotech-knowledge-intent.v1.json`. Script: `<scratchpad>/d5/vintent.mjs`, which writes nothing. Result before edits: 4/4 valid.

Edit sources:
- The FU-03 rows for D5: F-05; R-23; R-09/R-27 + R-82.
- The D5 edit-fixture ops in rulings.yaml: R-23 and R-35.
- predicates.yaml: no D5 fixture uses an alias, retired or proposed predicate, so nothing needed re-keying. The lint reports no predicate-* violation.
- D5 rulings that touch fixture data and that the lint surfaced or the task lists: R-26 (OPERATIONALIZED_BY asserted), R-15 (multi-author asserter) and R-80 (AUTHORED_BY).

## Edits

### sirolimus-label-interactions-harm

**R-23** (same-asserter supersession only):
- assertions.yaml:
  - Dropped `supersedesUid` on r01-v22-grapefruit and r04-v22-cbd-monitor. These Mylan records had pointed at Greenstone LLC records.
  - r00-v14 and r03-v15: status SUPERSEDED → PROPOSED, and `recordedTo` removed (R-24: recordedTo never fakes time). Their notes now say they leave "current" answers when their SPL label-version state episode closes. That episode is not built in this fixture.
  - Rewrote the 2 derived RESOLVES_TO_CONSTRAINT `asOfNote`s.
  - `labelVersionChange.supersessionChains` is now `[]`, with a `supersessionNote` and `labelerChangePairs` (the same pairs).
- intent.json:
  - 14 occurrences of `supersedesUid` removed: 2 `supersedesUid=` values in proposal rationales, 11 "cannot carry …/supersedesUid" phrases, and 1 in the notes. The lint had flagged 12 of them.
  - The notes now state R-23.
- questions.md:
  - Rewrote Q-D5-26: no supersession chains.
  - Aligned the stale UseConstraint uids in Q-D5-23 / Q-D5-24 with the assertions.yaml use-constraint-key/v2 uids. These are fixture-minted, not sourced: f6cf8fda…→e6da92cd…, 929b2183…→7813a0a6… (×2), c5a139b7…→4b268301…, 88af9983…→b70287a2….

**R-35:** 2 snapshots in locators.yaml, EXTRACTED_TEXT_BYTES → TOOL_RENDITION. intent.json was already TOOL_RENDITION.

### antioxidant-exercise-disconfirmation

- **F-05:** the x06 note no longer names an extra ClaimOccurrence label.
- **R-26:** the 4 structural OPERATIONALIZED_BY rows are now `edges.asserted`. Each carries AssertedRecordedProperties (relationshipUid, assertionUid, recordedFrom, lastWriterRunId); `orderIndex` was dropped. New Assertions o01–o04 authorize them:
  - asserter: Agent `hu:agent:ks-curation` (new entity, AUTOMATED_AGENT)
  - basisKind: CURATOR_CLASSIFICATION
  - recorded time only (no validity)
  - evidence: the former rationale locator
  - intent: edge.structural ×4 → edge.assert with asserterRef `agent-ks-curation` (new Agent subject).
- **R-15:** the first-author Person asserters are replaced by D3 Publications:
  - Ristow (x01–x03) → `hu:publication:doi-10.1073-pnas.0903485106`
  - Paulsen (x04, x05) → `hu:publication:doi-10.1113-jphysiol.2013.267419`
  - Titles, venue and PMID / DOI / PMCID are taken as printed in source.md.
  - The Person entities and intent subjects were replaced. The bylines stay in locators l09 / l17.
  - questions.md Q-D5-01 / Q-D5-02 updated.
- **R-35:** 1 snapshot (btsa) → TOOL_RENDITION in locators.yaml. intent.json was already TOOL_RENDITION.

### pregnancy-magnesium-upper-limit

- `computedNotStored.Q-D5-06.verdict: ABOVE` → `doseVsLimit: ABOVE`, plus a note. It is the pattern's computed string column, not a stored SemanticVerdict. questions.md Q-D5-06 / Q-D5-21 wording aligned.
- questions.md Q-D5-13: PROTOCOL_AUTHORED_BY → AUTHORED_BY (R-80).
- R-35: 2 snapshots → TOOL_RENDITION.

### sleep-toolkit-unstructured

- **R-09/R-27:**
  - Both `mention.stage` proposals removed from intent.json (50 → 48 proposals).
  - "most sleep medications" binds no assertion. Its surface form stays in locator l24-step11 (a07 note, questions.md Q-D5-02).
  - The "overly intense dreams" Condition that a04 binds to gets a RESOLUTION Assessment, `hu:assessment:d5-sleep-res-overly-intense-dreams`: evidence l18 / l33, role CONTEXT, status PROPOSED, no D2 code asserted. It has kernel ASSESSES and HAS_EVIDENCE rows (EvidenceEdgeProperties role / origin).
  - The Condition's name no longer says it was staged.
- **R-82:** a10 RECEIVES_VALUE_FROM NEGATIVE → DISCLOSES_INTEREST NEGATIVE / DENIES, in assertions.yaml, intent.json (relationshipType, predicate, rationale, notes) and questions.md Q-D5-13.
- **R-35:** 1 snapshot → TOOL_RENDITION.

## After

```
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/antioxidant-exercise-disconfirmation   # errors 0, warnings 0
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/pregnancy-magnesium-upper-limit        # errors 0, warnings 0
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/sirolimus-label-interactions-harm      # errors 0, warnings 0
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/sleep-toolkit-unstructured             # errors 0, warnings 0
node <scratchpad>/d5/vintent.mjs   # 4/4 zod true, JSON Schema true (proposals 10, 89, 11, 48)
python -I yaml.safe_load over the 8 assertions/locators files   # all parse
```

- Lint: 22 → 0 (errors 8 → 0, warnings 14 → 0).
- No owner-gated item remains for D5.
- FU-03 table: D5 rows for antioxidant, pregnancy (new row), sirolimus and sleep set to "applied 2026-10-09 … owner-gated: none". The edit was targeted: it re-read the table first and replaced only the D5 lines.

## Gaps recorded (no schema change proposed)

- intent v1 has no Assessment proposal kind, so the sleep RESOLUTION Assessment lives in assertions.yaml only (intent notes item 5).
- sirolimus: the R-23 "leaves current when the label-version episode closes" behaviour cannot be shown structurally, because the fixture has no label-version state episode for SPL v14 / v15 / v22. Notes document the as-of exit.
- Pattern owners' items, not fixture data:
  - Q-D5-13's assertion branch still names RECEIVES_VALUE_FROM NEGATIVE.
  - Q-D5-26 reads supersession chains.
  - The fixture answers now follow R-82 / R-23.

---

<!-- stage: _runlog/closeout-fixtures2-D6.md -->

# Close-out (recovery, second attempt): fixture editor (S) — final/fixtures/D6

2026-10-09. Re-applies FU-03 for the seven D6 copies after the coordinator reset `final/fixtures/` to 31390a6. Guide:
`_runlog/closeout-S-fixtures-D6.md` (lost first attempt). No SDL change; nothing committed; repath-fixtures.mjs not run
or imported (lint-fixtures.mjs reads its RESIDUAL list as text only). Research only, not medical advice.

## Inputs re-checked

- FU-03 rows D6/* in `fixtures/README.md`: filing-channels (R-09/R-27 Mention ×2), label-versions / prepared-food /
  proprietary-blend / recall-moringa (R-30 verbatim fields; prepared-food also questions.md L5).
- `_work/rulings.yaml` module D6: no `op: edit-fixture`; R-30 `remove-field` ComponentLineProperties is the structural edit.
  R-62 / R-68 / R-73 renames were already in the baseline copies.
- `vocabularies/predicates.yaml`: 38 entries reference `final/fixtures/D6/`, all `registered` (no alias-of / retired-by
  re-key). The K / D10 / D1 / D2 / D12 re-keys of the brief do not touch D6 fixtures.

## Baseline (`node C:/…/final/_work/lint-fixtures.mjs --fixture D6/<folder>`)

```
filing-channels-niagen-10k          2  {retired-name 2}
label-versions-truniagen-dsld      48  {edge-property 24, retired-name 24}
offer-roles-price-kinds-truniagen   0
prepared-food-bigmac-mcdonalds     72  {edge-property 36, retired-name 36}
proprietary-blend-ag1              40  {edge-property 20, retired-name 20}
recall-moringa-mogo                 8  {edge-property 4, retired-name 4}
retailer-reformulation-claim-iherb  0
total 170 errors, 0 warnings
```

Pre-edit copy: scratchpad `d6-backup2/` (identical to the first attempt's `d6-backup/`).

## Edits

1. filing-channels-niagen-10k/assertions.yaml ch2 (sed): two `edge: "Mention staged, unresolved …"` → `edge: "none:
   unresolved surface form (no named organization), so no derived MENTIONS edge; R-09/R-27 stage no surface-form node …"`.
   Surface forms and offsets unchanged; intent.json had no Mention.
2. R-30 (scratch `r30-d6.mjs`, writes only under final/fixtures/D6/): each `declaredNameVerbatim` / `formVerbatim` /
   `statementVerbatim` edge property removed and prepended to the authorizing Assertion's `qualifiers` as
   `declaredName:'…'` / `form:'…'` / `statement:'…'` (values unchanged; script re-parses and checks the YAML equals the
   original minus fields plus qualifiers, and that each intent proposal `p-<id>` matches YAML Assertion `<id>`).
   intent.json: v1 has no assertion.qualifiers (OD-09) → fields removed from edgeProperties, qualifiers appended to the
   proposal `rationale`.
   ```
   label-versions 12 fields / 9 Assertions / 12 intent fields; prepared-food 18/14/18; proprietary-blend 10/10/10;
   recall-moringa 2/1/2  → 42 fields on 34 Assertions
   ```
3. prepared-food questions.md L5 (Q-D6-10 path): `DECLARES_COMPONENT.statementVerbatim` → the DECLARES_COMPONENT
   authorizing Assertion's `statement:` qualifier (R-30).

Edits applied: 1 + 42 YAML / 42 intent field moves on 34 Assertions + 1 questions path = 4 folders R-30, 1 folder R-09/R-27.

## After

```
lint-fixtures.mjs --fixture D6/<folder>  → all 7: 0 errors, 0 warnings   (170 → 0)
sha256sum -c d6-frozen.sha256 (14 source.md + locators.yaml) → all OK
val-d6.mjs (zod IngestionIntent + Ajv2020 biotech-knowledge-intent.v1.json) → all 7 intent.json zod true, json true
grep declaredNameVerbatim|formVerbatim|statementVerbatim in D6 (excluding source.md) → 0
```

README FU-03 rows D6/* (5) set to "applied …; owner-gated: none" (targeted line replacement, file re-read before write).
`_work/intent-validation.json` not regenerated (shared file).

## Left for others / notes

- D6 retrieval patterns still read the removed R-30 fields (Q-D6-01, CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-10, Q-D6-11) —
  pattern-owner edits, not fixture edits.
- Frozen source.md prose still names old terms (filing-channels: MANUFACTURER_STATEMENT; label-versions: "Mention m01",
  ComponentLineProperties verbatim description); not edited by rule, lint does not scan source.md.

---

<!-- stage: _runlog/closeout-fixtures2-D7.md -->

# Close-out (second attempt): fixture editor (S), final/fixtures/D7/ (FU-03), 2026-10-09

This is the recovery round. The coordinator reset `final/fixtures/` to 31390a6 after `repath-fixtures.mjs` was run during the
first round, so the D7 folder started unedited. I used the lost first attempt's log (`_runlog/closeout-fixture-editor-D7.md`)
as a guide and re-applied and re-verified every edit myself.

Scope:
- Changed: `final/fixtures/D7/<folder>/{assertions.yaml,intent.json}` and the six D7 rows of the FU-03 table in `fixtures/README.md`.
- Not changed: source.md, locators.yaml, questions.md, snapshot digests, sourced numbers, identifiers and quotes, and the SDL.
- Not committed.
- Not run, imported or required: `repath-fixtures.mjs`, `validate-intents.mjs` and `lint-fixtures.mjs --baseline`. I only read them as text.

## Inputs

- The FU-03 table rows for D7:
  - attia, bioage, elysium, niagen and sinclair: R-30.
  - attia and ftc: R-55.
- `_work/rulings.yaml` `modules.D7` has no `edit-fixture` op.
  - R-92 (FINANCING_AMOUNT and the related predicates) has 0 uses in D7.
  - R-21 "bioage" refers to D13, not D7.
- `predicates.yaml`: no alias, retired or unregistered predicate is used in D7. The baseline has 0 `predicate-*` violations.
- Cross-cutting rulings I checked by hand:
  - R-15 (elysium asserters).
  - R-09/R-27 (the sinclair `mentions:` section and the `mention.stage` proposals).
  - R-23, R-44, R-47, R-49, F-05 and R-43: grep found no supersedesUid, HAS_REVISION_STATUS, nNoChangeContexts, OTHER discourse Assessment, ClaimOccurrence or RENDITION_OF in D7.

## Baseline lint

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D7/<folder>
```

| fixture | errors | warnings | categories |
|---|---|---|---|
| attia-cgm-dexcom-recommendation-interest | 12 | 0 | edge-property 6, retired-name 6 |
| bioage-group-vehicles-stale-role | 24 | 0 | edge-property 12, retired-name 12 |
| elysium-paper-funding-award | 4 | 0 | edge-property 2, retired-name 2 |
| ftc-ameribev-paid-dieticians-harm | 0 | 0 | — |
| niagen-ownership-brand-history | 32 | 0 | edge-property 16, retired-name 16 |
| sinclair-self-disclosure-unstructured | 34 | 0 | edge-property 17, retired-name 17 |
| **total** | **106** | **0** | all R-30 |

## Edits

1. **R-30** (scratch script `<scratchpad>/r30-d7.mjs`; dry run first, then `--write`).
   - In assertions.yaml, `roleTitleVerbatim` and `stakeClassVerbatim` are removed from the HOLDS_ROLE and HOLDS_STAKE edge properties. The value moves unchanged into the first qualifier of the authorizing Assertion, written `roleText:'…'` or `stakeClass:'…'`.
     - This is the same quoting as the D6 and D9 editors and the existing D7 e-12..e-14 qualifiers.
     - Assertions that had no qualifiers got a new `qualifiers:` line: bioage b-02 and b-06; niagen n-04, n-05, n-07 and n-08.
   - In intent.json, the field is removed from `edgeProperties` and the qualifier is put at the head of `rationale` (v1 AssertionCore has no qualifiers).
   - The script checks its own output:
     - The parsed YAML must equal the original minus the removed fields plus the added qualifiers.
     - The intent qualifier must match the YAML qualifier for each proposal.
   - Counts (assertions / intent): attia 3/3, bioage 6/6, elysium 1/1, niagen 8/8, sinclair 9/8 (a-13 is held and is not in the intent). Total 27/26.
2. **R-15** elysium-paper-funding-award.
   - New entity `hu:publication:pmid-38241160`: type Publication, module D3, seam.
     - The name is the `loc-jats-title` quote.
     - `publicationKind` is ARTICLE (source.md: Neurotherapeutics journal article).
     - The identifiers are PMID/NLM, PMCID/NLM and DOI/Crossref, as printed in e-04's object.
   - In the intent, this is the new subject `publication.pmid-38241160`.
   - Asserters changed to the Publication:
     - e-01..e-03 were `{source: "PMC10903100 authors"}` and had no asserterRef in the intent.
     - e-04 and e-12..e-14 were the corresponding author "standing in for the author group".
   - e-05..e-07 (competing interests of named authors) stay with the named Person, per R-15 bullet 3.
   - Each changed proposal's rationale ends with "R-15: …".
3. **R-09/R-27** sinclair-self-disclosure-unstructured.
   - The `mentions:` section is removed (m-fd-sinclair, m-insidetracker) and replaced by a comment.
   - as-res-01:
     - `inputMentions` becomes `facets: ["surfaceForm=David Sinclair", "typeHint=Person"]`.
     - The `loc-fd-sinclair-name` evidence role changes from SUPPORTS to CONTEXT (SDL Assessment docstring, lines 918–920).
   - Reworded: a-13 `via` and the Segterra entity note.
   - intent.json: the two `mention.stage` proposals are removed (14 → 12).
   - InsideTracker had no binding resting on it, so no Assessment is needed (R-27). Its surface form stays at `loc-sin-insidetracker`.
4. **R-55**:
   - attia `disclosureFinding=DISCLOSED_IN_LATER_REVISION` is in the decision-report list, so it is unchanged.
   - ftc `INADEQUATE_DISCLOSURE_PER_REGULATOR` is in the D7 list (seams.yaml `d7Values`), so it is in the "union" rule. It is not in the five-value decision-report list, and D9 spells it `INADEQUATE_PER_REGULATOR` (seams.yaml `openIssue`).
     - I kept it, because there is no ruled mapping and no `final/vocabularies` file for D7.conflict-relevance yet. It is **owner-gated** (vocabulary editor with D9).
5. Bookkeeping: each edited fixture has a header comment (assertions.yaml) and an addition to `notes` (intent.json) that record the close-out.
   - The prose avoids retired tokens, because the residual scan reads non-comment text.
   - My first wording "no Mention node" in a YAML note and in the intent notes tripped `retired-name` (2 errors on sinclair). I reworded it to "no surface-form node (R-09)".

## Checks

```
lint-fixtures.mjs --fixture D7/<folder>   (×6)
# every D7 fixture: errors 0, warnings 0      (before: 106 errors, 0 warnings)
node <scratchpad>/val-d7.mjs              # zod IngestionIntent + Ajv 2020 biotech-knowledge-intent.v1.json (+ajv-formats), read-only
# attia 6, bioage 8, elysium 14, ftc 4, niagen 20, sinclair 12 proposals: zod true, jsonSchema true for all 6
YAML.parseDocument on the 6 assertions.yaml -> 0 errors, 0 warnings
JSON.stringify(parse(intent), null, 2) + "\n" === file  -> true for all 6 (format preserved)
```

## README

I updated the six D7 rows of "Residual non-final names and pending ruling edits":
- Column 2 is now "—".
- Column 3 is now "applied (close-out FU-03, 2026-10-09): …".

Method:
- The script matched only lines that start with `| D7/<folder> |`.
- It re-read the file just before writing and asserted the content had not changed, because other editors edit other rows concurrently.
- Line endings stay LF, as at HEAD.

The only remaining owner-gated item is the ftc R-55 value.

## Open items (reported, not acted on)

- The pattern writer noted (closeout-S-patterns-D7.md) that the attia fixture writes no D9 MediaWork, OCCURS_IN or RENDITION_OF.
  - Because of that, Q-D7-06 and CQ-CL-05 take the snapshot fallback (R-19).
  - This is not in the FU-03 table. Adding a container would be new content, not a ruling re-key, so I did not add it. It goes to the coordinator or the D7/D9 owners.
- The elysium JATS snapshot is not linked to the new Publication by RENDITION_OF (R-43 asserted).
  - Writing that link needs an asserter choice (the publisher, or Europe PMC as relayer) that the fixture does not state.
  - I recorded this in the entity note and did not invent the link.

---

<!-- stage: _runlog/closeout-fixtures2-D8.md -->

# Close-out (recovery, 2nd attempt): fixture editor (S), final/fixtures/D8 — FU-03 (2026-10-09)

Scope: `final/fixtures/D8/<folder>/` (6 fixtures) and the D8 rows of the FU-03 table in `final/fixtures/README.md`. SDL
unchanged (candidate sha256 c7cf1235…4793). Nothing committed (the coordinator commits). The folder was reset to 31390a6
before this round; the lost first attempt's log `closeout-fixtures-D8.md` was used as a guide and every decision re-checked.
`final/_work/repath-fixtures.mjs` was never run or imported (only read with grep; `lint-fixtures.mjs` reads its RESIDUAL
array as text, checked at lines 62-65). Only `lint-fixtures.mjs --fixture D8/<folder>` (print-only mode) was executed from
`_work/`. source.md and locators.yaml: sha256 of all 12 files recorded before and re-checked after (`sha256sum -c`, 12 OK).
Research only, not medical advice.

## What applies to D8

| source | D8 items |
| --- | --- |
| FU-03 table | eurofins-coa-quantity-by-input: R-16; nmn-us-exclusion-reversal: R-23 supersedesUid residual (assertions.yaml 592, intent-step2.json 651, questions.md 8) |
| `_work/rulings.yaml` D8 `edit-fixture` | R-16 only. R-73 `request-fixture` (COVERS → ProductVariant; STATUS_OF → Product) needs new sources: tracked as FX-02 / FX-03 in open-questions.md, not an edit |
| `_work/rulings.yaml` D8 `edit-question` touching fixture text | R-08 CQ-PF-03 → CQ-PF-03a (certification-listing questions.md row label) |
| `vocabularies/predicates.yaml` alias-of / retired-by / fixtureEdit | none for D8 fixtures (lint 0 predicate-alias, 0 predicate-retired; the only fixtureEdit rows naming D8 are D10 fixtures' re-keys to D8 predicates) |
| other typical rulings (R-09/27, R-15, R-30, R-44, R-47, R-49, R-55, R-58, R-68, R-82, R-85, F-05) | grep of all D8 fixture files: no occurrence. Residual old SpecComparator value (R-57) found in eurofins questions.md prose |

## Baseline

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D8/<folder>   (x6)
certification-listing-lot-scope 0/0; eu-nrcl-authorisation-data-protection 0/0; eurofins-coa-quantity-by-input 0/0;
imu-tek-warning-letter-recall 0 errors / 2 warn (predicate-proposed CLAIMS_THERAPEUTIC_EFFECT, assertions.yaml 466 + intent.json i12);
nmn-us-exclusion-reversal 0 errors / 2 warn (retired-name supersedesUid, assertions.yaml 592, intent-step2.json 651);
us8197807-claims-held-invalid 0/0.   Total: 0 errors, 4 warnings.
```

## Edits (scratch scripts in the session scratchpad, exact count-checked text replacements; LF kept)

1. **R-16, eurofins-coa-quantity-by-input** (`edit-eurofins.mjs`):
   - assertions.yaml c08–c15 (contrast COA lot 2404101ORA: QUALITY_RESULT_FOR x3, MEASURES_ANALYTE x3, LOT_OF, LOT_EXPIRY_AS_PRINTED):
     asserter `agent-a7` (Agent) → `elite` (D7.Organization, Elite Source Products, Inc.; entity already declared). R-16 rule 1
     lists "Manufactured for" as a presented issuer; locator loc-as-mfr quotes "Manufactured for: Elite Source Products, Inc.".
     The free-text qualifier ("'Manufactured for' names the brand owner, which is not the issuer") → a `note:` citing R-16
     rule 1 (8x). No `asserterBasis` qualifier (rule 1 needs none). No ISSUED_BY added: the COA names no laboratory and no
     signatory (not invented).
   - intent.json: `asserterRef` agent-a7 → elite (8x), rationale reworded (8x), new subject `elite` (Organization,
     use_existing), `notes` updated. Eurofins rows c01–c07 were already asserted by Eurofins. The two D8.coa-classification
     QUALITY assessments stay with the agent (R-16 rule 3); the agent subject stays declared in intent.json.
   - questions.md Q-D8-09: "(NOT_MORE_THAN 0.5 µg)" → "(`specComparator LTE` 0.5 µg; R-57 QuantityComparator)" — the
     assertions already use LTE. Q-D8-05 "issuer not stated" kept (true for the laboratory issuer).
   - source.md prose about agent-asserted contrast rows left as is (source.md frozen).
2. **R-23, nmn-us-exclusion-reversal**: n14 (`supersedes: n04`) and n04 are both asserted by FDA (`ref: fda`) → same-asserter
   supersession, kept. assertions.yaml n14 note and intent-step2.json n14 rationale: "(supersedesUid)" → "(R-23 checked: n04
   and n14 are both asserted by FDA, a same-asserter supersession, kept)". intent v1 cannot carry the link (OD-09).
   questions.md Q-D8-01 keeps "n14 names it in supersedesUid" (correct kernel field use; questions.md is not linted).
3. **R-08, certification-listing-lot-scope** questions.md: row label "CQ-PF-03" → "CQ-PF-03a (packet id CQ-PF-03; R-08)".
4. Checked and kept under R-16 rule 3 (BellLabs statements): eu-nrcl e08 (ENTRY_INTO_FORCE_COMPUTED, CALCULATED), nmn n09
   (CITED_TRIAL_ID_AS_PARSED, research-stage parser reading, expected REJECTED).

## Verification

```
node <scratchpad>/d8/validate-d8.mjs   (zod IngestionIntent + Ajv 2020-12 over packages/contracts/json-schema/biotech-knowledge-intent.v1.json
                                       with ajv-formats@3.0.1, as _work/validate-intents.mjs; writes nothing)
  7/7 D8 intent files: zod ok, jsonSchema ok (eurofins intent.json: 22 proposals, 17 subjects)
lint-fixtures.mjs --fixture D8/<folder> (x6):
  0 errors; 2 warnings, both imu-tek predicate-proposed CLAIMS_THERAPEUTIC_EFFECT (assertions.yaml 466, intent.json i12)
sha256sum -c frozen-before.sha  -> 12 OK (6 source.md + 6 locators.yaml)
git diff --stat fixtures/D8: 6 files, +53 / -61
```

Lint: 0 errors / 4 warnings → 0 errors / 2 warnings.

Remaining, owner-gated (already recorded in open-questions.md, no new entry needed):
- MD-X-03(a): imu-tek i12 `CLAIMS_THERAPEUTIC_EFFECT` is proposed-new (registrar D6); its candidate IMPROVES_TARGET /
  INTENDED_FOR_TARGET with claimClass DISEASE_CLAIM (R-83) awaits the registrar; not re-keyed.
- MD-X-03(c): us8197807 `ORGANIZATION_RENAMED` (D8) vs D7 `FORMER_NAME` duplicate (registered; no lint hit).
- FX-02 / FX-03 (R-73 request-fixture): new D8 fixtures need new sources (NSF variant listing; LNHPD NPN licence).

## README

`fixtures/README.md` FU-03 table: rows D8/eurofins-coa-quantity-by-input and D8/nmn-us-exclusion-reversal → applied; row
D8/imu-tek-warning-letter-recall added (owner-gated MD-X-03(a)). Edited by a line-prefix script that re-reads the file
right before writing; no other rows touched.

---

<!-- stage: _runlog/closeout-fixtures2-D9.md -->

# Close-out (second attempt): fixture editor (S), packet D9, 2026-10-09

Closes FU-03 for `final/fixtures/D9/*` (6 fixtures) after the coordinator reset `final/fixtures/` to 31390a6. Structural
edits only. No SDL change. `source.md`, `locators.yaml`, snapshot digests and every sourced number, identifier and quote
are unchanged: the sha256 of the 6 `source.md` and 6 `locators.yaml` files was taken before editing and checked after
(`sha256sum -c`: all OK), and `git diff` on them is empty. Nothing committed. Research only, not medical advice.

Guide: the lost first attempt's log `_runlog/closeout-fixture-editor-D9.md`. Its decisions were re-applied and checked
again against the rulings. One addition: R-15 author competing-interest rows in rapa (see below).

Safety: `repath-fixtures.mjs` and `validate-intents.mjs` were read as text only, never run or imported. `lint-fixtures.mjs`
was checked first: in `--fixture` mode it reads `repath-fixtures.mjs` as text (readFileSync) and writes nothing. It ran
only with `--fixture D9/<folder>`. All edit scripts are in the scratchpad (`r30-d9.mjs`, `r43-d9.mjs`, `hdr.mjs`,
`readme-d9.mjs`) and write only under `final/fixtures/D9/` or to the six D9 rows of `fixtures/README.md`. The intent
validator `val-d9.mjs` (zod IngestionIntent from packages/contracts/dist plus Ajv 2020 with ajv-formats against
biotech-knowledge-intent.v1.json, the same method as validate-intents.mjs) is read-only.

## Inputs

- `fixtures/README.md` FU-03 rows D9/*: R-30, R-43, R-49, R-55 and F-05.
- `vocabularies/predicates.yaml`: the only D9 fixtureEdit is the INCREASES_LEVEL alias, which re-keys to INCREASES_LEVEL_OF (D2).
- `_work/rulings.yaml` modules.D9: the edit-fixture op is R-49. The edit-text ops are R-55 (re-key to the merged
  disclosureFinding list) and R-15. R-43 is a change-edge-properties op.
- `decision-report.md` R-15, R-43, R-49, R-55; `seams.yaml` D7.conflict-relevance (disclosureFinding d7Values ∪ d9Values).
- I grepped D9 for the other typical rulings and found nothing to change. These include Mention (R-09/R-27; the `mention.stage`
  proposals are the contract's staging kind and write no Mention node), supersedesUid, HAS_REVISION_STATUS,
  nNoChangeContexts, retired or alias predicates other than INCREASES_LEVEL, and R-82 NEGATIVE value rows.

## Baseline

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D9/<folder>   (x6)
hl52 8 err / 2 warn; hl-essentials 4 / 0; lifespan 1 / 0; longecity 0 / 0; rapa 4 / 12; sinclair 48 / 0
TOTAL 65 errors, 14 warnings
val-d9.mjs: 6/6 intent.json zod true, jsonSchema true; 6/6 assertions.yaml YAML.parse ok
```

## Edits (assertions.yaml and intent.json kept consistent)

| fixture | edit |
| --- | --- |
| sinclair | R-30: 15 `roleTitleVerbatim` / `stakeClassVerbatim` edge fields became `qualifiers: ["roleText:'…'"]` / `["stakeClass:'…'"]`. In the intent, 9 proposals drop the field, and the qualifier goes into `rationale` (v1 AssertionCore has no qualifiers). R-55 cr-o5: DISCLOSED_IN_CONTAINER_PARTIAL became DISCLOSED_IN_CONTAINER, with "partial" kept in the text; DISCLOSED_ELSEWHERE_LATER_ONLY became DISCLOSED_IN_LATER_REVISION. The cr-o4 values were already merged values. In questions.md, the Q-D9-03 expected findings were re-keyed. |
| hl52 | R-43: s-ren-web and s-ren-audio are asserted by the feed publisher org-scicomm (basisKind UNSTATED; RSS `<link>`, r5 / enclosure r3, r9). s-ren-yt is asserted by the BellLabs curation agent (CURATOR_CLASSIFICATION, linkBasis BELLLABS_MATCH; the full join basis is kept as `note`). Each row has `edgePropertiesType: AssertedRecordedProperties` and recorded time only. The 3 intent proposals changed from edge.structural to edge.assert, and the intent gained a new Agent subject `agent-curation`. R-30: d7-it-board and d7-it-lead now carry roleText: qualifiers. F-05: the section comment no longer names a ClaimOccurrence label. |
| hl-essentials | R-43: s-ren-ess is asserted by org-scicomm (RSS enclosure e6). s-ren-ess-yt (BELLLABS_MATCH) and s-ren-nmn (a single-page work minted from the capture) are asserted by the curation agent, which the intent already had. 3 intent proposals changed to edge.assert. Alias: INCREASES_LEVEL became INCREASES_LEVEL_OF on o8 and ret-nmn-double (assertions + intent). R-49: the interim `assessmentKind: OTHER` Assessment ind-nmn was removed. A new top-level `expectedProjections:` block pc-nmn-discourse takes its place, with the Claim cache values discourseIndependentCount 1, discourseFirstHandCount 2, discourseRetellingCount 1, discourseRecutCount 1, discourseFirstOccurrenceAt 2021-12-27T09:00:00Z and discourseMethodVersion discourse-independence/v1. These values carry over the interim facets, and discourseDerivedAt is left to the projection run. questions.md CQ-CL-06 now reads the cache. |
| lifespan | R-43: s-ren-audio is asserted by the feed publisher org-lscomm (enclosure f9). R-55 cr-sponsors: the Athletic Greens `NOT_FOUND` facet became NOT_FOUND_IN_COMPLETE_CAPTURE (v0, the digest-checked copy nearest before T), plus DISCLOSED_IN_LATER_REVISION (g1, added in (2024-06-22, 2024-08-28]). R-58 o-correct: amountReferent ACTIVE_INGREDIENT (not an AmountReferent value) became AS_NAMED. The printed wording "the active ingredient in the capsules" is kept in the qualifier and the intent rationale. |
| longecity | R-43: s-ren is asserted by the curation agent. The intent proposal changed to edge.assert, with a new Agent subject. |
| rapa | R-43: s-ren is asserted by the curation agent, with a new Agent subject. R-30: d7-mk-ceo now carries a roleText: qualifier. R-15: ret-grip, ret-safety, ret-conclusion and ret-stance are now asserted by the three-byline MediaWork w-art (was p-attia; "never the first of several"). In the intent, asserterRef changed to w-art for ret-grip and ret-stance. Also under R-15 ("statements about individual authors stay asserted by the named D7 Person", as the D10 editor applied it): d7-mk-ceo and d7-mk-equity are now asserted by p-kaeberlein, and d7-bs-founder and d7-bs-adrevenue by p-stanfield (was pub-rapaex; the identity rests on res-initials). The intent d7-mk-ceo asserterRef is now p-kaeberlein. questions.md Q-D9-10 wording was updated. |
| all 6 | A `# Close-out 2026-10-09` header comment in assertions.yaml, and one sentence appended to each intent `notes`. The notes avoid the retired field names, because the residual scan reads intent.json string values. |

Edit counts: R-30 18 YAML rows plus 12 intent proposals. R-43 9 YAML rows plus 9 intent proposals plus 3 Agent subjects. R-55 3 facet values (2 re-keyed in sinclair, 1 split into 2 in lifespan) plus 1 questions line. R-49 1 Assessment removed, 1 projection block and 1 questions line. Alias re-key 2 YAML plus 2 intent. R-15 8 YAML asserters plus 3 intent asserterRefs plus 1 questions line. R-58 1 YAML plus 1 intent. F-05 1 comment.

## Validation

```
node <scratchpad>/val-d9.mjs
  6/6 intent.json zod true, jsonSchema true; 6/6 assertions.yaml YAML.parse ok
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D9/<folder>   (x6)
  hl52 0 err / 2 warn (predicate-proposed QUALIFIES); hl-essentials 0 / 0; lifespan 0 / 0; longecity 0 / 0;
  rapa 0 / 12 (predicate-proposed ADJUSTED_MEAN_DIFFERENCE, CHANGE_DIFFERENCE, SERIOUS_ADVERSE_EVENT_REPORTED,
  SAFETY_FINDING_REPORTED, REPORTS_CONCLUSION, INTERPRETS_RESULT); sinclair 0 / 0
  TOTAL 65 errors -> 0; 14 warnings -> 14 (all predicate-proposed, registrar-gated, MD-X-03 a)
sha256sum -c (6 source.md + 6 locators.yaml): all OK
```

An intermediate run gave 3 retired-name errors. They came from the new intent `notes` sentences, which named the removed
fields, and were fixed by rewording the notes.

I did not regenerate `_work/intent-validation.json` or `_work/fixture-lint-baseline.json`; they are shared files.

## README

In the `fixtures/README.md` FU-03 table, only the six `| D9/<folder> |` rows were replaced. The script re-reads the file
just before writing and asserts exactly 6 matches; other editors' rows are untouched. The acceptance-gate bullet (line 9)
still says the D9 fixtures carry the interim OTHER assessments. It is shared text, left for the coordinator.

## Open (not lint items; recorded, not changed)

- The D9 conflict-relevance Assessments (sinclair cr-o5 / cr-o4, lifespan cr-sponsors) still use `relevanceLevel=` and
  D9-style `relevanceBasis=` / `hostInterestInSponsor=` facets. They do not use the D7.conflict-relevance `conclusionCode`
  (DIRECT | INDIRECT | NOT_RELEVANT | UNDETERMINED) or the D7 relevanceBasis codes. These are judgment values for D7 with D9.
- The merged disclosureFinding list has no "partial in container" value, and the `completeness` facet has no published
  values. cr-o5 keeps "partial" in the text.
- hl-essentials source.md still names ind-nmn and "independence assessment". source.md is frozen.
- INCREASES_LEVEL_OF is a relationship predicate (object Biomarker / ChemicalSubstance / …). o8 and ret-nmn-double stay
  literal (2 fold), with the NAD referent in the `measure:` qualifier. A NAD object node was not added, because the
  edit is a name-only alias re-key.
- intent v1 gaps are unchanged. v1 has no Assertion qualifiers (R-30 and R-43 text is in the rationale), no proposal kind for assessments
  or projection-cache properties (R-49 cache only in assertions.yaml), and an asserterRef doc that does not name
  MediaWork (R-15 P20 widening).

---

<!-- stage: _runlog/closeout-fixtures2-K.md -->

# Close-out (recovery, 2nd attempt): fixture editor (S) for final/fixtures/K/ (FU-03), 2026-10-09

Scope: `final/fixtures/K/<folder>/` (6 fixtures) and the K rows of the FU-03 table in `final/fixtures/README.md` only.
No SDL change (candidate sha256 c7cf1235…4793 untouched). No commit. No script other than `lint-fixtures.mjs --fixture K/<f>`
(read-only report mode) was executed from `final/_work/`; `repath-fixtures.mjs` was read as text only (grep/sed).
source.md, locators.yaml quotes, snapshot digests and sourced numbers/identifiers/quotes unchanged. Research only, not medical advice.

The first attempt's log (`_runlog/closeout-fixture-editor-K.md`) holds only its header (no decisions were recorded), so
every decision below was made afresh from the FU-03 table, `vocabularies/predicates.yaml` and `_work/rulings.yaml`.

## Edit sources

- FU-03 rows (README "Residual non-final names and pending ruling edits"): hubbard (Mention prose x4, supersedesUid prose),
  resveratrol-sirt1 (supersedesUid prose; F-05 ClaimOccurrence), retracted-sah (R-44 HAS_REVISION_STATUS x12; supersedesUid
  prose), seller-claim-occurrences (supersedesUid), two-run-lineage (supersedesUid, Mention prose). identifier-crosswalk: no row.
- predicates.yaml fixtureEdit naming K: DIRECTLY_ACTIVATES alias-of ACTIVATES (FU-13; recompute propositionHash, claim-hash@0),
  OFFERS_FOR_SALE alias-of DISTRIBUTES (FU-13), MAY_IMPROVE_PROGNOSIS_OF retired-by R-83 -> IMPROVES_TARGET with a D5 Target.
- rulings.yaml modules.K: no edit-fixture op (K ops are edit-text / edit-pattern / edit-docstring).

## Commands and key outputs

### Baseline lint (read-only)

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture K/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| hubbard-2013-unstructured-to-entity | 5 | 1 | predicate-alias 2 (DIRECTLY_ACTIVATES), retired-name 4 (Mention x3, supersedesUid) |
| resveratrol-identifier-crosswalk | 0 | 0 | — |
| resveratrol-sirt1-evidence-mission | 10 | 3 | predicate-alias 10, predicate-proposed 2 (HAS_OFF_TARGET_ACTIVITY), retired-name 1 (supersedesUid) |
| retracted-sah-2017-stale-evidence | 4 | 12 | predicate-alias 2, predicate-retired 2 (MAY_IMPROVE_PROGNOSIS_OF), retired-name 12 (HAS_REVISION_STATUS x11, supersedesUid) |
| seller-claim-occurrences | 8 | 4 | predicate-alias 8 (DIRECTLY_ACTIVATES x6, OFFERS_FOR_SALE x2), predicate-proposed 2 (IS_MOST_ADVANCED_AGING_TEST), retired-name 2 (supersedesUid) |
| two-run-lineage | 3 | 2 | predicate-alias 3, retired-name 2 (supersedesUid) |
| **total** | **30** | **22** | 52 violations |

Intent validation (scratch read-only script `<scratchpad>/validate-k-intents.mjs`, same zod IngestionIntent + Ajv 2020 JSON
Schema imports as `_work/validate-intents.mjs`, writes nothing): baseline 7/7 intents zod valid, jsonSchema valid.

Proposition hashes re-checked before editing (sha256 of propositionHashInput == propositionHash): claim-general true,
claim-refined true, claim-sah true.

### Edits

(appended below as they are made)
All edits are text replacements (python / node scripts in the session scratchpad; each asserts exactly one match) or
`JSON.parse` -> edit -> `JSON.stringify(_, null, 1) + "\n"` (verified first to round-trip every K intent byte for byte).
LF line endings kept.

1. **FU-13 DIRECTLY_ACTIVATES -> ACTIVATES** (predicates.yaml alias-of; 5 fixtures): `sed -i 's/\bDIRECTLY_ACTIVATES\b/ACTIVATES/g'`
   over hubbard (assertions 1, intent 3), resveratrol-sirt1 (7, 11), retracted-sah (1, 3), seller (4, 5), two-run-lineage
   (intent 5, intent-r2 3, questions 1) = 44 hits (predicate, relationshipType, propositionHashInput, prose). 'directly'
   stays in the proposition texts; fixture ids such as `rel:fx-k-directly-activates-activemotif-r1` and claim uids unchanged.
2. **propositionHash (claim-hash@0) recomputed** = sha256 of the new propositionHashInput, re-verified after writing:
   claim-general sha256:75051446…382e -> sha256:6958c70385ec4e60bfcf165f11e3efa9ee5c32e3ce86208d887b7af8029d3449;
   claim-refined sha256:1f659796…09c7 -> sha256:57e584607a0f370db51ae136e5c6e3bf3335c4ee29d00bc0f4c6802bcf675df1;
   claim-sah sha256:cfcc0012…7891 -> sha256:f14ee133abf5496292c498951160efbee269957b49c9f6dede3559b7d4aa2c4d (item 5).
   Old hashes were referenced only in K (grep over schema/program): two-run-lineage/questions.md Q-K-28 updated.
3. **F-05** resveratrol-sirt1 assertions.yaml comment "stored label ClaimOccurrence" -> "no extra stored label, F-05";
   claim-hash-method note records the re-key and the old hashes.
4. **FU-13 OFFERS_FOR_SALE -> DISTRIBUTES** (seller a-mr-offers; assertions + intent relationshipType/predicate + questions Q-K-15).
5. **R-83 MAY_IMPROVE_PROGNOSIS_OF -> IMPROVES_TARGET** (retracted-sah a-sah-prognosis / p-a-sah-prognosis): object = new D5
   Target `hu:target:subarachnoid-hemorrhage-prognosis` (key proposed: targets 0.2.2 has none, D5 adds it = owner-gated);
   qualifiers `population:OTHER` (patients with SAH = a disease present, not a PopulationGroup code) and
   `outcomeUid:hu:condition:fx-k-subarachnoid-hemorrhage`; speechAct SPECULATES kept; new a-target-sah-measure
   OPERATIONALIZED_BY Target -> SAH Condition (AssertedRecordedProperties, CURATOR_CLASSIFICATION, status PROPOSED);
   claim-sah propositionHashInput object/predicate/qualifiers updated (item 2).
6. **R-44 retracted-sah**: a-rev-rw / a-rev-nlm / a-rev-publisher FIELD HAS_REVISION_STATUS on src-pub-page -> RELATIONSHIP
   D3 REVISES pub-notice -> pub-article (RevisionEdgeProperties.revisionKind RETRACTION; one per asserter; uids, locators,
   validTime and qualifier texts kept; publisher reason -> `reason:<text>` per the RevisionEdgeProperties docstring).
   New D3 Publications pub-article (hu:publication:fx-k-mmr-2017-7773; revisionStatus RETRACTION cache) and pub-notice
   (hu:publication:fx-k-mmr-2025-13603, RETRACTION_NOTICE); R-42: DOI/PMID (and the notice's PMCID) moved from the Sources
   to the Publications, values unchanged. R-43/R-26: five asserted RENDITION_OF (a-rend-*: page, PubMed and Crossref records ->
   their work), asserter the BellLabs extraction agent hu:agent:fx-k-extractor, CURATOR_CLASSIFICATION, CONTEXT locator
   inside each record (no new locator; locators.yaml untouched). stale-report flag, edgesExercised and questions.md
   (header, Q-K-17, Q-K-22, CQ-TM-02, Q-K-02) reworded. Intent: subjects +8 (agent resolved, 2 Publications with identifiers,
   Target, 4 Sources), p-a-rev-* -> edge.assert REVISES with edgeProperties.revisionKind, + p-a-rend-* x5,
   p-a-target-sah-measure; notes sentence replaced. 5 -> 11 proposals.
7. **R-09/R-27 prose**: hubbard intent reasons/notes, assertions comments, questions Q-K-13; two-run-lineage questions header.
8. **R-23**: the only real supersedesUid (seller a-am-occ-r2 -> a-am-occ-r1) is same-asserter (Active Motif): kept, comment added.
   All other hits were intent-notes prose ("supersedesUid" in the v1-gap list) -> "the same-asserter supersession link (R-23)".
9. **two-run-lineage consistency**: intentDigests recomputed after the intent edits (intent.json sha256:bba95dea…f0 ->
   sha256:8cf80037dca53fd8dc098b7f7024cdbc0a412a65c2cf622144532d8df5513cdb; intent-r2.json sha256:142c42a6…22 ->
   sha256:6f7ad6922c356825f65d9cb4dac7249c366726f5e36007ab5ac2dac8cb6250eb; Q-K-03 updated). lineage-index.yaml: 9 records
   of retracted-sah added in (label, uid) order, countsCreatedByRun r2 Assertion 16 -> 22, + D3.Publication 2, D5.Target 1
   (183 -> 192 records); questions Q-K-04 (r2 93 -> 102), Q-K-07 (episodes REVISES x3, RENDITION_OF x5), CQ-AX-07 (16 -> 21).

Edits applied: 9 edit groups, ~95 discrete changes across 16 K files (assertions.yaml x5, intent*.json x6, questions.md x4,
lineage-index.yaml x1). resveratrol-identifier-crosswalk: no change (clean, no row).

### Validation

- Intents: `node <scratchpad>/validate-k-intents.mjs` -> 7/7 zod IngestionIntent valid, 7/7 JSON Schema (Ajv 2020 +
  ajv-formats) valid (retracted-sah 11 proposals).
- Residual grep over K assertions/intents/questions: no DIRECTLY_ACTIVATES / OFFERS_FOR_SALE / MAY_IMPROVE_PROGNOSIS_OF /
  HAS_REVISION_STATUS / ClaimOccurrence / Mention in data fields (historical mentions remain only in comments/notes that
  record the re-key).
- Lint after (`lint-fixtures.mjs --fixture K/<folder>`):

| fixture | errors | warnings | remaining |
| --- | --- | --- | --- |
| hubbard-2013-unstructured-to-entity | 0 | 0 | — |
| resveratrol-identifier-crosswalk | 0 | 0 | — |
| resveratrol-sirt1-evidence-mission | 0 | 2 | predicate-proposed HAS_OFF_TARGET_ACTIVITY x2 (registrar D1 acceptance) |
| retracted-sah-2017-stale-evidence | 0 | 0 | — |
| seller-claim-occurrences | 0 | 3 | supersedesUid x1 (legitimate same-asserter use, R-23 checked); predicate-proposed IS_MOST_ADVANCED_AGING_TEST x2 (registrar D6) |
| two-run-lineage | 0 | 0 | — |
| **total** | **0** (was 30) | **5** (was 22) | |

### README

FU-03 table: the five K rows (hubbard, resveratrol-sirt1, retracted-sah, seller, two-run-lineage) set to "applied" with the
remaining owner/registrar-gated items; re-read immediately before a single targeted line replacement per row; no other row touched.

## Gaps / not done (for the coordinator)

- Owner-gated: D5 must add `target:subarachnoid-hemorrhage-prognosis` to the targets vocabulary (a-target-sah-measure stays
  PROPOSED until then). Registrar-gated warnings: HAS_OFF_TARGET_ACTIVITY (D1), IS_MOST_ADVANCED_AGING_TEST (D6).
- Not in K's FU-03 rows / rulings edit-fixture ops, so not applied: R-15 (K occurrences are still asserted by first-author
  D7 Persons: Howitz, Kaeberlein, Pacholec, Hubbard, Qian); applying it changes Q-K-15/21/23 answers and lineage counts.
- Frozen files still name retired predicates in prose: hubbard source.md l.17 (DIRECTLY_ACTIVATES), retracted-sah source.md
  l.21 (HAS_REVISION_STATUS); hubbard locators.yaml l.172 note. Not linted; left as captured.
- intent v1 gaps (unchanged, stated in rationales): no Assertion qualifiers (population/outcomeUid ride in the rationale),
  no evidence role for RENDITION_OF CONTEXT locators.
- two-run-lineage intent-r2 edge.close still names `rel:fx-k-directly-activates-activemotif-r1` (fixture id, kept), although
  ACTIVATES occurrences open no typed episode (pre-existing inconsistency).

---

<!-- stage: _runlog/closeout-fixture-editor-D10.md -->

# Close-out: fixture editor (S), packet D10 (FU-03)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S). Writes only under `schema/program/final/fixtures/D10/<folder>/` (assertions.yaml, intent.json), my five rows of the FU-03 table in `final/fixtures/README.md`, and this log. SDL unchanged; nothing committed. source.md, locators.yaml, snapshot digests, composed bodies and every sourced number / identifier / quote are untouched.

## Inputs

- FU-03 table rows D10/* (README "Residual non-final names and pending ruling edits"): R-15 on all five; mg-rankings `supersedesUid` ×2 (R-23 check).
- `final/_work/rulings.yaml` D10 edit-fixture ops: R-15 only.
- `final/vocabularies/predicates.yaml` alias / retired entries naming D10 fixtures (fixtureEdit): INDICATED_FOR, ASSOCIATED_WITH_ADVERSE_EFFECT, REPORTS_ADVERSE_EVENT_RATE, STATES_REGULATORY_STATUS, CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT, ARM_DAILY_DOSE, MATERIAL_MANUFACTURED_BY, DISCLOSES_ROLE_AT, DECLARES_INGREDIENT_FORM, LABEL_DECLARED_AMOUNT, LABEL_SERVING_DIRECTIONS, MAX_DAILY_SUPPLEMENTAL_AMOUNT, DISCLOSES_AFFILIATE_COMMISSION, STATES_METHOD_MAY_CHANGE.
- Lint-only findings outside the registry: R-58 enum value (comparisonKind BETWEEN_GROUP), Target `vocabularyKey` (not a Target property).
- Not present in D10 fixtures (grep): Mention / mention.stage, RENDITION_OF, nNoChangeContexts, interim OTHER discourse Assessments, disclosureFinding, HAS_REVISION_STATUS / REVISES, ClaimOccurrence label, INCREASES_LEVEL, HOLDS_EQUITY_IN, AlgorithmVersion.*.

## Commands

```
# baseline (per fixture, saved to the session scratchpad d10fx/before/*.json)
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D10/<folder>
  -> fda-qhc 6 err / 9 warn; livertox 6 / 2; mg-bisglycinate 11 / 8; mg-rankings 35 / 8; opentargets 2 / 2  (total 60 errors, 29 warnings)
# edits: node scripts in the scratchpad (d10fx/e-ot.mjs, e-lt.mjs, e-fda.mjs, e-bg.mjs, e-rk.mjs): exact-match text edits of
#   assertions.yaml (comments kept) and JSON edits of intent.json (indent 1, trailing newline, weight 1.0 kept)
# intent validation (zod IngestionIntent from packages/contracts/dist + Ajv 2020 on json-schema/biotech-knowledge-intent.v1.json,
#   same checks as final/_work/validate-intents.mjs, D10 files only so the shared intent-validation.json is not rewritten)
node <scratchpad>/d10fx/vint.mjs
  -> all five: zod true, jsonSchema true (proposals: fda 12, livertox 8, mg-bisglycinate 11, mg-rankings 39, opentargets 10)
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D10/<folder>   (after)
  -> fda-qhc 0 / 9; livertox 0 / 2; mg-bisglycinate 0 / 8; mg-rankings 0 / 16; opentargets 0 / 2  (total 0 errors, 37 warnings)
```

## Edits

| fixture | edit | ruling / registry |
|---|---|---|
| opentargets-association-signal | a-label-indication INDICATED_FOR -> HAS_APPROVED_INDICATION; asserter e-label-holder -> e-fda (regulator); basisKind MANUFACTURER_CLAIM dropped; qualifier labelHolder:REMEDYREPACK; e-label-holder kept as a documented entity, removed from intent subjects (no orphan write) | alias (R-88 fixtureEdit) |
| livertox-green-tea-extract-harm | a-gt-beverage-not-associated, a-gt-infusion-cases ASSOCIATED_WITH_ADVERSE_EFFECT -> CAUSES_ADVERSE_EFFECT + sourceKind:REFERENCE_MONOGRAPH + population:UNSPECIFIED (required qualifier; the monograph states none), polarity/speechAct kept; a-gte-alt REPORTS_ADVERSE_EVENT_RATE -> CHARACTERIZES_INCIDENCE (literal: no Condition object captured for "ALT elevations") | aliases (R-84/R-85) |
| fda-qhc-magnesium-disconfirmation | a-fda-status, a-ods-approved STATES_REGULATORY_STATUS -> RATES_CLAIM; a-350-condition CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT -> HAS_CLAIM_CONDITION, subject e-claim, qualifier productClass=dietary supplements bearing the claim; pseudo-entity e-dietary-supplements (D6.Product standing for a class) removed from entities and intent subjects, i-harms ASSESSES e-mg + e-claim | alias; retired (R-93) |
| mg-bisglycinate-rct-unstructured | R-15: first-author stand-in e-authors removed; 7 assertions (+ new a-administers) asserted by e-publication, a-coi by e-lopresti (statement about an individual author); ARM_DAILY_DOSE ×2 -> ADMINISTERED_AMOUNT on new InterventionComponent e-ic-mg (StudyArm -HAS_COMPONENT-> structural; e-ic-mg -ADMINISTERS-> e-mg-bisglycinate, a-administers, evidence loc-dose); MATERIAL_MANUFACTURED_BY -> e-biogena -MANUFACTURES-> e-mg-bisglycinate; DISCLOSES_ROLE_AT -> HOLDS_ROLE edgeProperties {roleKind EXECUTIVE_OFFICER}, qualifier roleText:managing director, CRO-funding text kept; comparisonKind BETWEEN_GROUP -> BETWEEN_ARM; e-target-sleep resolved hu:target:sleep (key target:sleep) | R-15, R-68, R-82/R-30, R-58, retired ARM_DAILY_DOSE |
| mg-rankings-criteria-comparison | per DSLD label (173951, 271329, 242510): ProductVariant (dosageForm TABLET), Package (CONTAINER, unitCount/unitNoun from DSLD netContents), LabelVersion (SUPPLEMENT_FACTS, labelVersionCode, contentDigest = snapshot sha256, compositionDigest = sha256 of the transcribed Mg line, serving fields); HAS_VARIANT / HAS_PACKAGE structural; HAS_LABEL_VERSION asserted by o-ods (CURATOR_CLASSIFICATION, validFrom = DSLD entryDate); a-dsld-*-form DECLARES_INGREDIENT_FORM -> DECLARES_COMPONENT LabelVersion -> form with ComponentLineProperties (amount, mg, AS_NUTRIENT, NUTRIENT_EQUIVALENT, PER_SERVING, dailyValuePercent), qualifiers declaredName:/form:/relayedBy:; a-dsld-*-mg (LABEL_DECLARED_AMOUNT) merged into those lines (locators kept); a-dsld-*-serving -> MAX_DAILY_SERVINGS on the LabelVersion; a-calc-* -> PER_MAX_DAILY_DOSE_AMOUNT (LabelVersion, object e-mg, rule:daily-max.v1); criteria inputPredicates and the BLOCK rule text re-keyed; a-usn-commission -> DISCLOSES_INTEREST; a-ld-right-to-update -> STATES_METHOD_CAVEAT; Target resolved; supersedesUid kept (same asserter) | retired / alias entries; R-23 check |

Facts used that have no locator: DSLD productVersionCode, netContents, servingsPerContainer and entryDate, read from the captured snapshot bytes (`scratchpad/ft/D10/fixtures/fresh/dsld-label-*.json`, sha256 equal to the snapshot contentHash); marked as such in the entity notes and qualifiers. No locator was added.

## Remaining (all warnings, none an error)

- predicate-proposed ×35, registrar-gated: REPORTS_DOSE_RANGE_STUDIED ×8, REDUCES_RISK_OF ×1 (Claim binding; re-keying it changes propositionHash), STATES_ATTRIBUTION_CAVEAT ×2, CHARACTERIZES_ABSORPTION ×4 (D1); REPORTS_EFFECT_SIZE, STATES_LIMITATION, STATES_STUDY_DESIGN, INDEXED_AS_PUBLICATION_TYPE ×2 each (D3); MAX_DAILY_SERVINGS ×6 (D6); STATES_METHOD_CAVEAT ×4, DISCLAIMS_ENDORSEMENT ×2 (D7).
- retired-name warn ×2: mg-rankings `supersedesUid` (crit-ld-label-accuracy-2 -> -1, both Labdoor): legitimate under R-23.

## Incident: fixtures regenerated mid-round (03:04:59-03:05:01)

After the edits above lint clean, every `final/fixtures/<P>/*/assertions.yaml|intent.json|questions.md` (D1..D13, D10 included) was rewritten at 03:04:59-03:05:01 and `_work/repath-manifest.json` at 03:05:01: a concurrent `_work/repath-fixtures.mjs` run reset the copies to the packet originals (= HEAD 31390a6). README.md (mtime 03:04:36) was not rewritten, so its FU-03 rows still say "applied" for packets whose fixture edits are now gone (git status at 03:06 shows only D1 ×1, K ×1 and D10 modified under fixtures/). For D10 the five edit scripts were re-run against the reset files (byte-identical to the HEAD backup first), giving the same result: lint 0 errors / 37 warnings, intents zod + JSON Schema valid. A copy of the edited D10 files is kept at `<scratchpad>/d10fx/applied/<folder>/`; to restore after another reset: copy them back, or re-run `node <scratchpad>/d10fx/e-{ot,lt,fda,bg,rk}.mjs` (each refuses to run unless its anchors match exactly once).

## Gaps recorded (no schema change)

- intent v1: assertion.literal has no object slot, so PER_MAX_DAILY_DOSE_AMOUNT's object (magnesium) is only in assertions.yaml (noted in the intent notes / rationale); qualifiers stay in proposal rationale (AssertionCore has none); asserterRef doc names Person / Organization / Agent while R-15 asks for a Publication asserter (executor P20 widening).
- predicates.yaml HAS_CLAIM_CONDITION lists subjectTypes [RegulatoryRecord]; R-93 and its fixtureEdit admit the Claim for a product-class condition, so the registry row should list Claim (predicate-registry owner).
- R-88's text says the labeler of record asserts label statements; the INDICATED_FOR fixtureEdit (followed) makes the regulator the asserter of the approved indication.
- README index rows for D10 ("relationships exercised") were not refreshed (only the FU-03 rows were edited); they now miss HOLDS_ROLE, ADMINISTERS, HAS_COMPONENT, HAS_LABEL_VERSION, DECLARES_COMPONENT, HAS_VARIANT, HAS_PACKAGE.

---

<!-- stage: _runlog/closeout-fixture-editor-D3.md -->

# Close-out — fixture editor (S) for final/fixtures/D3/ (FU-03)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S). Edited only `final/fixtures/D3/<folder>/` (assertions.yaml, intent.json, questions.md) and the D3 rows of the FU-03 table in `final/fixtures/README.md`. No SDL change; source.md, locators.yaml, snapshot digests and sourced values untouched; nothing committed.

## Inputs
- FU-03 table rows: `D3/dq-bone-trial-unstructured` (pending R-82 FUNDED_BY needs a D7.Organization funder + roleText:), `D3/resveratrol-retraction` (residual HAS_REVISION_STATUS ×8 for R-44; pending F-05 ClaimOccurrence label). No row for `D3/aspree-registry-history-harm`.
- `final/vocabularies/predicates.yaml`: no alias-of / retired-by / proposed-new entry is used by a D3 fixture (scan of every non-registered entry whose sources name `final/fixtures/D3/`: 0 hits) — no predicate re-keys to apply.
- `final/_work/rulings.yaml`: no `edit-fixture` op under D3 (the R-44 resveratrol op is D11's own fixture). Rulings applied as they bear on these copies: R-44, R-42/R-43, R-82, F-05.

## Baseline lint
```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D3/<folder>
  aspree-registry-history-harm   errors 0, warnings 0
  dq-bone-trial-unstructured     errors 1 (enum-value: disagreements.5.registry NONE), warnings 0
  resveratrol-retraction         errors 2 (predicate-unregistered OCCURRENCE_OF; relationship-pair ChemicalSubstance-[:OCCURRENCE_OF]->Claim), warnings 7 (retired-name HAS_REVISION_STATUS: assertions 817, 846, 1947, 1949, 1957; intent 1709, 1711)
  total 10 (3 errors, 7 warnings)
```
Intent validation (zod IngestionIntent + Ajv 2020-12 over biotech-knowledge-intent.v1.json; scoped copy of `_work/validate-intents.mjs` in the session scratchpad so the shared `_work/intent-validation.json` is not rewritten): all three valid (proposals 119 / 120 / 24).

## Edits (structural only)
dq-bone-trial-unstructured
1. R-82 a64: FUNDED_BY FIELD literal → RELATIONSHIP `pub` → D7.Organization `org-nih` (new resolved entity "National Institutes of Health", the funder the acknowledgements name, l39); the funder-role sentence (l40) moves to qualifier `roleText:`; evidence l39 + l40. The table's "a64 names no funder" holds for l40 alone; l39 in the same paragraph names it, so no fact is invented.
2. intent.json: p-a64 (assertion.literal) removed; notes list a64 FUNDED_BY as not expressible in v1 (no entity-object assertion kind, no qualifiers field) — this fixture's existing convention (a57–a61 AUTHORED_BY).
3. questions.md Q-D3-08 answer names the FUNDED_BY object and roleText.
4. disagreements[masking].registry `NONE` → `RegistrationVersion.masking NONE` (lint read the free-text key `registry` as the RegistryKind enum; the registry's value NONE is unchanged).

resveratrol-retraction
5. R-42/R-43 a06: Source HAS_IDENTIFIER DOI (the work's DOI on a second Subjectable) → asserted RENDITION_OF Source → Publication (AssertedRecordedProperties; same asserter NLM; evidence l06 DOI + l07 PMID; qualifier `rendition-rule:`). intent p-a06 identifier.attach → edge.assert RENDITION_OF (no edgeProperties).
6. F-05 / OCCURRENCE_OF a21: predicate OCCURRENCE_OF and object Claim → `occurrenceOf:` (structural edge) + `proposition:`; note no longer names a ClaimOccurrence label. The proposition's binding predicate is not registered → `predicate: null` + `predicatePending` (owner-gated, registrar D2 per R-52); not invented.
7. R-44: a11 HAS_REVISION_STATUS kept (OpenAlex flag, no identified notice — the case R-44 keeps it for); its note, the projection rule, kernelPathCQ_EV_05 and questions.md CQ-EV-05 now read Source -RENDITION_OF-> Publication instead of the shared-DOI join; prose no longer repeats the predicate name.
8. Projection values: RETRACTED → RETRACTION, NONE_KNOWN → null (SourceRevisionKind); questions.md Q-D3-03 filter `= RETRACTION`.

aspree-registry-history-harm
9. projections: Publication.revisionStatus result NONE_KNOWN → null (R-44).

No predicate re-key applied (none assigned). source.md, locators.yaml, snapshot digests, quotes and sourced numbers untouched (`git diff --stat` lists only assertions.yaml, intent.json, questions.md).

## Final lint and validation
```
node .../final/_work/lint-fixtures.mjs --fixture D3/<folder>
  aspree-registry-history-harm   0 errors, 0 warnings
  dq-bone-trial-unstructured     0 errors, 0 warnings
  resveratrol-retraction         0 errors, 3 warnings: retired-name HAS_REVISION_STATUS at assertions.yaml:826 (a11), intent.json:1720,1722 (p-a11) — legitimate under R-44, kept
node .../final/_work/lint-fixtures.mjs  (summary only, baseline not rewritten) -> D3 {"fixtures":3,"clean":3,"errors":0,"warnings":3}
scoped intent validation (zod + Ajv): aspree 119 ok, dq-bone 119 ok (was 120), resveratrol 24 ok
```
Violations 10 (3 errors, 7 warnings) → 3 (0 errors, 3 legitimate warnings).

## Owner-gated / left
- resveratrol a21: binding predicate for "Resveratrol increases longevity through SirT1 …" (no registered predicate; the Claim carries no propositionHashInput in this fixture). Registrar D2 (R-52) to register one; then a21 and the Claim binding take it.
- FU-03 README rows D3/dq-bone-trial-unstructured and D3/resveratrol-retraction updated to "applied".

---

<!-- stage: _runlog/closeout-fixture-editor-D4.md -->

# Close-out — fixture editor (S), final/fixtures/D4/ (FU-03)

2026-10-09. Writes under `final/fixtures/D4/<folder>/` (assertions.yaml, intent.json) and the D4 rows of the FU-03 table in `final/fixtures/README.md` only. source.md, locators.yaml, quotes, snapshot digests and sourced numbers/identifiers untouched. SDL unchanged. Not committed.

## Inputs

- FU-03 table (README "Residual non-final names and pending ruling edits"): one D4 row, `D4/hba1c-two-labs-interference` — R-26/R-25 PERFORMED_BY_LAB d05 becomes asserted with basisKind CURATOR_CLASSIFICATION.
- `vocabularies/predicates.yaml` fixtureEdit for D4: `AlgorithmVersion.inputFeatureCount` (alias-of INPUT_FEATURE_COUNT), `AlgorithmVersion.inputPlatforms` (alias-of INPUT_PLATFORMS), both D4/dunedinpace-paper-unstructured (R-52).
- `_work/rulings.yaml` D4 section: no `edit-fixture` op; R-26 `change-edge-class` PERFORMED_BY_LAB is the d05 edit above. R-55 (edit-text), R-94 (edit-pattern Q-D4-10), R-50 (edit-question) are not fixture edits.
- R-15 (decision report: "never by the first of several"): three D4 fixtures used a first-author Person "asserter for the author group". Not listed for D4 in the FU-03 table; applied because the ruling is general and the edit needs no new fact (title, venue and identifiers are printed in the snapshot title / source.md citation).

## Baseline

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D4/<folder>   (x7)
  -> dunedinpace-paper-unstructured: errors 2 (predicate-alias x2: a04 L156, a05 L177); other six: 0 / 0
scratchpad val-d4.mjs (same zod IngestionIntent + Ajv 2020 json-schema check as _work/validate-intents.mjs, D4 only; does not rewrite _work/intent-validation.json)
  -> 7/7 zod true, json true
```

## Edits

| fixture | edit | files |
|---|---|---|
| dunedinpace-paper-unstructured | a04 predicate `AlgorithmVersion.inputFeatureCount` -> `INPUT_FEATURE_COUNT`; a05 `AlgorithmVersion.inputPlatforms` -> `INPUT_PLATFORMS` (intent p04/p05 are node.upsert and name no predicate) | assertions.yaml |
| hba1c-two-labs-interference | R-26 d05 PERFORMED_BY_LAB: edgeClass structural -> asserted, assertionKind RELATIONSHIP, polarity POSITIVE, speechAct STATES, basisKind CALCULATED -> CURATOR_CLASSIFICATION, validFromBasis UNKNOWN, edgePropertiesType AssertedRecordedProperties; asserter agent-curation and locator lc-testno kept; derivationRule kept | assertions.yaml |
| hba1c-two-labs-interference | p05-d05 edge.structural -> edge.assert (assertion.predicate PERFORMED_BY_LAB, CURATOR_CLASSIFICATION, asserterRef agent-curation, edgeProperties {}); derivation rule moved into rationale (v1 AssertionCore has no derivationRule field); notes updated | intent.json |
| dunedinpace-paper-unstructured | R-15 asserter person-belsky -> pub-belsky-2022 (D3 Publication, hu:publication:pmid-35029144; PMID 35029144, PMCID PMC8853656, DOI 10.7554/eLife.73420) on a01-a06; Person entity/subject replaced; intent asserterRef x2 | assertions.yaml, intent.json |
| clock-noise-vs-retest-advice | R-15 person-higgins-chen -> pub-higgins-chen-2022 (hu:publication:pmid-36277076; PMID 36277076, PMCID PMC9586209, DOI 10.1038/s43587-022-00248-2) on b04, b05; intent asserterRef x2 | assertions.yaml, intent.json |
| nr-nad-compound-to-test | R-15 person-martens -> pub-martens-2018 (hu:publication:pmid-29599478, the uid D11 nr-trial-jats-unstructured uses; PMID 29599478, PMCID PMC5876407, DOI 10.1038/s41467-018-03421-7) on e03, e04, e05; intent asserterRef x2 | assertions.yaml, intent.json |

R-15 edits were applied with a scratchpad script (string replacement of the entity block and `ref: <person>\n type: Person` asserter pairs; intent rewritten with JSON.stringify(…, null, 2) after checking the three files round-trip byte-identically). hba1c intent.json does not round-trip, so it was edited by text replacement.

## After

```
lint-fixtures.mjs --fixture D4/<folder> (x7)
  -> errors 0 on all 7; warnings 2 (dunedinpace: predicate-proposed INPUT_FEATURE_COUNT, INPUT_PLATFORMS — registrar D4 has not accepted them)
val-d4.mjs -> 7/7 zod true, json true
git status: only assertions.yaml / intent.json in 4 D4 folders + fixtures/README.md
```

FU-03 table: hba1c row set to applied; rows added (applied) for clock-noise-vs-retest-advice, dunedinpace-paper-unstructured, nr-nad-compound-to-test.

## Owner-gated / recorded, not changed

- INPUT_FEATURE_COUNT / INPUT_PLATFORMS are `proposed-new` in predicates.yaml (2 lint warnings) until the D4 registrar accepts them.
- MD-D4-03: nr-nad s02 keeps `assessmentSubkind: D4.test-and-sell` (R-55 one register entry vs D4 subkind is open); no conclusionCode added (would be a new judgment).
- FU-08 (already open): the IR marks REQUIRES_INPUT_METRIC asserted while its field/register is structural; consumer-panel g15-g23 stay structural (they match the register and the edge-property type).
- Publication identifiers are written on the subject without evidence locators (no identifier span exists in locators.yaml, which this round may not change); the values are those printed in the snapshot title.

---

<!-- stage: _runlog/closeout-fixture-editor-D7.md -->

# Close-out: fixture editor (S) — final/fixtures/D7/ (FU-03), 2026-10-09

Scope: `final/fixtures/D7/<folder>/{assertions.yaml,intent.json}` only. source.md, locators.yaml, snapshot digests and every
sourced number / identifier / quote untouched. SDL untouched. Not committed (coordinator commits).

## Baseline lint

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D7/<folder>
```

| fixture | errors | warnings | categories |
|---|---|---|---|
| attia-cgm-dexcom-recommendation-interest | 12 | 0 | edge-property 6, retired-name 6 (R-30) |
| bioage-group-vehicles-stale-role | 24 | 0 | edge-property 12, retired-name 12 (R-30) |
| elysium-paper-funding-award | 4 | 0 | edge-property 2, retired-name 2 (R-30) |
| ftc-ameribev-paid-dieticians-harm | 0 | 0 | — |
| niagen-ownership-brand-history | 32 | 0 | edge-property 16, retired-name 16 (R-30) |
| sinclair-self-disclosure-unstructured | 34 | 0 | edge-property 17, retired-name 17 (R-30) |
| **total** | **106** | **0** | all R-30 |

Edits the lint does not see (checked by hand): R-55 disclosureFinding values (attia, ftc), R-15 asserters (elysium: the
paper's own-voice statements asserted by the corresponding author / "PMC10903100 authors"), R-09/R-27 Mention (sinclair:
`mentions:` section, `inputMentions`, two `mention.stage` intent proposals). Predicate registry: no alias/retired/
unregistered predicate in D7 (0 predicate-* violations). rulings.yaml modules.D7 has no edit-fixture op; R-21 "bioage" is
D13/bioage-strides-discontinuation (not D7).

## Edits

1. **R-30** (scratch `r30-d7.mjs`, text edit for YAML, JSON re-serialized with 2-space indent, which round-trips byte-for-byte):
   `roleTitleVerbatim` / `stakeClassVerbatim` removed from HOLDS_ROLE / HOLDS_STAKE edge properties; the printed text becomes the
   first authorizing-Assertion qualifier `roleText:'…'` / `stakeClass:'…'` (a `qualifiers:` line was added where the Assertion
   had none: bioage b-02, b-06; niagen n-04, n-05, n-07, n-08). intent.json: field removed from `edgeProperties`, the qualifier
   is carried in `rationale` ("R-30 authorizing-Assertion qualifiers (intent v1 has no assertion.qualifiers; carried here): …",
   the D6 editor's wording). Counts (assertions / intent): attia 3/3, bioage 6/6, elysium 1/1, niagen 8/8, sinclair 9/8
   (a-13 is held, not in the intent) = 27/26.
2. **R-15** elysium-paper-funding-award: new seam entity / intent subject D3 Publication `hu:publication:pmid-38241160`
   (name = loc-jats-title quote; PMID/PMCID/DOI as printed in e-04; issuers NLM/NLM/Crossref as in the other fixtures).
   Asserter → the Publication for the paper's own-voice statements e-01..e-03 (was `{ source: "PMC10903100 authors" }`, no
   asserterRef in the intent), e-04 and e-12..e-14 (was the corresponding author "standing in for the author group").
   e-05..e-07 (competing interests of named authors) stay with the named Person (R-15 bullet 3).
3. **R-09/R-27** sinclair-self-disclosure-unstructured: `mentions:` section removed (m-fd-sinclair, m-insidetracker) and replaced
   by a comment; as-res-01 `inputMentions` → `facets: ["surfaceForm=David Sinclair", "typeHint=Person"]` and its
   loc-fd-sinclair-name evidence role SUPPORTS → CONTEXT (SDL Assessment docstring); a-13 `via` and the Segterra note reworded.
   intent.json: the two `mention.stage` proposals removed (14 → 12 proposals); notes updated.
4. **R-55**: attia `disclosureFinding=DISCLOSED_IN_LATER_REVISION` is in the decision report's merged list → unchanged. ftc
   `INADEQUATE_DISCLOSURE_PER_REGULATOR` is a D7 value absent from the five-value list (D9 spells it INADEQUATE_PER_REGULATOR;
   seams.yaml D7.conflict-relevance openIssue): no mapping in the ruled list, so kept → owner-gated (vocabulary editor with D9).
5. Header comment (assertions.yaml) and `notes` (intent.json) record the close-out in each edited fixture; prose avoids the
   retired tokens (the residual scan reads non-comment JSON/YAML text).

## Checks

```
bash <scratch>/lintd7.sh            # lint-fixtures.mjs --fixture D7/<folder> ×6
# -> every D7 fixture: errors 0, warnings 0   (before: 106 errors = attia 12, bioage 24, elysium 4, ftc 0, niagen 32, sinclair 34)
node <scratch>/val-d7.mjs           # zod IngestionIntent + Ajv 2020 biotech-knowledge-intent.v1.json (as validate-intents.mjs)
# -> all 6 intents: zod true, jsonSchema true (first run: elysium invalid — identifiers need issuer; fixed)
YAML.parseDocument on the 6 assertions.yaml -> no errors
```

`_work/validate-intents.mjs` and `lint-fixtures.mjs --baseline` were not run (they rewrite shared files); the coordinator's
full re-run picks up these edits. FU-03 table rows for the six D7 fixtures updated (fixtures/README.md, targeted line replace
after a fresh read). Files: fixtures/D7/{attia…,bioage…,elysium…,niagen…,sinclair…}/{assertions.yaml,intent.json},
fixtures/README.md (6 rows). Not changed: source.md, locators.yaml, questions.md, ftc files.

---

<!-- stage: _runlog/closeout-fixture-editor-D9.md -->

# Close-out: fixture editor (S), packet D9, 2026-10-09

Closes FU-03 for `final/fixtures/D9/*` (6 fixtures). Structural edits only. No SDL change (candidate sha256 c7cf1235…4793
untouched). `source.md`, `locators.yaml`, snapshot digests and every sourced number, identifier and quote are unchanged:
sha256 of the 6 `source.md` and 6 `locators.yaml` files compared before and after, all equal. Nothing committed. Research only,
not medical advice.

## Inputs

- `final/fixtures/README.md` FU-03 table, rows D9/* (R-30, R-43, R-49, R-55, F-05).
- `final/vocabularies/predicates.yaml`: the only D9 re-key is `INCREASES_LEVEL` (alias-of INCREASES_LEVEL_OF, fixtureEdit
  "D9/hl-essentials-recut-nmncom-retelling: re-key to INCREASES_LEVEL_OF (D2)").
- `final/_work/rulings.yaml` modules.D9: edit-fixture R-49; edit-text R-55 ("re-key fixtures to merged disclosureFinding list")
  and R-15 ("bylined web article asserted by its single named author, else the site owner"); R-43 change-edge-properties.
- `final/decision-report.md` R-15, R-26, R-30, R-43, R-49 (+F-01), R-55, F-05; `final/seams.yaml` D7.conflict-relevance
  (disclosureFinding = union of the D7 and D9 lists).

## Baseline

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D9/<folder>   (x6)
hl52 8 err / 2 warn; hl-essentials 4 / 0; lifespan 1 / 0; longecity 0 / 0; rapa 4 / 12; sinclair 48 / 0
TOTAL 65 errors, 14 warnings  (= the D9 row of fixture-lint-baseline.json)
```

## Edits (assertions.yaml and intent.json kept consistent)

| fixture | edit |
| --- | --- |
| all 5 with a RENDITION_OF row | R-43/R-26: 9 rows `class: structural` -> `class: asserted` (asserter, subject/object, speechAct STATES, `edgePropertiesType: AssertedRecordedProperties`, recorded time only, `renditionBasis:` qualifier); intent `edge.structural` -> `edge.assert` with `asserterRef`, `assertion {speechAct, basisKind}`, `edgeProperties {}`. Asserter: the feed publisher where its RSS item states the rendition (hl52 s-ren-web, s-ren-audio, essentials s-ren-ess: org-scicomm; lifespan s-ren-audio: org-lscomm; basisKind UNSTATED); the BellLabs curation agent (R-16 rule 3, basisKind CURATOR_CLASSIFICATION) for BellLabs joins (hl52 s-ren-yt, essentials s-ren-ess-yt; linkBasis BELLLABS_MATCH) and for single-page works minted from the capture (essentials s-ren-nmn, longecity s-ren, rapa s-ren). Intents of hl52, longecity and rapa gain a `new` Agent subject `agent-curation` (essentials already had it). Ids kept (source.md names them). |
| sinclair, hl52, rapa | R-30: 18 `roleTitleVerbatim` / `stakeClassVerbatim` edge fields -> authorizing-Assertion qualifiers `roleText:'…'` / `stakeClass:'…'` (assertions); 12 intent proposals drop the field and carry the qualifier in `rationale` (v1 AssertionCore has no qualifiers; same convention as the D7 editor). |
| hl-essentials | Alias re-key INCREASES_LEVEL -> INCREASES_LEVEL_OF (o8, ret-nmn-double; assertions + intent). R-49: interim `assessmentKind: OTHER` Assessment ind-nmn removed; replaced by an expected Claim projection cache `projectionCache: pc-nmn-discourse` (discourseIndependentCount 1, discourseFirstHandCount 2, discourseRetellingCount 1, discourseRecutCount 1, discourseFirstOccurrenceAt 2021-12-27T09:00:00Z, discourseMethodVersion discourse-independence/v1) carried over from the interim facets; questions.md CQ-CL-06 now reads the cache. |
| sinclair | R-55 cr-o5: DISCLOSED_IN_CONTAINER_PARTIAL -> DISCLOSED_IN_CONTAINER (partial stated in the text), DISCLOSED_ELSEWHERE_LATER_ONLY -> DISCLOSED_IN_LATER_REVISION; questions.md Q-D9-03 expected findings re-keyed. cr-o4 values were already in the merged list. |
| lifespan | R-55 cr-sponsors: Athletic Greens `NOT_FOUND` -> NOT_FOUND_IN_COMPLETE_CAPTURE (v0, whole-snapshot absence check) + DISCLOSED_IN_LATER_REVISION (g1). o-correct `amountReferent` ACTIVE_INGREDIENT (a ComponentLineRole value; lint enum-value) -> AS_NAMED, printed wording kept in the qualifier and the intent rationale. |
| rapa | R-15: ret-grip, ret-safety, ret-conclusion, ret-stance asserted by the three-byline MediaWork w-art (was p-attia, "site-owner convention, open"); intent asserterRef of ret-grip and ret-stance -> w-art; questions.md Q-D9-10 wording. |
| hl52 | F-05: section comment no longer names a ClaimOccurrence label; section headers name the asserted RENDITION_OF rows. |
| all 6 | one `# Close-out 2026-10-09` header comment in assertions.yaml; one sentence appended to each intent `notes`. |

Edit counts: R-43 9 rows (+9 intent proposals, +3 Agent subjects); R-30 18 yaml + 12 intent; R-55 4 facet values (2 fixtures) +
1 questions line; R-49 1 assessment removed (+1 projection-cache block, 1 questions line); alias re-key 2 yaml + 2 intent;
R-15 4 yaml + 2 intent + 1 questions line; amountReferent 1 yaml + 1 intent; F-05 1 comment.

## Validation

```
intent validation (zod IngestionIntent from packages/contracts/dist + Ajv 2020 against
packages/contracts/json-schema/biotech-knowledge-intent.v1.json, the validate-intents.mjs method), D9 only:
  6/6 intent.json zod true, jsonSchema true
YAML.parse of the 6 assertions.yaml: ok
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D9/<folder>   (x6)
  hl52 0 err / 2 warn (QUALIFIES); hl-essentials 0 / 0; lifespan 0 / 0; longecity 0 / 0;
  rapa 0 / 12 (ADJUSTED_MEAN_DIFFERENCE, CHANGE_DIFFERENCE, SERIOUS_ADVERSE_EVENT_REPORTED, SAFETY_FINDING_REPORTED,
  REPORTS_CONCLUSION, INTERPRETS_RESULT); sinclair 0 / 0
  TOTAL 65 errors -> 0 errors; 14 warnings -> 14 (all predicate-proposed, registrar-gated, MD-X-03 a)
```

The shared `_work/intent-validation.json` and `_work/fixture-lint-baseline.json` were not regenerated (the coordinator re-runs
them over all packets).

## README

`final/fixtures/README.md` FU-03 table: the six D9 rows set to "applied (close-out 2026-10-09)", with the remaining
registrar-gated warnings named. Only those six lines were replaced (file re-read and compared before writing; other editors'
rows untouched). The acceptance-gate bullet near the top of the README still says the D9 fixtures carry the interim OTHER
assessments; it is shared text, left for the coordinator.

## Open (not lint items)

- sinclair cr-o5 / cr-o4 still use `relevanceLevel=HIGH` and a D9-style `relevanceBasis=` value (lifespan cr-sponsors uses
  `hostInterestInSponsor=`), not D7.conflict-relevance `conclusionCode` (DIRECT | INDIRECT | NOT_RELEVANT | UNDETERMINED) and D7 relevanceBasis codes;
  R-55's "same Assessment through the D7 and D9 patterns" check is not met. Not changed here (judgment values; D7 with D9).
- The merged disclosureFinding list has no "partial in container" value and the D9 `completeness` facet has no published
  values (seams.yaml "values per D9"); cr-o5 keeps "partial" in the text.
- intent v1 gaps unchanged: no assertion qualifiers (R-30 text in rationale), no proposal kind for assessments or projection-cache
  properties (R-49 cache only in assertions.yaml). `mention.stage` proposals stay (contract kind; no Mention node is written).

---

<!-- stage: _runlog/closeout-fixture-editor-K.md -->

# Close-out: fixture editor (S) for final/fixtures/K/, 2026-10-09

Closes FU-03 for the six K fixture copies (`final/fixtures/K/<folder>/`). No SDL change (candidate sha256 c7cf1235…4793
untouched). Nothing committed (the coordinator commits). Research only, not medical advice.

## Commands and key outputs

(appended as the edits are made)

---

<!-- stage: _runlog/closeout-S-fixtures-D11.md -->

# Close-out — fixture editor (S) for final/fixtures/D11/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D11/<folder>/ only (5 fixtures). No SDL change. No change to source.md, to locators.yaml
quotes, to snapshot digests or to any sourced number, identifier or quote. No commit.

## Baseline

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D11/<folder>` per fixture (before edits):

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| capture-failures-coverage | 0 | 0 | — |
| nr-chloride-gsrs-identifier-bridge | 8 | 0 | retired-name 4 (Mention), node-type 3 (Mention), edge-property-type 1 (HAS_ACTIVE_MOIETY AssertedEdgeProperties) |
| nr-trial-jats-unstructured | 6 | 3 | edge-property-type 3 (ADMINISTERS, REALIZES_SUBSTANCE, REPORTS_ON AssertedEdgeProperties), edge-property 3 (intent HAS_STUDY_ROLE roleTextVerbatim), predicate-proposed 3 (WELL_TOLERATED_AT_DOSE ×2, DOSE_EXCEEDS_LABEL_RECOMMENDATION) |
| resveratrol-retraction-integrity | 1 | 2 | edge-property 1 (intent REVISES reasonsVerbatim), predicate-proposed 2 (PRECONDITIONS_HEART) |
| sirolimus-spl-boxed-warning | 4 | 0 | retired-name 2 (declaredNameVerbatim), edge-property-type 1 (REALIZES_SUBSTANCE AssertedEdgeProperties), edge-property 1 (intent DECLARES_COMPONENT declaredNameVerbatim) |
| **total** | **19** | **5** | |

Intent validation (scratchpad `validate-d11.mjs`: zod `IngestionIntent` from packages/contracts/dist + Ajv 2020 on
packages/contracts/json-schema/biotech-knowledge-intent.v1.json, the same two checks as `_work/validate-intents.mjs`):
5/5 intent.json valid (zod true, JSON Schema true) before edits.

Edit sources:
- FU-03 table rows D11/* in `fixtures/README.md`: R-09/R-27 (chloride Mention), R-44 + R-30 (resveratrol), R-30 (sirolimus).
- `vocabularies/predicates.yaml`: no `fixtureEdit` names a D11 fixture; no alias-of / retired-by predicate is used by a D11
  fixture (lint: 0 predicate-alias, 0 predicate-retired). The proposed-new rows used by D11 fixtures are registrar-gated (D3).
- `_work/rulings.yaml` D11 edit-fixture ops: R-44 only ("resveratrol revision statuses -> REVISES by those asserters").
- Rulings that touch D11 fixture data although no row names them: R-10/R-26 (AssertedRecordedProperties on asserted
  recorded-only types; DECLARES_COMPONENT is asserted in the candidate), R-15 (multi-author paper asserter = the D3
  Publication), R-35 (a Firecrawl rendition is TOOL_RENDITION, not CANONICAL_PROJECTION), R-42/R-43 (no Identifier shared by a
  Source and a work; renditions are grouped by asserted RENDITION_OF).

---

<!-- stage: _runlog/closeout-S-fixtures-D12.md -->

# Close-out — fixture editor (S) for final/fixtures/D12/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D12/<folder>/ only (5 fixtures). No SDL change, no source.md / locators.yaml /
snapshot digest / sourced value change, no commit.

## Edit sources

- FU-03 table rows D12/* in fixtures/README.md: acrylamide (R-09/R-27 Mention; R-73/R-95 acr-03), predimed (R-44),
  upf (R-44 residual HAS_REVISION_STATUS).
- predicates.yaml: no fixtureEdit / alias / retired entry names a D12 fixture (lint shows no predicate-* violation).
- rulings.yaml D12 edit-fixture ops: R-44 "PREDIMED revision status -> REVISES". Rulings applied by principle where a D12
  fixture carries the shape: R-15 (first-author asserters, predimed + upf), R-43/R-26 (RENDITION_OF asserted), R-42
  (PMID/DOI on the work, not on the rendition).

## Baseline

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D12/<folder>`

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| acrylamide-fried-potato-harm | 5 | 0 | edge-property-type 1, relationship-pair 2 (QUALITY_RESULT_FOR -> Product), retired-name 2 (Mention) |
| mcdonalds-fries-prepared-food | 2 | 0 | predicate-unregistered 1 + relationship-type 1 (HAS_PACKAGE edge.assert on a structural type) |
| olive-oil-polyphenols-preparation | 0 | 0 | — |
| predimed-retraction-disconfirmation | 0 | 8 | retired-name 8 (HAS_REVISION_STATUS) |
| upf-diet-rct-unstructured | 2 | 3 | edge-property-type 1 + relationship-pair 1 (STATED_IN StudyResult -> Source), retired-name 3 (HAS_REVISION_STATUS) |
| **total** | **9** | **11** | 20 violations |

## Edits

- acrylamide: acr-04 note and intent p06 mention.stage reason reworded (no Mention node; RESOLUTION Assessment on the
  SourceLocator; MENTIONS only from D9 Chunk). acr-03 edge typed AssertedRecordedProperties (validTime stays on the
  Assertion); intent p03 rationale marks the Product end OWNER-GATED (R-95 / OD-10). The pair itself is not changed.
- mcdonalds: intent p03-package edge.assert -> edge.structural (HAS_PACKAGE is structural in the candidate; no asserter).
- predimed: pred-05/05b/06 HAS_REVISION_STATUS FIELD -> D3 REVISES RELATIONSHIP (notice 29897867 -> 2013 RETRACTION by
  NLM and by NEJM; 2018 29897866 -> 2013 CORRECTED_AND_REPUBLISHED by NLM; edge RevisionEdgeProperties.revisionKind);
  new D3 Publications pmid-23432189 / -29897866 / -29897867 (PMID/DOI moved from the Sources, R-42); new pred-08..10
  RENDITION_OF Source -> Publication (asserter hu:agent:d12-curation-agent, CONTEXT locator inside each record, qualifier
  rendition-rule); R-15 pred-01..04, 07 asserter = the Publication (Estruch Person removed); intent mirrors all of it
  (p05/p05b/p06 edge.assert REVISES with edgeProperties.revisionKind, p08..p10 edge.assert RENDITION_OF, subjects
  pub-2013 / pub-2018 / pub-notice / src-notice (canonicalUri = the captured efetch URI of snap-predimed-notice) /
  agent-curation); questions.md Q-D12-09/10 reworded.
- upf: upf-07 (one HAS_REVISION_STATUS, two errata) -> upf-07 + upf-07b D3 REVISES ERRATUM by NLM (erratum 31269427 and
  correction 33027677 -> article 31105044; validFrom = issue dates printed in the ErratumIn citations 2019-07-02 and
  2020-10-06, PUBLICATION_PROXY); upf-08 RENDITION_OF JATS Source -> Publication; R-15 upf-01..06 asserter = the
  Publication (Hall Person removed); upf-02 STATED_IN object -> Publication, AssertedRecordedProperties; PMID/DOI moved to
  the Publication (PMCID stays on the Source); StudyResult entity keys pValueVerbatim/resultVerbatim -> pValueText/
  resultText (values unchanged); intent mirrors it (p08/p08b REVISES, p09 RENDITION_OF, subjects pub-hall /
  pub-erratum-2019 / pub-erratum-2020 / agent-curation); questions.md Q-D12-26 reworded.

Counts: 34 structural edits (acrylamide 4, mcdonalds 1, predimed 17, upf 12) across assertions.yaml, intent.json and
questions.md.

## Validation

- Intents: biotech-knowledge-intent.v1, zod IngestionIntent (packages/contracts/dist) + JSON Schema (Ajv 2020, ajv-formats),
  same imports as _work/validate-intents.mjs, run from a scratch script so the shared intent-validation.json is not
  rewritten: all 5 D12 intents zod valid, jsonSchema valid (acrylamide 7 proposals, mcdonalds 12, olive 6, predimed 11, upf 10).
- Residual scan (RESIDUAL of _work/repath-fixtures.mjs) over D12 assertions.yaml / intent.json / questions.md,
  non-comment lines: 0 hits.

## After

| fixture | errors | warnings |
| --- | --- | --- |
| acrylamide-fried-potato-harm | 2 | 0 |
| mcdonalds-fries-prepared-food | 0 | 0 |
| olive-oil-polyphenols-preparation | 0 | 0 |
| predimed-retraction-disconfirmation | 0 | 0 |
| upf-diet-rct-unstructured | 0 | 0 |
| **total** | **2** | **0** |

Remaining (owner-gated): acrylamide acr-03 / intent p03-result-for relationship-pair QualityResult-[:QUALITY_RESULT_FOR]->
Product (R-73 cut the Product member; R-95 / OD-10 decides: re-key to MEASURED_CONTENT_IN_PRODUCT or reinstate Product).

## Notes / gaps

- intent v1 still has no StudyResult staging in the upf intent: D3 STATED_IN (upf-02) stays in assertions.yaml only (unchanged
  gap, now stated in the intent notes).
- The RENDITION_OF evidence is a CONTEXT locator inside each record; no selector on the identifier blocks was captured and
  none was added (locators.yaml is frozen in the close-out).
- fixtures/README.md: D12 rows set to applied; a D12/mcdonalds-fries-prepared-food row added (it had no FU-03 row).

---

<!-- stage: _runlog/closeout-S-fixtures-D13.md -->

# Close-out — S fixture editor / D13 fixtures (FU-03)

2026-10-09. Scope: `final/fixtures/D13/<folder>/` only (5 fixtures). No SDL change (candidate c7cf1235…4793 untouched), no commit.
Inputs: FU-03 table rows for D13 in `final/fixtures/README.md`; `final/_work/rulings.yaml` modules.D13 edit-fixture ops
(R-44 lesne, R-21 lesne a10/a11 + bioage, R-35 already applied by the repath); `final/vocabularies/predicates.yaml`
(no alias-of / retired-by entry is used by a D13 fixture: every D13 predicate is `registered`).

## Baseline lint

```
$ for f in bioage-strides-discontinuation lesne-2006-retraction madrigal-financing-after-readout \
         madrigal-maestro-nash-topline-8k madrigal-pdufa-to-accelerated-approval; do
    node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D13/$f; done
D13/bioage-strides-discontinuation          errors 1  warnings 0   retired-name 1 (Mention, assertions.yaml:260)
D13/lesne-2006-retraction                   errors 22 warnings 13  retired-name 29 (role AUTHOR/PUBLISHER, derivedFrom=, HAS_REVISION_STATUS), enum-value 6
D13/madrigal-financing-after-readout        errors 0  warnings 0
D13/madrigal-maestro-nash-topline-8k        errors 0  warnings 0
D13/madrigal-pdufa-to-accelerated-approval  errors 0  warnings 1   retired-name 1 (supersedesUid, assertions.yaml:169)
total: 23 errors, 14 warnings
```

## Edits applied (11)

lesne-2006-retraction (assertions.yaml, intent.json, questions.md):
1. R-44: INVOLVES PUBLISHER (a05) and AUTHOR (a06, a07) dropped; intent p-a05..p-a07 dropped; Person entities / subjects
   `lesne`, `ashe` removed (no other user). Authors and publisher are reached through the D3 Publication.
2. R-44: new D3 Publication `notice` (Retraction Note, DOI 10.1038/s41586-024-07691-8 from the snapshot URI and l07/l08/l12,
   PMID 38914864 from l12, publishedAt 2024-06-24 from l04, citation from l12); intent subject mode new.
3. R-44: a09 (publisher) → REVISES notice → article, RevisionEdgeProperties revisionKind RETRACTION (evidence + l03).
4. R-44 + R-21: a10 (Retraction Watch) → REVISES, basisKind CITED_FROM_PRIOR_WORK, `derivedFrom: [a09]` (kernel DERIVED_FROM).
5. R-44 + R-21: a11 (NLM) → REVISES, same; validFromBasis PUBLICATION_PROXY kept.
6. R-44: a12 (Retraction Watch expression of concern) kept as K HAS_REVISION_STATUS: l09 names only the article DOI
   (no identified notice) — legitimate; note added.
7. R-44 (SDL EventKind.RETRACTION docstring "no second date Assertion is written"): a02 / p-a02 (Retraction Watch
   EVENT_OCCURRED on the RETRACTION Event, derived) dropped; a01 stays the one clock Assertion (cites the notice locator l04).
   R-21's own fixture list names only a10/a11, consistent with a02 not surviving R-44. Recorded for the D13 owner (FX-D13-01 d).
8. Prose blocks (kernelRevisionRecord, notStored, pubmedCorroboration, corroboration) and questions.md traces (CQ-EV-05,
   Q-D13-22, CQ-TM-01) updated to REVISES / DERIVED_FROM; intent notes record the v1 gap (no Assertion → Assertion DERIVED_FROM).

bioage-strides-discontinuation (assertions.yaml, intent.json):
9. R-09/R-27: a05's interim surface-form wording replaced; RESOLUTION Assessment r01 added (about the D2 Condition R74.01,
   evidence l04 CONTEXT, method = the ICD-10-CM lookup already recorded on the entity). Intent notes: v1 has no Assessment write.
10. R-21: no derived record exists in this fixture (BioPharma Dive asserts only REPORTED_MARKET_MOVE); corroboration note says so.

madrigal-pdufa-to-accelerated-approval (assertions.yaml):
11. R-23 check: a02 supersedes a01, both asserted by Madrigal → allowed; note records the check.

Already applied by the repath (no edit needed): R-35 CANONICAL_PROJECTION, R-66 US_PRIORITY_REVIEW / US_ACCELERATED_APPROVAL.
Not applicable to D13 (grep): R-30 verbatim fields, R-15, R-43/R-26 RENDITION_OF rows, R-47, R-49, R-55, R-58, F-05,
predicate aliases / retired names (none used by D13). Unchanged: every source.md, locators.yaml, snapshot digest, quote,
number and identifier (git diff touches no locators.yaml / source.md).

## Validation

```
$ node C:/Users/Pinda/AppData/Local/Temp/claude/.../scratchpad/d13fx-validate.mjs
  (zod IngestionIntent from packages/contracts/dist + Ajv 2020-12 over packages/contracts/json-schema/biotech-knowledge-intent.v1.json,
   ajv-formats; same method as final/_work/validate-intents.mjs, without rewriting _work/intent-validation.json)
bioage-strides-discontinuation/intent.json: zod ok; jsonSchema ok; proposals 11
lesne-2006-retraction/intent.json: zod ok; jsonSchema ok; proposals 7      (was 12: -p-a02, -p-a05..07; p-a09..11 edge.assert REVISES)
madrigal-financing-after-readout/intent.json: zod ok; jsonSchema ok; proposals 13
madrigal-maestro-nash-topline-8k/intent.json: zod ok; jsonSchema ok; proposals 9
madrigal-pdufa-to-accelerated-approval/intent.json: zod ok; jsonSchema ok; proposals 22

$ node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D13/<each>
D13/bioage-strides-discontinuation          errors 0 warnings 0
D13/lesne-2006-retraction                   errors 0 warnings 3   HAS_REVISION_STATUS a12 [assertions 442; intent 597, 602] — legitimate (R-44: no identified notice)
D13/madrigal-financing-after-readout        errors 0 warnings 0
D13/madrigal-maestro-nash-topline-8k        errors 0 warnings 0
D13/madrigal-pdufa-to-accelerated-approval  errors 0 warnings 1   supersedesUid a02 [169] — legitimate (R-23: same asserter)
total: 23 errors / 14 warnings -> 0 errors / 4 warnings (all 4 legitimate uses the lint flags as warnings by design)
```

`node final/_work/build-predicates.mjs --check` could not run at the time (YAMLParseError in
`fixtures/D5/sleep-toolkit-unstructured/assertions.yaml`, another editor's file mid-edit); the registry's `observed`
counts for HAS_REVISION_STATUS / REVISES / INVOLVES change with these edits, so the registry needs its regeneration.

## Bookkeeping
- `final/fixtures/README.md`: the three D13 rows of the FU-03 table set to applied (targeted line replacement, re-read first).
- `final/open-questions.md`: new row FX-D13-01 (section 6) for the gaps: (a) intent v1 cannot express DERIVED_FROM between
  Assertions; (b) author stances l05/l06 no longer on any Assertion, no author-list locator for AUTHORED_BY; (c) no
  RENDITION_OF article page Source → Publication (no locator ties URL to DOI); (d) a02 drop reading to confirm;
  (e) lesne source.md prose is stale (frozen this round).
- No SDL change; nothing committed.

---

<!-- stage: _runlog/closeout-S-fixtures-D2.md -->

# Close-out — fixture editor (S) for final/fixtures/D2/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D2/<folder>/ only (5 fixtures). No SDL change, no source.md / locators.yaml / snapshot
digest / sourced value change, no commit.

## Baseline

`node C:/.../final/_work/lint-fixtures.mjs --fixture D2/<folder>` per fixture (before edits):

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| dq-senescence-biomarker-path | 2 | 0 | edge-property 1, retired-name 1 (nNoChangeContexts) |
| metformin-exercise-harm | 4 | 0 | edge-property 2, retired-name 2 (nNoChangeContexts) |
| nr-muscle-unstructured | 7 | 0 | edge-property 3, retired-name 3 (nNoChangeContexts), predicate-alias 1 (HOLDS_EQUITY_IN) |
| reactome-chembl-reference | 2 | 0 | edge-property 1, retired-name 1 (nNoChangeContexts) |
| sirt1-activation-disconfirmation | 4 | 0 | edge-property 2, retired-name 2 (nNoChangeContexts) |
| **total** | **19** | **0** | |

Edit sources: FU-03 table rows D2/* (R-47 nNoChangeContexts; R-15; R-58), predicates.yaml fixtureEdit for D2
(HOLDS_EQUITY_IN → HOLDS_STAKE, nr-muscle A-nr-06), rulings.yaml D2 edit-fixture ops (R-15, R-58) plus the D2 rulings that
touch fixture data (R-47 score stays null on AFFECTS_MECHANISM; R-26 curator mapping basis CURATOR_CLASSIFICATION; R-59
DECREASED in prose).

## Edits applied (assertions.yaml, intent.json, questions.md; no source.md / locators.yaml change)

| fixture | edits |
| --- | --- |
| all 5 | R-47: `nNoChangeContexts` removed from 9 AFFECTS_MECHANISM derived edges; `score` set to null on all 9 (was 1.0 ×4, 0.5, 0.0; R-47: executor keeps score null on AFFECTS_MECHANISM); comment under `derivedEdges:` |
| dq-senescence-biomarker-path | R-15: first-author Person → D3.Publication `pub-hickson2019` (PMID 31542391, PMCID PMC6796530, DOI from source.md) as asserter of A-dq-01..07; intent.json subject replaced (nodeType Publication + identifiers) and both REFLECTS_MECHANISM edge.assert `asserterRef`; R-59 prose DECREASES → DECREASED (crossDomainPath, questions.md ×2) |
| metformin-exercise-harm | R-15: `pub-konopka2019` (PMID 30548390) asserts A-m-01/02/04/05; A-m-03 stays ChEMBL; intent notes; R-59 prose ×3 |
| nr-muscle-unstructured | predicates.yaml fixtureEdit: A-nr-06 HOLDS_EQUITY_IN → HOLDS_STAKE (edgeProperties stakeKind EQUITY; qualifier `stakeClass: owns stock`); R-15: A-nr-01..05 asserted by `pub-elhassan2019` (PMID 31412242), A-nr-06 (one author's competing interest) asserted by the named Person C.B.; intent.json: new edge.assert `p-a-nr-06` HOLDS_STAKE person-cb → org-chromadex (asserterRef person-cb, edgeProperties stakeKind EQUITY), notes updated; questions.md CQ-MX-01 / Q-D2-21 |
| reactome-chembl-reference | R-26: hallmark-mapping Assertions A-r-ref-03..06 basisKind EXPERT_OPINION → CURATOR_CLASSIFICATION (assertions.yaml ×4, intent.json edge.assert ×3; A-r-ref-03 has no intent proposal); header comment; questions.md Q-D2-12; R-59 prose ×1 |
| sirt1-activation-disconfirmation | R-15: `pub-pacholec2010` (PMID 20061378) asserts A-s-01..03, `pub-howitz2003` (PMID 12939617) asserts A-s-04; R-58: 3 CELL_FREE contexts get route IN_MEDIUM + exposureBasis MEDIUM_CONCENTRATION (assertions.yaml + intent.json subjects; exposureAmount stays null, not stated); questions.md Q-D2-05 |

Not invented: no concentration for the cell-free contexts; no RENDITION_OF from the captured Source to the new Publication
records (not required by the rows; the Publication carries the identifiers printed in source.md); the R-26 curation-record
Source/snapshot is still uncaptured (11 item 12). Q-D2-21 patternEdit (R-89) is the pattern owners', not applied here.

## Checks

- `node .../_work/lint-fixtures.mjs --fixture D2/<folder>` after edits: 0 errors, 0 warnings on all 5 (19 → 0).
- Full summary (`lint-fixtures.mjs`, no --baseline, nothing written): byPacket D2 = 5 fixtures, 5 clean, 0 errors, 0 warnings.
- Intent v1 structural validation, D2 only (scratchpad copy of the validate-intents.mjs method, zod IngestionIntent + Ajv
  2020-12 + ajv-formats@3.0.1; final/_work/intent-validation.json not rewritten): 5/5 zod ok, 5/5 JSON Schema ok;
  proposals dq 14, metformin 9, nr-muscle 12 (+1), reactome 13, sirt1 7.
- YAML parse of all 5 assertions.yaml ok; every assertion asserter ref resolves to an entity.
- fixtures/README.md FU-03 rows D2/* (5) set to "applied", owner-gated: none.

---

<!-- stage: _runlog/closeout-S-fixtures-D5.md -->

# Close-out — fixture editor (S) for final/fixtures/D5/ (FU-03)

Date: 2026-10-09. Scope: final/fixtures/D5/<folder>/ only (4 fixtures) plus the D5 rows of the FU-03 table in
final/fixtures/README.md. No SDL change, no source.md / locator quote / snapshot digest / sourced value change, no commit.

## Baseline

`node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D5/<folder>` (before edits):

| fixture | errors | warnings | categories |
| --- | --- | --- | --- |
| antioxidant-exercise-disconfirmation | 4 | 0 | edge-property 4 (orderIndex on OPERATIONALIZED_BY, now AssertedRecordedProperties) |
| pregnancy-magnesium-upper-limit | 1 | 0 | enum-value 1 (computedNotStored.Q-D5-06.verdict ABOVE) |
| sirolimus-label-interactions-harm | 0 | 14 | retired-name 14 (supersedesUid) |
| sleep-toolkit-unstructured | 3 | 0 | retired-name 3 (Mention) |
| **total** | **8** | **14** | 22 violations |

Intent validation (zod IngestionIntent + JSON Schema biotech-knowledge-intent.v1, same method as `_work/validate-intents.mjs`,
run from a scratch copy that writes nothing): 4/4 valid before.

Edit sources: FU-03 rows D5/* (F-05; R-23; R-09/R-27; R-82), rulings.yaml D5 edit-fixture ops (R-23, R-35), predicates.yaml
(no alias / retired / proposed-new predicate is used by a D5 fixture: nothing to re-key), and the D5 rulings that touch fixture
data and that the lint surfaced (R-26 OPERATIONALIZED_BY asserted; R-15 multi-author asserter; R-80 AUTHORED_BY).

## Edits

- **sirolimus-label-interactions-harm** — R-23: `supersedesUid` dropped on r01-v22-grapefruit and r04-v22-cbd-monitor (Mylan
  records pointed at Greenstone records); r00-v14 and r03-v15 status SUPERSEDED → PROPOSED, `recordedTo` removed, notes say they
  leave "current" answers when their SPL label-version state episode closes (that episode is not built in this fixture);
  derived-edge asOfNotes and `labelVersionChange.supersessionChains` (now `[]` + `labelerChangePairs`) rewritten; intent.json
  rationales no longer carry `supersedesUid=` and the notes state R-23; questions.md Q-D5-26 rewritten (no supersession chains).
  Also aligned the stale UseConstraint uids in questions.md Q-D5-23 / Q-D5-24 with the assertions.yaml uids (use-constraint-key/v2).
  R-35: 2 snapshots EXTRACTED_TEXT_BYTES → TOOL_RENDITION (locators.yaml; intent.json already TOOL_RENDITION).
- **antioxidant-exercise-disconfirmation** — F-05: x06 note no longer names the ClaimOccurrence label. R-26: the 4 structural
  OPERATIONALIZED_BY rows become asserted rows (AssertedRecordedProperties: relationshipUid, assertionUid, recordedFrom,
  lastWriterRunId; `orderIndex` dropped) authorized by new Assertions o01–o04 (asserter Agent `hu:agent:ks-curation`, basisKind
  CURATOR_CLASSIFICATION, recorded time only, evidence = the former rationale locator); intent edge.structural ×4 → edge.assert
  with an Agent subject. R-15: Ristow / Paulsen first-author asserters → D3 Publications `hu:publication:pmid-19433800` and
  `hu:publication:pmid-24492839` (identifiers PMID / DOI / PMCID as printed in source.md) in assertions.yaml (5 assertions) and
  intent.json (Publication subjects). questions.md Q-D5-01 / Q-D5-02 updated. R-35: 1 snapshot → TOOL_RENDITION.
- **pregnancy-magnesium-upper-limit** — computedNotStored.Q-D5-06 `verdict: ABOVE` → `doseVsLimit: ABOVE` + note (the pattern's
  computed string column, not a stored SemanticVerdict). questions.md Q-D5-13 PROTOCOL_AUTHORED_BY → AUTHORED_BY (R-80).
  R-35: 2 snapshots → TOOL_RENDITION.
- **sleep-toolkit-unstructured** — R-09/R-27: both `mention.stage` proposals removed from intent.json; "most sleep medications"
  binds no assertion (surface form stays in locator l24-step11); the "overly intense dreams" Condition that a04 binds to gets a
  RESOLUTION Assessment `hu:assessment:d5-sleep-res-overly-intense-dreams` (evidence l18 / l33, role CONTEXT, PROPOSED) with kernel
  ASSESSES / HAS_EVIDENCE rows; Condition name no longer says "Mention". R-82: a10 RECEIVES_VALUE_FROM NEGATIVE → DISCLOSES_INTEREST
  NEGATIVE / DENIES (assertions.yaml, intent.json, questions.md Q-D5-13). R-35: 1 snapshot → TOOL_RENDITION.

## After

```
node C:/.../final/_work/lint-fixtures.mjs --fixture D5/<folder>     # each: errors 0, warnings 0
node <scratchpad>/vintent.mjs                                        # 4/4 zod true, json true (proposals 10, 89, 11, 48)
```

Lint 22 → 0 (errors 8 → 0, warnings 14 → 0). No owner-gated item remains for D5.

## Gaps recorded (not schema changes)

- intent v1 has no Assessment proposal kind: the sleep RESOLUTION Assessment lives in assertions.yaml only (intent notes say so).
- sirolimus: R-23's "leaves current when the label-version episode closes" cannot be shown structurally here: the fixture has no
  label-version state episode for the SPL versions; the as-of exit is documented in notes only.
- The D5 retrieval patterns (Q-D5-13 assertion branch on RECEIVES_VALUE_FROM NEGATIVE; Q-D5-26 supersession chains) are pattern
  owners' items; the fixture answers now follow R-82 / R-23.

FU-03 table: D5 rows (antioxidant, pregnancy — new row, sirolimus, sleep) set to "applied 2026-10-09 … owner-gated: none".

---

<!-- stage: _runlog/closeout-S-fixtures-D6.md -->

# Close-out: fixture editor (S) — final/fixtures/D6

2026-10-09. Closes FU-03 for the seven D6 copies under `final/fixtures/D6/`. No SDL change (candidate sha256 c7cf1235…4793
untouched). Nothing committed (the coordinator commits). Research only, not medical advice.

## Inputs

- FU-03 table rows D6/* in `final/fixtures/README.md` ("Residual non-final names and pending ruling edits"): 1 × R-09/R-27
  (filing-channels), 4 × R-30 (label-versions, prepared-food, proprietary-blend, recall-moringa).
- `final/_work/rulings.yaml` module D6: no `op: edit-fixture` row. The rename ops (R-62 HAS_RECIPE_INGREDIENT, R-68
  MANUFACTURER_UNNAMED, R-73 SAMPLE_TESTED_POSITIVE_FOR) were already applied by the repath stage; R-30 `remove-field`
  ComponentLineProperties is the structural edit applied here.
- `final/vocabularies/predicates.yaml`: the 38 entries whose `usedIn` names a D6 fixture are all `registered`
  (no alias-of / retired-by re-key falls on D6). The K/D10/D1/D2/D12 re-keys of the brief do not touch D6 fixtures.

## Baseline

```
$ node C:/…/final/_work/lint-fixtures.mjs --fixture D6/<folder>     (each of the 7)
filing-channels-niagen-10k          2 errors  (retired-name 2: Mention L420, L425)
label-versions-truniagen-dsld      48 errors  (edge-property 24, retired-name 24)
offer-roles-price-kinds-truniagen   0
prepared-food-bigmac-mcdonalds     72 errors  (edge-property 36, retired-name 36)
proprietary-blend-ag1              40 errors  (edge-property 20, retired-name 20)
recall-moringa-mogo                 8 errors  (edge-property 4, retired-name 4)
retailer-reformulation-claim-iherb  0
total 170 errors, 0 warnings (matches the predicate-registry baseline row D6: 170 / 0)
```

Backup of the pre-edit folders and sha256 of every source.md / locators.yaml: scratchpad `d6-backup/`, `d6-frozen.sha256`.

## Edits

1. R-30 (scratch script `r30-d6.mjs`, line-level so comments and layout stay): every `declaredNameVerbatim`,
   `formVerbatim`, `statementVerbatim` edge property of a DECLARES_COMPONENT Assertion is removed from `edgeProperties`
   and prepended, value unchanged, to that Assertion's `qualifiers` as `declaredName:'…'`, `form:'…'`, `statement:'…'`
   (same quoting as the D7 `roleText:'…'` qualifiers). The script re-parses the YAML and checks the document equals the
   original minus the fields plus the qualifier prefix, and cross-checks each intent proposal `p-<id>` against the YAML
   Assertion `<id>`.
   - intent.json: biotech-knowledge-intent.v1 has no `assertion.qualifiers` (gap already recorded as OD-09); the fields are
     removed from `edgeProperties` and the qualifiers appended to the proposal `rationale`
     ("R-30 authorizing-Assertion qualifiers (intent v1 has no assertion.qualifiers; carried here): …"). Each intent's
     `notes` already lists Assertion qualifiers as not expressible in v1.
   - Counts (yaml fields / Assertions / intent fields): label-versions 12/9/12, prepared-food 18/14/18, proprietary-blend
     10/10/10, recall-moringa 2/1/2 → 42 fields on 34 Assertions, 42 intent fields.
   - prepared-food questions.md Q-D6-10 path: `DECLARES_COMPONENT.statementVerbatim` → the DECLARES_COMPONENT authorizing
     Assertion's `statement:` qualifier.
2. R-09/R-27 filing-channels-niagen-10k ch2: the two unresolved surface forms "contract manufacturers" said
   `edge: "Mention staged, unresolved …"`; now `edge: "none: unresolved surface form (no named organization), so no derived
   MENTIONS edge; R-09/R-27 stage no surface-form node (…)"`. Offsets and surface forms unchanged.

Unchanged: every source.md, locators.yaml (quotes), snapshot digest, sourced number / identifier / quote
(`sha256sum -c d6-frozen.sha256` → ok). offer-roles-price-kinds-truniagen and retailer-reformulation-claim-iherb needed no
edit.

## After

```
$ node C:/…/final/_work/lint-fixtures.mjs --fixture D6/<folder>     (each of the 7)
all 7: 0 errors, 0 warnings
$ node <scratch>/val-d6.mjs C:/…/final/fixtures/D6     (zod IngestionIntent + Ajv 2020 biotech-knowledge-intent.v1.json, as validate-intents.mjs)
all 7 intent.json: zod true, jsonSchema true
```

(The shared `_work/intent-validation.json` was not regenerated, to avoid racing other editors; the coordinator's
re-run of validate-intents.mjs picks these up.)

Lint 170 → 0. FU-03 rows D6/* in fixtures/README.md set to "applied", owner-gated items: none.

## Not done here (other roles)

- D6 retrieval patterns still read the removed fields (pattern lint rulingBroken: Q-D6-01, CQ-PF-01, CQ-AX-25, Q-D6-08,
  Q-D6-10, Q-D6-11 per `_runlog/closeout-A6-D6.md`); they are pattern-owner / S pattern edits, not fixture edits.
- filing-channels-niagen-10k/source.md (frozen) still names the pre-R-68 predicate MANUFACTURER_STATEMENT once in prose;
  assertions.yaml and intent.json use MANUFACTURER_UNNAMED. No D6 source.md names an R-30 field.

---

<!-- stage: _runlog/closeout-refresh.md -->

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

---

<!-- stage: _runlog/closeout-fix.md -->

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
