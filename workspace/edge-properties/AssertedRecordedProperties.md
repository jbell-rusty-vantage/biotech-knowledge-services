---
id: "edge:AssertedRecordedProperties"
kind: "edge-properties"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L125-L131"]
aliases: ["asserted recorded properties"]
capabilities: ["get"]
cardDigest: "sha256:d34630411269ea7c56d1abd6e1d217dd0ef4221f4bf53adee0be28fba2a4aa7f"
---
# Edge properties AssertedRecordedProperties

Asserted edge, recorded time only (added in the model stage, 00-DIRECTIVE rule 9): one relationship per recorded-time episode, authorized by exactly one Assertion (`assertionUid`), for asserted edges whose valid time no question reads (the authorizing Assertion still carries any valid time the source states). Same rules as AssertedEdgeProperties without the valid-time fields; switching an edge to AssertedEdgeProperties later is additive.

| | |
| --- | --- |
| id | `edge:AssertedRecordedProperties` · raw SDL [sdl:AssertedRecordedProperties](../sdl/AssertedRecordedProperties.graphql) |
| module | [K](../modules/K.md) |
| used by relationship types | [ADDRESSED_TO](../relationships/ADDRESSED_TO.md), [ADMINISTERS](../relationships/ADMINISTERS.md), [AWARDED_BY](../relationships/AWARDED_BY.md), [AWARDED_TO](../relationships/AWARDED_TO.md), [CONCERNS](../relationships/CONCERNS.md), [COUNTS_TOWARD_NUTRIENT](../relationships/COUNTS_TOWARD_NUTRIENT.md), [DELIVERS](../relationships/DELIVERS.md), [DERIVED_FROM_ALGORITHM_VERSION](../relationships/DERIVED_FROM_ALGORITHM_VERSION.md), [DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md), [DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md), [HAS_ACTIVE_MOIETY](../relationships/HAS_ACTIVE_MOIETY.md), [INVESTIGATES](../relationships/INVESTIGATES.md), [ISSUED_BY](../relationships/ISSUED_BY.md), [LEADS_TO](../relationships/LEADS_TO.md), [LOT_OF](../relationships/LOT_OF.md), [MEASURES](../relationships/MEASURES.md), [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md), [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md), [ON_FRONTIER](../relationships/ON_FRONTIER.md), [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md), [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md), [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md), [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md), [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md), [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md), [RENDITION_OF](../relationships/RENDITION_OF.md), [REPORTS_ON](../relationships/REPORTS_ON.md), [RESPONDS_TO](../relationships/RESPONDS_TO.md), [STATED_IN](../relationships/STATED_IN.md), [STATUS_FROM](../relationships/STATUS_FROM.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |

## Properties (5)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | kernel.graphql:L126 |
| `assertionUid` | `String!` | yes | create+update |  | kernel.graphql:L127 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | kernel.graphql:L128 |
| `recordedTo` | `DateTime` |  | create+update |  | kernel.graphql:L129 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L130 |

## Declared on (40 fields)

- [ChemicalSubstance](../nodes/ChemicalSubstance.md).`activeMoieties` ([HAS_ACTIVE_MOIETY](../relationships/HAS_ACTIVE_MOIETY.md))
- [ChemicalSubstance](../nodes/ChemicalSubstance.md).`nutrients` ([COUNTS_TOWARD_NUTRIENT](../relationships/COUNTS_TOWARD_NUTRIENT.md))
- [IngredientMaterial](../nodes/IngredientMaterial.md).`substances` ([REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md))
- [IngredientMaterial](../nodes/IngredientMaterial.md).`sourceTaxa` ([DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md))
- [Study](../nodes/Study.md).`conditions` ([INVESTIGATES](../relationships/INVESTIGATES.md))
- [StudyArm](../nodes/StudyArm.md).`statedIn` ([STATED_IN](../relationships/STATED_IN.md))
- [InterventionComponent](../nodes/InterventionComponent.md).`administers` ([ADMINISTERS](../relationships/ADMINISTERS.md))
- [StudyPopulation](../nodes/StudyPopulation.md).`statedIn` ([STATED_IN](../relationships/STATED_IN.md))
- [OutcomeDefinition](../nodes/OutcomeDefinition.md).`statedIn` ([STATED_IN](../relationships/STATED_IN.md))
- [OutcomeDefinition](../nodes/OutcomeDefinition.md).`measures` ([MEASURES](../relationships/MEASURES.md))
- [StudyResult](../nodes/StudyResult.md).`statedIn` ([STATED_IN](../relationships/STATED_IN.md))
- [Publication](../nodes/Publication.md).`reportsOn` ([REPORTS_ON](../relationships/REPORTS_ON.md))
- [Publication](../nodes/Publication.md).`renditions` ([RENDITION_OF](../relationships/RENDITION_OF.md))
- [Biomarker](../nodes/Biomarker.md).`reflectsMechanisms` ([REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md))
- [LabTest](../nodes/LabTest.md).`products` ([DELIVERS](../relationships/DELIVERS.md))
- [AssayVersion](../nodes/AssayVersion.md).`performingLab` ([PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md))
- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`derivedFrom` ([DERIVED_FROM_ALGORITHM_VERSION](../relationships/DERIVED_FROM_ALGORITHM_VERSION.md))
- [Device](../nodes/Device.md).`products` ([DELIVERS](../relationships/DELIVERS.md))
- [Target](../nodes/Target.md).`operationalizedBy` ([OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md))
- [LabelVersion](../nodes/LabelVersion.md).`responsibleParty` ([NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md))
- [Award](../nodes/Award.md).`funders` ([AWARDED_BY](../relationships/AWARDED_BY.md))
- [Award](../nodes/Award.md).`recipientOrganizations` ([AWARDED_TO](../relationships/AWARDED_TO.md))
- [Award](../nodes/Award.md).`recipientPersons` ([AWARDED_TO](../relationships/AWARDED_TO.md))
- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`issuedBy` ([ISSUED_BY](../relationships/ISSUED_BY.md))
- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`addressedTo` ([ADDRESSED_TO](../relationships/ADDRESSED_TO.md))
- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`concerns` ([CONCERNS](../relationships/CONCERNS.md))
- [LegalStatus](../nodes/LegalStatus.md).`establishedBy` ([STATUS_FROM](../relationships/STATUS_FROM.md))
- [Lot](../nodes/Lot.md).`lotOf` ([LOT_OF](../relationships/LOT_OF.md))
- [QualityResult](../nodes/QualityResult.md).`resultFor` ([QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md))
- [QualityResult](../nodes/QualityResult.md).`analyte` ([MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md))
- [QualityResult](../nodes/QualityResult.md).`issuedBy` ([ISSUED_BY](../relationships/ISSUED_BY.md))
- [CertificationListing](../nodes/CertificationListing.md).`issuedBy` ([ISSUED_BY](../relationships/ISSUED_BY.md))
- [Patent](../nodes/Patent.md).`concerns` ([CONCERNS](../relationships/CONCERNS.md))
- [MediaWork](../nodes/MediaWork.md).`renditions` ([RENDITION_OF](../relationships/RENDITION_OF.md))
- [DietaryPattern](../nodes/DietaryPattern.md).`components` ([PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md))
- [Event](../nodes/Event.md).`frontiers` ([ON_FRONTIER](../relationships/ON_FRONTIER.md))
- [Event](../nodes/Event.md).`leadsTo` ([LEADS_TO](../relationships/LEADS_TO.md))
- [Event](../nodes/Event.md).`respondsTo` ([RESPONDS_TO](../relationships/RESPONDS_TO.md))
- [Event](../nodes/Event.md).`regulatoryRecords` ([DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md))
- [Frontier](../nodes/Frontier.md).`studies` ([ON_FRONTIER](../relationships/ON_FRONTIER.md))

## Source definition

- `release:sdl/modules/kernel.graphql#L125-L131`
