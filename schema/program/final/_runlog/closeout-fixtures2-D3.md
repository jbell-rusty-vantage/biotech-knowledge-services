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
