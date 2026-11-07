# Close-out (recovery, second attempt): fixture editor (S), packet D10 (FU-03)

2026-10-09. Worktree `biotech-knowledge-services-S` (ft/schema-S). Writes: `final/fixtures/D10/<folder>/assertions.yaml` and `intent.json` (5 folders), the five D10 rows of the FU-03 table in `final/fixtures/README.md`, this log. SDL unchanged. Nothing committed. source.md, locators.yaml, composed bodies, questions.md, snapshot digests and every sourced number / identifier / quote are untouched (git diff: only assertions.yaml + intent.json under D10). `final/_work/repath-fixtures.mjs` was not run, imported or required; the only `_work` script executed is `lint-fixtures.mjs --fixture D10/<folder>` (report mode, no `--baseline` / `--out`, so it writes nothing).

## Guide used

The first attempt's log `final/_runlog/closeout-fixture-editor-D10.md` (same session) lists the decisions; its edit scripts were still in the session scratchpad (`<scratchpad>/d10fx/e-{ot,lt,fda,bg,rk}.mjs` + `lib.mjs`). I re-read every script as text before running: each writes only `final/fixtures/D10/<folder>/{assertions.yaml,intent.json}`, and each exact-match edit refuses to run unless its anchor occurs exactly once.

## Commands and key outputs

```
# state check: current D10 files vs the pre-edit backup of the first attempt (<scratchpad>/d10fx/D10-orig) -> all 30 files identical (= HEAD 31390a6)
node <scratchpad>/d10fx/lint.mjs   # wrapper: spawnSync node final/_work/lint-fixtures.mjs --fixture D10/<folder>, per folder
  before: fda-qhc 6 err / 9 warn; livertox 6 / 2; mg-bisglycinate 11 / 8; mg-rankings 35 / 8; opentargets 2 / 2  => 60 errors, 29 warnings
node <scratchpad>/d10fx/e-ot.mjs ; e-lt.mjs ; e-fda.mjs ; e-bg.mjs ; e-rk.mjs
  -> ot done; lt done; fda done; bisglycinate: yaml asserters replaced 6, intent asserters replaced 8; rk done, proposals 39
# result vs the first attempt's verified output (<scratchpad>/d10fx/applied): all 10 edited files byte-identical
node <scratchpad>/d10fx/lint.mjs
  after: fda-qhc 0 / 9; livertox 0 / 2; mg-bisglycinate 0 / 8; mg-rankings 0 / 16; opentargets 0 / 2  => 0 errors, 37 warnings
node <scratchpad>/d10fx/vint.mjs   # zod IngestionIntent (packages/contracts/dist) + Ajv 2020 on biotech-knowledge-intent.v1.json, D10 only
  -> all five: zod true, json true (proposals: fda 12, livertox 8, mg-bisglycinate 11, mg-rankings 39, opentargets 10)
node <scratchpad>/d10fx/readme2.mjs  # replaces exactly the five `| D10/<folder> |` rows (each must match once and still be in baseline form)
```

## Edits applied

| fixture | edit | source |
|---|---|---|
| opentargets-association-signal | INDICATED_FOR -> HAS_APPROVED_INDICATION; asserter e-label-holder -> e-fda (regulator); basisKind MANUFACTURER_CLAIM dropped; qualifier labelHolder:REMEDYREPACK; e-label-holder kept as documented entity, removed from intent subjects | predicates.yaml alias fixtureEdit (R-88) |
| livertox-green-tea-extract-harm | ASSOCIATED_WITH_ADVERSE_EFFECT ×2 -> CAUSES_ADVERSE_EFFECT + sourceKind:REFERENCE_MONOGRAPH + population:UNSPECIFIED (polarity / speechAct kept); REPORTS_ADVERSE_EVENT_RATE -> CHARACTERIZES_INCIDENCE (literal kept) | aliases (R-84/R-85) |
| fda-qhc-magnesium-disconfirmation | STATES_REGULATORY_STATUS ×2 -> RATES_CLAIM; CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT -> HAS_CLAIM_CONDITION, subject the Claim, qualifier productClass=; product-class pseudo-entity e-dietary-supplements removed (entities, intent subjects, i-harms ASSESSES) | alias; retired (R-93) |
| mg-bisglycinate-rct-unstructured | R-15: first-author stand-in e-authors removed, asserter e-publication (D3.Publication), COI statement asserted by e-lopresti; ARM_DAILY_DOSE ×2 -> ADMINISTERED_AMOUNT on new InterventionComponent e-ic-mg (StudyArm -HAS_COMPONENT-> structural, e-ic-mg -ADMINISTERS-> material via new a-administers); MATERIAL_MANUFACTURED_BY -> e-biogena -MANUFACTURES-> e-mg-bisglycinate; DISCLOSES_ROLE_AT -> HOLDS_ROLE {roleKind EXECUTIVE_OFFICER} + roleText:managing director; comparisonKind BETWEEN_GROUP -> BETWEEN_ARM; Target resolved (hu:target:sleep, no vocabularyKey) | R-15, R-68, R-82/R-30, R-58, retired ARM_DAILY_DOSE |
| mg-rankings-criteria-comparison | per DSLD label (173951, 271329, 242510): ProductVariant, Package, LabelVersion; HAS_VARIANT / HAS_PACKAGE structural; HAS_LABEL_VERSION asserted by NIH ODS; DECLARES_INGREDIENT_FORM + LABEL_DECLARED_AMOUNT -> one DECLARES_COMPONENT line (ComponentLineProperties; declaredName:/form: qualifiers, R-30); LABEL_SERVING_DIRECTIONS -> MAX_DAILY_SERVINGS on the LabelVersion; MAX_DAILY_SUPPLEMENTAL_AMOUNT ×3 -> PER_MAX_DAILY_DOSE_AMOUNT (LabelVersion, object magnesium, rule:daily-max.v1); criterion inputPredicates + BLOCK rule re-keyed; DISCLOSES_AFFILIATE_COMMISSION -> DISCLOSES_INTEREST; STATES_METHOD_MAY_CHANGE -> STATES_METHOD_CAVEAT; Target resolved; supersedesUid kept (R-23: both versions Labdoor) | retired / alias entries; R-23 check |

Not present in D10 (grep): Mention node (the mg-bisglycinate `mentions:` list is the derived Chunk MENTIONS, R-09/R-27 compliant), RENDITION_OF, nNoChangeContexts, interim OTHER discourse Assessments (the two `claimType: OTHER` are Claims), disclosureFinding, HAS_REVISION_STATUS / REVISES, ClaimOccurrence, INCREASES_LEVEL, HOLDS_EQUITY_IN, AlgorithmVersion.*. R-15 does not apply to the other four fixtures (Organization / Agent asserters only).

Facts without a locator (unchanged from the first attempt): DSLD productVersionCode, netContents, servingsPerContainer and entryDate, read from the captured snapshot bytes (sha256 = snapshot contentHash) and marked as such in entity notes / qualifiers. No locator added, no fact invented.

## Remaining (warnings only; no error, no owner-gated item)

- predicate-proposed ×35 (registrar-gated names, not D10 fixture edits): REPORTS_DOSE_RANGE_STUDIED ×8, REDUCES_RISK_OF ×1 (Claim binding; re-keying changes propositionHash), STATES_ATTRIBUTION_CAVEAT ×2, CHARACTERIZES_ABSORPTION ×4; REPORTS_EFFECT_SIZE, STATES_LIMITATION, STATES_STUDY_DESIGN, INDEXED_AS_PUBLICATION_TYPE ×2 each; MAX_DAILY_SERVINGS ×6; STATES_METHOD_CAVEAT ×4, DISCLAIMS_ENDORSEMENT ×2.
- retired-name ×2: mg-rankings supersedesUid (same asserter, legitimate under R-23).

## Gaps recorded (no schema change; for the coordinator / open-questions owner)

- intent v1: assertion.literal has no object slot (PER_MAX_DAILY_DOSE_AMOUNT object magnesium only in assertions.yaml); AssertionCore has no qualifiers (kept in rationale); asserterRef doc names Person / Organization / Agent while R-15 needs a Publication asserter (executor P20 widening).
- predicates.yaml HAS_CLAIM_CONDITION subjectTypes [RegulatoryRecord] should admit Claim (R-93 fixtureEdit uses the Claim).
- R-88 text (labeler of record asserts label statements) vs the INDICATED_FOR fixtureEdit (regulator asserts the approved indication); the fixtureEdit was followed.
- README index rows for D10 ("relationships exercised") not refreshed; they miss HOLDS_ROLE, ADMINISTERS, HAS_COMPONENT, HAS_LABEL_VERSION, DECLARES_COMPONENT, HAS_VARIANT, HAS_PACKAGE (outside my rows).
