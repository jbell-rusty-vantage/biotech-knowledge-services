# D4 — Diagnostics, biomarkers and measurement

Lens: science. Current fragments: W07 Diagnostics and measurement (13 node types: Biomarker, Metric, LabTest, PanelDefinition, MeasurementMethod, Specimen, ReferenceSystem, Algorithm, AssayVersion, AlgorithmVersion, ReferenceIntervalVersion, ComparabilityAssessment, ReferenceRange), W08 Platforms, instruments and devices (6: TechnologyPlatform, ToolOrInstrument, Device, Modality, Sensor, FirmwareVersion).

## Scope

What is measured and whether two measurements compare: biomarkers and metrics, lab tests and panels, assay and algorithm versions (epigenetic clocks, risk scores), reference intervals, specimens, methods; wearables and devices as measurement platforms with firmware versions. Out of scope: personal measurements (private store); clinical interpretation beyond comparability; devices as products (D6 seam).

## Ecosystem to survey

The consumer and clinical lab landscape (Quest, Labcorp, Function Health, InsideTracker, SiPhox, TruDiagnostic, Elysium Index, GlycanAge), what they publish about assays and reference intervals (mostly not reported, per the open questions), LOINC and UCUM practice, CLIA/CAP and the LDT rule changes, wearables (Oura, WHOOP, Apple, Garmin, CGMs) and their release notes and metric definitions, epigenetic-clock publications versus vendor implementations, biological-age marketing.

## Seed questions

- Are two tests of the same metric comparable (assay version, reference interval, specimen, platform) (CQ-DX-03)?
- Which algorithm version produced this score, what inputs does it require, and did the vendor implementation diverge from the publication?
- What does a given consumer panel measure, mapped to LOINC, and which biomarkers of aging does it cover?
- Which device or firmware version produced this metric definition, and when did the definition change?
- Which biomarkers respond to compound X in human studies (seam to D3), and which tests can a user buy to measure them?
- What reference interval applied to this metric for this population at date D?

## Retrieval patterns to consider

Metric → test → assay version → reference interval as-of; algorithm input graphs (REQUIRES_INPUT_METRIC); comparability assessments as assessment nodes; GDS: similarity of panels by metric set; identifier mapping (LOINC, vendor codes).

## Sources and tools to score (with D11)

LOINC (license), UCUM, the FDA CLIA database, lab vendor documentation (PDF), wearable release notes and developer docs (Oura API, WHOOP API, Apple HealthKit types), clock publications on PubMed and bioRxiv, DNAm reference datasets.

## Known problems and open questions

The open Priority-1 diagnostics items 1–5 (assay detail availability; a vendor clock as a distinct AlgorithmVersion; the reliability source for a change; RegulatoryPathway versioning; inspections). Whether `ReferenceRange` remains a projection of `ReferenceIntervalVersion`.

## Deliverables

`../packets/D4/` per PLAN 5.1, plus a coded sample of 20 lab reports and 5 consumer-test reports against the AssayVersion fields (the open-question evidence item).
