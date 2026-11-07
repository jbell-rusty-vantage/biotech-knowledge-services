# OD-35 discourse-independence review set (specification)

Decision OD-35: validate discourse-independence v1 on **30 stratified claims**, at least **10 with syndication or
retelling** and at least **10 with ambiguous authority** (overlap allowed), independently annotated with disagreements
resolved; **zero known double-counts** in release fixtures. This is a frozen human review set and report, not a claim of
statistical generalization (Gate G evidence). FX-11 applies: study independence, verification independence and
discourse independence stay separate questions, methods and outputs.

## 1. Sampling frame

- Frame: every CLAIM-kind assertion in `schema/program/final/fixtures/**/assertions.yaml` (sourced research fixtures,
  research only, not medical advice). Built by `node evals/v2/od35/build-frame.mjs` into `od35/frame.json`.
- Frame at freeze: **54 claims** across 24 fixtures, digest recorded in `od35/review-set.json`.
- Screening flags (heuristic, for the draw only): `retelling` = D9 module or a rendition/republication/occurrence
  marker in the row; `ambiguousAuthority` = missing asserter, `asserterBasis:PUBLISHER_DEFAULT|INFERRED`, or
  speaker/host/guest/unattributed/pseudonymous attribution. Annotators assign the final stratum labels.

## 2. Draw

Seed 20261011. Fill the retelling stratum, then the ambiguous-authority stratum (overlap allowed), then the remaining
slots round-robin by module. Result at freeze (`od35/review-set.json`): 30 claims drawn, **4 screened retelling and 4
screened ambiguous-authority**: a shortfall of 6 in each stratum. The frame cannot meet OD-35 as written; the draw
does not pad strata.

Required before annotation (open, owner: S9 review with the D9/D7 owners): add sourced claims with retelling or
ambiguous authority until both strata reach 10, by capturing additional discourse sources through the supported
capture route (for example podcast transcripts and newsletter re-publications of a single study, and seller pages that
repeat a manufacturer claim). Re-run the frame build; record the new frame digest. No synthetic claim may enter the set.

## 3. Annotation

Two annotators label each claim independently, blind to each other and to the service output, recording per claim:

| Field | Values |
| --- | --- |
| `occurrences` | every Assertion occurrence of the proposition with its asserter, MediaWork/Source and locator |
| `retelling` | yes / no, with the upstream occurrence each retelling depends on |
| `authorityAmbiguous` | yes / no, with the reason (publisher default, inferred speaker, pseudonymous account, unattributed) |
| `independentGroups` | partition of occurrences into discourse-independent groups (what may count separately) |
| `doubleCountRisk` | occurrences the naive count would double-count |
| `confidence` | high / medium / low |

## 4. Agreement and resolution

Report raw agreement and Cohen's kappa on `retelling`, `authorityAmbiguous` and on the induced pairwise
"same-group" relation of `independentGroups`. Every disagreement is resolved by a third reviewer with a written reason;
resolved labels form the review gold, frozen with its digest.

## 5. Service check and pass criterion

Run the discourse-independence method (D10 / FU-01 cache fields, regenerated from accepted source with projection
provenance) over the drawn claims and compare its independent-group partition with the resolved gold.

- Pass: **zero double-counts** (no two occurrences the gold puts in one group are counted as independent), every
  retelling traced to its upstream occurrence, and ambiguous authority reported as such rather than resolved by guess.
- Report: per-claim result, per-stratum counts, disagreements and their resolution, frame and gold digests.

## 6. Status at freeze

Frame and seeded draw exist; strata short by 6 each; no annotation, no gold, no service run. Gate G item open.
