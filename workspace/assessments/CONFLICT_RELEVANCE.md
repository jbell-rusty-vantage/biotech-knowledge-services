---
id: "asmt:CONFLICT_RELEVANCE"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#CONFLICT_RELEVANCE"]
aliases: ["conflict relevance","d4.test-and-sell","d7.conflict-relevance","d8.record-date-conflict"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:d06d18b8d100338303d1880cafe60071011efd42b429fd178bc7d0837a5530a8"
---
# Assessment kind CONFLICT_RELEVANCE

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **CONFLICT_RELEVANCE**, `subkind` one of the 3 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (3)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D4.test-and-sell` | D4 | alias-of:CONFLICT_RELEVANCE/D7.conflict-relevance | `DIRECT`, `INDIRECT`, `NOT_RELEVANT`, `UNDETERMINED` |  | [LabTest](../nodes/LabTest.md), [Organization](../nodes/Organization.md), [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md) | d4-test-and-sell/0.1 (fixture) |
| `D7.conflict-relevance` | D7 | registered | `DIRECT`, `INDIRECT`, `NOT_RELEVANT`, `UNDETERMINED` | completeness=; disclosureFinding=DISCLOSED_ELSEWHERE\|DISCLOSED_ELSEWHERE_AT_TIME\|DISCLOSED_E…; disclosurePlacement=AUDIBLE\|CAPTION_OR_DESCRIPTION\|ON_SCREEN\|PAPER_COI\|PLATFORM…; relevanceBasis=COMPETITOR\|SAME_BRAND\|SAME_ORGANIZATION\|SAME_PRODUCT\|SAME_P…; temporalOverlap=DISJOINT\|OVERLAPS\|UNKNOWN | [Claim](../nodes/Claim.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) |  |
| `D8.record-date-conflict` | D8 | registered |  |  |  |  |

## Admissible subjects across subkinds

[Claim](../nodes/Claim.md), [LabTest](../nodes/LabTest.md), [Organization](../nodes/Organization.md), [Person](../nodes/Person.md), [ReferenceIntervalVersion](../nodes/ReferenceIntervalVersion.md)

## Source definition

- `release:vocabularies/assessments.yaml#CONFLICT_RELEVANCE`
