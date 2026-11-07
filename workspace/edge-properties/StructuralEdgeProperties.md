---
id: "edge:StructuralEdgeProperties"
kind: "edge-properties"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L114-L117"]
aliases: ["structural edge properties"]
capabilities: ["get"]
cardDigest: "sha256:016134bf1b59759d9ac1df780edfa7452ffc81d562354d063597b088733b9cfc"
---
# Edge properties StructuralEdgeProperties

Structural edge (recorded time only): internal shape of one captured or composed record; needs no Assertion. `orderIndex` orders siblings when the source orders them.

| | |
| --- | --- |
| id | `edge:StructuralEdgeProperties` · raw SDL [sdl:StructuralEdgeProperties](../sdl/StructuralEdgeProperties.graphql) |
| module | [K](../modules/K.md) |
| used by relationship types | [BLOCKED_BY](../relationships/BLOCKED_BY.md), [CHUNK_OF](../relationships/CHUNK_OF.md), [HAS_ANALYTE](../relationships/HAS_ANALYTE.md), [HAS_ARM](../relationships/HAS_ARM.md), [HAS_COMPONENT](../relationships/HAS_COMPONENT.md), [HAS_ITEM](../relationships/HAS_ITEM.md), [HAS_LOCATOR](../relationships/HAS_LOCATOR.md), [HAS_OFFER](../relationships/HAS_OFFER.md), [HAS_OUTCOME](../relationships/HAS_OUTCOME.md), [HAS_PACKAGE](../relationships/HAS_PACKAGE.md), [HAS_POPULATION](../relationships/HAS_POPULATION.md), [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md), [HAS_STEP](../relationships/HAS_STEP.md), [HAS_VARIANT](../relationships/HAS_VARIANT.md), [INTERVAL_FOR](../relationships/INTERVAL_FOR.md), [IN_STUDY_ARM](../relationships/IN_STUDY_ARM.md), [OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md), [OCCURS_IN](../relationships/OCCURS_IN.md), [OUTPUTS_METRIC](../relationships/OUTPUTS_METRIC.md), [PUBLISHES](../relationships/PUBLISHES.md), [QUANTIFIES](../relationships/QUANTIFIES.md), [REQUIRES_INPUT_METRIC](../relationships/REQUIRES_INPUT_METRIC.md), [RESULT_FOR](../relationships/RESULT_FOR.md), [RESULT_FOR_ARM](../relationships/RESULT_FOR_ARM.md), [STEP_USES](../relationships/STEP_USES.md), [USES_CRITERION](../relationships/USES_CRITERION.md) |
| set by the executor | `lastWriterRunId` |

## Properties (2)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `orderIndex` | `Int` |  | create+update |  | kernel.graphql:L115 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L116 |

## Declared on (30 fields)

- [Source](../nodes/Source.md).`snapshots` ([HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md))
- [SourceSnapshot](../nodes/SourceSnapshot.md).`source` ([HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md))
- [SourceLocator](../nodes/SourceLocator.md).`snapshot` ([HAS_LOCATOR](../relationships/HAS_LOCATOR.md))
- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`assertions` ([OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md))
- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`studyArm` ([IN_STUDY_ARM](../relationships/IN_STUDY_ARM.md))
- [Study](../nodes/Study.md).`arms` ([HAS_ARM](../relationships/HAS_ARM.md))
- [Study](../nodes/Study.md).`populations` ([HAS_POPULATION](../relationships/HAS_POPULATION.md))
- [Study](../nodes/Study.md).`outcomes` ([HAS_OUTCOME](../relationships/HAS_OUTCOME.md))
- [StudyArm](../nodes/StudyArm.md).`components` ([HAS_COMPONENT](../relationships/HAS_COMPONENT.md))
- [StudyResult](../nodes/StudyResult.md).`outcome` ([RESULT_FOR](../relationships/RESULT_FOR.md))
- [StudyResult](../nodes/StudyResult.md).`arms` ([RESULT_FOR_ARM](../relationships/RESULT_FOR_ARM.md))
- [Biomarker](../nodes/Biomarker.md).`analytes` ([HAS_ANALYTE](../relationships/HAS_ANALYTE.md))
- [Biomarker](../nodes/Biomarker.md).`analyteEntities` ([HAS_ANALYTE](../relationships/HAS_ANALYTE.md))
- [Metric](../nodes/Metric.md).`quantifies` ([QUANTIFIES](../relationships/QUANTIFIES.md))
- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`outputs` ([OUTPUTS_METRIC](../relationships/OUTPUTS_METRIC.md))
- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`inputs` ([REQUIRES_INPUT_METRIC](../relationships/REQUIRES_INPUT_METRIC.md))
- [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md).`assayVersions` ([INTERVAL_FOR](../relationships/INTERVAL_FOR.md))
- [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md).`metrics` ([INTERVAL_FOR](../relationships/INTERVAL_FOR.md))
- [ProtocolEdition](../nodes/ProtocolEdition.md).`steps` ([HAS_STEP](../relationships/HAS_STEP.md))
- [ProtocolStep](../nodes/ProtocolStep.md).`uses` ([STEP_USES](../relationships/STEP_USES.md))
- [Product](../nodes/Product.md).`variants` ([HAS_VARIANT](../relationships/HAS_VARIANT.md))
- [ProductVariant](../nodes/ProductVariant.md).`packages` ([HAS_PACKAGE](../relationships/HAS_PACKAGE.md))
- [MerchantListing](../nodes/MerchantListing.md).`offers` ([HAS_OFFER](../relationships/HAS_OFFER.md))
- [MediaWork](../nodes/MediaWork.md).`channels` ([PUBLISHES](../relationships/PUBLISHES.md))
- [MediaWork](../nodes/MediaWork.md).`occurrences` ([OCCURS_IN](../relationships/OCCURS_IN.md))
- [Chunk](../nodes/Chunk.md).`snapshot` ([CHUNK_OF](../relationships/CHUNK_OF.md))
- [DecisionCriterion](../nodes/DecisionCriterion.md).`usedByReports` ([USES_CRITERION](../relationships/USES_CRITERION.md))
- [ReportItem](../nodes/ReportItem.md).`report` ([HAS_ITEM](../relationships/HAS_ITEM.md))
- [ReportItem](../nodes/ReportItem.md).`blockedBy` ([BLOCKED_BY](../relationships/BLOCKED_BY.md))
- [ReportItem](../nodes/ReportItem.md).`blockedByAssessments` ([BLOCKED_BY](../relationships/BLOCKED_BY.md))

## Source definition

- `release:sdl/modules/kernel.graphql#L114-L117`
