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
