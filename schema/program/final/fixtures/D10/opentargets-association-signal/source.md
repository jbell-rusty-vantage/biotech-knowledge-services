# Fixture: Open Targets scores and FAERS signals as Assertions vs a BellLabs-computed Association (materialized association)

- url: https://api.platform.opentargets.org/api/v4/graphql
- title: Open Targets Platform GraphQL API (apiVersion 26.9.0, dataVersion 26.09): target ENSG00000130203 (APOE) associatedDiseases; drug CHEMBL413 (sirolimus) adverseEvents
- retrieved: 2026-10-08
- snapshot digest: sha256:2d765747e8cb9bfb40bbba4402019e17d275c08509c653955a696bba6e916c31
- kind: other
- tool: tool:opentargets-graphql (curl POST; request bodies recorded in `locators.yaml`), tool:opentargets-docs (curl, markdown twins of the docs), tool:openfda-label (curl, drug label API), tool:openfda-faers (curl, drug/event count queries with `limit=0`)
- other sources (retrieved 2026-10-08 unless stated):
  - APOE associations response · sha256:92f608c0f2d87b716b6b7c8d0cd83c0f22896c3c2d465d62912015ab05b46fe8
  - https://platform-docs.opentargets.org/associations.md · Target–disease associations · sha256:7af84ccd2f819bfd2c57091c1d9732ba0ce601043a7892d1d4b99309eff649d4
  - https://platform-docs.opentargets.org/drug/pharmacovigilance.md · Pharmacovigilance · sha256:50f717513fab97982e5b7d96ff0bf25f8dfa7c0bac4e0b7b10978213a27f4b64
  - https://api.fda.gov/drug/label.json?search=set_id:09f24e7a-0bea-4e02-b557-c60eb842d41a&limit=1 · openFDA drug label (sirolimus, REMEDYREPACK INC., effective_time 20250630) · sha256:9807e7127aefa101a8e9bb1311c651db349ce04c7d00a6b7a03659a28faf2472
  - openFDA drug/event count queries (adversarial-review stage, retrieved 2026-10-09T01:54:23Z; FAERS data `last_updated` 2026-07-30): sirolimus AND transplant rejection 372 · sha256:4ba6ceeba303eea26a584a4c511465040fe406339502a9adf4b3f060f68c6cef; sirolimus 13,365 · sha256:e8e1c071e3fdabd4d3a4873a4b0dae7c157550df3e8e7cd0ad2c0fa3886801dc; transplant rejection 7,906 · sha256:c280afb38378dbb24997af37a48bccb364fa69d62f4f4422d8fb1873333da0d2; all reports 20,692,690 · sha256:f9d51a511a3e55ff3ab1ea521f285d7038998dfe211acf9c0370ee651c5b4fd8 (exact URLs in `locators.yaml`)
- re-fetch: both GraphQL queries and both docs re-fetched at 2026-10-08T21:39Z, byte-identical to the research captures; the openFDA label was first captured in the fixtures stage (a first query by brand name returned NOT_FOUND); the four FAERS counts were first captured in the adversarial-review stage

## What the fixture shows

Directive 3.6, and the rule in 04 `AssociationKind`: an external score is evidence about what a platform reports, never a BellLabs Association. Open Targets' release-bound outputs enter as Assertions by Open Targets with JSON_POINTER locators: APOE–Alzheimer disease overall score 0.695512952413486 (literature 0.9992042452669387, genetic_association 0.8814168283246063), which Open Targets says "should not be interpreted as a confidence score"; sirolimus FAERS likelihood-ratio signals for "transplant rejection" (logLR 1895.665732409805, 686 reports) and "malignant neoplasm progression" (logLR 2480.2412365213677, 1423 reports) against a critical value of 290.98842339916155.

The only Association is one BellLabs computes itself (adversarial-review stage; the fixtures-stage version copied the Open Targets numbers into two pass-through Associations, which contradicted the rule and was replaced). Four openFDA FAERS report counts are captured as Assertions by FDA (predicate REPORTS_REPORT_COUNT, JSON_POINTER `/meta/results/total`): a = 372 reports naming sirolimus and transplant rejection, a+b = 13,365 naming sirolimus, a+c = 7,906 naming transplant rejection, N = 20,692,690. A PROJECTION Activity with method `bl-assoc/faers-prr@1` computes a SIGNAL_DISPROPORTIONALITY Association: PRR 76.40 (95% CI 68.94 to 84.66), ROR 78.56, Yates chi-square 26,317, threshold PRR ≥ 2. The record ASSOCIATES its two members, DERIVES_FROM the four count Assertions, and carries the 2×2 cells as `components` and an input-set digest. A kernel SAFETY_SIGNAL Assessment (subkind D10.signal-interpretation) ASSESSES sirolimus and transplant rejection and records the signal as likely confounded by indication. It cites both the external LRT Assertion and the PRR inputs, the sirolimus label (indicated for prophylaxis of organ rejection) and Open Targets' own caveat. It is about the drug and the event, not about the Association record.

## Files

- `locators.yaml` (17 locators, 9 snapshots) · `assertions.yaml` (10 assertions, 1 association, 1 assessment) · `intent.json` (validated) · `questions.md`

Research is not medical advice; spontaneous-report counts are not incidence and are not de-duplicated.
