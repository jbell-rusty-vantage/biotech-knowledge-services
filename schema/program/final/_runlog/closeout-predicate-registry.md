# Close-out: predicate registry (S), 2026-10-09

Closes MD-X-02 and FU-13 (final/open-questions.md); opens MD-X-03 for what the registrars still decide. No SDL change
(candidate sha256 c7cf1235…4793 untouched). Nothing committed (the coordinator commits). Research only, not medical advice.

## Outputs

| file | what |
| --- | --- |
| `final/_work/build-predicates.mjs` | generator of the registry (deterministic; `--check` exits 1 when the file is stale or a used name is unresolved) |
| `final/vocabularies/predicates.yaml` | R-52 registry, 374 entries |
| `final/_work/lint-fixtures.mjs` | fixture lint; exports `loadLintContext`, `lintFixture(dir, ctx)`, `lintFixtures(ctx)` |
| `final/_work/fixture-lint-baseline.json` | baseline lint of the 78 fixtures |
| `final/open-questions.md` | rows MD-X-02 and FU-13 updated (resolved-in-closeout), row MD-X-03 added |

## Inputs read

- Register fragments `final/_work/registers/<M>.relationship.yaml` (predicateOnly, authorizingPredicates, removedPredicates,
  registeredElsewhere, mergedInto, removedRegistrations), cross-checked against the merged `final/relationship-register.yaml`:
  drift 0 (203 merged predicateOnly rows = fragment rows).
- Candidate IR `final/schema/final_biotech_schema_v2.ir.json` (asserted relationship types → authorizing predicates;
  SDL type names for subject / object types; edge-property and enum declarations for the lint).
- `final/_work/rulings.yaml` (global.names.predicates, retiredNames, module register/rename/remove/extend-predicate ops),
  `final/decision-report.md` R-52 and R-53 sections.
- Patterns: `packets/<P>/03-retrieval-patterns.md` (14) and `final/query-patterns.md`; predicate contexts
  (`predicate: 'X'`, `.predicate IN [...]`, `= 'X'`) plus quoted tokens that are known names; Cypher `//` comments skipped;
  questions attributed per heading (03 files), else per line / nearest lead-in line / `Questions:` line.
- Fixtures: `final/fixtures/**/assertions.yaml` and `intent*.json` (159 files): `predicate`, `inputPredicates`,
  `predicateOnly` map keys, `binding.predicate`, intent `assertion.predicate`, assertion.literal `predicate`, predicate-only
  edge.assert `relationshipType`.

## Commands

```
$ node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/build-predicates.mjs
{ "entries": 374,
  "byStatus": { "registered": 286, "proposed-new": 35, "retired-by": 16, "alias-of": 37 },
  "byKind": { "relationship": 102, "authorizing": 65, "literal": 148, "field": 14, "retired": 41, "computation": 4 },
  "closeout": { "MD-X-02 registered": 9, "MD-X-02 retired-by": 4, "FU-13 registered": 1, "FU-13 alias-of": 4,
                "FU-13 retired-by": 4, "closeout alias-of": 12, "closeout retired-by": 6, "closeout registered": 1,
                "closeout proposed-new": 35 },
  "registerDrift": [], "problems": [], "registrarRule3Mismatches": [ 33 rows, informational ] }
$ node …/build-predicates.mjs --check            -> "upToDate": true, exit 0
$ sha256sum final/vocabularies/predicates.yaml    -> f3465df9827bd4d9a0f572f7c8df32795b9f89bf67bff27a8edb1f3cd4c080d2 (two runs, same)

$ node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --baseline
{ "fixtures": 78, "clean": 29, "errors": 562, "warnings": 201,
  "byCategory": { "edge-property": 209, "edge-property-type": 7, "enum-value": 11, "node-property": 2, "node-type": 3,
                  "predicate-alias": 56, "predicate-proposed": 133, "predicate-report-only": 4, "predicate-retired": 34,
                  "predicate-unregistered": 2, "relationship-pair": 4, "relationship-type": 1, "retired-name": 297 } }
$ sha256sum final/_work/fixture-lint-baseline.json -> 43dc6b5b80101f0a5431739775c0f8b1dd1ac6d1fa8e55c8fb0e4e4872da68c7 (two runs, same)
```

Baseline by packet (errors / warnings; fixtures clean of errors):

| packet | fixtures | clean | errors | warnings | main categories |
| --- | ---: | ---: | ---: | ---: | --- |
| K | 6 | 1 | 30 | 22 | predicate-alias 25 (DIRECTLY_ACTIVATES, OFFERS_FOR_SALE), retired-name 21 (supersedesUid, Mention, HAS_REVISION_STATUS) |
| D1 | 5 | 1 | 48 | 20 | edge-property 24 (R-30 verbatim fields), predicate-report-only 4 (EXCEEDS_DOSE_THRESHOLD), predicate-proposed 20 |
| D2 | 5 | 0 | 19 | 0 | edge-property 9 (nNoChangeContexts, R-47), retired-name 9, predicate-alias 1 (HOLDS_EQUITY_IN) |
| D3 | 3 | 1 | 3 | 7 | predicate-unregistered 1 (OCCURRENCE_OF as a predicate), relationship-pair 1, enum-value 1 |
| D4 | 7 | 6 | 2 | 0 | predicate-alias 2 (`AlgorithmVersion.*` FIELD predicates) |
| D5 | 4 | 1 | 8 | 14 | edge-property 4, retired-name 17 (supersedesUid, Mention) |
| D6 | 7 | 2 | 170 | 0 | edge-property 84 + retired-name 86 (R-30 declaredNameVerbatim / formVerbatim / statementVerbatim) |
| D7 | 6 | 1 | 106 | 0 | edge-property 53 + retired-name 53 (R-30 roleTitleVerbatim / stakeClassVerbatim) |
| D8 | 6 | 6 | 0 | 4 | predicate-proposed 2 |
| D9 | 6 | 1 | 65 | 14 | edge-property 30, retired-name 30, predicate-alias 4 (INCREASES_LEVEL), predicate-proposed 14 |
| D10 | 5 | 0 | 60 | 29 | predicate-retired 32, predicate-alias 24 (FU-13 and the other D10 placeholders), predicate-proposed 27 |
| D11 | 5 | 1 | 19 | 5 | edge-property-type 5 (AssertedEdgeProperties where AssertedRecordedProperties), node-type 3 (Mention) |
| D12 | 5 | 2 | 9 | 11 | relationship-pair 3 (QUALITY_RESULT_FOR → Product, R-73), edge-property-type 2 |
| D13 | 5 | 3 | 23 | 14 | retired-name 31 (role AUTHOR/PUBLISHER, derivedFrom=, HAS_REVISION_STATUS), enum-value 6 |
| cross-domain | 3 | 3 | 0 | 61 | predicate-proposed 61 (FIELD / METRIC literals) |

## Decisions (CLOSEOUT table in the generator; each row cites the item and the ruling)

MD-X-02:
- Registered, R-52 rule 3 (owner of the subject type): UNIT_DOSE_AMOUNT, ADMINISTERED_AMOUNT (D3; subject InterventionComponent;
  D1 / D11 contribute), REGISTRY_ID_AS_PRINTED (D3; Publication), PROSPECTIVE_REGISTRATION_FLAG (D3; D11 contributes),
  RECORD_LAST_UPDATED (K; Source; D11 contributes), OUTCOME_MEASURED_WITH (D3; D4 contributes), USED_FOOD_CLASSIFICATION and
  USED_COMPOSITION_DATABASE (D3; D12 contributes). EXCEEDS_DOSE_THRESHOLD confirmed D1 with `storage: report-only` (R-85);
  the lint flags its 4 stored uses in D1/vitamin-b6-threshold-harm.
- Retired by R-52 (pattern names with no registrar): FORM_OF → REALIZES_SUBSTANCE | HAS_ACTIVE_MOIETY; PREPARATION_OF →
  MATERIAL_CONTAINS | FOOD_CONTAINS; CONTAINS_INGREDIENT and DECLARES_AMOUNT → DECLARES_COMPONENT. `patternEdit` on each says
  what D10's Q-D10-07 / Q-D10-11 read instead (the authorizing predicate of a typed edge is its type name, so the
  `p.predicate IN [...]` shape survives).

FU-13 (the nine edge.assert predicates):
- Registered: HIGHER_BIOAVAILABILITY_THAN (D1, rule 3; IngredientMaterial → IngredientMaterial; Q-D10-11).
- Alias (re-key only): DIRECTLY_ACTIVATES → ACTIVATES (D2), OFFERS_FOR_SALE → DISTRIBUTES (D7, R-68),
  ASSOCIATED_WITH_ADVERSE_EFFECT → CAUSES_ADVERSE_EFFECT (D5, R-85), INDICATED_FOR → HAS_APPROVED_INDICATION (D8, R-88).
- Retired (structural edit): MAY_IMPROVE_PROGNOSIS_OF → IMPROVES_TARGET with a Target object (R-83);
  DECLARES_INGREDIENT_FORM → LabelVersion -DECLARES_COMPONENT-> material (R-52); DISCLOSES_ROLE_AT → typed HOLDS_ROLE
  (R-82, R-30); MATERIAL_MANUFACTURED_BY → Organization -MANUFACTURES-> IngredientMaterial (R-68).

Also resolved (fixture or pattern names outside the two lists): HOLDS_EQUITY_IN → HOLDS_STAKE, CONSULTS_FOR → HOLDS_ROLE,
INVENTOR_OF_PATENT_LICENSED_TO → RECEIVES_VALUE_FROM (R-89, D2 Q-D2-21 pattern); SUPPLIES, SUPPLIED_INGREDIENT →
SUPPLIES_MATERIAL and PROCESSED_INGREDIENT → MANUFACTURES (R-68; D2 / D12 patterns); INCREASES_LEVEL → INCREASES_LEVEL_OF;
STATES_REGULATORY_STATUS → RATES_CLAIM; DISCLOSES_AFFILIATE_COMMISSION → DISCLOSES_INTEREST; REPORTS_ADVERSE_EVENT_RATE →
CHARACTERIZES_INCIDENCE; MAX_DAILY_SUPPLEMENTAL_AMOUNT → PER_MAX_DAILY_DOSE_AMOUNT; STATES_METHOD_MAY_CHANGE →
STATES_METHOD_CAVEAT; `AlgorithmVersion.inputFeatureCount` / `.inputPlatforms` → INPUT_FEATURE_COUNT / INPUT_PLATFORMS;
retired CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT (→ HAS_CLAIM_CONDITION, R-93), ARM_DAILY_DOSE (→ ADMINISTERED_AMOUNT),
LABEL_DECLARED_AMOUNT / LABEL_SERVING_DIRECTIONS (→ D6 LabelVersion line and fields); DEVELOPS_THERAPY_TARGETING registrar
moved D2 → D7 (rule 3; the D2 register flagged it for the registry editor). 35 names stay proposed-new (MD-X-03).

## Notes on method

- Subject / object types are SDL names only: structured register fields first, then "X → Y" and "subject … / object …"
  windows of the prose (negated mentions such as "never a Target" are dropped; "D1 substance" reads as ChemicalSubstance),
  else the SDL types the fixtures use (`typesBasis` says which).
- Authorizing entries: every relationship type whose relClass is asserted or whose declaring field says class asserted
  (adds MEASURES, which the IR marks derived with flag derived-registry; MD-X-03 e).
- The lint reads D4's `edgeClass: structural` rows as edge listings (the `predicate` key names the structural type).
- Retired-name scan reuses `RESIDUAL` from `_work/repath-fixtures.mjs` (parsed from its source, one definition).
- Categories overlap by design (an R-30 field is both edge-property and retired-name), so per-category counts do not add
  to a count of distinct defects.
