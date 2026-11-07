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
