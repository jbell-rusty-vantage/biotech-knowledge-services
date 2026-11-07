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
