---
id: "pred:MAX_DAILY_SUPPLEMENTAL_AMOUNT"
kind: "predicate"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MAX_DAILY_SUPPLEMENTAL_AMOUNT"]
aliases: ["max daily supplemental amount"]
capabilities: ["get"]
cardDigest: "sha256:510657c7abbe4f815b26ce858600638565892fe06180115dd95b0a7acdb128f0"
---
# Predicate MAX_DAILY_SUPPLEMENTAL_AMOUNT

| | |
| --- | --- |
| id | `pred:MAX_DAILY_SUPPLEMENTAL_AMOUNT` |
| kind | **retired** |
| route | **alias** |
| status | alias-of:CALCULATED_DAILY_MAX_INTAKE |
| registrar | (none) |
| subject types | (none) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

Alias of [CALCULATED_DAILY_MAX_INTAKE](CALCULATED_DAILY_MAX_INTAKE.md): re-key to the target before ingest (`predicateAliases`).

## Write route

No ordinary proposal writes this predicate. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MAX_DAILY_SUPPLEMENTAL_AMOUNT`
