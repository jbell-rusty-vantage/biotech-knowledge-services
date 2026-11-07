# Close-out: fixture editor (S), final/fixtures/D8 — FU-03 (2026-10-09)

Scope: `final/fixtures/D8/<folder>/` only (6 fixtures). SDL unchanged (candidate sha256 c7cf1235…4793). Nothing committed
(the coordinator commits). source.md, locators.yaml and snapshot digests untouched (sha256 of all 6 source.md + 6
locators.yaml checked before/after: identical). Research only, not medical advice.

## What applies to D8

| source | D8 items |
| --- | --- |
| FU-03 table (fixtures/README.md) | eurofins-coa-quantity-by-input: R-16; nmn-us-exclusion-reversal: R-23 supersedesUid residual (assertions.yaml 592, intent-step2.json 651, questions.md 8) |
| `_work/rulings.yaml` D8 `edit-fixture` ops | R-16 only ("COA assertions asserted by the issuing lab, not the executor agent") |
| `vocabularies/predicates.yaml` re-keys (alias-of / retired-by) | none used by D8 fixtures (lint: 0 predicate-alias, 0 predicate-retired) |
| other typical rulings (R-30, R-44, R-09/R-27, R-15, R-43/R-26, R-47, R-49, R-55, R-58, F-05) | grep of D8 fixtures: no occurrence (the `*Verbatim` keys in D8 are D8 node properties the candidate declares, not R-30 edge fields) |

## Baseline

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D8/<folder>   (×6)
certification-listing-lot-scope 0/0; eu-nrcl-authorisation-data-protection 0/0; eurofins-coa-quantity-by-input 0/0;
imu-tek-warning-letter-recall 0 errors / 2 warn (predicate-proposed CLAIMS_THERAPEUTIC_EFFECT, assertions.yaml 466 + intent.json i12);
nmn-us-exclusion-reversal 0 errors / 2 warn (retired-name supersedesUid, assertions.yaml 592, intent-step2.json 651);
us8197807-claims-held-invalid 0/0.   Total: 0 errors, 4 warnings.
```

## Edits

1. **R-16, eurofins-coa-quantity-by-input** (scratch script `edit-eurofins.mjs`, textual, count-checked):
   - assertions.yaml c08–c15 (contrast COA lot 2404101ORA: QUALITY_RESULT_FOR ×3, MEASURES_ANALYTE ×3, LOT_OF, LOT_EXPIRY_AS_PRINTED):
     asserter `agent-a7` (Agent) → `elite` (D7.Organization, Elite Source Products, Inc.). R-16 rule 1 lists "Manufactured for"
     as a presented issuer; the COA prints "Manufactured for: Elite Source Products, Inc." (loc-as-mfr). The free-text qualifier
     ("'Manufactured for' names the brand owner, which is not the issuer") is replaced by a note citing R-16 rule 1. No
     `asserterBasis` qualifier (rule 1 needs none; PUBLISHER_DEFAULT / INFERRED do not apply).
   - No ISSUED_BY row added: the COA names no laboratory and no signatory, and "Manufactured for" does not say who issued the
     result (not invented).
   - intent.json: 8 `asserterRef` agent-a7 → elite, 8 rationales reworded, new subject `elite` (Organization, use_existing),
     `notes` updated. Eurofins rows c01–c07 were already asserted by Eurofins. The two D8.coa-classification QUALITY
     assessments stay with the agent (BellLabs curation, R-16 rule 3).
   - Stale prose left as is: source.md says the contrast rows "are asserted by the executor agent with a qualifier" (source.md
     is frozen this round).
2. **R-23, nmn-us-exclusion-reversal**: checked — n14 supersedes n04; both asserted by FDA (`ref: fda`), so the same-asserter
   rule holds and the supersession stays. assertions.yaml n14 note and intent-step2.json n14 rationale reworded to state the
   same-asserter check (the structured `supersedes: n04` key is unchanged); intent v1 cannot carry the link (OD-09).
   questions.md Q-D8-01 keeps "n14 names it in supersedesUid" (correct kernel field use; not linted).
3. Other agent-asserted rows checked under R-16 rule 3 and kept: eu-nrcl e08 (ENTRY_INTO_FORCE_COMPUTED, CALCULATED) and
   nmn n09 (CITED_TRIAL_ID_AS_PARSED, the research-stage parser reading, expected REJECTED).

## After

```
lint-fixtures.mjs --fixture D8/<folder> (×6): 0 errors; warnings 2, all imu-tek predicate-proposed CLAIMS_THERAPEUTIC_EFFECT
node <scratchpad>/validate-d8.mjs   (zod IngestionIntent + Ajv 2020-12 over biotech-knowledge-intent.v1.json, as validate-intents.mjs,
                                     without overwriting _work/intent-validation.json)
  7/7 D8 intent files: zod ok, jsonSchema ok (eurofins intent.json: 22 proposals, 17 subjects)
```

Lint: 0 errors / 4 warnings → 0 errors / 2 warnings. Remaining (owner-gated): MD-X-03(a) — i12 `CLAIMS_THERAPEUTIC_EFFECT`
is proposed-new (registrar D6); the registry candidate (IMPROVES_TARGET / INTENDED_FOR_TARGET, claimClass DISEASE_CLAIM,
R-83) needs a Target object the quoted claim does not name, so it is not re-keyed here. Also noted, no lint hit:
MD-X-03(c) D8 ORGANIZATION_RENAMED vs D7 FORMER_NAME (us8197807 a-row at assertions.yaml 556).

## README

`fixtures/README.md` FU-03 table: rows D8/eurofins-coa-quantity-by-input and D8/nmn-us-exclusion-reversal → applied; row
D8/imu-tek-warning-letter-recall added with the owner-gated MD-X-03(a) item. No other rows touched.
