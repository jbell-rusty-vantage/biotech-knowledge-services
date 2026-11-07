# Close-out (recovery, 2nd attempt): fixture editor (S), final/fixtures/D8 — FU-03 (2026-10-09)

Scope: `final/fixtures/D8/<folder>/` (6 fixtures) and the D8 rows of the FU-03 table in `final/fixtures/README.md`. SDL
unchanged (candidate sha256 c7cf1235…4793). Nothing committed (the coordinator commits). The folder was reset to 31390a6
before this round; the lost first attempt's log `closeout-fixtures-D8.md` was used as a guide and every decision re-checked.
`final/_work/repath-fixtures.mjs` was never run or imported (only read with grep; `lint-fixtures.mjs` reads its RESIDUAL
array as text, checked at lines 62-65). Only `lint-fixtures.mjs --fixture D8/<folder>` (print-only mode) was executed from
`_work/`. source.md and locators.yaml: sha256 of all 12 files recorded before and re-checked after (`sha256sum -c`, 12 OK).
Research only, not medical advice.

## What applies to D8

| source | D8 items |
| --- | --- |
| FU-03 table | eurofins-coa-quantity-by-input: R-16; nmn-us-exclusion-reversal: R-23 supersedesUid residual (assertions.yaml 592, intent-step2.json 651, questions.md 8) |
| `_work/rulings.yaml` D8 `edit-fixture` | R-16 only. R-73 `request-fixture` (COVERS → ProductVariant; STATUS_OF → Product) needs new sources: tracked as FX-02 / FX-03 in open-questions.md, not an edit |
| `_work/rulings.yaml` D8 `edit-question` touching fixture text | R-08 CQ-PF-03 → CQ-PF-03a (certification-listing questions.md row label) |
| `vocabularies/predicates.yaml` alias-of / retired-by / fixtureEdit | none for D8 fixtures (lint 0 predicate-alias, 0 predicate-retired; the only fixtureEdit rows naming D8 are D10 fixtures' re-keys to D8 predicates) |
| other typical rulings (R-09/27, R-15, R-30, R-44, R-47, R-49, R-55, R-58, R-68, R-82, R-85, F-05) | grep of all D8 fixture files: no occurrence. Residual old SpecComparator value (R-57) found in eurofins questions.md prose |

## Baseline

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D8/<folder>   (x6)
certification-listing-lot-scope 0/0; eu-nrcl-authorisation-data-protection 0/0; eurofins-coa-quantity-by-input 0/0;
imu-tek-warning-letter-recall 0 errors / 2 warn (predicate-proposed CLAIMS_THERAPEUTIC_EFFECT, assertions.yaml 466 + intent.json i12);
nmn-us-exclusion-reversal 0 errors / 2 warn (retired-name supersedesUid, assertions.yaml 592, intent-step2.json 651);
us8197807-claims-held-invalid 0/0.   Total: 0 errors, 4 warnings.
```

## Edits (scratch scripts in the session scratchpad, exact count-checked text replacements; LF kept)

1. **R-16, eurofins-coa-quantity-by-input** (`edit-eurofins.mjs`):
   - assertions.yaml c08–c15 (contrast COA lot 2404101ORA: QUALITY_RESULT_FOR x3, MEASURES_ANALYTE x3, LOT_OF, LOT_EXPIRY_AS_PRINTED):
     asserter `agent-a7` (Agent) → `elite` (D7.Organization, Elite Source Products, Inc.; entity already declared). R-16 rule 1
     lists "Manufactured for" as a presented issuer; locator loc-as-mfr quotes "Manufactured for: Elite Source Products, Inc.".
     The free-text qualifier ("'Manufactured for' names the brand owner, which is not the issuer") → a `note:` citing R-16
     rule 1 (8x). No `asserterBasis` qualifier (rule 1 needs none). No ISSUED_BY added: the COA names no laboratory and no
     signatory (not invented).
   - intent.json: `asserterRef` agent-a7 → elite (8x), rationale reworded (8x), new subject `elite` (Organization,
     use_existing), `notes` updated. Eurofins rows c01–c07 were already asserted by Eurofins. The two D8.coa-classification
     QUALITY assessments stay with the agent (R-16 rule 3); the agent subject stays declared in intent.json.
   - questions.md Q-D8-09: "(NOT_MORE_THAN 0.5 µg)" → "(`specComparator LTE` 0.5 µg; R-57 QuantityComparator)" — the
     assertions already use LTE. Q-D8-05 "issuer not stated" kept (true for the laboratory issuer).
   - source.md prose about agent-asserted contrast rows left as is (source.md frozen).
2. **R-23, nmn-us-exclusion-reversal**: n14 (`supersedes: n04`) and n04 are both asserted by FDA (`ref: fda`) → same-asserter
   supersession, kept. assertions.yaml n14 note and intent-step2.json n14 rationale: "(supersedesUid)" → "(R-23 checked: n04
   and n14 are both asserted by FDA, a same-asserter supersession, kept)". intent v1 cannot carry the link (OD-09).
   questions.md Q-D8-01 keeps "n14 names it in supersedesUid" (correct kernel field use; questions.md is not linted).
3. **R-08, certification-listing-lot-scope** questions.md: row label "CQ-PF-03" → "CQ-PF-03a (packet id CQ-PF-03; R-08)".
4. Checked and kept under R-16 rule 3 (BellLabs statements): eu-nrcl e08 (ENTRY_INTO_FORCE_COMPUTED, CALCULATED), nmn n09
   (CITED_TRIAL_ID_AS_PARSED, research-stage parser reading, expected REJECTED).

## Verification

```
node <scratchpad>/d8/validate-d8.mjs   (zod IngestionIntent + Ajv 2020-12 over packages/contracts/json-schema/biotech-knowledge-intent.v1.json
                                       with ajv-formats@3.0.1, as _work/validate-intents.mjs; writes nothing)
  7/7 D8 intent files: zod ok, jsonSchema ok (eurofins intent.json: 22 proposals, 17 subjects)
lint-fixtures.mjs --fixture D8/<folder> (x6):
  0 errors; 2 warnings, both imu-tek predicate-proposed CLAIMS_THERAPEUTIC_EFFECT (assertions.yaml 466, intent.json i12)
sha256sum -c frozen-before.sha  -> 12 OK (6 source.md + 6 locators.yaml)
git diff --stat fixtures/D8: 6 files, +53 / -61
```

Lint: 0 errors / 4 warnings → 0 errors / 2 warnings.

Remaining, owner-gated (already recorded in open-questions.md, no new entry needed):
- MD-X-03(a): imu-tek i12 `CLAIMS_THERAPEUTIC_EFFECT` is proposed-new (registrar D6); its candidate IMPROVES_TARGET /
  INTENDED_FOR_TARGET with claimClass DISEASE_CLAIM (R-83) awaits the registrar; not re-keyed.
- MD-X-03(c): us8197807 `ORGANIZATION_RENAMED` (D8) vs D7 `FORMER_NAME` duplicate (registered; no lint hit).
- FX-02 / FX-03 (R-73 request-fixture): new D8 fixtures need new sources (NSF variant listing; LNHPD NPN licence).

## README

`fixtures/README.md` FU-03 table: rows D8/eurofins-coa-quantity-by-input and D8/nmn-us-exclusion-reversal → applied; row
D8/imu-tek-warning-letter-recall added (owner-gated MD-X-03(a)). Edited by a line-prefix script that re-reads the file
right before writing; no other rows touched.
