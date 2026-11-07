# Close-out: fixture editor (S), packet D10 (FU-03)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S). Writes only under `schema/program/final/fixtures/D10/<folder>/` (assertions.yaml, intent.json), my five rows of the FU-03 table in `final/fixtures/README.md`, and this log. SDL unchanged; nothing committed. source.md, locators.yaml, snapshot digests, composed bodies and every sourced number / identifier / quote are untouched.

## Inputs

- FU-03 table rows D10/* (README "Residual non-final names and pending ruling edits"): R-15 on all five; mg-rankings `supersedesUid` ×2 (R-23 check).
- `final/_work/rulings.yaml` D10 edit-fixture ops: R-15 only.
- `final/vocabularies/predicates.yaml` alias / retired entries naming D10 fixtures (fixtureEdit): INDICATED_FOR, ASSOCIATED_WITH_ADVERSE_EFFECT, REPORTS_ADVERSE_EVENT_RATE, STATES_REGULATORY_STATUS, CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT, ARM_DAILY_DOSE, MATERIAL_MANUFACTURED_BY, DISCLOSES_ROLE_AT, DECLARES_INGREDIENT_FORM, LABEL_DECLARED_AMOUNT, LABEL_SERVING_DIRECTIONS, MAX_DAILY_SUPPLEMENTAL_AMOUNT, DISCLOSES_AFFILIATE_COMMISSION, STATES_METHOD_MAY_CHANGE.
- Lint-only findings outside the registry: R-58 enum value (comparisonKind BETWEEN_GROUP), Target `vocabularyKey` (not a Target property).
- Not present in D10 fixtures (grep): Mention / mention.stage, RENDITION_OF, nNoChangeContexts, interim OTHER discourse Assessments, disclosureFinding, HAS_REVISION_STATUS / REVISES, ClaimOccurrence label, INCREASES_LEVEL, HOLDS_EQUITY_IN, AlgorithmVersion.*.

## Commands

```
# baseline (per fixture, saved to the session scratchpad d10fx/before/*.json)
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D10/<folder>
  -> fda-qhc 6 err / 9 warn; livertox 6 / 2; mg-bisglycinate 11 / 8; mg-rankings 35 / 8; opentargets 2 / 2  (total 60 errors, 29 warnings)
# edits: node scripts in the scratchpad (d10fx/e-ot.mjs, e-lt.mjs, e-fda.mjs, e-bg.mjs, e-rk.mjs): exact-match text edits of
#   assertions.yaml (comments kept) and JSON edits of intent.json (indent 1, trailing newline, weight 1.0 kept)
# intent validation (zod IngestionIntent from packages/contracts/dist + Ajv 2020 on json-schema/biotech-knowledge-intent.v1.json,
#   same checks as final/_work/validate-intents.mjs, D10 files only so the shared intent-validation.json is not rewritten)
node <scratchpad>/d10fx/vint.mjs
  -> all five: zod true, jsonSchema true (proposals: fda 12, livertox 8, mg-bisglycinate 11, mg-rankings 39, opentargets 10)
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D10/<folder>   (after)
  -> fda-qhc 0 / 9; livertox 0 / 2; mg-bisglycinate 0 / 8; mg-rankings 0 / 16; opentargets 0 / 2  (total 0 errors, 37 warnings)
```

## Edits

| fixture | edit | ruling / registry |
|---|---|---|
| opentargets-association-signal | a-label-indication INDICATED_FOR -> HAS_APPROVED_INDICATION; asserter e-label-holder -> e-fda (regulator); basisKind MANUFACTURER_CLAIM dropped; qualifier labelHolder:REMEDYREPACK; e-label-holder kept as a documented entity, removed from intent subjects (no orphan write) | alias (R-88 fixtureEdit) |
| livertox-green-tea-extract-harm | a-gt-beverage-not-associated, a-gt-infusion-cases ASSOCIATED_WITH_ADVERSE_EFFECT -> CAUSES_ADVERSE_EFFECT + sourceKind:REFERENCE_MONOGRAPH + population:UNSPECIFIED (required qualifier; the monograph states none), polarity/speechAct kept; a-gte-alt REPORTS_ADVERSE_EVENT_RATE -> CHARACTERIZES_INCIDENCE (literal: no Condition object captured for "ALT elevations") | aliases (R-84/R-85) |
| fda-qhc-magnesium-disconfirmation | a-fda-status, a-ods-approved STATES_REGULATORY_STATUS -> RATES_CLAIM; a-350-condition CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT -> HAS_CLAIM_CONDITION, subject e-claim, qualifier productClass=dietary supplements bearing the claim; pseudo-entity e-dietary-supplements (D6.Product standing for a class) removed from entities and intent subjects, i-harms ASSESSES e-mg + e-claim | alias; retired (R-93) |
| mg-bisglycinate-rct-unstructured | R-15: first-author stand-in e-authors removed; 7 assertions (+ new a-administers) asserted by e-publication, a-coi by e-lopresti (statement about an individual author); ARM_DAILY_DOSE ×2 -> ADMINISTERED_AMOUNT on new InterventionComponent e-ic-mg (StudyArm -HAS_COMPONENT-> structural; e-ic-mg -ADMINISTERS-> e-mg-bisglycinate, a-administers, evidence loc-dose); MATERIAL_MANUFACTURED_BY -> e-biogena -MANUFACTURES-> e-mg-bisglycinate; DISCLOSES_ROLE_AT -> HOLDS_ROLE edgeProperties {roleKind EXECUTIVE_OFFICER}, qualifier roleText:managing director, CRO-funding text kept; comparisonKind BETWEEN_GROUP -> BETWEEN_ARM; e-target-sleep resolved hu:target:sleep (key target:sleep) | R-15, R-68, R-82/R-30, R-58, retired ARM_DAILY_DOSE |
| mg-rankings-criteria-comparison | per DSLD label (173951, 271329, 242510): ProductVariant (dosageForm TABLET), Package (CONTAINER, unitCount/unitNoun from DSLD netContents), LabelVersion (SUPPLEMENT_FACTS, labelVersionCode, contentDigest = snapshot sha256, compositionDigest = sha256 of the transcribed Mg line, serving fields); HAS_VARIANT / HAS_PACKAGE structural; HAS_LABEL_VERSION asserted by o-ods (CURATOR_CLASSIFICATION, validFrom = DSLD entryDate); a-dsld-*-form DECLARES_INGREDIENT_FORM -> DECLARES_COMPONENT LabelVersion -> form with ComponentLineProperties (amount, mg, AS_NUTRIENT, NUTRIENT_EQUIVALENT, PER_SERVING, dailyValuePercent), qualifiers declaredName:/form:/relayedBy:; a-dsld-*-mg (LABEL_DECLARED_AMOUNT) merged into those lines (locators kept); a-dsld-*-serving -> MAX_DAILY_SERVINGS on the LabelVersion; a-calc-* -> PER_MAX_DAILY_DOSE_AMOUNT (LabelVersion, object e-mg, rule:daily-max.v1); criteria inputPredicates and the BLOCK rule text re-keyed; a-usn-commission -> DISCLOSES_INTEREST; a-ld-right-to-update -> STATES_METHOD_CAVEAT; Target resolved; supersedesUid kept (same asserter) | retired / alias entries; R-23 check |

Facts used that have no locator: DSLD productVersionCode, netContents, servingsPerContainer and entryDate, read from the captured snapshot bytes (`scratchpad/ft/D10/fixtures/fresh/dsld-label-*.json`, sha256 equal to the snapshot contentHash); marked as such in the entity notes and qualifiers. No locator was added.

## Remaining (all warnings, none an error)

- predicate-proposed ×35, registrar-gated: REPORTS_DOSE_RANGE_STUDIED ×8, REDUCES_RISK_OF ×1 (Claim binding; re-keying it changes propositionHash), STATES_ATTRIBUTION_CAVEAT ×2, CHARACTERIZES_ABSORPTION ×4 (D1); REPORTS_EFFECT_SIZE, STATES_LIMITATION, STATES_STUDY_DESIGN, INDEXED_AS_PUBLICATION_TYPE ×2 each (D3); MAX_DAILY_SERVINGS ×6 (D6); STATES_METHOD_CAVEAT ×4, DISCLAIMS_ENDORSEMENT ×2 (D7).
- retired-name warn ×2: mg-rankings `supersedesUid` (crit-ld-label-accuracy-2 -> -1, both Labdoor): legitimate under R-23.

## Incident: fixtures regenerated mid-round (03:04:59-03:05:01)

After the edits above lint clean, every `final/fixtures/<P>/*/assertions.yaml|intent.json|questions.md` (D1..D13, D10 included) was rewritten at 03:04:59-03:05:01 and `_work/repath-manifest.json` at 03:05:01: a concurrent `_work/repath-fixtures.mjs` run reset the copies to the packet originals (= HEAD 31390a6). README.md (mtime 03:04:36) was not rewritten, so its FU-03 rows still say "applied" for packets whose fixture edits are now gone (git status at 03:06 shows only D1 ×1, K ×1 and D10 modified under fixtures/). For D10 the five edit scripts were re-run against the reset files (byte-identical to the HEAD backup first), giving the same result: lint 0 errors / 37 warnings, intents zod + JSON Schema valid. A copy of the edited D10 files is kept at `<scratchpad>/d10fx/applied/<folder>/`; to restore after another reset: copy them back, or re-run `node <scratchpad>/d10fx/e-{ot,lt,fda,bg,rk}.mjs` (each refuses to run unless its anchors match exactly once).

## Gaps recorded (no schema change)

- intent v1: assertion.literal has no object slot, so PER_MAX_DAILY_DOSE_AMOUNT's object (magnesium) is only in assertions.yaml (noted in the intent notes / rationale); qualifiers stay in proposal rationale (AssertionCore has none); asserterRef doc names Person / Organization / Agent while R-15 asks for a Publication asserter (executor P20 widening).
- predicates.yaml HAS_CLAIM_CONDITION lists subjectTypes [RegulatoryRecord]; R-93 and its fixtureEdit admit the Claim for a product-class condition, so the registry row should list Claim (predicate-registry owner).
- R-88's text says the labeler of record asserts label statements; the INDICATED_FOR fixtureEdit (followed) makes the regulator the asserter of the approved indication.
- README index rows for D10 ("relationships exercised") were not refreshed (only the FU-03 rows were edited); they now miss HOLDS_ROLE, ADMINISTERS, HAS_COMPONENT, HAS_LABEL_VERSION, DECLARES_COMPONENT, HAS_VARIANT, HAS_PACKAGE.
