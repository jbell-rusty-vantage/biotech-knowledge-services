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
