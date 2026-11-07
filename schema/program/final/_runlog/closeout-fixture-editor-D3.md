# Close-out — fixture editor (S) for final/fixtures/D3/ (FU-03)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S). Edited only `final/fixtures/D3/<folder>/` (assertions.yaml, intent.json, questions.md) and the D3 rows of the FU-03 table in `final/fixtures/README.md`. No SDL change; source.md, locators.yaml, snapshot digests and sourced values untouched; nothing committed.

## Inputs
- FU-03 table rows: `D3/dq-bone-trial-unstructured` (pending R-82 FUNDED_BY needs a D7.Organization funder + roleText:), `D3/resveratrol-retraction` (residual HAS_REVISION_STATUS ×8 for R-44; pending F-05 ClaimOccurrence label). No row for `D3/aspree-registry-history-harm`.
- `final/vocabularies/predicates.yaml`: no alias-of / retired-by / proposed-new entry is used by a D3 fixture (scan of every non-registered entry whose sources name `final/fixtures/D3/`: 0 hits) — no predicate re-keys to apply.
- `final/_work/rulings.yaml`: no `edit-fixture` op under D3 (the R-44 resveratrol op is D11's own fixture). Rulings applied as they bear on these copies: R-44, R-42/R-43, R-82, F-05.

## Baseline lint
```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D3/<folder>
  aspree-registry-history-harm   errors 0, warnings 0
  dq-bone-trial-unstructured     errors 1 (enum-value: disagreements.5.registry NONE), warnings 0
  resveratrol-retraction         errors 2 (predicate-unregistered OCCURRENCE_OF; relationship-pair ChemicalSubstance-[:OCCURRENCE_OF]->Claim), warnings 7 (retired-name HAS_REVISION_STATUS: assertions 817, 846, 1947, 1949, 1957; intent 1709, 1711)
  total 10 (3 errors, 7 warnings)
```
Intent validation (zod IngestionIntent + Ajv 2020-12 over biotech-knowledge-intent.v1.json; scoped copy of `_work/validate-intents.mjs` in the session scratchpad so the shared `_work/intent-validation.json` is not rewritten): all three valid (proposals 119 / 120 / 24).

## Edits (structural only)
dq-bone-trial-unstructured
1. R-82 a64: FUNDED_BY FIELD literal → RELATIONSHIP `pub` → D7.Organization `org-nih` (new resolved entity "National Institutes of Health", the funder the acknowledgements name, l39); the funder-role sentence (l40) moves to qualifier `roleText:`; evidence l39 + l40. The table's "a64 names no funder" holds for l40 alone; l39 in the same paragraph names it, so no fact is invented.
2. intent.json: p-a64 (assertion.literal) removed; notes list a64 FUNDED_BY as not expressible in v1 (no entity-object assertion kind, no qualifiers field) — this fixture's existing convention (a57–a61 AUTHORED_BY).
3. questions.md Q-D3-08 answer names the FUNDED_BY object and roleText.
4. disagreements[masking].registry `NONE` → `RegistrationVersion.masking NONE` (lint read the free-text key `registry` as the RegistryKind enum; the registry's value NONE is unchanged).

resveratrol-retraction
5. R-42/R-43 a06: Source HAS_IDENTIFIER DOI (the work's DOI on a second Subjectable) → asserted RENDITION_OF Source → Publication (AssertedRecordedProperties; same asserter NLM; evidence l06 DOI + l07 PMID; qualifier `rendition-rule:`). intent p-a06 identifier.attach → edge.assert RENDITION_OF (no edgeProperties).
6. F-05 / OCCURRENCE_OF a21: predicate OCCURRENCE_OF and object Claim → `occurrenceOf:` (structural edge) + `proposition:`; note no longer names a ClaimOccurrence label. The proposition's binding predicate is not registered → `predicate: null` + `predicatePending` (owner-gated, registrar D2 per R-52); not invented.
7. R-44: a11 HAS_REVISION_STATUS kept (OpenAlex flag, no identified notice — the case R-44 keeps it for); its note, the projection rule, kernelPathCQ_EV_05 and questions.md CQ-EV-05 now read Source -RENDITION_OF-> Publication instead of the shared-DOI join; prose no longer repeats the predicate name.
8. Projection values: RETRACTED → RETRACTION, NONE_KNOWN → null (SourceRevisionKind); questions.md Q-D3-03 filter `= RETRACTION`.

aspree-registry-history-harm
9. projections: Publication.revisionStatus result NONE_KNOWN → null (R-44).

No predicate re-key applied (none assigned). source.md, locators.yaml, snapshot digests, quotes and sourced numbers untouched (`git diff --stat` lists only assertions.yaml, intent.json, questions.md).

## Final lint and validation
```
node .../final/_work/lint-fixtures.mjs --fixture D3/<folder>
  aspree-registry-history-harm   0 errors, 0 warnings
  dq-bone-trial-unstructured     0 errors, 0 warnings
  resveratrol-retraction         0 errors, 3 warnings: retired-name HAS_REVISION_STATUS at assertions.yaml:826 (a11), intent.json:1720,1722 (p-a11) — legitimate under R-44, kept
node .../final/_work/lint-fixtures.mjs  (summary only, baseline not rewritten) -> D3 {"fixtures":3,"clean":3,"errors":0,"warnings":3}
scoped intent validation (zod + Ajv): aspree 119 ok, dq-bone 119 ok (was 120), resveratrol 24 ok
```
Violations 10 (3 errors, 7 warnings) → 3 (0 errors, 3 legitimate warnings).

## Owner-gated / left
- resveratrol a21: binding predicate for "Resveratrol increases longevity through SirT1 …" (no registered predicate; the Claim carries no propositionHashInput in this fixture). Registrar D2 (R-52) to register one; then a21 and the Claim binding take it.
- FU-03 README rows D3/dq-bone-trial-unstructured and D3/resveratrol-retraction updated to "applied".
