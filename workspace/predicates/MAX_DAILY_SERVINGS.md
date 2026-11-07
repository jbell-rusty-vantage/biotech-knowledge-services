---
id: "pred:MAX_DAILY_SERVINGS"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MAX_DAILY_SERVINGS"]
aliases: ["max daily servings"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:5ef5915ff1476670a4aafeb7411de15f38d18a2bf35198edf528dcb29ac13db1"
---
# Predicate MAX_DAILY_SERVINGS

| | |
| --- | --- |
| id | `pred:MAX_DAILY_SERVINGS` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [LabelVersion](../nodes/LabelVersion.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field (`LabelVersion.maxDailyServings`); the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MAX_DAILY_SERVINGS`
