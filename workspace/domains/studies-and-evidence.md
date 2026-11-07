---
id: "dom:studies-and-evidence"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#studies-and-evidence"]
aliases: ["studies-and-evidence","studies and evidence"]
capabilities: ["get","slice"]
cardDigest: "sha256:b3b1d2ec982c01237a5005d9adee1ca36bdbd9a32fc0e976a078fe5ce1ee88aa"
---
# Domain: Clinical and preclinical evidence

Id `dom:studies-and-evidence` · modules [D3](../modules/D3.md) · 8 node types · 10 internal relationship types · seams to 7 other domains.

Studies with registry versions, arms, intervention components, populations, outcome definitions, results and adverse-event results, publications and their renditions and revisions.

## Questions this domain answers

- What material did the study actually administer (ADMINISTERS), and does it match the commercial product?
- Which outcomes were primary, what do they measure (MEASURES), and what result was reported per arm?
- Was the registry record changed after the study started (HAS_REGISTRATION_VERSION episodes)?

## Write guidance

RegistrationVersion and StudyResult are create-only (a changed registry version or result is a new record). Applicability, endpoint classification and evidence strength are Assessments, never Study fields.

## Start with these types

- [Study](../nodes/Study.md) — Purpose: one investigation (trial, cohort, preclinical experiment, systematic review) independent of how many registrations, versions and papers desc…
- [RegistrationVersion](../nodes/RegistrationVersion.md) — Purpose: one version of one registration as a registry stated it at a point in valid time — status, enrollment (actual vs estimated), dates, results…
- [StudyArm](../nodes/StudyArm.md) — Purpose: one arm or group of a study as one source states it (registry arms/groups, paper randomization groups) — the unit results, adverse events an…
- [InterventionComponent](../nodes/InterventionComponent.md) — Purpose: one administered thing inside one arm with its dose as stated — amount, unit, basis (per dose / day / kg diet), mass basis (salt vs moiety),…
- [StudyPopulation](../nodes/StudyPopulation.md) — Purpose: who was eligible, enrolled, randomized or analyzed, as one source states it: size, sex and age bounds, healthy volunteers, species and strai…
- [OutcomeDefinition](../nodes/OutcomeDefinition.md) — Purpose: one outcome measure at one timepoint with one declared priority (the same measure at 2, 4 and 20 weeks is three definitions; a measure demot…
- [StudyResult](../nodes/StudyResult.md) — Purpose: one reported number set for one outcome definition, one arm set, one analysis set, as one source states it (registry results module row, pap…
- [Publication](../nodes/Publication.md) — Purpose: one scholarly work or one version of it — journal article, preprint version, systematic review version, protocol or analysis plan, conferenc…

## Node types (8)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [InterventionComponent](../nodes/InterventionComponent.md) | D3 | `hu:intervention-component:` | Purpose: one administered thing inside one arm with its dose as stated — amount, unit, basis (per dose / day / kg diet), mass basis (salt v… |
| [OutcomeDefinition](../nodes/OutcomeDefinition.md) | D3 | `hu:outcome-definition:` | Purpose: one outcome measure at one timepoint with one declared priority (the same measure at 2, 4 and 20 weeks is three definitions; a mea… |
| [Publication](../nodes/Publication.md) | D3 | `hu:publication:` | Purpose: one scholarly work or one version of it — journal article, preprint version, systematic review version, protocol or analysis plan,… |
| [RegistrationVersion](../nodes/RegistrationVersion.md) | D3 | `hu:registration-version:` | Purpose: one version of one registration as a registry stated it at a point in valid time — status, enrollment (actual vs estimated), dates… |
| [Study](../nodes/Study.md) | D3 | `hu:study:` | Purpose: one investigation (trial, cohort, preclinical experiment, systematic review) independent of how many registrations, versions and p… |
| [StudyArm](../nodes/StudyArm.md) | D3 | `hu:study-arm:` | Purpose: one arm or group of a study as one source states it (registry arms/groups, paper randomization groups) — the unit results, adverse… |
| [StudyPopulation](../nodes/StudyPopulation.md) | D3 | `hu:study-population:` | Purpose: who was eligible, enrolled, randomized or analyzed, as one source states it: size, sex and age bounds, healthy volunteers, species… |
| [StudyResult](../nodes/StudyResult.md) | D3 | `hu:study-result:` | Purpose: one reported number set for one outcome definition, one arm set, one analysis set, as one source states it (registry results modul… |

## Relationship types inside the domain (10)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [HAS_ARM](../relationships/HAS_ARM.md) | structural | recorded-only | Study → StudyArm |
| [HAS_COMPONENT](../relationships/HAS_COMPONENT.md) | structural | recorded-only | StudyArm → InterventionComponent |
| [HAS_OUTCOME](../relationships/HAS_OUTCOME.md) | structural | recorded-only | Study → OutcomeDefinition |
| [HAS_POPULATION](../relationships/HAS_POPULATION.md) | structural | recorded-only | Study → StudyPopulation |
| [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md) | asserted | episode, exclusive | Study → RegistrationVersion |
| [REPORTS_ON](../relationships/REPORTS_ON.md) | asserted | recorded-only | Publication → Study |
| [RESULT_FOR](../relationships/RESULT_FOR.md) | structural | recorded-only | StudyResult → OutcomeDefinition |
| [RESULT_FOR_ARM](../relationships/RESULT_FOR_ARM.md) | structural | recorded-only | StudyResult → StudyArm |
| [REVISES](../relationships/REVISES.md) | asserted | recorded-only | Publication → Publication |
| [STATED_IN](../relationships/STATED_IN.md) | asserted | recorded-only | StudyArm\|StudyPopulation\|OutcomeDefinition\|StudyResult → RegistrationVersion\|Publication |

## Seams to other domains

### → [actors-and-institutions](actors-and-institutions.md) (1)

- [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) · asserted · Study → Organization|Person|Award

### → [diagnostics-and-devices](diagnostics-and-devices.md) (1)

- [MEASURES](../relationships/MEASURES.md) · asserted · OutcomeDefinition → Metric|Biomarker|Outcome|Condition

### → [exposures-and-interventions](exposures-and-interventions.md) (1)

- [ADMINISTERS](../relationships/ADMINISTERS.md) · asserted · InterventionComponent → IngredientMaterial|ProductVariant|Intervention|FoodItem|DietaryPattern

### → [frontiers-and-events](frontiers-and-events.md) (1)

- [ON_FRONTIER](../relationships/ON_FRONTIER.md) · asserted · Event|Study → Frontier

### → [kernel-and-provenance](kernel-and-provenance.md) (1)

- [RENDITION_OF](../relationships/RENDITION_OF.md) · asserted · Source → Publication|MediaWork

### → [products-and-commerce](products-and-commerce.md) (1)

- [ADMINISTERS](../relationships/ADMINISTERS.md) · asserted · InterventionComponent → IngredientMaterial|ProductVariant|Intervention|FoodItem|DietaryPattern

### → [substances-and-biology](substances-and-biology.md) (4)

- [ADMINISTERS](../relationships/ADMINISTERS.md) · asserted · InterventionComponent → IngredientMaterial|ProductVariant|Intervention|FoodItem|DietaryPattern
- [IN_STUDY_ARM](../relationships/IN_STUDY_ARM.md) · structural · MechanismEvidenceContext → StudyArm
- [INVESTIGATES](../relationships/INVESTIGATES.md) · asserted · Study → Condition
- [MEASURES](../relationships/MEASURES.md) · asserted · OutcomeDefinition → Metric|Biomarker|Outcome|Condition

## Tasks

- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md) (ingestion)
- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md) (ingestion)

## v1 navigation aliases

(none)
