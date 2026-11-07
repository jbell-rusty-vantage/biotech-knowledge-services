# Close-out: fixture editor (S) — final/fixtures/D6

2026-10-09. Closes FU-03 for the seven D6 copies under `final/fixtures/D6/`. No SDL change (candidate sha256 c7cf1235…4793
untouched). Nothing committed (the coordinator commits). Research only, not medical advice.

## Inputs

- FU-03 table rows D6/* in `final/fixtures/README.md` ("Residual non-final names and pending ruling edits"): 1 × R-09/R-27
  (filing-channels), 4 × R-30 (label-versions, prepared-food, proprietary-blend, recall-moringa).
- `final/_work/rulings.yaml` module D6: no `op: edit-fixture` row. The rename ops (R-62 HAS_RECIPE_INGREDIENT, R-68
  MANUFACTURER_UNNAMED, R-73 SAMPLE_TESTED_POSITIVE_FOR) were already applied by the repath stage; R-30 `remove-field`
  ComponentLineProperties is the structural edit applied here.
- `final/vocabularies/predicates.yaml`: the 38 entries whose `usedIn` names a D6 fixture are all `registered`
  (no alias-of / retired-by re-key falls on D6). The K/D10/D1/D2/D12 re-keys of the brief do not touch D6 fixtures.

## Baseline

```
$ node C:/…/final/_work/lint-fixtures.mjs --fixture D6/<folder>     (each of the 7)
filing-channels-niagen-10k          2 errors  (retired-name 2: Mention L420, L425)
label-versions-truniagen-dsld      48 errors  (edge-property 24, retired-name 24)
offer-roles-price-kinds-truniagen   0
prepared-food-bigmac-mcdonalds     72 errors  (edge-property 36, retired-name 36)
proprietary-blend-ag1              40 errors  (edge-property 20, retired-name 20)
recall-moringa-mogo                 8 errors  (edge-property 4, retired-name 4)
retailer-reformulation-claim-iherb  0
total 170 errors, 0 warnings (matches the predicate-registry baseline row D6: 170 / 0)
```

Backup of the pre-edit folders and sha256 of every source.md / locators.yaml: scratchpad `d6-backup/`, `d6-frozen.sha256`.

## Edits

1. R-30 (scratch script `r30-d6.mjs`, line-level so comments and layout stay): every `declaredNameVerbatim`,
   `formVerbatim`, `statementVerbatim` edge property of a DECLARES_COMPONENT Assertion is removed from `edgeProperties`
   and prepended, value unchanged, to that Assertion's `qualifiers` as `declaredName:'…'`, `form:'…'`, `statement:'…'`
   (same quoting as the D7 `roleText:'…'` qualifiers). The script re-parses the YAML and checks the document equals the
   original minus the fields plus the qualifier prefix, and cross-checks each intent proposal `p-<id>` against the YAML
   Assertion `<id>`.
   - intent.json: biotech-knowledge-intent.v1 has no `assertion.qualifiers` (gap already recorded as OD-09); the fields are
     removed from `edgeProperties` and the qualifiers appended to the proposal `rationale`
     ("R-30 authorizing-Assertion qualifiers (intent v1 has no assertion.qualifiers; carried here): …"). Each intent's
     `notes` already lists Assertion qualifiers as not expressible in v1.
   - Counts (yaml fields / Assertions / intent fields): label-versions 12/9/12, prepared-food 18/14/18, proprietary-blend
     10/10/10, recall-moringa 2/1/2 → 42 fields on 34 Assertions, 42 intent fields.
   - prepared-food questions.md Q-D6-10 path: `DECLARES_COMPONENT.statementVerbatim` → the DECLARES_COMPONENT authorizing
     Assertion's `statement:` qualifier.
2. R-09/R-27 filing-channels-niagen-10k ch2: the two unresolved surface forms "contract manufacturers" said
   `edge: "Mention staged, unresolved …"`; now `edge: "none: unresolved surface form (no named organization), so no derived
   MENTIONS edge; R-09/R-27 stage no surface-form node (…)"`. Offsets and surface forms unchanged.

Unchanged: every source.md, locators.yaml (quotes), snapshot digest, sourced number / identifier / quote
(`sha256sum -c d6-frozen.sha256` → ok). offer-roles-price-kinds-truniagen and retailer-reformulation-claim-iherb needed no
edit.

## After

```
$ node C:/…/final/_work/lint-fixtures.mjs --fixture D6/<folder>     (each of the 7)
all 7: 0 errors, 0 warnings
$ node <scratch>/val-d6.mjs C:/…/final/fixtures/D6     (zod IngestionIntent + Ajv 2020 biotech-knowledge-intent.v1.json, as validate-intents.mjs)
all 7 intent.json: zod true, jsonSchema true
```

(The shared `_work/intent-validation.json` was not regenerated, to avoid racing other editors; the coordinator's
re-run of validate-intents.mjs picks these up.)

Lint 170 → 0. FU-03 rows D6/* in fixtures/README.md set to "applied", owner-gated items: none.

## Not done here (other roles)

- D6 retrieval patterns still read the removed fields (pattern lint rulingBroken: Q-D6-01, CQ-PF-01, CQ-AX-25, Q-D6-08,
  Q-D6-10, Q-D6-11 per `_runlog/closeout-A6-D6.md`); they are pattern-owner / S pattern edits, not fixture edits.
- filing-channels-niagen-10k/source.md (frozen) still names the pre-R-68 predicate MANUFACTURER_STATEMENT once in prose;
  assertions.yaml and intent.json use MANUFACTURER_UNNAMED. No D6 source.md names an R-30 field.
