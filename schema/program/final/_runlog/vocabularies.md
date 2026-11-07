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
