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
