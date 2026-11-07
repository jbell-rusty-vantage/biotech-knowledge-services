---
id: "dom:diagnostics-and-devices"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#diagnostics-and-devices"]
aliases: ["diagnostics-and-devices","diagnostics and devices"]
capabilities: ["get","slice"]
cardDigest: "sha256:129a244bc27ccf12684101839b807fc92c5683b8be7119ad4a83cc1dc58b0130"
---
# Domain: Diagnostics, biomarkers, measurement and devices

Id `dom:diagnostics-and-devices` · modules [D4](../modules/D4.md) · 7 node types · 9 internal relationship types · seams to 5 other domains.

Biomarkers, metrics, lab tests, assay and algorithm versions, reference interval versions and devices; what a test measures, which version produced a score and which inputs it requires.

## Questions this domain answers

- Are two results of the same metric comparable (same assay version, reference interval, specimen)?
- Which algorithm version produced this score, and which input metrics does it require (REQUIRES_INPUT_METRIC)?
- Which device or lab performs this test (RUNS_ON_DEVICE, PERFORMED_BY_LAB)?

## Write guidance

Unreported assay, instrument or software details are listed in notReported (UNKNOWN), never invented. A vendor implementation is a distinct AlgorithmVersion until an EQUIVALENCE Assessment says otherwise.

## Start with these types

- [Biomarker](../nodes/Biomarker.md) — Purpose: the biological referent a measurement is about (NAD+, glycated hemoglobin, IgG glycan profile, pace of biological aging).
- [Metric](../nodes/Metric.md) — Purpose: the measurand or feature definition — what exactly a number is: LOINC 4548-4 (HbA1c mass fraction in blood), 'NAD+ in red blood cells (µM)',…
- [LabTest](../nodes/LabTest.md) — Purpose: the orderable or purchasable test as a laboratory or vendor offers it (Labcorp 001453 'Hemoglobin (Hb) A1c', Quest 496, Jinfiniti Intracellu…
- [AssayVersion](../nodes/AssayVersion.md) — Purpose: how one laboratory ran one measurement procedure — performing lab (exactly one), method principle, instrument model, reagent kit, software v…
- [AlgorithmVersion](../nodes/AlgorithmVersion.md) — Purpose: one fixed realization of a clock, risk score, wearable score, signal-processing or firmware build: the publication reference version (Dunedi…
- [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) — Purpose: one interval or limit a laboratory or vendor applies for one Metric on one AssayVersion and one population partition, with its kind (referen…
- [Device](../nodes/Device.md) — Purpose: a device or instrument MODEL as its maker designates it, in its role as a measuring instrument (Oura Ring Gen3, WHOOP MG, Dexcom G7, FreeSty…

## Node types (7)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [AlgorithmVersion](../nodes/AlgorithmVersion.md) | D4 | `hu:algorithm-version:` | Purpose: one fixed realization of a clock, risk score, wearable score, signal-processing or firmware build: the publication reference versi… |
| [AssayVersion](../nodes/AssayVersion.md) | D4 | `hu:assay-version:` | Purpose: how one laboratory ran one measurement procedure — performing lab (exactly one), method principle, instrument model, reagent kit,… |
| [Biomarker](../nodes/Biomarker.md) | D4 | `hu:biomarker:` | Purpose: the biological referent a measurement is about (NAD+, glycated hemoglobin, IgG glycan profile, pace of biological aging). |
| [Device](../nodes/Device.md) | D4 | `hu:device:` | Purpose: a device or instrument MODEL as its maker designates it, in its role as a measuring instrument (Oura Ring Gen3, WHOOP MG, Dexcom G… |
| [LabTest](../nodes/LabTest.md) | D4 | `hu:lab-test:` | Purpose: the orderable or purchasable test as a laboratory or vendor offers it (Labcorp 001453 'Hemoglobin (Hb) A1c', Quest 496, Jinfiniti… |
| [Metric](../nodes/Metric.md) | D4 | `hu:metric:` | Purpose: the measurand or feature definition — what exactly a number is: LOINC 4548-4 (HbA1c mass fraction in blood), 'NAD+ in red blood ce… |
| [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) | D4 | `hu:ri-version:` | Purpose: one interval or limit a laboratory or vendor applies for one Metric on one AssayVersion and one population partition, with its kin… |

## Relationship types inside the domain (9)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [DERIVED_FROM_ALGORITHM_VERSION](../relationships/DERIVED_FROM_ALGORITHM_VERSION.md) | asserted | recorded-only | AlgorithmVersion → AlgorithmVersion |
| [INCLUDES_TEST](../relationships/INCLUDES_TEST.md) | asserted | episode | LabTest → LabTest |
| [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) | structural | recorded-only | ReferenceIntervalVersion → AssayVersion\|Metric |
| [MEASURES_METRIC](../relationships/MEASURES_METRIC.md) | asserted | episode | LabTest → Metric |
| [OUTPUTS_METRIC](../relationships/OUTPUTS_METRIC.md) | structural | recorded-only | AlgorithmVersion → Metric |
| [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) | asserted | episode | LabTest → AssayVersion\|AlgorithmVersion |
| [QUANTIFIES](../relationships/QUANTIFIES.md) | structural | recorded-only | Metric → Biomarker |
| [REQUIRES_INPUT_METRIC](../relationships/REQUIRES_INPUT_METRIC.md) | structural | recorded-only | AlgorithmVersion → Metric |
| [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md) | asserted | episode | AlgorithmVersion → Device |

## Seams to other domains

### → [actors-and-institutions](actors-and-institutions.md) (1)

- [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md) · asserted · AssayVersion → Organization

### → [exposures-and-interventions](exposures-and-interventions.md) (1)

- [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) · asserted · Target → Biomarker|Metric|Outcome|Condition

### → [products-and-commerce](products-and-commerce.md) (1)

- [DELIVERS](../relationships/DELIVERS.md) · asserted · Product → LabTest|Device

### → [studies-and-evidence](studies-and-evidence.md) (1)

- [MEASURES](../relationships/MEASURES.md) · asserted · OutcomeDefinition → Metric|Biomarker|Outcome|Condition

### → [substances-and-biology](substances-and-biology.md) (2)

- [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) · structural · Biomarker → ChemicalSubstance|MolecularEntity
- [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md) · asserted · Biomarker → Mechanism

## Tasks

(none)

## v1 navigation aliases

(none)
