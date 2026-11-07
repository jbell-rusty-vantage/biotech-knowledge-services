---
id: "asmt:COMPARABILITY"
kind: "assessment"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/assessments.yaml#COMPARABILITY"]
aliases: ["comparability","d4.comparability"]
capabilities: ["get","propose:assessment.record"]
cardDigest: "sha256:e6beeb321ff4b066b09c45bc3be8fb47c961ef9c52d9582fa231103413b0c5ba"
---
# Assessment kind COMPARABILITY

An Assessment is a kernel record (`node:Assessment`) that judges its subjects through `ASSESSES` and cites evidence through `HAS_EVIDENCE`; `kind` is **COMPARABILITY**, `subkind` one of the 1 registered values below. See [Assessment](../nodes/Assessment.md) and [ASSESSES](../relationships/ASSESSES.md).

## Subkinds (1)

| subkind | registrar | status | conclusion codes | facets | admissible subjects | method versions |
| --- | --- | --- | --- | --- | --- | --- |
| `D4.comparability` | D4 | registered | `COMPARABLE`, `COMPARABLE_WITH_CONVERSION`, `NOT_COMPARABLE`, `UNKNOWN` |  |  | d4-comparability/0.1 (fixture) |

## Admissible subjects across subkinds

(none)

## Source definition

- `release:vocabularies/assessments.yaml#COMPARABILITY`
