---
id: "asmt:VETTING"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#VETTING"]
aliases: ["vetting","d12.claim-threshold-comparison"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:4ed85a489c40f47f1dc577e8765fc4775d78d18a701077555a4c2c120fbb2eb3"
---
# Assessment kind VETTING

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **VETTING**, `subkind` one of the 1 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (1)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D12.claim-threshold-comparison` | D12 | registered | `MET`, `NOT_COMPARABLE`, `NOT_MET` |  |  |  |

## Admissible subjects across subkinds

(none)

## Source definition

- `release:vocabularies/assessments.yaml#VETTING`
