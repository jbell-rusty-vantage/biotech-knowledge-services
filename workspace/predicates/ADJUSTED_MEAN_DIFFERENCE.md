---
id: "pred:ADJUSTED_MEAN_DIFFERENCE"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ADJUSTED_MEAN_DIFFERENCE"]
aliases: ["adjusted mean difference"]
capabilities: ["get"]
cardDigest: "sha256:d3a15ec6f7b83e6d623f20ad6b2b06c457a61a1bc6874348f50df3b6dfb6c033"
---
# Predicate ADJUSTED_MEAN_DIFFERENCE

| | |
| --- | --- |
| id | `pred:ADJUSTED_MEAN_DIFFERENCE` |
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

- `release:vocabularies/predicates.yaml#ADJUSTED_MEAN_DIFFERENCE`
