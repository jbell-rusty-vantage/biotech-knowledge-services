---
id: "pred:CHANGE_DIFFERENCE"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CHANGE_DIFFERENCE"]
aliases: ["change difference"]
capabilities: ["get"]
cardDigest: "sha256:2603586c1be837a749df328776507aabb626a459357e4eb70315e9b655a41421"
---
# Predicate CHANGE_DIFFERENCE

| | |
| --- | --- |
| id | `pred:CHANGE_DIFFERENCE` |
| kind | **retired** |
| route | **retired** |
| status | retired-by:MD-X-03 |
| registrar | [D3](../modules/D3.md) |
| subject types | [StudyResult](../nodes/StudyResult.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

Retired (retired-by:MD-X-03). Ingest rejects it. Replaced by: `StudyResult.estimate (FIELD predicate of the D3 result model)`.

## Write route

No ordinary proposal writes this predicate. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CHANGE_DIFFERENCE`
