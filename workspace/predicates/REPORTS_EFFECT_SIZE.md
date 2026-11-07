---
id: "pred:REPORTS_EFFECT_SIZE"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTS_EFFECT_SIZE"]
aliases: ["reports effect size"]
capabilities: ["get"]
cardDigest: "sha256:b92dc06de532783e1855a4cbf638ea011bab016d523ef87b26b1bc2c94b633e1"
---
# Predicate REPORTS_EFFECT_SIZE

| | |
| --- | --- |
| id | `pred:REPORTS_EFFECT_SIZE` |
| kind | **retired** |
| route | **retired** |
| status | retired-by:MD-X-03 |
| registrar | [D3](../modules/D3.md) |
| subject types | [StudyResult](../nodes/StudyResult.md) |
| object types | (none) |
| literal forms | `valueNumber`, `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

Retired (retired-by:MD-X-03). Ingest rejects it. Replaced by: `StudyResult.estimate (FIELD predicate of the D3 result model)`.

## Write route

No ordinary proposal writes this predicate. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTS_EFFECT_SIZE`
