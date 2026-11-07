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
