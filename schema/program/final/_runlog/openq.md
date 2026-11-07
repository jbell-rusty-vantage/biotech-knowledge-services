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
