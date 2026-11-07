# Fixture: magnesium rankings (Labdoor, U.S. News) vs a BellLabs computed comparison (criteria, comparison report)

- url: https://health.usnews.com/otc/rankings/magnesium-supplements
- title: Best Magnesium Supplements (U.S. News, pharmacist survey with The Harris Poll, page dated May 11, 2026)
- retrieved: 2026-10-08
- snapshot digest: sha256:7a2b2e0f41c82bbc7829649a01acfa2212b2262cf306d27c67bf2e358426ace9
- kind: other
- tool: tool:tavily-extract (ranking, method and evidence pages), tool:nih-dsld-api (curl, label records)
- other sources (all retrieved 2026-10-08; sha256 of the captured bytes):
  - https://labdoor.com/rankings/magnesium · Top 10 Magnesium (Labdoor) · sha256:c264a8d64ce9b1a07dde56ca07b356b50fe0301d3edc81296c27fdf1372fd275
  - https://labdoor.com/about/scores · Our scoring process (Labdoor) · sha256:ebcdbb84939c52253b17eaec690c6a39b9ae7b3ce823f802591870412c72a0f5
  - https://examine.com/supplements/magnesium/ · Magnesium (Examine; "Last Updated:September 30, 2026" as rendered by the Tavily extraction; a Firecrawl maxAge 0 scrape renders September 29, 2026) · sha256:2acc1500308703e5da1df108257ec0c0a8b55bc052523997be67d9639c7cf2b9
  - https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/ · Magnesium - Health Professional Fact Sheet (NIH ODS) · sha256:6f0ffe69dd9ed544ab541b462ae696280607d261e6f61c0780a52ca174c96a36
  - https://api.ods.od.nih.gov/dsld/v9/label/173951 · Slow-Mag Tablets (DSLD) · sha256:ab3e2f3c074ec2cf12d0ba65308ebace5f2e75623236a2c1642832bee1a28dca
  - https://api.ods.od.nih.gov/dsld/v9/label/242510 · Nature's Bounty Magnesium 500 mg (DSLD) · sha256:561e4123cd58da3eb26f38e12a4dbc99ecf09a2c0376dddf71271c3171937e6f
  - https://api.ods.od.nih.gov/dsld/v9/label/271329 · Nature Made Magnesium 250 mg (DSLD) · sha256:9b1e143d6be5a3290bd272cd8029e9fabc60f0d61e1e59975acebe8948ba382f
  - cross-fixture: the FDA 350 mg condition (`../fda-qhc-magnesium-disconfirmation`, locator loc-350mg-condition)
- re-fetch: the four Tavily pages were re-extracted at 2026-10-08T21:39Z; Labdoor (both), U.S. News and ODS are identical to the research captures; Examine differs from the research-stage extraction, which the adversarial-review stage reads as a stale provider-cached extraction rather than a content change (08 "Broke" item 2); quoted sentence unchanged; DSLD labels were first captured in this stage

## What the fixture shows

Directive 3.5: a ranking is computed, never a stored fact, until BellLabs publishes it. Third-party rankings enter as RANKS_OPTION Assertions by their producers (U.S. News ranks Mag-Ox magnesium oxide first by a survey of 357 pharmacists "for supporting nerve function and reducing physical tension" and states it does not recommend or endorse the products; Labdoor lists Legion Sucrosomial Magnesium first with grade A+ and lists two products as "Upcoming" with no score). Each ranker's method is a set of DecisionCriterion records (Labdoor Label Accuracy in two versions around Labdoor's 2017 adoption of FDA rounding rules; Projected Efficacy; the U.S. News pharmacist survey 2026-2027) about which the ranker's method statements are USES_RANKING_CRITERION Assertions. A fixture-illustrative BellLabs criteria set `bl:compare:mg-forms-for-sleep@1` (a BLOCK above 350 mg supplemental magnesium per maximum daily serving; a SCORE on absorption evidence for the declared form) is applied to the U.S. News candidates plus Labdoor's first product using DSLD label facts (amount per serving, maximum daily servings, form), ODS and Examine form evidence, and CALCULATED maximum daily amounts. The draft COMPARISON Report (`composed-body.txt`, sha256:62ec1da9…441c) USES_CRITERION both criteria and HAS_ITEM one ROW per option: Slow-Mag SELECTED rank 1, Nature Made 250 mg ALTERNATIVE rank 2, Nature's Bounty 500 mg BLOCKED (BLOCKED_BY the D5 UseConstraint "supplemental magnesium above 350 mg/day in adults" resolved from the ODS upper limit; the row cites the 500 mg/day calculation, the upper limit, the FDA claim condition and the oxide absorption statement), Mag-Ox and Legion NOT_EVALUATED with `missingFactKeys`.

## Files

- `locators.yaml` (29 locators, 8 snapshots) · `assertions.yaml` (27 assertions, 6 decision criteria, 1 D5 use constraint, 1 report, 9 items) · `intent.json` (validated; DecisionCriterion as node.upsert) · `questions.md` · `composed-body.txt`

Research is not medical advice; the criteria set is not a BellLabs policy.
