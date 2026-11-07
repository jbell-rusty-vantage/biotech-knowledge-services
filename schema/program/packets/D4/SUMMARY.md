# D4 — summary

Diagnostics, biomarkers and measurement. Agent A3, fast-track run, 2026-10-08 (research → model → fixtures → check → adversarial review).

## What the domain is

D4 says what a number means before anyone compares it. It separates the referent (Biomarker: "NAD+ level", "pace of aging") from the measured quantity (Metric: compartment, unit, method in the definition, LOINC when one exists), the thing a person can order or buy (LabTest, panels included), the procedure that produced a value (AssayVersion: lab, method, specimen; AlgorithmVersion: clock, wearable score, firmware), the range printed next to it (ReferenceIntervalVersion: reference interval, decision limit, guideline target or vendor "optimal" band), and the instrument (Device). Comparability, reliability, interference and test-and-sell conflicts are kernel Assessments, never properties. D4 is the last three hops of the compound → mechanism → biomarker → test path it shares with D2.

## Headline counts (packet-check, adversarial-review pass)

| node types | relationship types | from→to pairs | questions | fixtures |
| ---: | ---: | ---: | ---: | ---: |
| 7 / 8 | 13 / 14 | 17 / 35 | 35 (13 harm, 37 %) | 7 |

No unions; at most 5 relationship fields per type; 4 relationship types carry a bitemporal episode (MEASURES_METRIC, PERFORMED_WITH_VERSION, INCLUDES_TEST, RUNS_ON_DEVICE). Measured against the current kernel (sha256 b2c2b1b0…): D4 adds 175,703 bytes and 104 input types to the printed executable (≈ 2.9 % of the 6 MB ceiling, 2.6 % of the 4,000-input ceiling), builds in 1 s. Fixtures: 132 locators re-select from snapshot bytes, 96 assertions, 18 assessments. Pinned W07 + W08: 19 node types, 49 relationship types.

## Five highest-value questions

1. **Q-D4-01** — compound → mechanism → biomarker → an orderable test that measures what the human evidence measured. Written once with D2 (D2 03 § Q-D2-03). Fixture `nr-nad-compound-to-test`: a nicotinamide riboside NAD+ test exists but measures red blood cells, while the trial measured PBMCs → **NOT_COMPARABLE**; the seller also sells the supplement (test-and-sell).
2. **CQ-DX-01** — what a test actually measures (measurand, LOINC, specimen, method, lab) as of a date, with every NOT_REPORTED field cited. Fixture `hba1c-two-labs-interference`.
3. **CQ-DX-03** — can two tests share a trend axis? Labcorp vs Quest HbA1c → **UNKNOWN** (instrument, software, calibration and reagent generation in use not reported on either side).
4. **CQ-DX-04 / Q-D4-05** — which clock version produced a score, and is a change larger than its noise? The vendor's DunedinPACE™ has no version and no reliability source, yet the vendor advises "retest every 3 months" (a claim occurrence of a kernel Claim) → **NO_RELIABILITY_SOURCE** (`clock-noise-vs-retest-advice`, a reliability gap: noise data of other clocks qualify the advice, nothing measured contradicts it).
5. **Q-D4-08** — which devices claim to measure something they cannot (non-invasive glucose watches and rings): SAFETY_SIGNAL on the kernel Claim, verdict **CONTRADICTED**, effectDirection HARM, resting on FDA `RATES_CLAIM` statements (`noninvasive-glucose-cgm-recall`, which also carries a CGM recall for incorrect low readings, reached through the Product that DELIVERS the sensor). New harm question Q-D4-26: a clock that uses HbA1c (InnerAge 2.0) inherits HbA1c's HbF interference risk.

## Three biggest cuts

1. **19 → 7 node types.** PanelDefinition merged into LabTest (composition = INCLUDES_TEST episodes); Algorithm and FirmwareVersion into AlgorithmVersion; Specimen, MeasurementMethod, ReferenceSystem, TechnologyPlatform, Modality, Sensor and ToolOrInstrument became enums or text; ComparabilityAssessment became a kernel Assessment (COMPARABILITY + conclusionCode).
2. **49 → 13 relationship types.** 40 pinned or candidate types deferred with a reason each, and 16 predicates kept as `Assertion.predicate` values (15 D4-owned + kernel FIELD_NOT_REPORTED; SCREAMING_SNAKE) with the question that would promote them (INTERFERES_WITH, REPORTS_RELIABILITY, CLAIMS_TO_MEASURE, …); regulator verdicts use the kernel RATES_CLAIM.
3. **Per-field ReportedStatus companions (≈ 18 properties) → one `notReported: [MeasurementField!]` list per type**, each entry cited by a kernel `FIELD_NOT_REPORTED` Assertion.

## Three biggest risks

1. **Comparability will mostly be UNKNOWN.** Instrument, software version and interval derivation were not reported on any of the 9 coded public artifacts. The model shows the gap and cites it, but cannot fill it. Only buying tests or obtaining vendor documentation fills it (owner decision, 11 #20).
2. **Sibling packets still disagree on a few seams.** D6 has adopted DELIVERS, and D8 needs no change (its records reach a device or test through the D6 Product that DELIVERS it). Still open: D10 names a merged D4 type (`PanelDefinition`), claims Q-D4-25 as a stored projection and omits `D4.LabTest` from comparison rows (11 #38); D2 lists LOINC on Outcome, so one LOINC code could identify two entities (11 #37).
3. **Moving evidence.** 4 of 13 re-scraped pages (all four vendor-hosted ones) changed bytes within ~45 minutes; WHOOP's OpenAPI JSON changes property order between fetches. Snapshots are Firecrawl markdown, not HTTP bytes. Vendor clock and wearable algorithms change without version labels. BellLabs-defined Metrics (no LOINC) can multiply per vendor field. All three need capture discipline and curation, not more schema.
