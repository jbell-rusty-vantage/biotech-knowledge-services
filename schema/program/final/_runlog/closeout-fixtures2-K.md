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
