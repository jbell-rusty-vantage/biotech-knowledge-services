# Close-out (recovery, second attempt): fixture editor (S) — final/fixtures/D6

2026-10-09. Re-applies FU-03 for the seven D6 copies after the coordinator reset `final/fixtures/` to 31390a6. Guide:
`_runlog/closeout-S-fixtures-D6.md` (lost first attempt). No SDL change; nothing committed; repath-fixtures.mjs not run
or imported (lint-fixtures.mjs reads its RESIDUAL list as text only). Research only, not medical advice.

## Inputs re-checked

- FU-03 rows D6/* in `fixtures/README.md`: filing-channels (R-09/R-27 Mention ×2), label-versions / prepared-food /
  proprietary-blend / recall-moringa (R-30 verbatim fields; prepared-food also questions.md L5).
- `_work/rulings.yaml` module D6: no `op: edit-fixture`; R-30 `remove-field` ComponentLineProperties is the structural edit.
  R-62 / R-68 / R-73 renames were already in the baseline copies.
- `vocabularies/predicates.yaml`: 38 entries reference `final/fixtures/D6/`, all `registered` (no alias-of / retired-by
  re-key). The K / D10 / D1 / D2 / D12 re-keys of the brief do not touch D6 fixtures.

## Baseline (`node C:/…/final/_work/lint-fixtures.mjs --fixture D6/<folder>`)

```
filing-channels-niagen-10k          2  {retired-name 2}
label-versions-truniagen-dsld      48  {edge-property 24, retired-name 24}
offer-roles-price-kinds-truniagen   0
prepared-food-bigmac-mcdonalds     72  {edge-property 36, retired-name 36}
proprietary-blend-ag1              40  {edge-property 20, retired-name 20}
recall-moringa-mogo                 8  {edge-property 4, retired-name 4}
retailer-reformulation-claim-iherb  0
total 170 errors, 0 warnings
```

Pre-edit copy: scratchpad `d6-backup2/` (identical to the first attempt's `d6-backup/`).

## Edits

1. filing-channels-niagen-10k/assertions.yaml ch2 (sed): two `edge: "Mention staged, unresolved …"` → `edge: "none:
   unresolved surface form (no named organization), so no derived MENTIONS edge; R-09/R-27 stage no surface-form node …"`.
   Surface forms and offsets unchanged; intent.json had no Mention.
2. R-30 (scratch `r30-d6.mjs`, writes only under final/fixtures/D6/): each `declaredNameVerbatim` / `formVerbatim` /
   `statementVerbatim` edge property removed and prepended to the authorizing Assertion's `qualifiers` as
   `declaredName:'…'` / `form:'…'` / `statement:'…'` (values unchanged; script re-parses and checks the YAML equals the
   original minus fields plus qualifiers, and that each intent proposal `p-<id>` matches YAML Assertion `<id>`).
   intent.json: v1 has no assertion.qualifiers (OD-09) → fields removed from edgeProperties, qualifiers appended to the
   proposal `rationale`.
   ```
   label-versions 12 fields / 9 Assertions / 12 intent fields; prepared-food 18/14/18; proprietary-blend 10/10/10;
   recall-moringa 2/1/2  → 42 fields on 34 Assertions
   ```
3. prepared-food questions.md L5 (Q-D6-10 path): `DECLARES_COMPONENT.statementVerbatim` → the DECLARES_COMPONENT
   authorizing Assertion's `statement:` qualifier (R-30).

Edits applied: 1 + 42 YAML / 42 intent field moves on 34 Assertions + 1 questions path = 4 folders R-30, 1 folder R-09/R-27.

## After

```
lint-fixtures.mjs --fixture D6/<folder>  → all 7: 0 errors, 0 warnings   (170 → 0)
sha256sum -c d6-frozen.sha256 (14 source.md + locators.yaml) → all OK
val-d6.mjs (zod IngestionIntent + Ajv2020 biotech-knowledge-intent.v1.json) → all 7 intent.json zod true, json true
grep declaredNameVerbatim|formVerbatim|statementVerbatim in D6 (excluding source.md) → 0
```

README FU-03 rows D6/* (5) set to "applied …; owner-gated: none" (targeted line replacement, file re-read before write).
`_work/intent-validation.json` not regenerated (shared file).

## Left for others / notes

- D6 retrieval patterns still read the removed R-30 fields (Q-D6-01, CQ-PF-01, CQ-AX-25, Q-D6-08, Q-D6-10, Q-D6-11) —
  pattern-owner edits, not fixture edits.
- Frozen source.md prose still names old terms (filing-channels: MANUFACTURER_STATEMENT; label-versions: "Mention m01",
  ComponentLineProperties verbatim description); not edited by rule, lint does not scan source.md.
