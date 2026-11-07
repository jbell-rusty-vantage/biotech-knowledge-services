---
id: "dom:substances-and-biology"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#substances-and-biology"]
aliases: ["substances-and-biology","substances and biology"]
capabilities: ["get","slice"]
cardDigest: "sha256:72ccaece9ea28be428325ed6cb80f3ae71865299c51544fa153a1eced76b499a"
---
# Domain: Substances, materials, mechanisms and biology

Id `dom:substances-and-biology` · modules [D1](../modules/D1.md), [D2](../modules/D2.md) · 9 node types · 8 internal relationship types · seams to 6 other domains.

Chemical substances (identity by structure), ingredient materials (branded, botanical, microbial, extracts), taxa and strains, constituents and nutrients; mechanisms (pathways, processes, hallmarks), molecular entities, conditions, outcomes and the measured-versus-inferred MechanismEvidenceContext.

## Questions this domain answers

- Which substance is the active moiety of this salt, and which substance does this branded material realize?
- Which mechanism assertions were measured (basisKind DIRECT_MEASUREMENT) and in which species / compartment context?
- Which conditions and outcomes is this mechanism linked to (derived AFFECTS_MECHANISM projections are never evidence)?

## Write guidance

A salt is its own ChemicalSubstance (HAS_ACTIVE_MOIETY); a physical or branded form is an IngredientMaterial. Mechanism effects are Assertions with basisKind and OBSERVED_IN_CONTEXT; AFFECTS_MECHANISM is derived and read-only.

## Start with these types

- [ChemicalSubstance](../nodes/ChemicalSubstance.md) — Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the free moiety are DIFFERENT substan…
- [IngredientMaterial](../nodes/IngredientMaterial.md) — Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's grade of one substance, a brand…
- [Constituent](../nodes/Constituent.md) — Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitamin B6" = six vitamers, declared…
- [Taxon](../nodes/Taxon.md) — Purpose: an organism taxon a material is derived from — botanical source species (Withania somnifera, NCBI 126910), microbial species (Lacticaseibaci…
- [Mechanism](../nodes/Mechanism.md) — Purpose: a curated mechanism concept — hallmark of aging, biological process, curated pathway record or molecular function (mechanismKind) — the voca…
- [MolecularEntity](../nodes/MolecularEntity.md) — Purpose: a gene, protein, protein complex, protein family or non-coding RNA that is a curated participant in a mechanism or the object of a compound'…
- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) — Purpose: the per-context qualifier of mechanism findings (round 0003 M3): one exposure group measured in one compartment of one organism in one setti…
- [Condition](../nodes/Condition.md) — Purpose: a disease, syndrome, phenotype or risk state (conditionKind) that mechanisms are linked to and that other modules scope by: D3 studies inves…
- [Outcome](../nodes/Outcome.md) — Purpose: a study-independent endpoint concept (lifespan, all-cause mortality, handgrip strength, VO2max, sleep quality) — the join point where D3 Out…

## Node types (9)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [ChemicalSubstance](../nodes/ChemicalSubstance.md) | D1 | `hu:substance:` | Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the free moiety are DIFFERE… |
| [Condition](../nodes/Condition.md) | D2 | `hu:condition:` | Purpose: a disease, syndrome, phenotype or risk state (conditionKind) that mechanisms are linked to and that other modules scope by: D3 stu… |
| [Constituent](../nodes/Constituent.md) | D1 | `hu:constituent:` | Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitamin B6" = six vitamers… |
| [IngredientMaterial](../nodes/IngredientMaterial.md) | D1 | `hu:material:` | Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's grade of one substanc… |
| [Mechanism](../nodes/Mechanism.md) | D2 | `hu:mechanism:` | Purpose: a curated mechanism concept — hallmark of aging, biological process, curated pathway record or molecular function (mechanismKind)… |
| [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md) | D2 | `hu:mech-context:` | Purpose: the per-context qualifier of mechanism findings (round 0003 M3): one exposure group measured in one compartment of one organism in… |
| [MolecularEntity](../nodes/MolecularEntity.md) | D2 | `hu:molecular-entity:` | Purpose: a gene, protein, protein complex, protein family or non-coding RNA that is a curated participant in a mechanism or the object of a… |
| [Outcome](../nodes/Outcome.md) | D2 | `hu:outcome:` | Purpose: a study-independent endpoint concept (lifespan, all-cause mortality, handgrip strength, VO2max, sleep quality) — the join point wh… |
| [Taxon](../nodes/Taxon.md) | D1 | `hu:taxon:` | Purpose: an organism taxon a material is derived from — botanical source species (Withania somnifera, NCBI 126910), microbial species (Lact… |

## Relationship types inside the domain (8)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [COUNTS_TOWARD_NUTRIENT](../relationships/COUNTS_TOWARD_NUTRIENT.md) | asserted | recorded-only | ChemicalSubstance → Constituent |
| [DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md) | asserted | recorded-only | IngredientMaterial → Taxon |
| [HAS_ACTIVE_MOIETY](../relationships/HAS_ACTIVE_MOIETY.md) | asserted | recorded-only | ChemicalSubstance → ChemicalSubstance |
| [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) | asserted | episode | IngredientMaterial → ChemicalSubstance \| Constituent |
| [PARENT_TAXON](../relationships/PARENT_TAXON.md) | asserted | episode | Taxon → Taxon |
| [PART_OF_MECHANISM](../relationships/PART_OF_MECHANISM.md) | asserted | recorded-only | Mechanism → Mechanism |
| [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) | asserted | recorded-only | MolecularEntity\|ChemicalSubstance → Mechanism |
| [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md) | asserted | recorded-only | IngredientMaterial → ChemicalSubstance |

## Seams to other domains

### → [diagnostics-and-devices](diagnostics-and-devices.md) (2)

- [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) · structural · Biomarker → ChemicalSubstance|MolecularEntity
- [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md) · asserted · Biomarker → Mechanism

### → [exposures-and-interventions](exposures-and-interventions.md) (5)

- [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) · derived · ChemicalSubstance|Intervention → Mechanism
- [EXPOSED_TO](../relationships/EXPOSED_TO.md) · structural · MechanismEvidenceContext → ChemicalSubstance|IngredientMaterial|Intervention
- [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) · asserted · FoodItem → ChemicalSubstance|Constituent
- [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) · asserted · Target → Biomarker|Metric|Outcome|Condition
- [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) · asserted · DietaryPattern → FoodItem|FoodCategory|Constituent

### → [kernel-and-provenance](kernel-and-provenance.md) (1)

- [OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md) · structural · Assertion → MechanismEvidenceContext

### → [manufacturing-quality-regulatory-ip](manufacturing-quality-regulatory-ip.md) (3)

- [CONCERNS](../relationships/CONCERNS.md) · asserted · RegulatoryRecord|Patent → ChemicalSubstance|IngredientMaterial|Product|Lot
- [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) · asserted · QualityResult → ChemicalSubstance|IngredientMaterial|Constituent
- [STATUS_OF](../relationships/STATUS_OF.md) · asserted · LegalStatus → ChemicalSubstance|IngredientMaterial|Product|Patent

### → [products-and-commerce](products-and-commerce.md) (1)

- [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) · asserted · LabelVersion → IngredientMaterial|Constituent|FoodItem

### → [studies-and-evidence](studies-and-evidence.md) (4)

- [ADMINISTERS](../relationships/ADMINISTERS.md) · asserted · InterventionComponent → IngredientMaterial|ProductVariant|Intervention|FoodItem|DietaryPattern
- [IN_STUDY_ARM](../relationships/IN_STUDY_ARM.md) · structural · MechanismEvidenceContext → StudyArm
- [INVESTIGATES](../relationships/INVESTIGATES.md) · asserted · Study → Condition
- [MEASURES](../relationships/MEASURES.md) · asserted · OutcomeDefinition → Metric|Biomarker|Outcome|Condition

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md) (ingestion)
- [Ingest a study with its registration versions, intervention material and results](../tasks/ingest-study-publication.md) (ingestion)
- [Record mechanism evidence (measured vs inferred) for a substance](../tasks/ingest-mechanism-evidence.md) (ingestion)

## v1 navigation aliases

(none)
